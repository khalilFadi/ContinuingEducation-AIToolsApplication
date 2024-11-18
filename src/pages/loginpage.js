import React, { useState } from 'react';
import googleicon from '../images/icons/gmail_groups.png';
import { navigate } from 'gatsby';
const LoginPage = () => {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const nav = navigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // This is used to create users in the backend
      // const Signup = await fetch('http://localhost:5001/api/register', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ username: "newUser", email: "some@email.com", password: "0000"}),
      // });
      const response = await fetch('http://localhost:5001/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Login successful', data);
        // Handle success, e.g., store user ID or redirect
        // For example: localStorage.setItem('userId', data.userId);
        localStorage.setItem('userId', data.userId);
        navigate('/uploadDataset');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      setError('An error occurred while trying to login');
      console.error('Login error:', error);
    }
  };
  
  return (
    <div className="container">
      <div className="background"></div>
      <div className="login-form">
        <div className='Login-form-elements'>
            <h2 className='singin-title'>Sign in to AI Tools</h2>
            
            <button className="google-signin"><img className='google-sign-in-image'src={googleicon}/>Sign in with Google</button>
            <button className="byu-button">BYU</button>
            <div class="line-container">
                <span class="line-text">or</span>
            </div>
            <form onSubmit={handleLogin}>
            <h3 className='input-title'>Username or Email Address</h3>
            <input
              className='login-input'
              type="text"
              placeholder="Username or Email Address"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            
            <h3 className='input-title'>Password</h3>
            <input
              className='login-input'
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            
            {error && <p className="error-message">{error}</p>}
            
            <div>
              <a href="#" className="forgot-password">Forgot password?</a>
            </div>
            
            <button type="submit" className="signin-button">Sign In</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;