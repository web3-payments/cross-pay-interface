import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  SvgIcon, Typography
} from '@mui/material';
import { Search as SearchIcon } from '../../icons/search';

export const WalletListToolbar = (props) => {
  return (
    <>
      <Box>
        <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', m: -1 }}>
          <Typography sx={{ mb: 3 }} variant="h4">
            Wallets
          </Typography>
          <Box sx={{ m: 1 }}>
            <Button color="primary" variant="contained">
              Setup New
            </Button>
          </Box>
        </Box>
        <Box sx={{ mt: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ maxWidth: 500 }}>
                <TextField fullWidth placeholder="Search wallets" variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SvgIcon color="action" fontSize="small" >
                          <SearchIcon />
                        </SvgIcon>
                      </InputAdornment>)
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </>
  );
};

export default WalletListToolbar;

