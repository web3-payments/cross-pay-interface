import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export  const PaymentLinkCreation = (props) => {
  const handleClose = () => {
    props.setOpen(false);
  };
  return (
    <div>
      <Dialog open={props.open} onClose={handleClose}>
        <DialogTitle>Payment Link</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Payment details
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Email Address"
            type="email"
            fullWidth
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleClose}>Create Link</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PaymentLinkCreation;
