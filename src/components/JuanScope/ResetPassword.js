import { faFacebookSquare } from "@fortawesome/free-brands-svg-icons";
import {
    faClock,
    faEnvelope,
    faEye,
    faEyeSlash,
    faLock,
    faMapMarkerAlt,
    faPhone
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Form, Input } from "antd";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { resetApplicantPassword } from "../../api/applicant";
import "../../css/JuanScope/VerifyEmail.css";
import JuanEMSLogo from "../../images/JuanEMSlogo.png";
import SJDEFILogo from "../../images/SJDEFILogo.png";

// Password validation requirements - simplified to match API validation
const PASSWORD_REQUIREMENTS = [
  { regex: /.{8,}/, message: "At least 8 characters long" },
  { regex: /[A-Z]/, message: "At least one uppercase letter" },
  { regex: /[a-z]/, message: "At least one lowercase letter" },
  { regex: /[0-9]/, message: "At least one number" },
];

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  
  // State variables
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    requirements: PASSWORD_REQUIREMENTS.map(req => ({ ...req, met: false })),
  });

  // Get data from location state
  const email = location.state?.email || "";
  const otpVerified = location.state?.otpVerified || false;

  // Redirect if not coming from OTP verification
  useEffect(() => {
    if (!email || !otpVerified) {
      navigate("/scope-forgot-password");
    }
  }, [email, otpVerified, navigate]);

  // Password strength checker
  const checkPasswordStrength = useCallback((password) => {
    if (!password) {
      setPasswordStrength({
        score: 0,
        requirements: PASSWORD_REQUIREMENTS.map(req => ({ ...req, met: false })),
      });
      return;
    }

    const updatedRequirements = PASSWORD_REQUIREMENTS.map(req => ({
      ...req,
      met: req.regex.test(password),
    }));

    const metCount = updatedRequirements.filter(req => req.met).length;
    const score = Math.min(100, (metCount / PASSWORD_REQUIREMENTS.length) * 100);

    setPasswordStrength({
      score,
      requirements: updatedRequirements,
    });
  }, []);

  // Password strength indicator color
  const strengthColor = useMemo(() => {
    if (passwordStrength.score < 40) return "#ff4d4f";
    if (passwordStrength.score < 70) return "#faad14";
    return "#52c41a";
  }, [passwordStrength.score]);

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // Double-check if all password requirements are met
      if (passwordStrength.score < 100) {
        setError("Please ensure your password meets all the requirements");
        setLoading(false);
        return;
      }

      // Use the resetApplicantPassword API function from applicant.js
      // The API function will validate the password format
      const response = await resetApplicantPassword(email, values.password);

      if (response.success) {
        // Show success message
        setSuccess("Password reset successful!");
        toast.success("Your password has been reset successfully. You will be redirected to the login page.");

        // Redirect to login page after a delay
        setTimeout(() => {
          navigate("/scope-login");
        }, 3000);
      } else {
        // Handle API error response
        throw new Error(response.message || "Failed to reset password");
      }
    } catch (err) {
      console.error("Password reset error:", err);
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  // Handle password input change
  const handlePasswordChange = (e) => {
    const password = e.target.value;
    checkPasswordStrength(password);
    
    // Clear error when user starts typing again
    if (error) setError("");
  };

  return (
    <div className="juan-verify-container">
      <ToastContainer position="top-center" />
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
        <div className="juan-verify-card" style={{ maxWidth: "500px" }}>
          <FontAwesomeIcon
            icon={faLock}
            size="3x"
            className="juan-verify-icon"
            style={{ color: "#1890ff" }}
          />
          <h2>Reset Your Password</h2>
          <p className="juan-verify-description">
            Please create a new password for your account: {email}
          </p>

          <Form
            form={form}
            name="resetPassword"
            onFinish={handleSubmit}
            layout="vertical"
            style={{ width: "100%", marginTop: "20px" }}
            requiredMark={false}
          >
            {/* Password Field */}
            <Form.Item
              name="password"
              label="New Password"
              rules={[
                { required: true, message: "Please enter your new password" },
                { min: 8, message: "Password must be at least 8 characters" },
                {
                  validator: (_, value) => {
                    if (value && passwordStrength.score < 100) {
                      return Promise.reject("Password doesn't meet all requirements");
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input.Password
                prefix={<FontAwesomeIcon icon={faLock} style={{ color: "rgba(0,0,0,.25)" }} />}
                placeholder="Enter new password"
                onChange={handlePasswordChange}
                className="custom-input"
                iconRender={(visible) => (
                  <FontAwesomeIcon icon={visible ? faEye : faEyeSlash} />
                )}
              />
            </Form.Item>

            {/* Password Strength Indicator */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ marginRight: "10px", fontSize: "14px" }}>Password Strength:</span>
                <div style={{ flex: 1, height: "8px", backgroundColor: "#f0f0f0", borderRadius: "4px" }}>
                  <div
                    style={{
                      width: `${passwordStrength.score}%`,
                      height: "100%",
                      backgroundColor: strengthColor,
                      borderRadius: "4px",
                      transition: "width 0.3s, background-color 0.3s",
                    }}
                  />
                </div>
              </div>
              <div style={{ fontSize: "14px", color: "#666" }}>
                <p style={{ marginBottom: "5px", fontWeight: "bold" }}>Your password must have:</p>
                <ul style={{ paddingLeft: "20px", marginBottom: "0" }}>
                  {passwordStrength.requirements.map((req, index) => (
                    <li
                      key={index}
                      style={{
                        color: req.met ? "#52c41a" : "#ff4d4f",
                        marginBottom: "3px",
                      }}
                    >
                      {req.message}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Confirm Password Field */}
            <Form.Item
              name="confirmPassword"
              label="Confirm Password"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Please confirm your password" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject("The two passwords do not match");
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<FontAwesomeIcon icon={faLock} style={{ color: "rgba(0,0,0,.25)" }} />}
                placeholder="Confirm new password"
                className="custom-input"
                iconRender={(visible) => (
                  <FontAwesomeIcon icon={visible ? faEye : faEyeSlash} />
                )}
              />
            </Form.Item>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <Form.Item style={{ marginTop: "20px" }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                disabled={loading}
                style={{
                  width: "100%",
                  height: "40px",
                  fontSize: "16px",
                  background: "#1890ff",
                  borderColor: "#1890ff",
                }}
              >
                {loading ? "Resetting Password..." : "Reset Password"}
              </Button>
            </Form.Item>
          </Form>

          <p className="juan-verify-note">
            After resetting your password, you will be redirected to the login page.
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

export default ResetPassword;
