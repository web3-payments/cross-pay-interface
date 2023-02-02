import * as React from 'react';
import ProductModal from "./product-modal";
import { useState } from 'react';
import { useSelector } from 'react-redux';
import axios from "axios";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

const ProductCreation = ({ fetchProducts, triggerAlert, setOpen, open }) => {
  const userAddress = useSelector((state) => state.address);

  const handleClose = () => {
    setFile();
    setOpen(false);
  };
  const [productDetails, setProductDetails] = useState({
    token: "ETH"
  });

  const [file, setFile] = useState();

  const create = async () => {
    console.log(productDetails);
    if (file !== undefined && file !== null) {
      await createProductWithImage(productDetails, file, userAddress);
    } else {
      await createProduct(productDetails, userAddress)
    }
    handleClose();
  }

  async function createProductWithImage(productDetails, file, userAddress) {
    let formData = new FormData();
    formData.append('name', productDetails.name);
    formData.append('price', productDetails.price);
    formData.append('description', productDetails.description);
    formData.append('totalSupply', productDetails.totalSupply);
    formData.append('cryptocurrencyId', productDetails.cryptocurrency.id);
    formData.append('image', file[0]);
    await axios
      .post(`${process.env.REACT_APP_API_BASE_URL}${process.env.REACT_APP_API_CONTEXT_ROOT}/user/${userAddress}/product`, formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }).then(function (response) {
          if (response.status === 200) {
            fetchProducts();
            triggerAlert("success", "Success", "Product Created", null)
          }
        }).catch(function (error) {
          console.error(error);
          triggerAlert("error", "Error", "Failed to create Product", error.message)
        });
  }

  async function createProduct(productDetails, userAddress) {
    await axios
      .post(`${process.env.REACT_APP_API_BASE_URL}${process.env.REACT_APP_API_CONTEXT_ROOT}/user/${userAddress}/product`, productDetails)
      .then(function (response) {
        if (response.status === 200) {
          fetchProducts();
          triggerAlert("success", "Success", "Product Created", null)
        }
      }).catch(function (error) {
        console.error(error);
        triggerAlert("error", "Error", "Failed to create Product", error.message)
      });
  }

  return (
    <div>
      <Dialog open={open} onClose={handleClose} maxWidth="sm">
        <DialogContent>
          <ProductModal productDetails={productDetails} setProductDetails={setProductDetails} file={file} setFile={setFile} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="error" variant="contained">Cancel</Button>
          <Button onClick={create} color="primary" variant="contained" >Create</Button>
        </DialogActions>
      </Dialog>
    </div>
  );

};

export default ProductCreation;