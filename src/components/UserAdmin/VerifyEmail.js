import { faEnvelopeOpen, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../../css/JuanScope/Register.css';
import SJDEFILogo from '../../images/SJDEFILogo.png';

import '../../css/UserAdmin/Global.css';
import Footer from './Footer';

function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(180); // 3 minutes for OTP
  const [lockoutCountdown, setLockoutCountdown] = useState(0); // 5 minutes for lockout
  const [canResend, setCanResend] = useState(false);
  const [isLockedOut, setIsLockedOut] = useState(false); // Added this line
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [firstName, setFirstName] = useState(location.state?.firstName || '');
  const inputsRef = useRef([]);


  // Extract email and firstName from location state
  const email = location.state?.email || '';
  const studentID = location.state?.studentID || '';
  const fromAdmin = location.state?.fromAdmin || false;

  // Update the useEffect for redirect in VerifyEmail.js
  useEffect(() => {
    const fromLogin = location.state?.fromLogin || false;
    const isPasswordReset = location.state?.isPasswordReset || false;

    if (!email) {
      if (fromLogin) {
        // If coming from login but no email, go back to login
        navigate('/admin');
      } else {
        // Otherwise, go to register
        navigate('/admin/manage-accounts');
      }
    }

    // If this is for password reset, fetch the user's first name
    if (isPasswordReset && email && !firstName) {
      const fetchUserDetails = async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/admin/verification-status/${email}`);
          const data = await response.json();
          if (response.ok && data.firstName) {
            setFirstName(data.firstName);
          }
        } catch (error) {
          console.error('Error fetching user details:', error);
        }
      };
      fetchUserDetails();
    }
  }, [email, location.state, navigate]);

  // Timer for OTP expiration
  // Replace your existing OTP timer useEffect with this:
  useEffect(() => {
    let timer;
    if (!isLockedOut && otpCountdown > 0) {
      timer = setTimeout(() => {
        setOtpCountdown(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCountdown, isLockedOut]);

  // Replace your existing lockout timer useEffect with this:
  useEffect(() => {
    let timer;
    if (isLockedOut && lockoutCountdown > 0) {
      timer = setTimeout(() => {
        setLockoutCountdown(prev => {
          if (prev <= 1) {
            setIsLockedOut(false);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [lockoutCountdown, isLockedOut]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

// Update the useEffect for fetching verification status
useEffect(() => {
  const fetchVerificationStatus = async () => {
    try {
      const isPasswordReset = location.state?.isPasswordReset || false;
      let endpoint = `/api/admin/verification-status/${email}`;

      if (isPasswordReset) {
        endpoint = `/api/admin/password-reset-status/${email}`;
      }

      const response = await fetch(`http://localhost:5000${endpoint}`);
      const data = await response.json();

      if (response.ok) {
        // Use server-provided OTP expiration time if available
        const serverOtpTimeLeft = data.otpTimeLeft || 
          (data.otpExpiresAt ? Math.floor((new Date(data.otpExpiresAt) - new Date()) / 1000) : 180);
        
        setIsLockedOut(data.isLockedOut);
        if (data.isLockedOut) {
          setLockoutCountdown(data.lockoutTimeLeft);
          setOtpCountdown(0);
        } else {
          setOtpCountdown(Math.max(0, serverOtpTimeLeft));
          setCanResend(serverOtpTimeLeft <= 0);
        }
        setAttemptsLeft(data.attemptsLeft);
        
        if (data.firstName && !firstName) {
          setFirstName(data.firstName);
        }
      }
    } catch (error) {
      console.error('Error fetching verification status:', error);
    }
  };

  if (email) {
    fetchVerificationStatus();
    
    // If we have an OTP expiration time from location state, use that
    if (location.state?.otpExpiresAt) {
      const timeLeft = Math.floor((new Date(location.state.otpExpiresAt) - new Date()) / 1000);
      setOtpCountdown(Math.max(0, timeLeft));
      setCanResend(timeLeft <= 0);
    }
  }
}, [email, location.state, firstName]);

  // Handle OTP input change
  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Clear errors
    if (error) setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  // Handle key press (backspace)
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();

    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      inputsRef.current[5].focus();
    }
  };

  // Update the handleSubmit function in VerifyEmail.js
  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');

    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const isPasswordReset = location.state?.isPasswordReset || false;

      let endpoint = '/api/admin/verify-otp';
      if (isPasswordReset) {
        endpoint = '/api/admin/reset-password';
      }

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp: otpString
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      if (isPasswordReset) {
        setSuccess('Password reset successful! Your new password has been sent to your email.');
        setTimeout(() => {
          navigate('/admin', {
            state: {
              fromPasswordReset: true,
              email: email
            }
          });
        }, 3000);
      } else {
        setSuccess('Email verified successfully!');
        setTimeout(() => {
          navigate('/admin/dashboard', {
            state: {
              fromVerification: true,
            }
          });
        }, 2000);
      }
    } catch (err) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Update the handleResend function
  const handleResend = async () => {
    if (!canResend) return;

    setResendLoading(true);
    setError('');
    setSuccess('');

    try {
      const isPasswordReset = location.state?.isPasswordReset || false;
      let endpoint = '/api/admin/resend-otp';
      if (isPasswordReset) {
        endpoint = '/api/admin/request-password-reset';
      }

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend verification code');
      }

      // Reset all counters and states
      setOtpCountdown(180);
      setLockoutCountdown(0);
      setIsLockedOut(false);
      setCanResend(false);
      setAttemptsLeft(3);
      setSuccess('New verification code sent to your email');

      // Clear current OTP
      setOtp(['', '', '', '', '', '']);
      inputsRef.current[0].focus();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to resend verification code. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="juan-verify-container">
      {/* Header */}
      <header className="juan-register-header">
        <div className="juan-header-left">
          <img
            src={SJDEFILogo}
            alt="SJDEFI Logo"
            className="juan-logo-register"
          />
          <div className="juan-header-text">
            <h1>USER ADMIN</h1>
          </div>
        </div>
      </header>

      <div className="juan-verify-main">
        <div className="juan-verify-card">
          <div className="juan-verify-icon">
            <FontAwesomeIcon icon={faEnvelopeOpen} size="3x" />
          </div>
          <h2>
            {location.state?.isPasswordReset
              ? 'Password Reset Verification'
              : 'Email Verification'}
          </h2>
          <p className="juan-verify-description">
            {location.state?.isPasswordReset
              ? `We've sent a verification code to ${email} to reset your password. Please enter the 6-digit code below.`
              : `We've sent a verification code to ${email}. Please enter the 6-digit code below to verify your account.`}
          </p>

          {/* OTP Input */}
          <form onSubmit={handleSubmit} className="juan-otp-form" onPaste={handlePaste}>
            <div className="juan-otp-inputs">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputsRef.current[index] = el}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="juan-otp-input"
                  autoFocus={index === 0}
                  disabled={isLockedOut || loading}
                />
              ))}
            </div>

            {/* Timer */}
            <div className="juan-otp-timer">
              {isLockedOut ? (
                `Please wait ${formatTime(lockoutCountdown)} before trying again`
              ) : canResend ? (
                'OTP has expired'
              ) : (
                `OTP expires in ${formatTime(otpCountdown)}`
              )}
            </div>

            {/* Error/Success */}
            {error && (
              <div className="juan-otp-error">
                {error}
                {attemptsLeft < 3 && !error.includes('wait') && (
                  <div style={{ marginTop: '5px' }}></div>
                )}
              </div>
            )}
            {success && <div className="juan-otp-success">{success}</div>}

            {/* Actions */}
            <div className="juan-otp-actions">
              <button
                type="button"
                onClick={handleResend}
                disabled={!canResend || resendLoading || isLockedOut}
                className="juan-resend-button"
              >
                {resendLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Resend Code'}
              </button>

              <button
                type="submit"
                className="juan-verify-button"
                disabled={loading || isLockedOut}
              >
                {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Verify Email'}
              </button>
            </div>
          </form>

          <p className="juan-verify-note">
            Note: If you do not verify your email within 5 days, your registration will expire.
          </p>
        </div>
      </div>

      <Footer/>
    </div>
  );
}

export default VerifyEmail;