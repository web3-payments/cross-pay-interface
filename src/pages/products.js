import { Box, Container, Grid, Pagination } from '@mui/material';
import { ProductListToolbar } from '../components/product/product-list-toolbar';
import { ProductCard } from '../components/product/product-card';
import { DashboardLayout } from '../components/dashboard-layout';
import { useSelector } from 'react-redux';
import { useQuery } from 'react-query';
import { useState } from 'react';
import { config } from "../config";
import axios from "axios";
import LoggedOutPage from './logged-out';
export const Products = () => {
  const isConnected = useSelector((state) => state.isConnected);
  const userAddress = useSelector((state) => state.address);
  const [products, setProducts] = useState([]);
  useQuery(["getProducts"], 
    async() => 
      await axios 
        .get(`${config.contextRoot}/user/${userAddress}/product`)
        .then((res) => setProducts(res.data)), 
        { refetchOnWindowFocus: false}
    );
  return (
    <DashboardLayout>
      {isConnected ? (
        <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
          <Container maxWidth="lg" sx={{ flexGrow: 1, py: 4 }}>
            <ProductListToolbar />
            <Box sx={{ pt: 3 }}>
              <Grid container spacing={3}>
                {products?.map((product) => (
                  <Grid item key={product._id} lg={4} md={6} xs={6}>
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
      ):(<LoggedOutPage/>)}
    </DashboardLayout>
  );
};

export default Products;
