import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';
import LoginPage from './pages/LoginPage';
import Analytics from './pages/admin/Analytics';
import Dashboard from './pages/admin/Dashboard';
import Profile from './pages/admin/Profile';

const AdminRoute = ({ children }) => (
  <ProtectedRoute requiredRole="Super Admin">
    <AdminLayout>{children}</AdminLayout>
  </ProtectedRoute>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Yangon Focus</h1>
                <p className="text-gray-600">Hostel Management Platform</p>
              </div>
            </div>
          } />
          <Route path="/login" element={<LoginPage />} />

          <Route path="/admin/analytics"  element={<AdminRoute><Analytics /></AdminRoute>} />
          <Route path="/admin/users"      element={<AdminRoute><Dashboard /></AdminRoute>} />
          <Route path="/admin/profile"    element={<AdminRoute><Profile /></AdminRoute>} />
          <Route path="/admin/licenses"   element={<AdminRoute>
            <div className="px-8 py-8"><h1 className="text-2xl font-bold text-gray-900">Business Licenses</h1><p className="text-gray-400 mt-2 text-sm">Coming soon.</p></div>
          </AdminRoute>} />

          <Route path="/admin/dashboard"  element={<Navigate to="/admin/analytics" replace />} />
          <Route path="/admin"            element={<Navigate to="/admin/analytics" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
