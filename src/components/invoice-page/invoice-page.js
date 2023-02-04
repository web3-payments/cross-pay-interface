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
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { config } from "../../config";

import "./invoice-page.css"
import InvoiceDetails from './invoice-details';

const InvoicePage = (props) => {
  const { invoiceHash } = useParams();

  useQuery(
    ["getInvoiceInfo", invoiceHash],
    async () =>
      await axios
        .get(`${config.contextRoot}/invoice/${invoiceHash}`)
        .then((res) => setInvoiceInfo(res.data)),
    { refetchOnWindowFocus: false }
  );

  const [invoiceInfo, setInvoiceInfo] = useState({});

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
            <InvoiceDetails
              invoiceInfo={invoiceInfo}
              setInvoiceInfo={setInvoiceInfo}
            />
          </Grid>
        </Grid>
      </Box>
      {/* <div className="footer">Powered by CrossPay | terms | privacy</div> */}
    </React.Fragment>
  );
};

export default InvoicePage;