import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Notices from "./pages/Notices";
import Complaints from "./pages/Complaints";
import Certificates from "./pages/Certificates";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import VendorDashboard from "./pages/VendorDashboard";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/notices" element={<Notices />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />

        <Route path="/complaints" element={
          <ProtectedRoute roles={["citizen"]}><Complaints /></ProtectedRoute>
        } />
        <Route path="/certificates" element={
          <ProtectedRoute roles={["citizen"]}><Certificates /></ProtectedRoute>
        } />
        <Route path="/cart" element={
          <ProtectedRoute roles={["citizen"]}><Cart /></ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute roles={["citizen"]}><Orders /></ProtectedRoute>
        } />
        <Route path="/vendor" element={
          <ProtectedRoute roles={["vendor"]}><VendorDashboard /></ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>
        } />
      </Routes>
      <footer style={{color:"wheat",backgroundColor:"black",fontFamily:'cursive'}}>CivicMart &copy; 2026 — A unified E-Governance &amp; E-Commerce platform.</footer>
    </>
  );
}
