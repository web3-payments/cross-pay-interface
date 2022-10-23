
import { Box, Container } from '@mui/material';
import { PaymentListResults } from '../components/payment-main/payment-list/payment-list-results';
import { PaymentListToolbar } from '../components/payment-main/payment-list/payment-list-toolbar';
import { DashboardLayout } from '../components/dashboard-layout';
import { customers } from '../__mocks__/customers'; //TODO: CREATE MOCK PAYMENTS
import { useSelector } from 'react-redux';
import LoggedOutPage from './logged-out';

export const Payments = () => {
  const isConnected = useSelector((state) => state.isConnected);
  return (
  <DashboardLayout>
    {isConnected ? (
      <Box component="main" sx={{ flexGrow: 1, py: 8}}>
        <Container maxWidth={false}>
          <PaymentListToolbar/>
          <Box sx={{ mt: 3 }}>
            <PaymentListResults customers={customers} />
          </Box>
        </Container>
      </Box>
    ):(<LoggedOutPage/>)}
  </DashboardLayout>
  );
};

export default Payments;
