import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faPhone, faEnvelope, faClock, faEnvelopeOpen, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { faFacebookSquare } from '@fortawesome/free-brands-svg-icons';
import SJDEFILogo from '../../images/SJDEFILogo.png';
import JuanEMSLogo from '../../images/JuanEMSlogo.png';
import '../../css/JuanScope/VerifyEmail.css';

function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(180);
  const [lockoutCountdown, setLockoutCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [firstName, setFirstName] = useState(location.state?.firstName || '');
  const inputsRef = useRef([]);

  const email = location.state?.email || '';
  const studentID = location.state?.studentID || '';
  const fromRegistration = location.state?.fromRegistration || false;
  const fromLogin = location.state?.fromLogin || false;
  const isPasswordReset = location.state?.isPasswordReset || false;
  const isLoginOtp = location.state?.isLoginOtp || false;

 // Replace the fetchUserDetails in the first useEffect
 useEffect(() => {
  if (!email) {
    navigate(fromLogin ? '/scope-login' : '/register');
  }

  if (isPasswordReset && email && !firstName) {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/enrollee-applicants/verification-status/${email}`);
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
}, [email, firstName, fromLogin, isPasswordReset, navigate]);

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

  // Replace the fetchVerificationStatus useEffect
  useEffect(() => {
    const fetchVerificationStatus = async () => {
      try {
        let endpoint;
        if (isPasswordReset) {
          endpoint = `/api/enrollee-applicants/password-reset-status/${email}`;
        } else if (isLoginOtp) {
          endpoint = `/api/enrollee-applicants/login-otp-status/${email}`;
        } else {
          endpoint = `/api/enrollee-applicants/verification-status/${email}`;
        }

        const response = await fetch(`${process.env.REACT_APP_API_URL}${endpoint}`);
        const data = await response.json();

        if (response.ok) {
          setIsLockedOut(data.isLockedOut);
          if (data.isLockedOut) {
            setLockoutCountdown(data.lockoutTimeLeft);
            setOtpCountdown(0);
          } else {
            setOtpCountdown(Math.max(0, data.otpTimeLeft));
            setCanResend(data.otpTimeLeft <= 0);
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
    }
  }, [email, firstName, isPasswordReset, isLoginOtp]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (error) setError('');

    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();

    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      inputsRef.current[5].focus();
    }
  };

  // Replace the handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');

    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);
    try {
      let endpoint;
      if (isPasswordReset) {
        endpoint = '/api/enrollee-applicants/reset-password';
      } else if (isLoginOtp) {
        endpoint = '/api/enrollee-applicants/verify-login-otp';
      } else {
        endpoint = '/api/enrollee-applicants/verify-otp';
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}${endpoint}`, {
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
        setAttemptsLeft(data.attemptsLeft || attemptsLeft);
        throw new Error(data.message || 'Verification failed');
      }

      if (isPasswordReset) {
        setSuccess('Password reset successful! Your new password has been sent to your email.');
        setTimeout(() => {
          navigate('/scope-login', {
            state: {
              fromPasswordReset: true,
              email: email
            }
          });
        }, 3000);
      } else if (isLoginOtp) {
        setSuccess('Login verified successfully!');
        localStorage.setItem('userEmail', data.email);
        localStorage.setItem('firstName', data.firstName);
        localStorage.setItem('studentID', data.studentID);
        localStorage.setItem('applicantID', data.applicantID);
        localStorage.setItem('lastLogin', data.lastLogin);
        localStorage.setItem('lastLogout', data.lastLogout);
        localStorage.setItem('createdAt', data.createdAt);
        localStorage.setItem('activityStatus', data.activityStatus);
        localStorage.setItem('loginAttempts', data.loginAttempts.toString());
        setTimeout(() => {
          navigate('/scope-dashboard');
        }, 2000);
      } else {
        setSuccess('Email verified successfully!');
        setTimeout(() => {
          navigate('/scope-login', {
            state: {
              fromVerification: true,
              studentID: data.data?.studentID || studentID
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

  // Replace the handleResend function
  const handleResend = async () => {
    if (!canResend) return;

    setResendLoading(true);
    setError('');
    setSuccess('');

    try {
      let endpoint;
      if (isPasswordReset) {
        endpoint = '/api/enrollee-applicants/request-password-reset';
      } else if (isLoginOtp) {
        endpoint = '/api/enrollee-applicants/resend-login-otp';
      } else {
        endpoint = '/api/enrollee-applicants/resend-otp';
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}${endpoint}`, {
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

      setOtpCountdown(180);
      setLockoutCountdown(0);
      setIsLockedOut(false);
      setCanResend(false);
      setAttemptsLeft(3);
      setSuccess('New verification code sent to your email');

      setOtp(['', '', '', '', '', '']);
      inputsRef.current[0].focus();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to resend verification code. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="juan-verify-container">
      <header className="juan-register-header">
        <div className="juan-header-left">
          <img
            src={SJDEFILogo}
            alt="SJDEFI Logo"
            className="juan-logo-register"
          />
          <div className="juan-header-text">
            <h1>JUAN SCOPE</h1>
          </div>
        </div>
      </header>

      <div className="juan-verify-main">
        <div className="juan-verify-card">
          <FontAwesomeIcon icon={faEnvelopeOpen} size="3x" className="juan-verify-icon" />
          <h2>Verify Your Email</h2>
          <p className="juan-verify-description">
            {isLoginOtp
              ? `Please enter the 6-digit verification code sent to ${email} to complete your login.`
              : isPasswordReset
              ? `Please enter the 6-digit verification code sent to ${email} to reset your password.`
              : `Please enter the 6-digit verification code sent to ${email} to verify your account.`}
          </p>
          <form onSubmit={handleSubmit} className="juan-otp-form">
            <div className="juan-otp-inputs" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  ref={(el) => (inputsRef.current[index] = el)}
                  className="juan-otp-input"
                  disabled={loading || isLockedOut}
                />
              ))}
            </div>
            {otpCountdown > 0 && (
              <p className="juan-otp-timer">
                Code expires in: {formatTime(otpCountdown)}
              </p>
            )}
            {isLockedOut && (
              <p className="juan-otp-error">
                Too many attempts. Please wait {formatTime(lockoutCountdown)} to try again.
              </p>
            )}
            {error && <p className="juan-otp-error">{error}</p>}
            {success && <p className="juan-otp-success">{success}</p>}
            <div className="juan-otp-actions">
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading || !canResend || isLockedOut}
                className="juan-resend-button"
              >
                {resendLoading ? (
                  <FontAwesomeIcon icon={faSpinner} spin />
                ) : (
                  'Resend Code'
                )}
              </button>
              <button
                type="submit"
                disabled={loading || isLockedOut}
                className="juan-verify-button"
              >
                {loading ? (
                  <FontAwesomeIcon icon={faSpinner} spin />
                ) : (
                  'Verify'
                )}
              </button>
            </div>
          </form>
          <p className="juan-verify-note">
            If you don’t receive the code, check your spam folder or click Resend Code.
          </p>
        </div>
      </div>

      <footer className="juan-register-footer">
        <div className="juan-footer-left">
          <img
            src={JuanEMSLogo}
            alt="SJDEFI Logo"
            className="juan-footer-logo"
          />
          <div className="juan-footer-text">
            <h1>JuanEMS - JUAN SCOPE</h1>
            <p className="juan-footer-motto">© 2025. San Juan De Dios Educational Foundation Inc.</p>
          </div>
        </div>
        <div className="juan-footer-content">
          <div className="juan-footer-links">
            <a href="/about" className="footer-link">About</a>
            <span className="footer-link-separator">|</span>
            <a href="/terms-of-use" className="footer-link">Terms of Use</a>
            <span className="footer-link-separator">|</span>
            <a href="/privacy" className="footer-link">Privacy</a>
          </div>
          <a
            href="https://www.facebook.com/SJDEFIcollege"
            target="_blank"
            rel="noopener noreferrer"
            className="juan-footer-social-link"
          >
            <FontAwesomeIcon icon={faFacebookSquare} className="juan-social-icon" />
            <div className="juan-social-text">
              <span className="juan-social-find">Find us on</span>
              <span className="juan-social-platform">Facebook</span>
            </div>
          </a>
          <div className="juan-footer-contact-container">
            <div className="juan-contact-title">
              <FontAwesomeIcon icon={faPhone} />
              <span>CONTACT US</span>
            </div>
            <div className="juan-contact-items">
              <div className="juan-contact-item">
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                <span>2772 Roxas Blvd., Pasay City, Philippines, 1300</span>
              </div>
              <div className="juan-contact-item">
                <FontAwesomeIcon icon={faPhone} />
                <span>+632 551-2763</span>
              </div>
              <div className="juan-contact-item">
                <FontAwesomeIcon icon={faEnvelope} />
                <span>admission_office@sjdefi.edu.ph | registrarsoffice@sjdefi.edu.ph</span>
              </div>
              <div className="juan-contact-item">
                <FontAwesomeIcon icon={faClock} />
                <span>Monday to Thursday - 7:00 AM to 5:00 PM | Friday - 7:00 AM to 4:00 PM</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default VerifyEmail;