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
import { Button, Input } from "antd";
import React, { useState } from "react";
import { FaEnvelope } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../css/JuanEMS/SplashScreen.css";
import "../../css/JuanScope/ScopeLogin.css";
import "../../css/UserAdmin/Global.css";
import "../../css/UserAdmin/LoginPage.css";
import JuanEMSLogo from "../../images/JuanEMSlogo.png";
import SJDEFILogo from "../../images/SJDEFILogo.png";
import { forgotPasswordApplicantApiRequest } from "../../api/applicant";

const ForgotPasswordApplicant = () => {
  const navigate = useNavigate();

  // State variables
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle email submission to request OTP
  const handleRequestOTP = async () => {
    if (!validateEmail()) return;

    setLoading(true);
    setMessage("");

    try {
      console.log("Attempting to request OTP for email:", email);
      const response = await forgotPasswordApplicantApiRequest(email);
      console.log("OTP Request API Response:", response);

      if (response.success) {
        toast.success(
          response.message || "OTP request successful. Please check your email."
        );
        navigate("/scope-forgot-password-otp-code", {
          state: {
            email: email,
            fromForgotPassword: true,
          },
        });
      } else {
        setMessage(response.message || "Failed to request OTP.");
        toast.error(response.message || "Failed to request OTP.");
      }
    } catch (err) {
      console.error("Error requesting OTP:", err);
      setMessage("An unexpected error occurred. Please try again.");
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Form validation
  const validateEmail = () => {
    if (!email) {
      setErrors({ email: "Email is required" });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrors({ email: "Please enter a valid email address" });
      return false;
    }

    setErrors({});
    return true;
  };

  // Navigation handlers
  const handleGoToLogin = () => {
    navigate("/applicant/login");
  };

  const handleGoToHome = () => {
    navigate("/home");
  };

  // Main render
  return (
    <div className="splash-screen-container main">
      <ToastContainer />
      <div className="login-container">
        <div className="left-box">
          <img src={SJDEFILogo} alt="SJDEFI Logo" className="admin-logo" />
          <div className="header-text">
            <h1> SAN JUAN DE DIOS EDUCATIONAL FOUNDATION, INC. </h1>{" "}
            <p className="motto">
              {" "}
              Where faith and reason are expressed in Charity.{" "}
            </p>{" "}
          </div>{" "}
          <h1 className="login-title"> Applicant Portal </h1>{" "}
        </div>
        <div className="right-box">
          <h1 className="login-title"> Forgot Password </h1>{" "}
          <p className="login-subtitle">
            {" "}
            Enter your email to receive a password reset code{" "}
          </p>
          <label className="input-label"> Email </label>{" "}
          <Input
            className="custom-input"
            addonBefore={<FaEnvelope />}
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            status={errors.email ? "error" : ""}
          />{" "}
          {errors.email && (
            <div className="error-message"> {errors.email} </div>
          )}
          <div className="login-options">
            <Button type="link" onClick={handleGoToHome} style={{ padding: 0 }}>
              Go Back to Home{" "}
            </Button>{" "}
            <Button
              type="link"
              onClick={handleGoToLogin}
              style={{ padding: 0 }}
            >
              Back to Login{" "}
            </Button>{" "}
          </div>
          <Button
            type="ghost"
            className="login-btn"
            onClick={handleRequestOTP}
            disabled={loading}
          >
            {loading ? (
              <>
                <FontAwesomeIcon
                  icon={faSpinner}
                  spin
                  className="spinner-icon"
                />
                <span> Processing... </span>{" "}
              </>
            ) : (
              "Request Reset Code"
            )}{" "}
          </Button>{" "}
        </div>{" "}
      </div>{" "}
      <Footer />
    </div>
  );
};

// Separate the Footer component for better code organization
const Footer = () => (
  <footer className="juan-register-footer">
    <div className="juan-footer-left">
      <img src={JuanEMSLogo} alt="SJDEFI Logo" className="juan-footer-logo" />
      <div className="juan-footer-text">
        <h1> JuanEMS - Applicant Portal </h1>{" "}
        <p className="juan-footer-motto">
          2025. San Juan De Dios Educational Foundation Inc.{" "}
        </p>{" "}
      </div>{" "}
    </div>{" "}
    <div className="juan-footer-content">
      <div className="juan-footer-links">
        <a href="/about" className="footer-link">
          About{" "}
        </a>{" "}
        <span className="footer-link-separator"> | </span>{" "}
        <a href="/terms-of-use" className="footer-link">
          Terms of Use{" "}
        </a>{" "}
        <span className="footer-link-separator"> | </span>{" "}
        <a href="/privacy" className="footer-link">
          Privacy{" "}
        </a>{" "}
      </div>{" "}
      <a
        href="https://www.facebook.com/SJDEFIcollege"
        target="_blank"
        rel="noopener noreferrer"
        className="juan-footer-social-link"
      >
        <FontAwesomeIcon icon={faFacebookSquare} className="juan-social-icon" />
        <div className="juan-social-text">
          <span className="juan-social-find"> Find us on </span>{" "}
          <span className="juan-social-platform"> Facebook </span>{" "}
        </div>{" "}
      </a>{" "}
      <div className="juan-footer-contact-container">
        <div className="juan-contact-title">
          <FontAwesomeIcon icon={faPhone} /> <span> CONTACT US </span>{" "}
        </div>{" "}
        <div className="juan-contact-items">
          <div className="juan-contact-item">
            <FontAwesomeIcon icon={faMapMarkerAlt} />{" "}
            <span> 2772 Roxas Blvd., Pasay City, Philippines, 1300 </span>{" "}
          </div>{" "}
          <div className="juan-contact-item">
            <FontAwesomeIcon icon={faPhone} /> <span> +632 551 - 2763 </span>{" "}
          </div>{" "}
          <div className="juan-contact-item">
            <FontAwesomeIcon icon={faEnvelope} />{" "}
            <span>
              admission_office @sjdefi.edu.ph | registrarsoffice @sjdefi.edu.ph{" "}
            </span>{" "}
          </div>{" "}
          <div className="juan-contact-item">
            <FontAwesomeIcon icon={faClock} />{" "}
            <span>
              Monday to Thursday - 7: 00 AM to 5: 00 PM | Friday - 7: 00 AM to
              4: 00 PM{" "}
            </span>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>{" "}
  </footer>
);

export default ForgotPasswordApplicant;
