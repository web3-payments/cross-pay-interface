import { DashboardLayout } from '../components/dashboard-layout';
import { useSelector } from 'react-redux';
import LoggedOutPage from './logged-out';
import PaymentsBox from '../components/payment-main/payment-box/payment-box';

export const Payments = () => {
  const isConnected = useSelector((state) => state.isConnected);
  return (
  <DashboardLayout>
    {isConnected ? (<PaymentsBox/>) : (<LoggedOutPage/>)}
  </DashboardLayout>
  );
};

export default Payments;
