import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import MotionPage from './pages/MotionPage';
import AuthRedirect from './AuthRedirect';
import { useAuth0 } from "@auth0/auth0-react";

function App() {
  const RequireAuth = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth0();
    if (isLoading) return null;
    if (!isAuthenticated) return null; // guest will be sent to / by the root redirect
    return children;
  };


  return (
      <Routes>
        {/* Redirect to Auth0 hosted login (or to /landing if already signed in) */}
        <Route path="/" element={<AuthRedirect/>} />
        <Route path="/signup" element={<AuthRedirect signup />} />
        <Route path="/motion/:id" element={<MotionPage />} />


        <Route 
          path="/landing"
          element={
            <RequireAuth>
              <LandingPage />
            </RequireAuth>
          } 
        />
      </Routes>
  );
}

export default App;
