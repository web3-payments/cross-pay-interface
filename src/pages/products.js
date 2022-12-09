import { DashboardLayout } from '../components/dashboard-layout';
import { useSelector } from 'react-redux';
import LoggedOutPage from './logged-out';
import ProductBox from '../components/product/product-box';
export const Products = () => {
  const isConnected = useSelector((state) => state.isConnected);
  return (
    <DashboardLayout>
      {isConnected ? (
        <ProductBox/>
      ):(<LoggedOutPage/>)}
    </DashboardLayout>
  );
};

export default Products;