import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faExclamationCircle, faArrowLeft, faTimes, faBars } from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';
import SJDEFILogo from '../../images/SJDEFILogo.png';
import '../../css/JuanScope/ScopeRegistration1.css';
import SessionManager from '../JuanScope/SessionManager';
import SideNavigation from './SideNavigation';
import axios from 'axios';

// Custom styles for react-select
const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    height: '34px',
    minHeight: '34px',
    borderColor: state.isFocused ? '#00245A' : (state.selectProps.error ? '#880D0C' : '#ccc'),
    boxShadow: state.isFocused ? '0 0 0 1px #00245A' : 'none',
    '&:hover': {
      borderColor: state.isFocused ? '#00245A' : '#aaa',
    },
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: '0 8px',
    height: '34px',
  }),
  input: (provided) => ({
    ...provided,
    margin: '0',
    padding: '0',
    fontSize: '12px',
  }),
  indicatorsContainer: (provided) => ({
    ...provided,
    height: '34px',
  }),
  placeholder: (provided) => ({
    ...provided,
    fontSize: '12px',
  }),
  singleValue: (provided) => ({
    ...provided,
    fontSize: '12px',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#00245A' : (state.isFocused ? '#f0f0f0' : null),
    fontSize: '12px',
    padding: '6px 12px',
  }),
};

// Entry Level options
const entryLevelOptions = [
  { value: 'Senior High School', label: 'Senior High School' },
  { value: 'Senior High School - Transferee', label: 'Senior High School - Transferee' },
];

function ScopeRegistration2() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unviewedCount, setUnviewedCount] = useState(0);
  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem('registrationData');
    return savedData ? JSON.parse(savedData) : {
      entryLevel: '',
      academicYear: '',
      academicStrand: '',
      academicTerm: '',
      academicLevel: '',
      ...location.state?.formData,
    };
  });
  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [nextLocation, setNextLocation] = useState(null);

  // Update current date and time every minute
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

  if (!userEmail) {
    navigate('/scope-login');
    return;
  }

  const fetchUserData = async () => {
    try {
      setLoading(true);

      const createdAtDate = new Date(createdAt);
      if (isNaN(createdAtDate.getTime())) {
        handleLogout();
        navigate('/scope-login', { state: { accountInactive: true } });
        return;
      }

      const verificationResponse = await fetch(
        `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/verification-status/${userEmail}`
      );

      if (!verificationResponse.ok) {
        throw new Error('Failed to verify account status');
      }

      const verificationData = await verificationResponse.json();

      if (
        verificationData.status !== 'Active' ||
        (createdAt &&
          Math.abs(
            new Date(verificationData.createdAt).getTime() -
              new Date(createdAt).getTime()
          ) > 1000)
      ) {
        handleLogout();
        navigate('/scope-login', { state: { accountInactive: true } });
        return;
      }

      const applicantResponse = await fetch(
        `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/personal-details/${userEmail}`
      );

      if (!applicantResponse.ok) {
        throw new Error('Failed to fetch applicant details');
      }

      const applicantData = await applicantResponse.json();

      localStorage.setItem('applicantID', applicantData.applicantID || '');
      localStorage.setItem('firstName', applicantData.firstName || '');
      localStorage.setItem('middleName', applicantData.middleName || '');
      localStorage.setItem('lastName', applicantData.lastName || '');
      localStorage.setItem('dob', applicantData.dob ? new Date(applicantData.dob).toISOString().split('T')[0] : '');
      localStorage.setItem('nationality', applicantData.nationality || '');
      localStorage.setItem('academicYear', applicantData.academicYear || '');
      localStorage.setItem('academicStrand', applicantData.academicStrand || '');
      localStorage.setItem('academicTerm', applicantData.academicTerm || '');
      localStorage.setItem('academicLevel', applicantData.academicLevel || '');

      setUserData({
        email: userEmail,
        firstName: applicantData.firstName || 'User',
        middleName: applicantData.middleName || '',
        lastName: applicantData.lastName || '',
        dob: applicantData.dob ? new Date(applicantData.dob).toISOString().split('T')[0] : '',
        nationality: applicantData.nationality || '',
        studentID: applicantData.studentID || 'N/A',
        applicantID: applicantData.applicantID || 'N/A',
        academicYear: applicantData.academicYear || '',
        academicStrand: applicantData.academicStrand || '',
        academicTerm: applicantData.academicTerm || '',
        academicLevel: applicantData.academicLevel || '',
      });

      setFormData((prev) => ({
        ...prev,
        entryLevel: location.state?.formData?.entryLevel || applicantData.entryLevel || prev.entryLevel || '',
        academicYear: applicantData.academicYear || prev.academicYear || '',
        academicStrand: applicantData.academicStrand || prev.academicStrand || '',
        academicTerm: applicantData.academicTerm || prev.academicTerm || '',
        academicLevel: applicantData.academicLevel || prev.academicLevel || '',
      }));

      try {
        const announcementsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/announcements`, {
          params: {
            userEmail,
            status: 'Active',
            audience: 'Applicants',
          },
        });
        setUnviewedCount(announcementsResponse.data.unviewedCount || 0);
      } catch (err) {
        console.warn('Failed to fetch announcements:', err);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error loading registration data:', err);
      setError('Failed to load user data. Please try again or contact support.');
      setLoading(false);
    }
  };

  fetchUserData();
  const refreshInterval = setInterval(fetchUserData, 5 * 60 * 1000);
  return () => clearInterval(refreshInterval);
}, [navigate, location.state]);

 // Replace the checkAccountStatus useEffect
 useEffect(() => {
  const checkAccountStatus = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      const createdAt = localStorage.getItem('createdAt');

      if (!userEmail || !createdAt) return;

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/verification-status/${userEmail}`
      );

      if (!response.ok) {
        throw new Error('Failed to verify account status');
      }

      const data = await response.json();

      if (
        data.status !== 'Active' ||
        new Date(data.createdAt).getTime() !== new Date(createdAt).getTime()
      ) {
        handleLogout();
        navigate('/scope-login', { state: { accountInactive: true } });
      }
    } catch (err) {
      console.error('Error checking account status:', err);
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

   // Replace the handleLogout function
   const handleLogout = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      const createdAt = localStorage.getItem('createdAt');

      if (!userEmail) {
        navigate('/scope-login');
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
        setError('Failed to logout. Please try again.');
      }
    } catch (err) {
      setError('Error during logout process');
    } finally {
      setShowLogoutModal(false);
    }
  };

  const handleAnnouncements = () => {
    if (isFormDirty) {
      setNextLocation('/scope-announcements');
      setShowUnsavedModal(true);
    } else {
      navigate('/scope-announcements', { state: { formData } });
    }
  };

  const handleNext = () => {
    if (validateForm()) {
      localStorage.setItem('registrationData', JSON.stringify(formData));
      navigate('/scope-registration-3', { state: { formData } });
    }
  };

  const handleBack = () => {
    localStorage.setItem('registrationData', JSON.stringify(formData));
    navigate('/scope-registration', { state: { formData } });
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleSelectChange = (selectedOption, { name }) => {
    setFormData({
      ...formData,
      [name]: selectedOption ? selectedOption.value : '',
    });

    setTouchedFields({
      ...touchedFields,
      [name]: true,
    });

    setIsFormDirty(true);
  };

  const validateField = (name, value) => {
    if (name === 'entryLevel' && !value) {
      return 'Entry Level is required';
    }
    return null;
  };

  // Real-time validation
  useEffect(() => {
    const newErrors = {};

    Object.keys(touchedFields).forEach((field) => {
      if (touchedFields[field]) {
        const error = validateField(field, formData[field]);
        if (error) newErrors[field] = error;
      }
    });

    setErrors(newErrors);
  }, [formData, touchedFields]);

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ['entryLevel'];

    requiredFields.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    setTouchedFields(
      requiredFields.reduce((acc, field) => ({ ...acc, [field]: true }), {})
    );
    return Object.keys(newErrors).length === 0;
  };

  const handleModalConfirm = () => {
    setShowUnsavedModal(false);
    if (nextLocation) {
      navigate(nextLocation, { state: { formData } });
    }
  };

  const handleModalCancel = () => {
    setShowUnsavedModal(false);
    setNextLocation(null);
  };

  // Get selected entry level
  const selectedEntryLevel = entryLevelOptions.find((option) => option.value === formData.entryLevel);

  // Requirements based on entry level
  const requirements = formData.entryLevel === 'Senior High School' ? (
    <div className="requirements-container">
      <p style={{ color: '#880D0C', fontWeight: 'bold' }}>
        Reminder: Please prepare the following list of Admission and Enrollment requirements to be submitted in Submit Requirements menu after successful registration:
      </p>
      <h4>Admission:</h4>
      <ul>
        <li>Photocopy of latest report card (photocopy of Gr 10 latest semester or Gr 9 Report Card)</li>
        <li>ID (2x2) Photo – White background</li>
      </ul>
      <h4>Enrollment:</h4>
      <ul>
        <li>Gr 10 original copy of report card (Form 138)</li>
        <li>Photocopy of PSA/NSO birth certificate (bring original for comparison)</li>
        <li>2 pcs ID (2x2) Photo – White background</li>
      </ul>
      <h4>For Top 1 and Top 2 of the Graduating Class:</h4>
      <ul>
        <li>Certification of Ranking with school seal, specifying the total number of graduates</li>
      </ul>
    </div>
  ) : formData.entryLevel === 'Senior High School - Transferee' ? (
    <div className="requirements-container">
      <p style={{ color: '#880D0C', fontWeight: 'bold' }}>
        Reminder: Please prepare the following list of Admission and Enrollment requirements to be submitted in Submit Requirements menu after successful registration:
      </p>
      <h4>Admission:</h4>
      <ul>
        <li>Photocopy of latest report card (photocopy of Gr 10 latest semester or Gr 9 Report Card)</li>
        <li>ID (2x2) Photo – White background</li>
      </ul>
      <h4>Transferees:</h4>
      <ul>
        <li>Transcript of records or certification of grades from previous school – for evaluation purposes</li>
        <li>ID Photo as stated above</li>
      </ul>
      <h4>For Top 1 and Top 2 of the Graduating Class:</h4>
      <ul>
        <li>Certification of Ranking with school seal, specifying the total number of graduates</li>
      </ul>
      <h4>Enrollment:</h4>
      <ul>
        <li>Gr 10 original copy of report card (Form 138)</li>
        <li>Photocopy of PSA/NSO birth certificate (bring original for comparison)</li>
        <li>2 pcs ID (2x2) Photo – White background</li>
      </ul>
    </div>
  ) : null;

  return (
    <SessionManager>
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
                <h2 className="registration-title">Registration</h2>
                <div className="registration-divider"></div>
                <div className="registration-container">
                  <div className="step-indicator">
                    <div className="step-circles">
                      <div
                        className="step-circle completed"
                        style={{ backgroundColor: '#34A853' }}
                      >
                        1
                      </div>
                      <div
                        className="step-line"
                        style={{ backgroundColor: '#34A853' }}
                      ></div>
                      <div
                        className="step-circle active"
                        style={{ backgroundColor: '#64676C' }}
                      >
                        2
                      </div>
                      <div
                        className="step-line"
                        style={{ backgroundColor: '#D8D8D8' }}
                      ></div>
                      <div
                        className="step-circle"
                        style={{ backgroundColor: '#D8D8D8' }}
                      >
                        3
                      </div>
                      <div
                        className="step-line"
                        style={{ backgroundColor: '#D8D8D8' }}
                      ></div>
                      <div
                        className="step-circle"
                        style={{ backgroundColor: '#D8D8D8' }}
                      >
                        4
                      </div>
                      <div
                        className="step-line"
                        style={{ backgroundColor: '#D8D8D8' }}
                      ></div>
                      <div
                        className="step-circle"
                        style={{ backgroundColor: '#D8D8D8' }}
                      >
                        5
                      </div>
                      <div
                        className="step-line"
                        style={{ backgroundColor: '#D8D8D8' }}
                      ></div>
                      <div
                        className="step-circle"
                        style={{ backgroundColor: '#D8D8D8' }}
                      >
                        6
                      </div>
                    </div>
                    <div className="step-text">Step 2 of 6</div>
                  </div>
                  <div className="personal-info-section">
                    <div className="personal-info-header">
                      <FontAwesomeIcon
                        icon={faFileAlt}
                        style={{ color: '#212121' }}
                      />
                      <h3>Admission and Enrollment Requirements</h3>
                    </div>
                    <div className="personal-info-divider"></div>
                    <div className="reminder-box">
                      <p>
                        <strong>Reminder:</strong> Fields marked with asterisk
                        (<span className="required-asterisk">*</span>) are
                        required.
                      </p>
                    </div>
                    <form>
                      <div className="form-grid">
                        <div className="form-group">
                          <label htmlFor="academicYear">Academic Year:</label>
                          <input
                            type="text"
                            id="academicYear"
                            name="academicYear"
                            value={formData.academicYear}
                            disabled
                            className="disabled-input"
                            style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="academicStrand">Academic Strand:</label>
                          <input
                            type="text"
                            id="academicStrand"
                            name="academicStrand"
                            value={formData.academicStrand}
                            disabled
                            className="disabled-input"
                            style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="academicTerm">Academic Term:</label>
                          <input
                            type="text"
                            id="academicTerm"
                            name="academicTerm"
                            value={formData.academicTerm}
                            disabled
                            className="disabled-input"
                            style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="academicLevel">Academic Level:</label>
                          <input
                            type="text"
                            id="academicLevel"
                            name="academicLevel"
                            value={formData.academicLevel}
                            disabled
                            className="disabled-input"
                            style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="entryLevel">
                            Entry Level:<span className="required-asterisk">*</span>
                          </label>
                          <Select
                            id="entryLevel"
                            name="entryLevel"
                            options={entryLevelOptions}
                            value={selectedEntryLevel}
                            onChange={(option) => handleSelectChange(option, { name: 'entryLevel' })}
                            onBlur={() =>
                              setTouchedFields({
                                ...touchedFields,
                                entryLevel: true,
                              })
                            }
                            styles={customSelectStyles}
                            placeholder="Select Entry Level"
                            error={errors.entryLevel}
                          />
                          {errors.entryLevel && (
                            <span className="error-message">
                              <FontAwesomeIcon icon={faExclamationCircle} /> {errors.entryLevel}
                            </span>
                          )}
                        </div>
                      </div>
                      {requirements && (
                        <div
                          className="requirements-box"
                          style={{
                            backgroundColor: '#E0E0E0',
                            borderRadius: '10px',
                            padding: '15px',
                            marginTop: '1rem',
                          }}
                        >
                          {requirements}
                        </div>
                      )}
                      <div className="form-buttons" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                        <button
                          type="button"
                          className="back-button"
                          onClick={handleBack}
                          style={{
                            backgroundColor: '#666',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '10px',
                            fontSize: '14px',
                            cursor: 'pointer',
                          }}
                        >
                          <FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: '5px' }} />
                          Back
                        </button>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button type="button" className="next-button" onClick={handleNext}>
                            Next
                          </button>
                        </div>
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
      </div>
    </SessionManager>
  );
}

export default ScopeRegistration2;