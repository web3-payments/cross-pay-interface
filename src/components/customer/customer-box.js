
import { useState } from 'react';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import { config } from "../../config";
import axios from "axios";
import { Box, Container } from '@mui/material';
import { CustomerListResults } from './customer-list-results';
import { CustomerListToolbar } from './customer-list-toolbar';
import AlertAction from '../utils/alert-actions/alert-actions';


export const CustomerBox = () => {
    const userAddress = useSelector((state) => state.address);
    const [alert, setAlert] = useState();
    const [alertOpen, setAlertOpen] = useState(false);
    const triggerAlert = (severity, title, message, strongMessage) => {
        setAlertOpen(true);
        setAlert({severity: severity, title: title, message: message, strongMessage: strongMessage});
    }
    const [customers, setCustomers] = useState([]);
    useQuery(["setCustomers"], 
      async() => 
        fetchCustomers, 
          { refetchOnWindowFocus: false}
      );

    const fetchCustomers = async() => {
      await axios 
        .get(`${config.contextRoot}/user/${userAddress}/customer`)
        .then((res) => setCustomers(res.data));
    }

    return(
        <Box component="main" sx={{ flexGrow: 1, py: 8}}>
          <Container maxWidth="lg" sx={{ flexGrow: 1, py: 4 }}>
            <CustomerListToolbar fetchCustomers={fetchCustomers} triggerAlert={triggerAlert}/>
            <Box sx={{ mt: 3 }}>
              <CustomerListResults customers={customers} />
            </Box>
          </Container>
        </Box>

    );

}

export default CustomerBox;