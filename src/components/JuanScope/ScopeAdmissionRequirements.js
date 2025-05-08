import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faArrowLeft, faEye, faCheck, faUpload, faTrash, faFileAlt, faPrint, faSpinner } from '@fortawesome/free-solid-svg-icons';
import SJDEFILogo from '../../images/SJDEFILogo.png';
import '../../css/JuanScope/ScopeRegistration1.css';
import SideNavigation from './SideNavigation';
import WaiverFormModal from './WaiverFormModal';
import DocumentVerificationSystem from './DocumentVerificationSystem';
import moment from 'moment-timezone';

function ScopeAdmissionRequirements() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({});
  const [registrationStatus, setRegistrationStatus] = useState('Incomplete');
  const [admissionAdminFirstStatus, setAdmissionAdminFirstStatus] = useState('On-going');
  const [admissionRequirementsStatus, setAdmissionRequirementsStatus] = useState('Incomplete');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [nextLocation, setNextLocation] = useState(null);
  const [requirements, setRequirements] = useState([]);
  const [showWaiverModal, setShowWaiverModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    DocumentVerification,
    handleFileUpload: verificationHandleFileUpload,
    handleVerificationComplete,
    getVerificationType,
    files,
    verificationResults,
    setFiles,
    setVerificationResults,
  } = DocumentVerificationSystem();

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

        console.log('Fetched applicantData:', applicantData); // Debug log

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

        const entryLevel = applicantData.entryLevel || '';
        const fetchedAdmissionStatus = applicantData.admissionAdminFirstStatus || 'On-going';
        console.log('Fetched admissionAdminFirstStatus:', fetchedAdmissionStatus); // Debug log
        setAdmissionAdminFirstStatus(fetchedAdmissionStatus);

        let reqList = [];
        if (entryLevel === 'Senior High School') {
          reqList = [
            {
              id: 1,
              name: 'Photocopy of latest report card (photocopy of Gr 10 latest semester or Gr 9 Report Card)',
              submitted: null,
              waived: false,
              feedback: '<strong>Status:</strong> Unverified\n<strong>Feedback:</strong> No document uploaded - all requirements are required unless waived',
              waiverDetails: null,
            },
            {
              id: 2,
              name: 'ID (2x2) Photo – White background',
              submitted: null,
              waived: false,
              feedback: '<strong>Status:</strong> Unverified\n<strong>Feedback:</strong> No document uploaded - all requirements are required unless waived',
              waiverDetails: null,
            },
          ];
        } else if (entryLevel === 'Senior High School - Transferee') {
          reqList = [
            {
              id: 1,
              name: 'ID (2x2) Photo – White background',
              submitted: null,
              waived: false,
              feedback: '<strong>Status:</strong> Unverified\n<strong>Feedback:</strong> No document uploaded - all requirements are required unless waived',
              waiverDetails: null,
            },
            {
              id: 2,
              name: 'Transcript of records or certification of grades from previous school – for evaluation purposes',
              submitted: null,
              waived: false,
              feedback: '<strong>Status:</strong> Unverified\n<strong>Feedback:</strong> No document uploaded - all requirements are required unless waived',
              waiverDetails: null,
            },
          ];
        } else {
          reqList = [];
          setError('Invalid or missing entry level. Please contact support.');
        }

        let admissionData;
        try {
          admissionData = await fetchWithRetry(
            `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/admission-requirements/${userEmail}`
          );
          console.log('Fetched admissionData:', admissionData); // Debug log
        } catch (err) {
          console.error('Error fetching admission data:', err);
          admissionData = null;
        }

        if (admissionData && Array.isArray(admissionData.admissionRequirements) && admissionData.admissionRequirements.length > 0) {
          setRequirements(admissionData.admissionRequirements.map(req => ({
            id: req.requirementId,
            name: req.name,
            submitted: req.fileName || null,
            waived: req.status === 'Waived',
            feedback: `<strong>Status:</strong> ${req.status}\n<strong>Feedback:</strong> ${req.status === 'Waived' ? 'Waiver approved' : req.status === 'Verified' ? 'Document verified' : req.status === 'Submitted' ? 'Document uploaded' : 'No document uploaded'}`,
            waiverDetails: req.waiverDetails,
          })));
          setAdmissionRequirementsStatus(admissionData.admissionRequirementsStatus || 'Incomplete');
          setAdmissionAdminFirstStatus(admissionData.admissionAdminFirstStatus || fetchedAdmissionStatus);
          setIsSubmitted(admissionData.admissionRequirementsStatus === 'Complete');
        } else {
          setRequirements(reqList);
          setAdmissionRequirementsStatus('Incomplete');
          if (!admissionData) {
            setError('Failed to load admission requirements. Using default requirements.');
          }
        }

        setRegistrationStatus(applicantData.registrationStatus || 'Incomplete');

        if (applicantData.registrationStatus !== 'Complete') {
          navigate('/scope-registration-6');
          return;
        }

        setLoading(false);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load user data or admission requirements. Please check your connection and try again.');
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
        console.error('Error checking account status:', err);
        setError('Unable to verify account status. Please check your connection.');
      }
    };

    const interval = setInterval(checkAccountStatus, 60 * 1000);
    checkAccountStatus();
    return () => clearInterval(interval);
  }, [navigate]);

  useEffect(() => {
    console.log('admissionAdminFirstStatus updated:', admissionAdminFirstStatus); // Debug log
    if (admissionAdminFirstStatus === 'Approved' || admissionAdminFirstStatus === 'Rejected') {
      console.log(`Admission status changed to: ${admissionAdminFirstStatus}`);
      if (admissionAdminFirstStatus === 'Rejected') {
        setError('Your admission requirements have been rejected. Please check the Admission Exam Details for more information or contact the admissions office.');
      }
    }
  }, [admissionAdminFirstStatus]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isFormDirty && !isSubmitted) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isFormDirty, isSubmitted]);

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
    if (isFormDirty && !isSubmitted) {
      setNextLocation('/scope-announcements');
      setShowUnsavedModal(true);
    } else {
      navigate('/scope-announcements');
    }
  };

  const handleFileUpload = (id, event) => {
    if (isSubmitted) {
      alert('Submission is complete. You cannot upload or modify files.');
      return;
    }

    const file = event.target.files[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      alert('Only PNG, JPG, or PDF files are allowed.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must not exceed 10MB.');
      return;
    }

    setUploadedFiles((prev) => ({ ...prev, [id]: file }));
    verificationHandleFileUpload(id, event);

    const requirement = requirements.find((req) => req.id === id);
    if (requirement) {
      const updatedRequirements = requirements.map((req) => {
        if (req.id === id) {
          return {
            ...req,
            submitted: file.name,
            feedback: '<strong>Status:</strong> Submitted\n<strong>Feedback:</strong> Document uploaded, verification in progress...',
            waiverDetails: null,
            waived: false
          };
        }
        return req;
      });
      setRequirements(updatedRequirements);
      setIsFormDirty(true);
    }
  };

  const handleViewDocument = async (id) => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        alert('User email not found. Please log in again.');
        return;
      }

      const requirement = requirements.find((req) => req.id === id);
      if (!requirement || !requirement.submitted) {
        alert('No file available to view.');
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/fetch-admission-file/${userEmail}/${id}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch file');
      }

      const fileData = await response.json();

      if (!fileData.dataUri || !fileData.fileType || !fileData.fileName) {
        throw new Error('Invalid file data received from server');
      }

      if (fileData.fileType.includes('image')) {
        const imageWindow = window.open('', '_blank');
        if (imageWindow) {
          imageWindow.document.write(`
            <html>
              <head><title>${fileData.fileName}</title></head>
              <body style="margin:0;padding:0;display:flex;justify-content:center;align-items:center;height:100vh;background:#f0f0f0;">
                <img src="${fileData.dataUri}" style="max-width:100%;max-height:100%;object-fit:contain;" alt="Submitted document" />
              </body>
            </html>
          `);
          imageWindow.document.close();
        } else {
          alert('Failed to open new window. Please allow pop-ups and try again.');
        }
      } else if (fileData.fileType === 'application/pdf') {
        window.open(fileData.dataUri, '_blank');
      } else {
        const link = document.createElement('a');
        link.href = fileData.dataUri;
        link.download = fileData.fileName;
        link.click();
      }
    } catch (err) {
      console.error('Error viewing document:', err);
      const file = uploadedFiles[id];
      if (file) {
        const fileURL = URL.createObjectURL(file);
        window.open(fileURL, '_blank');
        URL.revokeObjectURL(fileURL);
      } else {
        alert(`Failed to view document: ${err.message}. Please try again or contact support.`);
      }
    }
  };

  useEffect(() => {
    Object.keys(verificationResults).forEach((id) => {
      const result = verificationResults[id];
      if (result.status !== 'pending') {
        const updatedRequirements = requirements.map((req) => {
          if (req.id === parseInt(id)) {
            return {
              ...req,
              feedback: `<strong>Status:</strong> ${result.status === 'verified' ? 'Verified' : 'Invalid'}\n<strong>Feedback:</strong> ${result.message}`,
            };
          }
          return req;
        });
        setRequirements(updatedRequirements);
      }
    });
  }, [verificationResults]);

  const handleWaiveCredentials = () => {
    if (isSubmitted) {
      alert('Submission is complete. You cannot waive credentials.');
      return;
    }
    setShowWaiverModal(true);
  };

  const handleWaiverSubmit = (waiverData) => {
    if (isSubmitted) {
      alert('Submission is complete. You cannot modify waivers.');
      return;
    }

    const updatedRequirements = requirements.map((req) => {
      if (waiverData.selectedRequirements.includes(req.id)) {
        return {
          ...req,
          waived: true,
          submitted: null,
          feedback: '<strong>Status:</strong> Waived\n<strong>Feedback:</strong> Waiver requested, pending approval.',
          waiverDetails: {
            reason: waiverData.reason,
            promiseDate: waiverData.promiseDate,
          },
        };
      } else if (req.waived && !waiverData.selectedRequirements.includes(req.id)) {
        return {
          ...req,
          waived: false,
          feedback: '<strong>Status:</strong> Unverified\n<strong>Feedback:</strong> No document uploaded - all requirements are required unless waived',
          waiverDetails: null,
        };
      }
      return req;
    });
    setRequirements(updatedRequirements);
    setIsFormDirty(true);
    setShowWaiverModal(false);
  };

  const handleSave = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        setError('User email not found. Please log in again.');
        navigate('/scope-login');
        return false;
      }

      const formData = new FormData();
      formData.append('email', userEmail);
      formData.append('requirements', JSON.stringify(requirements));
      Object.keys(uploadedFiles).forEach((id) => {
        formData.append(`file-${id}`, uploadedFiles[id]);
      });

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/save-admission-requirements`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();
      if (response.ok) {
        setIsFormDirty(false);
        const admissionData = await fetch(
          `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/admission-requirements/${userEmail}`
        );
        if (admissionData.ok) {
          const admissionJson = await admissionData.json();
          setRequirements(admissionJson.admissionRequirements.map(req => ({
            id: req.requirementId,
            name: req.name,
            submitted: req.fileName || null,
            waived: req.status === 'Waived',
            feedback: `<strong>Status:</strong> ${req.status}\n<strong>Feedback:</strong> ${req.status === 'Waived' ? 'Waiver approved' : req.status === 'Verified' ? 'Document verified' : req.status === 'Submitted' ? 'Document uploaded, verification pending' : 'No document uploaded'}`,
            waiverDetails: req.waiverDetails
          })));
          setAdmissionRequirementsStatus(admissionJson.admissionRequirementsStatus || 'Incomplete');
          setAdmissionAdminFirstStatus(admissionJson.admissionAdminFirstStatus || 'On-going');
          setIsSubmitted(admissionJson.admissionRequirementsStatus === 'Complete');
        }
        return true;
      } else {
        console.error('Save failed:', data.error);
        if (response.status === 400) {
          setError(data.error || 'Invalid file format or size. Please check requirements and try again.');
        } else if (response.status === 429) {
          setError('Too many requests. Please try again later.');
        } else {
          setError(data.error || 'Failed to save admission requirements. Please try again.');
        }
        return false;
      }
    } catch (err) {
      console.error('Error saving admission requirements:', err.message, err.stack);
      setError('An error occurred while saving the admission requirements. Please check your connection and try again.');
      return false;
    }
  };

  const handlePrintWaiver = async () => {
    const waivedRequirements = requirements.filter((req) => req.waived && req.waiverDetails);
    if (waivedRequirements.length === 0) {
      alert('No waived requirements to print.');
      return;
    }

    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        setError('User email not found. Please log in again.');
        navigate('/scope-login');
        return;
      }

      const now = moment().tz('Asia/Manila');
      const dateIssued = now.format('YYYY-MM-DD');
      const dateSigned = now.format('YYYY-MM-DDTHH:mm:ssZ');

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/generate-waiver-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userData: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userEmail,
          },
          waivedRequirements,
          academicYear: '2025-2026',
          dateIssued,
          dateSigned,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate waiver PDF');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating waiver PDF:', err);
      setError('Failed to generate waiver PDF. Please check your connection and try again.');
    }
  };

  const handleNext = async () => {
    const isValid = requirements.every(
      (req) => req.waived || (req.submitted && req.feedback.includes('Verified'))
    );

    if (!isValid && !(admissionAdminFirstStatus === 'Approved' || admissionAdminFirstStatus === 'Rejected')) {
      alert('All requirements must be verified or waived to proceed.');
      return;
    }

    if (isSubmitted || admissionAdminFirstStatus === 'Approved' || admissionAdminFirstStatus === 'Rejected') {
      navigate('/scope-admission-exam-details');
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        setError('User email not found. Please log in again.');
        navigate('/scope-login');
        setIsSubmitting(false);
        return;
      }

      const saved = await handleSave();
      if (!saved) {
        setIsSubmitting(false);
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/complete-admission-requirements`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: userEmail }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400) {
          throw new Error(errorData.error || 'Invalid submission data.');
        } else if (response.status === 429) {
          throw new Error('Too many requests. Please try again later.');
        }
        throw new Error(errorData.error || 'Failed to complete admission requirements');
      }

      const data = await response.json();
      setIsSubmitted(true);
      setAdmissionRequirementsStatus('Complete');
      setAdmissionAdminFirstStatus(data.admissionAdminFirstStatus || 'On-going');
      setShowConfirmModal(false);
      alert('Admission requirements submitted successfully. Your submission is being validated. Please check back for updates.');
      navigate('/scope-admission-requirements');
    } catch (err) {
      console.error('Error during final submission:', err);
      setError(`Submission failed: ${err.message}. Please try again or contact support.`);
      setShowConfirmModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelSubmit = () => {
    setShowConfirmModal(false);
  };

  const handleBack = () => {
    if (isFormDirty && !isSubmitted) {
      setNextLocation('/scope-exam-interview-application');
      setShowUnsavedModal(true);
    } else {
      navigate('/scope-exam-interview-application');
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

  const handleNavigation = (path) => {
    if (isFormDirty && !isSubmitted) {
      setNextLocation(path);
      setShowUnsavedModal(true);
    } else {
      navigate(path);
    }
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
          onNavigate={closeSidebar}
          isOpen={sidebarOpen}
        />
        <main className={`scope-main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
          {loading ? (
            <div className="scope-loading">Loading...</div>
          ) : error ? (
            <div className="scope-error">{error}</div>
          ) : (
            <div className="registration-content">
              <h2 className="registration-title">Admission Requirements</h2>
              <div className="registration-divider"></div>
              <div className="registration-container">
                <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '1rem' }}>
                </div>
                <div style={{ fontSize: '12px', marginBottom: '1.5rem', color: '#333' }}>
                  <strong>Entry Level:</strong> {userData.entryLevel || 'Not specified'}
                </div>
                {isSubmitted && !(admissionAdminFirstStatus === 'Approved' || admissionAdminFirstStatus === 'Rejected') && (
                  <div style={{ margin: '1rem 0', color: '#333', fontSize: '14px', backgroundColor: '#e0f7fa', padding: '1rem', borderRadius: '5px' }}>
                    <p>Your submission is complete and under validation. Please check the Admission Exam Details page for further updates.</p>
                  </div>
                )}
                {(admissionAdminFirstStatus === 'Approved' || admissionAdminFirstStatus === 'Rejected') && (
                  <div style={{
                    margin: '1rem 0',
                    color: '#333',
                    fontSize: '14px',
                    backgroundColor: admissionAdminFirstStatus === 'Approved' ? '#e0f7fa' : '#ffebee',
                    padding: '1rem',
                    borderRadius: '5px'
                  }}>
                    <p>
                      Your admission requirements have been {admissionAdminFirstStatus.toLowerCase()}.
                      The details are now available on the{' '}
                      <Link
                        to="/scope-admission-exam-details"
                        style={{ color: '#2A67D5', textDecoration: 'underline' }}
                        onClick={(e) => {
                          e.preventDefault();
                          handleNavigation('/scope-admission-exam-details');
                        }}
                      >
                        Admission Exam Details
                      </Link>{' '}
                      page.
                    </p>
                  </div>
                )}
                <div className="personal-info-section">
                  <div className="personal-info-header">
                    <FontAwesomeIcon
                      icon={faFileAlt}
                      style={{ color: '#212121' }}
                    />
                    <h3>{isSubmitted ? 'View Requirements' : 'Upload Requirements'}</h3>
                  </div>
                  <div className="personal-info-divider"></div>
                  {!isSubmitted && (
                    <div className="reminder-box">
                      <p>
                        <strong>Reminders:</strong> When uploading requirements:
                        <ul style={{ paddingLeft: '20px', margin: '5px 0 0 0', listStyleType: 'disc' }}>
                          <li>Verification system will check your uploaded documents for authenticity, completeness, and accuracy.</li>
                          <li>All documents must be marked as verified by Feedback to continue admission application.</li>
                          <li>It only accepts an image (PNG or JPG) and PDF file.</li>
                          <li>Size of each uploaded file must not exceed 10MB.</li>
                          <li>You can only upload one (1) file per requirement.</li>
                        </ul>
                      </p>
                    </div>
                  )}
                  <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
                    <table
                      style={{
                        width: '100%',
                        borderCollapse: 'separate',
                        borderSpacing: '0',
                        border: '1px solid #2A67D5',
                        backgroundColor: '#CFE0FF',
                        borderRadius: '8px',
                        overflow: 'hidden',
                      }}
                    >
                      <thead>
                        <tr style={{ backgroundColor: '#2A67D5', color: 'white' }}>
                          {!isSubmitted && (
                            <th
                              style={{
                                padding: '12px',
                                textAlign: 'left',
                                fontSize: '13px',
                                fontWeight: 'bold',
                                borderBottom: '1px solid #A2A2A2',
                              }}
                            >
                              Actions
                            </th>
                          )}
                          <th
                            style={{
                              padding: '12px',
                              textAlign: 'left',
                              fontSize: '13px',
                              fontWeight: 'bold',
                              borderBottom: '1px solid #A2A2A2',
                            }}
                          >
                            Requirement
                          </th>
                          <th
                            style={{
                              padding: '12px',
                              textAlign: 'left',
                              fontSize: '13px',
                              fontWeight: 'bold',
                              borderBottom: '1px solid #A2A2A2',
                            }}
                          >
                            Submitted Copy
                          </th>
                          <th
                            style={{
                              padding: '12px',
                              textAlign: 'left',
                              fontSize: '13px',
                              fontWeight: 'bold',
                              borderBottom: '1px solid #A2A2A2',
                            }}
                          >
                            Waived
                          </th>
                          <th
                            style={{
                              padding: '12px',
                              textAlign: 'left',
                              fontSize: '13px',
                              fontWeight: 'bold',
                              borderBottom: '1px solid #A2A2A2',
                            }}
                          >
                            Feedback
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {requirements.map((req) => (
                          <tr
                            key={req.id}
                            style={{
                              backgroundColor: 'white',
                              transition: 'background-color 0.2s',
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor = '#f8f9fa')
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor = 'white')
                            }
                          >
                            {!isSubmitted && (
                              <td style={{ padding: '12px', verticalAlign: 'top' }}>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <label
                                    style={{
                                      cursor: 'pointer',
                                      backgroundColor: '#00245A',
                                      color: 'white',
                                      padding: '6px 12px',
                                      borderRadius: '6px',
                                      fontSize: '12px',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '5px',
                                    }}
                                  >
                                    <FontAwesomeIcon icon={faUpload} />
                                    Upload
                                    <input
                                      type="file"
                                      accept=".png,.jpg,.jpeg,.pdf"
                                      style={{ display: 'none' }}
                                      onChange={(e) => handleFileUpload(req.id, e)}
                                      disabled={req.waived || isSubmitted}
                                    />
                                  </label>
                                </div>
                              </td>
                            )}
                            <td
                              style={{
                                padding: '12px',
                                fontSize: '12px',
                                verticalAlign: 'top',
                              }}
                            >
                              {req.name}
                            </td>
                            <td
                              style={{
                                padding: '12px',
                                fontSize: '12px',
                                verticalAlign: 'top',
                              }}
                            >
                              {req.submitted && !req.waived ? (
                                <button
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#2A67D5',
                                    fontSize: '14px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                  }}
                                  onClick={() => handleViewDocument(req.id)}
                                >
                                  <FontAwesomeIcon icon={faEye} /> {req.submitted}
                                </button>
                              ) : (
                                '-'
                              )}
                            </td>
                            <td
                              style={{
                                padding: '12px',
                                fontSize: '12px',
                                verticalAlign: 'top',
                              }}
                            >
                              {req.waived ? (
                                <FontAwesomeIcon
                                  icon={faCheck}
                                  style={{ color: '#34A853' }}
                                />
                              ) : (
                                '-'
                              )}
                            </td>
                            <td
                              style={{
                                padding: '12px',
                                fontSize: '12px',
                                verticalAlign: 'top',
                                whiteSpace: 'pre-line',
                              }}
                              dangerouslySetInnerHTML={{ __html: req.feedback }}
                            />
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ display: 'none' }}>
                    {requirements.map((req) => (
                      <DocumentVerification
                        key={req.id}
                        file={files[req.id]}
                        requirementType={getVerificationType(req.name)}
                        onVerificationComplete={(result) =>
                          handleVerificationComplete(req.id, result)
                        }
                      />
                    ))}
                  </div>
                  {!isSubmitted && (
                    <div
                      style={{
                        display: 'flex',
                        gap: '10px',
                        marginTop: '1rem',
                        flexWrap: 'wrap',
                      }}
                    >
                      <button
                        style={{
                          backgroundColor: '#00245A',
                          color: 'white',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          border: 'none',
                          cursor: isSubmitted ? 'not-allowed' : 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                        onClick={handleWaiveCredentials}
                        disabled={isSubmitted}
                      >
                        <FontAwesomeIcon icon={faFileAlt} />
                        Waive Credentials
                      </button>
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
                        onClick={handlePrintWaiver}
                      >
                        <FontAwesomeIcon icon={faPrint} />
                        Print Waiver
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
                      style={{
                        backgroundColor: (requirements.every(
                          (req) => req.waived || (req.submitted && req.feedback.includes('Verified'))
                        ) || admissionAdminFirstStatus === 'Approved' || admissionAdminFirstStatus === 'Rejected') ? '#34A853' : '#d3d3d3',
                        cursor: (requirements.every(
                          (req) => req.waived || (req.submitted && req.feedback.includes('Verified'))
                        ) || admissionAdminFirstStatus === 'Approved' || admissionAdminFirstStatus === 'Rejected') ? 'pointer' : 'not-allowed',
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
      {showConfirmModal && (
        <div className="scope-modal-overlay">
          <div className="scope-confirm-modal">
            <h3>Confirm Submission</h3>
            <p>
              You are about to submit your admission requirements. Once submitted, you cannot make changes. Are you sure you want to proceed?
            </p>
            <div className="scope-modal-buttons">
              <button
                className="scope-modal-cancel"
                onClick={handleCancelSubmit}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                className={`scope-modal-confirm ${isSubmitting ? 'scope-modal-button-loading' : ''}`}
                onClick={handleConfirmSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin className="scope-modal-spinner" />
                    <span>Processing...</span>
                  </>
                ) : (
                  'Submit'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      <WaiverFormModal
        isOpen={showWaiverModal}
        onClose={() => setShowWaiverModal(false)}
        onSubmit={handleWaiverSubmit}
        requirements={requirements}
        userData={userData}
      />
    </div>
  );
}

export default ScopeAdmissionRequirements;