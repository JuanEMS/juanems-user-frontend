import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faBars, faTimes, faArrowLeft, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import SJDEFILogo from '../../images/SJDEFILogo.png';
import '../../css/JuanScope/ScopeRegistration1.css';
import SideNavigation from './SideNavigation';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function ScopeExamInterviewApplication() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({});
  const [registrationStatus, setRegistrationStatus] = useState('Incomplete');
  const [admissionRequirementsStatus, setAdmissionRequirementsStatus] = useState('Incomplete');
  const [admissionAdminFirstStatus, setAdmissionAdminFirstStatus] = useState('On-going');
  const [admissionExamDetailsStatus, setAdmissionExamDetailsStatus] = useState('Incomplete'); // New state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [nextLocation, setNextLocation] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [errors, setErrors] = useState({});
  const [availableDates, setAvailableDates] = useState([]);
  const [showDateConfirmModal, setShowDateConfirmModal] = useState(false);
  const [isDateSaved, setIsDateSaved] = useState(false);

  // Update current date and time every minute
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

        // Fetch admission requirements status
        let admissionData;
        try {
          admissionData = await fetchWithRetry(
            `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/admission-requirements/${userEmail}`
          );
          setAdmissionRequirementsStatus(admissionData.admissionRequirementsStatus || 'Incomplete');
          setAdmissionAdminFirstStatus(admissionData.admissionAdminFirstStatus || applicantData.admissionAdminFirstStatus || 'On-going');
        } catch (err) {
          console.error('Error fetching admission data:', err);
          setAdmissionRequirementsStatus('Incomplete');
        }

        // Fetch exam details for admissionExamDetailsStatus
        let examDetailsData;
        try {
          examDetailsData = await fetchWithRetry(
            `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/exam-details/${userEmail}`
          );
          setAdmissionExamDetailsStatus(examDetailsData.admissionExamDetailsStatus || 'Incomplete');
        } catch (err) {
          console.error('Error fetching exam details:', err);
          setAdmissionExamDetailsStatus('Incomplete');
        }

        if (applicantData.registrationStatus !== 'Complete') {
          navigate('/scope-registration-6');
          return;
        }

        const examData = await fetchWithRetry(
          `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/exam-interview/${userEmail}`
        );
        if (examData.selectedDate) {
          setSelectedDate(new Date(examData.selectedDate));
          setIsDateSaved(examData.preferredExamAndInterviewApplicationStatus === 'Complete');
        }

        const datesData = await fetchWithRetry(
          `${process.env.REACT_APP_API_URL}/api/dropdown/exam-dates`
        );
        const parsedDates = datesData.map(item => new Date(item.date));
        setAvailableDates(parsedDates);

        setLoading(false);
      } catch (err) {
        console.error('Error loading data:', err);
        if (err.message.includes('403')) {
          setError('Access denied. Please verify your account.');
        } else if (err.message.includes('429')) {
          setError('Too many requests. Please try again later.');
        } else {
          setError('Failed to load user data or exam dates. Please check your connection and try again.');
        }
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

  // Handle unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isFormDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isFormDirty]);

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
    if (isFormDirty) {
      setNextLocation('/scope-announcements');
      setShowUnsavedModal(true);
    } else {
      navigate('/scope-announcements');
    }
  };

  const handleDateChange = (date) => {
    if (!isDateSaved) {
      setSelectedDate(date);
      setIsFormDirty(true);
      setErrors((prev) => ({ ...prev, selectedDate: null }));
      setShowDateConfirmModal(true);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!selectedDate) {
      newErrors.selectedDate = 'Selected Date is required';
    } else if (!availableDates.some(d => 
      d.getDate() === selectedDate.getDate() &&
      d.getMonth() === selectedDate.getMonth() &&
      d.getFullYear() === selectedDate.getFullYear()
    )) {
      newErrors.selectedDate = 'Selected date is not available';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirmDate = () => {
    setShowDateConfirmModal(false);
    setIsFormDirty(true);
  };

  const handleCancelDate = () => {
    setSelectedDate(null);
    setShowDateConfirmModal(false);
    setIsFormDirty(false);
    setErrors((prev) => ({ ...prev, selectedDate: null }));
  };

  const handleNext = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        setError('User email not found. Please log in again.');
        navigate('/scope-login');
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/save-exam-interview`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: userEmail,
            selectedDate: selectedDate.toISOString(),
            preferredExamAndInterviewApplicationStatus: 'Complete',
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setIsFormDirty(false);
        setIsDateSaved(true);
        alert(data.message || 'Exam and Interview date saved successfully.');
        navigate('/scope-admission-requirements');
      } else {
        if (response.status === 400) {
          setError(data.error || 'Selected date is no longer available or invalid.');
        } else if (response.status === 429) {
          setError('Too many requests. Please try again later.');
        } else {
          setError(data.error || 'Failed to save exam and interview date.');
        }
      }
    } catch (err) {
      console.error('Error saving exam and interview date:', err);
      setError('An error occurred while saving the exam and interview date. Please check your connection and try again.');
    }
  };

  const handleBack = () => {
    if (isFormDirty) {
      setNextLocation('/scope-registration-6');
      setShowUnsavedModal(true);
    } else {
      navigate('/scope-registration-6');
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleModalConfirm = () => {
    setShowUnsavedModal(false);
    if (nextLocation) {
      navigate(nextLocation);
    }
  };

  const handleModalCancel = () => {
    setShowUnsavedModal(false);
    setNextLocation(null);
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
          admissionExamDetailsStatus={admissionExamDetailsStatus} // Pass new prop
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
              <h2 className="registration-title">Exam & Interview Application</h2>
              <div className="registration-divider"></div>
              <div className="registration-container">
                <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '1.5rem' }}>
                  Select your preferred available date for the exam and interview. Once confirmed, you'll be notified of the scheduled date and time in the Exam & Interview Result.
                </div>
                {isDateSaved && (
                  <div style={{ margin: '1rem 0', color: '#333', fontSize: '14px', backgroundColor: '#e0f7fa', padding: '1rem', borderRadius: '5px' }}>
                    <p>
                      Your exam and interview date has been saved and cannot be changed. Please proceed to view the{' '}
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate('/scope-admission-requirements');
                        }}
                        style={{ color: '#007BFF', textDecoration: 'underline' }}
                      >
                        Admission Requirements
                      </a>.
                    </p>
                  </div>
                )}
                <div className="personal-info-section">
                  <div className="personal-info-header">
                    <FontAwesomeIcon
                      icon={faCalendarAlt}
                      style={{ color: '#212121' }}
                    />
                    <h3>Preferred Exam and Interview Date</h3>
                  </div>
                  <div className="personal-info-divider"></div>
                  <div className="reminder-box">
                    <p>
                      <strong>Reminder:</strong> Please select an available date. Fields marked with asterisk (<span className="required-asterisk">*</span>) are required. Once saved, the date cannot be changed.
                    </p>
                  </div>
                  <form>
                    <div className="form-grid">
                      <div className="form-group">
                        <label htmlFor="selectedDate">
                          Selected Date:<span className="required-asterisk">*</span>
                        </label>
                        <input
                          type="text"
                          id="selectedDate"
                          name="selectedDate"
                          value={selectedDate ? selectedDate.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          }) : ''}
                          readOnly
                          className="disabled-input"
                        />
                        {errors.selectedDate && (
                          <span className="error-message">
                            <FontAwesomeIcon icon={faCalendarAlt} /> {errors.selectedDate}
                          </span>
                        )}
                      </div>
                      <div className="form-group">
                        <label>Calendar:</label>
                        <div className="modern-datepicker-wrapper">
                          <ModernDatePickerAdapter 
                            selectedDate={selectedDate}
                            onDateChange={handleDateChange}
                            availableDates={availableDates}
                            disabled={isDateSaved}
                          />
                        </div>
                      </div>
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
                      <button
                        type="button"
                        className="next-button"
                        onClick={handleNext}
                        disabled={isDateSaved}
                        style={{
                          backgroundColor: isDateSaved ? '#d3d3d3' : '#34A853',
                          cursor: isDateSaved ? 'not-allowed' : 'pointer',
                        }}
                      >
                        Next
                      </button>
                    </div>
                  </form>
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
      {showUnsavedModal && (
        <div className="scope-modal-overlay">
          <div className="scope-confirm-modal">
            <h3>Unsaved Changes</h3>
            <p>You have unsaved changes. Do you want to leave without saving?</p>
            <div className="scope-modal-buttons">
              <button
                className="scope-modal-cancel"
                onClick={handleModalCancel}
              >
                Stay
              </button>
              <button
                className="scope-modal-confirm"
                onClick={handleModalConfirm}
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}
      {showDateConfirmModal && (
        <div className="scope-modal-overlay">
          <div className="scope-confirm-modal">
            <h3>Confirm Date Selection</h3>
            <p>
              You have selected{' '}
              <strong>
                {selectedDate?.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </strong>
              . This date cannot be changed once saved. Are you sure?
            </p>
            <div className="scope-modal-buttons">
              <button
                className="scope-modal-cancel"
                onClick={handleCancelDate}
              >
                Cancel
              </button>
              <button
                className="scope-modal-confirm"
                onClick={handleConfirmDate}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Export ModernDatePickerAdapter separately
export function ModernDatePickerAdapter({ selectedDate, onDateChange, availableDates, disabled }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const [dateError, setDateError] = useState(null);

  const handleDateSelection = (date) => {
    if (disabled) return;

    if (date < today) {
      setDateError('The selected date has already passed. Please choose another available date.');
      return;
    }
    
    const isAvailable = availableDates.some(d => 
      d.getDate() === date.getDate() &&
      d.getMonth() === date.getMonth() &&
      d.getFullYear() === date.getFullYear()
    );
    
    if (!isAvailable) {
      setDateError('Selected date is not available. Please choose from the available dates.');
      return;
    }
    
    setDateError(null);
    onDateChange(date);
  };

  return (
    <div className="modern-datepicker">
      {dateError && (
        <div className="date-error-message">
          <FontAwesomeIcon icon={faExclamationCircle} />
          {dateError}
        </div>
      )}
      <DatePicker
        selected={selectedDate}
        onChange={handleDateSelection}
        minDate={today}
        maxDate={availableDates.length > 0 
          ? new Date(Math.max(...availableDates))
          : new Date(new Date().setMonth(new Date().getMonth() + 3))}
        includeDates={availableDates}
        inline
        calendarClassName="modern-calendar"
        disabled={disabled}
        dayClassName={(date) => {
          const isAvailable = availableDates.some(
            (d) => d.getDate() === date.getDate() &&
                   d.getMonth() === date.getMonth() &&
                   d.getFullYear() === date.getFullYear()
          );
          const isSelected = selectedDate &&
                            date.getDate() === selectedDate.getDate() &&
                            date.getMonth() === selectedDate.getMonth() &&
                            date.getFullYear() === selectedDate.getFullYear();
          const isPast = date < today;
          
          return isSelected ? 'selected-date' :
                 isAvailable ? 'available-date' :
                 isPast ? 'passed-date' :
                 'unavailable-date';
        }}
      />
    </div>
  );
}

export default ScopeExamInterviewApplication;