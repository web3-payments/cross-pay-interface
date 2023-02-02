import { Box, Grid, Card, CardContent, CardHeader, TextField, Divider, MenuItem, Select, FormControl, InputLabel} from '@mui/material';
import { useQuery } from 'react-query';
import axios from "axios";

const CustomerModal = ({ customerDetails, setCustomerDetails}) => {

    const handleChange = (event) => {
        setCustomerDetails({ ...customerDetails, [event.target.name]: event.target.value });
    };

    const handleCustomerShippingInfo = (event) => {
        setCustomerDetails({ ...customerDetails, ["shippingAddress"]: { ...customerDetails.shippingAddress, [event.target.name]: event.target.value } })
    }

    return (
        <Box component="main" sx={{ display: 'flex', flex: '1 1 auto' }}>
            <Grid container sx={{ flex: '1 1 auto' }}>
                <Card sx={{ boxShadow: 'none' }}>
                    <CardHeader
                        subheader="Customer details"
                        title="Customer Creation"
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
                                    value={customerDetails?.name || ''}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item md={9} xs={12}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    name="email"
                                    onChange={handleChange}
                                    required
                                    value={customerDetails?.email || ''}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item md={9} xs={12}>
                                <TextField
                                    fullWidth
                                    label="Phone Number"
                                    name="phoneNumber"
                                    onChange={handleChange}
                                    required
                                    value={customerDetails?.phoneNumber || ''}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid xs={12} lg={12} item sx={{ m: 0.6 }}>
                                <FormControl fullWidth >
                                    <InputLabel id="select-country-code">Select Country</InputLabel>
                                    <Select
                                        labelId="select-country-code"
                                        id="select-country-code"
                                        name="country"
                                        label="Country"
                                        value={customerDetails?.shippingAddress?.country || ''}
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
                                        value={customerDetails?.shippingAddress?.address || ''}
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
                                        value={customerDetails?.shippingAddress?.city || ''}
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
                                        value={customerDetails?.shippingAddress?.zipCode || ''}
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
                                        value={customerDetails?.shippingAddress?.state || ''}
                                        onChange={handleCustomerShippingInfo}
                                    />
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

export default CustomerModal;