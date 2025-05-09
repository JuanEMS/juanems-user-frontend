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
          firstName: applicantData.firstName || userDataResponse.firstName || 'User',
          middleName: applicantData.middleName || '',
          lastName: applicantData.lastName || userDataResponse.lastName || '',
          dob: applicantData.dob ? new Date(applicantData.dob).toISOString().split('T')[0] : '',
          nationality: applicantData.nationality || '',
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
              approvedExamDate: examDetailsData.approvedExamDate,
              approvedExamTime: examDetailsData.approvedExamTime || '',
              approvedExamFeeStatus: examDetailsData.approvedExamFeeStatus || 'Required',
              approvedExamFeeAmount: examDetailsData.approvedExamFeeAmount,
              approvedExamRoom: examDetailsData.approvedExamRoom || '',
            });
            setAdmissionExamDetailsStatus(examDetailsData.admissionExamDetailsStatus || 'Incomplete');
          }
          setAdmissionRejectMessage(examDetailsData.admissionRejectMessage || '');
          setAdmissionAdminFirstStatus(
            examDetailsData.admissionAdminFirstStatus ||
            admissionData?.admissionAdminFirstStatus ||
            applicantData.admissionAdminFirstStatus ||
            'On-going'
          );
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

        // Fetch payment details if exam fee status is 'Paid'
        if (examDetails.approvedExamFeeStatus === 'Paid') {
          try {
            const paymentResponse = await fetchWithRetry(
              `${process.env.REACT_APP_API_URL}/api/payments/history/${userEmail}`
            );
            setPaymentDetails(paymentResponse);
          } catch (err) {
            console.error('Failed to fetch payment details:', err);
            setPaymentDetails(null);
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
  
    setLoading(true);
    setError('');
  
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/pdf/generate-exam-permit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userData,
          examDetails,
          paymentDetails: examDetails.approvedExamFeeStatus === 'Paid' ? paymentDetails : null,
        }),
      });
  
      if (!response.ok) {
        // Check if response is HTML
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          const text = await response.text();
          console.error('Received HTML response:', text.slice(0, 200)); // Log first 200 chars
          throw new Error('Server returned an HTML error page. Check the endpoint URL or server logs.');
        }
        // Try to parse JSON error
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }
  
      // Verify content type is PDF
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/pdf')) {
        throw new Error(`Unexpected content type: ${contentType}. Expected application/pdf.`);
      }
  
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Admission_Exam_Permit_${userData.applicantID || 'unknown'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating exam permit:', err);
      setError(`Failed to generate exam permit: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time) => {
    if (!time) return 'N/A';
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
                      <strong>Reminder:</strong> Please settle or pay exam fee on or before the exam date. No payment means no exam or interview. If no payment is needed, you can now move forward to the next step and take the exam and interview. Make sure to print your generated exam permit and bring it.
                    </p>
                  </div>
                  <div style={{ marginTop: '1rem', fontSize: '14px', color: '#333' }}>
                    {admissionAdminFirstStatus === 'Approved' ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px 20px', alignItems: 'center' }}>
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
                          cursor: 'pointer',
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