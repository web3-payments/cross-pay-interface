import { Box, Container } from '@mui/material';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import axios from "axios";
import PaymentListToolbar from '../payment-list/payment-list-toolbar';
import PaymentListResults from '../payment-list/payment-list-results';
import AlertAction from '../../utils/alert-actions/alert-actions';
import LoadingSpinner from '../../utils/loading-spinner/loading-spinner';

export const PaymentsBox = () => {
    const [isLoading, setIsLoading] = useState(false);
    const userAddress = useSelector((state) => state.address);
    const [alert, setAlert] = useState();
    const [alertOpen, setAlertOpen] = useState(false);
    const triggerAlert = (severity, title, message, strongMessage) => {
        setAlertOpen(true);
        setAlert({severity: severity, title: title, message: message, strongMessage: strongMessage});
    }
    const [payments, setPayments] = useState();
    useQuery(["getPayments"], 
      async() => 
        fetchPayments, 
          { refetchOnWindowFocus: false}
      );

    const fetchPayments = async() => {
      setIsLoading(true);
      await axios 
          .get(`${process.env.REACT_APP_API_BASE_URL}${process.env.REACT_APP_API_CONTEXT_ROOT}/payment/findByUserAddress`, {params: {address: userAddress}})
          .then((res) => setPayments(res.data))
      setIsLoading(false);
    }

    return (
        <Box component="main" sx={{ flexGrow: 1, py: 8}}>
          <Container maxWidth="lg" sx={{ flexGrow: 1, py: 4 }}>
            {alertOpen && <AlertAction severity={alert.severity} title={alert.title} message={alert.message} strongMessage={alert.strongMessage} open={alertOpen} setOpen={setAlertOpen} />}
            <PaymentListToolbar fetchPayments={fetchPayments} triggerAlert={triggerAlert}/>
            <Box sx={{ mt: 3 }}>
              {isLoading ? (<LoadingSpinner />) : (
              <PaymentListResults payments={payments} triggerAlert={triggerAlert}/>
              )}
            </Box>
          </Container>
        </Box>
    );

}

export default PaymentsBox;