import * as React from 'react';
import { Box, Button, Grid, Dialog, Card, CardContent, CardHeader, TextField, Divider, MenuItem, Select, FormControl, InputLabel} from '@mui/material';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

const TransactionDetailsDialog = ({setOpen, open, transactionDetails}) => {
  
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
                            subheader="Details"
                            title="Transaction"
                        />
                        <Divider />
                        <CardContent>
                          <Grid container spacing={3}>
                            <Grid item md={12} xs={12}>
                              <TextField
                                fullWidth
                                id="transactionHash"
                                label="Transaction Hash"
                                defaultValue={transactionDetails?.transactionHash}
                                InputProps={{
                                  readOnly: true,
                                }}
                              />
                            </Grid>
                            <Grid item md={12} xs={12}>
                              <TextField
                                fullWidth
                                id="blockHash"
                                label="Block Hash"
                                defaultValue={transactionDetails?.blockHash}
                                InputProps={{
                                  readOnly: true,
                                }}
                              />
                            </Grid>
                            <Grid item md={6} xs={12}>
                              <TextField
                                fullWidth
                                id="blockNumber"
                                label="Block Number"
                                defaultValue={transactionDetails?.blockNumber}
                                InputProps={{
                                  readOnly: true,
                                }}
                              />
                            </Grid>
                            <Grid item md={6} xs={12}>
                              <TextField
                                fullWidth
                                id="gasUsed"
                                label="Gas Used"
                                defaultValue={transactionDetails?.gasUsed}
                                // defaultValue="54433 *convert to ether or the currency that was settled"
                                InputProps={{
                                  readOnly: true,
                                }}
                              />
                            </Grid>
                            <Grid item md={12} xs={12}>
                              <TextField
                                fullWidth
                                id="toAddress"
                                label="Beneficiary"
                                defaultValue={transactionDetails?.toAddress}
                                InputProps={{
                                  readOnly: true,
                                }}
                              />
                            </Grid>
                            <Grid item md={12} xs={12}>
                              <TextField
                                fullWidth
                                id="toAddress"
                                label="From"
                                defaultValue={transactionDetails?.toAddress}
                                InputProps={{
                                  readOnly: true,
                                }}
                              />
                            </Grid>
                            <Grid item md={6} xs={12}>
                              <TextField
                                fullWidth
                                id="executionDate"
                                label="Excution Date"
                                defaultValue={transactionDetails?.executionDate}
                                InputProps={{
                                  readOnly: true,
                                }}
                              />
                            </Grid>
                            <Grid item md={6} xs={12}>
                              <TextField
                                fullWidth
                                id="amount"
                                label="Amount"
                                defaultValue={`${transactionDetails?.amount} ${transactionDetails?.cryptocurrency.symbol}`}
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

export default TransactionDetailsDialog;