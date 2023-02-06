import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './_App'
import reportWebVitals from './reportWebVitals'
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles'
import { theme } from './components/theme';
import { Provider } from 'react-redux';
import store from './store/index';
import { SolanaWalletAdapterContext } from "./context/solana-wallet-adapter-context";
require('@solana/wallet-adapter-react-ui/styles.css');

const root = ReactDOM.createRoot(document.getElementById('root'))


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

reportWebVitals()
