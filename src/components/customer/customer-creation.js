import * as React from 'react';
import CustomerModal from "./customer-modal";
import { useState } from 'react';
import { useSelector } from 'react-redux';
import axios from "axios";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

const CustomerCreation = ({ fetchCustomers, triggerAlert, setOpen, open }) => {
  const userAddress = useSelector((state) => state.address);

  const handleClose = () => {
    setOpen(false);
  };
  const [customerDetails, setCustomerDetails] = useState({
    
  });

  const create = async () => {
    console.log(customerDetails);
    await createCustomer(customerDetails, userAddress)
    handleClose();
  }

  async function createCustomer(customerDetails, userAddress) {
    await axios
      .post(`${process.env.REACT_APP_API_BASE_URL}${process.env.REACT_APP_API_CONTEXT_ROOT}/user/${userAddress}/customer`, customerDetails)
      .then(function (response) {
        if (response.status === 200) {
          fetchCustomers();
          triggerAlert("success", "Success", "Customer Created", null)
        }
      }).catch(function (error) {
        console.error(error);
        triggerAlert("error", "Error", "Failed to create Customer", error.message)
      });
  }

  return (
    <div>
      <Dialog open={open} onClose={handleClose} maxWidth="sm">
        <DialogContent>
          <CustomerModal customerDetails={customerDetails} setCustomerDetails={setCustomerDetails}  />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="error" variant="contained">Cancel</Button>
          <Button onClick={create} color="primary" variant="contained" >Create</Button>
        </DialogActions>
      </Dialog>
    </div>
  );

};

export default CustomerCreation;