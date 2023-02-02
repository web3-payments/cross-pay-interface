import { Box, Grid, Card, CardContent, CardHeader, TextField, Divider, MenuItem, Select, FormControl, InputLabel} from '@mui/material';
import FileUpload from 'react-material-file-upload';
import { useState } from 'react';
import { useQuery } from 'react-query';
import axios from "axios";

const ProductModal = ({ productDetails, setProductDetails, file, setFile }) => {

    const handleChange = (event) => {
        setProductDetails({ ...productDetails, [event.target.name]: event.target.value });
    };

    const [supportedCryptocurrencies, setSupportedCryptocurrencies] = useState();

    useQuery(["getSupportedCryptos"],
        async () =>
            await axios
                .get(`${process.env.REACT_APP_API_BASE_URL}${process.env.REACT_APP_API_CONTEXT_ROOT}/cryptocurrency`)
                .then((res) => setSupportedCryptocurrencies(res.data)),
        { refetchOnWindowFocus: false }
    );

    return (
        <Box component="main" sx={{ display: 'flex', flex: '1 1 auto' }}>
            <Grid container sx={{ flex: '1 1 auto' }}>
                <Card sx={{ boxShadow: 'none' }}>
                    <CardHeader
                        subheader="Product details"
                        title="Product Creation"
                    />
                    <Divider />
                    <CardContent>
                        <Grid container spacing={3}>
                            <Grid item md={9} xs={12}>
                                <TextField
                                    fullWidth
                                    label="Name"
                                    name="name"
                                    onChange={handleChange}
                                    required
                                    value={productDetails?.name || ''}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item md={3} xs={12}>
                                <TextField
                                    id="outlined-number"
                                    label="Total Supply"
                                    name="totalSupply"
                                    value={productDetails?.totalSupply || ''}
                                    onChange={handleChange}
                                    min="0"
                                    required
                                    type="number"
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid>
                            <Grid item md={12} xs={12}>
                                <TextField
                                    fullWidth
                                    label="Description"
                                    name="description"
                                    onChange={handleChange}
                                    value={productDetails?.description || ''}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item md={12} xs={12}>
                                <FileUpload value={file} onChange={setFile} maxSize="2000000"/>
                            </Grid>
                            <Grid item md={8} xs={12}>
                                <TextField
                                    fullWidth
                                    label="Price"
                                    name="price"
                                    onChange={handleChange}
                                    type="number"
                                    required
                                    value={productDetails?.price || ''}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item md={4} xs={12}>
                                <FormControl fullWidth >
                                        <InputLabel required id="select-crypto">Token</InputLabel>
                                            <Select
                                                labelId="select-crypto"
                                                id="select-crypto"
                                                name="cryptocurrency"
                                                value={productDetails?.cryptocurrency || ''}
                                                label="Crytocurrency"
                                                onChange={handleChange}
                                            >
                                                {supportedCryptocurrencies?.map((crypto) => (
                                                    <MenuItem key={crypto.id} value={crypto}>{crypto.symbol}</MenuItem>
                                                ))}
                                            </Select>
                                    </FormControl>
                            </Grid>
                        </Grid>
                    </CardContent>
                    <Divider />
                </Card>
            </Grid>
        </Box>
    )

};

export default ProductModal;