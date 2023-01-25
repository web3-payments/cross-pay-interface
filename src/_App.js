import React from 'react'
import axios from 'axios'
import { QueryClient, QueryClientProvider } from 'react-query'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/dashboard'
import PaymentPage from './components/payment-page/payment-page'
import Customer from './pages/customers'
import Payments from './pages/payments'
import Products from './pages/products'
import Accounts from './pages/accounts'
import Settings from './pages/settings'
import ErrorPage from './pages/error'
import { registerChartJs } from './utils/register-chart-js';
import Wallets from './pages/wallets'
import Transactions from './pages/transactions'

registerChartJs();

const queryClient = new QueryClient();

function App() {
    // Add a request interceptor
    axios.interceptors.request.use(
      config => {

        return config
      },
      error => {
        Promise.reject(error)
      }
    )
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/" element={<Dashboard />}/>
            <Route path="/customers" element={<Customer />}/>
            <Route path="/payments" element={<Payments />}/>
            <Route path="/transactions/:paymentHash" element={<Transactions />}/>
            <Route path="/products" element={<Products />}/>
            <Route path="/accounts" element={<Accounts />}/>
            <Route path="/wallets" element={<Wallets />}/>
            <Route path="/settings" element={<Settings />}/>
            <Route path="/error" element={<ErrorPage />}/>
            <Route path="/crypto-payment/:paymentHash" element={<PaymentPage />}/>
          </Routes>
        </Router>
      </QueryClientProvider>
    </>
  )
}

export default App
