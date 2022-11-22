import * as React from 'react';
import { useEffect, useState } from 'react';
import { ethers } from "ethers";
import { useSelector } from 'react-redux';
import { useQuery } from 'react-query';
import { config } from "../../../config";
import axios from "axios";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import PaymentModal from './payment-modal';

export const PaymentLinkCreation = (props) => {
  const toWei = (num) => ethers.utils.parseEther(num.toString())
  const fromWei = (num) => ethers.utils.formatEther(num)
  const userAddress = useSelector((state) => state.address);
  useQuery(["getUserData"], 
    async() => 
      await axios 
        .get(`${config.contextRoot}/user/${userAddress}`)
        .then((res) => setPaymentDetails({...paymentDetails, ["companyName"]: res.data.companyName}) ), 
        { refetchOnWindowFocus: false}
    );

  const handleClose = () => {
    props.setOpen(false);
    setPaymentDetails(paymentDetailsDefault);
  };

  const paymentDetailsDefault = {
    companyName: '',
    amount: '',
    currency: 'ETH',
    paymentType: 'PAYMENT_LINK',
    products: [], 
    adjstableQuantity: false, 
    customerRequiredInfo: {
      name: false,
      email: false, 
      phoneNumber: false, 
      shippingAddress: false
    }
  }

  const [paymentDetails, setPaymentDetails] = useState(paymentDetailsDefault);

  useEffect(() => {
    if(paymentDetails.products === undefined || paymentDetails.products.length <= 0) {
      setPaymentDetails({ ...paymentDetails, ["amount"]: 0 }); 
      return;
    }
    const totalAmount = paymentDetails.products.reduce((accumulator, value) => {
      //TODO: this must be changed - when implemented new types of coins
      return accumulator + (toWei(value.item.price) * value.quantity);
    }, 0 )
     setPaymentDetails({ ...paymentDetails, ["amount"]: fromWei(totalAmount) });
  }, [JSON.stringify(paymentDetails.products)])

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
