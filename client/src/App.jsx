import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Trips from './pages/Trips';
import Expenses from './pages/Expenses';
import AI from './pages/AI';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import LoadingSpinner from './components/LoadingSpinner';

const TripDetails = React.lazy(() => import('./pages/TripDetails'));

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="card"><LoadingSpinner /></div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <div className="app-root">
          <Navbar />
          <div className="main-layout">
            <Sidebar />
            <main className="content-area">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/trips" element={<ProtectedRoute><Trips /></ProtectedRoute>} />
                <Route path="/trips/:id" element={<ProtectedRoute><Suspense fallback={<LoadingSpinner />}><TripDetails /></Suspense></ProtectedRoute>} />
                <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
                <Route path="/ai" element={<ProtectedRoute><AI /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </main>
          </div>
          <Footer />
        </div>
      </ToastProvider>
    </AuthProvider>
  );
}
