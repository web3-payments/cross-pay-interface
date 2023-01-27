import React, { useCallback, useMemo } from 'react'
import ReactDOM from 'react-dom/client'
import App from './_App'
import reportWebVitals from './reportWebVitals'
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles'
import { theme } from './components/theme';
import { Provider } from 'react-redux';
import store from './store/index';
import { clusterApiUrl } from '@solana/web3.js';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';

import { LedgerWalletAdapter, PhantomWalletAdapter, SlopeWalletAdapter, SolflareWalletAdapter, TorusWalletAdapter, UnsafeBurnerWalletAdapter } from '@solana/wallet-adapter-wallets';

import {
  WalletModalProvider,
} from '@solana/wallet-adapter-react-ui';

require('@solana/wallet-adapter-react-ui/styles.css');



const root = ReactDOM.createRoot(document.getElementById('root'))

const SolanaWalletAdapterContext = ({ children }) => {
  // The network can be set to 'localnet','devnet', 'testnet', or 'mainnet-beta'.
  const network = process.env.REACT_APP_CLUSTER;


  const endpoint = useMemo(() => {
    if (network === "localnet") {
      return 'http://localhost:8899';
    }
    return clusterApiUrl(network)
  }, [network]);


  const wallets = useMemo(
    () => [

      new PhantomWalletAdapter(),
      new SlopeWalletAdapter(),
      new SolflareWalletAdapter({ network }),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter({}),

    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [network]
  );


  const onError = useCallback(
    (error, adapter) => {
      console.error(error, adapter);
    },
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} onError={onError} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

root.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <React.StrictMode>
      <Provider store={store}>
        <SolanaWalletAdapterContext>
          <App />
        </SolanaWalletAdapterContext>
      </Provider>
    </React.StrictMode>
  </ThemeProvider>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
