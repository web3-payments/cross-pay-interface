import React from 'react'
import { useState, useEffect, } from 'react';
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
    List, ListItem, ListItemAvatar, ListItemText, ListItemSecondaryAction, Container
} from '@mui/material';
import AlertAction from '../utils/alert-actions/alert-actions';
import LoadingSpinner from '../utils/loading-spinner/loading-spinner';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import idl from '../../idl/cross_pay_solana.json';
import { Program, AnchorProvider as SolanaProvider, web3, BN } from '@project-serum/anchor';
import Autocomplete from '@mui/material/Autocomplete';
import { styled } from '@mui/material/styles';

import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';

import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useConnection, useWallet, useAnchorWallet } from '@solana/wallet-adapter-react';
import { AddressLookupTableAccount, PublicKey, SystemProgram, Transaction, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import * as anchor from '@project-serum/anchor'


import BN from "bn.js"
import { useJupiterApiContext } from "../../context/jupiter-api-context";
import { fromUIAmount, getATA, getBalance, getOrCreateATA, toUIAmount } from '../../utils/solana-account-helpers';

const Item = styled(Container)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));

const PaymentDetails = ({ paymentInfo, mock, setPaymentInfo }) => {
    const opts = {preflightCommitment: "processed"}
    const { connection } = useConnection();
    const wallet = useAnchorWallet();
    //const { SystemProgram } = web3;

    const [isLoading, setIsLoading] = useState(false);
    const [alert, setAlert] = useState();
    const [alertOpen, setAlertOpen] = useState();
    const [paymentConfirmation, setPaymentConfirmation] = useState({});
    const [selectedBlockchain, setSelectedBlockchain] = useState();
    const [hasEnoughTokens, setHasEnoughTokens] = useState(true);
    const [possibleInputs, setPossibleInputs] = useState();
    const [selectedToken, setSelectedToken] = useState();

    const toWei = (num, decimals) => ethers.utils.parseUnits(num.toString(), decimals.toString());
    const fromWei = (num, decimals) => ethers.utils.formatUnits(num.toString(), decimals.toString());


    const { setVisible: setOpenSolanaWalletDialog } = useWalletModal();
    const { signMessage, publicKey, disconnect: disconnectSolWallet, connected, wallet } = useWallet();
    const { connection } = useConnection();
    const anchorWallet = useAnchorWallet();
    const { tokenMap, routeMap, tokenNameMap, loaded, api } = useJupiterApiContext();

    //possible inputs -- in the case where the user needs to pay with another token

    const SOL_MINT = "So11111111111111111111111111111111111111112";
    const swapAndPay = async (selected,) => {
        const EXPECTED_TOKEN_MINT = paymentInfo.cryptocurrency.nativeToken ? SOL_MINT : paymentInfo.cryptocurrency.address;
        const provider = new anchor.AnchorProvider(connection, anchorWallet, anchor.AnchorProvider.defaultOptions())

        setIsLoading(true);
        try {
            const cryptoCurrencyPriceWRTSelectedToken = await api.v4PriceGet({
                ids: paymentInfo.cryptocurrency.symbol,
                vsToken: selected.symbol,
            })

            // check if user has enough of the selected balance
            const balanceOfSelectedToken = await getBalance(provider, selected.symbol === "SOL", new PublicKey(selected.address))
            const balanceOfExpectedToken = await getBalance(provider, paymentInfo.cryptocurrency.nativeToken, new PublicKey(paymentInfo.cryptocurrency.address))

            //price of `paymentInfo.cryptocurrency` using selected as quote
            //saves us from calculating in stables first
            //eg. how many BONK do we sell to be able to buy 1 sol
            const price = Number(cryptoCurrencyPriceWRTSelectedToken.data[paymentInfo.cryptocurrency.symbol].price)
            const amountOfExpectedTokenToBuy = paymentInfo?.amount - balanceOfExpectedToken;
            const amountOfSelectedTokenToSell = price * amountOfExpectedTokenToBuy
            //to account for slippage -- extra tokens will remain in the users wallet
            const amountToSell = amountOfSelectedTokenToSell + amountOfSelectedTokenToSell * 0.1;
            console.log(price, amountOfSelectedTokenToSell);

            //TODO: do actual swap on mainnet
            //TODO: for now just make user sign tx.
            const message = ["Swap and Pay", publicKey.toBase58()];
            const encodedMessage = new TextEncoder().encode(message);
            let signature = await signMessage(encodedMessage)
            setIsLoading(false);
            triggerAlert("success", "Success", "Payment Executed!", null);
            // if (balanceOfSelectedToken > 0) {

            //     const routes = await api
            //         .v4QuoteGet({
            //             amount: Math.ceil(fromUIAmount(amountToSell, paymentInfo.cryptocurrency.decimals)),
            //             inputMint: selected.address,
            //             outputMint: EXPECTED_TOKEN_MINT,
            //             slippage: 50,
            //         }).then(res => res.data)

            //     const {
            //         swapTransaction,
            //     } = await api.v4SwapPost({
            //         body: {
            //             route: routes[0],
            //             userPublicKey: publicKey.toBase58(),
            //             wrapUnwrapSOL: true,
            //         }
            //     });
            //     const swapTransactionFromJupiterAPI = swapTransaction
            //     const swapTransactionBuf = Buffer.from(swapTransactionFromJupiterAPI, 'base64')
            //     var transaction = VersionedTransaction.deserialize(swapTransactionBuf)


            //     // get address lookup table accounts
            //     // const addressLookupTableAccounts = await Promise.all(
            //     //     transaction.message.addressTableLookups.map(async (lookup) => {
            //     //         return new AddressLookupTableAccount({
            //     //             key: lookup.accountKey,
            //     //             state: AddressLookupTableAccount.deserialize(await connection.getAccountInfo(lookup.accountKey).then((res) => { return res.data })),
            //     //         })
            //     //     }))
            //     // // decompile transaction message and add transfer instruction
            //     // var message = TransactionMessage.decompile(transaction.message, { addressLookupTableAccounts: addressLookupTableAccounts })

            //     // // compile the message and update the transaction
            //     // transaction.message = message.compileToV0Message(addressLookupTableAccounts)

            //     // sign some transaction here


            // } else {
            //     setIsLoading(false);
            //     return triggerAlert("error", "Error", `you don't have enough ${selected.symbol} `, `select another token to pay`)
            // }

        } catch (err) {
            console.log(err);
        }
        setIsLoading(false);
    }


    useEffect(() => {
        if (selectedBlockchain === "solana" && connected) {
            completePaymentOnSolana()
        }
    }, [publicKey, routeMap])

    const setPossibleInputsMap = (map) => {

        setPossibleInputs(map)
    }

    const handleUpdateSelected = async (value) => {
        if (!value) return
        setSelectedToken(tokenNameMap.get(value));
    }
    const completePaymentOnSolana = async () => {
        setSelectedBlockchain("")

        const provider = new anchor.AnchorProvider(connection, anchorWallet, anchor.AnchorProvider.defaultOptions())

        if (paymentInfo.cryptocurrency.nativeToken) {

            const userBalance = await getBalance(provider, true)
            if (userBalance < paymentInfo?.amount) {
                triggerAlert("error", "Error", `you don't have enough ${paymentInfo?.cryptocurrency.symbol} to complete this payment `, `select another token to pay`)
                setPossibleInputsMap(routeMap.get(SOL_MINT))
                return setHasEnoughTokens(false)
            }
            // user has enough of the primary native currency
            //TODO: add williams code here and continue to make payment

        } else {

            const userBalance = await getBalance(provider, false, new PublicKey(paymentInfo.cryptocurrency.address))

            if (userBalance < paymentInfo.amount) {
                setPossibleInputsMap(routeMap.get(paymentInfo.cryptocurrency.address))
                triggerAlert("error", "Error", "Insufficient funds", `Select another payment method`)
                return setHasEnoughTokens(false)
            }
            // user has enough of the primary currency
            //TODO: add williams code here and continue to make payment
            console.log("user has enough balance -- proceed to payment");
        }
        return
    }


    const triggerAlert = (severity, title, message, strongMessage) => {
        setAlertOpen(true);
        setAlert({  severity: severity, title: title, message: message, strongMessage: strongMessage  });
    }
    const pay = async () => {

        if (paymentInfo.cryptocurrency.network.name == "solana") {
            if (connected) {
                disconnectSolWallet()
            }
            setSelectedBlockchain("solana")
            setOpenSolanaWalletDialog(true)
        } else {
            setSelectedBlockchain("ethereum")
            await payEth()
        }
    }
    const payEth = async () => {
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

    
    const swap = async () => {

    }

    //TODO: refactor this 
    // we must have one only method pay that can handle any blockchain payment. 
    // we need to see the similarity from ethereum payment and solana to make it unique
    const paySolana = async () => {
        if (mock) {
            return;
        }
        setIsLoading(true);
        const programID = new PublicKey(paymentInfo.cryptocurrency.smartContract.address);
        let transactionDetails;
        if (paymentInfo.cryptocurrency.nativeToken) {
            try {
                transactionDetails = await paySolanaNativeToken(programID, paymentInfo);
            } catch (error) {
                setIsLoading(false);
                console.error(error)
                triggerAlert("error", "Error", "An error occur!", "Contact the provider.");
                return;
            }
        } else {

        }
        await callPaymentConfirmation(transactionDetails);
        console.log("Payment confirmed");
        setIsLoading(false);
        triggerAlert("success", "Success", "Payment Executed!", null);
    }

    async function paySolanaNativeToken(programId, paymentInfo){
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
        const provider = await getSolanaWalletProvider();
        const program = new Program(idl, programId, provider);
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

    async function paySolanaToken(programId, paymentInfo){

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
        if (!hasEnoughTokens) {
            return false;
        }
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
                                            {paymentInfo?.products?.length > 0 &&
                                                paymentInfo?.products.map((product) => (

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
                                        {paymentInfo?.amount &&
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
                            {hasEnoughTokens ? <Button color="primary" variant="contained" onClick={pay} disabled={!isReadyToPay() && !mock}>
                                Pay {paymentInfo?.amount} {paymentInfo?.cryptocurrency?.symbol}
                            </Button> :
                                <>
                                    <Grid item md={6} xs={12}>
                                        <Item>
                                            <InputLabel required >Select Token</InputLabel>
                                        </Item>
                                        <FormControl fullWidth >

                                            <Autocomplete
                                                id="select-token"
                                                sx={{ width: 300 }}
                                                options={possibleInputs}
                                                getOptionLabel={(tokenMint) => {
                                                    const name = tokenMap.get(tokenMint)?.name;
                                                    if (!name) return
                                                    return name
                                                }}
                                                renderInput={(params) => {

                                                    handleUpdateSelected(params.inputProps.value)
                                                    return (
                                                        <TextField {...params} label={selectedToken?.name || ""} margin="normal" />
                                                    )
                                                }}
                                                renderOption={(props, tokenMint, { inputValue }) => {
                                                    const option = tokenMap.get(tokenMint);
                                                    if (!option) return
                                                    const matches = match(option.name, inputValue, { insideWords: true });
                                                    const parts = parse(option.name, matches);

                                                    return (
                                                        <li {...props}>
                                                            <div>
                                                                {parts.map((part, index) => (
                                                                    <span
                                                                        key={index}
                                                                        style={{
                                                                            fontWeight: part.highlight ? 700 : 400,
                                                                        }}
                                                                    >
                                                                        {part.text}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </li>
                                                    );
                                                }}
                                            />
                                        </FormControl>
                                        <Item>
                                            {selectedToken && <Button color="primary" variant="contained" onClick={() => { swapAndPay(selectedToken) }} >
                                                Pay with {selectedToken.symbol}
                                            </Button>}

                                        </Item>
                                    </Grid>
                                </>
                            }
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