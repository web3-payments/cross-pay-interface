import { useState } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { config } from "../../../config";
import axios from "axios";
import { format } from 'date-fns';
import { FormControl, Chip, Box, Card, TextField, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, IconButton } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import { useNavigate } from 'react-router-dom';
import Tooltip from '@mui/material/Tooltip';

export const PaymentListResults = ({ payments }) => {
  const navigate = useNavigate();
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(0);

  const handleLimitChange = (event) => {
    setLimit(event.target.value);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const cancelPayment = async (hash) => {
    await axios.post(`${config.contextRoot}/payment/${hash}/cancellation`);
  }

  //TODO: Move this to a utils class, it might ve used by other types of payments
  const paymentStatusTag = (param) => {
    switch(param) {
      case 'CREATED':
        return <Chip label={param} color='info'/>;
      case 'PAID':
        return <Chip label={param} color='success'/>;
      case 'CANCELLED':
        return <Chip label={param} color='error'/>;
      case 'ACTIVATED':
        return <Chip label={param} color='info'/>;
      case 'DEACTIVATED':
        return <Chip label={param} color='error'/>;
      default:
        return <Chip label={param} color='warning'/>;
    }
  };
  
  return (
    <Card>
      <PerfectScrollbar>
        <Box sx={{ minWidth: 1050 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell  sx={{ width: 125, px: 2 }} size="small">
                  Total
                </TableCell>
                <TableCell  sx={{ width: 500 }}>
                  Description
                </TableCell>
                <TableCell>
                  Status
                </TableCell>
                <TableCell>
                  Creation date
                </TableCell>
                <TableCell>
                  Options
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments?.slice(0, limit).map((payment) => (
                <TableRow hover key={payment.id}>
                  <TableCell>  
                    <FormControl fullWidth={false} sx={{ m: 1 }}>
                      {`${payment.amount} ${payment.cryptocurrency.symbol}`}
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <FormControl>
                      {payment.description}
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    {paymentStatusTag(payment.paymentStatus)}
                  </TableCell>
                  <TableCell>
                    {format(Date.parse(payment.createdAt), 'dd/MM/yyyy')} 
                  </TableCell>
                  <TableCell>
                      <Tooltip title="Copy Payment Link">
                        <IconButton color="primary" aria-label="edit" component="label"
                          onClick={() => {navigator.clipboard.writeText(payment.paymentLink)}}>
                          <ContentCopyIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Transactions">
                        <IconButton color="primary" aria-label="transactions" component="label"
                            onClick={() => navigate(`/transactions/${payment.hash}`)}>
                            <ReceiptLongOutlinedIcon />
                        </IconButton>
                      </Tooltip>
                      {payment.paymentStatus !== "CANCELLED" && payment.paymentStatus !== "PAID" && payment.paymentStatus !== "DEACTIVATED" && 
                        <Tooltip title="Deactivate">
                            <IconButton color="primary" aria-label="cancel" component="label"
                              onClick={() => {cancelPayment(payment.hash)}}>
                              <BlockOutlinedIcon />
                            </IconButton>
                          </Tooltip>
                      }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </PerfectScrollbar>
      <TablePagination
        component="div"
        count={payments ? payments.length : 0}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleLimitChange}
        page={page}
        rowsPerPage={limit}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Card>
  );
};


export default PaymentListResults;
