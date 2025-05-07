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

function SideNavigation({ userData, registrationStatus, onNavigate, isOpen }) {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [examInterviewStatus, setExamInterviewStatus] = useState('Incomplete');
  const [admissionAdminFirstStatus, setAdmissionAdminFirstStatus] = useState('On-going');

  useEffect(() => {
    const fetchExamInterviewStatus = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/exam-interview/${userData.email}`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch exam and interview status');
        }
        const data = await response.json();
        setExamInterviewStatus(data.preferredExamAndInterviewApplicationStatus || 'Incomplete');
      } catch (err) {
        console.error('Error fetching exam and interview status:', err);
      }
    };

    const fetchAdmissionAdminFirstStatus = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/admission-requirements/${userData.email}`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch admission admin first status');
        }
        const data = await response.json();
        setAdmissionAdminFirstStatus(data.admissionAdminFirstStatus || 'On-going');
      } catch (err) {
        console.error('Error fetching admission admin first status:', err);
      }
    };

    if (userData.email) {
      fetchExamInterviewStatus();
      fetchAdmissionAdminFirstStatus();
    }
  }, [userData.email]);

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
      enabled: registrationStatus === 'Complete',
    },
    {
      path: '/scope-admission-requirements',
      icon: faBook,
      label: '3. Admission Requirements',
      enabled: examInterviewStatus === 'Complete',
    },
    {
      path: '/scope-admission-exam-details',
      icon: faFileSignature,
      label: '4. Admission Exam Details',
      enabled: admissionAdminFirstStatus === 'Approved' || admissionAdminFirstStatus === 'Rejected',
    },
    {
      path: '#',
      icon: faMoneyBillWave,
      label: '5. Exam Fee Payment',
      enabled: false,
    },
    {
      path: '#',
      icon: faChartBar,
      label: '6. Exam & Interview Result',
      enabled: false,
    },
    {
      path: '#',
      icon: faMoneyBillWave,
      label: '7. Reservation Payment',
      enabled: false,
    },
    {
      path: '#',
      icon: faCheckCircle,
      label: '8. Admission Approval',
      enabled: false,
    },
    {
      path: '#',
      icon: faClipboardList,
      label: '9. Enrollment Requirements',
      enabled: false,
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