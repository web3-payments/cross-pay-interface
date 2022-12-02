import React from 'react'
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
    List, ListItem,  ListItemAvatar, ListItemText, ListItemSecondaryAction
} from '@mui/material';

const PaymentDetails = ({paymentInfo, mock, setPaymentInfo}) => {
    const USDCtoWei = (num) =>  (num * (10 ** (6))).toString();
    const toWei = (num) => ethers.utils.parseEther(num.toString());
    const fromWei = (num) => ethers.utils.formatEther(num);
    const pay = async () => {
        if(mock){
            return;
        }
        if(isCustomerRequiredInfo && isReadyToPay){
            await updatePaymentInfo().catch(function (error) {
                alert("error here")
                throw error;
            });
        }
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
            let paymentConfirmation;
            console.log(paymentInfo.cryptocurrency)
            if(paymentInfo.cryptocurrency.nativeToken){
                paymentConfirmation = await paymentNativeToken(paymentContract, paymentInfo);
            } else {
                paymentConfirmation = await paymentERC20(paymentContract, paymentInfo, signer);
            }
            
            await callPaymentConfirmation(paymentConfirmation);
            console.log("payment confirmed");
        }
    }

    

async function paymentNativeToken(paymentContract, paymentInfo) {
    const transaction = await paymentContract.pay(paymentInfo.creditAddress, { value: ethers.utils.parseEther(paymentInfo.amount.toString()) }); // use the amount from the paymentInfo
    console.log(`Transaction Hash: ${transaction.hash}`);
    const result = await transaction.wait();
    console.log(result);
    console.log("PAID");
    const paymentConfirmation = {
        transactionHash: transaction.hash,
        blockHash: result.blockHash,
        blockNumber: result.blockNumber,
        gasUsed: result.gasUsed.toString(),
        toAddress: result.to,
        fromAddress: result.from,
        confirmations: result.confirmations
    };
    return paymentConfirmation;
}

async function paymentERC20(paymentContract, paymentInfo, signer) {
    // TODO: Create a util class to handle smart contract operations // paymentExecution 
    const ERC20Contract = new Contract(
        "0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C", //TODO: move to a consts class
        ERC20.abi, 
        signer
    );
    const approvalTransaction = await ERC20Contract.approve("0x294eb269DD01e2700dB044F9fA9bF86dBf71aB45", 
       100000000000000 ); //TODO: move to a consts class
    console.log(`Transaction Hash: ${approvalTransaction.hash}`);
    const approvalResult = await approvalTransaction.wait();
    console.log(approvalResult);
    const transaction = await paymentContract.payUsingToken(paymentInfo.creditAddress, "0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C", USDCtoWei(paymentInfo.amount)); // use the amount from the paymentInfo
    console.log(`Transaction Hash: ${transaction.hash}`);
    const result = await transaction.wait();
    console.log(result);
    console.log("PAID");
    const paymentConfirmation = {
        transactionHash: transaction.hash,
        blockHash: result.blockHash,
        blockNumber: result.blockNumber,
        gasUsed: result.gasUsed.toString(),
        toAddress: result.to,
        fromAddress: result.from,
        confirmations: result.confirmations
    };
    return paymentConfirmation;
}


    const updatePaymentInfo = async () => {
        console.log(paymentInfo);
        await axios
        .patch(`${config.contextRoot}/payment/${paymentInfo.hash}`, paymentInfo)
        .then(function (response) {
          console.log(response);
          if(response.status === 200){
            console.log("Update")
          }
        }).catch(function (error) {
            console.error(error)
            throw error;
        });
    }

    const handleCustomerInfo = (event) => {
        setPaymentInfo({...paymentInfo, ["customerInfo"]: {...paymentInfo.customerInfo, [event.target.name]: event.target.value}})
    }

    const handleCustomerShippingInfo = (event) => {
        if(paymentInfo.customerInfo === undefined){
            paymentInfo.customerInfo = {};
        }
        setPaymentInfo({...paymentInfo, ["customerInfo"]: {...paymentInfo.customerInfo, ["shippingAddress"]:{...paymentInfo.customerInfo.shippingAddress, [event.target.name]: event.target.value}}})
    }

    const callPaymentConfirmation = async (paymentConfirmation) => {
        await axios.post(`${config.contextRoot}/payment/${paymentInfo.hash}/confirmation`, paymentConfirmation);
    }

    const isCustomerRequiredInfo = (customerRequiredInfo) => {
        return customerRequiredInfo?.name || 
            customerRequiredInfo?.email ||
            customerRequiredInfo?.phoneNumber ||
            customerRequiredInfo?.shippingAddress;
    }

    const isReadyToPay = () => {
        if(isCustomerRequiredInfo){
            if(paymentInfo?.customerRequiredInfo?.name && isNotFilled(paymentInfo?.customerInfo?.name)){
                return false;
            }
            if(paymentInfo?.customerRequiredInfo?.email && isNotFilled(paymentInfo?.customerInfo?.email)){
                return false;
            }
            if(paymentInfo?.customerRequiredInfo?.phoneNumber && isNotFilled(paymentInfo?.customerInfo?.phoneNumber)){
                return false;
            }
            if(paymentInfo?.customerRequiredInfo?.shippingAddress 
                    && (isNotFilled(paymentInfo?.customerInfo?.shippingAddress?.country)
                    || isNotFilled(paymentInfo?.customerInfo?.shippingAddress?.address)
                    || isNotFilled(paymentInfo?.customerInfo?.shippingAddress?.city)
                    || isNotFilled(paymentInfo?.customerInfo?.shippingAddress?.zipCode)
                    || isNotFilled(paymentInfo?.customerInfo?.shippingAddress?.state))){
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
        //TODO: this must be changed - when implemented new types of coins
        const totalAmount = toWei(currentAmount).add(toWei(product.item.price));
        console.log(totalAmount);
        setPaymentInfo({...paymentInfo, ["amount"]: fromWei(totalAmount)});
    }
    
    const removeQuantity = (product) => {
        const currentAmount = paymentInfo.amount;
        const index = paymentInfo.products.findIndex(prd => prd.item.id === product.item.id);
        paymentInfo.products[index].item.totalSupply++;
        paymentInfo.products[index].quantity--;
        //TODO: this must be changed - when implemented new types of coins
        const totalAmount = toWei(currentAmount).sub(toWei(product.item.price));
        setPaymentInfo({...paymentInfo, ["amount"]: fromWei(totalAmount)});
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
                <Box sx={{m: 2}} >
                    <Avatar src={`data:image/jpeg;base64,${paymentInfo.user?.image}`} sx={{ height: 84, mb: 2, width: 84 }}/>
                    <Typography sx={{ m: 1 }} color="inherit" variant="h6">
                        {paymentInfo?.user?.companyName}
                    </Typography>
                </Box>
                {/* <CardHeader subheader="Amount Due" title={paymentInfo?.amount + ` ` + paymentInfo?.cryptocurrency?.symbol}/> */}
                <Divider />
                <CardContent>
                    <Grid container spacing={3}>
                        <Grid container sx={{ flex: '1 1 auto' }}>
                        <Grid item xs={12} lg={isCustomerRequiredInfo(paymentInfo?.customerRequiredInfo)? 6 : 12} sx={{ backgroundColor: 'neutral.50', display: 'top', flexDirection: 'column', position: 'relative' }} >
                            <List dense={true}>
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
                                            primary={`${product.item?.name} - ${product.item?.price} ${product.item?.cryptocurrency.symbol}`}
                                            secondary={`${product.quantity}x`}
                                        />
                                        {paymentInfo?.adjustableQuantity && 
                                            <ListItemSecondaryAction>
                                                <IconButton disabled={product.item?.totalSupply === 0} aria-label="plus" onClick={() => addQuantity(product)}>
                                                    <AddRoundedIcon  />
                                                </IconButton>
                                                <IconButton disabled={product.quantity === 1} aria-label="minus"  onClick={() => removeQuantity(product)}>
                                                    <RemoveRoundedIcon />
                                                </IconButton>
                                            </ListItemSecondaryAction>
                                        }
                                    </ListItem>
                                    
                                            
                                ))}
                            </List>
                            <Divider/>
                            {paymentInfo?.amount &&
                                <Grid item xs={12} lg={12} align="right">              
                                    <Typography sx={{ mt: 3, ml: '40%', mr: '5%' }} variant="h6">
                                        {paymentInfo?.amount} {paymentInfo?.cryptocurrency?.symbol}
                                    </Typography>
                                </Grid>
                            }
                        </Grid>
                        {isCustomerRequiredInfo(paymentInfo?.customerRequiredInfo) && 
                        <Grid item xs={12} lg={6} sx={{ backgroundColor: 'neutral.50', display: 'top', flexDirection: 'column', position: 'relative' }} >
                            {(paymentInfo?.customerRequiredInfo.name || paymentInfo?.customerRequiredInfo.email || paymentInfo?.customerRequiredInfo.phoneNumber) &&
                                <Grid container sx={{ m: 1 }}>  
                                    <Grid item xs={12} lg={12}>              
                                    <Typography sx={{ m: 1 }} variant="h6">
                                        Contact Information
                                    </Typography>
                                    </Grid>
                                    {paymentInfo?.customerRequiredInfo.name && 
                                        <Grid xs={12} lg={12} item sx={{ m: 0.3 }}>   
                                            <FormControl  fullWidth>
                                                <TextField
                                                    id="outlined-number"
                                                    label="Name"
                                                    name="name"
                                                    type="text"
                                                    disabled={mock}
                                                    value={paymentInfo?.customerInfo?.name || ''}
                                                    onChange={handleCustomerInfo}
                                                />
                                            </FormControl>
                                        </Grid>
                                    }
                                    {paymentInfo?.customerRequiredInfo.email &&  
                                        <Grid xs={12} lg={12} item sx={{ m: 0.3 }}>   
                                            <FormControl  fullWidth>
                                                <TextField
                                                    id="outlined-number"
                                                    label="Email"
                                                    name="email"
                                                    type="text"
                                                    disabled={mock}
                                                    value={paymentInfo?.customerInfo?.email || ''}
                                                    onChange={handleCustomerInfo}
                                                />
                                            </FormControl>
                                        </Grid>
                                    }
                                    {paymentInfo?.customerRequiredInfo.phoneNumber &&  
                                        <Grid xs={12} lg={12} item sx={{ m: 0.3 }}>   
                                            <FormControl  fullWidth>
                                                <TextField
                                                    id="outlined-number"
                                                    label="Phone number"
                                                    type="text"
                                                    name="phoneNumber"
                                                    disabled={mock}
                                                    value={paymentInfo?.customerInfo?.phoneNumber || ''}
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
                                        <Typography sx={{ m: 1 }} variant="h6">
                                            Shipping Address
                                        </Typography>
                                    </Grid>
                                    <Grid  item lg={12} sx={{ m: 0.3 }}>    
                                        <FormControl fullWidth >
                                            <InputLabel id="select-country-code">Select Country</InputLabel>
                                                <Select
                                                    labelId="select-country-code"
                                                    id="select-country-code"
                                                    name="country"
                                                    label="Country"
                                                    disabled={mock}
                                                    value={paymentInfo?.customerInfo?.shippingAddress?.country || ''}
                                                    onChange={handleCustomerShippingInfo}
                                                >
                                                    {/* {wallets?.map((wallet) => ( */}
                                                    <MenuItem key={1} value={"portugal"}>Portugal</MenuItem>
                                                    {/* ))} */}
                                                </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid xs={12} lg={12} item sx={{ m: 0.3 }}>   
                                        <FormControl fullWidth >
                                        <TextField
                                            id="outlined-number"
                                            label="Address Line 1"
                                            type="text"
                                            name="address"
                                            disabled={mock}
                                            value={paymentInfo?.customerInfo?.shippingAddress?.address || ''}
                                            onChange={handleCustomerShippingInfo}
                                        />
                                        </FormControl>
                                    </Grid>
                                    <Grid item sx={{ m: 0.3 }}>
                                        <TextField
                                            id="outlined-number"
                                            label="City"
                                            type="text"
                                            name="city"
                                            disabled={mock}
                                            value={paymentInfo?.customerInfo?.shippingAddress?.city || ''}
                                            onChange={handleCustomerShippingInfo}
                                        />
                                    </Grid>
                                    <Grid item sx={{ m: 0.3 }}>
                                        <TextField
                                            id="outlined-number"
                                            label="Zip code"
                                            type="text"
                                            name="zipCode"
                                            disabled={mock}
                                            value={paymentInfo?.customerInfo?.shippingAddress?.zipCode || ''}
                                            onChange={handleCustomerShippingInfo}
                                        />
                                    </Grid>
                                    <Grid item sx={{ m: 0.3 }}>
                                        <TextField
                                            id="outlined-number"
                                            label="State"
                                            type="text"
                                            name="state"
                                            disabled={mock}
                                            value={paymentInfo?.customerInfo?.shippingAddress?.state || ''}
                                            onChange={handleCustomerShippingInfo}
                                        />
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
                    <Button color="primary" variant="contained" onClick={pay} disabled={!isReadyToPay()}>
                        Pay {paymentInfo?.amount} {paymentInfo?.cryptocurrency?.symbol}
                    </Button>
                </Box>
                    <Box sx={{ p: 2 }}>
                    <Typography  align="center" color="textSecondary" variant="body2" >
                        Powered by CrossPay Crypto
                    </Typography>
                    </Box>
            </Card>
        </Box>
    );
}

export default PaymentDetails;