import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  SvgIcon, Typography
} from '@mui/material';
import * as React from 'react';
import SearchIcon from '@mui/icons-material/Search';
import PaymentLinkCreation from '../payment-create/payment-link';

export const PaymentListToolbar = ({fetchPayments, triggerAlert }) => {
  const [paymentLinkOpen, setPaymentLinkOpen] = React.useState(false);
  const handleClickOpen = () => {
    setPaymentLinkOpen(true);
  };
  return (
    <Box>
      <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', m: -1 }}>
        <Typography sx={{ m: 1 }} variant="h4">
          Payment Links
        </Typography>
        <Box sx={{ m: 1 }}>
          <Button onClick={handleClickOpen} color="primary" variant="contained">
            Create Payment Link
          </Button>
          <PaymentLinkCreation open={paymentLinkOpen} setOpen={setPaymentLinkOpen} fetchPayments={fetchPayments} triggerAlert={triggerAlert}/>
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
                placeholder="Search payments"
                variant="outlined"
              />
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default PaymentListToolbar;

