import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkerAlt,
  faPhone,
  faEnvelope,
  faClock,
  faEnvelopeOpen,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { faFacebookSquare } from "@fortawesome/free-brands-svg-icons";
import SJDEFILogo from "../../images/SJDEFILogo.png";
import JuanEMSLogo from "../../images/JuanEMSlogo.png";
import "../../css/JuanScope/VerifyEmail.css";
import { getVerificationStatus, sendSigninOTP, verifySigninOTP } from "../../authService";

function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const inputsRef = useRef([]);

  // State variables
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(180);
  const [lockoutCountdown, setLockoutCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [firstName, setFirstName] = useState(location.state?.firstName || "");

  // Get data from location state
  const email = location.state?.email || "";
  const studentID = location.state?.studentID || "";
  const isPasswordReset = location.state?.isPasswordReset || false;
  const isLoginOtp = location.state?.isLoginOtp || false;
  console.log("isPasswordReset", isPasswordReset);
  console.log("email", email);
  console.log("firstName", firstName);
  console.log("studentID", studentID);
  console.log("isLoginOtp", isLoginOtp);
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
          }
        } catch (error) {
          console.error("Error fetching user details:", error);
        }
      };
      fetchUserDetails();
    }
  }, [email, firstName, isPasswordReset]);

  // OTP countdown timer
  useEffect(() => {
    let timer;
    if (!isLockedOut && otpCountdown > 0) {
      timer = setTimeout(() => {
        setOtpCountdown((prev) => {
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

  // Lockout countdown timer
  useEffect(() => {
    let timer;
    if (isLockedOut && lockoutCountdown > 0) {
      timer = setTimeout(() => {
        setLockoutCountdown((prev) => {
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

  // Fetch verification status
  useEffect(() => {
    const fetchVerificationStatus = async () => {
      try {
        if (!email) return;

        const data = await getVerificationStatus(
          email,
          isPasswordReset,
          isLoginOtp
        );

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
      } catch (error) {
        console.error("Error fetching verification status:", error);
      }
    };

    fetchVerificationStatus();
  }, [email, firstName, isPasswordReset, isLoginOtp]);

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
    return;
  }

  setLoading(true);
  try {
    const response = await verifySigninOTP(email, otpString, isLoginOtp);

    if (isLoginOtp) {
      setSuccess("Login verified successfully!");

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
        localStorage.setItem("activityStatus", response.user.activityStatus || "");
        localStorage.setItem("loginAttempts", 
          (response.user.loginAttempts?.toString() || "0")
        );
      }

      setTimeout(() => {
        navigate("/scope-dashboard");
      }, 2000);
    } else {
      setSuccess("Email verified successfully!");
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

    if (err.message === "OTP has expired. Please request a new one.") {
      setCanResend(true);
      setOtpCountdown(0);
    }

    if (err.attemptsLeft !== undefined) {
      setAttemptsLeft(err.attemptsLeft);
    }

    setError(err.message || "Verification failed. Please try again.");
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

      setOtpCountdown(180);
      setLockoutCountdown(0);
      setIsLockedOut(false);
      setCanResend(false);
      setAttemptsLeft(3);
      setSuccess("New verification code sent to your email");

      setOtp(["", "", "", "", "", ""]);
      inputsRef.current[0].focus();

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(
        err.message || "Failed to resend verification code. Please try again."
      );
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

            {attemptsLeft < 3 && !isLockedOut && (
              <p className="juan-otp-attempts">
                Attempts remaining: {attemptsLeft}
              </p>
            )}

            {otpCountdown > 0 && (
              <p className="juan-otp-timer">
                Code expires in: {formatTime(otpCountdown)}
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
