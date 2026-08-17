import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "@/layouts/MainLayout";

import Dashboard from "@/pages/Dashboard";
import Customers from "@/pages/Customers";
import Vehicles from "@/pages/Vehicles";
import Services from "@/pages/Services";
import Orders from "@/pages/Orders";
import Payments from "@/pages/Payments";
import OrderHistory from "@/pages/OrderHistory";
import Staffs from "@/pages/Staff";
import Login from "@/pages/Login";
import Invoices from "@/pages/Invoices";

import ProtectedRoute from "@/components/ProtectedRoute";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ========================= */}
        {/* PUBLIC */}
        {/* ========================= */}

        <Route path="/login" element={<Login />} />

        {/* ========================= */}
        {/* LOGIN REQUIRED */}
        {/* ========================= */}

        <Route element={<ProtectedRoute />}>
          {/* MAIN LAYOUT */}
          <Route element={<MainLayout />}>
            {/* ========================= */}
            {/* ADMIN + CASHIER */}
            {/* ========================= */}

            <Route path="/" element={<Dashboard />} />

            <Route path="/customers" element={<Customers />} />

            <Route path="/vehicles" element={<Vehicles />} />

            <Route path="/orders" element={<Orders />} />

            <Route path="/payments" element={<Payments />} />

            <Route path="/history" element={<OrderHistory />} />
            <Route path="/invoices/:id" element={<Invoices />} />

            {/* ========================= */}
            {/* ADMIN ONLY */}
            {/* ========================= */}

            <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
              <Route path="/services" element={<Services />} />

              <Route path="/staffs" element={<Staffs />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
