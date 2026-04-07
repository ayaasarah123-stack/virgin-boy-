import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { FirebaseProvider, ErrorBoundary, useFirebase } from './components/FirebaseProvider';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Matches } from './pages/Matches';
import { Profile } from './pages/Profile';
import { Premium } from './pages/Premium';
import { Login } from './pages/Login';

const AppContent: React.FC = () => {
  const { user, loading, profile } = useFirebase();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rose-50">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-rose-500 rounded-full flex items-center justify-center">
            <Heart className="text-white w-8 h-8 fill-current" />
          </div>
          <p className="text-rose-600 font-medium tracking-tight">Jolie Connect...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  // If user is logged in but hasn't set up profile, force profile setup
  // Except if they are already on the profile page
  const isProfileComplete = !!profile;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Routes>
        <Route path="/" element={isProfileComplete ? <Home /> : <Navigate to="/profile" />} />
        <Route path="/matches" element={isProfileComplete ? <Matches /> : <Navigate to="/profile" />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/premium" element={<Premium />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      {isProfileComplete && <Navbar />}
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <FirebaseProvider>
        <Router>
          <AppContent />
        </Router>
      </FirebaseProvider>
    </ErrorBoundary>
  );
}
