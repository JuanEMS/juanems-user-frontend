import {
  faEnvelope,
  faEye,
  faEyeSlash,
  faLock,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import "../../css/JuanScope/ScopeLogin.css";
import JuanEMSLogo from "../../images/JuanEMSlogo.png";
import SJDEFILogo from "../../images/SJDEFILogo.png";
import ScopeImage from "../../images/scope.png";
import PasswordNotification from "../JuanScope/PasswordNotification";

// Form validation schema
const loginSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .min(1, "Password is required"),
});

function ScopeLogin() {
  const navigate = useNavigate();
  const location = useLocation();

  // Form state using React Hook Form
  const {
    register,
    handleSubmit: validateForm,
    formState: { errors },
    watch,
    setValue,
    trigger,
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Component state
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [lastResetRequest, setLastResetRequest] = useState(null);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Watched values
  const email = watch("email");

  useEffect(() => {
    // Handle redirects with state
    if (location.state?.fromPasswordReset) {
      setLoginError("");
      alert(
        "Password reset successful. Please check your email for the new password."
      );
    }

    if (location.state?.accountInactive) {
      setLoginError("Your session was invalidated. Please login again.");
    }

    if (location.state?.sessionExpired) {
      setLoginError(
        "Your session has expired due to inactivity. Please login again."
      );
    }
  }, [location.state]);

  // Utility function for API requests with retry logic
  const fetchWithRetry = async (url, options, retries = 3, delay = 1000) => {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      if (retries > 0 && !error.message.includes("400")) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        return fetchWithRetry(url, options, retries - 1, delay);
      }
      throw error;
    }
  };

  // Check account verification status
  const checkAccountStatus = async (email) => {
    if (!email) return;

    try {
      const data = await fetchWithRetry(
        `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/verification-status/${email}`
      );

      if (data.status === "Pending Verification") {
        navigate("/verify-email", {
          state: {
            email: email,
            firstName: data.firstName,
            fromRegistration: false,
            fromLogin: true,
          },
        });
      }
    } catch (error) {
      console.error("Error checking account status:", error);
      setLoginError("Unable to verify account status. Please try again.");
    }
  };

  // Handle email input blur to check account status
  const handleEmailBlur = () => {
    trigger("email").then((isValid) => {
      if (isValid) {
        checkAccountStatus(email);
      }
    });
  };

  // Send OTP code for sign in verification
  const sendOtpCode = async (email) => {
    try {
      console.log("Sending OTP to:", email);
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/send-signin-otp`,
        { email: email.trim() }
      );

      console.log("OTP send response:", {
        status: response.status,
        message: response.data.message,
      });

      return response.data;
    } catch (error) {
      console.error("Failed to send OTP:", error);
      if (error.response) {
        throw new Error(
          error.response.data.error || "Failed to send verification code"
        );
      }
      throw new Error("Failed to send verification code. Please try again.");
    }
  };

  // Handle login form submission
  const onSubmit = async (formData) => {
    setLoginError("");

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Login form data:", formData);
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/signin-applicant`,
        {
          email: formData.email.trim(),
          password: formData.password.trim(),
        }
      );

      const data = response.data;
      console.log("Login response:", {
        status: response.status,
        data: data,
      });

      // After successful sign in, send OTP
      await sendOtpCode(formData.email);

      // Navigate to verify email for OTP verification
      navigate("/verify-email", {
        state: {
          email: formData.email.trim(),
          isLoginOtp: true,
          fromLogin: true,
        },
      });
    } catch (err) {
      console.error("Login error:", err);

      if (err.response) {
        // Server responded with error
        const errorMessage =
          err.response.data.error || "Invalid email or password";
        setLoginError(errorMessage);
        console.log("Server error response:", {
          status: err.response.status,
          data: err.response.data,
        });
      } else if (err.request) {
        // Request made but no response
        setLoginError("No response from server. Please check your connection.");
        console.log("No response from server:", err.request);
      } else {
        // Error setting up request
        setLoginError("Failed to make login request");
        console.log("Request setup error:", err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };



  // Handle confirmed password reset
  const handleConfirmedForgotPassword = async () => {
    if (isSubmitting) return;

    setShowResetConfirmation(false);
    setLoginError("");
    setIsSubmitting(true);

    try {
      const data = await fetchWithRetry(
        `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/request-password-reset`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      console.log("Password reset request successful:", data);

      navigate("/verify-email", {
        state: {
          email,
          isPasswordReset: true,
          fromLogin: true,
        },
      });
    } catch (err) {
      console.error("Password reset error:", err);

      if (err.message.includes("400")) {
        setLoginError("Invalid email or account not found.");
      } else if (err.message.includes("429")) {
        setLoginError("Too many reset requests. Please try again later.");
      } else {
        setLoginError(
          "Failed to process password reset request. Please check your connection."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Navigate to home page
  const handleGoToHome = () => {
    navigate("/home");
  };

  return (
    <div className="scope-login-container">
      <PasswordNotification />
      <div className="scope-login-left-side">
        <div className="scope-login-image-background">
          <div className="scope-login-image-overlay"></div>
          <div className="scope-login-left-content">
            <div className="scope-login-top-logo">
              <img
                src={SJDEFILogo}
                alt="SJDEFI Logo"
                className="scope-login-sjdefi-logo"
              />
              <div className="scope-login-top-text">
                <h1>SAN JUAN DE DIOS EDUCATIONAL FOUNDATION, INC.</h1>
                <p className="scope-login-motto">
                  Where faith and reason are expressed in Charity.
                </p>
              </div>
            </div>
            <div className="scope-login-center-logo">
              <img
                src={JuanEMSLogo}
                alt="JuanEMS Logo"
                className="scope-login-ems-logo"
              />
              <h2 className="scope-login-ems-title">JuanEMS</h2>
              <p className="scope-login-ems-subtitle">
                Juan Enrollment Management System
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="scope-login-right-side">
        <div className="scope-login-form-container">
          <div className="scope-login-scope-title">
            <h1>
              JUANSC
              <img
                src={ScopeImage}
                alt="O"
                className="scope-login-scope-image"
              />
              PE
            </h1>
            <p className="scope-login-scope-subtitle">
              Online Admission Application
            </p>
          </div>
          <div className="scope-login-login-form">
            <h2 className="scope-login-form-title">Enroll Now!</h2>

            {loginError && (
              <div className="scope-login-error-message">{loginError}</div>
            )}

            <form onSubmit={validateForm(onSubmit)}>
              <div className="scope-login-form-group">
                <div className="scope-login-input-label">
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className="scope-login-input-icon"
                  />
                  <label>Email</label>
                </div>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="scope-login-input-field"
                  disabled={isSubmitting}
                  {...register("email")}
                  onBlur={handleEmailBlur}
                />
                {errors.email && (
                  <span className="scope-login-error-message">
                    {errors.email.message}
                  </span>
                )}
              </div>

              <div className="scope-login-form-group">
                <div className="scope-login-input-label">
                  <FontAwesomeIcon
                    icon={faLock}
                    className="scope-login-input-icon"
                  />
                  <label>Password</label>
                </div>
                <div className="scope-login-password-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="scope-login-input-field"
                    disabled={isSubmitting}
                    {...register("password")}
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
                {errors.password && (
                  <span className="scope-login-error-message">
                    {errors.password.message}
                  </span>
                )}
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
                  onClick={() => navigate("/scope-forgot-password")}
                >
                  Forgot Password?
                </button>
              </div>

              <button 
                type="submit"
                className={`scope-login-login-button ${
                  isSubmitting ? "scope-login-button-loading" : ""
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <FontAwesomeIcon
                      icon={faSpinner}
                      spin
                      className="scope-login-spinner"
                    />
                    <span>Processing...</span>
                  </>
                ) : (
                  "Login"
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
            <p>
              Are you sure you want to reset your password? A verification code
              will be sent to your email.
            </p>
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
                    <FontAwesomeIcon
                      icon={faSpinner}
                      spin
                      className="scope-login-spinner"
                    />
                    <span>Processing...</span>
                  </>
                ) : (
                  "Confirm"
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
