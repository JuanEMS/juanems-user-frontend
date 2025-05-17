import { faFacebookSquare } from "@fortawesome/free-brands-svg-icons";
import {
  faClock,
  faEnvelope,
  faEnvelopeOpen,
  faMapMarkerAlt,
  faPhone,
  faSpinner
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { forgotPasswordApplicantApiRequest, verifyResetPasswordOtp } from "../../api/applicant";
import "../../css/JuanScope/VerifyEmail.css";
import JuanEMSLogo from "../../images/JuanEMSlogo.png";

// Constants
const OTP_EXPIRY_TIME = 180; // 3 minutes in seconds
const LOCKOUT_TIME = 3; // 5 minutes in seconds
const MAX_ATTEMPTS = 10;


/**
 * Header component
 */
const Header = ({ logo, altText }) => (
  <header className="juan-register-header">
    <div className="juan-header-left">
      <img src={logo} alt={altText} className="juan-logo-register" />
      <div className="juan-header-text">
        <h1>JUAN SCOPE</h1>
      </div>
    </div>
  </header>
);

/**
 * Footer component
 */
const Footer = () => (
  <footer className="juan-register-footer">
    <div className="juan-footer-left">
      <img src={JuanEMSLogo} alt="JuanEMS Logo" className="juan-footer-logo" />
      <div className="juan-footer-text">
        <h1>JuanEMS - JUAN SCOPE</h1>
        <p className="juan-footer-motto">2025. San Juan De Dios Educational Foundation Inc.</p>
      </div>
    </div>
    <div className="juan-footer-content">
      <div className="juan-footer-links">
        <a href="/about" className="footer-link">About</a>
        <span className="footer-link-separator"> | </span>
        <a href="/terms-of-use" className="footer-link">Terms of Use</a>
        <span className="footer-link-separator"> | </span>
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
);


/**
 * Custom hook for OTP verification state management
 */
const useOtpVerification = (email) => {
  const storageKey = `otpVerification_forgotPassword_${email}`;
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [lockoutCountdown, setLockoutCountdown] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const timerRef = useRef(null);
  const lockoutTimerRef = useRef(null);

  // Save verification state to localStorage
  const saveVerificationState = (state) => {
    const verificationState = {
      email,
      otpExpiry: state.otpExpiry,
      lockoutExpiry: state.lockoutExpiry,
      attemptsLeft: state.attemptsLeft !== undefined ? state.attemptsLeft : attemptsLeft,
      isLockedOut: state.isLockedOut !== undefined ? state.isLockedOut : isLockedOut,
    };
    localStorage.setItem(storageKey, JSON.stringify(verificationState));
  };

  // Load verification state from localStorage
  const loadVerificationState = () => {
    const storedState = localStorage.getItem(storageKey);
    if (!storedState) return null;

    try {
      const parsedState = JSON.parse(storedState);
      if (parsedState.email !== email) return null;

      const now = Date.now();
      const otpTimeLeft = parsedState.otpExpiry
        ? Math.max(0, Math.floor((parsedState.otpExpiry - now) / 1000))
        : 0;
      const lockoutTimeLeft = parsedState.lockoutExpiry
        ? Math.max(0, Math.floor((parsedState.lockoutExpiry - now) / 1000))
        : 0;

      return {
        otpTimeLeft,
        lockoutTimeLeft,
        attemptsLeft: parsedState.attemptsLeft,
        isLockedOut: parsedState.lockoutExpiry > now,
      };
    } catch (error) {
      console.error("Error parsing verification state:", error);
      return null;
    }
  };

  // Initialize state
  useEffect(() => {
    const localState = loadVerificationState();

    if (localState) {
      setOtpCountdown(localState.otpTimeLeft);
      setLockoutCountdown(localState.lockoutTimeLeft);
      setAttemptsLeft(localState.attemptsLeft);
      setIsLockedOut(localState.isLockedOut);
      setCanResend(localState.otpTimeLeft <= 0 && !localState.isLockedOut);
    } else {
      setOtpCountdown(OTP_EXPIRY_TIME);
      setCanResend(false);
      saveVerificationState({
        otpExpiry: Date.now() + OTP_EXPIRY_TIME * 1000,
        lockoutExpiry: 0,
        attemptsLeft: MAX_ATTEMPTS,
        isLockedOut: false,
      });
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (lockoutTimerRef.current) clearInterval(lockoutTimerRef.current);
    };
  }, [email]);

  // OTP countdown timer
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (!isLockedOut && otpCountdown > 0) {
      timerRef.current = setInterval(() => {
        setOtpCountdown((prevCount) => {
          const newCount = prevCount - 1;
          if (newCount <= 0) {
            clearInterval(timerRef.current);
            timerRef.current = null;
            setCanResend(true);
            saveVerificationState({
              otpExpiry: 0,
              attemptsLeft: attemptsLeft,
            });
            return 0;
          }
          return newCount;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isLockedOut, otpCountdown, attemptsLeft]);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutTimerRef.current) {
      clearInterval(lockoutTimerRef.current);
      lockoutTimerRef.current = null;
    }

    if (isLockedOut && lockoutCountdown > 0) {
      lockoutTimerRef.current = setInterval(() => {
        setLockoutCountdown((prevCount) => {
          const newCount = prevCount - 1;
          if (newCount <= 0) {
            clearInterval(lockoutTimerRef.current);
            lockoutTimerRef.current = null;
            setIsLockedOut(false);
            setCanResend(true);
            saveVerificationState({
              lockoutExpiry: 0,
              isLockedOut: false,
            });
            return 0;
          }
          return newCount;
        });
      }, 1000);
    }

    return () => {
      if (lockoutTimerRef.current) {
        clearInterval(lockoutTimerRef.current);
        lockoutTimerRef.current = null;
      }
    };
  }, [isLockedOut, lockoutCountdown]);

  // Handle failed verification attempt
  const handleFailedAttempt = () => {
    const newAttemptsLeft = attemptsLeft - 1;
    setAttemptsLeft(newAttemptsLeft);

    if (newAttemptsLeft <= 0) {
      setIsLockedOut(true);
      setLockoutCountdown(LOCKOUT_TIME);
      setCanResend(false);

      saveVerificationState({
        attemptsLeft: 0,
        isLockedOut: true,
        lockoutExpiry: Date.now() + LOCKOUT_TIME * 1000,
      });

      return "Too many failed attempts. Please try again after the lockout period.";
    } else {
      saveVerificationState({
        attemptsLeft: newAttemptsLeft,
      });

      return `Invalid OTP code. ${newAttemptsLeft} attempts remaining.`;
    }
  };

  // Reset verification state after successful OTP verification
  const resetVerificationState = () => {
    localStorage.removeItem(storageKey);
  };

  // Reset OTP state for resend
  const resetForResend = () => {
    setOtpCountdown(OTP_EXPIRY_TIME);
    setCanResend(false);
    setAttemptsLeft(MAX_ATTEMPTS);

    saveVerificationState({
      otpExpiry: Date.now() + OTP_EXPIRY_TIME * 1000,
      attemptsLeft: MAX_ATTEMPTS,
      isLockedOut: false,
      lockoutExpiry: 0,
    });
  };

  // Format time from seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return {
    otpCountdown,
    lockoutCountdown,
    attemptsLeft,
    isLockedOut,
    canResend,
    handleFailedAttempt,
    resetVerificationState,
    resetForResend,
    formatTime,
  };
};

/**
 * OTP Input component
 */
const OtpInput = ({ otp, handleChange, handleKeyDown, handlePaste, disabled, inputRefs }) => (
  <div className="juan-otp-inputs" onPaste={handlePaste}>
    {otp.map((digit, index) => (
      <input
        key={index}
        type="text"
        maxLength="1"
        value={digit}
        onChange={(e) => handleChange(index, e.target.value)}
        onKeyDown={(e) => handleKeyDown(index, e)}
        ref={(el) => (inputRefs.current[index] = el)}
        className="juan-otp-input"
        disabled={disabled}
        autoFocus={index === 0}
      />
    ))}
  </div>
);

/**
 * Main component for OTP verification in forgot password flow
 */
function VerifyOTPForgotPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const inputsRef = useRef([]);

  // Get email from location state
  const email = location.state?.email || "";
  const fromForgotPassword = location.state?.fromForgotPassword || false;

  // OTP state
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  // Use custom hook for OTP verification
  const {
    otpCountdown,
    lockoutCountdown,
    attemptsLeft,
    isLockedOut,
    canResend,
    handleFailedAttempt,
    resetVerificationState,
    resetForResend,
    formatTime,
  } = useOtpVerification(email);

  // Redirect if no email or not coming from forgot password page
  useEffect(() => {
    if (!email || !fromForgotPassword) {
      navigate("/scope-forgot-password");
    }
  }, [email, navigate, fromForgotPassword]);

  // Handle OTP input change
  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (error) setError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  // Handle backspace key press
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  // Handle paste event for OTP
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();

    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      inputsRef.current[5].focus();
    }
  };

  // Handle submit - verify OTP for password reset
  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join("");

    if (otpString.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setLoading(true);
    setSuccess("");
    setError("");

    try {
      // Verify the OTP using the API function from applicant.js
      const response = await verifyResetPasswordOtp(email, otpString);

      if (response.success) {
        // OTP is verified successfully
        resetVerificationState();

        // Navigate to reset password page with email and OTP
        navigate("/reset-password", {
          state: {
            email,
            otp: otpString,
            otpVerified: true,
          },
        });
      } else {
        // Handle failed verification
        const errorMessage = handleFailedAttempt();
        setError(errorMessage || response.message || "Failed to verify OTP");
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      const errorMessage = handleFailedAttempt();
      setError(errorMessage || err.message || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  // Handle resend OTP
  const handleResend = async () => {
    if (!canResend) return;

    setResendLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await forgotPasswordApplicantApiRequest(email);

      if (response.success) {
        resetForResend();
        setSuccess("New verification code sent to your email");
        setOtp(["", "", "", "", "", ""]);
        inputsRef.current[0].focus();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(response.message || "Failed to resend verification code");
      }
    } catch (err) {
      console.error("Resend OTP error:", err);
      setError("Failed to resend verification code. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="juan-verify-container">
      <ToastContainer />
     <Header logo={JuanEMSLogo} altText="JuanEMS Logo" />

      <div className="juan-verify-main">
        <div className="juan-verify-card">
          <FontAwesomeIcon icon={faEnvelopeOpen} size="3x" className="juan-verify-icon" />
          <h2>Verify Your Identity</h2>
          <p className="juan-verify-description">
            Please enter the 6-digit verification code sent to {email} to reset your password.
          </p>

          <form onSubmit={handleSubmit} className="juan-otp-form">
            <OtpInput
              otp={otp}
              handleChange={handleChange}
              handleKeyDown={handleKeyDown}
              handlePaste={handlePaste}
              disabled={loading || isLockedOut}
              inputRefs={inputsRef}
            />

            {attemptsLeft < MAX_ATTEMPTS && !isLockedOut && (
              <p className="juan-otp-attempts">Attempts remaining: {attemptsLeft}</p>
            )}

            {otpCountdown > 0 && (
              <p className="juan-otp-timer">Code expires in: {formatTime(otpCountdown)}</p>
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
                {resendLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : "Resend Code"}
              </button>
              <button
                type="submit"
                disabled={loading || isLockedOut}
                className="juan-verify-button"
              >
                {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : "Verify"}
              </button>
            </div>
          </form>

          <p className="juan-verify-note">
            If you don't receive the code, check your spam folder or click Resend Code.
          </p>
        </div>
      </div>

    <Footer />
    </div>
  );
}

export default VerifyOTPForgotPassword;