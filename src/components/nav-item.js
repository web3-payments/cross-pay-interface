import { useLocation } from "react-router-dom";
import { Box, Button, ListItem } from '@mui/material';

export const NavItem = (props) => {
  const { href, icon, title, ...others } = props;
  const location = useLocation();
  const active = href ? (location.pathname === href) : false;

  return (
    <ListItem disableGutters sx={{ display: 'flex', mb: 0.5, py: 0, px: 2 }} {...others}>
        <Button
          component="a"
          startIcon={icon}
          disableRipple
          href={href}
          sx={{
            backgroundColor: active && 'rgba(255,255,255, 0.08)',
            borderRadius: 1,
            color: active ? 'secondary.main' : 'neutral.300',
            fontWeight: active && 'fontWeightBold',
            justifyContent: 'flex-start',
            px: 3,
            textAlign: 'left',
            textTransform: 'none',
            width: '100%',
            '& .MuiButton-startIcon': {
              color: active ? 'secondary.main' : 'neutral.400'
            },
            '&:hover': {
              backgroundColor: 'rgba(255,255,255, 0.08)'
            }
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            {title}
          </Box>
        </Button>
    </ListItem>
  );
};

export default NavItem;