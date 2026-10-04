import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Layouts
import MainLayout from './components/layouts/MainLayout';
import AdminLayout from './components/layouts/AdminLayout';

import Home from './pages/Home';
import About from './pages/About';
import Hierarchy from './pages/Hierarchy';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Donate from './pages/Donate';

// Protected Pages (Members / Normal Users)
import Profile from './pages/Profile';
import MyReservations from './pages/MyReservations';
import JoinClub from './pages/JoinClub';

// Protected Pages (Members Only)
import Meetings from './pages/Meetings';
import MeetingDetail from './pages/MeetingDetail';
import MyMeetings from './pages/MyMeetings';
import MemberDirectory from './pages/MemberDirectory';
import ServiceHours from './pages/ServiceHours';
import Documents from './pages/Documents';

// Admin / Board Pages
import Dashboard from './pages/admin/Dashboard';
import EventsManager from './pages/admin/EventsManager';
import MeetingsManager from './pages/admin/MeetingsManager';
import ReservationsManager from './pages/admin/ReservationsManager';
import MembersManager from './pages/admin/MembersManager';
import FinanceLedger from './pages/admin/FinanceLedger';
import DocumentsManager from './pages/admin/DocumentsManager';
import ServiceHoursManager from './pages/admin/ServiceHoursManager';
import ApplicationsManager from './pages/admin/ApplicationsManager';

// ─── Route Guards ─────────────────────────────────────────────────────────────

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse flex flex-col items-center"><div className="w-12 h-12 rounded-full bg-lions-200 mb-4"></div><div className="h-4 w-32 bg-gray-200 rounded"></div></div></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const PublicOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
};

// ─── App Component ────────────────────────────────────────────────────────────

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/organisation" element={<Hierarchy />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:slug" element={<EventDetail />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="/documents" element={<Documents />} />

        {/* Auth Routes */}
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />

        {/* Protected - Any Authenticated */}
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/my-reservations" element={<ProtectedRoute><MyReservations /></ProtectedRoute>} />
        <Route path="/join" element={<ProtectedRoute><JoinClub /></ProtectedRoute>} />

        {/* Protected - Club Members & Above */}
        <Route path="/meetings" element={<ProtectedRoute allowedRoles={['admin', 'board_member', 'club_member']}><Meetings /></ProtectedRoute>} />
        <Route path="/meetings/:id" element={<ProtectedRoute allowedRoles={['admin', 'board_member', 'club_member']}><MeetingDetail /></ProtectedRoute>} />
        <Route path="/my-meetings" element={<ProtectedRoute allowedRoles={['admin', 'board_member', 'club_member']}><MyMeetings /></ProtectedRoute>} />
        <Route path="/directory" element={<ProtectedRoute allowedRoles={['admin', 'board_member', 'club_member']}><MemberDirectory /></ProtectedRoute>} />
        <Route path="/service-hours" element={<ProtectedRoute allowedRoles={['admin', 'board_member', 'club_member']}><ServiceHours /></ProtectedRoute>} />
      </Route>

      {/* Admin / Board Routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin', 'board_member']}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="events" element={<EventsManager />} />
        <Route path="events/:id/reservations" element={<ReservationsManager />} />
        <Route path="meetings" element={<MeetingsManager />} />
        <Route path="members" element={<MembersManager />} />
        <Route path="finances" element={<FinanceLedger />} />
        <Route path="documents" element={<DocumentsManager />} />
        <Route path="service-hours" element={<ServiceHoursManager />} />
        <Route path="applications" element={<ApplicationsManager />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <AppRoutes />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
