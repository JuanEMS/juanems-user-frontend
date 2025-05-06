import { FaUser } from "react-icons/fa";
import { Button, Input } from 'antd';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import '../../css/UserAdmin/Global.css';
import '../../css/JuanEMS/SplashScreen.css';
import '../../css/UserAdmin/LoginPage.css';
import '../../css/JuanScope/ScopeLogin.css';
import SJDEFILogo from '../../images/SJDEFILogo.png';
import Footer from './Footer';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');
  const [lastResetRequest, setLastResetRequest] = useState(null);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for tracking form submission

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

  const handleConfirmedForgotPassword = async () => {
    if (isSubmitting) return; // Prevent multiple submissions
    
    setShowResetConfirmation(false);
    setLoginError('');
    setIsSubmitting(true); // Set loading state

    try {
      const response = await fetch('http://localhost:5000/api/admin/request-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to initiate password reset');
      }

      navigate('/admin/verify-email', {
        state: {
          email,
          isPasswordReset: true,
          fromLogin: true
        }
      });
    } catch (err) {
      setLoginError(err.message || 'Failed to process password reset request');
      setIsSubmitting(false); // Reset submitting state on error
    }
  };

    const handleGoToHome = () => {
        navigate('/home');
      };

      const handleSignIn = () => {
        navigate('/admin');
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
                    <h1 className='login-title'>Forgot Password</h1>
                    <label className="input-label">Email</label>
                    <Input
                        className="custom-input"
                        addonBefore={<FaUser />}
                        placeholder="Enter Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <div className="login-options">
                        <Button type="link" onClick={handleGoToHome} style={{ padding: 0 }}>
                            Go Back to Home
                        </Button>
                        <Button type="link" onClick={handleSignIn} style={{ padding: 0 }}>
                            Already have an account?
                        </Button>
                    </div>
                    {loginError && <div className="error-message">{loginError}</div>}
                    <Button type='ghost' className="login-btn" onClick={handleForgotPassword}>Reset Password</Button>
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
            <Footer />
        </div>
    );
}

export default ForgotPassword;


