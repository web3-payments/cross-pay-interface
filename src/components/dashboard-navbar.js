import * as React from 'react';
import { useRef, useState } from 'react';
import axios from "axios";
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
import MenuIcon from '@mui/icons-material/Menu';
import { AccountPopover } from './account-popover';
import { useSelector, useDispatch } from 'react-redux';
import { userActions } from '../store/index';
import { config } from "../config";
import { getWalletProvider } from "../utils/ethereum-wallet-provider";
import { ethers } from 'ethers';

require('dotenv').config()

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
  //## redux stuff
  const dispatch = useDispatch();
  const userAddress = useSelector((state) => state.address);
  const isConnected = useSelector((state) => state.isConnected);


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
  // const [account, setAccount] = useState();
  const [network, setNetwork] = useState();

  const connectWallet = async () => {
    let provider;
    let library;
    let accounts;
    let network;
    try {
      provider = await getWalletProvider().connect();
      library = new ethers.providers.Web3Provider(provider);
      accounts = await library.listAccounts();
      network = await library.getNetwork();
    } catch (error) {
      console.error(error);
    }
    setProvider(provider);
    setLibrary(library);
    setNetwork(network);

    console.log(network);

    if (accounts) {
      const address = accounts[0];
      const signature = await signMessage(library)
      .catch((error) => {
        console.error(error)
      });
      console.log(new Date().getTime())
      const newUser = {
        wallets: [
          {
            name: "Default Account",
            blockchain: "Ethereum", // TODO: enable other login accounts, for now only Ethereum account
            chainId: network.chainId, 
            address: address,
            createdAt: new Date().getTime()
          }
        ],
        signature: signature,
        signerAddress: address
      };
      checkAndCreateUser(newUser).catch((error) => {
        console.error(error)
      })
      dispatch(userActions.userAccount(address));
      dispatch(userActions.connecion());
      localStorage.setItem("userAddress", address);
    }
  }; 

  const signMessage = async (library) => {
    try {
      const signature = await library.provider.request({
        method: "personal_sign",
        params: ["Log in CrossPay", userAddress]
      });
      return signature;
    } catch (error) {
      console.log(error);
    }
  };
  
  const checkAndCreateUser = async (newUser) => {
    await axios
      .get(`${config.contextRoot}/user/${newUser.signerAddress}`)
      .then(function (response) {
        console.log(response);
        if(response.status === 200){
          console.log("User already register")
          return;
        }
      }).catch(function (error) {
        if(error.response.status === 404){
          createUser(newUser).catch((error) => {
            console.error(error)
          })
        }
      });
  }
  
  const createUser = async (newUser) => {
    await axios
      .post(`${config.contextRoot}/user`, newUser)
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  const disconnect = async () => {
    await getWalletProvider().clearCachedProvider();
    localStorage.clear();
    dispatch(userActions.connecion());
    refreshState();
  };


  const refreshState = () => {
    // setAccount();
    //setChainId();
    setNetwork("");
    //setMessage("");
    //setSignature("");
    //setVerified(undefined);
  };

  return (
    <>
      <DashboardNavbarRoot sx={{ left: { lg: 280 }, width: { lg: 'calc(100% - 280px)' } }} {...other}>
        <Toolbar disableGutters sx={{ minHeight: 64, left: 0, px: 2 }}>
          <IconButton onClick={onSidebarOpen} sx={{ display: { xs: 'inline-flex', lg: 'none' } }}>
            <MenuIcon fontSize="small" />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <>
            {!isConnected ? (
              <Button variant="outlined" onClick={connectWallet}>
                Connect Wallet
              </Button>) : (
              <Button variant="outlined" color='success'
                onClick={() => setOpenAccountPopover(true)}
                ref={settingsRef}
                sx={{
                  cursor: 'pointer',
                  ml: 1
                }}>
                Connected
              </Button>
            )}
          </>
          {/* <Button variant="outlined" 
            onClick={handleClickOpen}
            sx={{
              cursor: 'pointer',
              ml: 1
            }}>
            Connect
          </Button> 
          <SimpleDialog
            selectedValue={selectedValue}
            open={open}
            onClose={handleClose}
          />*/}
        </Toolbar>
      </DashboardNavbarRoot>
      <AccountPopover
        disconnect={disconnect}
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
