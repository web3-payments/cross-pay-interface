import { useState } from 'react';
import * as React from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import axios from "axios";
import { format } from 'date-fns';
import { FormControl, Chip, Box, Card, TextField, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, IconButton, Tooltip } from '@mui/material';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import PermContactCalendarOutlinedIcon from '@mui/icons-material/PermContactCalendarOutlined';
import LocalGroceryStoreOutlinedIcon from '@mui/icons-material/LocalGroceryStoreOutlined';
import truncateHash from '../../utils/truncate-hash';
import CustomerDetailsDialog from '../customer/customer-details-dialog';
import TransactionDetailsDialog from './transaction-details-dialog';
import ProductDetailsDialog from '../product/product-details-dialog';

export const TransactionListResults = ({ transactions }) => {
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(0);
  const [customerDetailsOpen, setCustomerDetailsOpen] = React.useState(false);
  const [productsDetailsOpen, seProductsDetailsOpen] = React.useState(false);
  const [transactionDetailsOpen, setTransactionDetailsOpen] = React.useState(false);
  
  const handleLimitChange = (event) => {
    setLimit(event.target.value);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  return (
    <Card>
      <PerfectScrollbar>
        <Box sx={{ minWidth: 1050 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell  sx={{ width: 150, px: 2 }} size="small">
                  Total
                </TableCell>
                <TableCell>
                  Customer
                </TableCell>
                <TableCell>
                  Execution date
                </TableCell>
                <TableCell>
                  Transaction Details
                </TableCell>
                <TableCell>
                  Options
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions?.slice(0, limit).map((transaction) => (
                <TableRow
                  hover
                  key={transaction.id}
                >
                  <TableCell>  
                    <FormControl fullWidth={false} sx={{ m: 1 }}>
                    {`${transaction.amount} ${transaction.cryptocurrency.symbol}`}
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <FormControl>
                      {transaction?.customerInfo?.email}
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    {transaction?.executionDate} 
                  </TableCell>
                  <TableCell>
                    <a href={`${transaction.cryptocurrency.blockExplorer.transactionLink}/${transaction.transactionHash}`}>
                      {truncateHash(transaction.transactionHash)}
                    </a>
                  </TableCell>
                  <TableCell>
                    <CustomerDetailsDialog open={customerDetailsOpen} setOpen={setCustomerDetailsOpen} customerInfo={transaction.customerInfo} />
                    <TransactionDetailsDialog open={transactionDetailsOpen} setOpen={setTransactionDetailsOpen} transactionDetails={transaction} />
                    <ProductDetailsDialog open={productsDetailsOpen} setOpen={seProductsDetailsOpen} productDetails={transaction.products} />
                    <Tooltip title="Customer Details">
                      <IconButton color="primary" aria-label="customerDetails" component="label" 
                        disabled={transaction.customerInfo === undefined}
                        onClick={() => setCustomerDetailsOpen(true)}>
                          <PermContactCalendarOutlinedIcon/>
                        </IconButton>
                      </Tooltip>
                    <Tooltip title="Products">
                      <IconButton color="primary" aria-label="products" component="label" 
                        onClick={() => seProductsDetailsOpen(true)}>
                          <LocalGroceryStoreOutlinedIcon/>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Transaction Details">
                    <IconButton color="primary" aria-label="transactionDetails" component="label"
                      onClick={() => setTransactionDetailsOpen(true)}>
                        <ReceiptOutlinedIcon/>
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </PerfectScrollbar>
      <TablePagination
        component="div"
        count={transactions ? transactions.length : 0}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleLimitChange}
        page={page}
        rowsPerPage={limit}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Card>
  );
};


export default TransactionListResults;
