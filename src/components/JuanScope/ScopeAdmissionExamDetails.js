import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faArrowLeft, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import SJDEFILogo from '../../images/SJDEFILogo.png';
import '../../css/JuanScope/ScopeRegistration1.css';
import SideNavigation from './SideNavigation';
import moment from 'moment-timezone';

function ScopeAdmissionExamDetails() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({});
  const [registrationStatus, setRegistrationStatus] = useState('Incomplete');
  const [admissionAdminFirstStatus, setAdmissionAdminFirstStatus] = useState('On-going');
  const [examDetails, setExamDetails] = useState({
    approvedDate: '',
    time: '',
    room: '',
    examFeeStatus: 'Unpaid',
    examFeeAmount: 0,
    feedback: ''
  });
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
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetchWithRetry(url, retries - 1, delay);
        }
        throw error;
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

        const userData = await fetchWithRetry(
          `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/activity/${userEmail}?createdAt=${encodeURIComponent(createdAt)}`
        );

        const applicantData = await fetchWithRetry(
          `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/personal-details/${userEmail}`
        );

        localStorage.setItem('applicantID', applicantData.applicantID || userData.applicantID || '');
        localStorage.setItem('firstName', applicantData.firstName || userData.firstName || '');
        localStorage.setItem('middleName', applicantData.middleName || '');
        localStorage.setItem('lastName', applicantData.lastName || userData.lastName || '');
        localStorage.setItem('dob', applicantData.dob ? new Date(applicantData.dob).toISOString().split('T')[0] : '');
        localStorage.setItem('nationality', applicantData.nationality || '');

        setUserData({
          email: userEmail,
          firstName: applicantData.firstName || userData.firstName || 'User',
          middleName: applicantData.middleName || '',
          lastName: applicantData.lastName || userData.lastName || '',
          dob: applicantData.dob ? new Date(applicantData.dob).toISOString().split('T')[0] : '',
          nationality: applicantData.nationality || '',
          studentID: applicantData.studentID || userData.studentID || 'N/A',
          applicantID: applicantData.applicantID || userData.applicantID || 'N/A',
          entryLevel: applicantData.entryLevel || '',
        });

        const admissionData = await fetchWithRetry(
          `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/admission-requirements/${userEmail}`
        );

        setRegistrationStatus(applicantData.registrationStatus || 'Incomplete');
        setAdmissionAdminFirstStatus(admissionData.admissionAdminFirstStatus || 'On-going');

        if (applicantData.registrationStatus !== 'Complete') {
          navigate('/scope-registration-6');
          return;
        }

        if (admissionData.admissionAdminFirstStatus !== 'Approved' && admissionData.admissionAdminFirstStatus !== 'Rejected') {
          navigate('/scope-admission-requirements');
          return;
        }

        const examDetailsData = await fetchWithRetry(
          `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/exam-details/${userEmail}`
        );

        setExamDetails({
          approvedDate: examDetailsData.approvedDate || '',
          time: examDetailsData.time || '',
          room: examDetailsData.room || '',
          examFeeStatus: examDetailsData.examFeeStatus || 'Unpaid',
          examFeeAmount: examDetailsData.examFeeAmount || 0,
          feedback: examDetailsData.feedback || 'No feedback provided.'
        });

        setLoading(false);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load user data or exam details. Please check your connection and try again.');
        setLoading(false);
      }
    };

    fetchData();
    const refreshInterval = setInterval(fetchData, 5 * 60 * 1000);
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
        console.error('Error checking account status:', err);
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

  const handleAnnouncements = () => {
    navigate('/scope-announcements');
  };

  const handleBack = () => {
    navigate('/scope-admission-requirements');
  };

  const handleNext = () => {
    if (examDetails.examFeeStatus === 'Unpaid' && examDetails.examFeeAmount > 0) {
      alert('Please settle the exam fee before proceeding.');
      return;
    }
    navigate('/scope-exam-fee-payment');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
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
          onNavigate={closeSidebar}
          isOpen={sidebarOpen}
        />
        <main
          className={`scope-main-content ${sidebarOpen ? 'sidebar-open' : ''}`}
        >
          {loading ? (
            <div className="scope-loading">Loading...</div>
          ) : error ? (
            <div className="scope-error">{error}</div>
          ) : (
            <div className="registration-content">
              <h2 className="registration-title">Admission Exam Details</h2>
              <div className="registration-divider"></div>
              <div className="registration-container">
                <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '1rem' }}>
                  View the details of your admission exam details. You can also view here if you need to pay for exam fee and other details for the exam and interview.
                </div>
                <div style={{ fontSize: '12px', marginBottom: '1.5rem', color: '#333' }}>
                  <strong>Entry Level:</strong> {userData.entryLevel || 'Not specified'}
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
                  <div style={{ marginTop: '1rem' }}>
                    {admissionAdminFirstStatus === 'Approved' ? (
                      <div style={{ fontSize: '14px', color: '#333' }}>
                        <p><strong>Approved Date:</strong> {examDetails.approvedDate || 'N/A'}</p>
                        <p><strong>Time:</strong> {examDetails.time || 'N/A'}</p>
                        <p><strong>Room:</strong> {examDetails.room || 'N/A'}</p>
                        <p><strong>Exam Fee Status:</strong> {examDetails.examFeeStatus || 'Unpaid'}</p>
                        <p><strong>Exam Fee Amount:</strong> ₱{examDetails.examFeeAmount.toFixed(2)}</p>
                      </div>
                    ) : (
                      <div style={{ fontSize: '14px', color: '#333', backgroundColor: '#ffebee', padding: '1rem', borderRadius: '5px' }}>
                        <p><strong>Feedback:</strong> {examDetails.feedback}</p>
                      </div>
                    )}
                  </div>
                  <div className="form-buttons">
                    <button
                      type="button"
                      className="back-button"
                      onClick={handleBack}
                    >
                      <FontAwesomeIcon icon={faArrowLeft} />
                      Back
                    </button>
                    {admissionAdminFirstStatus === 'Approved' && (
                      <button
                        type="button"
                        className="next-button"
                        onClick={handleNext}
                        style={{
                          backgroundColor: examDetails.examFeeStatus === 'Unpaid' && examDetails.examFeeAmount > 0 ? '#d3d3d3' : '#34A853',
                          cursor: examDetails.examFeeStatus === 'Unpaid' && examDetails.examFeeAmount > 0 ? 'not-allowed' : 'pointer',
                        }}
                      >
                        Next
                      </button>
                    )}
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
                inhibits
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