import React, { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

export default function AuthRedirect({ signup = false }) {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated) {
      navigate("/committee", { replace: true });
      return;
    }
    // open hosted login; if signup=true, ask Auth0 to show signup
    const params = signup ? { authorizationParams: { screen_hint: "signup" } } : undefined;
    loginWithRedirect(params);
  }, [isLoading, isAuthenticated, loginWithRedirect, navigate, signup]);

  return null;
}