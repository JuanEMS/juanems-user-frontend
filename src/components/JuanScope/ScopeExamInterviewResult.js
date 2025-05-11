import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faArrowLeft, faCheckCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import SJDEFILogo from '../../images/SJDEFILogo.png';
import '../../css/JuanScope/ScopeRegistration1.css';
import SideNavigation from './SideNavigation';

function ScopeExamInterviewResult() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({});
  const [registrationStatus, setRegistrationStatus] = useState('Incomplete');
  const [admissionRequirementsStatus, setAdmissionRequirementsStatus] = useState('Incomplete');
  const [admissionAdminFirstStatus, setAdmissionAdminFirstStatus] = useState('On-going');
  const [admissionExamDetailsStatus, setAdmissionExamDetailsStatus] = useState('Incomplete');
  const [approvedExamFeeStatus, setApprovedExamFeeStatus] = useState('Required');
  const [approvedExamInterviewResult, setApprovedExamInterviewResult] = useState('Pending');
  const [examInterviewResultStatus, setExamInterviewResultStatus] = useState('Incomplete');
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
          Math.abs(
            new Date(verificationData.createdAt).getTime() -
            new Date(createdAt).getTime()
          ) > 1000
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
        localStorage.setItem('academicStrand', applicantData.academicStrand || '');

        setUserData({
          email: userEmail,
          firstName: applicantData.firstName || userDataResponse.firstName || 'User',
          middleName: applicantData.middleName || '',
          lastName: applicantData.lastName || userDataResponse.lastName || '',
          dob: applicantData.dob ? new Date(applicantData.dob).toISOString().split('T')[0] : '',
          nationality: applicantData.nationality || '',
          studentID: applicantData.studentID || userDataResponse.studentID || 'N/A',
          applicantID: applicantData.applicantID || userDataResponse.applicantID || 'N/A',
          academicStrand: applicantData.academicStrand || 'STEM',
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
          console.error('Failed to fetch admission requirements:', err.message);
          setAdmissionRequirementsStatus('Incomplete');
        }

        try {
          const examDetailsData = await fetchWithRetry(
            `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/exam-details/${userEmail}`
          );
          console.log('Exam details response:', examDetailsData);
          if (examDetailsData.message && examDetailsData.admissionAdminFirstStatus === 'On-going') {
            setError('Exam details are not yet available. Your application is under review.');
            setAdmissionExamDetailsStatus('Incomplete');
            setApprovedExamFeeStatus('Required');
            setApprovedExamInterviewResult('Pending');
            setExamInterviewResultStatus('Incomplete');
          } else {
            setAdmissionExamDetailsStatus(examDetailsData.admissionExamDetailsStatus || 'Incomplete');
            setApprovedExamFeeStatus(examDetailsData.approvedExamFeeStatus || 'Required');
            setApprovedExamInterviewResult(examDetailsData.approvedExamInterviewResult || 'Pending');
            setExamInterviewResultStatus(examDetailsData.examInterviewResultStatus || 'Incomplete');
          }
          setAdmissionAdminFirstStatus(
            examDetailsData.admissionAdminFirstStatus ||
            admissionData?.admissionAdminFirstStatus ||
            applicantData.admissionAdminFirstStatus ||
            'On-going'
          );
        } catch (err) {
          console.error('Failed to fetch exam details:', err.message);
          if (err.message.includes('404')) {
            setError('Exam details not found. Your application may not have exam details assigned yet.');
            setAdmissionExamDetailsStatus('Incomplete');
          } else if (err.message.includes('NetworkError')) {
            setError('Network error. Please check your internet connection and try again.');
          } else {
            setError('Failed to load exam details. Please try again later or contact support.');
          }
          setApprovedExamFeeStatus('Required');
          setApprovedExamInterviewResult('Pending');
          setExamInterviewResultStatus('Incomplete');
        }

        setLoading(false);
      } catch (err) {
        console.error('Fetch data error:', err.message);
        setError('Failed to load user data. Please check your connection and try again.');
        setLoading(false);
      }
    };

    fetchData();
    const refreshInterval = setInterval(fetchData, 2 * 60 * 1000);
    return () => clearInterval(refreshInterval);
  }, [navigate]);

  // Separate useEffect for navigation checks
  useEffect(() => {
    if (loading) return; // Wait until loading is complete
    console.log('Navigation check - approvedExamFeeStatus:', approvedExamFeeStatus);
    console.log('Navigation check - registrationStatus:', registrationStatus);
    console.log('Navigation check - admissionRequirementsStatus:', admissionRequirementsStatus);

    if (registrationStatus !== 'Complete') {
      console.log('Redirecting to /scope-registration-6 due to incomplete registration');
      navigate('/scope-registration-6');
      return;
    }

    if (admissionRequirementsStatus !== 'Complete') {
      console.log('Redirecting to /scope-admission-requirements due to incomplete admission requirements');
      navigate('/scope-admission-requirements');
      return;
    }

    if (!['Paid', 'Waived'].includes(approvedExamFeeStatus)) {
      console.log('Redirecting to /scope-exam-fee-payment due to exam fee status:', approvedExamFeeStatus);
      navigate('/scope-exam-fee-payment');
      return;
    }
  }, [loading, registrationStatus, admissionRequirementsStatus, approvedExamFeeStatus, navigate]);

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
    navigate('/scope-exam-fee-payment');
  };

  const handleNext = () => {
    navigate('/scope-reservation-payment');
  };

  const getStatusStyleAndMessage = () => {
    const firstName = userData.firstName || 'Juan';
    switch (approvedExamInterviewResult) {
      case 'Pending':
        return {
          backgroundColor: '#686868',
          textColor: '#686868',
          message: `A Blessed day!\n\nDear ${firstName}, thank you for applying to our Senior High School (SHS) program. Your application is currently under review, and the results have not yet been released. We appreciate your patience as we carefully evaluate all submissions.\n\nWe will notify you as soon as your application status is available. If you have any questions, feel free to contact us.`,
        };
      case 'On Waiting List':
        return {
          backgroundColor: '#00245A',
          textColor: '#00245A',
          message: `A Blessed day!\n\nDear ${firstName}, thank you for applying to our Senior High School (SHS) program. At this time, we have received a high volume of applications, and while you meet the qualifications, available slots are currently full. You have been placed on our waiting list, and we will notify you if a spot becomes available.\n\nWe appreciate your patience and interest in our school. Should you have any questions, feel free to contact us.`,
        };
      case 'Rejected':
        return {
          backgroundColor: '#880D0C',
          textColor: '#880D0C',
          message: `A Blessed day!\n\nDear ${firstName}, thank you for your interest in our Senior High School (SHS) program. After careful evaluation, we regret to inform you that you did not meet the qualifications for admission. We appreciate the time and effort you invested in your application and encourage you to explore other opportunities that align with your goals.\n\nWishing you all the best in your future endeavors.`,
        };
      case 'Approved':
        return {
          backgroundColor: '#34A853',
          textColor: '#34A853',
          message: `Congratulations, ${firstName}. You have qualified for the ${userData.academicStrand || 'STEM'} strand. Secure your spot in our Senior High School (SHS) program as soon as possible, as we have limited slots for Grade 11 students.`,
        };
      default:
        return {
          backgroundColor: '#686868',
          textColor: '#686868',
          message: `A Blessed day!\n\nDear ${firstName}, thank you for applying to our Senior High School (SHS) program. Your application is currently under review, and the results have not yet been released. We appreciate your patience as we carefully evaluate all submissions.\n\nWe will notify you as soon as your application status is available. If you have any questions, feel free to contact us.`,
        };
    }
  };

  const statusStyle = getStatusStyleAndMessage();

  return (
    <div className="scope-registration-container">
      <header className="juan-register-header">
        <div className="juan-header-left">
          <img src={SJDEFILogo} alt="SJDEFI Logo" className="juan-logo-register" />
          <div className="juan-header-text">
            <h1>JUAN SCOPE</h1>
          </div>
        </div>
        <div className="hamburger-menu">
          <button className="hamburger-button" onClick={toggleSidebar} aria-label="Toggle navigation menu">
            <FontAwesomeIcon icon={sidebarOpen ? faTimes : faBars} size="lg" />
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
          approvedExamFeeStatus={approvedExamFeeStatus}
          examInterviewResultStatus={examInterviewResultStatus}
          onNavigate={closeSidebar}
          isOpen={sidebarOpen}
        />
        <main className={`scope-main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
          {loading ? (
            <div className="scope-loading">
              <FontAwesomeIcon icon={faSpinner} spin /> Loading...
            </div>
          ) : error ? (
            <div className="scope-error">{error}</div>
          ) : (
            <div className="registration-content">
              <h2 className="registration-title">Exam & Interview Result</h2>
              <div className="registration-divider"></div>
              <div className="registration-container">
                <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '1.5rem' }}>
                  After the entrance examination and interview, we are going to update the status and notify within 5 working days regarding the applicant’s status.
                </div>
                <div className="personal-info-section">
                  <div className="personal-info-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FontAwesomeIcon icon={faCheckCircle} style={{ color: '#212121' }} />
                    <h3>Status</h3>
                    <span style={{ color: statusStyle.textColor, fontWeight: 'bold', fontSize: '16px' }}>
                      {approvedExamInterviewResult}
                    </span>
                  </div>
                  <div className="personal-info-divider"></div>
                  <div
                    className="reminder-box"
                    style={{
                      backgroundColor: statusStyle.backgroundColor,
                      color: '#FFFFFF',
                      padding: '1rem',
                      borderRadius: '8px',
                      marginBottom: '1rem',
                    }}
                  >
                    <p style={{ whiteSpace: 'pre-line' }}>{statusStyle.message}</p>
                  </div>
                  <div className="form-buttons" style={{ marginTop: '1.5rem' }}>
                    <button type="button" className="back-button" onClick={handleBack}>
                      <FontAwesomeIcon icon={faArrowLeft} />
                      Back
                    </button>
                    <button
                      type="button"
                      className="next-button"
                      onClick={handleNext}
                      disabled={approvedExamInterviewResult !== 'Approved'}
                      style={{
                        backgroundColor: approvedExamInterviewResult === 'Approved' ? '#34A853' : '#d3d3d3',
                        cursor: approvedExamInterviewResult === 'Approved' ? 'pointer' : 'not-allowed',
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
        <div className="sidebar-overlay active" onClick={toggleSidebar}></div>
      )}
      {showLogoutModal && (
        <div className="scope-modal-overlay">
          <div className="scope-confirm-modal">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>
            <div className="scope-modal-buttons">
              <button className="scope-modal-cancel" onClick={() => setShowLogoutModal(false)}>
                Cancel
              </button>
              <button className="scope-modal-confirm" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScopeExamInterviewResult;