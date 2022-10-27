import { WalletListToolbar } from '../components/wallet/wallet-list-toolbar';
import { WalletListResults } from '../components/wallet/wallet-list-results';
import { customers } from '../__mocks__/customers';
import { Box, Container, Grid, Typography } from '@mui/material';
import { DashboardLayout } from '../components/dashboard-layout';
import { useSelector } from 'react-redux';
import { useQuery } from 'react-query';
import { useState } from 'react';
import LoggedOutPage from './logged-out';
import { config } from "../config";
import axios from "axios";

export const Wallets = () => {
    const isConnected = useSelector((state) => state.isConnected);
    const userAddress = useSelector((state) => state.address);
    const [userData, setUserData] = useState();
    useQuery(["getUserData"], 
      async() => 
        await axios 
          .get(`${config.contextRoot}/user/${userAddress}`)
          .then((res) => setUserData(res.data)), 
          { refetchOnWindowFocus: false}
      );
  
    return (
        <DashboardLayout>
            {isConnected ? (
                <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
                    <Container maxWidth="lg" sx={{ flexGrow: 1, py: 4 }}>
                        <WalletListToolbar />
                        <Box sx={{ mt: 3 }}>
                            <WalletListResults customers={customers} />
                        </Box>
                    </Container>
                </Box>
            ) : (<LoggedOutPage />)}
        </DashboardLayout>
    );
}

export default Wallets;