import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import LandingPage from "./pages/home";
import Profile from "./pages/profile";
import Login from "./pages/login";
import ProductsPage from "./pages/ProductsPage";
import ProductCatalogPage from "./pages/ProductCatalogPage";
import ScrollToTop from "./components/ScrollToTop";
import Contact from "./pages/contact";
import Home from "./pages/home";
import CartPage from "./pages/cart";

// Simple authentication context for demo
export const AuthContext = React.createContext();

function RequireAuth({ children }) {
  const { isAuthenticated } = React.useContext(AuthContext);
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <LandingPage />
              </RequireAuth>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />
          <Route
            path="/products"
            element={
              <RequireAuth>
                <ProductsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/products/:category/:subcategory"
            element={
              <RequireAuth>
                <ProductCatalogPage />
              </RequireAuth>
            }
          />
          <Route
            path="/cart"
            element={
              <RequireAuth>
                <CartPage />
              </RequireAuth>
            }
          />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
