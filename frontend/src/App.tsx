import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import type { UserRoleType } from '@/types';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import CustomerDashboard from '@/pages/customer/CustomerDashboard';
import SellerDashboard from '@/pages/seller/SellerDashboard';
import RiderDashboard from '@/pages/rider/RiderDashboard';
import Payment from '@/pages/Payment';
import ProfilePage from '@/pages/ProfilePage';   // <-- new import

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key');

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: UserRoleType[] }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function DashboardRouter() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case UserRole.CUSTOMER:
      return <CustomerDashboard />;
    case UserRole.SELLER:
      return <SellerDashboard />;
    case UserRole.RIDER:
      return <RiderDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
}

function App() {
  return (
    <AuthProvider>
      <Elements stripe={stripePromise}>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardRouter />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/*"
              element={
                <ProtectedRoute allowedRoles={[UserRole.CUSTOMER]}>
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/*"
              element={
                <ProtectedRoute allowedRoles={[UserRole.SELLER]}>
                  <SellerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rider/*"
              element={
                <ProtectedRoute allowedRoles={[UserRole.RIDER]}>
                  <RiderDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment/:orderId"
              element={
                <ProtectedRoute allowedRoles={[UserRole.CUSTOMER]}>
                  <Payment />
                </ProtectedRoute>
              }
            />
            {/* New profile route - accessible to any authenticated user */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </Elements>
    </AuthProvider>
  );
}

export default App;
