import { Box, Button, Card, CardContent, TextField, InputAdornment, SvgIcon, Typography } from '@mui/material';
import { Search as SearchIcon } from '../../icons/search';

export const CustomerListToolbar = (props) => {
  return (
    <>
    <Box>
      <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', m: -1 }}>
        <Typography sx={{ m: 1 }} variant="h4">
          Customer
        </Typography>
        <Box sx={{ m: 1 }}>
          <Button color="primary" variant="contained">
            Create Customer
          </Button>
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
                        color="action"
                        fontSize="small"
                      >
                        <SearchIcon />
                      </SvgIcon>
                    </InputAdornment>
                  )
                }}
                placeholder="Search customers"
                variant="outlined"
              />
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  </>
);
};

export default CustomerListToolbar;

