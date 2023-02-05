import { useState } from 'react';
import {
    Avatar, Box, Button, Select, Card, CardContent, CardHeader, Checkbox, Grid, MenuItem, InputLabel, TextField,
    FormControl, Divider, IconButton, List, ListItem, ListItemAvatar, ListItemText, ListItemSecondaryAction, FormControlLabel,
    Typography
} from '@mui/material';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import PaymentDetails from '../../payment-page/payment-details';
import { useSelector } from 'react-redux';
import { useQuery } from 'react-query';
import axios from "axios";

const PaymentModal = ({ paymentDetails, setPaymentDetails }) => {
    const userAddress = useSelector((state) => state.address);
    const [wallets, setUserWallets] = useState();
    useQuery(["getUserData"],
        async () =>
            await axios
                .get(`${process.env.REACT_APP_API_BASE_URL}${process.env.REACT_APP_API_CONTEXT_ROOT}/user/${userAddress}/wallet`)
                .then((res) => setUserWallets(res.data)),
        { refetchOnWindowFocus: false }
    );
    const [products, setProducts] = useState([]);
    useQuery(["getProducts"],
        async () =>
          fetchProducts,
        { refetchOnWindowFocus: false }
    );

    const fetchProducts = async() => {
        await axios
                .get(`${process.env.REACT_APP_API_BASE_URL}${process.env.REACT_APP_API_CONTEXT_ROOT}/user/${userAddress}/product`)
                .then((res) => setProducts(res.data))
      }
    const [supportedCryptocurrencies, setSupportedCryptocurrencies] = useState();
    useQuery(["getSupportedCryptos"],
        async () =>
            await axios
                .get(`${process.env.REACT_APP_API_BASE_URL}${process.env.REACT_APP_API_CONTEXT_ROOT}/cryptocurrency`)
                .then((res) => setSupportedCryptocurrencies(res.data)),
        { refetchOnWindowFocus: false }
    );

    const handleChange = (event) => {
        setPaymentDetails({ ...paymentDetails, [event.target.name]: event.target.value });
    };

    const [selectedProduct, setSelectedProduct] = useState();
    const handleProductChange = (event) => {
        setSelectedProduct(event.target.value);
    }

    const [selectedQuantity, setSelectedQuantity] = useState();
    const handleSelectedQuantity = (event) => {
        setSelectedQuantity(event.target.value);
    }

    const [isFlexiPayment, setIsFlexiPayment] = useState(false);
    
    const changePaymentType = () => {
        let  paymentDetailsDefault = paymentDetails;
        paymentDetailsDefault.amount = '';
        paymentDetailsDefault.products = [];
        setPaymentDetails(paymentDetailsDefault);
        fetchProducts();
        setIsFlexiPayment(!isFlexiPayment);
    }

    const addProduct = () => {
        if (selectedQuantity > selectedProduct.totalSupply) {
            alert(`Quantity is greater than ${selectedProduct.name} total supply!`);
            return;
        }
        if (selectedQuantity <= 0) {
            alert(`Invalid quantity`);
            return;
        }
        if (paymentDetails.products.length === 0) {
            paymentDetails.cryptocurrency = selectedProduct.cryptocurrency;
        }
        const product = {
            item: selectedProduct,
            quantity: selectedQuantity
        }
        if (paymentDetails.products.filter((value, index) => value.item.id === selectedProduct.id).length > 0) {
            const index = findPaymentDetailsProductsIndex(selectedProduct.id);
            paymentDetails.products[index].quantity = Number(selectedQuantity) + Number(paymentDetails.products[index].quantity);
            setPaymentDetails({ ...paymentDetails, "products": paymentDetails.products });
        } else {
            setPaymentDetails({ ...paymentDetails, "products": [...paymentDetails.products, product] });
        }
        decreaseSupply(selectedQuantity);
    }

    const removeProduct = (id) => {
        const index = findPaymentDetailsProductsIndex(id);
        increaseSupply(id, paymentDetails.products[index].quantity);
        const products = paymentDetails.products.filter((value, index) => value.item.id !== id)
        if (products.length === 0) {
            paymentDetails.cryptocurrency = undefined;
        }
        setPaymentDetails({ ...paymentDetails, "products": products });
    }

    const increaseSupply = (id, qtd) => {
        const index = findProductIndex(id);
        products[index].totalSupply = Number(products[index].totalSupply) + Number(qtd);
        setProducts(products);
    }

    const decreaseSupply = (qtd) => {
        const index = findProductIndex(selectedProduct.id);
        products[index].totalSupply = Number(products[index].totalSupply) - Number(qtd);
        setProducts(products);
    }

    const findProductIndex = (id) => {
        return products.findIndex(product => product.id === id);
    }

    const findPaymentDetailsProductsIndex = (id) => {
        return paymentDetails.products.findIndex(product => product.item.id === id);
    }

    const handleAdjustableQuantity = (event) => {
        setPaymentDetails({ ...paymentDetails, "adjustableQuantity": event.target.checked });
    }

    const handleRequiredInfo = (event) => {
        setPaymentDetails({ ...paymentDetails, ["customerRequiredInfo"]: { ...paymentDetails.customerRequiredInfo, [event.target.name]: event.target.checked } })
    }

    return (
        <Box component="main" sx={{ display: 'flex', flex: '1 1 auto' }}>
            <Grid container sx={{ flex: '1 1 auto' }}>
                <Grid item xs={12} lg={6} sx={{ backgroundColor: 'neutral.50', display: 'flex', flexDirection: 'column', position: 'relative' }} >
                    <Box>
                        <a href="/">
                            <Avatar src="/static/cpay_wallet_logo.jpg" sx={{ height: 64, mb: 2, width: 64 }} />
                        </a>
                    </Box>
                    <Card sx={{ boxShadow: 'none' }}>
                        <CardHeader
                            subheader="Generated links can be used to obtain online payments easily."
                            title="Create Payment Link"
                        />
                        <Divider />
                        <CardContent>
                            <Grid container spacing={3}>
                                <Grid item md={12} xs={12}>
                                    <FormControl fullWidth >
                                        <InputLabel id="select-payment-type">Payment Type</InputLabel>
                                        <Select
                                            labelId="select-payment-type"
                                            id="select-payment-type"
                                            name="paymentLinkType"
                                            value={isFlexiPayment}
                                            label="Payment Type"
                                            onChange={changePaymentType}
                                        >
                                            <MenuItem key={1} value={true}>Flexi Payment</MenuItem>
                                            <MenuItem key={2} value={false}>Products / Services</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item md={12} xs={12}>
                                    <FormControl fullWidth >
                                        <InputLabel id="select-wallet-address">Credit Wallet</InputLabel>
                                        <Select
                                            labelId="select-wallet-address"
                                            id="select-wallet-address"
                                            name="creditAddress"
                                            value={paymentDetails?.creditAddress || ''}
                                            label="Credit Wallet"
                                            onChange={handleChange}
                                        >
                                            {wallets?.map((wallet) => (
                                                <MenuItem key={wallet.address} value={wallet.address}>{wallet.name}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item md={12} xs={12}>
                                    <FormControl fullWidth >
                                        <TextField
                                            id="paymentDescription"
                                            label="Description"
                                            name="description"
                                            type="text"
                                            value={paymentDetails?.description  || ''}
                                            onChange={handleChange}
                                        />
                                    </FormControl>
                                </Grid>
                                {!isFlexiPayment &&
                                <>
                                    <Grid item md={7} xs={12}>
                                        <FormControl fullWidth >
                                            <InputLabel id="select-product">Product</InputLabel>
                                            <Select
                                                labelId="select-product"
                                                id="select-product"
                                                value={selectedProduct || ''}
                                                label="Product"
                                                onChange={handleProductChange}
                                            >
                                                {paymentDetails.cryptocurrency ?
                                                    products?.filter(prd => prd.cryptocurrency.id === paymentDetails.cryptocurrency.id).map((product) => (
                                                        <MenuItem key={product.id} value={product}>{product.name}</MenuItem>
                                                    )) :
                                                    products?.map((product) => (
                                                        <MenuItem key={product.id} value={product}>{product.name}</MenuItem>
                                                    ))
                                                }
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item md={3} xs={12}>
                                        <TextField
                                            id="outlined-number"
                                            label="Quantity"
                                            type="number"
                                            value={selectedQuantity || ''}
                                            onChange={handleSelectedQuantity}
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                        />
                                    </Grid>
                                    <Grid item md={2} xs={12} sx={{ marginTop: '10px' }}>
                                        <Button color="success" variant="contained" onClick={addProduct}>Add</Button>
                                    </Grid>
                                    <Grid item md={12} xs={12}>
                                        <FormControlLabel
                                            label="Let customer adjust quantity"
                                            control={
                                                <Checkbox
                                                    sx={{ marginLeft: '10px' }}
                                                    onClick={handleAdjustableQuantity}
                                                    value={paymentDetails?.adjustableQuantity | false}
                                                    disabled={paymentDetails.products.length <= 0} />
                                            }
                                        />
                                    </Grid>
                                    <Grid item md={12} xs={12}>
                                        <List dense={true}>
                                            {paymentDetails.products.length > 0 &&
                                                paymentDetails.products.map((product) => (
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
                                                        <ListItemSecondaryAction>
                                                            <IconButton aria-label="delete" onClick={() => removeProduct(product?.item?.id)}>
                                                                <DeleteOutlineOutlinedIcon />
                                                            </IconButton>
                                                        </ListItemSecondaryAction>
                                                    </ListItem>

                                                ))}
                                        </List>
                                    </Grid>
                                </>
                                }
                                <Grid item md={12} xs={12}>
                                    <Typography sx={{ m: 1 }} variant="h6">
                                        Customer Details Required
                                    </Typography>
                                </Grid>
                                <Grid item md={12} xs={12}>
                                    <FormControlLabel control={<Checkbox name="name" onClick={handleRequiredInfo} sx={{ marginLeft: '10px' }} />} label="Name" />
                                    <FormControlLabel control={<Checkbox name="email" onClick={handleRequiredInfo} sx={{ marginLeft: '10px' }} />} label="Email" />
                                    <FormControlLabel control={<Checkbox name="phoneNumber" onClick={handleRequiredInfo} sx={{ marginLeft: '10px' }} />} label="Phone Number" />
                                    <FormControlLabel control={<Checkbox name="shippingAddress" onClick={handleRequiredInfo} sx={{ marginLeft: '10px' }} />} label="Shipping Address" />
                                    <FormControlLabel control={<Checkbox sx={{ marginLeft: '10px' }} onClick={() => alert('not implemented yet.')} />} label="Additional Information" />
                                </Grid>
                                {isFlexiPayment &&
                                <>
                                    <Grid item md={6} xs={12}>
                                        <TextField
                                            disabled={paymentDetails.products.length > 0}
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
                                        <FormControl fullWidth >
                                            <InputLabel required id="select-crypto">Token</InputLabel>
                                                <Select
                                                    labelId="select-crypto"
                                                    id="select-crypto"
                                                    name="cryptocurrency"
                                                    value={paymentDetails?.cryptocurrency || ''}
                                                    label="Crytocurrency"
                                                    onChange={handleChange}
                                                >
                                                    {supportedCryptocurrencies?.map((crypto) => (
                                                        <MenuItem key={crypto.id} value={crypto}>{crypto.symbol}</MenuItem>
                                                    ))}
                                                </Select>
                                        </FormControl>
                                    </Grid>
                                </> 
                                }
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