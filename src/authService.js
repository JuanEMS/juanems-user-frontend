/**
 * Send OTP for sign-in verification
 * @param {string} email - User's email address
 * @param {boolean} isPasswordReset - Whether this is for password reset
 * @param {boolean} isLoginOtp - Whether this is for login verification
 * @returns {Promise} Promise object with API response
 */
export const sendSigninOTP = async (
  email,
  isPasswordReset = false,
  isLoginOtp = false
) => {
  let endpoint;

  if (isPasswordReset) {
    endpoint = "/api/enrollee-applicants/request-password-reset";
  } else if (isLoginOtp) {
    endpoint = "/api/enrollee-applicants/send-signin-otp";
  } else {
    endpoint = "/api/enrollee-applicants/resend-otp";
  }

  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}${endpoint}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw {
        message: data.error || "Failed to send verification code",
        status: response.status,
      };
    }

    return data;
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw error.message
      ? error
      : { message: "Network error. Please try again." };
  }
};

/**
 * Verify OTP for sign-in
 * @param {string} email - User's email address
 * @param {string} otp - One-time password
 * @param {boolean} isLoginOtp - Whether this is for login verification
 * @returns {Promise} Promise object with API response
 */
export const verifySigninOTP = async (email, otp, isLoginOtp = false) => {
  const endpoint = isLoginOtp
    ? "/api/enrollee-applicants/verify-signin-otp"
    : "/api/enrollee-applicants/verify-otp";

  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}${endpoint}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw {
        message: data.error || "Verification failed",
        status: response.status,
        attemptsLeft: data.attemptsLeft,
      };
    }

    return data;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    throw error.message
      ? error
      : { message: "Network error. Please try again." };
  }
};

/**
 * Get verification status
 * @param {string} email - User's email address
 * @param {boolean} isPasswordReset - Whether this is for password reset
 * @param {boolean} isLoginOtp - Whether this is for login verification
 * @returns {Promise} Promise object with API response
 */
export const getVerificationStatus = async (
  email,
  isPasswordReset = false,
  isLoginOtp = false
) => {
  let endpoint;

  if (isPasswordReset) {
    endpoint = `/api/enrollee-applicants/password-reset-status/${email}`;
  } else if (isLoginOtp) {
    endpoint = `/api/enrollee-applicants/login-otp-status/${email}`;
  } else {
    endpoint = `/api/enrollee-applicants/verification-status/${email}`;
  }

  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}${endpoint}`);
    const data = await response.json();

    if (!response.ok) {
      throw {
        message: data.error || "Failed to get verification status",
        status: response.status,
      };
    }

    return data;
  } catch (error) {
    console.error("Error getting verification status:", error);
    throw error.message
      ? error
      : { message: "Network error. Please try again." };
  }
};
