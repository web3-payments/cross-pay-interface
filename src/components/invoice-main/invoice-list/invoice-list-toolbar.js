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
import InvoiceCreation from '../invoice-create/invoice';

export const InvoiceListToolbar = ({fetchInvoices, triggerAlert }) => {
  const [invoiceOpen, setInvoiceOpen] = React.useState(false);
  const handleClickOpen = () => {
    setInvoiceOpen(true);
  };
  return (
    <Box>
      <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', m: -1 }}>
        <Typography sx={{ m: 1 }} variant="h4">
          Invoices
        </Typography>
        <Box sx={{ m: 1 }}>
          <Button onClick={handleClickOpen} color="primary" variant="contained">
            Create Invoice
          </Button>
          <InvoiceCreation open={invoiceOpen} setOpen={setInvoiceOpen} fetchInvoices={fetchInvoices} triggerAlert={triggerAlert}/>
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
                placeholder="Search invoices"
                variant="outlined"
              />
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default InvoiceListToolbar;

