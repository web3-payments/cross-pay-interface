import { createAssociatedTokenAccountInstruction } from "@solana/spl-token";
import { TokenInvalidAccountOwnerError } from "@solana/spl-token";
import { TokenInvalidMintError } from "@solana/spl-token";
import { TokenInvalidOwnerError } from "@solana/spl-token";
import { TokenAccountNotFoundError } from "@solana/spl-token";
import { getAccount } from "@solana/spl-token";
import { getAssociatedTokenAddress } from "@solana/spl-token"
import { AddressLookupTableAccount, Transaction, TransactionMessage } from "@solana/web3.js";

export const getOrCreateATA = async (provider, tokenMint) => {
    const userATA = await getAssociatedTokenAddress(
        tokenMint,
        provider.wallet.publicKey,
    )
    // This is the optimal logic, considering TX fee, client-side computation, RPC roundtrips and guaranteed idempotent.
    // Sadly we can't do this atomically.
    let account;
    try {
        account = await getAccount(provider.connection, userATA,);
    } catch (error) {
        // TokenAccountNotFoundError can be possible if the associated address has already received some lamports,
        // becoming a system account. Assuming program derived addressing is safe, this is the only case for the
        // TokenInvalidAccountOwnerError in this code path.
        if (error instanceof TokenAccountNotFoundError || error instanceof TokenInvalidAccountOwnerError) {
            // As this isn't atomic, it's possible others can create associated accounts meanwhile.
            try {
                const transaction = new Transaction().add(
                    createAssociatedTokenAccountInstruction(
                        provider.wallet.publicKey,
                        userATA,
                        provider.wallet.publicKey,
                        tokenMint,
                    )
                );
                await provider.sendAndConfirm(transaction)
            } catch (error) {
                // Ignore all errors; for now there is no API-compatible way to selectively ignore the expected
                // instruction error if the associated account exists already.
            }

            // Now this should always succeed
            account = await getAccount(provider.connection, userATA,);

        } else {
            throw error;
        }
    }

    if (!account.mint.equals(tokenMint)) throw new TokenInvalidMintError();
    if (!account.owner.equals(provider.wallet.publicKey)) throw new TokenInvalidOwnerError();

    return account;
}


export const getATA = async (provider, tokenMint) => {
    const userATA = await getAssociatedTokenAddress(
        tokenMint,
        provider.wallet.publicKey,
    )

    let account;
    try {
        account = await getAccount(provider.connection, userATA,);
    } catch (error) {

    }
    // if getAccount throws error, send null
    //meaning user does not have that token
    return account;
}

export const getBalance = async (provider, isNative = false, tokenMint) => {
    if (isNative) {
        const userBalance = await provider.connection.getBalance(provider.wallet.publicKey)
        return toUIAmount(userBalance, 9)
    } else {
        const userATA = await getATA(provider, tokenMint)
        if (userATA) {
            const userBalance = await provider.connection.getTokenAccountBalance(userATA.address)
            return Number(userBalance.value.uiAmount);
        }
        return 0;
    }
}

export const fromUIAmount = (amount, decimals) => Number(amount) * 10 ** decimals
export const toUIAmount = (amount, decimals) => Number(amount) / (10 ** decimals)

export const serializeVersionedTx = async (connection, versionedTx) => {
    // get address lookup table accounts
    const addressLookupTableAccounts = await Promise.all(
        versionedTx.message.addressTableLookups.map(async (lookup) => {
            return new AddressLookupTableAccount({
                key: lookup.accountKey,
                state: AddressLookupTableAccount.deserialize(await connection.getAccountInfo(lookup.accountKey).then((res) => res.data)),
            })
        }))


    // decompile transaction message and add transfer instruction
    var message = TransactionMessage.decompile(versionedTx.message, { addressLookupTableAccounts: addressLookupTableAccounts })

    // compile the message and update the versionedTx
    versionedTx.message = message.compileToV0Message(addressLookupTableAccounts)

    return versionedTx.serialize()
}