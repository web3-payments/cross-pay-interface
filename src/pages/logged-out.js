import { Box, Button, Container, Divider, Typography } from "@mui/material";
import WalletIcon from "@mui/icons-material/Wallet";

const LoggedOutPage = () => {
  return (
    <>
      <Box
        component="main"
        sx={{
          alignItems: "center",
          display: "flex",
          flexGrow: 1,
          minHeight: "100%",
        }}
      >
        <Container maxWidth="md">
          <Box
            sx={{
              alignItems: "center",
              display: "flex",
              flexDirection: "column",
              mt: 30,
            }}
          >
            <Typography align="center" color="navy" variant="h2">
              Powering the web3 payments layer
            </Typography>
            <Typography mt={6} align="center" color="textPrimary" variant="h6">
              The one place to enable web3 payments into your business. From
              payment links and invoicing all the way to inventory management.
            </Typography>
          </Box>
        </Container>
      </Box>
    </>
  );
};
export default LoggedOutPage;
