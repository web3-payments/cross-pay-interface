import React from 'react'
import { useState, useEffect, } from 'react';
import { Contract, ethers } from "ethers";
import * as PaymentContract from "../../abis/payment/PaymentContract.json";
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
import { useAnchorWallet, useConnection, useWallet, } from '@solana/wallet-adapter-react';
import { PublicKey, } from "@solana/web3.js";
import { AnchorProvider as SolanaProvider, BN } from '@project-serum/anchor';
import Autocomplete from '@mui/material/Autocomplete';
import { styled } from '@mui/material/styles';

import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';

import { useWalletModal } from '@solana/wallet-adapter-react-ui';


import { useJupiterApiContext } from "../../context/jupiter-api-context";
import { getBalance, paySolanaNativeToken, sleep, SOL_MINT, } from '../../utils/sol-transaction-helpers';
import { fromWei, paymentERC20, payUsingEth, toWei } from '../../utils/eth-transaction-helpers';

const Item = styled(Container)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));

const PaymentDetails = ({ paymentInfo, mock, setPaymentInfo }) => {
    const opts = { preflightCommitment: "processed" }


    const [isLoading, setIsLoading] = useState(false);
    const [alert, setAlert] = useState();
    const [alertOpen, setAlertOpen] = useState();
    const [paymentConfirmation, setPaymentConfirmation] = useState({});
    const [selectedBlockchain, setSelectedBlockchain] = useState();
    const [hasEnoughTokens, setHasEnoughTokens] = useState(true);
    const [possibleInputs, setPossibleInputs] = useState([]);
    const [selectedToken, setSelectedToken] = useState();


    const { setVisible: setOpenSolanaWalletDialog } = useWalletModal();
    const { signMessage, publicKey, disconnect: disconnectSolWallet, connected, wallet } = useWallet();
    const { connection } = useConnection();
    const anchorWallet = useAnchorWallet();
    const { tokenMap, routeMap, tokenNameMap, loaded, api } = useJupiterApiContext();


    const swapAndPay = async (selected,) => {
        const EXPECTED_TOKEN_MINT = paymentInfo.cryptocurrency.nativeToken ? SOL_MINT : paymentInfo.cryptocurrency.address;
        const provider = await getSolanaWalletProvider()

        setIsLoading(true);

        try {
            const cryptoCurrencyPriceWRTSelectedToken = await api.v4PriceGet({
                ids: paymentInfo.cryptocurrency.symbol,
                vsToken: selected.symbol,
            })


            // check if user has enough of the selected balance
            const balanceOfSelectedToken = await getBalance(provider, selected.symbol === "SOL", new PublicKey(selected.address))

            const balanceOfExpectedToken = await getBalance(provider, paymentInfo.cryptocurrency.nativeToken, new PublicKey(SOL_MINT))

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
            sleep(2000)
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
        if (selectedBlockchain === "Solana" && connected) {
            completePaymentOnSolana()
        }
    }, [publicKey, routeMap])


    const handleUpdateSelected = async (value) => {
        if (!value) return
        setSelectedToken(tokenNameMap.get(value));
    }
    const completePaymentOnSolana = async () => {
        setSelectedBlockchain("")

        const provider = await getSolanaWalletProvider()

        if (paymentInfo.cryptocurrency.nativeToken) {

            const userBalance = await getBalance(provider, true)
            if (userBalance < paymentInfo?.amount) {
                triggerAlert("error", "Error", `you don't have enough ${paymentInfo?.cryptocurrency.symbol} to complete this payment `, `select another token to pay`)

                setPossibleInputs(routeMap.get(SOL_MINT) ?? [])
       
                return setHasEnoughTokens(false)
            }
            // user has enough of the primary native currency
            //proceed to pay
            paySolana()
        } else {

            const userBalance = await getBalance(provider, false, new PublicKey(paymentInfo.cryptocurrency.address))

            if (userBalance < paymentInfo.amount) {
                setPossibleInputs(routeMap.get(paymentInfo.cryptocurrency.address))
                triggerAlert("error", "Error", "Insufficient funds", `Select another payment method`)
                return setHasEnoughTokens(false)
            }
            // user has enough of the primary currency
            //proceed to pay
            paySolana()
        }
        return
    }


    const triggerAlert = (severity, title, message, strongMessage) => {
        setAlertOpen(true);
        setAlert({ severity: severity, title: title, message: message, strongMessage: strongMessage });
    }
    const pay = async () => {
        if (paymentInfo.cryptocurrency.network.name == "Solana") {
            if (connected) {
                disconnectSolWallet()
            }
            setSelectedBlockchain("Solana")
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
                    transactionDetails = await payUsingEth(paymentContract, paymentInfo);
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

    const getSolanaWalletProvider = async () => {
        if (!wallet) {
            return null;
        }

        const provider = new SolanaProvider(connection, anchorWallet, opts)

        return provider;
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
                const provider = await getSolanaWalletProvider()

                transactionDetails = await paySolanaNativeToken(provider, setIsLoading, triggerAlert, programID, paymentInfo);
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



    async function paySolanaToken(programId, paymentInfo) {

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
                                                    try {

                                                        handleUpdateSelected(params.inputProps.value)
                                                    } catch (error) {
                                                        console.log(error);
                                                    }
                                                    return (
                                                        <TextField {...params} label={selectedToken?.name || ""} margin="normal" />
                                                    )
                                                }}
                                                renderOption={(props, tokenMint, { inputValue }) => {
                                                    let option, parts
                                                    try {
                                                        option = tokenMap.get(tokenMint);
                                                        if (!option) return
                                                        const matches = match(option.name, inputValue, { insideWords: true });
                                                        parts = parse(option.name, matches);
                                                    } catch (error) {
                                                        console.log(error);
                                                    }


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