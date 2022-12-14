
import { useState } from 'react';
import { Box, Container } from '@mui/material';
import { CustomerListResults } from '../components/customer/customer-list-results';
import { CustomerListToolbar } from '../components/customer/customer-list-toolbar';
import { DashboardLayout } from '../components/dashboard-layout';
import { customers } from '../__mocks__/customers';
import { useSelector } from 'react-redux';
import LoggedOutPage from './logged-out';

export const Customer = () => {
  const isConnected = useSelector((state) => state.isConnected);
  return (
  <DashboardLayout>
    {isConnected ? (
      <Box component="main" sx={{ flexGrow: 1, py: 8}}>
        <Container maxWidth={false}>
          <CustomerListToolbar/>
          <Box sx={{ mt: 3 }}>
            <CustomerListResults customers={customers} />
          </Box>
        </Container>
      </Box>
    ):(<LoggedOutPage/>)}
  </DashboardLayout>
  );
};

export default Customer;
