import * as React from 'react';
import { Box, Button, Grid, Dialog, Card, CardContent, CardHeader, TextField, Divider, MenuItem, Select, FormControl, InputLabel} from '@mui/material';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

const CustomerDetailsDialog = ({setOpen, open, customerInfo}) => {
  
    const handleClose = () => {
      setOpen(false);
    };

    return (
        <div>
          <Dialog open={open} onClose={handleClose} maxWidth="sm">
            <DialogContent>
              
            <Box component="main" sx={{ display: 'flex', flex: '1 1 auto' }}>
                <Grid container sx={{ flex: '1 1 auto' }}>
                    <Card sx={{ boxShadow: 'none' }}>
                        <CardHeader
                            subheader="Information"
                            title="Customer"
                        />
                        <Divider />
                        <CardContent>
                          <Grid container spacing={3}>
                            <Grid item md={12} xs={12}>
                              <TextField
                                fullWidth
                                id="name"
                                label="Name"
                                defaultValue={customerInfo?.name}
                                InputProps={{
                                  readOnly: true,
                                }}
                              />
                            </Grid>
                            <Grid item md={12} xs={12}>
                              <TextField
                                fullWidth
                                id="email"
                                label="Email"
                                defaultValue={customerInfo?.email}
                                InputProps={{
                                  readOnly: true,
                                }}
                              />
                            </Grid>
                            <Grid item md={12} xs={12}>
                              <TextField
                                fullWidth
                                id="phoneNumber"
                                label="Email"
                                defaultValue={customerInfo?.phoneNumber}
                                InputProps={{
                                  readOnly: true,
                                }}
                              />
                            </Grid>
                            <Grid item md={12} xs={12}>
                              <TextField
                                fullWidth
                                id="address"
                                label="Address"
                                defaultValue={customerInfo?.shippingAddress.address}
                                InputProps={{
                                  readOnly: true,
                                }}
                              />
                            </Grid>
                            <Grid item md={6} xs={12}>
                              <TextField
                                fullWidth
                                id="city"
                                label="City"
                                defaultValue={customerInfo?.shippingAddress.city}
                                InputProps={{
                                  readOnly: true,
                                }}
                              />
                            </Grid>
                            <Grid item md={6} xs={12}>
                              <TextField
                                fullWidth
                                id="country"
                                label="Coutry"
                                defaultValue={customerInfo?.shippingAddress.country}
                                InputProps={{
                                  readOnly: true,
                                }}
                              />
                            </Grid>
                            <Grid item md={6} xs={12}>
                              <TextField
                                fullWidth
                                id="state"
                                label="State"
                                defaultValue={customerInfo?.shippingAddress.state}
                                InputProps={{
                                  readOnly: true,
                                }}
                              />
                            </Grid>
                            <Grid item md={6} xs={12}>
                              <TextField
                                fullWidth
                                id="zipCode"
                                label="Zip Code"
                                defaultValue={customerInfo?.shippingAddress.zipCode}
                                InputProps={{
                                  readOnly: true,
                                }}
                              />
                            </Grid>
                          </Grid>
                        </CardContent>
                    </Card>
                  </Grid>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} color="primary" variant="contained">Close</Button>
            </DialogActions>
          </Dialog>
        </div>
      );

};

export default CustomerDetailsDialog;