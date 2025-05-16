import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

/**
 * Updates an applicant's exam and interview schedule data
 * @param {string} applicantId - The ID of the applicant
 * @param {Object} scheduleData - The schedule data to update
 * @returns {Promise} - Promise resolving to the API response data
 */
export const updateApplicantExamAndScheduleDataApiRequest = async (applicantId, scheduleData) => {
    try {
        const response = await axios.patch(
            `${API_URL}/api/enrollee-applicants/update-interview-and-exam-data`, 
            { applicantId, scheduleData },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            }
        );
        
        return response.data;
    } catch (error) {
        // Enhanced error handling
        if (error.response) {
            // The server responded with a status code outside the 2xx range
            console.error("API Error Response:", {
                status: error.response.status,
                data: error.response.data
            });
            
            // Return a standardized error object instead of throwing
            return {
                success: false,
                error: error.response.data.message || "Server error occurred"
            };
        } else if (error.request) {
            // The request was made but no response was received
            console.error("No response received:", error.request);
            return {
                success: false,
                error: "No response received from server"
            };
        } else {
            // Something happened in setting up the request
            console.error("Request Error:", error.message);
            return {
                success: false,
                error: `Request failed: ${error.message}`
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
