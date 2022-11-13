import React from 'react'
import { Contract, ethers } from "ethers";
import * as PaymentContract from "../../abis/payment/PaymentContract.json";
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
    IconButton, TextField,
    List, ListItem,  ListItemAvatar, ListItemText, ListItemSecondaryAction
} from '@mui/material';

const PaymentDetails = ({paymentInfo, mock}) => {
    const pay = async () => {
        if(mock){
            return;
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
                "0x43105B041E6061A592A9763Af56447a51709932A", //TODO: move to a consts class
                PaymentContract.abi, 
                signer
              );
            console.log(paymentContract);
            console.log(paymentInfo.creditAddress);
            const transaction = await paymentContract.pay(paymentInfo.creditAddress, {value: ethers.utils.parseEther(paymentInfo.amount.toString())}); // use the amount from the paymentInfo
            console.log(`Transaction Hash: ${transaction.hash}`)
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

            }
            await callPaymentConfirmation(paymentConfirmation);
            console.log("payment confirmed");
        }
    }

    const callPaymentConfirmation = async (paymentConfirmation) => {
        await axios.post(`${config.contextRoot}/payment/${paymentInfo.hash}/confirmation`, paymentConfirmation);
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
                <CardHeader subheader="Amount Due" title={paymentInfo?.amount + ` ` + paymentInfo?.currency}/>
                <Divider />
                <CardContent>
                    <Grid container spacing={3}>
                        <Grid item md={12} xs={24}>
                            <Typography color="inherit" variant="h5">
                                {paymentInfo?.companyName}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} lg={12}>
                            {paymentInfo?.customerRequiredInfo && (paymentInfo?.customerRequiredInfo.name || paymentInfo?.customerRequiredInfo.email || paymentInfo?.customerRequiredInfo.phoneNumber) &&
                                <Grid container xs={24} lg={12}>  
                                    <Grid item xs={24} lg={12}>              
                                    <Typography sx={{ m: 1 }} variant="h6">
                                        Contact Information
                                    </Typography>
                                    </Grid>
                                    {paymentInfo?.customerRequiredInfo.name && 
                                    
                                    <Grid item md={12} xs={12}>
                                        <TextField
                                            id="outlined-number"
                                            label="Name"
                                            type="text"
                                            value={''}
                                            // onChange={handleSelectedQuantity}
                                        />
                                    </Grid>
                                    }
                                    {paymentInfo?.customerRequiredInfo.email && 
                                    
                                    <Grid item md={12} xs={12}>
                                        <TextField
                                            id="outlined-number"
                                            label="Email"
                                            type="text"
                                            value={''}
                                            // onChange={handleSelectedQuantity}
                                        />
                                    </Grid>
                                    }
                                    {paymentInfo?.customerRequiredInfo.phoneNumber && 
                                    
                                    
                                    <Grid item md={12} xs={12}>
                                        <TextField
                                            id="outlined-number"
                                            label="Phone number"
                                            type="text"
                                            value={''}
                                            // onChange={handleSelectedQuantity}
                                        />
                                    </Grid>
                                    }
                                </Grid>
                            }
                        </Grid>
                        <Grid item md={12} xs={12}>
                            <List dense={true}>
                                {paymentInfo?.products.length > 0 && 
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
                                            primary={`${product.item?.name} - ${product.item?.price} ${product.item?.token}`}
                                            secondary={`${product.quantity}x`}
                                        />
                                        {paymentInfo?.adjustableQuantity && 
                                            <ListItemSecondaryAction>
                                                <IconButton aria-label="plus" >
                                                    <AddRoundedIcon />
                                                </IconButton>
                                                <IconButton aria-label="minus" >
                                                    <RemoveRoundedIcon />
                                                </IconButton>
                                            </ListItemSecondaryAction>
                                        }
                                    </ListItem>
                                    

                                ))}
                            </List>
                        </Grid>
                    </Grid>
                </CardContent>
                <Divider />
                <Box sx={{ display: 'center', justifyContent: 'center', p: 2 }}>
                    <Button color="primary" variant="contained" onClick={pay}>
                        Pay {paymentInfo?.amount} {paymentInfo?.currency}
                    </Button>
                </Box>
            </Card>
        </Box>
    );
}

export default PaymentDetails;