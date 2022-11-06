import * as React from 'react';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { config } from "../../../config";
import axios from "axios";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import PaymentModal from './payment-modal';

export const PaymentLinkCreation = (props) => {
  const userAddress = useSelector((state) => state.address);

  const handleClose = () => {
    props.setOpen(false);
  };
  const [paymentDetails, setPaymentDetails] = useState({
    companyName: 'Company name',
    title: 'Description of the payment',
    amount: '1',
    currency: 'ETH',
    paymentType: 'PAYMENT_LINK'
  });

  const createLink = async () => {
    console.log(paymentDetails);
    paymentDetails.userAddress = userAddress;
    await axios
      .post(`${config.contextRoot}/payment`, paymentDetails)
      .then(function (response) {
        console.log(response);
        if(response.status === 200){
          console.log("Done")
        }
      }).catch(function (error) {
          console.error(error)
      });

    handleClose();
  }
  
  return (
    <div>
      <Dialog open={props.open} onClose={handleClose} maxWidth="xl">
        <DialogContent>
          <PaymentModal paymentDetails={paymentDetails} setPaymentDetails={setPaymentDetails} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="error" variant="contained">Cancel</Button>
          <Button onClick={createLink} color="primary" variant="contained" >Create Link</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PaymentLinkCreation;
