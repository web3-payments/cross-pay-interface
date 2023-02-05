import { Box, Container } from '@mui/material';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import { useState } from 'react';
//import { config } from "../../../config";
import axios from "axios";
import InvoiceListToolbar from '../invoice-list/invoice-list-toolbar';
import InvoiceListResults from '../invoice-list/invoice-list-results';
import AlertAction from '../../utils/alert-actions/alert-actions';
import LoadingSpinner from '../../utils/loading-spinner/loading-spinner';

export const InvoicesBox = () => {
    const [isLoading, setIsLoading] = useState(false);
    const userAddress = useSelector((state) => state.address);
    const [alert, setAlert] = useState();
    const [alertOpen, setAlertOpen] = useState(false);
    const triggerAlert = (severity, title, message, strongMessage) => {
        setAlertOpen(true);
        setAlert({severity: severity, title: title, message: message, strongMessage: strongMessage});
    }
    const [invoices, setInvoices] = useState();
    useQuery(["getInvoices"], 
      async() => 
        fetchInvoices, 
          { refetchOnWindowFocus: false}
      );

    const fetchInvoices = async() => {
      await axios 
          .get(`${process.env.REACT_APP_API_BASE_URL}${process.env.REACT_APP_API_CONTEXT_ROOT}/invoice/findByUserAddress`, {params: {address: userAddress}})
          .then((res) => setInvoices(res.data))
    }
    return (
        <Box component="main" sx={{ flexGrow: 1, py: 8}}>
          <Container maxWidth="lg" sx={{ flexGrow: 1, py: 4 }}>
            {alertOpen && <AlertAction severity={alert.severity} title={alert.title} message={alert.message} strongMessage={alert.strongMessage} open={alertOpen} setOpen={setAlertOpen} />}
            <InvoiceListToolbar fetchInvoices={fetchInvoices} triggerAlert={triggerAlert}/>
            <Box sx={{ mt: 3 }}>
              {isLoading ? (<LoadingSpinner />) : (
                <InvoiceListResults invoices={invoices}  triggerAlert={triggerAlert}/>
              )}
            </Box>
          </Container>
        </Box>
    );

}

export default InvoicesBox;