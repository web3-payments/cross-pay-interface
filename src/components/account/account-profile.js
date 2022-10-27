import { Avatar, Box, Button, Card, CardActions, CardContent, Divider, Typography} from '@mui/material';

export const AccountProfile = (props) => {
  return (
    <Card>
      <CardContent>
        <Box sx={{ alignItems: 'center', display: 'flex',flexDirection: 'column'}} >
          <Avatar src="/static/images/avatars/web3_avatar.png" sx={{ height: 64, mb: 2, width: 64 }}/>
          <Typography color="textPrimary" gutterBottom variant="h5">
            {props.user?.firstName === undefined ? 
              ("") : 
              (`${props.user?.firstName} ${props.user?.lastName}`)
            }
          </Typography>
          <Typography color="textSecondary" variant="body2" >
            {`${props.user?.signerAddress} `}
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