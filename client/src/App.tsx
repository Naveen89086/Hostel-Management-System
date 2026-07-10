import React from 'react';
import { createBrowserRouter, createRoutesFromElements, RouterProvider, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
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
import { AdminSettingsPage } from './pages/AdminSettingsPage';
import { AdminWardensPage } from './pages/AdminWardensPage';
import { WardenDashboardPage } from './pages/WardenDashboardPage';
import { WardenComplaintsPage } from './pages/WardenComplaintsPage';
import { WardenLeavesPage } from './pages/WardenLeavesPage';
import { WardenAlertsPage } from './pages/WardenAlertsPage';
import { WardenReportsPage } from './pages/WardenReportsPage';
import { StudentActivityPage } from './pages/StudentActivityPage';

const ProtectedRoute = ({ children, allowedRoles }: { children?: React.ReactNode, allowedRoles?: string[] }) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  console.log('--- PROTECTED ROUTE RENDER ---', {
    path: location.pathname,
    isAuthenticated,
    userRole: user?.role,
    allowedRoles,
    isLoading
  });

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950"><Spinner size="lg" /></div>;
  }

  if (!isAuthenticated || !user) {
    console.log('ProtectedRoute REDIRECT TO LOGIN: not authenticated');
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log('ProtectedRoute REDIRECT TO ROOT: role not allowed');
    return <Navigate to="/" replace />;
  }

  console.log('ProtectedRoute PASSING THROUGH TO OUTLET/CHILDREN');
  return <>{children ? children : <Outlet />}</>;
};

// Public Route Wrapper (redirect to dashboard if already logged in)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950"><Spinner size="lg" /></div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Role-based Root Redirect Wrapper
const RoleBasedRedirect = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950"><Spinner size="lg" /></div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'warden') return <Navigate to="/warden/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
};

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route errorElement={<ErrorBoundary />}>
      {/* Public Routes */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      
      {/* Redirect root based on role */}
      <Route path="/" element={<RoleBasedRedirect />} />

      {/* Protected Routes Block */}
      <Route element={<ProtectedRoute />}>
        {/* Routes that share MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="dashboard" element={<StudentDashboardPage />} />
          <Route path="activity" element={<StudentActivityPage />} />
          <Route path="rooms" element={<RoomsPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="notices" element={<NoticesPage />} />
          <Route path="profile" element={<ProfilePage />} />
          
          {/* Admin Only Route */}
          <Route path="admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboardPage /></ProtectedRoute>} />
          <Route path="admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsersPage /></ProtectedRoute>} />
          <Route path="admin/wardens" element={<ProtectedRoute allowedRoles={['admin']}><AdminWardensPage /></ProtectedRoute>} />
          <Route path="admin/rooms" element={<ProtectedRoute allowedRoles={['admin']}><AdminRoomsPage /></ProtectedRoute>} />
          <Route path="admin/requests" element={<ProtectedRoute allowedRoles={['admin']}><RequestsPage /></ProtectedRoute>} />
          <Route path="admin/notices" element={<ProtectedRoute allowedRoles={['admin']}><NoticesPage /></ProtectedRoute>} />
          <Route path="admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><AdminReportsPage /></ProtectedRoute>} />
          <Route path="admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><AdminSettingsPage /></ProtectedRoute>} />

          {/* Warden Only Routes */}
          <Route path="warden/dashboard" element={<ProtectedRoute allowedRoles={['warden']}><WardenDashboardPage /></ProtectedRoute>} />
          <Route path="warden/complaints" element={<ProtectedRoute allowedRoles={['warden']}><WardenComplaintsPage /></ProtectedRoute>} />
          <Route path="warden/leaves" element={<ProtectedRoute allowedRoles={['warden']}><WardenLeavesPage /></ProtectedRoute>} />
          <Route path="warden/alerts" element={<ProtectedRoute allowedRoles={['warden']}><WardenAlertsPage /></ProtectedRoute>} />
          <Route path="warden/insights" element={<ProtectedRoute allowedRoles={['warden']}><ChatPage /></ProtectedRoute>} />
          <Route path="warden/reports" element={<ProtectedRoute allowedRoles={['warden']}><WardenReportsPage /></ProtectedRoute>} />
        </Route>
      </Route>
      
      {/* Fallback */}
      <Route path="*" element={<RoleBasedRedirect />} />
    </Route>
  )
);

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              className: 'dark:bg-surface-800 dark:text-white border border-surface-200 dark:border-surface-700 shadow-xl',
            }} 
          />
          <RouterProvider router={router} />
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
