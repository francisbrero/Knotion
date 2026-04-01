import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <Routes>
            <Route
              path="/login"
              element={
                <ProtectedRoute requireAuth={false}>
                  <Login />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}; 