import * as React from 'react';
import { Avatar, Box, Button, Card, CardActions, CardContent, Divider, Typography, IconButton} from '@mui/material';
import CameraAltTwoToneIcon from '@mui/icons-material/CameraAltTwoTone';
import AccountProfileImageUpload from './account-profile-image-upload';

export const AccountProfile = ({user, fetchUserData, triggerAlert}) => {
  const [imageUploadOpen, setImageUploadOpen] = React.useState(false);
  const handleClickOpen = () => {
    setImageUploadOpen(true);
  };
  return (
    <Card>
      <CardContent>
        <Box sx={{ alignItems: 'center', display: 'flex',flexDirection: 'column'}} >
          <Avatar src={`data:image/jpeg;base64,${user?.image}`} sx={{ height: 84, mb: 2, width: 84 }}/>
          <Typography color="textPrimary" gutterBottom variant="h5">
            {user?.companyName === undefined ? 
              ("") : 
              (`${user?.companyName}`)
            }
          </Typography>
          <IconButton color="primary" aria-label="edit" component="label" onClick={handleClickOpen}>
            <CameraAltTwoToneIcon sx={{ mb: 2}}/>
            <AccountProfileImageUpload  open={imageUploadOpen} setOpen={setImageUploadOpen} fetchUserData={fetchUserData} triggerAlert={triggerAlert}/>
          </IconButton>
          <Typography color="textSecondary" variant="body2" >
            {`${user?.signerAddress} `}
          </Typography>
        </Box>
      </CardContent>
      <Divider />
      <CardActions>
        <Button color="primary" fullWidth variant="text">
          Default Account
        </Button>
      </CardActions>
    </Card>
  );
};