import { Avatar, Box, Divider, Drawer, useMediaQuery } from '@mui/material';
import { ChartBar as ChartBarIcon } from '../icons/chart-bar';
import { Cog as CogIcon } from '../icons/cog';
import { ShoppingBag as ShoppingBagIcon } from '../icons/shopping-bag';
import { User as UserIcon } from '../icons/user';
import WalletIcon from '@mui/icons-material/Wallet';
import { Users as UsersIcon } from '../icons/users';
import PaymentsIcon from '@mui/icons-material/Payments';
import InvoiceIcon from '@mui/icons-material/Receipt';
import { Logo } from './logo';
import { NavItem } from './nav-item';

const items = [
  {
    href: '/',
    icon: (<ChartBarIcon />),
    title: 'Dashboard'
  },
  {
    href: '/payments',
    icon: (<PaymentsIcon />),
    title: 'Payments Links'
  },
  {
    href: '/invoices',
    icon: (<InvoiceIcon />),
    title: 'Invoices'
  },
  {
    href: '/customers',
    icon: (<UsersIcon />),
    title: 'Customers'
  },
  {
    href: '/products',
    icon: (<ShoppingBagIcon />),
    title: 'Products'
  },
  {
    href: '/accounts',
    icon: (<UserIcon />),
    title: 'Account'
  },
  {
    href: '/wallets',
    icon: (<WalletIcon />),
    title: 'Wallets'
  },
  {
    href: '/settings',
    icon: (<CogIcon />),
    title: 'Settings'
  }
];

export const DashboardSidebar = (props) => {
  const { open, onClose } = props;
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'), {
    defaultMatches: true,
    noSsr: false
  });

  const content = (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div>
          <Box sx={{ p: 3, paddingBottom: 0}}>
            <a href='/'>
              <Avatar src="/static/CrosspAY.png" sx={{ height: 64, mb: 2, width: 64 }}/>
            </a>
          </Box>
        </div>
        <Divider
          sx={{
            borderColor: '#2D3748',
            my: 3
          }}
        />
        <Box sx={{ flexGrow: 1 }}>
          {items.map((item) => (
            <NavItem
              key={item.title}
              icon={item.icon}
              href={item.href}
              title={item.title}
            />
          ))}
        </Box>
       
      </Box>
    </>
  );

  if (lgUp) {
    return (
      <Drawer
        anchor="left"
        open
        PaperProps={{
          sx: {
            backgroundColor: 'neutral.900',
            color: '#FFFFFF',
            width: 280
          }
        }}
        variant="permanent"
      >
        {content}
      </Drawer>
    );
  }

  return (
    <Drawer
      anchor="left"
      onClose={onClose}
      open={open}
      PaperProps={{
        sx: {
          backgroundColor: 'neutral.900',
          color: '#FFFFFF',
          width: 280
        }
      }}
      sx={{ zIndex: (theme) => theme.zIndex.appBar + 100 }}
      variant="temporary"
    >
      {content}
    </Drawer>
  );
};