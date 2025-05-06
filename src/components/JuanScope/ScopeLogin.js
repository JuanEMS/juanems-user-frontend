import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faEye, faEyeSlash, faSpinner } from '@fortawesome/free-solid-svg-icons';
import '../../css/JuanScope/ScopeLogin.css';
import SJDEFILogo from '../../images/SJDEFILogo.png';
import JuanEMSLogo from '../../images/JuanEMSlogo.png';
import ScopeImage from '../../images/scope.png';
import PasswordNotification from '../JuanScope/PasswordNotification';

function ScopeLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');
  const [lastResetRequest, setLastResetRequest] = useState(null);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for tracking form submission

  useEffect(() => {
    if (location.state?.fromPasswordReset) {
      setLoginError('');
      alert('Password reset successful. Please check your email for the new password.');
    }

    if (location.state?.accountInactive) {
      setLoginError('Your session was invalidated. Please login again.');
    }

    if (location.state?.sessionExpired) {
      setLoginError('Your session has expired due to inactivity. Please login again.');
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
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Replace the checkAccountStatus function
  const checkAccountStatus = async (email) => {
    if (!email) return;

    const fetchWithRetry = async (url, retries = 3, delay = 1000) => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetchWithRetry(url, retries - 1, delay);
        }
        throw error;
      }
    };

    try {
      const data = await fetchWithRetry(
        `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/verification-status/${email}`
      );

      if (data.status === 'Pending Verification') {
        navigate('/verify-email', {
          state: {
            email: email,
            firstName: data.firstName,
            fromRegistration: false,
            fromLogin: true
          }
        });
      }
    } catch (error) {
      console.error('Error checking account status:', error);
      setLoginError('Unable to verify account status. Please try again.');
    }
  };

  // Replace the handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (isSubmitting) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const fetchWithRetry = async (url, options, retries = 3, delay = 1000) => {
      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        if (retries > 0 && !error.message.includes('400')) {
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetchWithRetry(url, options, retries - 1, delay);
        }
        throw error;
      }
    };

    try {
      const data = await fetchWithRetry(
        `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email.trim(),
            password: password.trim()
          }),
        }
      );

      navigate('/verify-email', {
        state: {
          email: data.email,
          firstName: data.firstName,
          fromLogin: true,
          isLoginOtp: true
        }
      });
    } catch (err) {
      console.error('Login error:', err);
      if (err.message.includes('400')) {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/login`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: email.trim(),
              password: password.trim()
            }),
          }
        );
        const data = await response.json();
        if (data.errorType === 'pending_verification') {
          navigate('/verify-email', {
            state: {
              email: data.email,
              firstName: data.firstName,
              fromRegistration: false,
              fromLogin: true
            }
          });
          return;
        }
        if (data.errorType === 'account_inactive') {
          setLoginError('Your account is inactive. Please contact support.');
        } else {
          setLoginError(data.message || 'Invalid email or password.');
        }
      } else if (err.message.includes('429')) {
        setLoginError('Too many login attempts. Please try again later.');
      } else {
        setLoginError('Login failed. Please check your connection and try again.');
      }
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setErrors({ email: 'Email is required to reset password' });
      return;
    }

    const now = new Date();
    if (lastResetRequest && (now - new Date(lastResetRequest) < 24 * 60 * 60 * 1000)) {
      setLoginError('You can only request a password reset once per day. Please try again later.');
      return;
    }

    setShowResetConfirmation(true);
  };

  // Replace the handleConfirmedForgotPassword function
  const handleConfirmedForgotPassword = async () => {
    if (isSubmitting) return;
    
    setShowResetConfirmation(false);
    setLoginError('');
    setIsSubmitting(true);

    const fetchWithRetry = async (url, options, retries = 3, delay = 1000) => {
      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        if (retries > 0 && !error.message.includes('400')) {
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetchWithRetry(url, options, retries - 1, delay);
        }
        throw error;
      }
    };

    try {
      const data = await fetchWithRetry(
        `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/request-password-reset`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        }
      );

      navigate('/verify-email', {
        state: {
          email,
          isPasswordReset: true,
          fromLogin: true
        }
      });
    } catch (err) {
      console.error('Password reset error:', err);
      if (err.message.includes('400')) {
        setLoginError('Invalid email or account not found.');
      } else if (err.message.includes('429')) {
        setLoginError('Too many reset requests. Please try again later.');
      } else {
        setLoginError('Failed to process password reset request. Please check your connection.');
      }
      setIsSubmitting(false);
    }
  };

  const handleGoToHome = () => {
    navigate('/home');
  };

  return (
    <div className="scope-login-container">
      <PasswordNotification />
      <div className="scope-login-left-side">
        <div className="scope-login-image-background">
          <div className="scope-login-image-overlay"></div>
          <div className="scope-login-left-content">
            <div className="scope-login-top-logo">
              <img src={SJDEFILogo} alt="SJDEFI Logo" className="scope-login-sjdefi-logo" />
              <div className="scope-login-top-text">
                <h1>SAN JUAN DE DIOS EDUCATIONAL FOUNDATION, INC.</h1>
                <p className="scope-login-motto">Where faith and reason are expressed in Charity.</p>
              </div>
            </div>
            <div className="scope-login-center-logo">
              <img src={JuanEMSLogo} alt="JuanEMS Logo" className="scope-login-ems-logo" />
              <h2 className="scope-login-ems-title">JuanEMS</h2>
              <p className="scope-login-ems-subtitle">Juan Enrollment Management System</p>
            </div>
          </div>
        </div>
      </div>
      <div className="scope-login-right-side">
        <div className="scope-login-form-container">
          <div className="scope-login-scope-title">
            <h1>JUANSC<img src={ScopeImage} alt="O" className="scope-login-scope-image" />PE</h1>
            <p className="scope-login-scope-subtitle">Online Admission Application</p>
          </div>
          <div className="scope-login-login-form">
            <h2 className="scope-login-form-title">Enroll Now!</h2>
            {loginError && <div className="scope-login-error-message">{loginError}</div>}
            <form onSubmit={handleSubmit}>
              <div className="scope-login-form-group">
                <div className="scope-login-input-label">
                  <FontAwesomeIcon icon={faEnvelope} className="scope-login-input-icon" />
                  <label>Email</label>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={(e) => checkAccountStatus(e.target.value)}
                  placeholder="Enter your email"
                  className="scope-login-input-field"
                  disabled={isSubmitting}
                />
                {errors.email && <span className="scope-login-error-message">{errors.email}</span>}
              </div>
              <div className="scope-login-form-group">
                <div className="scope-login-input-label">
                  <FontAwesomeIcon icon={faLock} className="scope-login-input-icon" />
                  <label>Password</label>
                </div>
                <div className="scope-login-password-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="scope-login-input-field"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    className="scope-login-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting}
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
                {errors.password && <span className="scope-login-error-message">{errors.password}</span>}
              </div>
              <div className="scope-login-links-container">
                <button
                  type="button"
                  className="scope-login-go-home-btn"
                  onClick={handleGoToHome}
                  disabled={isSubmitting}
                >
                  Go back to Home
                </button>
                <button
                  type="button"
                  className="scope-login-forgot-password-btn"
                  onClick={handleForgotPassword}
                  disabled={isSubmitting}
                >
                  Forgot Password?
                </button>
              </div>
              <button 
                type="submit" 
                className={`scope-login-login-button ${isSubmitting ? 'scope-login-button-loading' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin className="scope-login-spinner" />
                    <span>Processing...</span>
                  </>
                ) : (
                  'Login'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
      {showResetConfirmation && (
        <div className="scope-login-modal">
          <div className="scope-login-modal-content">
            <h3>Confirm Password Reset</h3>
            <p>Are you sure you want to reset your password? A verification code will be sent to your email.</p>
            <div className="scope-login-modal-buttons">
              <button
                onClick={() => setShowResetConfirmation(false)}
                className="scope-login-modal-cancel"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmedForgotPassword}
                className="scope-login-modal-confirm"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin className="scope-login-spinner" />
                    <span>Processing...</span>
                  </>
                ) : (
                  'Confirm'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScopeLogin;