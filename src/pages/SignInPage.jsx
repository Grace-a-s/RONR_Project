import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function SignInPage() {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // Initialize localStorage with default user if no users exist
  useEffect(() => {
    const storedUsers = localStorage.getItem('users');
    if (!storedUsers) {
      // Create default admin account
      const defaultUsers = {
        admin: "admin"
      };
      localStorage.setItem('users', JSON.stringify(defaultUsers));
    }
  }, []);

  // Get users from localStorage
  const getUsers = () => {
    const storedUsers = localStorage.getItem('users');
    return storedUsers ? JSON.parse(storedUsers) : {};
  };

  // This function handles login attempts when the user submits the form
  const handleLogin = (user, password) => {
    const users = getUsers();

    // Check if username exists in our users object
    if (users[user]) {
      // Check if password matches
      if (users[user] === password) {
        // Store logged-in user in sessionStorage for the current session
        sessionStorage.setItem('currentUser', user);
        return { success: true, message: 'Login successful! Welcome!' };
      } else {
        return { success: false, message: 'Incorrect password.' };
      }
    } else {
      return { success: false, message: 'Username not found.' };
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = handleLogin(user, password);
    
    if (result.success) {
      alert(result.message);
      // Navigate to landing page after successful sign-in
      navigate('/landing');
    } else {
      alert(result.message);
      setPassword('');
    }
  };

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
      background: '#c7f9cc',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#e5ffe8',
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        padding: '40px',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#333', fontSize: '28px', fontWeight: '600' }}>Sign In</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              color: '#555',
              fontWeight: '500',
              fontSize: '14px'
            }}>Username</label>
            <input
              type="text"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e1e5e9',
                borderRadius: '8px',
                fontSize: '16px',
                background: '#fafbfc',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              color: '#555',
              fontWeight: '500',
              fontSize: '14px'
            }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e1e5e9',
                borderRadius: '8px',
                fontSize: '16px',
                background: '#fafbfc',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '25px',
            fontSize: '14px'
          }}>
            <a href="#" style={{
              color: '#667eea',
              textDecoration: 'none'
            }}>Forgot password?</a>
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              background: '#01b82c',
              color: 'white',
              border: 'none',
              padding: '14px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Sign In
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          marginTop: '25px',
          fontSize: '14px',
          color: '#666'
        }}>
          Don't have an account? <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate('/signup');
            }}
            style={{
              color: '#667eea',
              textDecoration: 'none',
              fontWeight: '600'
            }}
          >Sign up</a>
        </div>
      </div>
    </div>
  );
}

export default SignInPage;
