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

export const InvoiceListResults = ({ invoices }) => {
  const navigate = useNavigate();
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(0);

  const handleLimitChange = (event) => {
    setLimit(event.target.value);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const cancelInvoice = async (hash) => {
    await axios.post(`${config.contextRoot}/invoice/${hash}/cancellation`);
  }

  //TODO: Move this to a utils class, it might ve used by other types of invoices
  const invoiceStatusTag = (param) => {
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
                <TableCell  sx={{ width: 250 }}>
                  Memo
                </TableCell>
                <TableCell>
                  Status
                </TableCell>
                <TableCell>
                  Creation date
                </TableCell>
                <TableCell>
                  Due date
                </TableCell>
                <TableCell>
                  Customer
                </TableCell>
                <TableCell>
                  Options
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices?.slice(0, limit).map((invoice) => (
                <TableRow hover key={invoice.id}>
                  <TableCell>  
                    <FormControl fullWidth={false} sx={{ m: 1 }}>
                      {`${invoice.amount} ${invoice.cryptocurrency.symbol}`}
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <FormControl>
                      {invoice.memo}
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    {invoiceStatusTag(invoice.invoiceStatus)}
                  </TableCell>
                  <TableCell>
                    {format(Date.parse(invoice.createdAt), 'dd/MM/yyyy')} 
                  </TableCell>
                  <TableCell>
                    {format(Date.parse(invoice.dueDate), 'dd/MM/yyyy')} 
                  </TableCell>
                  <TableCell>
                    <FormControl>
                      {invoice.customer.name}
                    </FormControl>
                  </TableCell>
                  <TableCell>
                      <Tooltip title="Copy Invoice Link">
                        <IconButton color="primary" aria-label="edit" component="label"
                          onClick={() => {navigator.clipboard.writeText(invoice.invoiceLink)}}>
                          <ContentCopyIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Transactions">
                        <IconButton color="primary" aria-label="transactions" component="label"
                            onClick={() => navigate(`/transactions/invoice/${invoice.hash}`)}>
                            <ReceiptLongOutlinedIcon />
                        </IconButton>
                      </Tooltip>
                      {invoice.invoiceStatus !== "PAID" && invoice.invoiceStatus !== "DEACTIVATED" && 
                        <Tooltip title="Deactivate">
                            <IconButton color="primary" aria-label="cancel" component="label"
                              onClick={() => {cancelInvoice(invoice.hash)}}>
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
        count={invoices ? invoices.length : 0}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleLimitChange}
        page={page}
        rowsPerPage={limit}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Card>
  );
};


export default InvoiceListResults;
