import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';
import OwnerLayout from './components/owner/OwnerLayout';
import LoginPage from './pages/LoginPage';
import Analytics from './pages/admin/Analytics';
import Dashboard from './pages/admin/Dashboard';
import Profile from './pages/admin/Profile';
import LicenseVerification from './pages/admin/LicenseVerification';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import CreateHostel from './pages/owner/CreateHostel';
import HomePage from './pages/HomePage';
import HostelDetailPage from './pages/HostelDetailPage';
import MyBookings from './pages/guest/MyBookings';
import MyProfile from './pages/guest/MyProfile';
import Support from './pages/guest/Support';
import GuestLayout from './components/guest/GuestLayout';
import ManageRenters from './pages/owner/ManageRenters';
import VerifyPayments from './pages/owner/VerifyPayments';

const AdminRoute = ({ children }) => (
  <ProtectedRoute requiredRole="Super Admin">
    <AdminLayout>{children}</AdminLayout>
  </ProtectedRoute>
);

const OwnerRoute = ({ children }) => (
  <ProtectedRoute requiredRole="Owner">
    <OwnerLayout>{children}</OwnerLayout>
  </ProtectedRoute>
);

const GuestRoute = ({ children }) => (
  <ProtectedRoute requiredRole="Guest">
    <GuestLayout>{children}</GuestLayout>
  </ProtectedRoute>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/hostels/:id" element={<HostelDetailPage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route path="/guest/bookings" element={<GuestRoute><MyBookings /></GuestRoute>} />
          <Route path="/guest/profile"  element={<GuestRoute><MyProfile /></GuestRoute>} />
          <Route path="/guest/support"  element={<GuestRoute><Support /></GuestRoute>} />
          <Route path="/guest"          element={<Navigate to="/guest/bookings" replace />} />

          <Route path="/admin/analytics"  element={<AdminRoute><Analytics /></AdminRoute>} />
          <Route path="/admin/users"      element={<AdminRoute><Dashboard /></AdminRoute>} />
          <Route path="/admin/profile"    element={<AdminRoute><Profile /></AdminRoute>} />
          <Route path="/admin/licenses"   element={<AdminRoute><LicenseVerification /></AdminRoute>} />

          <Route path="/owner/hostels"          element={<OwnerRoute><OwnerDashboard /></OwnerRoute>} />
          <Route path="/owner/hostels/new"      element={<OwnerRoute><CreateHostel /></OwnerRoute>} />
          <Route path="/owner/hostels/edit/:id" element={<OwnerRoute><CreateHostel /></OwnerRoute>} />
          <Route path="/owner/bookings"  element={<OwnerRoute><ManageRenters /></OwnerRoute>} />
          <Route path="/owner/payments"  element={<OwnerRoute><VerifyPayments /></OwnerRoute>} />
          <Route path="/owner/profile"    element={<OwnerRoute><Profile /></OwnerRoute>} />
          <Route path="/owner"            element={<Navigate to="/owner/hostels" replace />} />

          <Route path="/admin/dashboard"  element={<Navigate to="/admin/analytics" replace />} />
          <Route path="/admin"            element={<Navigate to="/admin/analytics" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
