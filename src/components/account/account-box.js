import { Box, Container, Grid, Typography } from '@mui/material';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import axios from "axios";
import AlertAction from '../utils/alert-actions/alert-actions';
import { AccountProfile } from './account-profile';
import { AccountProfileDetails } from './account-profile-details';

export const AccountBox = () => {
  const userAddress = useSelector((state) => state.address);
  const [alert, setAlert] = useState();
  const [alertOpen, setAlertOpen] = useState(false);
  const triggerAlert = (severity, title, message, strongMessage) => {
      setAlertOpen(true);
      setAlert({severity: severity, title: title, message: message, strongMessage: strongMessage});
  }
  const [userData, setUserData] = useState();
  useQuery(["getUserData"],
    async () =>
      fetchUserData,
    { refetchOnWindowFocus: false }
  );

  const fetchUserData = async () => {
    await axios 
        .get(`${process.env.REACT_APP_API_BASE_URL}${process.env.REACT_APP_API_CONTEXT_ROOT}/user/${userAddress}`)
        .then((res) => setUserData(res.data));
  }

  return (
    <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
      <Container maxWidth="lg">
        <Typography sx={{ mb: 3 }} variant="h4">
          Account
        </Typography>
        {alertOpen && <AlertAction severity={alert.severity} title={alert.title} message={alert.message} strongMessage={alert.strongMessage} open={alertOpen} setOpen={setAlertOpen} />}
        <Grid container spacing={3}>
          <Grid item lg={4} md={6} xs={12}>
            <AccountProfile user={userData} fetchUserData={fetchUserData} triggerAlert={triggerAlert}/>
          </Grid>
          <Grid item lg={8} md={6} xs={12}>
            <AccountProfileDetails user={userData} updateUser={setUserData} fetchUserData={fetchUserData} triggerAlert={triggerAlert} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );

}

export default AccountBox;