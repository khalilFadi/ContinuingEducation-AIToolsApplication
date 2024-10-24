import React from 'react';
import '../styles/styles.css';
import googleicon from '../images/icons/gmail_groups.png';
const LoginPage = () => {
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
            <form>
            <h3 className='input-title'>Username or Email Address</h3>
            <input className='login-input' type="text" placeholder="Username or Email Address" required />
            <h3 className='input-title'>Password</h3>

            <input className='login-input' type="password" placeholder="Password" required />
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