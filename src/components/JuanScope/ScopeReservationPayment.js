import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faArrowLeft, faMoneyBillWave, faSpinner } from '@fortawesome/free-solid-svg-icons';
import SJDEFILogo from '../../images/SJDEFILogo.png';
import '../../css/JuanScope/ScopeRegistration1.css';
import SideNavigation from './SideNavigation';

function ScopeReservationPayment() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState({});
  const [registrationStatus, setRegistrationStatus] = useState('Incomplete');
  const [admissionRequirementsStatus, setAdmissionRequirementsStatus] = useState('Incomplete');
  const [admissionAdminFirstStatus, setAdmissionAdminFirstStatus] = useState('On-going');
  const [preferredExamAndInterviewApplicationStatus, setPreferredExamAndInterviewApplicationStatus] = useState('Incomplete');
  const [admissionExamDetailsStatus, setAdmissionExamDetailsStatus] = useState('Incomplete');
  const [approvedExamFeeStatus, setApprovedExamFeeStatus] = useState('Required');
  const [approvedExamInterviewResult, setApprovedExamInterviewResult] = useState('Pending');
  const [examInterviewResultStatus, setExamInterviewResultStatus] = useState('Incomplete');
  const [reservationDetails, setReservationDetails] = useState({
    reservationFeePaymentStepStatus: 'Incomplete',
    reservationFeeAmountPaid: 0,
  });
  const [voucherStatus, setVoucherStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [showSkipModal, setShowSkipModal] = useState(false);

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

    const fetchPaymentHistory = async () => {
      try {
        const response = await fetchWithRetry(
          `${process.env.REACT_APP_API_URL}/api/payments/history/${userEmail}`
        );
        const payments = response.filter(
          payment => payment.description === 'Reservation Fee Payment' && payment.status === 'successful'
        );
        if (payments.length > 0) {
          setReferenceNumber(payments[0].referenceNumber);
        }
      } catch (err) {
        console.error('Error fetching payment history:', err);
        setError('Failed to load payment history. Please try again later.');
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
          setAdmissionRequirementsStatus('Incomplete');
          admissionData = { admissionRequirementsStatus: 'Incomplete' };
        }

        let examInterviewData;
        try {
          examInterviewData = await fetchWithRetry(
            `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/exam-interview/${userEmail}`
          );
          setPreferredExamAndInterviewApplicationStatus(
            examInterviewData.preferredExamAndInterviewApplicationStatus || 'Incomplete'
          );
        } catch (err) {
          console.error('Error fetching exam interview data:', err);
          setPreferredExamAndInterviewApplicationStatus('Incomplete');
        }

        let examDetailsData = {
          admissionAdminFirstStatus: 'On-going',
          admissionExamDetailsStatus: 'Incomplete',
          approvedExamFeeStatus: 'Required',
          approvedExamInterviewResult: 'Pending',
          examInterviewResultStatus: 'Incomplete',
          reservationFeePaymentStepStatus: 'Incomplete',
          reservationFeeAmountPaid: 0,
        };

        try {
          const examDetailsResponse = await fetchWithRetry(
            `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/exam-details/${userEmail}`
          );

          if (examDetailsResponse.message && examDetailsResponse.admissionAdminFirstStatus === 'On-going') {
            setError('Reservation payment details are not yet available. Your application is under review.');
            setReservationDetails({
              reservationFeePaymentStepStatus: 'Incomplete',
              reservationFeeAmountPaid: 0,
            });
            setAdmissionExamDetailsStatus('Incomplete');
            setApprovedExamFeeStatus('Required');
            setApprovedExamInterviewResult('Pending');
            setExamInterviewResultStatus('Incomplete');
          } else {
            examDetailsData = {
              ...examDetailsData,
              ...examDetailsResponse,
              reservationFeePaymentStepStatus: examDetailsResponse.reservationFeePaymentStepStatus || 'Incomplete',
              reservationFeeAmountPaid: examDetailsResponse.reservationFeeAmountPaid || 0,
              approvedExamInterviewResult: examDetailsResponse.approvedExamInterviewResult || 'Pending',
            };
            setReservationDetails({
              reservationFeePaymentStepStatus: examDetailsData.reservationFeePaymentStepStatus,
              reservationFeeAmountPaid: examDetailsData.reservationFeeAmountPaid,
            });
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
          if (err.message.includes('404')) {
            setError('Reservation payment details not found. Your application may not have details assigned yet.');
          } else if (err.message.includes('NetworkError')) {
            setError('Network error. Please check your internet connection and try again.');
          } else {
            setError('Failed to load reservation payment details. Please try again later or contact support.');
          }
          setReservationDetails({
            reservationFeePaymentStepStatus: examDetailsData.reservationFeePaymentStepStatus,
            reservationFeeAmountPaid: examDetailsData.reservationFeeAmountPaid,
          });
          setAdmissionExamDetailsStatus(examDetailsData.admissionExamDetailsStatus);
          setApprovedExamFeeStatus(examDetailsData.approvedExamFeeStatus);
          setApprovedExamInterviewResult(examDetailsData.approvedExamInterviewResult);
          setExamInterviewResultStatus(examDetailsData.examInterviewResultStatus);
        }

        if (applicantData.registrationStatus !== 'Complete') {
          navigate('/scope-registration-6');
          return;
        }

        if (admissionData.admissionRequirementsStatus !== 'Complete') {
          navigate('/scope-admission-requirements');
          return;
        }

        if (!['Paid', 'Waived'].includes(examDetailsData.approvedExamFeeStatus)) {
          navigate('/scope-exam-fee-payment');
          return;
        }

        if (examDetailsData.examInterviewResultStatus !== 'Complete') {
          navigate('/scope-exam-interview-result');
          return;
        }

        // Fetch payment history if payment is complete
        if (examDetailsData.reservationFeePaymentStepStatus === 'Complete' && examDetailsData.reservationFeeAmountPaid > 0) {
          await fetchPaymentHistory();
        }

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
    navigate('/scope-exam-interview-result');
  };

  const handleSkip = () => {
    setShowSkipModal(true);
  };

  const confirmSkip = async () => {
    try {
      setLoading(true);
      setError('');

      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        throw new Error('User email not found in local storage');
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/enrollee-applicants/update-reservation-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          reservationFeePaymentStepStatus: 'Complete',
          reservationFeeAmountPaid: 0,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update reservation status');
      }

      setReservationDetails({
        reservationFeePaymentStepStatus: 'Complete',
        reservationFeeAmountPaid: 0,
      });
      setLoading(false);
      navigate('/scope-reservation-payment');
    } catch (err) {
      console.error('Skip error:', err);
      setError(`Failed to skip reservation payment: ${err.message}`);
      setLoading(false);
    } finally {
      setShowSkipModal(false);
    }
  };

  const handleProceedToPayment = async () => {
    if (!termsAgreed) {
      setError('You must agree to the Terms & Conditions and Data Privacy Policy.');
      return;
    }
    if (!voucherStatus) {
      setError('Please select your voucher status.');
      return;
    }

    const amount = voucherStatus === 'voucher' ? 500 : 1000;

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
          amount,
          description: 'Reservation Fee Payment',
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
        setReferenceNumber(data.referenceNumber);
        const amount = data.amount;
        setReservationDetails({
          reservationFeePaymentStepStatus: 'Complete',
          reservationFeeAmountPaid: amount,
        });
        navigate('/scope-reservation-payment');
      } else if (data.status === 'pending') {
        setPaymentStatus(null);
        setError('Payment is still pending. Please complete the payment.');
      } else {
        setPaymentStatus(data.status);
        setError(`Previous payment attempt ${data.status}. Please try again.`);
      }
    } catch (err) {
      setError(`Payment verification failed: ${err.message}`);
      setPaymentStatus('failed');
    } finally {
      localStorage.removeItem('checkoutId');
      setLoading(false);
    }
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
              <h2 className="registration-title">Reservation Payment</h2>
              <div className="registration-divider"></div>
              <div className="registration-container">
                <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '1.5rem' }}>
                  To secure your enrollment, a non-refundable reservation fee can be paid. Alternatively, you may skip this step and pay the tuition amount during the tuition payment step.
                </div>
                <div className="reminder-box">
                  <p>
                    <strong>Reminders:</strong> A non-refundable reservation fee is required to secure a slot:
                  </p>
                  <p>SHS Voucher Recipient (From Public School or has PEAC Voucher): ₱500.00</p>
                  <p>SHS Non-Voucher Recipient: ₱1,000.00</p>
                  <p>
                    This amount will be deducted from the total first-semester tuition fee upon enrollment. Payments can be made at the Finance Office or through our online payment.
                  </p>
                </div>
                <div className="personal-info-section">
                  <div className="personal-info-header">
                    <FontAwesomeIcon icon={faMoneyBillWave} style={{ color: '#212121' }} />
                    <h3>Payment Summary</h3>
                  </div>
                  <div className="personal-info-divider"></div>
                  {reservationDetails.reservationFeePaymentStepStatus === 'Complete' ? (
                    <div className="payment-status">
                      {reservationDetails.reservationFeeAmountPaid > 0 ? (
                        <>
                          <p style={{ color: '#34A853' }}>
                            Payment successful! Reservation fee of ₱{reservationDetails.reservationFeeAmountPaid.toFixed(2)} has been paid.
                          </p>
                          {referenceNumber && (
                            <p>
                              <strong>Reference Number:</strong> {referenceNumber}
                            </p>
                          )}
                        </>
                      ) : (
                        <p>You have skipped the reservation payment. You can proceed to the next step.</p>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="voucher-selection">
                        <p>Please select your voucher status:</p>
                        <div className="radio-group">
                          <label>
                            <input
                              type="radio"
                              id="voucher"
                              name="voucherStatus"
                              value="voucher"
                              checked={voucherStatus === 'voucher'}
                              onChange={() => setVoucherStatus('voucher')}
                            />
                            SHS Voucher Recipient (₱500.00)
                          </label>
                          <label>
                            <input
                              type="radio"
                              id="non-voucher"
                              name="voucherStatus"
                              value="non-voucher"
                              checked={voucherStatus === 'non-voucher'}
                              onChange={() => setVoucherStatus('non-voucher')}
                            />
                            SHS Non-Voucher Recipient (₱1,000.00)
                          </label>
                        </div>
                      </div>
                      <div className="fee-amount-container">
                        <strong>Reservation Fee Amount:</strong>{' '}
                        {voucherStatus === 'voucher' ? '₱500.00' : voucherStatus === 'non-voucher' ? '₱1,000.00' : 'Please select voucher status'}
                      </div>
                      <div className="payment-instructions">
                        <p>
                          You will be redirected to a secure payment page in a new tab where you can choose your preferred payment method (e.g., Credit Card, GCash).
                        </p>
                        <p>
                          Before proceeding to payment, please read the full{' '}
                          <a
                            href="/terms-of-use"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link"
                          >
                            Terms & Conditions
                          </a>{' '}
                          and{' '}
                          <a
                            href="/privacy"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link"
                          >
                            Data Privacy Policy
                          </a>:
                        </p>
                        <div className="checkbox-container">
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
                  {(paymentStatus === 'failed' || paymentStatus === 'expired' || paymentStatus === 'cancelled') && (
                    <div className="payment-status error">
                      <p>Previous payment attempt {paymentStatus}. Please try again.</p>
                    </div>
                  )}
                  <div className="form-buttons">
                    <button type="button" className="back-button" onClick={handleBack}>
                      <FontAwesomeIcon icon={faArrowLeft} />
                      Back
                    </button>
                    {reservationDetails.reservationFeePaymentStepStatus !== 'Complete' && (
                      <div className="action-buttons">
                        <button
                          type="button"
                          className="skip-button"
                          onClick={handleSkip}
                        >
                          Skip
                        </button>
                        <button
                          type="button"
                          className="proceed-button"
                          onClick={handleProceedToPayment}
                          disabled={loading || !termsAgreed || !voucherStatus}
                        >
                          Proceed to Payment
                        </button>
                      </div>
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
      {showSkipModal && (
        <div className="scope-modal-overlay">
          <div className="scope-confirm-modal">
            <h3>Confirm Skip Reservation Payment</h3>
            <p>Are you sure you want to skip the reservation payment? This action cannot be undone, and you may need to contact the administration to secure your slot later.</p>
            <div className="scope-modal-buttons">
              <button className="scope-modal-cancel" onClick={() => setShowSkipModal(false)}>
                Cancel
              </button>
              <button className="scope-modal-confirm" onClick={confirmSkip}>
                Confirm Skip
              </button>
            </div>
          </div>
        </div>
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

export default ScopeReservationPayment;