import { useState } from 'react';
import { Avatar , Box, Button, Select, Card, CardContent, CardHeader, Grid, MenuItem , InputLabel, TextField, FormControl, Divider, IconButton, List, ListItem,  ListItemAvatar, ListItemText, ListItemSecondaryAction } from '@mui/material';
import { Logo } from '../../logo';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import PaymentDetails from '../../payment/PaymentDetails';
import { useSelector } from 'react-redux';
import { useQuery } from 'react-query';
import { config } from "../../../config";
import axios from "axios";

const PaymentModal = ({ paymentDetails, setPaymentDetails }) => {
    const userAddress = useSelector((state) => state.address);
    const [wallets, setUserWallets] = useState();
    useQuery(["getUserData"],
        async () =>
            await axios
                .get(`${config.contextRoot}/user/${userAddress}/wallet`)
                .then((res) => setUserWallets(res.data)),
        { refetchOnWindowFocus: false }
    );

    const handleChange = (event) => {
        setPaymentDetails({ ...paymentDetails, [event.target.name]: event.target.value });
    };

    return (
        <Box component="main" sx={{ display: 'flex', flex: '1 1 auto' }}>
            <Grid container sx={{ flex: '1 1 auto' }}>
                <Grid item xs={12} lg={6} sx={{ backgroundColor: 'neutral.50', display: 'flex', flexDirection: 'column', position: 'relative' }} >
                    <Box>
                        <a href="/">
                            <Logo sx={{ height: 42, width: 42 }}
                            />
                        </a>
                    </Box>
                    <Card sx={{ boxShadow: 'none' }}>
                        <CardHeader
                            subheader="Provide the information to generate the link"
                            title="Payment Creation"
                        />
                        <Divider />
                        <CardContent>
                            <Grid container spacing={3}>
                                <Grid item md={12} xs={12}>
                                    <FormControl fullWidth >
                                        <InputLabel id="select-wallet-address">Credit Wallet</InputLabel>
                                            <Select
                                                labelId="select-wallet-address"
                                                id="select-wallet-address"
                                                name="creditAddress"
                                                value={paymentDetails?.creditAddress || ''}
                                                label="Age"
                                                onChange={handleChange}
                                            >
                                                {wallets?.map((wallet) => (
                                                    <MenuItem key={wallet.address} value={wallet.address}>{wallet.name}</MenuItem>
                                                ))}
                                            </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item md={6} xs={12}>
                                    <TextField
                                        fullWidth
                                        helperText="Please specify the company name"
                                        label="Company name"
                                        name="companyName"
                                        onChange={handleChange}
                                        required
                                        value={paymentDetails?.companyName || ''}
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item md={6} xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Title"
                                        name="title"
                                        onChange={handleChange}
                                        required
                                        value={paymentDetails?.title || ''}
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item md={7} xs={12}>
                                    <FormControl fullWidth >
                                        <InputLabel id="select-product">Product</InputLabel>
                                            <Select
                                                labelId="select-product"
                                                id="select-product"
                                                name="creditAddress"
                                                value={paymentDetails?.creditAddress || ''}
                                                label="Age"
                                                onChange={handleChange}
                                            >
                                                {wallets?.map((wallet) => (
                                                    <MenuItem key={wallet.address} value={wallet.address}>{wallet.name}</MenuItem>
                                                ))}
                                            </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item md={3} xs={12}>
                                    <TextField
                                        id="outlined-number"
                                        label="Quantity"
                                        type="number"
                                        InputLabelProps={{
                                          shrink: true,
                                        }}
                                    />
                                </Grid>
                                <Grid item md={2} xs={12} sx={{ marginTop: '10px'}}>
                                    <Button color="primary" variant="contained">Add</Button>
                                </Grid>
                                <Grid item md={12} xs={12}>
                                    <List dense={true}>
                                        <ListItem button>
                                            <ListItemAvatar>
                                                <Avatar
                                                    alt="Product"
                                                    src="/static/images/products/product_2.png"
                                                    variant="square"
                                                />
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary="Car - 10 SOL"
                                                secondary={"2x"}
                                            />
                                            <ListItemSecondaryAction>
                                            <IconButton aria-label="delete">
                                                <DeleteOutlineOutlinedIcon />
                                            </IconButton>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                        
                                        <ListItem button>
                                            <ListItemAvatar>
                                                <Avatar
                                                    alt="Product"
                                                    src="/static/images/products/product_3.png"
                                                    variant="square"
                                                />
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary="Book - 1 SOL"
                                                secondary={"2x"}
                                            />
                                            <ListItemSecondaryAction>
                                            <IconButton aria-label="delete">
                                                <DeleteOutlineOutlinedIcon />
                                            </IconButton>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                        <ListItem button>
                                            <ListItemAvatar>
                                                <Avatar
                                                    alt="Product"
                                                    src="/static/images/products/product_4.png"
                                                    variant="square"
                                                />
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary="Car - 10 SOL"
                                                secondary={"2x"}
                                            />
                                            <ListItemSecondaryAction>
                                            <IconButton aria-label="delete">
                                                <DeleteOutlineOutlinedIcon />
                                            </IconButton>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                        
                                        <ListItem button>
                                            <ListItemAvatar>
                                                <Avatar
                                                    alt="Product"
                                                    src="/static/images/products/product_1.png"
                                                    variant="square"
                                                />
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary="Book - 1 SOL"
                                                secondary={"2x"}
                                            />
                                            <ListItemSecondaryAction>
                                            <IconButton aria-label="delete">
                                                <DeleteOutlineOutlinedIcon />
                                            </IconButton>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                        
                                    </List>
                                </Grid>
                                <Grid item md={6} xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Amount"
                                        name="amount"
                                        onChange={handleChange}
                                        type="number"
                                        value={paymentDetails?.amount || ''}
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item md={6} xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Currency"
                                        name="currency"
                                        onChange={handleChange}
                                        value={paymentDetails?.currency || ''}
                                        variant="outlined"
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
                {/* Right page, payment details */}
                <Grid item xs={12} lg={6}
                    sx={{
                        alignItems: 'center',
                        background: 'radial-gradient(100% 100% at 100% 100%, #122647 80%, #090E23 100%)',
                        color: 'white',
                        display: 'flex',
                        borderRadius: '8px',
                        justifyContent: 'center',
                        '& img': {
                            maxWidth: '100%'
                        }
                    }} >
                    <PaymentDetails paymentInfo={paymentDetails} mock={true} />
                </Grid>
            </Grid>
        </Box>
    );
};

export default PaymentModal;