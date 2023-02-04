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
import InvoiceModal from './invoice-modal';

export const InvoiceCreation = ({fetchInvoices, triggerAlert, setOpen, open}) => {
  const userAddress = useSelector((state) => state.address);
  const toWei = (num, decimals) => ethers.utils.parseUnits(num.toString(), decimals.toString());
  const fromWei = (num, decimals) => ethers.utils.formatUnits(num.toString(), decimals.toString());
  useQuery(["getUserData"], 
    async() => 
      await axios 
        .get(`${config.contextRoot}/user/${userAddress}`)
        .then((res) => setInvoiceDetails({...invoiceDetails, ["user"]: res.data}) ), 
        { refetchOnWindowFocus: false}
    );

  const handleClose = () => {
    setOpen(false);
    setInvoiceDetails(invoiceDetailsDefault);
  };

  const invoiceDetailsDefault = {
    companyName: '',
    amount: '',
    products: [],
    customer: '',
    memo: '',
    dueDate: ''
  }

  const [invoiceDetails, setInvoiceDetails] = useState(invoiceDetailsDefault);

  useEffect(() => {
    if(invoiceDetails.products === undefined || invoiceDetails.products.length <= 0) {
      setInvoiceDetails({ ...invoiceDetails, ["amount"]: 0 }); 
      return;
    }
    const totalAmount = invoiceDetails.products.reduce((accumulator, value) => {
      return accumulator + (toWei(value.item.price, value.item.cryptocurrency.decimals) * value.quantity);
    }, 0 )
     setInvoiceDetails({ ...invoiceDetails, ["amount"]: fromWei(totalAmount, invoiceDetails.cryptocurrency.decimals) });
  }, [JSON.stringify(invoiceDetails.products)])

  const createInvoice = async () => {
    console.log(invoiceDetails);
    invoiceDetails.userAddress = userAddress;
    await axios
      .post(`${config.contextRoot}/invoice`, invoiceDetails)
      .then(function (response) {
        if(response.status === 200){
          console.log("Done");
          fetchInvoices();
          triggerAlert("success", "Success", "Invoice Created", null)
        }
      }).catch(function (error) {
          console.error(error)
          triggerAlert("error", "Error", "Failed to create Invoice", error.message)
      });
    handleClose();
  }
  
  return (
    <div>
      <Dialog open={open} onClose={handleClose} maxWidth="xl">
        <DialogContent>
          <InvoiceModal invoiceDetails={invoiceDetails} setInvoiceDetails={setInvoiceDetails} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="error" variant="contained">Cancel</Button>
          <Button onClick={createInvoice} color="primary" variant="contained" >Create Invoice</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default InvoiceCreation;
