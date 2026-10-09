import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import Dashboard from "./pages/dashboard/Dashboard";
import Customers from "./pages/customers/Customers";
import Products from "./pages/products/Products";
import Inventory from "./pages/inventory/Inventory";
import Sales from "./pages/sales/Sales";
import Payments from "./pages/payments/Payments";
import Invoices from "./pages/invoices/Invoices";
import WhatsApp from "./pages/whatsapp/Whatsapp";
function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* AUTH */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* DASHBOARD */}

        <Route
          path="/dashboard"
          element={
            <MainLayout>
              <Dashboard />
            </MainLayout>
          }
        />

        {/* PRODUCTS */}

        <Route
          path="/products"
          element={
            <MainLayout>
              <Products />
            </MainLayout>
          }
        />

        {/* CUSTOMERS */}

        <Route
          path="/customers"
          element={
            <MainLayout>
              <Customers />
            </MainLayout>
          }
        />

        {/* DEFAULT */}

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

        {/* UNKNOWN URL */}

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

        <Route
  path="/inventory"
  element={<Inventory />}
/>
<Route path="/sales" element={<Sales />} />
<Route path="/payments" element={<Payments />} />
<Route path="/invoices" element={<Invoices />} />
<Route path="/whatsapp" element={<WhatsApp />} />

      </Routes>
    </BrowserRouter>
  );

}

export default App;