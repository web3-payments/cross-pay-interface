import * as React from 'react';
import { useEffect, useState } from 'react';
import { ethers } from "ethers";
import { useSelector } from 'react-redux';
import { useQuery } from 'react-query';
import axios from "axios";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import PaymentModal from './payment-modal';

export const PaymentLinkCreation = ({fetchPayments, triggerAlert, setOpen, open}) => {
  const userAddress = useSelector((state) => state.address);
  const toWei = (num, decimals) => ethers.utils.parseUnits(num.toString(), decimals.toString());
  const fromWei = (num, decimals) => ethers.utils.formatUnits(num.toString(), decimals.toString());
  useQuery(["getUserData"], 
    async() => 
      await axios 
        .get(`${process.env.REACT_APP_API_BASE_URL}${process.env.REACT_APP_API_CONTEXT_ROOT}/user/${userAddress}`)
        .then((res) => setPaymentDetails({...paymentDetails, ["user"]: res.data}) ), 
        { refetchOnWindowFocus: false}
    );

  const handleClose = () => {
    setOpen(false);
    setPaymentDetails(paymentDetailsDefault);
  };

  const paymentDetailsDefault = {
    companyName: '',
    amount: '',
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
      return accumulator + (toWei(value.item.price, value.item.cryptocurrency.decimals) * value.quantity);
    }, 0 )
     setPaymentDetails({ ...paymentDetails, ["amount"]: fromWei(totalAmount, paymentDetails.cryptocurrency.decimals) });
  }, [JSON.stringify(paymentDetails.products)])

  const createLink = async () => {
    console.log(paymentDetails);
    paymentDetails.userAddress = userAddress;
    await axios
      .post(`${process.env.REACT_APP_API_BASE_URL}${process.env.REACT_APP_API_CONTEXT_ROOT}/payment`, paymentDetails)
      .then(function (response) {
        if(response.status === 200){
          console.log("Done");
          fetchPayments();
          triggerAlert("success", "Success", "Payment Link Created", null)
        }
      }).catch(function (error) {
          console.error(error)
          triggerAlert("error", "Error", "Failed to create Payment Link", error.message)
      });
    handleClose();
  }
  
  return (
    <div>
      <Dialog open={open} onClose={handleClose} maxWidth="xl">
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
