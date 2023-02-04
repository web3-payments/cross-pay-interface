import React from 'react'
import { useState } from 'react';
import { Contract, ethers } from "ethers";
import * as PaymentContract from "../../abis/payment/PaymentContract.json";
import * as ERC20 from "../../abis/ERC20/ERC20.json";
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

const PaymentDetails = ({ paymentInfo, mock, setPaymentInfo }) => {
    const opts = {preflightCommitment: "processed"}
    const { connection } = useConnection();
    const { setVisible: setOpenSolanaWalletDialog } = useWalletModal();
    const wallet = useAnchorWallet();
    const { publicKey, sendTransaction, connected } = useWallet();
    const [isLoading, setIsLoading] = useState(false);
    const [alert, setAlert] = useState();
    const [alertOpen, setAlertOpen] = useState();
    const [paymentConfirmation, setPaymentConfirmation] = useState({});
    const toWei = (num, decimals) => ethers.utils.parseUnits(num.toString(), decimals.toString());
    const fromWei = (num, decimals) => ethers.utils.formatUnits(num.toString(), decimals.toString());
    const triggerAlert = (severity, title, message, strongMessage) => {
        setAlertOpen(true);
        setAlert({ severity: severity, title: title, message: message, strongMessage: strongMessage });
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
            if (network.chainId !== paymentInfo.cryptocurrency.network.chainId) {
                setIsLoading(false);
                triggerAlert("error", "Error", "Invalid Network! Change your wallet network", `Correct: ${paymentInfo.cryptocurrency.network.name}`)
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
            // TODO: Create a util class to handle smart contract operations // paymentExecution 
            const paymentContract = new Contract(
                paymentInfo.cryptocurrency.smartContract.address,
                PaymentContract.abi,
                signer
            );
            let transactionDetails;
            if (paymentInfo.cryptocurrency.nativeToken) {
                try {
                    transactionDetails = await paymentNativeToken(paymentContract, paymentInfo);
                } catch (error) {
                    setIsLoading(false);
                    console.error(error)
                    triggerAlert("error", "Error", "An error occur!", "Contact the provider.");
                    return;
                }
            } else {
                try {
                    transactionDetails = await paymentERC20(paymentContract, paymentInfo, signer);
                } catch (error) {
                    setIsLoading(false);
                    console.error(error)
                    triggerAlert("error", "Error", "An error occur!", "Contact the provider.");
                    return;
                }
            }
            await callPaymentConfirmation(transactionDetails);
            console.log("Payment confirmed");
        }
        setIsLoading(false);
        triggerAlert("success", "Success", "Payment Executed!", null);
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
    // we must have one only method pay that can handle any blockchain payment. 
    // we need to see the similarity from ethereum payment and solana to make it unique
    const paySolana = async () => {
        if (mock) {
            return;
        }
        if(!connected){
            await setOpenSolanaWalletDialog(true)
        }
        setIsLoading(true);
        const programId = new PublicKey(paymentInfo.cryptocurrency.smartContract.address);
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
        if (paymentInfo.cryptocurrency.nativeToken) {
            try {
                transactionDetails = await paySolanaNativeToken(program, paymentInfo, adminStateAccount, feeAccountSigner, solFeeAccount);
            } catch (error) {
                setIsLoading(false);
                console.error(error)
                triggerAlert("error", "Error", "An error occur!", "Contact the provider.");
                return;
            }
        } else {
            try {
                transactionDetails = await paySolanaToken(program, paymentInfo, adminStateAccount, feeAccountSigner);
            } catch (error) {
                setIsLoading(false);
                console.error(error)
                triggerAlert("error", "Error", "An error occur!", "Contact the provider.");
                return;
            }
        }
        await callPaymentConfirmation(transactionDetails);
        console.log("Payment confirmed");
        setIsLoading(false);
        triggerAlert("success", "Success", "Payment Executed!", null);
    }

    async function paySolanaNativeToken(program, paymentInfo, adminStateAccount, feeAccountSigner, solFeeAccount){
        let txn;
        try {
             txn = await program.methods
                .payWithSol(new BN(paymentInfo.amount * LAMPORTS_PER_SOL))
                .accounts({
                    client: new PublicKey(paymentInfo.creditAddress),
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
            toAddress: paymentInfo.creditAddress, // TODO: see how to get this data from the txn instructions
            fromAddress: txnfinal.publicKey
        };
        return transactionDetails;
    }

    async function paySolanaToken(program, paymentInfo, adminStateAccount, feeAccountSigner) {
        const mintToken = new PublicKey(paymentInfo.cryptocurrency.address)
        //const recipientAddress = new PublicKey("2RqrRYTKkr8SAfMYqrtZ9Bj8uUXw3Wde6UjjD4wj4iPH");
        const recipientAddress = new PublicKey(paymentInfo.creditAddress);
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
        let paymentTransaction = await program.methods
            .payWithToken(new BN(toWei(paymentInfo.amount, paymentInfo.cryptocurrency.decimals).toString()))
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
        if(paymentTransaction === undefined){
            setIsLoading(false);
            triggerAlert("error", "Error", "An error occur!", "Contact the provider.")
            return;
        }
        const lastestBlockHash = await connection.getLatestBlockhash();
        paymentTransaction.recentBlockhash = lastestBlockHash.blockhash;
        paymentTransaction.feePayer = wallet.publicKey;
        paymentTransaction.blockNumber = lastestBlockHash.lastValidBlockHeight;
        const estimatedFee = await paymentTransaction.getEstimatedFee(connection);
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

    async function paymentNativeToken(paymentContract, paymentInfo) {
        const transaction = await paymentContract.pay(paymentInfo.creditAddress, { value: ethers.utils.parseEther(paymentInfo.amount.toString()) }); // use the amount from the paymentInfo
        console.log(`Payment Transaction Hash: ${transaction.hash}`);
        const result = await transaction.wait();
        console.log(result);
        console.log("Payment Executed");
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

    async function paymentERC20(paymentContract, paymentInfo, signer) {
        // TODO: Create a util class to handle smart contract operations // paymentExecution
        const ERC20Contract = new Contract(
            paymentInfo.cryptocurrency.address,
            ERC20.abi,
            signer
        );
        const approvalTransaction = await ERC20Contract.approve(paymentInfo.cryptocurrency.smartContract.address,
            toWei(paymentInfo.amount, paymentInfo.cryptocurrency.decimals));
        console.log(`Approval Transaction Hash: ${approvalTransaction.hash}`);
        const approvalResult = await approvalTransaction.wait();
        console.log(approvalResult);
        const transaction = await paymentContract.payUsingToken(paymentInfo.creditAddress, paymentInfo.cryptocurrency.address, toWei(paymentInfo.amount, paymentInfo.cryptocurrency.decimals));
        console.log(`Payment Transaction Hash: ${transaction.hash}`);
        const result = await transaction.wait();
        console.log(result);
        console.log("ERC20 Payment Executed");
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

    const handleCustomerInfo = (event) => {
        setPaymentConfirmation({ ...paymentConfirmation, ["customerInfo"]: { ...paymentConfirmation.customerInfo, [event.target.name]: event.target.value } })
    }

    const handleCustomerShippingInfo = (event) => {
        if (paymentConfirmation.customerInfo === undefined) {
            paymentConfirmation.customerInfo = {};
        }
        setPaymentConfirmation({ ...paymentConfirmation, ["customerInfo"]: { ...paymentConfirmation.customerInfo, ["shippingAddress"]: { ...paymentConfirmation.customerInfo.shippingAddress, [event.target.name]: event.target.value } } })
    }

    const callPaymentConfirmation = async (transactionDetails) => {
        paymentConfirmation.transactionDetails = transactionDetails;
        paymentConfirmation.amountPaid = paymentInfo.amount;
        paymentConfirmation.products = paymentInfo.products;
        await axios.post(`${process.env.REACT_APP_API_BASE_URL}${process.env.REACT_APP_API_CONTEXT_ROOT}/payment/${paymentInfo.hash}/confirmation`, paymentConfirmation);
    }

    const isCustomerRequiredInfo = (customerRequiredInfo) => {
        return customerRequiredInfo?.name ||
            customerRequiredInfo?.email ||
            customerRequiredInfo?.phoneNumber ||
            customerRequiredInfo?.shippingAddress;
    }

    const isReadyToPay = () => {
        if (paymentInfo?.paymentStatus === "DEACTIVATED") {
            return false;
        }
        if (isCustomerRequiredInfo(paymentInfo?.customerRequiredInfo)) {
            if (paymentInfo?.customerRequiredInfo?.name && isNotFilled(paymentConfirmation?.customerInfo?.name)) {
                return false;
            }
            if (paymentInfo?.customerRequiredInfo?.email && isNotFilled(paymentConfirmation?.customerInfo?.email)) {
                return false;
            }
            if (paymentInfo?.customerRequiredInfo?.phoneNumber && isNotFilled(paymentConfirmation?.customerInfo?.phoneNumber)) {
                return false;
            }
            if (paymentInfo?.customerRequiredInfo?.shippingAddress
                && (isNotFilled(paymentConfirmation?.customerInfo?.shippingAddress?.country)
                    || isNotFilled(paymentConfirmation?.customerInfo?.shippingAddress?.address)
                    || isNotFilled(paymentConfirmation?.customerInfo?.shippingAddress?.city)
                    || isNotFilled(paymentConfirmation?.customerInfo?.shippingAddress?.zipCode)
                    || isNotFilled(paymentConfirmation?.customerInfo?.shippingAddress?.state))) {
                return false;
            }
        }
        return true;
    }

    const isNotFilled = (field) => {
        return (field === "" || field === undefined || field === null);
    }

    const addQuantity = (product) => {
        const currentAmount = paymentInfo.amount;
        const index = paymentInfo.products.findIndex(prd => prd.item.id === product.item.id);
        paymentInfo.products[index].quantity++;
        const cryptocurrencyDecimals = product.item.cryptocurrency.decimals;
        const totalAmount = toWei(currentAmount, cryptocurrencyDecimals).add(toWei(product.item.price, cryptocurrencyDecimals));
        setPaymentInfo({ ...paymentInfo, ["amount"]: fromWei(totalAmount, cryptocurrencyDecimals) });
    }

    const removeQuantity = (product) => {
        const currentAmount = paymentInfo.amount;
        const index = paymentInfo.products.findIndex(prd => prd.item.id === product.item.id);
        paymentInfo.products[index].quantity--;
        const cryptocurrencyDecimals = product.item.cryptocurrency.decimals;
        const totalAmount = toWei(currentAmount, cryptocurrencyDecimals).sub(toWei(product.item.price, cryptocurrencyDecimals));
        setPaymentInfo({ ...paymentInfo, ["amount"]: fromWei(totalAmount, cryptocurrencyDecimals) });
    }

    const constainSupply = (product) => {
        return (product.item.totalSupply - product.quantity) >= 1;
    }

    return (
        <>
            {isLoading ? (
                <LoadingSpinner />
            ) : (
                <Box
                    lg={8} md={6} xs={12}
                    display="block"
                    justifyContent="center"
                    alignItems="center"
                    margin="10px"
                    minHeight="10vh"
                    width={`${mock ? '70%' : '100%'} `}>
                    {alertOpen && <AlertAction severity={alert.severity} title={alert.title} message={alert.message} strongMessage={alert.strongMessage} open={alertOpen} setOpen={setAlertOpen} />}
                    <Card>
                        <Box sx={{ m: 2, textTransform: 'uppercase' }} >
                            <Avatar src={`data:image/jpeg;base64,${paymentInfo.user?.image}`} sx={{ height: 84, mb: 2, width: 84 }} />
                            <Typography color="inherit" variant="h6">
                                {paymentInfo?.user?.companyName}
                            </Typography>
                        </Box>
                        {paymentInfo.paymentStatus === 'DEACTIVATED' &&
                            <CardHeader title="Information" subheader="Link not valid anymore" />
                        }
                        {/* <CardHeader subheader="Amount Due" title={paymentInfo?.amount + ` ` + paymentInfo?.cryptocurrency?.symbol}/> */}
                        <Divider />
                        <CardContent>
                            <Grid container spacing={3}>
                                <Grid container sx={{ flex: '1 1 auto' }}>
                                    <Grid item xs={12} lg={12} sx={{ backgroundColor: 'neutral.50', display: 'top', flexDirection: 'column', position: 'relative' }} >
                                        <Typography sx={{ p: 2 }} variant="overline">
                                            Your Items
                                        </Typography>
                                        <List sx={{ textTransform: 'capitalize' }} dense={true}>
                                            {paymentInfo?.products.length > 0 &&
                                                paymentInfo?.products.map((product) => (
                                                    <ListItem key={product.item.id}>
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
                                                            {paymentInfo?.adjustableQuantity &&
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
                                        {paymentInfo?.amount > 0 &&
                                            <Grid item xs={12} lg={12} align="right">
                                                <Typography sx={{ mt: 3, mr: '1%' }} variant="overline">
                                                    {paymentInfo?.amount} {paymentInfo?.cryptocurrency?.symbol}
                                                </Typography>
                                            </Grid>
                                        }
                                    </Grid>
                                    {isCustomerRequiredInfo(paymentInfo?.customerRequiredInfo) &&
                                        <Grid item xs={12} lg={12} sx={{ backgroundColor: 'neutral.50', display: 'top', flexDirection: 'column', position: 'relative' }} >
                                            {(paymentInfo?.customerRequiredInfo.name || paymentInfo?.customerRequiredInfo.email || paymentInfo?.customerRequiredInfo.phoneNumber) &&
                                                <Grid container sx={{ m: 1 }}>
                                                    <Grid item xs={12} lg={12}>
                                                        <Typography sx={{ m: 1 }} variant="overline">
                                                            Contact Information
                                                        </Typography>
                                                    </Grid>
                                                    {paymentInfo?.customerRequiredInfo.name &&
                                                        <Grid xs={12} lg={12} item sx={{ m: 0.6 }}>
                                                            <FormControl fullWidth>
                                                                <TextField
                                                                    id="outlined-number"
                                                                    label="Name"
                                                                    name="name"
                                                                    type="text"
                                                                    disabled={mock}
                                                                    value={paymentConfirmation?.customerInfo?.name || ''}
                                                                    onChange={handleCustomerInfo}
                                                                />
                                                            </FormControl>
                                                        </Grid>
                                                    }
                                                    {paymentInfo?.customerRequiredInfo.email &&
                                                        <Grid xs={12} lg={12} item sx={{ m: 0.6 }}>
                                                            <FormControl fullWidth>
                                                                <TextField
                                                                    id="outlined-number"
                                                                    label="Email"
                                                                    name="email"
                                                                    type="text"
                                                                    disabled={mock}
                                                                    value={paymentConfirmation?.customerInfo?.email || ''}
                                                                    onChange={handleCustomerInfo}
                                                                />
                                                            </FormControl>
                                                        </Grid>
                                                    }
                                                    {paymentInfo?.customerRequiredInfo.phoneNumber &&
                                                        <Grid xs={12} lg={12} item sx={{ m: 0.6 }}>
                                                            <FormControl fullWidth>
                                                                <TextField
                                                                    id="outlined-number"
                                                                    label="Phone number"
                                                                    type="text"
                                                                    name="phoneNumber"
                                                                    disabled={mock}
                                                                    value={paymentConfirmation?.customerInfo?.phoneNumber || ''}
                                                                    onChange={handleCustomerInfo}
                                                                />
                                                            </FormControl>
                                                        </Grid>
                                                    }
                                                </Grid>
                                            }
                                            {paymentInfo?.customerRequiredInfo.shippingAddress &&
                                                <Grid container sx={{ m: 1 }}>
                                                    <Grid item xs={12} lg={12}>
                                                        <Typography sx={{ m: 1 }} variant="overline">
                                                            Shipping Address
                                                        </Typography>
                                                    </Grid>
                                                    <Grid xs={12} lg={12} item sx={{ m: 0.6 }}>
                                                        <FormControl fullWidth >
                                                            <InputLabel id="select-country-code">Select Country</InputLabel>
                                                            <Select
                                                                labelId="select-country-code"
                                                                id="select-country-code"
                                                                name="country"
                                                                label="Country"
                                                                disabled={mock}
                                                                value={paymentConfirmation?.customerInfo?.shippingAddress?.country || ''}
                                                                onChange={handleCustomerShippingInfo}
                                                            >
                                                                <MenuItem key={1} value={"portugal"}>Portugal</MenuItem>
                                                            </Select>
                                                        </FormControl>
                                                    </Grid>
                                                    <Grid xs={12} lg={12} item sx={{ m: 0.6 }}>
                                                        <FormControl fullWidth >
                                                            <TextField
                                                                id="outlined-number"
                                                                label="Address Line 1"
                                                                type="text"
                                                                name="address"
                                                                disabled={mock}
                                                                value={paymentConfirmation?.customerInfo?.shippingAddress?.address || ''}
                                                                onChange={handleCustomerShippingInfo}
                                                            />
                                                        </FormControl>
                                                    </Grid>
                                                    <Grid lg={7} item sx={{ m: 0.6 }}>
                                                        <FormControl fullWidth >
                                                            <TextField
                                                                id="outlined-number"
                                                                label="City"
                                                                type="text"
                                                                name="city"
                                                                disabled={mock}
                                                                value={paymentConfirmation?.customerInfo?.shippingAddress?.city || ''}
                                                                onChange={handleCustomerShippingInfo}
                                                            />
                                                        </FormControl>
                                                    </Grid>
                                                    <Grid lg={4.6} item sx={{ m: 0.6 }}>
                                                        <FormControl fullWidth >
                                                            <TextField
                                                                id="outlined-number"
                                                                label="Zip code"
                                                                type="text"
                                                                name="zipCode"
                                                                disabled={mock}
                                                                value={paymentConfirmation?.customerInfo?.shippingAddress?.zipCode || ''}
                                                                onChange={handleCustomerShippingInfo}
                                                            />
                                                        </FormControl>
                                                    </Grid>
                                                    <Grid lg={12} item sx={{ m: 0.6 }}>
                                                        <FormControl fullWidth >
                                                            <TextField
                                                                id="outlined-number"
                                                                label="State"
                                                                type="text"
                                                                name="state"
                                                                disabled={mock}
                                                                value={paymentConfirmation?.customerInfo?.shippingAddress?.state || ''}
                                                                onChange={handleCustomerShippingInfo}
                                                            />
                                                        </FormControl>
                                                    </Grid>
                                                </Grid>
                                            }
                                        </Grid>
                                    }
                                </Grid>
                            </Grid>
                        </CardContent>
                        <Divider />
                        <Box sx={{ display: 'center', justifyContent: 'center', p: 2 }}>
                            {paymentInfo?.cryptocurrency?.network.name === 'Solana' ?
                                (
                                    <Button color="primary" variant="contained" onClick={paySolana} disabled={!isReadyToPay() && !mock}>
                                        Pay {paymentInfo?.amount} {paymentInfo?.cryptocurrency?.symbol}
                                    </Button>

                                ) :
                                (
                                    <Button color="primary" variant="contained" onClick={pay} disabled={!isReadyToPay() && !mock}>
                                        Pay {paymentInfo?.amount} {paymentInfo?.cryptocurrency?.symbol}
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

export default PaymentDetails;