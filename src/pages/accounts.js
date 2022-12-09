
import { DashboardLayout } from '../components/dashboard-layout';
import { useSelector } from 'react-redux';
import LoggedOutPage from './logged-out';
import AccountBox from '../components/account/account-box';

export const Accounts = () => {
  const isConnected = useSelector((state) => state.isConnected);
  return (
    <DashboardLayout>
    {isConnected ? (
      <AccountBox/>
      ):(<LoggedOutPage/>)}
    </DashboardLayout>
  );
};

export default Accounts;
