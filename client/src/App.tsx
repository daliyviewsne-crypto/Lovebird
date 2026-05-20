import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MatchProvider } from './context/MatchContext';

// Screens
import LoginScreen from './screens/LoginScreen';
import DiscoveryScreen from './screens/DiscoveryScreen';
import LikesScreen from './screens/LikesScreen';
import MatchesScreen from './screens/MatchesScreen';
import ChatScreen from './screens/ChatScreen';
import ProfileScreen from './screens/ProfileScreen';

import './App.css';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function AppContent() {
  return (
    <div className="app">
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route
          path="/discover"
          element={
            <ProtectedRoute>
              <DiscoveryScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/likes"
          element={
            <ProtectedRoute>
              <LikesScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/matches"
          element={
            <ProtectedRoute>
              <MatchesScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat/:matchId"
          element={
            <ProtectedRoute>
              <ChatScreen matchId="" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfileScreen />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/discover" />} />
      </Routes>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

const BottomNav: React.FC = () => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return null;

  return (
    <nav className="bottom-nav">
      <a href="/discover" className="nav-item">
        <span className="icon">🔥</span>
        <span className="label">Discover</span>
      </a>
      <a href="/likes" className="nav-item">
        <span className="icon">❤️</span>
        <span className="label">Likes</span>
      </a>
      <a href="/matches" className="nav-item">
        <span className="icon">💬</span>
        <span className="label">Matches</span>
      </a>
      <a href="/profile" className="nav-item">
        <span className="icon">👤</span>
        <span className="label">Profile</span>
      </a>
    </nav>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MatchProvider>
          <AppContent />
        </MatchProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
