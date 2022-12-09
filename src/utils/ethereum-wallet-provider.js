
// ##
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import WalletConnect from "@walletconnect/web3-provider";
import Web3Modal from "web3modal";
// ##

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

export const web3Modal = new Web3Modal({
  providerOptions // required
});

export function getWalletProvider(){
    return web3Modal;
}