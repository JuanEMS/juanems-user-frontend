import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faXmark } from '@fortawesome/free-solid-svg-icons';
import '../../css/JuanScope/PasswordNotification.css';

function PasswordNotification() {
  const location = useLocation();
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Check if we came from verification with valid state
    if (location.state?.fromVerification) {
      setShowNotification(true);
    }
  }, [location.state]);

  const handleClose = () => {
    setShowNotification(false);
  };

  if (!showNotification) return null;

  // Fallback check to ensure valid state
  if (!location.state?.fromVerification) {
    return (
      <div className="password-notification-modal-overlay">
        <div className="password-notification-modal">
          <button className="password-notification-close-btn" onClick={handleClose}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
          <div className="password-notification-content">
            <FontAwesomeIcon icon={faXmark} className="password-notification-icon error" />
            <h4>Invalid Notification</h4>
            <p>Unable to display notification. Please try again.</p>
          </div>
          <div className="password-notification-actions">
            <button 
              className="password-notification-confirm-btn"
              onClick={handleClose}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="password-notification-modal-overlay">
      <div className="password-notification-modal">
        <button className="password-notification-close-btn" onClick={handleClose}>
          <FontAwesomeIcon icon={faXmark} />
        </button>
        <div className="password-notification-content">
          <FontAwesomeIcon icon={faCheckCircle} className="password-notification-icon" />
          <h4>Account Verified Successfully!</h4>
          <p>
            Your account credentials have been sent to your registered email address.
          </p>
        </div>
        <div className="password-notification-actions">
          <button 
            className="password-notification-confirm-btn"
            onClick={handleClose}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

export default PasswordNotification;