import React from 'react'
import { useState } from 'react';
import { Contract, ethers } from "ethers";
import * as InvoiceContract from "../../abis/payment/PaymentContract.json";
import * as ERC20 from "../../abis/ERC20/ERC20.json";
//import { config } from "../../config";
import axios from "axios";
import { getWalletProvider } from "../../utils/ethereum-wallet-provider";
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Divider,
    Grid,
    Typography,
    IconButton, TextField, FormControl, InputLabel, Select, MenuItem,
    List, ListItem, ListItemAvatar, ListItemText, ListItemSecondaryAction
} from '@mui/material';
import AlertAction from '../utils/alert-actions/alert-actions';
import LoadingSpinner from '../utils/loading-spinner/loading-spinner';
import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, LAMPORTS_PER_SOL, Transaction } from "@solana/web3.js";
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import idl from '../../idl/cross_pay_solana.json';
import { Program, AnchorProvider as SolanaProvider, web3, BN } from '@project-serum/anchor';
import { getAccount, createAssociatedTokenAccountInstruction, getAssociatedTokenAddress } from "@solana/spl-token";


const InvoiceDetails = ({ invoiceInfo, mock, setInvoiceInfo }) => {
    const opts = {preflightCommitment: "processed"}
    const { connection } = useConnection();
    const { setVisible: setOpenSolanaWalletDialog } = useWalletModal();
    const wallet = useAnchorWallet();
    const { publicKey, sendTransaction, connected } = useWallet();
    const [isLoading, setIsLoading] = useState(false);
    const [alert, setAlert] = useState();
    const [alertOpen, setAlertOpen] = useState();
    const [invoiceConfirmation, setInvoiceConfirmation] = useState({});
    const toWei = (num, decimals) => ethers.utils.parseUnits(num.toString(), decimals.toString());
    const fromWei = (num, decimals) => ethers.utils.formatUnits(num.toString(), decimals.toString());
    const triggerAlert = (severity, title, message, strongMessage) => {
        setAlertOpen(true);
        setAlert({severity: severity, title: title, message: message, strongMessage: strongMessage});
    }
    const pay = async () => {
        if (mock) {
            return;
        }
        setIsLoading(true);
        let provider, library, accounts, network, address;
        try {
            provider = await getWalletProvider().connect();
            library = new ethers.providers.Web3Provider(provider);
            accounts = await library.listAccounts();
            network = await library.getNetwork();
            if(network.chainId !== invoiceInfo.cryptocurrency.network.chainId){
                setIsLoading(false);
                triggerAlert("error", "Error", "Invalid Network! Change your wallet network", `Correct: ${invoiceInfo.cryptocurrency.network.name}`)
                return;
            }
        } catch (error) {
            console.error(error)
            setIsLoading(false);
            triggerAlert("error", "Error", "An error occur!", "Contact the provider.")
            return;
        }
        if (accounts) {
            address = accounts[0];
            const signer = await library.getSigner(address)
            // TODO: Create a util class to handle smart contract operations // invoiceExecution 
            const invoiceContract = new Contract(
                invoiceInfo.cryptocurrency.smartContract.address,
                InvoiceContract.abi,
                signer
            );
            let transactionDetails;
            if (invoiceInfo.cryptocurrency.nativeToken) {
                try {
                    transactionDetails = await invoiceNativeToken(invoiceContract, invoiceInfo);    
                } catch (error) {
                    setIsLoading(false);
                    console.error(error)
                    triggerAlert("error", "Error", "An error occur!", "Contact the provider.");
                    return;     
                }
            } else {
                try {
                    transactionDetails = await invoiceERC20(invoiceContract, invoiceInfo, signer);
                } catch (error) {
                    setIsLoading(false);
                    console.error(error)
                    triggerAlert("error", "Error", "An error occur!", "Contact the provider.");
                    return;
                }
            }
             await callInvoiceConfirmation(transactionDetails);
             console.log("Invoice confirmed");
        }
        setIsLoading(false);
        triggerAlert("success", "Success", "Invoice paid!", null);
    }

    const getSolanaWalletProvider = async() => {
        if(!wallet){
            return null;
        }
        const provider = new SolanaProvider(
            connection, wallet, opts.preflightCommitment,
          );
        return provider;
    } 

    //TODO: refactor this 
    // we must have one only method pay that can handle any blockchain invoice. 
    // we need to see the similarity from ethereum invoice and solana to make it unique
    const paySolana = async () => {
        if (mock) {
            return;
        }
        if(!connected){
            await setOpenSolanaWalletDialog(true)
        }
        setIsLoading(true);
        const programId = new PublicKey(invoiceInfo.cryptocurrency.smartContract.address);
        const provider = await getSolanaWalletProvider();
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

        const [solFeeAccount, ___] = web3.PublicKey.findProgramAddressSync(
            [
            Buffer.from("sol_fee_account"),
            feeAccountSigner.toBuffer(),
            ],
            programId
        );
        let transactionDetails;
        if (invoiceInfo.cryptocurrency.nativeToken) {
            try {
                transactionDetails = await paySolanaNativeToken(program, invoiceInfo, adminStateAccount, feeAccountSigner, solFeeAccount);
            } catch (error) {
                setIsLoading(false);
                console.error(error)
                triggerAlert("error", "Error", "An error occur!", "Contact the provider.");
                return;
            }
        } else {
            try {
                transactionDetails = await paySolanaToken(program, invoiceInfo, adminStateAccount, feeAccountSigner);
            } catch (error) {
                setIsLoading(false);
                console.error(error)
                triggerAlert("error", "Error", "An error occur!", "Contact the provider.");
                return;
            }
        }
        await callInvoiceConfirmation(transactionDetails);
        console.log("Invoice confirmed");
        setIsLoading(false);
        triggerAlert("success", "Success", "Invoice paid!", null);
    }

    async function paySolanaNativeToken(program, invoiceInfo, adminStateAccount, feeAccountSigner, solFeeAccount){
        let txn;
        try {
             txn = await program.methods
                .payWithSol(new BN(invoiceInfo.amount * LAMPORTS_PER_SOL))
                .accounts({
                    client: new PublicKey(invoiceInfo.creditAddress),
                    customer: wallet.publicKey,
                    adminState: adminStateAccount,
                    solFeeAccount: solFeeAccount, 
                    feeAccountSigner: feeAccountSigner, 
                })
                .transaction();
          } catch (err) {
            console.log("Transaction error: ", err);
          }
        if(txn === undefined){
            setIsLoading(false);
            triggerAlert("error", "Error", "An error occur!", "Contact the provider.")
            return;
        }
        const lastestBlockHash = await connection.getLatestBlockhash();
        txn.recentBlockhash = lastestBlockHash.blockhash;
        txn.feePayer = wallet.publicKey;
        txn.blockNumber = lastestBlockHash.lastValidBlockHeight;
        const estimatedFee = await txn.getEstimatedFee(connection);
        const txnfinal = await window.solana.signAndSendTransaction(txn);
        const transactionDetails = {
            transactionHash: txnfinal.signature,
            blockHash: lastestBlockHash.blockhash,
            blockNumber: lastestBlockHash.lastValidBlockHeight,
            gasUsed: estimatedFee,
            toAddress: invoiceInfo.creditAddress, // TODO: see how to get this data from the txn instructions
            fromAddress: txnfinal.publicKey
        };
        return transactionDetails;
    }

    async function paySolanaToken(program, invoiceInfo, adminStateAccount, feeAccountSigner) {
        const mintToken = new PublicKey(invoiceInfo.cryptocurrency.address)
        //const recipientAddress = new PublicKey("2RqrRYTKkr8SAfMYqrtZ9Bj8uUXw3Wde6UjjD4wj4iPH");
        const recipientAddress = new PublicKey(invoiceInfo.creditAddress);
        // let transactionInstructions = [] // add all instructions here to approve only once
        //create associated token accounts
        let associatedTokenFrom = await getAssociatedTokenAddress(mintToken, wallet.publicKey);
        const fromTokenAccount = await getAccount(connection, associatedTokenFrom);
        const associatedTokenTo = await getAssociatedTokenAddress(mintToken,recipientAddress);
        if(!await connection.getAccountInfo(associatedTokenTo)){
            console.log("need create associate account");
            let transaction = new Transaction().add(
                createAssociatedTokenAccountInstruction(
                    publicKey,
                    associatedTokenTo,
                    recipientAddress,
                    mintToken
                )
            );
            const lastestBlockHash = await connection.getLatestBlockhash();
            transaction.recentBlockhash = lastestBlockHash.blockhash;
            transaction.feePayer = wallet.publicKey;
            transaction.blockNumber = lastestBlockHash.lastValidBlockHeight;
            console.log("transaction", transaction)
            await window.solana.signAndSendTransaction(transaction)
        };
        const tokenFeeAccount = await getAssociatedTokenAddress(mintToken, feeAccountSigner, true);
        let invoiceTransaction = await program.methods
            .payWithToken(new BN(toWei(invoiceInfo.amount, invoiceInfo.cryptocurrency.decimals).toString()))
            .accounts({
                client: recipientAddress,  
                customer: wallet.publicKey,
                tokenMint: mintToken, 
                clientTokenAccount: associatedTokenTo,
                customerTokenAccount: fromTokenAccount.address,
                tokenFeeAccount: tokenFeeAccount, 
                feeAccountSigner: feeAccountSigner,
                adminState: adminStateAccount,
            })
            .transaction();
        if(invoiceTransaction === undefined){
            setIsLoading(false);
            triggerAlert("error", "Error", "An error occur!", "Contact the provider.")
            return;
        }
        const lastestBlockHash = await connection.getLatestBlockhash();
        invoiceTransaction.recentBlockhash = lastestBlockHash.blockhash;
        invoiceTransaction.feePayer = wallet.publicKey;
        invoiceTransaction.blockNumber = lastestBlockHash.lastValidBlockHeight;
        const estimatedFee = await invoiceTransaction.getEstimatedFee(connection);
        let txnFinal = await window.solana.signAndSendTransaction(invoiceTransaction)
        const transactionDetails = {
            transactionHash: txnFinal.signature,
            blockHash: lastestBlockHash.blockhash,
            blockNumber: lastestBlockHash.lastValidBlockHeight,
            gasUsed: estimatedFee,
            toAddress: invoiceInfo.creditAddress, // TODO: see how to get this data from the txn instructions
            fromAddress: txnFinal.publicKey
        };
        console.log(transactionDetails);
        return transactionDetails;
    }




    async function invoiceNativeToken(invoiceContract, invoiceInfo) {
        const transaction = await invoiceContract.pay(invoiceInfo.creditAddress, { value: ethers.utils.parseEther(invoiceInfo.amount.toString()) }); // use the amount from the invoiceInfo
        console.log(`Invoice Transaction Hash: ${transaction.hash}`);
        const result = await transaction.wait();
        console.log(result);
        console.log("Invoice Executed");
        const transactionDetails = {
            transactionHash: transaction.hash,
            blockHash: result.blockHash,
            blockNumber: result.blockNumber,
            gasUsed: result.gasUsed.toString(),
            toAddress: result.to,
            fromAddress: result.from,
            confirmations: result.confirmations
        };
        return transactionDetails;
    }

    async function invoiceERC20(invoiceContract, invoiceInfo, signer) {
        // TODO: Create a util class to handle smart contract operations // invoiceExecution
        const ERC20Contract = new Contract(
            invoiceInfo.cryptocurrency.address,
            ERC20.abi,
            signer
        );
        const approvalTransaction = await ERC20Contract.approve(invoiceInfo.cryptocurrency.smartContract.address,
            toWei(invoiceInfo.amount, invoiceInfo.cryptocurrency.decimals));
        console.log(`Approval Transaction Hash: ${approvalTransaction.hash}`);
        const approvalResult = await approvalTransaction.wait();
        console.log(approvalResult);
        const transaction = await invoiceContract.payUsingToken(invoiceInfo.creditAddress, invoiceInfo.cryptocurrency.address, toWei(invoiceInfo.amount, invoiceInfo.cryptocurrency.decimals));
        console.log(`Invoice Transaction Hash: ${transaction.hash}`);
        const result = await transaction.wait();
        console.log(result);
        console.log("ERC20 Invoice Executed");
        const transactionDetails = {
            transactionHash: transaction.hash,
            blockHash: result.blockHash,
            blockNumber: result.blockNumber,
            gasUsed: result.gasUsed.toString(),
            toAddress: result.to,
            fromAddress: result.from,
            confirmations: result.confirmations
        };
        return transactionDetails;
    }

    const callInvoiceConfirmation = async (transactionDetails) => {
        invoiceConfirmation.transactionDetails = transactionDetails;
        invoiceConfirmation.amountPaid = invoiceInfo.amount;
        invoiceConfirmation.products = invoiceInfo.products;
        await axios.post(`${process.env.REACT_APP_API_BASE_URL}${process.env.REACT_APP_API_CONTEXT_ROOT}/invoice/${invoiceInfo.hash}/confirmation`, invoiceConfirmation);
    }

    const isCustomerRequiredInfo = (customerRequiredInfo) => {
        return customerRequiredInfo?.name ||
            customerRequiredInfo?.email ||
            customerRequiredInfo?.phoneNumber ||
            customerRequiredInfo?.shippingAddress;
    }

    const isReadyToPay = () => {
        if (invoiceInfo?.invoiceStatus != "AWAITING_PAYMENT") {
            return false;
        }
        return true;
    }

    const addQuantity = (product) => {
        const currentAmount = invoiceInfo.amount;
        const index = invoiceInfo.products.findIndex(prd => prd.item.id === product.item.id);
        invoiceInfo.products[index].quantity++;
        const cryptocurrencyDecimals = product.item.cryptocurrency.decimals;
        const totalAmount = toWei(currentAmount, cryptocurrencyDecimals).add(toWei(product.item.price, cryptocurrencyDecimals));
        setInvoiceInfo({ ...invoiceInfo, ["amount"]: fromWei(totalAmount, cryptocurrencyDecimals) });
    }

    const removeQuantity = (product) => {
        const currentAmount = invoiceInfo.amount;
        const index = invoiceInfo.products.findIndex(prd => prd.item.id === product.item.id);
        invoiceInfo.products[index].quantity--;
        const cryptocurrencyDecimals = product.item.cryptocurrency.decimals;
        const totalAmount = toWei(currentAmount, cryptocurrencyDecimals).sub(toWei(product.item.price, cryptocurrencyDecimals));
        setInvoiceInfo({ ...invoiceInfo, ["amount"]: fromWei(totalAmount, cryptocurrencyDecimals) });
    }
    
    const constainSupply = (product) => {
        return (product.item.totalSupply - product.quantity) >= 1;
    }

    return (
        <>
        {isLoading ? (
          <LoadingSpinner/>
        ) : (
        <Box
            lg={8} md={6} xs={12}
            display="block"
            justifyContent="center"
            alignItems="center"
            margin="10px"
            minHeight="10vh"
            width={`${mock ? '70%' : '100%'} `}>
            {alertOpen && <AlertAction severity={alert.severity} title={alert.title} message={alert.message} strongMessage={alert.strongMessage} open={alertOpen} setOpen={setAlertOpen}/>}
            <Card>
                <Box sx={{ m: 2, textTransform: 'uppercase' }} >
                    <Avatar src={`data:image/jpeg;base64,${invoiceInfo.user?.image}`} sx={{ height: 84, mb: 2, width: 84 }} />
                    <Typography color="inherit" variant="h6">
                        {invoiceInfo?.user?.companyName}
                    </Typography>
                </Box>
                {invoiceInfo.invoiceStatus === 'DEACTIVATED' &&
                    <CardHeader title="Information" subheader="Link not valid anymore" />
                }
                {/* <CardHeader subheader="Amount Due" title={invoiceInfo?.amount + ` ` + invoiceInfo?.cryptocurrency?.symbol}/> */}
                <Divider />
                    <Typography sx={{ pl: 2 }} variant="h2">
                        {invoiceInfo?.amount} {invoiceInfo?.cryptocurrency?.symbol}
                    </Typography>
                    <Typography sx={{ pl: 2, pb: 2}} variant="h5">
                        Due {invoiceInfo?.dueDate !='' ? new Date(invoiceInfo?.dueDate).toLocaleDateString(navigator.language, {year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                    </Typography>
                    <Grid container>
                        <Grid item xs={3}>
                            <Typography sx={{ pl: 2 }} variant="overline" color="textSecondary">
                                From: 
                            </Typography>
                        </Grid>
                        <Grid item xs={9}>
                            <Typography sx={{ pl: 2 }} variant="subtitle2">
                                {invoiceInfo?.user?.companyName}
                            </Typography>
                        </Grid>
                        <Grid item xs={3}>
                            <Typography sx={{ pl: 2 }} variant="overline" color="textSecondary">
                                To: 
                            </Typography>
                        </Grid>
                        <Grid item xs={9}>
                            <Typography sx={{ pl: 2 }} variant="subtitle2">
                                {invoiceInfo?.customer?.name} 
                            </Typography>
                        </Grid>
                        <Grid item xs={3}>
                            <Typography sx={{ pl: 2 }} variant="overline" color="textSecondary" >
                                Invoice: 
                            </Typography>
                        </Grid>
                        <Grid item xs={9}>
                            <Typography sx={{ pl: 2 }} variant="subtitle2">
                                {invoiceInfo?.uuid != null ? invoiceInfo?.uuid : "#0000000001-PREVIEW"} 
                                {console.log(invoiceInfo?.uuid)}
                            </Typography>
                        </Grid>
                        <Grid item xs={3}>
                            <Typography sx={{ pl: 2 }} variant="overline" color="textSecondary" >
                                Memo: ß
                            </Typography>
                        </Grid>
                        <Grid item xs={9}>
                            <Typography sx={{ pl: 2 }} variant="subtitle2">
                                {invoiceInfo?.memo}
                            </Typography>
                        </Grid>
                    </Grid>
                <Divider />
                <CardContent>
                    <Grid container spacing={3}>
                        <Grid container sx={{ flex: '1 1 auto' }}>
                            <Grid item xs={12} lg={12} sx={{ backgroundColor: 'neutral.50', display: 'top', flexDirection: 'column', position: 'relative' }} >
                                <Typography sx={{ p: 2 }} variant="overline">
                                    Your Items
                                </Typography>
                                <List sx={{ textTransform: 'capitalize' }} dense={true}>
                                    {invoiceInfo?.products?.length > 0 &&
                                        invoiceInfo?.products.map((product) => (
                                            <ListItem key={product.item.id} button>
                                                <ListItemAvatar>
                                                    <Avatar
                                                        alt={product.item?.name}
                                                        src={`data:image/jpeg;base64,${product.item?.image}`}
                                                        variant="square"
                                                    />
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={`${product.item?.name}`}
                                                    secondary={`${product.item?.price} ${product.item?.cryptocurrency.symbol}`}
                                                />
                                                <ListItemSecondaryAction>
                                                    {invoiceInfo?.adjustableQuantity &&
                                                        <>
                                                            <IconButton disabled={!constainSupply(product) || mock} aria-label="plus" onClick={() => addQuantity(product)}>
                                                                <AddRoundedIcon />
                                                            </IconButton>
                                                            <IconButton disabled={product.quantity === 1 || mock} aria-label="minus" onClick={() => removeQuantity(product)}>
                                                                <RemoveRoundedIcon />
                                                            </IconButton>
                                                        </>
                                                    }
                                                    <ListItemText secondary={`Quantity: ${product.quantity}`} />
                                                </ListItemSecondaryAction>
                                            </ListItem>
                                        ))}
                                </List>
                                <Divider />
                                {invoiceInfo?.amount &&
                                    <Grid item xs={12} lg={12} align="right">
                                        <Typography sx={{ mt: 3, mr: '1%' }} variant="overline">
                                            {invoiceInfo?.amount} {invoiceInfo?.cryptocurrency?.symbol}
                                        </Typography>
                                    </Grid>
                                }
                            </Grid>
                        </Grid>
                    </Grid>
                </CardContent>
                <Divider />
                <Box sx={{ display: 'center', justifyContent: 'center', p: 2 }}>
                            {invoiceInfo?.cryptocurrency?.network.name === 'Solana' ?
                                (
                                    <Button color="primary" variant="contained" onClick={paySolana} disabled={!isReadyToPay() && !mock}>
                                        Pay {invoiceInfo?.amount} {invoiceInfo?.cryptocurrency?.symbol}
                                    </Button>

                                ) :
                                (
                                    <Button color="primary" variant="contained" onClick={pay} disabled={!isReadyToPay() && !mock}>
                                        Pay {invoiceInfo?.amount} {invoiceInfo?.cryptocurrency?.symbol}
                                    </Button>
                                )}
                        </Box>
                <Box sx={{ display: 'center', justifyContent: 'center', p: 1 }}>
                    <Typography color="textSecondary" variant="overline"  >
                        Powered by CrossPay Crypto
                    </Typography>
                </Box>
            </Card>
        </Box>
        )}
        </>
    );
}

export default InvoiceDetails;