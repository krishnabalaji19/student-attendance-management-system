import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import LoadingSpinner from './components/common/LoadingSpinner';

// Pages
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import MarkAttendancePage from './pages/MarkAttendancePage';
import AttendanceReportsPage from './pages/AttendanceReportsPage';
import LeaveRequestsPage from './pages/LeaveRequestsPage';
import ManageUsersPage from './pages/ManageUsersPage';
import ManageClassesPage from './pages/ManageClassesPage';
import ProfilePage from './pages/ProfilePage';
import NotFound from './pages/NotFound';

const ProtectedLayout = () => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner label="Authenticating user session..." />;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        <Sidebar />
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const DashboardRouter = () => {
  const { user } = useAuth();

  if (user?.role === 'admin') return <AdminDashboard />;
  if (user?.role === 'teacher') return <TeacherDashboard />;
  return <StudentDashboard />;
};

const RoleRoute = ({ roles, children }) => {
  const { user } = useAuth();
  if (!roles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardRouter />} />
        
        <Route
          path="/mark-attendance"
          element={
            <RoleRoute roles={['admin', 'teacher']}>
              <MarkAttendancePage />
            </RoleRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <RoleRoute roles={['admin', 'teacher']}>
              <AttendanceReportsPage />
            </RoleRoute>
          }
        />

        <Route path="/leave-requests" element={<LeaveRequestsPage />} />

        <Route
          path="/manage-users"
          element={
            <RoleRoute roles={['admin']}>
              <ManageUsersPage />
            </RoleRoute>
          }
        />

        <Route
          path="/manage-classes"
          element={
            <RoleRoute roles={['admin']}>
              <ManageClassesPage />
            </RoleRoute>
          }
        />

        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
