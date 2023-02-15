import { createAssociatedTokenAccountInstruction } from "@solana/spl-token";
import { TokenInvalidAccountOwnerError } from "@solana/spl-token";
import { TokenInvalidMintError } from "@solana/spl-token";
import { TokenInvalidOwnerError } from "@solana/spl-token";
import { TokenAccountNotFoundError } from "@solana/spl-token";
import { getAccount } from "@solana/spl-token";
import { getAssociatedTokenAddress } from "@solana/spl-token"
import { Program, web3, BN } from '@project-serum/anchor';
import { AddressLookupTableAccount, Transaction, TransactionMessage, } from "@solana/web3.js";
import idl from '../idl/cross_pay_solana.json';
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { toWei } from "./eth-transaction-helpers";

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

export async function paySolanaNativeToken(provider, programId, paymentInfo, setIsLoading, triggerAlert,) {

    //PDAs
    const [adminStateAccount, _] = web3.PublicKey.findProgramAddressSync(
        [
            Buffer.from("admin_state"),
        ],
        programId
    );
    const [feeAccountSigner, __] = web3.PublicKey.findProgramAddressSync(
        [
            Buffer.from("fee_account_signer"),
        ],
        programId
    );

    const [solFeeAccount, ___] = web3.PublicKey.findProgramAddressSync(
        [
            Buffer.from("sol_fee_account"),
            feeAccountSigner.toBuffer(),
        ],
        programId
    );
    const program = new Program(idl, programId, provider);
    let txn;
    try {
        txn = await program.methods
            .payWithSol(new BN(paymentInfo.amount * LAMPORTS_PER_SOL))
            .accounts({
                client: new PublicKey(paymentInfo.creditAddress),
                customer: provider.wallet.publicKey,
                adminState: adminStateAccount,
                solFeeAccount: solFeeAccount,
                feeAccountSigner: feeAccountSigner,
            })
            .transaction();

    } catch (err) {
        console.log("Transaction error: ", err);
    }

    if (txn === undefined) {
        setIsLoading(false);
        triggerAlert("error", "Error", "An error occur!", "Contact the provider.")
        return;
    }
    const lastestBlockHash = await provider.connection.getLatestBlockhash();
    txn.recentBlockhash = lastestBlockHash.blockhash;
    txn.feePayer = provider.wallet.publicKey;

    txn.blockNumber = lastestBlockHash.lastValidBlockHeight;
    const estimatedFee = await txn.getEstimatedFee(provider.connection);
    const txnfinal = await window.solana.signAndSendTransaction(txn);
    const transactionDetails = {
        transactionHash: txnfinal.signature,
        blockHash: lastestBlockHash.blockhash,
        blockNumber: lastestBlockHash.lastValidBlockHeight,
        gasUsed: estimatedFee,
        toAddress: paymentInfo.creditAddress, // TODO: see how to get this data from the txn instructions
        fromAddress: txnfinal.publicKey
    };
    return transactionDetails;
}
export async function paySolanaToken(provider, programId, paymentInfo, setIsLoading, triggerAlert,) {
    const program = new Program(idl, programId, provider);
    //PDAs
    const [adminStateAccount, _] = web3.PublicKey.findProgramAddressSync(
        [
            Buffer.from("admin_state"),
        ],
        programId
    );
    const [feeAccountSigner, __] = web3.PublicKey.findProgramAddressSync(
        [
            Buffer.from("fee_account_signer"),
        ],
        programId
    );
    const mintToken = new PublicKey(paymentInfo.cryptocurrency.address)
    //const recipientAddress = new PublicKey("2RqrRYTKkr8SAfMYqrtZ9Bj8uUXw3Wde6UjjD4wj4iPH");
    const recipientAddress = new PublicKey(paymentInfo.creditAddress);
    // let transactionInstructions = [] // add all instructions here to approve only once
    //create associated token accounts
    let associatedTokenFrom = await getAssociatedTokenAddress(mintToken, provider.wallet.publicKey);
    const associatedTokenTo = await getAssociatedTokenAddress(mintToken, recipientAddress);
    //if balance is 0  there is no need to create an associated account
    let balance = await getBalance(provider, false, mintToken)
    if (balance == 0) {
        setIsLoading(false);
        return triggerAlert("error", "Error", "Insufficient Balance", "")
    }

    const tokenFeeAccount = await getAssociatedTokenAddress(mintToken, feeAccountSigner, true);


    let paymentTransaction = await program.methods
        .payWithToken(new BN(fromUIAmount(paymentInfo.amount, paymentInfo.cryptocurrency.decimals).toString()))
        .accounts({
            client: recipientAddress,
            customer: provider.wallet.publicKey,
            tokenMint: mintToken,
            clientTokenAccount: associatedTokenTo,
            customerTokenAccount: associatedTokenFrom,
            tokenFeeAccount: tokenFeeAccount,
            feeAccountSigner: feeAccountSigner,
            adminState: adminStateAccount,
        })
        .transaction();
    if (paymentTransaction === undefined) {
        setIsLoading(false);
        triggerAlert("error", "Error", "An error occur!", "Contact the provider.")
        return;
    }
    const lastestBlockHash = await provider.connection.getLatestBlockhash();
    paymentTransaction.recentBlockhash = lastestBlockHash.blockhash;
    paymentTransaction.feePayer = provider.wallet.publicKey;
    paymentTransaction.blockNumber = lastestBlockHash.lastValidBlockHeight;
    const estimatedFee = await paymentTransaction.getEstimatedFee(provider.connection);
    let txnFinal = await window.solana.signAndSendTransaction(paymentTransaction)
    const transactionDetails = {
        transactionHash: txnFinal.signature,
        blockHash: lastestBlockHash.blockhash,
        blockNumber: lastestBlockHash.lastValidBlockHeight,
        gasUsed: estimatedFee,
        toAddress: paymentInfo.creditAddress, // TODO: see how to get this data from the txn instructions
        fromAddress: txnFinal.publicKey
    };
    console.log(transactionDetails);
    return transactionDetails;
}

export async function getPaymentInstruction(provider, programId, paymentInfo,) {

    //PDAs
    const [adminStateAccount, _] = web3.PublicKey.findProgramAddressSync(
        [
            Buffer.from("admin_state"),
        ],
        programId
    );
    const [feeAccountSigner, __] = web3.PublicKey.findProgramAddressSync(
        [
            Buffer.from("fee_account_signer"),
        ],
        programId
    );

    const [solFeeAccount, ___] = web3.PublicKey.findProgramAddressSync(
        [
            Buffer.from("sol_fee_account"),
            feeAccountSigner.toBuffer(),
        ],
        programId
    );

    const program = new Program(idl, programId, provider);

    if (paymentInfo.cryptocurrency.nativeToken) {
        return await program.methods
            .payWithSol(new BN(paymentInfo.amount * LAMPORTS_PER_SOL))
            .accounts({
                client: new PublicKey(paymentInfo.creditAddress),
                customer: provider.wallet.publicKey,
                adminState: adminStateAccount,
                solFeeAccount: solFeeAccount,
                feeAccountSigner: feeAccountSigner,
            }).instruction();

    } else {
        const mintToken = new PublicKey(paymentInfo.cryptocurrency.address)
        const recipientAddress = new PublicKey(paymentInfo.creditAddress);
        let associatedTokenFrom = await getAssociatedTokenAddress(mintToken, provider.wallet.publicKey);
        const associatedTokenTo = await getAssociatedTokenAddress(mintToken, recipientAddress);


        const tokenFeeAccount = await getAssociatedTokenAddress(mintToken, feeAccountSigner, true);

        let paymentTransaction = await program.methods
            .payWithToken(new BN(fromUIAmount(paymentInfo.amount, paymentInfo.cryptocurrency.decimals).toString()))
            .accounts({
                client: recipientAddress,
                customer: provider.wallet.publicKey,
                tokenMint: mintToken,
                clientTokenAccount: associatedTokenTo,
                customerTokenAccount: associatedTokenFrom,
                tokenFeeAccount: tokenFeeAccount,
                feeAccountSigner: feeAccountSigner,
                adminState: adminStateAccount,
            }).instruction()
        return paymentTransaction
    }
}

export const SOL_MINT = "So11111111111111111111111111111111111111112";

export const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};