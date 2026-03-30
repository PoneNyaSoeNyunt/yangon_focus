import React from 'react';
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
import ReportManagement from './pages/admin/ReportManagement';
import AdminReports from './pages/admin/AdminReports';
import AdminComments from './pages/admin/AdminComments';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import CreateHostel from './pages/owner/CreateHostel';
import HomePage from './pages/HomePage';
import HostelDetailPage from './pages/HostelDetailPage';
import AboutUs from './pages/public/AboutUs';
import ContactUs from './pages/public/ContactUs';
import HelpDesk from './pages/admin/HelpDesk';
import MyBookings from './pages/guest/MyBookings';
import MyProfile from './pages/guest/MyProfile';
import Support from './pages/guest/Support';
import CurrentStay from './pages/guest/CurrentStay';
import StayDetail from './pages/guest/StayDetail';
import GuestLayout from './components/guest/GuestLayout';
import ManageBookings from './pages/owner/ManageBookings';
import ManageRenters from './pages/owner/ManageRenters';
import OwnerMyProfile from './pages/owner/MyProfile';
import VerifyPayments from './pages/owner/VerifyPayments';
import OwnerSupport from './pages/owner/OwnerSupport';
import OwnerReviews from './pages/owner/OwnerReviews';
import RegisterWizard from './pages/RegisterWizard';

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

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
            <p className="text-red-500 font-semibold mb-2">Something went wrong</p>
            <p className="text-xs text-gray-400 font-mono break-all mb-4">{this.state.error?.message}</p>
            <button onClick={() => this.setState({ hasError: false, error: null })} className="px-4 py-2 bg-teal-500 text-white text-sm rounded-xl hover:bg-teal-600 transition">Try again</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <ErrorBoundary>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/hostels/:id" element={<HostelDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterWizard />} />

          <Route path="/guest/current-stay"     element={<GuestRoute><CurrentStay /></GuestRoute>} />
          <Route path="/guest/current-stay/:id" element={<GuestRoute><StayDetail /></GuestRoute>} />
          <Route path="/guest/bookings"    element={<GuestRoute><MyBookings /></GuestRoute>} />
          <Route path="/guest/profile"     element={<GuestRoute><MyProfile /></GuestRoute>} />
          <Route path="/guest/support"     element={<GuestRoute><Support /></GuestRoute>} />
          <Route path="/guest"             element={<Navigate to="/guest/bookings" replace />} />

          <Route path="/admin/analytics"  element={<AdminRoute><Analytics /></AdminRoute>} />
          <Route path="/admin/users"      element={<AdminRoute><Dashboard /></AdminRoute>} />
          <Route path="/admin/profile"    element={<AdminRoute><Profile /></AdminRoute>} />
          <Route path="/admin/licenses"   element={<AdminRoute><LicenseVerification /></AdminRoute>} />
          <Route path="/admin/reports"    element={<AdminRoute><ReportManagement /></AdminRoute>} />
          <Route path="/admin/dispute"   element={<AdminRoute><AdminReports /></AdminRoute>} />
          <Route path="/admin/helpdesk"  element={<AdminRoute><HelpDesk /></AdminRoute>} />

          <Route path="/owner/hostels"          element={<OwnerRoute><OwnerDashboard /></OwnerRoute>} />
          <Route path="/owner/hostels/new"      element={<OwnerRoute><CreateHostel /></OwnerRoute>} />
          <Route path="/owner/hostels/edit/:id" element={<OwnerRoute><CreateHostel /></OwnerRoute>} />
          <Route path="/owner/bookings"  element={<OwnerRoute><ManageBookings /></OwnerRoute>} />
          <Route path="/owner/renters"   element={<OwnerRoute><ManageRenters /></OwnerRoute>} />
          <Route path="/owner/payments"  element={<OwnerRoute><VerifyPayments /></OwnerRoute>} />
          <Route path="/owner/profile"    element={<OwnerRoute><OwnerMyProfile /></OwnerRoute>} />
          <Route path="/owner/reviews"   element={<OwnerRoute><OwnerReviews /></OwnerRoute>} />
          <Route path="/owner/support"    element={<OwnerRoute><OwnerSupport /></OwnerRoute>} />
          <Route path="/owner"            element={<Navigate to="/owner/hostels" replace />} />

          <Route path="/admin/dashboard"  element={<Navigate to="/admin/analytics" replace />} />
          <Route path="/admin"            element={<Navigate to="/admin/analytics" replace />} />
        </Routes>
        </ErrorBoundary>
      </Router>
    </AuthProvider>
  );
}

export default App;
