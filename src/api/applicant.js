import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

/**
 * Send a forgot password request to initiate the OTP process
 * @param {string} email - The user's email address
 * @returns {Promise<Object>} - The API response
 */
export const forgotPasswordApplicantApiRequest = async (email) => {
  try {
    if (!email) {
      throw new Error("Email is required");
    }

    // Validate email format on client side as well
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }
    console.log("Email format is valid", email);
    const response = await axios.post(`${API_URL}/api/enrollee-applicants/forgot-password/applicant`, {
      email,
    });
    console.log("response", response);
    return {
      success: true,
      message: response.data.message,
      data: response.data,
    };
  } catch (error) {
    console.error("Error in forgotPasswordApplicantApiRequest:", error);
    // Handle different types of errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return {
        success: false,
        message: error.response.data.message || "Password reset request failed",
        error: error.response.data,
      };
    } else if (error.request) {
      // The request was made but no response was received
      return {
        success: false,
        message: "No response from server. Please check your connection",
        error: error.request,
      };
    } else {
      // Something happened in setting up the request that triggered an Error
      return {
        success: false,
        message: error.message || "Password reset request failed",
        error: error,
      };
    }
  }
};

/**
 * Verify OTP code for password reset
 * @param {string} email - The user's email address
 * @param {string} otp - The 6-digit OTP code
 * @returns {Promise<Object>} - API response with verification status
 */
export const verifyResetPasswordOtp = async (email, otp) => {
  try {
    // Input validation
    if (!email || !otp) {
      throw new Error("Email and OTP are required");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }

    if (!/^\d{6}$/.test(otp)) {
      throw new Error("OTP must be a 6-digit number");
    }

    // Call API to verify OTP
    const response = await axios.post(
      `${API_URL}/api/enrollee-applicants/verify-reset-password-otp`,
      { email, otp }
    );

    return {
      success: true,
      message: response.data.message || "OTP verified successfully",
      data: response.data,
    };
  } catch (error) {
    console.error("Error in verifyResetPasswordOtp:", error);
    if (error.response) {
      return {
        success: false,
        message: error.response.data.message || "OTP verification failed",
        error: error.response.data,
      };
    } else if (error.request) {
      return {
        success: false,
        message: "No response from server. Please check your connection.",
        error: error.request,
      };
    } else {
      return {
        success: false,
        message: error.message || "OTP verification failed",
        error,
      };
    }
  }
};

/**
 * Reset password after OTP verification
 * @param {string} email - The user's email address
 * @param {string} newPassword - The new password
 * @returns {Promise<Object>} - API response with reset status
 */
export const resetApplicantPassword = async (email, newPassword) => {
  try {
    // Basic input validation
    if (!email || !newPassword) {
      throw new Error("Email and new password are required");
    }

    // Call API to reset password
    const response = await axios.post(
      `${API_URL}/api/enrollee-applicants/reset-password/applicant`,
      { email, newPassword }
    );

    // The backend returns success: true/false in the response
    return {
      success: response.data.success,
      message: response.data.message || "Password reset successful",
      data: response.data,
    };
  } catch (error) {
    console.error("Error in resetApplicantPassword:", error);
    if (error.response) {
      // Return the error response from the server
      return {
        success: false,
        message: error.response.data.message || "Password reset failed",
        error: error.response.data,
      };
    } else if (error.request) {
      // The request was made but no response was received
      return {
        success: false,
        message: "No response from server. Please check your connection.",
        error: error.request,
      };
    } else {
      // Something happened in setting up the request
      return {
        success: false,
        message: error.message || "Password reset failed",
        error,
      };
    }
  }
};

/**
 * Complete two-step password reset process: verify OTP then reset password
 * @param {string} email - The user's email address
 * @param {string} otp - The OTP received via email
 * @param {string} newPassword - The new password (optional for first step)
 * @returns {Promise<Object>} - Combined result of verification and reset
 */
export const verifyOtpAndResetPasswordApiRequest = async (
  email,
  otp,
  newPassword
) => {
  try {
    // If no password provided, just verify the OTP
    if (!newPassword) {
      return await verifyResetPasswordOtp(email, otp);
    }

    // Step 1: Verify OTP
    const verifyResult = await verifyResetPasswordOtp(email, otp);
    if (!verifyResult.success) {
      return verifyResult; // Return the error from verification
    }

    // Step 2: Reset Password
    const resetResult = await resetApplicantPassword(email, newPassword);
    return resetResult;
  } catch (error) {
    console.error("Error in verifyOtpAndResetPasswordApiRequest:", error);
    return {
      success: false,
      message: error.message || "Failed to complete password reset process",
      error,
    };
  }
};

// For backward compatibility
export const verifyOtpCodeForgotPasswordApiRequest = verifyResetPasswordOtp;

/**
 * Updates an applicant's interview and/or exam status
 * @param {string} applicantId - The ID of the applicant to update
 * @param {Object} statusData - Object containing interview and/or exam status
 * @param {string} [statusData.interviewStatus] - New interview status (Pending, Scheduled, Completed, Passed, Failed)
 * @param {string} [statusData.examStatus] - New exam status (Pending, Scheduled, Completed, Passed, Failed)
 * @returns {Promise<Object>} - The response data with updated status information
 */
export const updateApplicantStatusResult = async (applicantId, statusData) => {
  try {
    if (!applicantId) {
      throw new Error("Applicant ID is required");
    }

    if (
      !statusData ||
      (!statusData.interviewStatus && !statusData.examStatus)
    ) {
      throw new Error(
        "At least one status field (interviewStatus or examStatus) is required"
      );
    }

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const response = await axios.patch(
      `${API_URL}/api/enrollee-applicants/update-status/results/${applicantId}`,
      { statusData },
      config
    );

    return response.data;
  } catch (error) {
    console.log("Error updating applicant status:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to update applicant status";

    console.error("Error updating applicant status:", errorMessage);
    throw new Error(errorMessage);
  }
};

export const getAllApplicationsApprovedExamAndInterviewSchedule = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/api/enrollee-applicants/applicants/approved`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching approved applicants:", error);
    return {
      success: false,
      error:
        error.response?.data?.error || "Failed to fetch approved applicants",
    };
  }
};
/**
 * Updates an applicant's exam and interview schedule data
 * @param {string} applicantId - The ID of the applicant
 * @param {Object} scheduleData - The schedule data to update
 * @returns {Promise} - Promise resolving to the API response data
 */
export const updateApplicantExamAndScheduleDataApiRequest = async (
  applicantId,
  scheduleData
) => {
  try {
    const response = await axios.patch(
      `${API_URL}/api/enrollee-applicants/update-interview-and-exam-data`,
      { applicantId, scheduleData },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    // Enhanced error handling
    if (error.response) {
      // The server responded with a status code outside the 2xx range
      console.error("API Error Response:", {
        status: error.response.status,
        data: error.response.data,
      });

      // Return a standardized error object instead of throwing
      return {
        success: false,
        error: error.response.data.message || "Server error occurred",
      };
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received:", error.request);
      return {
        success: false,
        error: "No response received from server",
      };
    } else {
      // Something happened in setting up the request
      console.error("Request Error:", error.message);
      return {
        success: false,
        error: `Request failed: ${error.message}`,
      };
    }
  }
};

/**
 * Get all applicants with "On-going" status with pagination
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Number of items per page (default: 10)
 * @returns {Promise<Object>} - Promise containing the response data
 */
export const getAllApplicantsOngoingExamAndInterviewSchedule = async (
  params = {}
) => {
  try {
    // Set default pagination values if not provided
    const page = params.page || 1;
    const limit = params.limit || 10;

    // Make API request with query parameters
    const response = await axios.get(
      `${API_URL}/api/enrollee-applicants/applicants/ongoing`,
      {
        params: {
          page,
          limit,
        },
      }
    );

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.error("Error fetching ongoing applicants:", error);

    // Return structured error response
    return {
      success: false,
      error:
        error.response?.data?.error || "Failed to fetch ongoing applicants",
    };
  }
};
