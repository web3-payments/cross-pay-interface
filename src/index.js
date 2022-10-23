import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './_App'
import reportWebVitals from './reportWebVitals'
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles'
import { theme } from './components/theme';
import { Provider } from 'react-redux';
import store from './store/index';

const root = ReactDOM.createRoot(document.getElementById('root'))

root.render(
  <ThemeProvider theme={theme}> 
    <CssBaseline />
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>
  </ThemeProvider>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
