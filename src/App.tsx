import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './services/auth/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import { DemoPanel } from './components/demo/DemoPanel';

// Layouts
import { PublicLayout } from './components/layout/PublicLayout';
import { SellerLayout } from './components/layout/SellerLayout';
import { DriverLayout } from './components/layout/DriverLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { RequireAuth } from './components/layout/RequireAuth';

// Public Pages
import { Landing } from './pages/public/Landing';
import { Login } from './pages/public/Login';
import { SignUp } from './pages/public/SignUp';
import { About } from './pages/public/About';
import { Unauthorized } from './pages/public/Unauthorized';
import { NotFound } from './pages/public/NotFound';

// Seller Pages
import { SellerDashboard } from './pages/seller/Dashboard';
import { CreateRequest } from './pages/seller/CreateRequest';
import { SellerOrderDetails } from './pages/seller/OrderDetails';
import { SellerProfile } from './pages/seller/Profile';

// Driver Pages
import { DriverDashboard } from './pages/driver/Dashboard';
import { DriverRequestDetails } from './pages/driver/RequestDetails';
import { ActiveDelivery } from './pages/driver/ActiveDelivery';
import { DriverProfilePage } from './pages/driver/Profile';

// Admin Pages
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminDriverManagement } from './pages/admin/DriverManagement';
import { AdminDriverVerification } from './pages/admin/DriverVerification';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <div className="relative min-h-screen flex flex-col font-sans">
            <Routes>
              {/* Public Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/about" element={<About />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
              </Route>

              {/* Seller Protected Routes */}
              <Route element={<RequireAuth allowedRoles={['SELLER']} />}>
                <Route element={<SellerLayout />}>
                  <Route path="/seller" element={<SellerDashboard />} />
                  <Route path="/seller/requests/new" element={<CreateRequest />} />
                  <Route path="/seller/requests/:id" element={<SellerOrderDetails />} />
                  <Route path="/seller/profile" element={<SellerProfile />} />
                </Route>
              </Route>

              {/* Driver Protected Routes */}
              <Route element={<RequireAuth allowedRoles={['DRIVER']} />}>
                <Route element={<DriverLayout />}>
                  <Route path="/driver" element={<DriverDashboard />} />
                  <Route path="/driver/requests/:id" element={<DriverRequestDetails />} />
                  <Route path="/driver/active" element={<ActiveDelivery />} />
                  <Route path="/driver/profile" element={<DriverProfilePage />} />
                </Route>
              </Route>

              {/* Admin Protected Routes */}
              <Route element={<RequireAuth allowedRoles={['ADMIN']} />}>
                <Route element={<AdminLayout />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/drivers" element={<AdminDriverManagement />} />
                  <Route path="/admin/drivers/:id" element={<AdminDriverVerification />} />
                </Route>
              </Route>

              {/* 404 Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>

            {/* Persistent Prototype Testing & Demo Control Panel */}
            <DemoPanel />
          </div>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
