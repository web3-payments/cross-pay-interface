import { Box, Container } from '@mui/material';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import { config } from "../../../config";
import axios from "axios";
import PaymentListToolbar from '../payment-list/payment-list-toolbar';
import PaymentListResults from '../payment-list/payment-list-results';
import AlertAction from '../../utils/alert-actions/alert-actions';

export const PaymentsBox = () => {
    const userAddress = useSelector((state) => state.address);
    const [isLoading, setIsLoading] = useState(false);
    const [alert, setAlert] = useState();
    const [alertOpen, setAlertOpen] = useState(true);
    const [payments, setPayments] = useState();
    useQuery(["getPayments"], 
      async() => 
        await axios 
          .get(`${config.contextRoot}/payment/findByUserAddress`, {params: {address: userAddress}})
          .then((res) => setPayments(res.data)), 
          { refetchOnWindowFocus: false}
      );
    return (
        <Box component="main" sx={{ flexGrow: 1, py: 8}}>
          <Container maxWidth="lg" sx={{ flexGrow: 1, py: 4 }}>
            <AlertAction severity="error" title="title" message="message" strongMessage="addtional" open={alertOpen} setOpen={setAlertOpen} />
            <PaymentListToolbar />
            <Box sx={{ mt: 3 }}>
              <PaymentListResults payments={payments} />
            </Box>
          </Container>
        </Box>
    );

}

export default PaymentsBox;