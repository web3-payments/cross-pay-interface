
import { DashboardLayout } from '../components/dashboard-layout';
import { useSelector } from 'react-redux';
import LoggedOutPage from './logged-out';
import CustomerBox from '../components/customer/customer-box';

export const Customer = () => {
  const isConnected = useSelector((state) => state.isConnected);
  return (
  <DashboardLayout>
    {isConnected ? (
      <CustomerBox/>
    ):(<LoggedOutPage/>)}
  </DashboardLayout>
  );
};

export default Customer;
