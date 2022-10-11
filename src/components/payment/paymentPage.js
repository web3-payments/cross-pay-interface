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
  
  const [values, setValues] = useState({
    company: 'Trixie',
    description: 'Name of what is being offered',
  });

  const handleChange = (event) => {
    setValues({
      ...values,
      [event.target.name]: event.target.value
    });
  };

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
    <Box 
      display="flex"
      justifyContent="center"
      alignItems="center"
      margin="20px"
      minHeight="10vh">
      <Card>
        <CardHeader
          subheader="Amount Due"
          title={paymentInfo?.amount + ` ` + paymentInfo?.currency } 
        />
        <Divider />
        <CardContent>
          <Grid container spacing={3} >
            <Grid
              item
              md={12}
              xs={24}
            >
              <Typography
                  color="inherit"
                  variant="subtitle1"
                >
                  {values.company}
                </Typography>
            </Grid>
            <Grid
              item
              md={12}
              xs={24}
            >
              <Typography
                  color="inherit"
                  variant="subtitle"
                >
                  {paymentInfo?.title}
                </Typography>
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <Box
          sx={{
            display: 'center',
            justifyContent: 'center',
            p: 2
          }}
        >
          <Button
            color="primary"
            variant="contained"
          >
            Pay {paymentInfo?.amount} {paymentInfo?.currency} 
          </Button>
        </Box>
      </Card>
      </Box>
      <div className="footer">Powered by CrossPay | terms | privacy</div>
    </React.Fragment>
  )
}

export default PaymentPage
