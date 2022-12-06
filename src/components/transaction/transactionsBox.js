import { Box, Container } from '@mui/material';
import { useSelector } from 'react-redux';
import { useQuery } from 'react-query';
import { useState } from 'react';
import { config } from "../../config";
import axios from "axios";
import TransactionListResults from './transaction-list-results';
import TransactionListToolbar from './transaction-list-toolbar';

export const TransactionsBox = ({paymentHash}) => {
  const userAddress = useSelector((state) => state.address);
  const [transactions, setTransactions] = useState();
  useQuery(["getTransactions"], 
    async() => 
      await axios 
        .get(`${config.contextRoot}/payment/${paymentHash}/transaction`)
        .then((res) => setTransactions(res.data)), 
        { refetchOnWindowFocus: false}
    );
  return (
      <Box component="main" sx={{ flexGrow: 1, py: 8}}>
        <Container maxWidth="lg" sx={{ flexGrow: 1, py: 4 }}>
          <TransactionListToolbar />
          <Box sx={{ mt: 3 }}>
            {transactions !== null &&
              <TransactionListResults transactions={transactions} />
            }
          </Box>
        </Container>
      </Box>
  );
};

export default TransactionsBox;