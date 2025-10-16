import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const users = {
    'user@example.com': 'password123',
    'admin@example.com': 'admin2024',
    'john.doe@example.com': 'securepwd',
    'test@example.com': 'test1234'
  };

  const handleLogin = (email, password) => {
    if (users[email]) {
      if (users[email] === password) {
        return { success: true, message: 'Login successful! Welcome!' };
      } else {
        return { success: false, message: 'Incorrect password.' };
      }
    } else {
      return { success: false, message: 'Email not found.' };
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = handleLogin(email, password);
    
    if (result.success) {
      alert(result.message);
      navigate('/');
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
            }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
