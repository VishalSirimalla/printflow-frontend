import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedStudent, ProtectedAdmin } from './components/ProtectedRoute';

// Auth Pages
import StudentLogin from './pages/auth/StudentLogin';
import StudentRegister from './pages/auth/StudentRegister';
import AdminLogin from './pages/auth/AdminLogin';
import AdminRegister from './pages/auth/AdminRegister';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import UploadPage from './pages/student/UploadPage';
import StudentOrders from './pages/student/StudentOrders';
import StudentOrderDetail from './pages/student/StudentOrderDetail';
import PrintShopsPage from './pages/student/PrintShopsPage';
import StudentProfile from './pages/student/StudentProfile';
import HelpCenter from './pages/student/HelpCenter';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';
import AdminProfile from './pages/admin/AdminProfile';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: { borderRadius: '12px', fontSize: '14px', fontWeight: '500' },
            success: { iconTheme: { primary: '#1d4ed8', secondary: '#fff' } },
          }}
        />
        <Routes>
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Student Auth */}
          <Route path="/login" element={<StudentLogin />} />
          <Route path="/register" element={<StudentRegister />} />

          {/* Admin Auth */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/register" element={<AdminRegister />} />
          {/* Forgot Password */}
<Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Student Protected Routes */}
          <Route path="/dashboard" element={<ProtectedStudent><StudentDashboard /></ProtectedStudent>} />
          <Route path="/upload" element={<ProtectedStudent><UploadPage /></ProtectedStudent>} />
          <Route path="/orders" element={<ProtectedStudent><StudentOrders /></ProtectedStudent>} />
          <Route path="/orders/:id" element={<ProtectedStudent><StudentOrderDetail /></ProtectedStudent>} />
          <Route path="/shops" element={<ProtectedStudent><PrintShopsPage /></ProtectedStudent>} />
          <Route path="/profile" element={<ProtectedStudent><StudentProfile /></ProtectedStudent>} />
          <Route path="/notifications" element={<ProtectedStudent><StudentDashboard /></ProtectedStudent>} />
          <Route path="/help" element={<ProtectedStudent><HelpCenter /></ProtectedStudent>} />

          {/* Admin Protected Routes */}
          <Route path="/admin/dashboard" element={<ProtectedAdmin><AdminDashboard /></ProtectedAdmin>} />
          <Route path="/admin/orders" element={<ProtectedAdmin><AdminOrders /></ProtectedAdmin>} />
          <Route path="/admin/orders/:id" element={<ProtectedAdmin><AdminOrderDetail /></ProtectedAdmin>} />
          <Route path="/admin/profile" element={<ProtectedAdmin><AdminProfile /></ProtectedAdmin>} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
