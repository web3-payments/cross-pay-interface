import React from "react";
import { useParams } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import { useState } from "react";
import { useQuery } from "react-query";
import axios from "axios";
import AdbIcon from "@mui/icons-material/Adb";
import {
  Box,
  Grid,
  Typography,
} from "@mui/material";


import "./payment-page.css"
import PaymentDetails from './payment-details';
import { JupiterApiProvider } from "../../context/jupiter-api-context";

const PaymentPage = (props) => {
  const { paymentHash } = useParams();

  useQuery(
    ["getPaymentInfo", paymentHash],
    async () =>
      await axios
        .get(`${process.env.REACT_APP_API_BASE_URL}${process.env.REACT_APP_API_CONTEXT_ROOT}/payment/${paymentHash}`)
        .then((res) => setPaymentInfo(res.data)),
    { refetchOnWindowFocus: false }
  );

  const [paymentInfo, setPaymentInfo] = useState({});

  return (

      <React.Fragment>
        <AppBar position="static" color="primary">
          <Toolbar>
            <AdbIcon sx={{ display: { md: "flex" } }} />
            <Typography
              variant="h6"
              noWrap
              component="a"
              href="/"
              sx={{
                display: { md: "flex" },
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              CrossPay
            </Typography>
          </Toolbar>
        </AppBar>
        <br />
        <Box component="main" sx={{ flexGrow: 1, p: 2 }}>
          <Grid
            container
            spacing={3}
            sx={{
              p: 2,
              display: { xs: "block", lg: "flex" },
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Grid item lg={6}>
              <PaymentDetails
                paymentInfo={paymentInfo}
                setPaymentInfo={setPaymentInfo}
              />
            </Grid>
          </Grid>
        </Box>
        {/* <div className="footer">Powered by CrossPay | terms | privacy</div> */}
      </React.Fragment>
  );
};

export default PaymentPage;