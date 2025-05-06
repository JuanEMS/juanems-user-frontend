import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faBell,
  faCalendarAlt,
  faBars,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import SJDEFILogo from '../../images/SJDEFILogo.png';
import dashboardBg from '../../images/dashboard background.png';
import '../../css/JuanScope/ScopeDashboard.css';
import SessionManager from '../JuanScope/SessionManager';
import SideNavigation from './SideNavigation';
import axios from 'axios';
import EnrollmentProcess from '../JuanScope/EnrollmentProcess';

function ScopeDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState({});
  const [registrationStatus, setRegistrationStatus] = useState('Incomplete');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unviewedCount, setUnviewedCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Replace the fetchUserData useEffect
  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    const createdAt = localStorage.getItem('createdAt');
    const firstName = localStorage.getItem('firstName');
    const middleName = localStorage.getItem('middleName');
    const lastName = localStorage.getItem('lastName');
    const applicantID = localStorage.getItem('applicantID');

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

    const axiosWithRetry = async (config, retries = 3, delay = 1000) => {
      try {
        const response = await axios(config);
        return response;
      } catch (error) {
        if (retries > 0 && error.response?.status !== 400) {
          await new Promise(resolve => setTimeout(resolve, delay));
          return axiosWithRetry(config, retries - 1, delay);
        }
        throw error;
      }
    };

    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError('');

        const createdAtDate = new Date(createdAt);
        if (isNaN(createdAtDate.getTime())) {
          console.error("Invalid date stored in localStorage");
          handleLogout();
          navigate('/scope-login', { state: { accountInactive: true, error: 'Invalid session data. Please log in again.' } });
          return;
        }

        const verificationData = await fetchWithRetry(
          `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/verification-status/${userEmail}`
        );

        if (
          verificationData.status !== 'Active' ||
          (createdAt && Math.abs(
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

        const registrationData = await fetchWithRetry(
          `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/personal-details/${userEmail}`
        );

        if (userDataResponse.applicantID && !localStorage.getItem('applicantID')) {
          localStorage.setItem('applicantID', userDataResponse.applicantID);
        }
        if (userDataResponse.firstName && !localStorage.getItem('firstName')) {
          localStorage.setItem('firstName', userDataResponse.firstName);
        }
        if (userDataResponse.lastName && !localStorage.getItem('lastName')) {
          localStorage.setItem('lastName', userDataResponse.lastName);
        }

        setUserData({
          email: userEmail,
          firstName: localStorage.getItem('firstName') || userDataResponse.firstName || 'User',
          middleName: localStorage.getItem('middleName') || '',
          lastName: localStorage.getItem('lastName') || userDataResponse.lastName || '',
          studentID: localStorage.getItem('studentID') || userDataResponse.studentID || 'N/A',
          applicantID: localStorage.getItem('applicantID') || userDataResponse.applicantID || 'N/A',
        });

        setRegistrationStatus(registrationData.registrationStatus || 'Incomplete');

        const announcementsResponse = await axiosWithRetry({
          method: 'get',
          url: `${process.env.REACT_APP_API_URL}/api/announcements`,
          params: {
            userEmail,
            status: 'Active',
            audience: 'Applicants'
          }
        });
        setUnviewedCount(announcementsResponse.data.unviewedCount || 0);

        setLoading(false);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        if (err.response?.status === 400) {
          setError('Invalid request. Please check your session and try again.');
        } else if (err.response?.status === 429) {
          setError('Too many requests. Please try again later.');
        } else {
          setError('Failed to load user data. Please check your connection and try again.');
        }
        setLoading(false);
      }
    };

    fetchUserData();
    const refreshInterval = setInterval(fetchUserData, 5 * 60 * 1000);
    return () => clearInterval(refreshInterval);
  }, [navigate]);

  // Replace the checkAccountStatus useEffect
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

  // Replace the handleLogout function
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
            createdAt: createdAt
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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <SessionManager>
      <div className="scope-dashboard-container">
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
              <FontAwesomeIcon icon={sidebarOpen ? faTimes : faBars} size="lg" />
            </button>
          </div>
        </header>
        <div className="scope-dashboard-content">
          <SideNavigation 
            userData={userData} 
            registrationStatus={registrationStatus}
            onNavigate={closeSidebar}
            isOpen={sidebarOpen} 
          />
          <main className={`scope-main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
            {loading ? (
              <div className="scope-loading">Loading...</div>
            ) : error ? (
              <div className="scope-error">{error}</div>
            ) : (
              <div className="dashboard-background-container">
                <div className="dashboard-content">
                  <div className="scope-top-section">
                    <div className="scope-date-time-container">
                      <FontAwesomeIcon icon={faCalendarAlt} className="date-icon" />
                      <div className="scope-date-time">
                        {currentDateTime.toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                        {', '}
                        {currentDateTime.toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    <div className="announcement-button-container">
                      <button
                        className="scope-announcement-button"
                        onClick={handleAnnouncements}
                      >
                        <FontAwesomeIcon icon={faBell} />
                      </button>
                      {unviewedCount > 0 && (
                        <span className="notification-badge">{unviewedCount}</span>
                      )}
                    </div>
                  </div>
                  <div className="user-info-row">
                    <div className="scope-welcome-section">
                      <h1 className="welcome-heading">
                        Good day, {userData.firstName}
                        {userData.middleName && ` ${userData.middleName}`}
                        {` ${userData.lastName}`}
                      </h1>
                      <p className="scope-welcome-message">Start your application today! Current Update</p>
                    </div>
                    <div className="scope-applicant-info">
                      <div className="scope-applicant-icon">
                        <FontAwesomeIcon icon={faUser} size="2x" />
                      </div>
                      <div className="scope-id-container">
                        <div className="scope-applicant-id">{userData.applicantID}</div>
                        <div className="scope-applicant-label">Applicant Number</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <EnrollmentProcess registrationStatus={registrationStatus} />
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
    </SessionManager>
  );
}

export default ScopeDashboard;