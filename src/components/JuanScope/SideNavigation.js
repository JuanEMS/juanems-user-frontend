import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faCompass,
  faFileAlt,
  faClipboardCheck,
  faBook,
  faFileSignature,
  faMoneyBillWave,
  faChartBar,
  faCheckCircle,
  faClipboardList,
  faTicketAlt,
  faUserGraduate,
  faCalculator,
  faSignOut
} from '@fortawesome/free-solid-svg-icons';
import '../../css/JuanScope/SideNavigation.css';

function SideNavigation({ userData, onNavigate, isOpen }) {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statuses, setStatuses] = useState({
    registrationStatus: 'Incomplete',
    preferredExamAndInterviewApplicationStatus: 'Incomplete',
    admissionRequirementsStatus: 'Incomplete',
    admissionAdminFirstStatus: 'On-going',
    admissionExamDetailsStatus: 'Incomplete',
    approvedExamFeeStatus: 'Required',
    approvedExamInterviewResult: 'Pending',
    examInterviewResultStatus: 'Incomplete',
    reservationFeePaymentStepStatus: 'Incomplete',
    admissionApprovalStatus: 'Incomplete', // New
  });

  const formatEmail = (email) => {
    if (!email) return '';
    const [name, domain] = email.split('@');
    if (!name || !domain) return email;
    const maskedName = name.length > 2
      ? `${name.substring(0, 2)}${'*'.repeat(name.length - 2)}`
      : '***';
    return `${maskedName}@${domain}`;
  };

  const navigateToPage = (path) => {
    navigate(path);
    if (onNavigate) onNavigate();
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogout = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      const createdAt = localStorage.getItem('createdAt');

      if (!userEmail) {
        navigate('/scope-login');
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/enrollee-applicants/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          createdAt: createdAt
        }),
      });

      if (response.ok) {
        localStorage.clear();
        navigate('/scope-login');
      } else {
        console.error('Failed to logout. Please try again.');
      }
    } catch (err) {
      console.error('Error during logout process:', err);
    } finally {
      setShowLogoutModal(false);
    }
  };

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
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

    const fetchStatuses = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch registration status
        const registrationData = await fetchWithRetry(
          `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/personal-details/${userEmail}`
        );

        // Fetch admission requirements status
        let admissionData;
        try {
          admissionData = await fetchWithRetry(
            `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/admission-requirements/${userEmail}`
          );
        } catch (err) {
          console.error('Error fetching admission data:', err);
          admissionData = { admissionRequirementsStatus: 'Incomplete', admissionAdminFirstStatus: 'On-going' };
        }

        // Fetch exam and interview application status
        let examInterviewData;
        try {
          examInterviewData = await fetchWithRetry(
            `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/exam-interview/${userEmail}`
          );
        } catch (err) {
          console.error('Error fetching exam interview data:', err);
          examInterviewData = { preferredExamAndInterviewApplicationStatus: 'Incomplete' };
        }

        // Fetch exam details status
        let examDetailsData;
        try {
          examDetailsData = await fetchWithRetry(
            `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/exam-details/${userEmail}`
          );
        } catch (err) {
          console.error('Error fetching exam details:', err);
          examDetailsData = {
            admissionExamDetailsStatus: 'Incomplete',
            approvedExamFeeStatus: 'Required',
            approvedExamInterviewResult: 'Pending',
            examInterviewResultStatus: 'Incomplete',
            reservationFeePaymentStepStatus: 'Incomplete',
            admissionAdminFirstStatus: 'On-going',
            admissionApprovalStatus: 'Incomplete', // New
          };
        }

        setStatuses({
          registrationStatus: registrationData.registrationStatus || 'Incomplete',
          preferredExamAndInterviewApplicationStatus: examInterviewData.preferredExamAndInterviewApplicationStatus || 'Incomplete',
          admissionRequirementsStatus: admissionData.admissionRequirementsStatus || 'Incomplete',
          admissionAdminFirstStatus: examDetailsData.admissionAdminFirstStatus || admissionData.admissionAdminFirstStatus || registrationData.admissionAdminFirstStatus || 'On-going',
          admissionExamDetailsStatus: examDetailsData.admissionExamDetailsStatus || 'Incomplete',
          approvedExamFeeStatus: examDetailsData.approvedExamFeeStatus || 'Required',
          approvedExamInterviewResult: examDetailsData.approvedExamInterviewResult || 'Pending',
          examInterviewResultStatus: examDetailsData.examInterviewResultStatus || 'Incomplete',
          reservationFeePaymentStepStatus: examDetailsData.reservationFeePaymentStepStatus || 'Incomplete',
          admissionApprovalStatus: examDetailsData.admissionApprovalStatus || 'Incomplete', // New
        });

        setLoading(false);
      } catch (err) {
        console.error('Error fetching navigation statuses:', err);
        setError('Failed to load navigation data. Some options may be unavailable.');
        setLoading(false);
      }
    };

    fetchStatuses();
    const refreshInterval = setInterval(fetchStatuses, 5 * 60 * 1000);
    return () => clearInterval(refreshInterval);
  }, [navigate]);

  const navItems = [
    {
      path: '/scope-registration',
      icon: faFileAlt,
      label: '1. Registration',
      enabled: true,
    },
    {
      path: '/scope-exam-interview-application',
      icon: faClipboardCheck,
      label: '2. Exam & Interview Application',
      enabled: statuses.registrationStatus === 'Complete',
    },
    {
      path: '/scope-admission-requirements',
      icon: faBook,
      label: '3. Admission Requirements',
      enabled: statuses.preferredExamAndInterviewApplicationStatus === 'Complete',
    },
    {
      path: '/scope-admission-exam-details',
      icon: faFileSignature,
      label: '4. Admission Exam Details',
      enabled: statuses.admissionAdminFirstStatus === 'Approved' || statuses.admissionAdminFirstStatus === 'Rejected',
    },
    {
      path: '/scope-exam-fee-payment',
      icon: faMoneyBillWave,
      label: '5. Exam Fee Payment',
      enabled: statuses.admissionExamDetailsStatus === 'Complete',
    },
    {
      path: '/scope-exam-interview-result',
      icon: faChartBar,
      label: '6. Exam & Interview Result',
      enabled: statuses.approvedExamFeeStatus === 'Paid' || statuses.approvedExamFeeStatus === 'Waived',
    },
    {
      path: '/scope-reservation-payment',
      icon: faMoneyBillWave,
      label: '7. Reservation Payment',
      enabled: statuses.approvedExamInterviewResult === 'Approved',
    },
    {
      path: '/scope-admission-approval',
      icon: faCheckCircle,
      label: '8. Admission Approval',
      enabled: statuses.reservationFeePaymentStepStatus === 'Complete',
    },
    {
      path: '/scope-enrollment-requirements',
      icon: faClipboardList,
      label: '9. Enrollment Requirements',
      enabled: statuses.admissionApprovalStatus === 'Complete',
    },
    {
      path: '#',
      icon: faTicketAlt,
      label: '10. Voucher Application',
      enabled: false,
    },
    {
      path: '#',
      icon: faCheckCircle,
      label: '11. Enrollment Approval',
      enabled: false,
    },
    {
      path: '#',
      icon: faUserGraduate,
      label: '12. Student Assessment',
      enabled: false,
    },
    {
      path: '#',
      icon: faMoneyBillWave,
      label: '13. Tuition Payment',
      enabled: false,
    },
    {
      path: '#',
      icon: faCalculator,
      label: '14. Officially Enrolled',
      enabled: false,
    },
  ];

  return (
    <div className={`side-nav-container ${isOpen ? 'open' : ''}`}>
      <div className="side-nav-content">
        {loading ? (
          <div className="scope-loading">Loading navigation...</div>
        ) : error ? (
          <div className="scope-error">{error}</div>
        ) : (
          <>
            <div className="scope-user-profile">
              <div className="scope-user-icon">
                <FontAwesomeIcon icon={faUser} size="2x" />
              </div>
              <div className="scope-user-details">
                <div className="scope-user-email">
                  {formatEmail(userData.email)}
                </div>
                <div className="scope-user-role">Applicant</div>
              </div>
              <div className="scope-divider"></div>
            </div>
            <button
              className="enrollment-process-button"
              onClick={() => navigateToPage('/scope-dashboard')}
            >
              <FontAwesomeIcon icon={faCompass} className="enrollment-icon" />
              <span className="enrollment-text">Enrollment Process</span>
            </button>
            <div className="scope-nav-section">
              <div className="scope-nav-title">Admission Process</div>
              {navItems.slice(0, 7).map((item, index) => (
                <button
                  key={index}
                  className={`scope-nav-button ${!item.enabled ? 'disabled-nav-item' : ''}`}
                  onClick={() => item.enabled && navigateToPage(item.path)}
                  disabled={!item.enabled}
                >
                  <FontAwesomeIcon icon={item.icon} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
            <div className="scope-nav-section">
              <div className="scope-nav-title">Enrollment Process</div>
              {navItems.slice(7).map((item, index) => (
                <button
                  key={index}
                  className={`scope-nav-button ${!item.enabled ? 'disabled-nav-item' : ''}`}
                  onClick={() => item.enabled && navigateToPage(item.path)}
                  disabled={!item.enabled}
                >
                  <FontAwesomeIcon icon={item.icon} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
            <div className="side-nav-footer">
              <button
                className="scope-nav-button scope-logout-button"
                onClick={handleLogoutClick}
              >
                <FontAwesomeIcon icon={faSignOut} />
                <span className="nav-text-bold">Logout</span>
              </button>
            </div>
          </>
        )}
      </div>

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

export default SideNavigation;