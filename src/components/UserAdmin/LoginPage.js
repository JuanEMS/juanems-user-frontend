import { FaUser } from "react-icons/fa";
import { FaLock } from "react-icons/fa";
import { Button, Input } from 'antd';
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { Turnstile } from '@marsidev/react-turnstile';
import '../../css/UserAdmin/Global.css';
import '../../css/JuanEMS/SplashScreen.css';
import '../../css/UserAdmin/LoginPage.css';
import '../../css/JuanScope/Register.css';
import SJDEFILogo from '../../images/SJDEFILogo.png';
import Footer from './Footer';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');
  const [captchaToken, setCaptchaToken] = useState(null);
  const [isTurnstileReady, setIsTurnstileReady] = useState(true); // Set to true by default

  useEffect(() => {
    if (location.state?.fromPasswordReset) {
      setLoginError(''); // Clear any errors
      alert('Password reset successful. Please check your email for the new password.');
    }

    // Show message if redirected due to inactive account
    if (location.state?.accountInactive) {
      setLoginError('Your session was invalidated. Please login again.');
    }
  }, [location.state]);

  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } 

    // Add captcha validation
    if (!captchaToken) {
      newErrors.captcha = 'Please complete the CAPTCHA verification';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTurnstileError = () => {
    setErrors(prev => ({
      ...prev,
      captcha: 'An error occurred while verifying CAPTCHA. Please try again.'
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!validateForm()) {
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
          captchaToken // Add captcha token to the request
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errorType === 'pending_verification') {
          navigate('/admin/verify-email', {
            state: {
              email: data.email,
              firstName: data.firstName,
              fromRegistration: false,
              fromLogin: true,
            }
          });
          return;
        }
        if (data.errorType === 'account_inactive') {
          setLoginError('Your account is inactive. Please contact support.');
          return;
        }
        throw new Error(data.message || 'Login failed');
      }

      // Store user information in localStorage
      localStorage.setItem('fullName', `${data.firstName} ${data.lastName || ''}`);
      localStorage.setItem('role', data.role || 'ROLE');
      localStorage.setItem('userID', data.userID);
      localStorage.setItem('id', data._id);
      localStorage.setItem('token', data.token); // Store the JWT token

      // Log the login action in the system log
      const logData = {
        userID: data.userID,
        accountName: `${data.firstName} ${data.lastName || ''}`,
        role: data.role || 'ROLE',
        action: 'Logged In',
        detail: `User ${data.firstName} ${data.lastName || ''} logged in successfully.`,
      };

      // Send the log data to the server
      await fetch('http://localhost:5000/api/admin/system-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logData),
      })
        .then(response => response.json())
        .then(data => {
          console.log('Login system log recorded:', data);
        })
        .catch(error => {
          console.error('Failed to record login system log:', error);
        });

      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setLoginError(err.message || 'Login failed. Please try again.');
    }
  };

  const handleGoToHome = () => {
    navigate('/home');
  };

  const handleForgotPassword = () => {
    navigate('/admin/forgot-password');
  };

  return (
    <div className="splash-screen-container main">
      <div className="login-container">
        <div className="left-box">
          <img
            src={SJDEFILogo} alt="SJDEFI Logo" className="admin-logo"
          />
          <div className="header-text">
            <h1>SAN JUAN DE DIOS EDUCATIONAL FOUNDATION, INC.</h1>
            <p className="motto">Where faith and reason are expressed in Charity.</p>
          </div>
          <h1 className='login-title'>Admin Online Portal</h1>
        </div>

        <div className="right-box">
          <h1 className='login-title'>Sign In</h1>
          <label className="input-label">Email</label>
          <Input 
            className="custom-input" 
            addonBefore={<FaUser/>} 
            placeholder="Enter Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <div className="error-message">{errors.email}</div>}
          
          <label className="input-label">Password</label>
          <Input.Password
            className="custom-input"
            addonBefore={<FaLock />}
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          />
          {errors.password && <div className="error-message">{errors.password}</div>}
          
          <div className="login-options">
            <Button type="link" onClick={handleGoToHome} style={{ padding: 0 }}>
              Go Back to Home
            </Button>
            <Button type="link" onClick={handleForgotPassword} style={{ padding: 0 }}>
              Forgot Password?
            </Button>
          </div>
          
          {/* Cloudflare Turnstile Captcha */}
          <div className="turnstile-container" style={{ marginTop: '15px', marginBottom: '15px', justifyContent: 'center', alignItems: 'center', display: 'flex', flexDirection:'column' }}>
            {isTurnstileReady && (
              <Turnstile
                siteKey={process.env.REACT_APP_TURNSTILE_SITE_KEY}
                onSuccess={(token) => {
                  setCaptchaToken(token);
                  setErrors(prev => ({ ...prev, captcha: null }));
                }}
                onError={handleTurnstileError}
                onExpire={() => {
                  setCaptchaToken(null);
                  handleTurnstileError();
                }}
                options={{
                  theme: 'light',
                  size: 'normal',
                  retry: 'auto',
                  retryInterval: 3000
                }}
                scriptOptions={{
                  async: true,
                  defer: true,
                  appendTo: 'head'
                }}
              />
            )}
            {errors.captcha && (
              <div className="error-message" style={{ display: 'block', marginTop: '5px' }}>
                {errors.captcha}
              </div>
            )}
          </div>
          
          {loginError && <div className="error-message">{loginError}</div>}
          <Button type='ghost' className="login-btn" onClick={handleSubmit}>Login</Button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LoginPage;