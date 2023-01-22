import * as React from 'react';
import { Box, Button, Card, CardContent, TextField, InputAdornment, SvgIcon, Typography } from '@mui/material';
import { Search as SearchIcon } from '../../icons/search';
import CustomerCreation from './customer-creation';

export const CustomerListToolbar = ({fetchCustomers, triggerAlert}) => {
  const [customerCreationOpen, setCustomerCreationOpen] = React.useState(false);
  const handleClickOpen = () => {
    setCustomerCreationOpen(true);
  };
  return (
    <>
    <Box>
      <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', m: -1 }}>
        <Typography sx={{ m: 1 }} variant="h4">
          Customer
        </Typography>
        <Box sx={{ m: 1 }}>
          <Button onClick={handleClickOpen} color="primary" variant="contained" >
            Create Customer
          </Button>
          <CustomerCreation open={customerCreationOpen} setOpen={setCustomerCreationOpen}  fetchCustomers={fetchCustomers} triggerAlert={triggerAlert}/>
        </Box>
      </Box>
      <Box sx={{ mt: 3 }}>
        <Card>
          <CardContent>
            <Box sx={{ maxWidth: 500 }}>
              <TextField
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SvgIcon
                        color="action"
                        fontSize="small"
                      >
                        <SearchIcon />
                      </SvgIcon>
                    </InputAdornment>
                  )
                }}
                placeholder="Search customers"
                variant="outlined"
              />
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  </>
);
};

export default CustomerListToolbar;

