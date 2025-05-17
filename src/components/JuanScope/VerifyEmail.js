import { faFacebookSquare } from "@fortawesome/free-brands-svg-icons";
import {
  faClock,
  faEnvelope,
  faEnvelopeOpen,
  faMapMarkerAlt,
  faPhone,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getVerificationStatus,
  sendSigninOTP,
  verifySigninOTP,
} from "../../authService";
import "../../css/JuanScope/VerifyEmail.css";
import JuanEMSLogo from "../../images/JuanEMSlogo.png";
import SJDEFILogo from "../../images/SJDEFILogo.png";

// Constants
const OTP_EXPIRY_TIME = 180; // 3 minutes in seconds
const LOCKOUT_TIME = 300; // 5 minutes in seconds
const MAX_ATTEMPTS = 3;

function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const inputsRef = useRef([]);
  const timerRef = useRef(null);
  const lockoutTimerRef = useRef(null);

  // State variables
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [lockoutCountdown, setLockoutCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);
  const [firstName, setFirstName] = useState("");
  const [isOtpExpired, setIsOtpExpired] = useState(false);

  // Get data from location state
  const email = location.state?.email || "";
  const isPasswordReset = location.state?.isPasswordReset || false;
  const isLoginOtp = location.state?.isLoginOtp || false;

  // Function to display toast notifications
  const showSuccessToast = (message) => {
    toast.success(message, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      className: "juan-toast-success",
      icon: <FontAwesomeIcon icon={faEnvelope} />,
    });
  };

  const showErrorToast = (message) => {
    toast.error(message, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      className: "juan-toast-error",
    });
  };

  // Function to save verification state to localStorage with absolute timestamps
  const saveVerificationState = (state) => {
    const now = Date.now();
    const verificationState = {
      email,
      createdAt: state.createdAt || now,
      otpExpiry:
        state.otpExpiry || (otpCountdown > 0 ? now + otpCountdown * 1000 : 0),
      lockoutExpiry:
        state.lockoutExpiry ||
        (isLockedOut ? now + lockoutCountdown * 1000 : 0),
      attemptsLeft:
        state.attemptsLeft !== undefined ? state.attemptsLeft : attemptsLeft,
      isLockedOut:
        state.isLockedOut !== undefined ? state.isLockedOut : isLockedOut,
      firstName: state.firstName || firstName,
      isOtpExpired:
        state.isOtpExpired !== undefined ? state.isOtpExpired : isOtpExpired,
    };
    localStorage.setItem(
      `otpVerification_${email}`,
      JSON.stringify(verificationState)
    );
  };

  // Function to load verification state from localStorage
  const loadVerificationState = () => {
    const storedState = localStorage.getItem(`otpVerification_${email}`);
    if (!storedState) return null;

    try {
      const parsedState = JSON.parse(storedState);

      // Only use stored state if it's for the current email
      if (parsedState.email !== email) return null;

      const now = Date.now();

      // Calculate remaining time
      const otpTimeLeft = parsedState.otpExpiry
        ? Math.max(0, Math.floor((parsedState.otpExpiry - now) / 1000))
        : 0;
      const lockoutTimeLeft = parsedState.lockoutExpiry
        ? Math.max(0, Math.floor((parsedState.lockoutExpiry - now) / 1000))
        : 0;

      const otpExpired = otpTimeLeft <= 0;

      return {
        otpTimeLeft,
        lockoutTimeLeft,
        attemptsLeft: parsedState.attemptsLeft,
        isLockedOut: parsedState.lockoutExpiry > now,
        isOtpExpired: otpExpired,
        firstName: parsedState.firstName || "",
        createdAt: parsedState.createdAt,
      };
    } catch (error) {
      console.error("Error parsing verification state:", error);
      return null;
    }
  };

  // Initialize state from localStorage or fetch from server
  useEffect(() => {
    const initVerificationState = async () => {
      if (!email) {
        navigate("/scope-login", { replace: true });
        return;
      }

      // First try to load from localStorage
      const localState = loadVerificationState();

      if (localState) {
        // Use local state if available
        setOtpCountdown(localState.otpTimeLeft);
        setLockoutCountdown(localState.lockoutTimeLeft);
        setAttemptsLeft(localState.attemptsLeft);
        setIsLockedOut(localState.isLockedOut);
        setIsOtpExpired(localState.isOtpExpired);
        setCanResend(
          !localState.isLockedOut &&
            (localState.isOtpExpired || localState.otpTimeLeft <= 0)
        );

        if (localState.firstName) {
          setFirstName(localState.firstName);
        }
      } else {
        // Fetch from server if local state not available
        try {
          const data = await getVerificationStatus(
            email,
            isPasswordReset,
            isLoginOtp
          );

          const isOtpExp = data.otpTimeLeft <= 0;

          setIsLockedOut(data.isLockedOut);
          setLockoutCountdown(data.isLockedOut ? data.lockoutTimeLeft : 0);
          setOtpCountdown(data.isLockedOut ? 0 : Math.max(0, data.otpTimeLeft));
          setCanResend(!data.isLockedOut && isOtpExp);
          setAttemptsLeft(data.attemptsLeft);
          setIsOtpExpired(isOtpExp);

          if (data.firstName) {
            setFirstName(data.firstName);
          }

          // Save to localStorage
          saveVerificationState({
            createdAt: Date.now(),
            otpExpiry: Date.now() + data.otpTimeLeft * 1000,
            lockoutExpiry: data.isLockedOut
              ? Date.now() + data.lockoutTimeLeft * 1000
              : 0,
            attemptsLeft: data.attemptsLeft,
            isLockedOut: data.isLockedOut,
            isOtpExpired: isOtpExp,
            firstName: data.firstName,
          });
        } catch (error) {
          console.error("Error fetching verification status:", error);
          showErrorToast(
            "Failed to load verification status. Please try again."
          );
          setError("Failed to load verification status. Please try again.");
        }
      }
    };

    initVerificationState();

    // Clean up timers on unmount
    return () => {
      clearInterval(timerRef.current);
      clearInterval(lockoutTimerRef.current);
    };
  }, [email, isPasswordReset, isLoginOtp, navigate]);

  // Fetch user details for password reset
  useEffect(() => {
    if (isPasswordReset && email && !firstName) {
      const fetchUserDetails = async () => {
        try {
          const response = await getVerificationStatus(
            email,
            isPasswordReset,
            isLoginOtp
          );
          if (response.firstName) {
            setFirstName(response.firstName);
            saveVerificationState({ firstName: response.firstName });
          }
        } catch (error) {
          console.error("Error fetching user details:", error);
        }
      };
      fetchUserDetails();
    }
  }, [email, firstName, isPasswordReset, isLoginOtp]);

  // OTP countdown timer
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (!isLockedOut && otpCountdown > 0) {
      timerRef.current = setInterval(() => {
        setOtpCountdown((prev) => {
          const newValue = prev - 1;
          if (newValue <= 0) {
            clearInterval(timerRef.current);
            setCanResend(true);
            setIsOtpExpired(true);
            saveVerificationState({
              otpExpiry: 0,
              isOtpExpired: true,
            });
            return 0;
          }
          return newValue;
        });
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [otpCountdown, isLockedOut]);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutTimerRef.current) {
      clearInterval(lockoutTimerRef.current);
    }

    if (isLockedOut && lockoutCountdown > 0) {
      lockoutTimerRef.current = setInterval(() => {
        setLockoutCountdown((prev) => {
          const newValue = prev - 1;
          if (newValue <= 0) {
            clearInterval(lockoutTimerRef.current);
            setIsLockedOut(false);
            setCanResend(true);
            setAttemptsLeft(MAX_ATTEMPTS);
            saveVerificationState({
              lockoutExpiry: 0,
              isLockedOut: false,
              attemptsLeft: MAX_ATTEMPTS,
            });
            return 0;
          }
          return newValue;
        });
      }, 1000);
    }

    return () => clearInterval(lockoutTimerRef.current);
  }, [lockoutCountdown, isLockedOut]);

  // Format time from seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join("");

    if (otpString.length !== 6) {
      setError("Please enter the complete 6-digit code");
      showErrorToast("Please enter the complete 6-digit code");
      return;
    }

    // Allow submission even if OTP is expired - the server will validate
    setLoading(true);
    try {
      const response = await verifySigninOTP(email, otpString, isLoginOtp);

      if (isLoginOtp) {
        setSuccess("Login verified successfully!");
        showSuccessToast("Login verified successfully!");

        // Store the complete user object in localStorage
        if (response.user) {
          // Store entire user object as JSON string
          localStorage.setItem("user", JSON.stringify(response.user));

          // For backward compatibility or quick access, also store commonly used fields individually
          localStorage.setItem("userEmail", response.user.email);
          localStorage.setItem("firstName", response.user.firstName || "");
          localStorage.setItem("lastName", response.user.lastName || "");
          localStorage.setItem("studentID", response.user.studentID || "");
          localStorage.setItem("applicantID", response.user.applicantID || "");
          localStorage.setItem("lastLogin", response.user.lastLogin || "");
          localStorage.setItem("lastLogout", response.user.lastLogout || "");
          localStorage.setItem("createdAt", response.user.createdAt || "");
          localStorage.setItem(
            "activityStatus",
            response.user.activityStatus || ""
          );
          localStorage.setItem(
            "loginAttempts",
            response.user.loginAttempts?.toString() || "0"
          );
        }

        // Clear OTP verification data from localStorage
        localStorage.removeItem(`otpVerification_${email}`);

        // Store navigation target to show toast after navigation
        sessionStorage.setItem("showLoginSuccessToast", "true");

        setTimeout(() => {
          navigate("/scope-dashboard");
        }, 2000);
      } else {
        setSuccess("Email verified successfully!");
        showSuccessToast("Email verified successfully!");

        // Clear OTP verification data from localStorage
        localStorage.removeItem(`otpVerification_${email}`);

        // Store navigation target to show toast after navigation
        sessionStorage.setItem("showCredentialsSentToast", "true");

        setTimeout(() => {
          navigate("/scope-login", {
            state: {
              fromVerification: true,
              email: email,
            },
          });
        }, 2000);
      }
    } catch (err) {
      console.error("Error in handleSubmit:", {
        error: err.message,
        email: email,
      });

      // Handle expired OTP with clear message
      if (err.message === "OTP has expired. Please request a new one.") {
        setCanResend(true);
        setOtpCountdown(0);
        setIsOtpExpired(true);
        saveVerificationState({
          otpExpiry: 0,
          isOtpExpired: true,
        });
        showErrorToast("OTP has expired. Please request a new one.");
      }

      // Update attempts left
      if (err.attemptsLeft !== undefined) {
        const newAttemptsLeft = err.attemptsLeft;
        setAttemptsLeft(newAttemptsLeft);

        // Handle lockout after exceeding max attempts
        if (newAttemptsLeft <= 0) {
          setIsLockedOut(true);
          setLockoutCountdown(LOCKOUT_TIME);
          setCanResend(false);

          // Save lockout state
          saveVerificationState({
            attemptsLeft: 0,
            isLockedOut: true,
            lockoutExpiry: Date.now() + LOCKOUT_TIME * 1000,
          });

          showErrorToast(
            `Too many failed attempts. Please try again in ${formatTime(
              LOCKOUT_TIME
            )}.`
          );
        } else {
          // Just update attempts
          saveVerificationState({ attemptsLeft: newAttemptsLeft });
        }
      }

      setError(err.message || "Verification failed. Please try again.");
      showErrorToast(err.message || "Verification failed. Please try again.");
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
      await sendSigninOTP(email, isPasswordReset, isLoginOtp);

      // Reset OTP state
      setOtpCountdown(OTP_EXPIRY_TIME);
      setCanResend(false);
      setAttemptsLeft(MAX_ATTEMPTS);
      setIsOtpExpired(false);
      setSuccess("New verification code sent to your email");
      showSuccessToast("New verification code sent to your email");

      // Clear OTP inputs
      setOtp(["", "", "", "", "", ""]);
      inputsRef.current[0].focus();

      // Save new state to localStorage
      saveVerificationState({
        createdAt: Date.now(),
        otpExpiry: Date.now() + OTP_EXPIRY_TIME * 1000,
        attemptsLeft: MAX_ATTEMPTS,
        isLockedOut: false,
        lockoutExpiry: 0,
        isOtpExpired: false,
      });

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const errorMessage =
        err.message || "Failed to resend verification code. Please try again.";
      setError(errorMessage);
      showErrorToast(errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  const getVerificationTitle = () => {
    if (isLoginOtp) return "Verify Your Login";
    if (isPasswordReset) return "Verify to Reset Password";
    return "Verify Your Email";
  };

  const getVerificationDescription = () => {
    if (isLoginOtp) {
      return `Please enter the 6-digit verification code sent to ${email} to complete your login.`;
    } else if (isPasswordReset) {
      return `Please enter the 6-digit verification code sent to ${email} to reset your password.`;
    }
    return `Please enter the 6-digit verification code sent to ${email} to verify your account.`;
  };

  return (
    <div className="juan-verify-container">
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

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
          <FontAwesomeIcon
            icon={faEnvelopeOpen}
            size="3x"
            className="juan-verify-icon"
          />
          <h2>{getVerificationTitle()}</h2>
          <p className="juan-verify-description">
            {getVerificationDescription()}
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
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {attemptsLeft < MAX_ATTEMPTS && !isLockedOut && (
              <p className="juan-otp-attempts">
                Attempts remaining: {attemptsLeft}
              </p>
            )}

            {otpCountdown > 0 && (
              <p className="juan-otp-timer">
                Code expires in: {formatTime(otpCountdown)}
              </p>
            )}

            {isOtpExpired && otpCountdown <= 0 && !isLockedOut && (
              <p className="juan-otp-warning">
                This code has expired. You can still try to verify, but you may
                need to request a new code.
              </p>
            )}

            {isLockedOut && (
              <p className="juan-otp-error">
                Too many attempts. Please wait {formatTime(lockoutCountdown)} to
                try again.
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
                  "Resend Code"
                )}
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
            If you don't receive the code, check your spam folder or click
            Resend Code.
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
            <p className="juan-footer-motto">
              {" "}
              2025. San Juan De Dios Educational Foundation Inc.
            </p>
          </div>
        </div>
        <div className="juan-footer-content">
          <div className="juan-footer-links">
            <a href="/about" className="footer-link">
              About
            </a>
            <span className="footer-link-separator">|</span>
            <a href="/terms-of-use" className="footer-link">
              Terms of Use
            </a>
            <span className="footer-link-separator">|</span>
            <a href="/privacy" className="footer-link">
              Privacy
            </a>
          </div>
          <a
            href="https://www.facebook.com/SJDEFIcollege"
            target="_blank"
            rel="noopener noreferrer"
            className="juan-footer-social-link"
          >
            <FontAwesomeIcon
              icon={faFacebookSquare}
              className="juan-social-icon"
            />
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
                <span>
                  admission_office@sjdefi.edu.ph |
                  registrarsoffice@sjdefi.edu.ph
                </span>
              </div>
              <div className="juan-contact-item">
                <FontAwesomeIcon icon={faClock} />
                <span>
                  Monday to Thursday - 7:00 AM to 5:00 PM | Friday - 7:00 AM to
                  4:00 PM
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default VerifyEmail;
