import { DashboardLayout } from '../components/dashboard-layout';
import LoggedOutPage from './logged-out';
import TransactionsBox from '../components/transaction/transactionsBox';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router';

export const Transactions = (props) => {
  const isConnected = useSelector((state) => state.isConnected);
  const { paymentHash } = useParams();
  return (
  <DashboardLayout>
    {isConnected ? (
      <TransactionsBox paymentHash={paymentHash}/>
    ):(<LoggedOutPage/>)}
  </DashboardLayout>
  );
};

export default Transactions;
