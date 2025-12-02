import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar.jsx';
import { Auth0ProviderWithNavigate } from "./Auth0ProviderWithNavigate.jsx";
import CommitteePage from './pages/CommitteePage.jsx';
import MotionPage from './pages/MotionPage.jsx';
import AuthRedirect from './AuthRedirect';
import { useAuth0 } from "@auth0/auth0-react";
import UserProfilePage from './pages/UserProfilePage.jsx';
import LandingPage from './pages/LandingPage.jsx';
import CommitteeMembershipPage from './pages/CommitteeMembershipPage.jsx';

function App() {
  const RequireAuth = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth0();
    if (isLoading) return null;
    if (!isAuthenticated) return null;
    return children;
  };

  return (
      <Router>
        <Auth0ProviderWithNavigate>
          <NavBar/>
          <Routes>
            <Route 
              path="/" 
              element={<AuthRedirect/>}
            />
            <Route path="/home" element={<LandingPage />} />
            <Route path="/committee/:committeeId/motion/:motionId" element={<MotionPage />} />
            <Route path="/committee/:committeeId" element={<CommitteePage />} />
            <Route path="/user-profile" element={<UserProfilePage/>} />
            <Route path="/committee/:committeeId/membership" element={<CommitteeMembershipPage />} />
          </Routes>
        </Auth0ProviderWithNavigate>
      </Router>
  );
  // return (
  //     <Router>
  //       <Auth0ProviderWithNavigate>
  //         <NavBar/>
  //         <Routes>
  //           {/* Redirect to Auth0 hosted login (or to /committee if already signed in) */}
  //           <Route path="/" element={<AuthRedirect/>} />
  //           <Route path="/motion/:id" element={<MotionPage />} />
  //           <Route path="/committee/:id" element={<CommitteePage />} />
  //           <Route 
  //             path="/home"
  //             element={
  //               <RequireAuth>
  //                 <LandingPage />
  //               </RequireAuth>
  //             } 
  //           />
  //         </Routes>
  //       </Auth0ProviderWithNavigate>
  //     </Router>
  // );
}

export default App;
