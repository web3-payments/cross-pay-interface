
import { Box, Container } from '@mui/material';
import { PaymentListResults } from '../components/payment-main/payment-list/payment-list-results';
import { PaymentListToolbar } from '../components/payment-main/payment-list/payment-list-toolbar';
import { DashboardLayout } from '../components/dashboard-layout';
import { useSelector } from 'react-redux';
import { useQuery } from 'react-query';
import { useState } from 'react';
import { config } from "../config";
import axios from "axios";
import LoggedOutPage from './logged-out';

export const Payments = () => {
  const isConnected = useSelector((state) => state.isConnected);
  const userAddress = useSelector((state) => state.address);
  const [payments, setPayments] = useState();
  useQuery(["getPayments"], 
    async() => 
      await axios 
        .get(`${config.contextRoot}/payment/findByUserAddress`, {params: {address: userAddress}})
        .then((res) => setPayments(res.data)), 
        { refetchOnWindowFocus: false}
    );
  return (
  <DashboardLayout>
    {isConnected ? (
      <Box component="main" sx={{ flexGrow: 1, py: 8}}>
        <Container maxWidth="lg" sx={{ flexGrow: 1, py: 4 }}>
          <PaymentListToolbar/>
          <Box sx={{ mt: 3 }}>
            <PaymentListResults payments={payments} />
          </Box>
        </Container>
      </Box>
    ):(<LoggedOutPage/>)}
  </DashboardLayout>
  );
};

export default Payments;
