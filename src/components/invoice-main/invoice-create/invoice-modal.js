import { useState } from 'react';
import {
    Avatar, Box, Button, Select, Card, CardContent, CardHeader, Checkbox, Grid, MenuItem, InputLabel, TextField,
    FormControl, Divider, IconButton, List, ListItem, ListItemAvatar, ListItemText, ListItemSecondaryAction, FormControlLabel,
    Typography, Autocomplete
} from '@mui/material';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import InvoiceDetails from '../../invoice-page/invoice-details';
import { useSelector } from 'react-redux';
import { useQuery } from 'react-query';
//import { config } from "../../../config";
import axios from "axios";

const InvoiceModal = ({ invoiceDetails, setInvoiceDetails }) => {
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
            await axios
                .get(`${process.env.REACT_APP_API_BASE_URL}${process.env.REACT_APP_API_CONTEXT_ROOT}/user/${userAddress}/product`)
                .then((res) => setProducts(res.data)),
        { refetchOnWindowFocus: false }
    );

    const [supportedCryptocurrencies, setSupportedCryptocurrencies] = useState();
    useQuery(["getSupportedCryptos"],
        async () =>
            await axios
                .get(`${process.env.REACT_APP_API_BASE_URL}${process.env.REACT_APP_API_CONTEXT_ROOT}/cryptocurrency`)
                .then((res) => setSupportedCryptocurrencies(res.data)),
        { refetchOnWindowFocus: false }
    );

    const handleChange = (event) => {
        setInvoiceDetails({ ...invoiceDetails, [event.target.name]: event.target.value });
    };

    //Customer
    const [customers, setCustomers] = useState([]);
    useQuery(["getCustomers"],
        async () =>
            await axios
                .get(`${process.env.REACT_APP_API_BASE_URL}${process.env.REACT_APP_API_CONTEXT_ROOT}/user/${userAddress}/customer`)
                .then((res) => setCustomers(res.data)),
        { refetchOnWindowFocus: false }
    );
    const handleCustomersChange = (event, newValue) => {
        setInvoiceDetails({ ...invoiceDetails, "customer": newValue });
    }

    //Product
    const [selectedProduct, setSelectedProduct] = useState();
    const handleProductChange = (event) => {
        setSelectedProduct(event.target.value);
    }

    const [selectedQuantity, setSelectedQuantity] = useState();
    const handleSelectedQuantity = (event) => {
        setSelectedQuantity(event.target.value);
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
        if (invoiceDetails.products.length === 0) {
            invoiceDetails.cryptocurrency = selectedProduct.cryptocurrency;
        }
        const product = {
            item: selectedProduct,
            quantity: selectedQuantity
        }
        if (invoiceDetails.products.filter((value, index) => value.item.id === selectedProduct.id).length > 0) {
            const index = findInvoiceDetailsProductsIndex(selectedProduct.id);
            invoiceDetails.products[index].quantity = Number(selectedQuantity) + Number(invoiceDetails.products[index].quantity);
            setInvoiceDetails({ ...invoiceDetails, "products": invoiceDetails.products });
        } else {
            setInvoiceDetails({ ...invoiceDetails, "products": [...invoiceDetails.products, product] });
        }
        decreaseSupply(selectedQuantity);
    }

    const removeProduct = (id) => {
        const index = findInvoiceDetailsProductsIndex(id);
        increaseSupply(id, invoiceDetails.products[index].quantity);
        const products = invoiceDetails.products.filter((value, index) => value.item.id !== id)
        if (products.length === 0) {
            invoiceDetails.cryptocurrency = undefined;
        }
        setInvoiceDetails({ ...invoiceDetails, "products": products });
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

    const findInvoiceDetailsProductsIndex = (id) => {
        return invoiceDetails.products.findIndex(product => product.item.id === id);
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
                            subheader="Generated invoices can be issued to multiple customers for payment collection."
                            title="Create an Invoice"
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
                                            value={invoiceDetails?.creditAddress || ''}
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
                                    <Autocomplete
                                        id="select-customer"
                                        name="customer"
                                        options={customers}
                                        getOptionLabel={(option) => option.name}
                                        //value={invoiceDetails?.selectedCustomers}
                                        onChange={handleCustomersChange}
                                        renderInput={(params) => (
                                            <TextField {...params} label="Customer" placeholder="Customer" />
                                        )}
                                    />
                                </Grid>
                                <Grid item md={12} xs={12}>
                                    <FormControl fullWidth >
                                        <TextField
                                            id="invoiceMemo"
                                            label="Memo"
                                            name="memo"
                                            type="text"
                                            value={invoiceDetails?.memo  || ''}
                                            onChange={handleChange}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item md={12} xs={12}>
                                    <FormControl fullWidth >
                                        <TextField
                                            id="dueDate"
                                            label="Due Date"
                                            type="date"
                                            name="dueDate"
                                            onChange={handleChange}
                                            sx={{ width: 220 }}
                                            InputLabelProps={{
                                            shrink: true,
                                            }}
                                        />
                                    </FormControl>
                                </Grid>
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
                                            {invoiceDetails.cryptocurrency ?
                                                products?.filter(prd => prd.cryptocurrency.id === invoiceDetails.cryptocurrency.id).map((product) => (
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
                                




                                
                                {invoiceDetails.products.length > 0 &&
                                <>
                                <Grid item md={12} xs={12}>
                                    <Typography sx={{ m: 1 }} variant="h6">
                                        Items
                                    </Typography>
                                </Grid>
                                </> 
                                }
                                <Grid item md={12} xs={12}>
                                    <List dense={true}>
                                        {invoiceDetails.products.length > 0 &&
                                            invoiceDetails.products.map((product) => (
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
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
                {/* Right page, invoice details */}
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
                    <InvoiceDetails invoiceInfo={invoiceDetails} mock={true} />
                </Grid>
            </Grid>
        </Box>
    );
};

export default InvoiceModal;