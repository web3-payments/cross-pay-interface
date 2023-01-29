import { Box, Container, Grid, Typography } from '@mui/material';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import axios from "axios";
import AlertAction from '../utils/alert-actions/alert-actions';
import WalletListToolbar from './wallet-list-toolbar';
import WalletListResults from './wallet-list-results';

export const WalletBox = () => {
  const userAddress = useSelector((state) => state.address);
  const [alert, setAlert] = useState();
  const [alertOpen, setAlertOpen] = useState(false);
  const triggerAlert = (severity, title, message, strongMessage) => {
    setAlertOpen(true);
    setAlert({ severity: severity, title: title, message: message, strongMessage: strongMessage });
  }
  const [wallets, setUserWallets] = useState();
  useQuery(["getUserWallets"],
    async () =>
    fetchUserWallets,
    { refetchOnWindowFocus: false }
  );

  const fetchUserWallets = async () => {
    await axios 
      .get(`${process.env.REACT_APP_API_BASE_URL}${process.env.REACT_APP_API_CONTEXT_ROOT}/user/${userAddress}/wallet`)
      .then((res) => setUserWallets(res.data));
  }

  return (
    <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
      <Container maxWidth="lg" sx={{ flexGrow: 1, py: 4 }}>
        {alertOpen && <AlertAction severity={alert.severity} title={alert.title} message={alert.message} strongMessage={alert.strongMessage} open={alertOpen} setOpen={setAlertOpen} />}
        <WalletListToolbar />
        <Box sx={{ mt: 3 }}>
          <WalletListResults wallets={wallets} />
        </Box>
      </Container>
    </Box>
  );

}

export default WalletBox;