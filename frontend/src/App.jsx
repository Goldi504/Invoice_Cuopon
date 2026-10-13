// import {
//   BrowserRouter,
//   Routes,
//   Route,
//   Navigate,
// } from "react-router-dom";

// import MainLayout from "./components/layout/MainLayout";

// import Login from "./pages/auth/Login";
// import Register from "./pages/auth/Register";

// import Dashboard from "./pages/dashboard/Dashboard";
// import Customers from "./pages/customers/Customers";
// import Products from "./pages/products/Products";
// import Inventory from "./pages/inventory/Inventory";
// import Sales from "./pages/sales/Sales";
// import Payments from "./pages/payments/Payments";
// import Invoices from "./pages/invoices/Invoices";
// import WhatsApp from "./pages/whatsapp/Whatsapp";
// import Reports from "./pages/reports/Reports";
// import Settings from "./pages/settings/Settings";
// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>

//         {/* AUTH */}

//         <Route
//           path="/login"
//           element={<Login />}
//         />

//         <Route
//           path="/register"
//           element={<Register />}
//         />

//         {/* DASHBOARD */}

//         <Route
//           path="/dashboard"
//           element={
//             <MainLayout>
//               <Dashboard />
//             </MainLayout>
//           }
//         />

//         {/* PRODUCTS */}

//         <Route
//           path="/products"
//           element={
//             <MainLayout>
//               <Products />
//             </MainLayout>
//           }
//         />

//         {/* CUSTOMERS */}

//         <Route
//           path="/customers"
//           element={
//             <MainLayout>
//               <Customers />
//             </MainLayout>
//           }
//         />

//         {/* DEFAULT */}

//         <Route
//           path="/"
//           element={
//             <Navigate
//               to="/login"
//               replace
//             />
//           }
//         />

//         {/* UNKNOWN URL */}

//         <Route
//           path="*"
//           element={
//             <Navigate
//               to="/dashboard"
//               replace
//             />
//           }
//         />

//         <Route
//   path="/inventory"
//   element={<Inventory />}
// />
// <Route path="/sales" element={<Sales />} />
// <Route path="/payments" element={<Payments />} />
// <Route path="/invoices" element={<Invoices />} />
// <Route path="/whatsapp" element={<WhatsApp />} />
// <Route path="/reports" element={<Reports />} />
// <Route path="/settings" element={<Settings />} />

//       </Routes>
//     </BrowserRouter>
//   );

// }

// export default App;

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

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
import Reports from "./pages/reports/Reports";
import Settings from "./pages/settings/Settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Application pages — all use MainLayout */}
        <Route
          path="/dashboard"
          element={
            <MainLayout>
              <Dashboard />
            </MainLayout>
          }
        />

        <Route
          path="/customers"
          element={
            <MainLayout>
              <Customers />
            </MainLayout>
          }
        />

        <Route
          path="/products"
          element={
            <MainLayout>
              <Products />
            </MainLayout>
          }
        />

        <Route path="/inventory" element={<Inventory />} />

        <Route
          path="/sales"
          element={
            // <MainLayout>
              <Sales />
            // </MainLayout>
          }
        />

        <Route
          path="/payments"
          element={
            // <MainLayout>
              <Payments />
            // </MainLayout>
          }
        />

        <Route
          path="/invoices"
          element={
            // <MainLayout>
              <Invoices />
            // </MainLayout>
          }
        />

        <Route
          path="/whatsapp"
          element={
            // <MainLayout>
              <WhatsApp />
            // </MainLayout>
          }
        />

        <Route
          path="/reports"
          element={
            // <MainLayout>
              <Reports />
            // </MainLayout>
          }
        />

        <Route
          path="/settings"
          element={
            // <MainLayout>
              <Settings />
            // </MainLayout>
          }
        />

        {/* Default routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
