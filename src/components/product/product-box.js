import { Box, Container, Grid, Pagination } from '@mui/material';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import axios from "axios";
import AlertAction from '../utils/alert-actions/alert-actions';
import { ProductCard } from './product-card';
import { ProductListToolbar } from './product-list-toolbar';

export const ProductBox = () => {
    const userAddress = useSelector((state) => state.address);
    const [alert, setAlert] = useState();
    const [alertOpen, setAlertOpen] = useState(false);
    const triggerAlert = (severity, title, message, strongMessage) => {
        setAlertOpen(true);
        setAlert({severity: severity, title: title, message: message, strongMessage: strongMessage});
    }
    const [products, setProducts] = useState([]);
    useQuery(["getProducts"], 
      async() => 
        fetchProducts, 
          { refetchOnWindowFocus: false}
      );

    const fetchProducts = async() => {
      await axios 
        .get(`${process.env.REACT_APP_API_BASE_URL}${process.env.REACT_APP_API_CONTEXT_ROOT}/user/${userAddress}/product`)
        .then((res) => setProducts(res.data));
    }

    return (
        <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="lg" sx={{ flexGrow: 1, py: 4 }}>
          {alertOpen && <AlertAction severity={alert.severity} title={alert.title} message={alert.message} strongMessage={alert.strongMessage} open={alertOpen} setOpen={setAlertOpen} />}
          <ProductListToolbar fetchProducts={fetchProducts} triggerAlert={triggerAlert}/>
          <Box sx={{ pt: 3 }}>
            <Grid container spacing={3}>
              {products?.map((product) => (
                <Grid item key={product?.id} lg={4} md={6} xs={6}>
                  <ProductCard product={product} />
                </Grid>
              ))}
            </Grid>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 3}}>
            <Pagination color="primary" count={3} size="small"/>
          </Box>
        </Container>
      </Box>
    );

}

export default ProductBox;