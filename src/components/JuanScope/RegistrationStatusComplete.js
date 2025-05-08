import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faBars } from '@fortawesome/free-solid-svg-icons';
import SJDEFILogo from '../../images/SJDEFILogo.png';
import '../../css/JuanScope/ScopeRegistration1.css';
import SideNavigation from './SideNavigation';
import RegistrationSummary from './RegistrationSummary';

function RegistrationStatusComplete() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({});
  const [registrationStatus, setRegistrationStatus] = useState('Complete');
  const [admissionRequirementsStatus, setAdmissionRequirementsStatus] = useState('Incomplete');
  const [admissionAdminFirstStatus, setAdmissionAdminFirstStatus] = useState('On-going');
<<<<<<< HEAD
  const [admissionExamDetailsStatus, setAdmissionExamDetailsStatus] = useState('Incomplete'); // New state
=======
>>>>>>> a3fea0106862ae583da46e72204acb6def9bc737
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({});

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

    const fetchUserData = async () => {
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
        localStorage.setItem('academicYear', applicantData.academicYear || '');
        localStorage.setItem('academicStrand', applicantData.academicStrand || '');
        localStorage.setItem('academicTerm', applicantData.academicTerm || '');
        localStorage.setItem('academicLevel', applicantData.academicLevel || '');

        setUserData({
          email: userEmail,
          firstName: applicantData.firstName || userData.firstName || 'User',
          middleName: applicantData.middleName || '',
          lastName: applicantData.lastName || userData.lastName || '',
          dob: applicantData.dob ? new Date(applicantData.dob).toISOString().split('T')[0] : '',
          nationality: applicantData.nationality || '',
          studentID: applicantData.studentID || userData.studentID || 'N/A',
          applicantID: applicantData.applicantID || userData.applicantID || 'N/A',
          academicYear: applicantData.academicYear || '',
          academicStrand: applicantData.academicStrand || '',
          academicTerm: applicantData.academicTerm || '',
          academicLevel: applicantData.academicLevel || '',
        });

        setRegistrationStatus(applicantData.registrationStatus || 'Complete');
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

<<<<<<< HEAD
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

=======
>>>>>>> a3fea0106862ae583da46e72204acb6def9bc737
        setFormData({
          prefix: applicantData.prefix || '',
          firstName: applicantData.firstName || '',
          middleName: applicantData.middleName || '',
          lastName: applicantData.lastName || '',
          suffix: applicantData.suffix || '',
          gender: applicantData.gender || '',
          lrnNo: applicantData.lrnNo || '',
          civilStatus: applicantData.civilStatus || '',
          religion: applicantData.religion || '',
          birthDate: applicantData.birthDate || '',
          countryOfBirth: applicantData.countryOfBirth || '',
          birthPlaceCity: applicantData.birthPlaceCity || '',
          birthPlaceProvince: applicantData.birthPlaceProvince || '',
          nationality: applicantData.nationality || '',
          entryLevel: applicantData.entryLevel || '',
          academicYear: applicantData.academicYear || '',
          academicStrand: applicantData.academicStrand || '',
          academicTerm: applicantData.academicTerm || '',
          academicLevel: applicantData.academicLevel || '',
          presentHouseNo: applicantData.presentHouseNo || '',
          presentBarangay: applicantData.presentBarangay || '',
          presentCity: applicantData.presentCity || '',
          presentProvince: applicantData.presentProvince || '',
          presentPostalCode: applicantData.presentPostalCode || '',
          permanentHouseNo: applicantData.permanentHouseNo || '',
          permanentBarangay: applicantData.permanentBarangay || '',
          permanentCity: applicantData.permanentCity || '',
          permanentProvince: applicantData.permanentProvince || '',
          permanentPostalCode: applicantData.permanentPostalCode || '',
          mobile: applicantData.mobile || '',
          telephoneNo: applicantData.telephoneNo || '',
          emailAddress: applicantData.emailAddress || '',
          elementarySchoolName: applicantData.elementarySchoolName || '',
          elementaryLastYearAttended: applicantData.elementaryLastYearAttended || '',
          elementaryGeneralAverage: applicantData.elementaryGeneralAverage || '',
          elementaryRemarks: applicantData.elementaryRemarks || '',
          juniorHighSchoolName: applicantData.juniorHighSchoolName || '',
          juniorHighLastYearAttended: applicantData.juniorHighLastYearAttended || '',
          juniorHighGeneralAverage: applicantData.juniorHighGeneralAverage || '',
          juniorHighRemarks: applicantData.juniorHighRemarks || '',
          contacts: applicantData.contacts || [],
        });

        setLoading(false);
      } catch (err) {
        console.error('Error loading registration data:', err);
        setError('Failed to load your registration data. Please check your connection and try again.');
        setLoading(false);
      }
    };

    fetchUserData();
    const refreshInterval = setInterval(fetchUserData, 5 * 60 * 1000);
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

  const handleProceed = () => {
    navigate('/scope-exam-interview-application');
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
          admissionRequirementsStatus={admissionRequirementsStatus}
          admissionAdminFirstStatus={admissionAdminFirstStatus}
<<<<<<< HEAD
          admissionExamDetailsStatus={admissionExamDetailsStatus} // Pass new prop
=======
>>>>>>> a3fea0106862ae583da46e72204acb6def9bc737
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
                    <div className="step-circle completed">1</div>
                    <div className="step-line completed"></div>
                    <div className="step-circle completed">2</div>
                    <div className="step-line completed"></div>
                    <div className="step-circle completed">3</div>
                    <div className="step-line completed"></div>
                    <div className="step-circle completed">4</div>
                    <div className="step-line completed"></div>
                    <div className="step-circle completed">5</div>
                    <div className="step-line completed"></div>
                    <div className="step-circle completed">6</div>
                  </div>
                  <div className="step-text">Registration Complete</div>
                </div>
                <div className="personal-info-section">
                  <div className="reminder-box" style={{ backgroundColor: '#34A853' }}>
                    <p>
                      <strong>Admission: Registration Completed!</strong>
                    </p>
                  </div>
                  <div style={{ margin: '1rem 0', fontSize: '14px', color: '#333', lineHeight: '1.5' }}>
                    <p>
                      Your registration is complete. Review your submitted information below. You can proceed to the Exam & Interview Application.
                    </p>
                  </div>
                  <RegistrationSummary formData={formData} />
                  <div className="form-buttons">
                    <button
                      type="button"
                      className="save-button"
                      onClick={handleProceed}
                    >
                      Proceed to Exam & Interview Application
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

export default RegistrationStatusComplete;