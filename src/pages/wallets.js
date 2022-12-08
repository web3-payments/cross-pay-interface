import { DashboardLayout } from '../components/dashboard-layout';
import { useSelector } from 'react-redux';
import LoggedOutPage from './logged-out';
import WalletBox from '../components/wallet/wallet-box';

export const Wallets = () => {
    const isConnected = useSelector((state) => state.isConnected);
    return (
        <DashboardLayout>
            {isConnected ? (
                <WalletBox/>
            ) : (<LoggedOutPage />)}
        </DashboardLayout>
    );
}

export default Wallets;