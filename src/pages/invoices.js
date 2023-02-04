import { DashboardLayout } from '../components/dashboard-layout';
import { useSelector } from 'react-redux';
import LoggedOutPage from './logged-out';
import InvoicesBox from '../components/invoice-main/invoice-box/invoice-box';

export const Invoices = () => {
  const isConnected = useSelector((state) => state.isConnected);
  return (
  <DashboardLayout>
    {isConnected ? (<InvoicesBox/>) : (<LoggedOutPage/>)}
  </DashboardLayout>
  );
};

export default Invoices;
