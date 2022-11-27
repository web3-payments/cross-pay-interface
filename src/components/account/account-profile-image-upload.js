import * as React from 'react';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { config } from "../../config";
import axios from "axios";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import AccountProfileModal from './account-profile-modal';

const AccountProfileImageUpload = (props) => {
    const userAddress = useSelector((state) => state.address);
  
    const handleClose = () => {
      setFile();
      props.setOpen(false);
    };

    const [file, setFile] = useState();


    const uploadImage = async () => {
        //submit a post to save the image to the account
        let formData = new FormData();
        formData.append('image', file[0]);
        await axios
            .patch(`${config.contextRoot}/user/${userAddress}`, formData,
            {
                headers: {
                "Content-Type": "multipart/form-data"
                }
            }).then(function (response) {
                console.log(response);
                if (response.status === 200) {
                console.log("Done");
                }
            }).catch(function (error) {
                console.error(error);
            });
        handleClose();
      }

    return (
        <div>
          <Dialog open={props.open} onClose={handleClose} maxWidth="sm">
            <DialogContent>
              <AccountProfileModal file={file} setFile={setFile} />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} color="error" variant="contained">Cancel</Button>
              <Button onClick={uploadImage} color="primary" variant="contained" >Create</Button>
            </DialogActions>
          </Dialog>
        </div>
      );

};

export default AccountProfileImageUpload;