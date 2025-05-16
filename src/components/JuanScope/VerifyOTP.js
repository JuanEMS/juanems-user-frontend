import { faFacebookSquare } from "@fortawesome/free-brands-svg-icons";
import {
  faCheck,
  faClock,
  faEnvelope,
  faMapMarkerAlt,
  faPhone
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../css/JuanScope/Register.css";
import JuanEMSLogo from "../../images/JuanEMSlogo.png";
import SJDEFILogo from "../../images/SJDEFILogo.png";
import registrationPersonImg from "../../images/registrationperson.png";

function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const {
    email,
    firstName,
    lastName,
    message,
  } = location.state || {};

  useEffect(() => {
  if (!email || !firstName) {
      navigate("/register");
      return;
    }

    // Initialize resend timer
    if (resendTimer === 0) {
      setResendTimer(60);
    }
  }, [email, firstName, navigate]);

  // Timer countdown effect
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Prevent multiple digits
    if (!/^[0-9]*$/.test(value)) return; // Only allow numbers

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
      }
    }
  };

  const handleResendOTP = async () => {
    try {
      setError("");
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/send-signup-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            email,
            firstName,
            lastName,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        setResendTimer(60);
        setError(""); // Clear any previous errors
        // Show success message
        const successMessage = document.createElement("div");
        successMessage.className = "juan-info-message";
        successMessage.textContent = "New OTP code has been sent to your email";
        document.querySelector(".juan-otp-message").appendChild(successMessage);
        setTimeout(() => successMessage.remove(), 5000); // Remove after 5 seconds
      } else {
        setError(data.message || "Failed to resend OTP");
      }
    } catch (error) {
      console.error("Error resending OTP:", error);
      setError("Failed to resend OTP. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const otpValue = otp.join("");
      if (otpValue.length !== 6) {
        throw new Error("Please enter a complete 6-digit OTP code");
      }

      console.log('Verifying OTP...');
      const verifyResponse = await fetch(
        `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/verify-signup-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            otp: otpValue,
          }),
        }
      );

      const verifyData = await verifyResponse.json();
      console.log("OTP Verification Response:", verifyData);

      if (!verifyResponse.ok) {
        throw new Error(verifyData.error || "Invalid OTP code");
      }

      // OTP is verified successfully, now create the account
      if (!location.state?.registrationData) {
        throw new Error("Registration data not found");
      }

      console.log('Creating account with registration data:', location.state.registrationData);
      const registrationResponse = await fetch(
        `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/signup-applicant`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(location.state.registrationData),
        }
      );

      const registrationData = await registrationResponse.json();
      console.log('Registration Response:', registrationData);

      if (!registrationResponse.ok) {
        throw new Error(registrationData.error || 'Failed to create account');
      }

      // Account created successfully
      localStorage.setItem('userEmail', registrationData.email);
      localStorage.setItem('firstName', registrationData.firstName);
      localStorage.setItem('studentID', registrationData.studentID);
      localStorage.setItem('applicantID', registrationData.applicantID);
      localStorage.setItem('lastLogin', registrationData.lastLogin);
      localStorage.setItem('lastLogout', registrationData.lastLogout);
      localStorage.setItem('createdAt', registrationData.createdAt);
      localStorage.setItem('activityStatus', registrationData.activityStatus);
      localStorage.setItem('loginAttempts', '0');

      setSuccess(registrationData.message || 'Account created successfully! Redirecting to dashboard...');
      
      // Navigate to dashboard
      setTimeout(() => {
        navigate('/scope-dashboard');
      }, 2000);
    } catch (error) {
      console.error("OTP verification error:", error);
      setError(error.message || "Failed to verify OTP");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="juan-register-container">
      {/* Header */}
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

      <div className="juan-main-content">
        {/* Left side with gradient background and image */}
        <div className="juan-left-side">
          <div className="juan-gradient-background">
            <h2 className="juan-registration-title">OTP Verification</h2>
            <img
              src={registrationPersonImg}
              alt="Registration"
              className="juan-registration-image"
            />
          </div>
        </div>

        {/* Right side with form content */}
        <div className="juan-right-side">
          <div className="juan-form-container">
            <div className="juan-registration-form">
              <h3 className="juan-form-title">Verify Your Account</h3>
              <div className="juan-title-underline"></div>

              <div className="juan-otp-message">
                <p>
                  Hi {firstName}! Please enter the 6-digit OTP code sent to your
                  email address: <strong>{email}</strong>
                </p>
                {message && <p className="juan-info-message">{message}</p>}
                {success && <p className="juan-success-message">{success}</p>}
              </div>

              <form onSubmit={handleSubmit}>
                <div className="juan-otp-inputs">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="juan-otp-input"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>

                {error && <div className="juan-error-message">{error}</div>}

                <div className="juan-form-buttons">
                  <button
                    type="submit"
                    className="juan-next-button"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "Verifying..."
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faCheck} /> Verify OTP
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="juan-resend-otp">
                {resendTimer > 0 ? (
                  <p>Resend OTP in {resendTimer} seconds</p>
                ) : (
                  <button
                    onClick={handleResendOTP}
                    className="juan-resend-button"
                    type="button"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="juan-register-footer">
        <div className="juan-footer-left">
          <img src={JuanEMSLogo} alt="SJDEFI Logo" className="juan-footer-logo" />
          <div className="juan-footer-text">
            <h1>JuanEMS - JUAN SCOPE</h1>
            <p className="juan-footer-motto">
              © 2025. San Juan De Dios Educational Foundation Inc.
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
                  admission_office@sjdefi.edu.ph | registrarsoffice@sjdefi.edu.ph
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

export default VerifyOTP;
