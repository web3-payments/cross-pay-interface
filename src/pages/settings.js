import { Box, Container, Typography } from '@mui/material';
import { DashboardLayout } from '../components/dashboard-layout';
import { SettingsNotifications } from '../components/settings/settings-notifications';
import { SettingsPassword } from '../components/settings/settings-password';
import { useSelector } from 'react-redux';
import LoggedOutPage from './logged-out';

export const Settings = () => {
  const isConnected = useSelector((state) => state.isConnected);
  return (
    <DashboardLayout>
      {isConnected ? (
        <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
          <Container maxWidth="lg">
            <Typography sx={{ mb: 3 }} variant="h4">
              Settings
            </Typography>
            <SettingsNotifications />
            <Box sx={{ pt: 3 }}>
              <SettingsPassword />
            </Box>
          </Container>
        </Box>
      ):(<LoggedOutPage/>)}
    </DashboardLayout>
  );
};
export default Settings;
