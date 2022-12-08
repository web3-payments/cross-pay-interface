import { useState } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { format } from 'date-fns';
import { Avatar, Box, Card, IconButton, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, Typography } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import IosShareIcon from '@mui/icons-material/IosShare';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

export const WalletListResults = ({ wallets }) => {
  const [selectedCustomerIds, setSelectedCustomerIds] = useState([]);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(0);

  const handleSelectAll = (event) => {
    let newSelectedCustomerIds;

    if (event.target.checked) {
      newSelectedCustomerIds = wallets.map((customer) => customer.address);
    } else {
      newSelectedCustomerIds = [];
    }

    setSelectedCustomerIds(newSelectedCustomerIds);
  };

  const handleSelectOne = (event, id) => {
    const selectedIndex = selectedCustomerIds.indexOf(id);
    let newSelectedCustomerIds = [];

    if (selectedIndex === -1) {
      newSelectedCustomerIds = newSelectedCustomerIds.concat(selectedCustomerIds, id);
    } else if (selectedIndex === 0) {
      newSelectedCustomerIds = newSelectedCustomerIds.concat(selectedCustomerIds.slice(1));
    } else if (selectedIndex === selectedCustomerIds.length - 1) {
      newSelectedCustomerIds = newSelectedCustomerIds.concat(selectedCustomerIds.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelectedCustomerIds = newSelectedCustomerIds.concat(
        selectedCustomerIds.slice(0, selectedIndex),
        selectedCustomerIds.slice(selectedIndex + 1)
      );
    }

    setSelectedCustomerIds(newSelectedCustomerIds);
  };

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
                <TableCell padding="checkbox">
                  {/* <Checkbox
                    checked={selectedCustomerIds.length === customers.length}
                    color="primary"
                    indeterminate={
                      selectedCustomerIds.length > 0
                      && selectedCustomerIds.length < customers.length
                    }
                    onChange={handleSelectAll}
                  /> */}
                </TableCell>
                <TableCell>
                  Account name
                </TableCell>
                <TableCell>
                  Address
                </TableCell>
                <TableCell>
                  Blockchain
                </TableCell>
                <TableCell>
                  Registration date
                </TableCell>
                <TableCell>
                  Options
                </TableCell>
              </TableRow>
            </TableHead>
            {wallets && 
            <TableBody>
              {wallets?.slice(0, limit).map((wallet) => (
                <TableRow
                  hover
                  key={wallet.address}
                  selected={selectedCustomerIds.indexOf(wallet.address) !== -1}
                >
                  <TableCell padding="checkbox">
                    {/* <Checkbox
                      checked={selectedCustomerIds.indexOf(customer.id) !== -1}
                      onChange={(event) => handleSelectOne(event, customer.id)}
                      value="true"
                    /> */}
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        alignItems: 'center',
                        display: 'flex'
                      }}
                    >
                      {/* <Avatar
                        src={customer.avatarUrl}
                        sx={{ mr: 2 }}
                      >
                        
                      </Avatar> */}
                      <Typography
                        color="textPrimary"
                        variant="body1"
                      >
                        {wallet.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {wallet.address}
                  </TableCell>
                  <TableCell>
                    {`${wallet.blockchain}`}
                  </TableCell>
                  <TableCell>
                    {format(wallet.createdAt, 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>          
                    {wallet.name !== "Default Account" ?
                      <>
                        <IconButton color="primary" aria-label="edit" component="label">
                          <EditOutlinedIcon />
                        </IconButton>
                        <IconButton color="primary" aria-label="delete" component="label">
                          <DeleteOutlineOutlinedIcon />
                        </IconButton>
                      </>
                      :
                      <a href='/accounts'>
                        <IconButton color="primary" aria-label="edit" component="label">
                          <IosShareIcon />
                        </IconButton>
                      </a>
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            }
          </Table>
        </Box>
      </PerfectScrollbar>
      <TablePagination
        component="div"
        count={0}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleLimitChange}
        page={page}
        rowsPerPage={limit}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Card>
  );
};

export default WalletListResults;