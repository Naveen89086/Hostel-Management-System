import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { MainLayout } from './components/layout/MainLayout';
import { Spinner } from './components/ui/Spinner';
import { ErrorBoundary } from './components/ErrorBoundary';

// Pages
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { RoomsPage } from './pages/RoomsPage';
import { RequestsPage } from './pages/RequestsPage';
import { RequestDetailPage } from './pages/RequestDetailPage';
import { ChatPage } from './pages/ChatPage';
import { NoticesPage } from './pages/NoticesPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminRoomsPage } from './pages/AdminRoomsPage';
import { AdminReportsPage } from './pages/AdminReportsPage';
import { AdminWardensPage } from './pages/AdminWardensPage';
import { WardenDashboardPage } from './pages/WardenDashboardPage';
import { WardenComplaintsPage } from './pages/WardenComplaintsPage';
import { WardenLeavesPage } from './pages/WardenLeavesPage';
import { WardenAlertsPage } from './pages/WardenAlertsPage';
import { WardenReportsPage } from './pages/WardenReportsPage';
import { StudentActivityPage } from './pages/StudentActivityPage';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }: { children?: React.ReactNode, allowedRoles?: string[] }) => {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950"><Spinner size="lg" /></div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children ? children : <Outlet />}</>;
};

// Public Route Wrapper (redirect to dashboard if already logged in)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950"><Spinner size="lg" /></div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <BrowserRouter>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                className: 'dark:bg-surface-800 dark:text-white border border-surface-200 dark:border-surface-700 shadow-xl',
              }} 
            />
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
              
              {/* Redirect root to dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Protected Routes inside MainLayout */}
              <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<StudentDashboardPage />} />
                <Route path="/activity" element={<StudentActivityPage />} />
                <Route path="/rooms" element={<RoomsPage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/notices" element={<NoticesPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                
                {/* Admin Only Route */}
                <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']} />}>
                  <Route path="dashboard" element={<AdminDashboardPage />} />
                  <Route path="users" element={<AdminUsersPage />} />
                  <Route path="wardens" element={<AdminWardensPage />} />
                  <Route path="rooms" element={<AdminRoomsPage />} />
                  <Route path="requests" element={<RequestsPage />} />
                  <Route path="notices" element={<NoticesPage />} />
                  <Route path="reports" element={<AdminReportsPage />} />
                </Route>

                {/* Warden Only Routes */}
                <Route path="/warden" element={<ProtectedRoute allowedRoles={['warden']} />}>
                  <Route path="dashboard" element={<WardenDashboardPage />} />
                  <Route path="complaints" element={<WardenComplaintsPage />} />
                  <Route path="leaves" element={<WardenLeavesPage />} />
                  <Route path="alerts" element={<WardenAlertsPage />} />
                  <Route path="insights" element={<ChatPage />} />
                  <Route path="reports" element={<WardenReportsPage />} />
                </Route>
              </Route>
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
