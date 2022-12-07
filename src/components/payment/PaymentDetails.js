import React from 'react'
import { useState } from 'react';
import { Contract, ethers } from "ethers";
import * as PaymentContract from "../../abis/payment/PaymentContract.json";
import * as ERC20 from "../../abis/ERC20/ERC20.json";
import { config } from "../../config";
import axios from "axios";
import { getWalletProvider } from "../../utils/ethereumWalletProvider";
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

const PaymentDetails = ({ paymentInfo, mock, setPaymentInfo }) => {
    const [paymentConfirmation, setPaymentConfirmation] = useState({});
    const toWei = (num, decimals) => ethers.utils.parseUnits(num.toString(), decimals.toString());
    const fromWei = (num, decimals) => ethers.utils.formatUnits(num.toString(), decimals.toString());
    const pay = async () => {
        if(mock){
            return;
        }
        //TODO: this wont happen again...
        // if(isCustomerRequiredInfo(paymentInfo?.customerRequiredInfo) && isReadyToPay){
        //     await updatePaymentInfo().catch(function (error) {
        //         alert("error here")
        //         throw error;
        //     });
        // }
        let provider, library, accounts, network, address;
        try {
            provider = await getWalletProvider().connect();
            library = new ethers.providers.Web3Provider(provider);
            accounts = await library.listAccounts();
            network = await library.getNetwork();
            console.log(network);
        } catch (error) {
            console.error(error);
        }
        if (accounts) {
            address = accounts[0];
            const signer = await library.getSigner(address)
            console.log(signer);
            // TODO: Create a util class to handle smart contract operations // paymentExecution 
            const paymentContract = new Contract(
                "0x294eb269DD01e2700dB044F9fA9bF86dBf71aB45", //TODO: move to a consts class
                PaymentContract.abi,
                signer
            );
            console.log(paymentContract);
            console.log(paymentInfo.creditAddress);
            let transactionDetails;
            console.log(paymentInfo.cryptocurrency)
            if (paymentInfo.cryptocurrency.nativeToken) {
                transactionDetails = await paymentNativeToken(paymentContract, paymentInfo);
            } else {
                transactionDetails = await paymentERC20(paymentContract, paymentInfo, signer);
            }

            await callPaymentConfirmation(transactionDetails);
            console.log("payment confirmed");
        }
    }



    async function paymentNativeToken(paymentContract, paymentInfo) {
        const transaction = await paymentContract.pay(paymentInfo.creditAddress, { value: ethers.utils.parseEther(paymentInfo.amount.toString()) }); // use the amount from the paymentInfo
        console.log(`Transaction Hash: ${transaction.hash}`);
        const result = await transaction.wait();
        console.log(result);
        console.log("PAID");
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
        const approvalTransaction = await ERC20Contract.approve("0x294eb269DD01e2700dB044F9fA9bF86dBf71aB45",
            toWei(paymentInfo.amount, paymentInfo.cryptocurrency.decimals));
        console.log(`Transaction Hash: ${approvalTransaction.hash}`);
        const approvalResult = await approvalTransaction.wait();
        console.log(approvalResult);
        const transaction = await paymentContract.payUsingToken(paymentInfo.creditAddress, paymentInfo.cryptocurrency.address, toWei(paymentInfo.amount, paymentInfo.cryptocurrency.decimals));
        console.log(`Transaction Hash: ${transaction.hash}`);
        const result = await transaction.wait();
        console.log(result);
        console.log("PAID");
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

    //TODO: if is adjustable quantity mus be updated
    const updatePaymentInfo = async () => {
        console.log(paymentInfo);
        await axios
            .patch(`${config.contextRoot}/payment/${paymentInfo.hash}`, paymentInfo)
            .then(function (response) {
                console.log(response);
                if (response.status === 200) {
                    console.log("Update")
                }
            }).catch(function (error) {
                console.error(error)
                throw error;
            });
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
        await axios.post(`${config.contextRoot}/payment/${paymentInfo.hash}/confirmation`, paymentConfirmation);
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
        paymentInfo.products[index].item.totalSupply--;
        paymentInfo.products[index].quantity++;
        const cryptocurrencyDecimals = product.item.cryptocurrency.decimals;
        const totalAmount = toWei(currentAmount, cryptocurrencyDecimals).add(toWei(product.item.price, cryptocurrencyDecimals));
        setPaymentInfo({ ...paymentInfo, ["amount"]: fromWei(totalAmount, cryptocurrencyDecimals) });
    }

    const removeQuantity = (product) => {
        const currentAmount = paymentInfo.amount;
        const index = paymentInfo.products.findIndex(prd => prd.item.id === product.item.id);
        paymentInfo.products[index].item.totalSupply++;
        paymentInfo.products[index].quantity--;
        const cryptocurrencyDecimals = product.item.cryptocurrency.decimals;
        const totalAmount = toWei(currentAmount, cryptocurrencyDecimals).sub(toWei(product.item.price, cryptocurrencyDecimals));
        setPaymentInfo({ ...paymentInfo, ["amount"]: fromWei(totalAmount, cryptocurrencyDecimals) });
    }

    return (
        <Box
            lg={8} md={6} xs={12}
            display="block"
            justifyContent="center"
            alignItems="center"
            margin="10px"
            minHeight="10vh"
            width={`${mock ? '70%' : '100%'} `}
        >
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
                            <List sx={{textTransform: 'capitalize'}} dense={true}>
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
                                                <IconButton disabled={product.item?.totalSupply === 0 || mock} aria-label="plus" onClick={() => addQuantity(product)}>
                                                    <AddRoundedIcon  />
                                                </IconButton>
                                                <IconButton disabled={product.quantity === 1 || mock} aria-label="minus"  onClick={() => removeQuantity(product)}>
                                                    <RemoveRoundedIcon />
                                                </IconButton>
                                            </>
                                            }
                                            <ListItemText secondary={`Quantity: ${product.quantity}`} />
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))}
                            </List>
                            <Divider/>
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
                                        <Grid xs={12} lg={12} item sx={{ m: 0.6  }}>
                                            <FormControl  fullWidth>
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
                                            <FormControl  fullWidth>
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
                                            <FormControl  fullWidth>
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
                                                    {/* {wallets?.map((wallet) => ( */}
                                                    <MenuItem key={1} value={"portugal"}>Portugal</MenuItem>
                                                    {/* ))} */}
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
                    <Button color="primary" variant="contained" onClick={pay} disabled={!isReadyToPay() && !mock}>
                        Pay {paymentInfo?.amount} {paymentInfo?.cryptocurrency?.symbol}
                    </Button>
                </Box>
                <Box sx={{ display: 'center', justifyContent: 'center', p: 1 }}>
                    <Typography color="textSecondary" variant="overline"  >
                        Powered by CrossPay Crypto
                    </Typography>
                </Box>
            </Card>
        </Box>
    );
}

export default PaymentDetails;