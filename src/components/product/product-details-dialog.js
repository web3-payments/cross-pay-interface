import * as React from 'react';
import { Avatar, Box, Button, Grid, FormControl, Dialog, Card, CardContent, CardHeader, Divider, List, ListItemSecondaryAction, ListItem, ListItemAvatar, ListItemText} from '@mui/material';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

const ProductDetailsDialog = ({setOpen, open, productDetails}) => {
  
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
                            title="Products"
                        />
                        <Divider />
                        <CardContent>
                            <Grid container spacing={3}>
                                <Grid container sx={{ flex: '1 1 auto' }}>
                                    <Grid item  xs={12} lg={12} sx={{ width: 500, px: 2 }} >
                                        <List sx={{textTransform: 'capitalize'}} dense={true}>
                                            {productDetails?.map((product) => (
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
                                                        <ListItemText secondary={`Quantity: ${product.quantity}`} />
                                                    </ListItemSecondaryAction>
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Grid>
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

export default ProductDetailsDialog;