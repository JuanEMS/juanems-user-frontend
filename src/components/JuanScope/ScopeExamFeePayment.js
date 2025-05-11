import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faArrowLeft, faMoneyBillWave, faPrint, faSpinner } from '@fortawesome/free-solid-svg-icons';
import SJDEFILogo from '../../images/SJDEFILogo.png';
import '../../css/JuanScope/ScopeRegistration1.css';
import SideNavigation from './SideNavigation';

function ScopeExamFeePayment() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState({});
  const [registrationStatus, setRegistrationStatus] = useState('Incomplete');
  const [admissionRequirementsStatus, setAdmissionRequirementsStatus] = useState('Incomplete');
  const [admissionAdminFirstStatus, setAdmissionAdminFirstStatus] = useState('On-going');
  const [admissionExamDetailsStatus, setAdmissionExamDetailsStatus] = useState('Incomplete');
  const [examDetails, setExamDetails] = useState({
    approvedExamFeeStatus: 'Required',
    approvedExamFeeAmount: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

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

        let admissionData;
        try {
          admissionData = await fetchWithRetry(
            `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/admission-requirements/${userEmail}`
          );
          setAdmissionRequirementsStatus(admissionData.admissionRequirementsStatus || 'Incomplete');
          setAdmissionAdminFirstStatus(admissionData.admissionAdminFirstStatus || applicantData.admissionAdminFirstStatus || 'On-going');
        } catch (err) {
          setAdmissionRequirementsStatus('Incomplete');
        }

        try {
          const examDetailsData = await fetchWithRetry(
            `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/exam-details/${userEmail}`
          );
          if (examDetailsData.message && examDetailsData.admissionAdminFirstStatus === 'On-going') {
            setError('Exam fee details are not yet available. Your application is under review.');
            setExamDetails({
              approvedExamFeeStatus: 'Required',
              approvedExamFeeAmount: null,
            });
            setAdmissionExamDetailsStatus('Incomplete');
          } else {
            setExamDetails({
              approvedExamFeeStatus: examDetailsData.approvedExamFeeStatus || 'Required',
              approvedExamFeeAmount: examDetailsData.approvedExamFeeAmount,
            });
            setAdmissionExamDetailsStatus(examDetailsData.admissionExamDetailsStatus || 'Incomplete');
          }
          setAdmissionAdminFirstStatus(
            examDetailsData.admissionAdminFirstStatus ||
            admissionData?.admissionAdminFirstStatus ||
            applicantData.admissionAdminFirstStatus ||
            'On-going'
          );
        } catch (err) {
          if (err.message.includes('404')) {
            setError('Exam fee details not found. Your application may not have fee details assigned yet.');
            setAdmissionExamDetailsStatus('Incomplete');
          } else if (err.message.includes('NetworkError')) {
            setError('Network error. Please check your internet connection and try again.');
          } else {
            setError('Failed to load exam fee details. Please try again later or contact support.');
          }
        }

        if (applicantData.registrationStatus !== 'Complete') {
          navigate('/scope-registration-6');
          return;
        }

        if (admissionData?.admissionRequirementsStatus !== 'Complete') {
          navigate('/scope-admission-requirements');
          return;
        }

        // Check for redirect from PayMongo
        const query = new URLSearchParams(location.search);
        const email = query.get('email') || userEmail;
        const checkoutId = localStorage.getItem('checkoutId');
        if (checkoutId && email) {
          verifyPayment(email);
        } else {
          localStorage.removeItem('checkoutId');
        }

        setLoading(false);
      } catch (err) {
        setError('Failed to load user data. Please check your connection and try again.');
        setLoading(false);
      }
    };

    fetchData();
    const refreshInterval = setInterval(fetchData, 2 * 60 * 1000);
    return () => clearInterval(refreshInterval);
  }, [navigate, location]);

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
    navigate('/scope-admission-exam-details');
  };

  const handleProceedToPayment = async () => {
    if (!termsAgreed) {
      setError('You must agree to the Terms & Conditions and Data Privacy Policy.');
      return;
    }
    if (!examDetails.approvedExamFeeAmount) {
      setError('Exam fee amount is not available.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/payments/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          amount: examDetails.approvedExamFeeAmount,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment link');
      }

      localStorage.setItem('checkoutId', data.checkoutId);
      window.open(data.checkoutUrl, '_blank');
      setLoading(false);
    } catch (err) {
      setError(`Payment initiation failed: ${err.message}`);
      setLoading(false);
    }
  };

  const verifyPayment = async (email) => {
    const checkoutId = localStorage.getItem('checkoutId');
    if (!checkoutId || !email) {
      setError('No payment session or email found. Please initiate payment again.');
      setLoading(false);
      localStorage.removeItem('checkoutId');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/payments/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          checkoutId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify payment');
      }

      if (data.status === 'successful') {
        setPaymentStatus('success');
        setExamDetails((prev) => ({
          ...prev,
          approvedExamFeeStatus: 'Paid',
        }));
        localStorage.removeItem('checkoutId');
      } else if (data.status === 'pending') {
        // For pending, clear checkoutId and don't show a message
        setPaymentStatus(null);
        localStorage.removeItem('checkoutId');
      } else {
        setPaymentStatus(data.status);
        setError(`Previous payment attempt ${data.status}. Please try again.`);
        localStorage.removeItem('checkoutId');
      }
    } catch (err) {
      setError(`Payment verification failed: ${err.message}`);
      setPaymentStatus('failed');
      localStorage.removeItem('checkoutId');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintPermit = () => {
    alert('Print permit functionality is not yet implemented.');
  };

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
          approvedExamFeeStatus={examDetails.approvedExamFeeStatus} // Add this prop
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
              <h2 className="registration-title">Exam Fee Payment</h2>
              <div className="registration-divider"></div>
              <div className="registration-container">
                <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '1.5rem' }}>
                  To secure your exam and interview, a non-refundable exam fee must be paid.
                </div>
                <div className="personal-info-section">
                  <div className="personal-info-header">
                    <FontAwesomeIcon icon={faMoneyBillWave} style={{ color: '#212121' }} />
                    <h3>Payment Summary</h3>
                  </div>
                  <div className="personal-info-divider"></div>
                  <div className="reminder-box">
                    <p>
                      <strong>Reminders:</strong> A non-refundable exam fee is required to secure a slot. Student is not required to pay if the exam fee status is waived or already paid. Payments can be made at the Accounting Office or through our online payment.
                    </p>
                  </div>
                  {paymentStatus === 'success' && (
                    <div style={{ marginTop: '1rem', fontSize: '14px', color: '#34A853' }}>
                      <p>Payment successful! You can now print your permit.</p>
                    </div>
                  )}
                  {(paymentStatus === 'failed' || paymentStatus === 'expired' || paymentStatus === 'cancelled') && (
                    <div style={{ marginTop: '1rem', fontSize: '14px', color: '#D32F2F' }}>
                      <p>Previous payment attempt {paymentStatus}. Please try again.</p>
                    </div>
                  )}
                  {['Waived', 'Paid'].includes(examDetails.approvedExamFeeStatus) ? (
                    <div style={{ marginTop: '1rem', fontSize: '14px', color: '#333' }}>
                      <p>
                        Since your Exam Fee Status is {examDetails.approvedExamFeeStatus}, you can print your permit. Best of luck!
                      </p>
                    </div>
                  ) : (
                    <>
                      <div
                        style={{
                          backgroundColor: '#D2D2D2',
                          borderRadius: '8px',
                          padding: '1rem',
                          marginTop: '1rem',
                          fontSize: '14px',
                          color: '#333',
                        }}
                      >
                        <strong>Exam Fee Amount:</strong>{' '}
                        {examDetails.approvedExamFeeAmount != null
                          ? `₱${examDetails.approvedExamFeeAmount.toFixed(2)}`
                          : 'N/A'}
                      </div>
                      <div style={{ marginTop: '1.5rem', fontSize: '14px' }}>
                        <p>
                          You will be redirected to a secure payment page in a new tab where you can choose your preferred payment method (e.g., Credit Card, GCash).
                        </p>
                        <p>
                          Before proceeding to payment, please read the full{' '}
                          <a
                            href="/terms-of-use"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#00245A', textDecoration: 'underline' }}
                          >
                            Terms & Conditions
                          </a>{' '}
                          and{' '}
                          <a
                            href="/privacy"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#00245A', textDecoration: 'underline' }}
                          >
                            Data Privacy Policy
                          </a>:
                        </p>
                        <div className="checkbox-container" style={{ marginTop: '0.5rem' }}>
                          <input
                            type="checkbox"
                            checked={termsAgreed}
                            onChange={() => setTermsAgreed(!termsAgreed)}
                          />
                          <label>
                            I agree to the Terms & Conditions and Data Privacy Policy.
                          </label>
                        </div>
                      </div>
                    </>
                  )}
                  <div className="form-buttons" style={{ marginTop: '1.5rem' }}>
                    <button type="button" className="back-button" onClick={handleBack}>
                      <FontAwesomeIcon icon={faArrowLeft} />
                      Back
                    </button>
                    {examDetails.approvedExamFeeStatus === 'Required' && (
                      <button
                        type="button"
                        className="next-button"
                        onClick={handleProceedToPayment}
                        disabled={loading || !termsAgreed}
                        style={{
                          backgroundColor: loading || !termsAgreed ? '#d3d3d3' : '#34A853',
                          cursor: loading || !termsAgreed ? 'not-allowed' : 'pointer',
                        }}
                      >
                        Proceed to Payment
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

export default ScopeExamFeePayment;