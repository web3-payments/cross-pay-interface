import React from 'react'
import { useParams } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import { useState } from 'react';
import { useQuery } from 'react-query';
import axios from "axios";
import AdbIcon from '@mui/icons-material/Adb';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  TextField, 
  Typography 
} from '@mui/material';
import { config } from "../../config";

import "./paymentPage.css"
import PaymentDetails from './PaymentDetails';

const PaymentPage = (props) => {
  const { paymentHash } = useParams()
  
  const { data: paymentInfo } = useQuery(
    ["getPaymentInfo", paymentHash], 
    async () => 
      await axios
        .get(`${config.contextRoot}/payment/${paymentHash}`)
        .then((res) => res.data),
        {refetchOnWindowFocus: false}
  );
  
  return (
    <React.Fragment>
      <AppBar position="static" color="primary">
        <Toolbar>
          <AdbIcon sx={{ display: { md: 'flex' }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            CrossPay 
          </Typography>
        </Toolbar>
      </AppBar>
      <br/>
      <Box  component="main" sx={{ flexGrow: 1, py: 1 }}>
      <Grid container spacing={3} sx={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Grid item lg={5}>
          <PaymentDetails paymentInfo={paymentInfo}/>
        </Grid>
      </Grid>
      </Box>
      <div className="footer">Powered by CrossPay | terms | privacy</div>
    </React.Fragment>
  )
}

export default PaymentPage
