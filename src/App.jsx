import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// Import all pages
import Home from './pages/home';
import Login from './pages/login';
import Register from './components/Register';
import AdminPanel from './pages/adminpanel';
import UserManagement from './pages/UserManagement';
import Unauthorized from './pages/Unauthorized';
import LandingPage from './pages/home';
import Profile from './pages/profile';
import ProductsPage from './pages/ProductsPage';
import ProductCatalogPage from './pages/ProductCatalogPage';
import Contact from './pages/contact';
import CartPage from './pages/cart';
import AdminLogin from './pages/AdminLogin';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Navbar />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected routes - require authentication */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:category/:subcategory" element={<ProductCatalogPage />} />
            <Route path="/cart" element={<CartPage />} />
          </Route>

          {/* Admin-only routes */}
          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/create-user" element={<Register />} />
          </Route>
        </Routes>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;