import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Box, MenuItem, MenuList, Popover, Typography } from '@mui/material';

export const AccountPopover = (props) => {
  const userAddress = useSelector((state) => state.address);

  const { anchorEl, onClose, open } = props;

  const handleSignOut = async () => {
    onClose?.();
    props.disconnect();
  };

  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{
        horizontal: 'left',
        vertical: 'bottom'
      }}
      onClose={onClose}
      open={open}
      PaperProps={{
        sx: { width: '340px' }
      }}
    >
      <Box
        sx={{
          py: 1.5,
          px: 2
        }}
      >
        <Typography variant="overline">
          Account
        </Typography>
        <Typography
          color="text.secondary"
          variant="body2"
        >
          {userAddress}
        </Typography>
      </Box>
      <MenuList
        disablePadding
        sx={{
          '& > *': {
            '&:first-of-type': {
              borderTopColor: 'divider',
              borderTopStyle: 'solid',
              borderTopWidth: '1px'
            },
            padding: '12px 16px'
          }
        }}
      >
        <MenuItem onClick={handleSignOut}>
          Disconect
        </MenuItem>
      </MenuList>
    </Popover>
  );
};