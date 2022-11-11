import PropTypes from 'prop-types';
import { Avatar, Box, Card, CardContent, Divider, Grid, Typography } from '@mui/material';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import SellOutlinedIcon from '@mui/icons-material/SellOutlined';

export const ProductCard = ({ product }) => (
  <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%'}}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'center', pb: 3 }}>
        <Avatar alt="Product" src={`data:image/jpeg;base64,${product?.image}`} variant="square" sx={{ width: 66, height: 66 }}/>
      </Box>
      <Typography align="center" color="textPrimary" gutterBottom variant="h5">
        {product?.name}
      </Typography>
      <Typography align="center" color="textPrimary" variant="body1" >
        {product?.description}
      </Typography>
    </CardContent>
    <Box sx={{ flexGrow: 0.5 }} />
    <Divider />
    <Box sx={{ p: 2 }}>
      <Grid container spacing={1} sx={{ justifyContent: 'space-between' }}>
        <Grid item sx={{ alignItems: 'center', display: 'flex' }}>
          <SellOutlinedIcon/>
          <Typography color="textSecondary" display="inline" sx={{ pl: 1 }} variant="body2">
            {`${product?.price} ${product?.token}`}
          </Typography>
        </Grid>
        <Grid item sx={{ alignItems: 'center', display: 'flex' }}>
          <Inventory2OutlinedIcon/>
          <Typography color="textSecondary" display="inline" sx={{ pl: 1 }} variant="body2" >
            Total Supply: {` ${product?.totalSupply}`}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  </Card>
);

ProductCard.propTypes = {
  product: PropTypes.object.isRequired
};
