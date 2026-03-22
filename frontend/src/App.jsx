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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route path="/admin/analytics"  element={<AdminRoute><Analytics /></AdminRoute>} />
          <Route path="/admin/users"      element={<AdminRoute><Dashboard /></AdminRoute>} />
          <Route path="/admin/profile"    element={<AdminRoute><Profile /></AdminRoute>} />
          <Route path="/admin/licenses"   element={<AdminRoute><LicenseVerification /></AdminRoute>} />

          <Route path="/owner/hostels"          element={<OwnerRoute><OwnerDashboard /></OwnerRoute>} />
          <Route path="/owner/hostels/new"      element={<OwnerRoute><CreateHostel /></OwnerRoute>} />
          <Route path="/owner/hostels/edit/:id" element={<OwnerRoute><CreateHostel /></OwnerRoute>} />
          <Route path="/owner/bookings"   element={<OwnerRoute>
            <div className="px-8 py-8"><h1 className="text-2xl font-bold text-gray-900">Bookings</h1><p className="text-gray-400 mt-2 text-sm">Coming soon.</p></div>
          </OwnerRoute>} />
          <Route path="/owner/payments"   element={<OwnerRoute>
            <div className="px-8 py-8"><h1 className="text-2xl font-bold text-gray-900">Payment Requests</h1><p className="text-gray-400 mt-2 text-sm">Coming soon.</p></div>
          </OwnerRoute>} />
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
