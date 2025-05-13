import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faArrowLeft, faCheckCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import SJDEFILogo from '../../images/SJDEFILogo.png';
import '../../css/JuanScope/ScopeRegistration1.css';
import SideNavigation from './SideNavigation';

function ScopeAdmissionApproval() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState({});
    const [registrationStatus, setRegistrationStatus] = useState('Incomplete');
    const [admissionRequirementsStatus, setAdmissionRequirementsStatus] = useState('Incomplete');
    const [admissionAdminFirstStatus, setAdmissionAdminFirstStatus] = useState('On-going');
    const [preferredExamAndInterviewApplicationStatus, setPreferredExamAndInterviewApplicationStatus] = useState('Incomplete');
    const [admissionExamDetailsStatus, setAdmissionExamDetailsStatus] = useState('Incomplete');
    const [approvedExamFeeStatus, setApprovedExamFeeStatus] = useState('Required');
    const [approvedExamInterviewResult, setApprovedExamInterviewResult] = useState('Pending');
    const [examInterviewResultStatus, setExamInterviewResultStatus] = useState('Incomplete');
    const [reservationFeePaymentStepStatus, setReservationFeePaymentStepStatus] = useState('Incomplete');
    const [admissionApprovalAdminStatus, setAdmissionApprovalAdminStatus] = useState('Pending');
    const [admissionApprovalStatus, setAdmissionApprovalStatus] = useState('Incomplete');
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

    const getStatusStyleAndMessage = () => {
        const firstName = userData.firstName || 'Juan';
        const approvedStrand = userData.approvedAcademicStrand || userData.academicStrand || 'STEM';
        switch (admissionApprovalAdminStatus) {
            case 'Pending':
                return {
                    backgroundColor: '#686868',
                    textColor: '#FFFFFF',
                    statusColor: '#686868',
                    message: `Your Admission Application is Under Review.\n\nDear ${firstName}, thank you for securing your slot by paying the reservation fee. Your admission application is now under review by the Admissions Office.\n\nWe are carefully assessing your application, and you will be notified once a decision has been made. In the meantime, you may track your application status here in your account.\n\nShould you have any questions or need further assistance, feel free to reach out to us.`,
                };
            case 'Approved':
                return {
                    backgroundColor: '#34A853',
                    textColor: '#FFFFFF',
                    statusColor: '#34A853',
                    message: `Admission Application Approved!\n\nCongratulations, ${firstName}. You have qualified for the ${approvedStrand} strand. Secure your spot in our Senior High School (SHS) program as soon as possible, as we have limited slots for Grade 11 students. Your admission application has been approved. You are now eligible to proceed with the enrollment process for AY 2025 - 2026 - Term 1.\n\nTo complete your enrollment, please submit the required documents to the Registrar’s Office or to Enrollment Requirements. Kindly review the list of required documents and ensure all submissions are complete to avoid any delays. You may also check your registered email as we sent a Notice of Admission letter.\n\nShould you need further assistance, feel free to reach out to us.`,
                };
            case 'Rejected':
                return {
                    backgroundColor: '#880D0C',
                    textColor: '#FFFFFF',
                    statusColor: '#880D0C',
                    message: `Admission Application Not Approved.\n\nDear ${firstName}, we regret to inform you that your admission application was not approved due to "${userData.admissionApprovalRejectMessage || 'unspecified reasons'}". Please contact the Admissions Office for further details or to explore alternative options.\n\nShould you have any questions, feel free to reach out to us.`,
                };
            default:
                return {
                    backgroundColor: '#686868',
                    textColor: '#FFFFFF',
                    statusColor: '#686868',
                    message: `Your Admission Application is Under Review.\n\nDear ${firstName}, your admission status is pending further review. Please check back later for updates.`,
                };
        }
    };

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
      localStorage.setItem('approvedAcademicStrand', applicantData.approvedAcademicStrand || '');

      let updatedUserData = {
        email: userEmail,
        firstName: applicantData.firstName || userDataResponse.firstName || 'User',
        middleName: applicantData.middleName || '',
        lastName: applicantData.lastName || userDataResponse.lastName || '',
        dob: applicantData.dob ? new Date(applicantData.dob).toISOString().split('T')[0] : '',
        nationality: applicantData.nationality || '',
        studentID: applicantData.studentID || userDataResponse.studentID || 'N/A',
        applicantID: applicantData.applicantID || userDataResponse.applicantID || 'N/A',
        academicStrand: applicantData.academicStrand || 'STEM',
        approvedAcademicStrand: applicantData.approvedAcademicStrand || applicantData.academicStrand || 'STEM',
        admissionApprovalRejectMessage: applicantData.admissionApprovalRejectMessage || '',
        admissionRejectMessage: applicantData.admissionRejectMessage || '',
      };

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
        const examInterviewData = await fetchWithRetry(
          `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/exam-interview/${userEmail}`
        );
        setPreferredExamAndInterviewApplicationStatus(
          examInterviewData.preferredExamAndInterviewApplicationStatus || 'Incomplete'
        );
      } catch (err) {
        console.error('Failed to fetch exam interview data:', err.message);
        setPreferredExamAndInterviewApplicationStatus('Incomplete');
      }

      try {
        const examDetailsData = await fetchWithRetry(
          `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/exam-details/${userEmail}`
        );
        console.log('Exam details response:', {
          admissionApprovalAdminStatus: examDetailsData.admissionApprovalAdminStatus,
          admissionApprovalStatus: examDetailsData.admissionApprovalStatus,
          admissionApprovalRejectMessage: examDetailsData.admissionApprovalRejectMessage,
        });

        // Set states based on fetched data
        setAdmissionExamDetailsStatus(examDetailsData.admissionExamDetailsStatus || 'Incomplete');
        setApprovedExamFeeStatus(examDetailsData.approvedExamFeeStatus || 'Required');
        setApprovedExamInterviewResult(examDetailsData.approvedExamInterviewResult || 'Pending');
        setExamInterviewResultStatus(examDetailsData.examInterviewResultStatus || 'Incomplete');
        setReservationFeePaymentStepStatus(examDetailsData.reservationFeePaymentStepStatus || 'Incomplete');
        
        // Set approval statuses
        setAdmissionApprovalAdminStatus(examDetailsData.admissionApprovalAdminStatus || 'Pending');
        
        // FIX: Ensure admissionApprovalStatus is set to Complete if admissionApprovalAdminStatus is Approved
        if (examDetailsData.admissionApprovalAdminStatus === 'Approved') {
          setAdmissionApprovalStatus('Complete');
          
          // Make an API call to ensure backend is also updated
          await fetch(`${process.env.REACT_APP_API_URL}/api/enrollee-applicants/update-admission-approval-status`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: userEmail,
              admissionApprovalStatus: 'Complete',
            }),
          });
        } else {
          setAdmissionApprovalStatus(examDetailsData.admissionApprovalStatus || 'Incomplete');
        }

        // Update userData with rejection message
        updatedUserData = {
          ...updatedUserData,
          admissionApprovalRejectMessage: examDetailsData.admissionApprovalRejectMessage || '',
        };

        setAdmissionAdminFirstStatus(
          examDetailsData.admissionAdminFirstStatus ||
          admissionData?.admissionAdminFirstStatus ||
          applicantData.admissionAdminFirstStatus ||
          'On-going'
        );
      } catch (err) {
        console.error('Failed to fetch exam details:', err.message);
        setError('Failed to load admission approval details. Please try again later or contact support.');
        setAdmissionExamDetailsStatus('Incomplete');
        setApprovedExamFeeStatus('Required');
        setApprovedExamInterviewResult('Pending');
        setExamInterviewResultStatus('Incomplete');
        setReservationFeePaymentStepStatus('Incomplete');
        setAdmissionApprovalAdminStatus('Pending');
        setAdmissionApprovalStatus('Incomplete');
        updatedUserData = {
          ...updatedUserData,
          admissionApprovalRejectMessage: '',
        };
      }

      setUserData(updatedUserData);
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
        navigate('/scope-reservation-payment');
    };

// Update the handleNext function to ensure navigation works properly
const handleNext = () => {
  // FIX: If admin status is approved, we should be able to proceed 
  // The Complete status should be automatically set, but we'll check either condition
  if (admissionApprovalAdminStatus === 'Approved') {
    // Force set the admissionApprovalStatus to Complete if it's not already
    if (admissionApprovalStatus !== 'Complete') {
      setAdmissionApprovalStatus('Complete');
    }
    navigate('/scope-enrollment-requirements');
  }
};

    const { backgroundColor, textColor, statusColor, message } = getStatusStyleAndMessage();

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
                    onNavigate={closeSidebar}
                    isOpen={sidebarOpen}
                    registrationStatus={registrationStatus}
                    admissionRequirementsStatus={admissionRequirementsStatus}
                    admissionAdminFirstStatus={admissionAdminFirstStatus}
                    preferredExamAndInterviewApplicationStatus={preferredExamAndInterviewApplicationStatus}
                    admissionExamDetailsStatus={admissionExamDetailsStatus}
                    approvedExamFeeStatus={approvedExamFeeStatus}
                    approvedExamInterviewResult={approvedExamInterviewResult}
                    examInterviewResultStatus={examInterviewResultStatus}
                    reservationFeePaymentStepStatus={reservationFeePaymentStepStatus} // Added
        admissionApprovalStatus={admissionApprovalStatus} // Added
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
                            <h2 className="registration-title">Admission Approval</h2>
                            <div className="registration-divider"></div>
                            <div className="registration-container">
                                <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '1.5rem' }}>
                                    Once you have secured your slot by paying the reservation fee, your admission application will undergo review for final approval. This section provides updates on your application status, including whether it is still under review, approved, or rejected.
                                </div>
                                <div className="personal-info-section">
                                    <div className="personal-info-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <FontAwesomeIcon icon={faCheckCircle} style={{ color: '#212121' }} />
                                        <h3>Admission Status:</h3>
                                        <span style={{ color: statusColor, fontWeight: 'bold', fontSize: '16px' }}>
                                            {admissionApprovalAdminStatus}
                                        </span>
                                    </div>
                                    <div className="personal-info-divider"></div>
                                    <div
                                        className="reminder-box"
                                        style={{
                                            backgroundColor,
                                            color: textColor,
                                            padding: '1rem',
                                            borderRadius: '8px',
                                            marginBottom: '1rem',
                                        }}
                                    >
                                        <p style={{ whiteSpace: 'pre-line' }}>
                                            {message}
                                        </p>
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
                                            disabled={admissionApprovalAdminStatus !== 'Approved'}
                                            style={{
                                                backgroundColor: admissionApprovalAdminStatus === 'Approved' ? '#34A853' : '#d3d3d3',
                                                cursor: admissionApprovalAdminStatus === 'Approved' ? 'pointer' : 'not-allowed',
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

export default ScopeAdmissionApproval;