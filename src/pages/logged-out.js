import { Box, Button, Container, Typography } from '@mui/material';
import WalletIcon from '@mui/icons-material/Wallet';

const LoggedOutPage = () => {
  return (
    <>
      <Box
        component="main"
        sx={{
          alignItems: 'center',
          display: 'flex',
          flexGrow: 1,
          minHeight: '100%'
        }}
      >
        <Container maxWidth="md">
          <Box
            sx={{
              alignItems: 'center',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Typography
              align="center"
              color="textPrimary"
              variant="h1"
            >
              CrossPay: Connect your wallet
            </Typography>
            <Typography
              align="center"
              color="textPrimary"
              variant="subtitle2"
            >
              Connect your web3 wallet to start uring CrossPay services
            </Typography>
            <Box sx={{ textAlign: 'center' }}>
              <img
                alt="Under development"
                src="/static/images/wallet-illo.svg"
                style={{
                  marginTop: 50,
                  display: 'inline-block',
                  maxWidth: '100%',
                  width: 560
                }}
              />
            </Box>
              <Button
                component="a"
                startIcon={(<WalletIcon />)}
                sx={{ mt: 3 }}
                variant="contained"
              >
                Connect
              </Button>
          </Box>
        </Container>
      </Box>
    </>
  );
};
export default LoggedOutPage;
