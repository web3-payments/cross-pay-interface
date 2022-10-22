import * as React from 'react';
import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import { AppBar, Avatar, Badge, Box, IconButton, Toolbar, Tooltip } from '@mui/material';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import Button from "@mui/material/Button";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import { blue } from '@mui/material/colors';
import PersonIcon from '@mui/icons-material/Person';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import { Bell as BellIcon } from '../icons/bell';
import { UserCircle as UserCircleIcon } from '../icons/user-circle';
import { Users as UsersIcon } from '../icons/users';
import { AccountPopover } from './account-popover';
// ##
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import WalletConnect from "@walletconnect/web3-provider";
import Web3Modal from "web3modal";
import { ethers } from 'ethers';
// ##

require('dotenv').config()

export const providerOptions = {
  coinbasewallet: {
    package: CoinbaseWalletSDK, 
    options: {
      appName: "Web 3 Modal Demo",
      infuraId: process.env.REACT_APP_INFURA_KEY 
    }
  },
  walletconnect: {
    package: WalletConnect, 
    options: {
      infuraId: process.env.REACT_APP_INFURA_KEY 
    }
  }
 };
 
 const web3Modal = new Web3Modal({
   providerOptions // required
 });

const DashboardNavbarRoot = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[3]
}));

const supportedBlockchains = ["Ethereum", "Solana "];
  
function SimpleDialog(props) {

  const { onClose, selectedValue, open } = props;

  const handleClose = () => {
    onClose(selectedValue);
  };

  const handleListItemClick = (value) => {
    onClose(value);
    //connectWallet();
  };

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>Create Account or Log in</DialogTitle>
      <List sx={{ pt: 0 }}>
        {supportedBlockchains.map((blockchain) => (
          <ListItem
            button
            onClick={() => handleListItemClick(blockchain)}
            key={blockchain}
          >
            <ListItemAvatar>
              {/* TODO: change avatar for icone image */}
              <Avatar sx={{ width: 30, height: 50 }}
                  src="\static\images\chains\ethereum_logo.png">
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={blockchain} />
          </ListItem>
        ))}
      </List>
    </Dialog>
  );
}

SimpleDialog.propTypes = {
 onClose: PropTypes.func.isRequired,
 open: PropTypes.bool.isRequired,
 selectedValue: PropTypes.string.isRequired,
};


export const DashboardNavbar = (props) => {
  const { onSidebarOpen, ...other } = props;
  const settingsRef = useRef(null);
   const [openAccountPopover, setOpenAccountPopover] = useState(false);
   
   const [open, setOpen] = React.useState(false);
   const [selectedValue, setSelectedValue] = React.useState(
     supportedBlockchains[1]
   );
 
   const handleClickOpen = () => {
     setOpen(true);
   };
 
   const handleClose = (value) => {
     setOpen(false);
     setSelectedValue(value);
   };
  
   
  //Wallet connect
  const [provider, setProvider] = useState();
  const [library, setLibrary] = useState();
  const [account, setAccount] = useState();
  const [network, setNetwork] = useState();

  const connectWallet = async () => {
   try {
    const provider = await web3Modal.connect();
    const library = new ethers.providers.Web3Provider(provider);
    const accounts = await library.listAccounts();
    const network = await library.getNetwork();
    setProvider(provider);
    setLibrary(library);
    if (accounts) {
      setAccount(accounts[0]);
    }
    setNetwork(network);
   } catch (error) {
     console.error(error);
   }
 };

 const disconnect = async () => {
  await web3Modal.clearCachedProvider();
  refreshState();
};

const refreshState = () => {
  setAccount();
  //setChainId();
  //setNetwork("");
  //setMessage("");
  //setSignature("");
  //setVerified(undefined);
};

  return (
    <>
      <DashboardNavbarRoot
        sx={{
          left: {
            lg: 280
          },
          width: {
            lg: 'calc(100% - 280px)'
          }
        }}
        {...other}>
        <Toolbar
          disableGutters
          sx={{
            minHeight: 64,
            left: 0,
            px: 2
          }}
        >
          <IconButton
            onClick={onSidebarOpen}
            sx={{
              display: {
                xs: 'inline-flex',
                lg: 'none'
              }
            }}
          >
            <MenuIcon fontSize="small" />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <>
          {!account ? (
          <Button variant="outlined" onClick={connectWallet}>
            Connect Wallet
          </Button>):(
          <Button variant="outlined" onClick={disconnect}>
            Disconect
          </Button>
          )}
          </>
          <Button variant="outlined" 
            onClick={handleClickOpen}
            sx={{
              cursor: 'pointer',
              ml: 1
            }}>
            Connect
          </Button>
          <Button variant="outlined" 
            onClick={() => setOpenAccountPopover(true)}
            ref={settingsRef}
            sx={{
              cursor: 'pointer',
              ml: 1
            }}>
            Connected
          </Button>
          <SimpleDialog
            selectedValue={selectedValue}
            open={open}
            onClose={handleClose}
          />
        </Toolbar>
      </DashboardNavbarRoot>
      <AccountPopover
        anchorEl={settingsRef.current}
        open={openAccountPopover}
        onClose={() => setOpenAccountPopover(false)}
        />
    </>
  );
};

DashboardNavbar.propTypes = {
  onSidebarOpen: PropTypes.func
};
