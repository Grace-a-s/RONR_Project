import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TopBar from './components/TopBar.jsx';
import { Auth0ProviderWithNavigate } from "./Auth0ProviderWithNavigate.jsx";
import CommitteePage from './pages/CommitteePage.jsx';
import MotionPage from './pages/MotionPage.jsx';
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
      <Router>
          <TopBar/>
          <Routes>
            <Route path="/" element={<CommitteePage />}  />
            <Route path="/motion/:id" element={<MotionPage />} />
            <Route 
              path="/committee"
              element={<CommitteePage />} 
            />
          </Routes>
      </Router>
  );
  // return (
  //     <Router>
  //       <Auth0ProviderWithNavigate>
  //         <TopBar/>
  //         <Routes>
  //           {/* Redirect to Auth0 hosted login (or to /committee if already signed in) */}
  //           <Route path="/" element={<AuthRedirect/>} />
  //           <Route path="/signup" element={<AuthRedirect signup />} />
  //           <Route path="/motion/:id" element={<MotionPage />} />
  //           <Route 
  //             path="/committee"
  //             element={
  //               <RequireAuth>
  //                 <CommitteePage />
  //               </RequireAuth>
  //             } 
  //           />
  //         </Routes>
  //       </Auth0ProviderWithNavigate>
  //     </Router>
  // );
}

export default App;
