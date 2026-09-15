import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

// Lazy-loaded pages for code splitting
const LandingPage      = lazy(() => import('./pages/LandingPage'));
const LoginPage        = lazy(() => import('./pages/LoginPage'));
const RegisterPage     = lazy(() => import('./pages/RegisterPage'));
const DashboardPage    = lazy(() => import('./pages/DashboardPage'));
const EventDetailPage  = lazy(() => import('./pages/EventDetailPage'));
const CreateEventPage  = lazy(() => import('./pages/CreateEventPage'));
const EditEventPage    = lazy(() => import('./pages/EditEventPage'));
const ProfilePage      = lazy(() => import('./pages/ProfilePage'));

const PageLoader = () => (
  <div className="loader-page">
    <div className="spinner" />
    <p style={{ color: 'var(--text-2)', fontSize: 14 }}>Loading…</p>
  </div>
);

export default function App() {
  const { loading } = useAuth();

  if (loading) return <PageLoader />;

  return (
    <>
      <Navbar />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/"             element={<LandingPage />} />
          <Route path="/login"        element={<LoginPage />} />
          <Route path="/register"     element={<RegisterPage />} />
          <Route path="/events"       element={<DashboardPage />} />
          <Route path="/events/:id"   element={<EventDetailPage />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/events/create"    element={<CreateEventPage />} />
            <Route path="/events/:id/edit"  element={<EditEventPage />} />
            <Route path="/profile"          element={<ProfilePage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <Footer />
    </>
  );
}
