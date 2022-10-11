import React from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Main from './pages/Main'
import PaymentPage from './components/payment/paymentPage'
import Customer from './pages/customers'
import Products from './pages/products'
import Accounts from './pages/accounts'
import Settings from './pages/settings'
import Login from './pages/login'
import Register from './pages/register'
import ErrorPage from './pages/404'

const queryClient = new QueryClient()

function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/" element={<Main />}/>
            <Route path="/customers" element={<Customer />}/>
            <Route path="/products" element={<Products />}/>
            <Route path="/accounts" element={<Accounts />}/>
            <Route path="/settings" element={<Settings />}/>
            <Route path="/login" element={<Login />}/>
            <Route path="/register" element={<Register />}/>
            <Route path="/404" element={<ErrorPage />}/>
            <Route path="/crypto-payment/:paymentHash" element={<PaymentPage />}/>
          </Routes>
        </Router>
      </QueryClientProvider>
    </>
  )
}

export default App
