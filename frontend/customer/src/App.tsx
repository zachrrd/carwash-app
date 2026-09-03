import { BrowserRouter, Routes, Route } from "react-router-dom";

import Register from "@/pages/Register";
import Login from "@/pages/Login";
import LandingPage from "@/pages/LandingPage";
import Dashboard from "@/pages/Dashboard";
import Services from "@/pages/Services";
import ServiceDetail from "@/pages/ServiceDetail";
import CreateOrder from "@/pages/CreateOrder";
import Orders from "@/pages/Orders";
import OrderDetail from "@/pages/OrderDetail";
import OrderHistory from "@/pages/OrderHistory";
import Profile from "@/pages/Profile";
import InvoiceDetail from "@/pages/InvoiceDetail";

import ProtectedRoute from "@/components/ProtectedRoute";
import GuestRoute from "@/components/GuestRoute";
import CustomerLayout from "@/components/customer/CustomerLayout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<CustomerLayout />}>
            <Route path="/home" element={<Dashboard />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:id" element={<ServiceDetail />} />
            <Route path="/orders/create" element={<CreateOrder />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/orders-history" element={<OrderHistory />} />
            <Route path="/invoices/:id" element={<InvoiceDetail />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}