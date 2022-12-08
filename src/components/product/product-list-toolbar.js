import * as React from 'react';
import { Box, Button, Card, CardContent, TextField, InputAdornment, SvgIcon,Typography} from '@mui/material';
import { Search as SearchIcon } from '../../icons/search';
import ProductCreation from './product-creation';

export const ProductListToolbar = ({fetchProducts, triggerAlert}) => {
  const [productCreationOpen, setProductCreationOpen] = React.useState(false);
  const handleClickOpen = () => {
    setProductCreationOpen(true);
  };
  return (
    <Box>
      <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', m: -1 }}>
        <Typography sx={{ m: 1 }} variant="h4" >
          Products
        </Typography>
        <Box sx={{ m: 1 }}>
          <Button onClick={handleClickOpen} color="primary" variant="contained" >
            Add products
          </Button>
          <ProductCreation open={productCreationOpen} setOpen={setProductCreationOpen}  fetchProducts={fetchProducts} triggerAlert={triggerAlert}/>
        </Box>
      </Box>
      <Box sx={{ mt: 3 }}>
        <Card>
          <CardContent>
            <Box sx={{ maxWidth: 500 }}>
              <TextField
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SvgIcon
                        fontSize="small"
                        color="action"
                      >
                        <SearchIcon />
                      </SvgIcon>
                    </InputAdornment>
                  )
                }}
                placeholder="Search product"
                variant="outlined"
              />
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};