import React,{ useCallback, useMemo } from 'react'
import ReactDOM from 'react-dom/client'
import App from './_App'
import reportWebVitals from './reportWebVitals'
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles'
import { theme } from './components/theme';
import { Provider } from 'react-redux';
import store from './store/index';
// import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
// import { clusterApiUrl } from '@solana/web3.js';
// import { UnsafeBurnerWalletAdapter } from '@solana/wallet-adapter-wallets';
// import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
// import { WalletDialogProvider } from '@solana/wallet-adapter-material-ui';



const root = ReactDOM.createRoot(document.getElementById('root'))

// const SolanaWalletAdapterContext = ({ children }) => {
//   // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
//   const network = WalletAdapterNetwork.Devnet;

//   // You can also provide a custom RPC endpoint.
//   const endpoint = useMemo(() => clusterApiUrl(network), [network]);

//   const wallets = useMemo(
//     () => [
//       /**
//        * Wallets that implement either of these standards will be available automatically.
//        *
//        *   - Solana Mobile Stack Mobile Wallet Adapter Protocol
//        *     (https://github.com/solana-mobile/mobile-wallet-adapter)
//        *   - Solana Wallet Standard
//        *     (https://github.com/solana-labs/wallet-standard)
//        *
//        * If you wish to support a wallet that supports neither of those standards,
//        * instantiate its legacy wallet adapter here. Common legacy adapters can be found
//        * in the npm package `@solana/wallet-adapter-wallets`.
//        */
//       new UnsafeBurnerWalletAdapter(),
//     ],
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//     [network]
//   );


//   const onError = useCallback(
//     (error, adapter) => {
//       console.error(error, adapter);
//     },
//     []
//   );

//   return (
//     <ConnectionProvider endpoint={endpoint}>
//       <WalletProvider wallets={wallets} onError={onError} autoConnect>
//         <WalletDialogProvider>{children}</WalletDialogProvider>
//       </WalletProvider>
//     </ConnectionProvider>
//   );
// };

root.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <React.StrictMode>
      <Provider store={store}>
        {/* <SolanaWalletAdapterContext> */}
          <App />
        {/* </SolanaWalletAdapterContext> */}
      </Provider>
    </React.StrictMode>
  </ThemeProvider>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
