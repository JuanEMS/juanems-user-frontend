import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkerAlt,
  faPhone,
  faEnvelope,
  faClock,
  faCheck,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { faFacebookSquare } from "@fortawesome/free-brands-svg-icons";
import { Turnstile } from "@marsidev/react-turnstile";
import "../../css/JuanScope/Register.css";
import SJDEFILogo from "../../images/SJDEFILogo.png";
import JuanEMSLogo from "../../images/JuanEMSlogo.png";
import registrationPersonImg from "../../images/registrationperson.png";

function Register3() {
  const navigate = useNavigate();
  const location = useLocation();

  const formData = location.state?.formData || {
    firstName: "",
    middleName: "",
    lastName: "",
    dob: "",
    email: "",
    mobile: "",
    nationality: "",
    academicYear: "",
    academicTerm: "",
    applyingFor: "",
    academicStrand: "",
  };

  const [errors, setErrors] = useState({});
  const [isChecked, setIsChecked] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTurnstileReady, setIsTurnstileReady] = useState(false);

  // Check for required info on load
  useEffect(() => {
    if (
      !location.state?.formData ||
      !location.state.formData.firstName ||
      !location.state.formData.lastName ||
      !location.state.formData.academicYear ||
      !location.state.formData.academicTerm
    ) {
      navigate("/register");
    }

    // Set Turnstile as ready after component mounts
    const timer = setTimeout(() => {
      setIsTurnstileReady(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [location, navigate]);

  const handleCheckboxChange = (e) => {
    setIsChecked(e.target.checked);
    if (errors.agreement) {
      setErrors((prev) => ({
        ...prev,
        agreement: null,
      }));
    }
  };

  const handleTurnstileError = () => {
    setErrors((prev) => ({
      ...prev,
      captcha: "An error occurred while verifying CAPTCHA. Please try again.",
    }));
  };

  const handleTurnstileExpire = () => {
    setErrors((prev) => ({
      ...prev,
      captcha: "CAPTCHA expired. Please verify again.",
    }));
    setCaptchaToken(null);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!isChecked) {
      newErrors.agreement = "You must agree to the data privacy agreement";
    }

    if (!captchaToken) {
      newErrors.captcha = "Please complete the captcha verification";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setShowConfirmModal(true);
    }
  };

  const handleBack = () => {
    navigate("/register2", { state: { formData } });
  };

  // In handleSubmit function, update the submit confirmation function
  // In Register3.js, modify the confirmRegistration function
  // In Register3.js, update the confirmRegistration function
  // Replace the confirmRegistration function
  const confirmRegistration = async () => {
    setIsSubmitting(true);
    setErrors({}); // Reset errors before submission
    try {
      // Trim string fields
      const trimmedFormData = {
        ...formData,
        firstName: formData.firstName.trim(),
        middleName: formData.middleName?.trim() || "",
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile.trim(),
        nationality: formData.nationality.trim(),
        academicStrand: formData.academicStrand.trim(),
        academicLevel: formData.applyingFor.trim(),
        academicTerm: formData.academicTerm.trim(),
        academicYear: formData.academicYear.trim(),
        captchaToken: captchaToken,
      };

      console.log("trimmedFormData", trimmedFormData);

      const emailToCheck = trimmedFormData.email;

      // Check for existing active/pending email before submitting
      const emailCheck = await fetch(
        `${
          process.env.REACT_APP_API_URL
        }/api/enrollee-applicants/check-email/${encodeURIComponent(
          emailToCheck
        )}`
      );
      console.log("emailCheck", emailCheck);
      if (emailCheck.status === 409) {
        const { message } = await emailCheck.json();
        setErrors({
          submit:
            message ||
            "Email is already in use with an active or pending application",
        });
        setIsSubmitting(false);
        setShowConfirmModal(false);
        return;
      }

      const emailCheckData = await emailCheck.json();
      if (emailCheckData.status === "Inactive") {
        console.log("Inactive account found, proceeding with new registration");
      }

      console.log("emailCheckData", emailCheckData);

      if (!emailCheck.ok) {
        throw new Error("Failed to check email uniqueness. Please try again.");
      }

      // Send OTP before navigating to verification
      console.log('Sending OTP...');
      const otpResponse = await fetch(
        `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/send-signup-otp`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: trimmedFormData.email,
            firstName: trimmedFormData.firstName,
            lastName: trimmedFormData.lastName
          })
        }
      );

      const otpData = await otpResponse.json();
      console.log('OTP Response:', otpData);

      if (!otpResponse.ok) {
        throw new Error(otpData.error || 'Failed to send OTP. Please try again.');
      }

      // Navigate to OTP verification page with registration data
      navigate("/verify-otp", {
        state: {
          email: trimmedFormData.email,
          firstName: trimmedFormData.firstName,
          lastName: trimmedFormData.lastName,
          fromRegistration: true,
          message: otpData.message || "Please check your email for the verification code.",
          registrationData: {
            ...trimmedFormData,
            captchaToken,
          },
          expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes expiry, matching backend
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      setErrors({
        submit:
          error.message ||
          "Registration failed. Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
      setShowConfirmModal(false);
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
            <h2 className="juan-registration-title">Online Registration</h2>
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
            {/* Registration form */}
            <div className="juan-registration-form">
              {/* Step indicator */}
              <div className="juan-step-indicator">
                <div className="juan-step-circles">
                  <div
                    className="juan-step-circle"
                    style={{ backgroundColor: "#34A853" }}
                  >
                    1
                  </div>
                  <div
                    className="juan-step-line"
                    style={{ backgroundColor: "#34A853" }}
                  ></div>
                  <div
                    className="juan-step-circle"
                    style={{ backgroundColor: "#34A853" }}
                  >
                    2
                  </div>
                  <div
                    className="juan-step-line"
                    style={{ backgroundColor: "#34A853" }}
                  ></div>
                  <div className="juan-step-circle active">3</div>
                </div>
                <div className="juan-step-text">Step 3 of 3</div>
              </div>

              {/* Form title */}
              <h3 className="juan-form-title">Data Privacy Agreement</h3>
              <div className="juan-title-underline"></div>

              {/* Form fields */}
              <form onSubmit={handleSubmit}>
                <div className="juan-form-grid">
                  {/* Data Privacy Agreement Checkbox */}
                  <div
                    className="juan-form-group"
                    style={{ gridColumn: "1 / -1" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "8px",
                      }}
                    >
                      <input
                        type="checkbox"
                        id="agreement"
                        checked={isChecked}
                        onChange={handleCheckboxChange}
                        style={{
                          width: "16px",
                          height: "16px",
                          margin: "2px 0 0 0",
                          flexShrink: 0,
                        }}
                        className={`juan-custom-checkbox ${
                          errors.agreement ? "juan-input-error" : ""
                        }`}
                      />
                      <label
                        htmlFor="agreement"
                        style={{
                          textAlign: "justify",
                          whiteSpace: "normal",
                          wordWrap: "break-word",
                          display: "inline-block",
                          width: "100%",
                          fontWeight: "normal",
                          fontSize: "13px",
                          margin: 0,
                        }}
                      >
                        I submit this form affirming that all of the information
                        I provided are true and correct to the best of my
                        ability, with the consent and approval of my
                        parents/guardian. Any information found to be incorrect,
                        would mean the cancellation of my application and
                        subject to perjury as accorded by law. Likewise,
                        consistent to the Data Privacy Act of 2012, San Juan de
                        Dios Educational Foundation Inc. - College, will
                        safeguard these data solely in compliance to the purpose
                        of the admission process.
                      </label>
                    </div>
                    {errors.agreement && (
                      <span
                        className="juan-error-message"
                        style={{ display: "block", marginTop: "5px" }}
                      >
                        {errors.agreement}
                      </span>
                    )}
                  </div>
                  {/* Cloudflare Turnstile Captcha */}
                  <div
                    className="juan-form-group"
                    style={{ gridColumn: "1 / -1", marginTop: "20px" }}
                  >
                    {isTurnstileReady && (
                      <Turnstile
                        siteKey={process.env.REACT_APP_TURNSTILE_SITE_KEY}
                        onSuccess={(token) => {
                          setCaptchaToken(token);
                          setErrors((prev) => ({ ...prev, captcha: null }));
                        }}
                        onError={handleTurnstileError}
                        onExpire={handleTurnstileError}
                        options={{
                          theme: "light",
                          size: "normal",
                          retry: "auto",
                          retryInterval: 3000,
                        }}
                        scriptOptions={{
                          async: true,
                          defer: true,
                          appendTo: "head",
                        }}
                      />
                    )}
                    {errors.captcha && (
                      <span
                        className="juan-error-message"
                        style={{ display: "block", marginTop: "5px" }}
                      >
                        {errors.captcha}
                      </span>
                    )}
                  </div>
                </div>

                <div className="juan-form-buttons">
                  <button
                    type="button"
                    className="juan-cancel-button"
                    onClick={handleBack}
                  >
                    <FontAwesomeIcon icon={faArrowLeft} /> Back
                  </button>
                  <button
                    type="submit"
                    className="juan-next-button"
                    disabled={isSubmitting}
                  >
                    <FontAwesomeIcon icon={faCheck} /> Register
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="juan-modal-overlay">
          <div className="juan-confirm-modal">
            <h3>Confirm Registration</h3>
            <p>
              Are you sure all the information you provided is correct and
              final? You won't be able to make changes after submission.
            </p>
            <div className="juan-modal-buttons">
              <button
                className="juan-modal-cancel"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
              >
                Review Information
              </button>
              <button
                className="juan-modal-confirm"
                onClick={confirmRegistration}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Yes, Submit"}
              </button>
            </div>
            {errors.submit && (
              <div
                className="juan-error-message"
                style={{ marginTop: "10px", textAlign: "center" }}
              >
                {errors.submit}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer section remains the same */}
      <footer className="juan-register-footer">
        {/* Left section - Logo and school name */}
        <div className="juan-footer-left">
          <img
            src={JuanEMSLogo}
            alt="SJDEFI Logo"
            className="juan-footer-logo"
          />
          <div className="juan-footer-text">
            <h1>JuanEMS - JUAN SCOPE</h1>
            <p className="juan-footer-motto">
              © 2025. San Juan De Dios Educational Foundation Inc.
            </p>
          </div>
        </div>

        {/* Center and right section - organized in a row */}
        <div className="juan-footer-content">
          {/* About, Terms, Privacy links */}
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

          {/* Footer content remains the same */}
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

export default Register3;
