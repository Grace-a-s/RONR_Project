import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SignUpPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // Get users from localStorage
  const getUsers = () => {
    const storedUsers = localStorage.getItem('users');
    return storedUsers ? JSON.parse(storedUsers) : {};
  };

  // Save users to localStorage
  const saveUsers = (users) => {
    localStorage.setItem('users', JSON.stringify(users));
  };

  // Handle signup form submission
  const handleSignup = (username, email, password) => {
    const users = getUsers();

    // Check if username already exists
    if (users[username]) {
      return { success: false, message: 'Username already exists. Please choose another.' };
    }

    // Validate inputs
    if (!username || !email || !password) {
      return { success: false, message: 'All fields are required.' };
    }

    if (username.trim() === '' || password.trim() === '') {
      return { success: false, message: 'Username and password cannot be empty.' };
    }

    // Add new user to localStorage
    users[username] = password;
    saveUsers(users);

    // Store logged-in user in sessionStorage
    sessionStorage.setItem('currentUser', username);

    return { success: true, message: 'Account created successfully!' };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Attempt signup
    const result = handleSignup(username, email, password);
    
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
      backgroundColor: '#c7f9cc',
      fontFamily: 'Inter',
      alignItems: 'center',
      justifyContent: 'center',
      display: 'flex',
      minHeight: '100vh'
    }}>
      <div style={{
        display: 'inline-flex',
        padding: '10px 50px 10px 50px',
        flexDirection: 'column',
        gap: '40px',
        backgroundColor: '#f2fff4',
        boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)',
        marginTop: '50px'
      }}>
        <h1 style={{ fontWeight: 'normal', textAlign: 'center' }}>Sign Up</h1>
        <form onSubmit={handleSubmit} style={{ alignItems: 'center' }}>
          <label htmlFor="username">Username</label>
          <br />
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              alignItems: 'center',
              alignSelf: 'stretch',
              width: '100%',
              boxSizing: 'border-box'
            }}
          />
          <br /><br />

          <label htmlFor="email">Email</label>
          <br />
          <input
            type="text"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              alignItems: 'center',
              alignSelf: 'stretch',
              width: '100%',
              boxSizing: 'border-box'
            }}
          />
          <br /><br />

          <label htmlFor="password">Password</label>
          <br />
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              alignItems: 'center',
              alignSelf: 'stretch',
              width: '100%',
              boxSizing: 'border-box'
            }}
          />
          <br /><br /><br />

          <span style={{ fontWeight: 'bold' }}>
            Already have an account?{' '}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate('/signin');
              }}
              style={{
                color: '#00e',
                textDecorationLine: 'underline',
                textDecorationStyle: 'solid',
                cursor: 'pointer'
              }}
            >
              Sign in
            </a>
          </span>

          <br />
          <br />

          <input
            type="submit"
            value="Sign Up"
            style={{
              padding: '10px 16px',
              gap: '8px',
              flexShrink: 0,
              borderRadius: '6px',
              backgroundColor: '#28a745',
              alignItems: 'center',
              fontFamily: 'Inter',
              color: '#fff',
              fontWeight: 'bold',
              margin: '10px',
              width: '100%',
              boxSizing: 'border-box',
              borderColor: '#28a745',
              cursor: 'pointer'
            }}
          />
        </form>
      </div>
    </div>
  );
}

export default SignUpPage;
