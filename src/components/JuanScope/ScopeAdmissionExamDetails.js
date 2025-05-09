import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faArrowLeft, faCalendarAlt, faPrint, faSpinner } from '@fortawesome/free-solid-svg-icons';
import SJDEFILogo from '../../images/SJDEFILogo.png';
import '../../css/JuanScope/ScopeRegistration1.css';
import SideNavigation from './SideNavigation';

function ScopeAdmissionExamDetails() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({});
  const [registrationStatus, setRegistrationStatus] = useState('Incomplete');
  const [admissionRequirementsStatus, setAdmissionRequirementsStatus] = useState('Incomplete');
  const [admissionAdminFirstStatus, setAdmissionAdminFirstStatus] = useState('On-going');
  const [admissionExamDetailsStatus, setAdmissionExamDetailsStatus] = useState('Incomplete');
  const [examDetails, setExamDetails] = useState({
    approvedExamDate: null,
    approvedExamTime: '',
    approvedExamFeeStatus: '',
    approvedExamFeeAmount: null,
    approvedExamRoom: '',
  });
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [admissionRejectMessage, setAdmissionRejectMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    const createdAt = localStorage.getItem('createdAt');

    if (!userEmail || !createdAt) {
      navigate('/scope-login', { state: { error: 'No active session found. Please log in.' } });
      return;
    }

    const fetchWithRetry = async (url, retries = 3, delay = 1000) => {
      for (let i = 0; i < retries; i++) {
        try {
          const response = await fetch(url);
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP error ${response.status}: ${errorData.error || 'Unknown error'}`);
          }
          return await response.json();
        } catch (error) {
          if (i === retries - 1) throw error;
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
      }
    };

    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        const createdAtDate = new Date(createdAt);
        if (isNaN(createdAtDate.getTime())) {
          handleLogout();
          navigate('/scope-login', { state: { accountInactive: true, error: 'Invalid session data. Please log in again.' } });
          return;
        }

        const verificationData = await fetchWithRetry(
          `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/verification-status/${userEmail}`
        );

        if (
          verificationData.status !== 'Active' ||
          (createdAt &&
            Math.abs(
              new Date(verificationData.createdAt).getTime() -
              new Date(createdAt).getTime()
            ) > 1000)
        ) {
          handleLogout();
          navigate('/scope-login', { state: { accountInactive: true, error: 'Account is inactive or session expired.' } });
          return;
        }

        const userDataResponse = await fetchWithRetry(
          `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/activity/${userEmail}?createdAt=${encodeURIComponent(createdAt)}`
        );

        const applicantData = await fetchWithRetry(
          `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/personal-details/${userEmail}`
        );

        localStorage.setItem('applicantID', applicantData.applicantID || userDataResponse.applicantID || '');
        localStorage.setItem('firstName', applicantData.firstName || userDataResponse.firstName || '');
        localStorage.setItem('middleName', applicantData.middleName || '');
        localStorage.setItem('lastName', applicantData.lastName || userDataResponse.lastName || '');
        localStorage.setItem('dob', applicantData.dob ? new Date(applicantData.dob).toISOString().split('T')[0] : '');
        localStorage.setItem('nationality', applicantData.nationality || '');

        setUserData({
          email: userEmail,
          firstName: applicantData.firstName || userDataResponse.firstName || 'N/A',
          middleName: applicantData.middleName || '',
          lastName: applicantData.lastName || userDataResponse.lastName || 'N/A',
          dob: applicantData.dob ? new Date(applicantData.dob).toISOString().split('T')[0] : 'N/A',
          nationality: applicantData.nationality || 'N/A',
          studentID: applicantData.studentID || userDataResponse.studentID || 'N/A',
          applicantID: applicantData.applicantID || userDataResponse.applicantID || 'N/A',
        });

        setRegistrationStatus(applicantData.registrationStatus || 'Incomplete');
        setAdmissionAdminFirstStatus(applicantData.admissionAdminFirstStatus || 'On-going');

        let admissionData;
        try {
          admissionData = await fetchWithRetry(
            `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/admission-requirements/${userEmail}`
          );
          setAdmissionRequirementsStatus(admissionData.admissionRequirementsStatus || 'Incomplete');
          setAdmissionAdminFirstStatus(admissionData.admissionAdminFirstStatus || applicantData.admissionAdminFirstStatus || 'On-going');
        } catch (err) {
          setAdmissionRequirementsStatus('Incomplete');
        }

        try {
          const examDetailsData = await fetchWithRetry(
            `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/exam-details/${userEmail}`
          );
          if (examDetailsData.message && examDetailsData.admissionAdminFirstStatus === 'On-going') {
            setError('Exam details are not yet available. Your application is under review.');
            setExamDetails({
              approvedExamDate: null,
              approvedExamTime: '',
              approvedExamFeeStatus: 'Required',
              approvedExamFeeAmount: null,
              approvedExamRoom: '',
            });
            setAdmissionExamDetailsStatus('Incomplete');
          } else {
            setExamDetails({
              approvedExamDate: examDetailsData.approvedExamDate || null,
              approvedExamTime: examDetailsData.approvedExamTime || 'N/A',
              approvedExamFeeStatus: examDetailsData.approvedExamFeeStatus || 'N/A',
              approvedExamFeeAmount: examDetailsData.approvedExamFeeAmount || null,
              approvedExamRoom: examDetailsData.approvedExamRoom || 'N/A',
            });
            setAdmissionExamDetailsStatus(examDetailsData.admissionExamDetailsStatus || 'Incomplete');
          }
          setAdmissionRejectMessage(examDetailsData.admissionRejectMessage || '');

          // Fetch payment details if exam fee status is 'Paid'
          if (examDetailsData.approvedExamFeeStatus === 'Paid') {
            try {
              const paymentResponse = await fetchWithRetry(
                `${process.env.REACT_APP_API_URL}/api/payments/history/${userEmail}`
              );
              const successfulPayment = Array.isArray(paymentResponse)
                ? paymentResponse.find(payment => payment.status === 'successful')
                : paymentResponse.status === 'successful' ? paymentResponse : null;
              setPaymentDetails(successfulPayment || null);
            } catch (err) {
              console.error('Failed to fetch payment details:', err);
              setPaymentDetails(null);
              setError('Failed to load payment details. Please try again or contact support.');
            }
          }
        } catch (err) {
          if (err.message.includes('404')) {
            setError('Exam details not found. Your application may not have exam details assigned yet.');
            setAdmissionExamDetailsStatus('Incomplete');
          } else if (err.message.includes('NetworkError')) {
            setError('Network error. Please check your internet connection and try again.');
          } else {
            setError('Failed to load exam details. Please try again later or contact support.');
          }
        }

        if (applicantData.registrationStatus !== 'Complete') {
          navigate('/scope-registration-6');
          return;
        }

        setLoading(false);
      } catch (err) {
        setError('Failed to load user data. Please check your connection and try again.');
        setLoading(false);
      }
    };

    fetchData();
    const refreshInterval = setInterval(fetchData, 2 * 60 * 1000);
    return () => clearInterval(refreshInterval);
  }, [navigate]);

  useEffect(() => {
    const checkAccountStatus = async () => {
      try {
        const userEmail = localStorage.getItem('userEmail');
        const createdAt = localStorage.getItem('createdAt');

        if (!userEmail || !createdAt) {
          navigate('/scope-login', { state: { error: 'Session expired. Please log in.' } });
          return;
        }

        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/verification-status/${userEmail}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }

        const data = await response.json();

        if (
          data.status !== 'Active' ||
          new Date(data.createdAt).getTime() !== new Date(createdAt).getTime()
        ) {
          handleLogout();
          navigate('/scope-login', { state: { accountInactive: true, error: 'Account is inactive or session expired.' } });
        }
      } catch (err) {
        setError('Unable to verify account status. Please check your connection.');
      }
    };

    const interval = setInterval(checkAccountStatus, 60 * 1000);
    checkAccountStatus();
    return () => clearInterval(interval);
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      const createdAt = localStorage.getItem('createdAt');

      if (!userEmail) {
        navigate('/scope-login', { state: { error: 'No active session found.' } });
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/logout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: userEmail,
            createdAt: createdAt,
          }),
        }
      );

      if (response.ok) {
        localStorage.clear();
        navigate('/scope-login');
      } else {
        setError('Failed to log out. Please try again.');
      }
    } catch (err) {
      setError('Error during logout process. Please check your connection.');
    } finally {
      setShowLogoutModal(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleBack = () => {
    navigate('/scope-admission-requirements');
  };

  const handleNext = () => {
    if (admissionAdminFirstStatus !== 'Approved') {
      setError('Cannot proceed: Application is not yet approved.');
      return;
    }
    if (admissionExamDetailsStatus !== 'Complete') {
      setError('Cannot proceed: Exam details are incomplete.');
      return;
    }
    navigate('/scope-exam-fee-payment');
  };

  const handlePrintPermit = async () => {
    if (admissionAdminFirstStatus !== 'Approved' || admissionExamDetailsStatus !== 'Complete') {
      setError('Cannot print permit: Application is not approved or exam details are incomplete.');
      return;
    }

    // Allow printing for 'Required', 'Paid', or 'Waived' status
    if (!['Required', 'Paid', 'Waived'].includes(examDetails.approvedExamFeeStatus)) {
      setError('Cannot print permit: Invalid exam fee status.');
      return;
    }

    // Check payment details only if status is 'Paid'
    if (examDetails.approvedExamFeeStatus === 'Paid' && !paymentDetails) {
      setError('Cannot print permit: Payment details not found.');
      return;
    }

    setLoading(true);
    setError('');

    const fetchWithRetry = async (url, options, retries = 3, delay = 1000) => {
      for (let i = 0; i < retries; i++) {
        try {
          const response = await fetch(url, options);
          console.log(`Attempt ${i + 1} - Response status: ${response.status}, URL: ${url}`);
          if (!response.ok) {
            const contentType = response.headers.get('content-type');
            let errorMessage = `HTTP error ${response.status}`;
            if (contentType && contentType.includes('application/json')) {
              const errorData = await response.json();
              errorMessage = errorData.error || errorMessage;
            } else {
              const text = await response.text();
              console.error('Non-JSON response:', text);
              errorMessage = `Server returned an unexpected response: ${text || 'No details available'}.`;
            }
            throw new Error(errorMessage);
          }
          return response;
        } catch (error) {
          if (i === retries - 1) throw error;
          console.log(`Retrying request (${i + 1}/${retries}) after ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
      }
    };

    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        throw new Error('User email not found. Please log in again.');
      }

      const applicantName = `${userData.firstName || ''} ${userData.middleName ? userData.middleName + ' ' : ''}${userData.lastName || ''}`.trim() || 'N/A';
      const approvedDate = examDetails.approvedExamDate
        ? new Date(examDetails.approvedExamDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : 'N/A';
      const formattedTime = examDetails.approvedExamTime && examDetails.approvedExamTime !== 'N/A'
        ? (() => {
            const [hours, minutes] = examDetails.approvedExamTime.split(':');
            const hour = parseInt(hours, 10);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const formattedHour = hour % 12 || 12;
            return `${formattedHour}:${minutes} ${ampm}`;
          })()
        : 'N/A';
      const examFeeAmount = examDetails.approvedExamFeeAmount != null
        ? `₱${examDetails.approvedExamFeeAmount.toFixed(2)}`
        : 'N/A';
      const referenceNumber = examDetails.approvedExamFeeStatus === 'Paid' && paymentDetails
        ? paymentDetails.referenceNumber || 'N/A'
        : 'N/A';

      const requestBody = {
        userData: {
          firstName: userData.firstName || 'N/A',
          middleName: userData.middleName || '',
          lastName: userData.lastName || 'N/A',
          email: userEmail,
        },
        examDetails: {
          applicantName,
          applicantID: userData.applicantID || 'N/A',
          approvedDate,
          time: formattedTime,
          room: examDetails.approvedExamRoom || 'N/A',
          examFeeStatus: examDetails.approvedExamFeeStatus || 'N/A',
          examFeeAmount,
          referenceNumber,
        },
      };

      console.log('Sending request to generate exam permit:', JSON.stringify(requestBody, null, 2));

      const apiUrl = `${process.env.REACT_APP_API_URL}/api/generate-exam-permit`;
      const response = await fetchWithRetry(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }, 3, 1000);

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/pdf')) {
        const text = await response.text();
        console.error('Unexpected content type:', contentType, 'Response:', text);
        throw new Error(`Unexpected content type: ${contentType || 'none'}. Expected application/pdf.`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating exam permit:', err.message, err.stack);
      setError(`Failed to generate exam permit: ${err.message}. Please try again or contact support.`);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time) => {
    if (!time || time === 'N/A') return 'N/A';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="scope-registration-container">
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
        <div className="hamburger-menu">
          <button
            className="hamburger-button"
            onClick={toggleSidebar}
            aria-label="Toggle navigation menu"
          >
            <FontAwesomeIcon
              icon={sidebarOpen ? faTimes : faBars}
              size="lg"
            />
          </button>
        </div>
      </header>
      <div className="scope-registration-content">
        <SideNavigation
          userData={userData}
          registrationStatus={registrationStatus}
          admissionRequirementsStatus={admissionRequirementsStatus}
          admissionAdminFirstStatus={admissionAdminFirstStatus}
          admissionExamDetailsStatus={admissionExamDetailsStatus}
          onNavigate={closeSidebar}
          isOpen={sidebarOpen}
        />
        <main className={`scope-main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
          {loading ? (
            <div className="scope-loading">
              <FontAwesomeIcon icon={faSpinner} spin /> Loading exam details...
            </div>
          ) : error ? (
            <div className="scope-error">{error}</div>
          ) : (
            <div className="registration-content">
              <h2 className="registration-title">Admission Exam Details</h2>
              <div className="registration-divider"></div>
              <div className="registration-container">
                <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '1.5rem' }}>
                  View the details of your admission exam details. You can also view here if you need to pay for exam fee and other details for the exam and interview.
                </div>
                <div className="personal-info-section">
                  <div className="personal-info-header">
                    <FontAwesomeIcon
                      icon={faCalendarAlt}
                      style={{ color: '#212121' }}
                    />
                    <h3>Exam and Interview</h3>
                  </div>
                  <div className="personal-info-divider"></div>
                  <div className="reminder-box">
                    <p>
                      <strong>Reminder:</strong> If the exam fee is required, you can print the permit and pay in person at the school before the exam date, or pay online. If the fee is paid or waived, you can proceed to the exam. Ensure you print your exam permit and bring it to the exam.
                    </p>
                  </div>
                  <div style={{ marginTop: '1rem', fontSize: '14px', color: '#333' }}>
                    {admissionAdminFirstStatus === 'Approved' ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px 20px', alignItems: 'center' }}>
                        <strong>Applicant Name:</strong>
                        <span>{`${userData.firstName} ${userData.middleName ? userData.middleName + ' ' : ''}${userData.lastName}`}</span>
                        <strong>Applicant ID:</strong>
                        <span>{userData.applicantID || 'N/A'}</span>
                        <strong>Approved Date:</strong>
                        <span>
                          {examDetails.approvedExamDate
                            ? new Date(examDetails.approvedExamDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })
                            : 'N/A'}
                        </span>
                        <strong>Time:</strong>
                        <span>{formatTime(examDetails.approvedExamTime)}</span>
                        <strong>Room:</strong>
                        <span>{examDetails.approvedExamRoom || 'N/A'}</span>
                        <strong>Exam Fee Status:</strong>
                        <span>{examDetails.approvedExamFeeStatus || 'N/A'}</span>
                        <strong>Exam Fee Amount:</strong>
                        <span>
                          {examDetails.approvedExamFeeAmount != null
                            ? `₱${examDetails.approvedExamFeeAmount.toFixed(2)}`
                            : 'N/A'}
                        </span>
                        <strong>Reference Number:</strong>
                        <span>
                          {examDetails.approvedExamFeeStatus === 'Paid' && paymentDetails
                            ? paymentDetails.referenceNumber || 'N/A'
                            : 'N/A'}
                        </span>
                      </div>
                    ) : admissionAdminFirstStatus === 'Rejected' ? (
                      <div>
                        <p><strong>Rejection Reason:</strong> {admissionRejectMessage || 'No reason provided'}</p>
                      </div>
                    ) : (
                      <p>Your application is still being processed. Please check back later for exam details.</p>
                    )}
                  </div>
                  {admissionAdminFirstStatus === 'Approved' && (
                    <div style={{ marginTop: '1rem' }}>
                      <button
                        style={{
                          backgroundColor: '#4285F4',
                          color: 'white',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          border: 'none',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                        onClick={handlePrintPermit}
                        disabled={loading}
                      >
                        <FontAwesomeIcon icon={faPrint} />
                        Print Permit
                      </button>
                    </div>
                  )}
                  <div className="form-buttons">
                    <button
                      type="button"
                      className="back-button"
                      onClick={handleBack}
                    >
                      <FontAwesomeIcon icon={faArrowLeft} />
                      Back
                    </button>
                    <button
                      type="button"
                      className="next-button"
                      onClick={handleNext}
                      disabled={loading || admissionAdminFirstStatus !== 'Approved' || admissionExamDetailsStatus !== 'Complete'}
                      style={{
                        backgroundColor:
                          loading || admissionAdminFirstStatus !== 'Approved' || admissionExamDetailsStatus !== 'Complete'
                            ? '#d3d3d3'
                            : '#34A853',
                        cursor:
                          loading || admissionAdminFirstStatus !== 'Approved' || admissionExamDetailsStatus !== 'Complete'
                            ? 'not-allowed'
                            : 'pointer',
                      }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      {sidebarOpen && (
        <div
          className="sidebar-overlay active"
          onClick={toggleSidebar}
        ></div>
      )}
      {showLogoutModal && (
        <div className="scope-modal-overlay">
          <div className="scope-confirm-modal">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>
            <div className="scope-modal-buttons">
              <button
                className="scope-modal-cancel"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
              <button
                className="scope-modal-confirm"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScopeAdmissionExamDetails;