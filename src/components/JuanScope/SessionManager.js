import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../css/JuanScope/SessionManager.css'; // Create this CSS file for styling

const SessionManager = ({ children }) => {
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(60); // 60 seconds for warning period

  const INACTIVITY_LIMIT = 5 * 60 * 1000; // 5 minutes in milliseconds
  const WARNING_DURATION = 60 * 1000; // 1 minute in milliseconds

  let inactivityTimer = null;
  let warningTimer = null;

  const resetInactivityTimer = () => {
    clearTimeout(inactivityTimer);
    clearInterval(warningTimer);
    setShowWarning(false);
    setRemainingTime(60);

    inactivityTimer = setTimeout(() => {
      setShowWarning(true);
      startWarningTimer();
    }, INACTIVITY_LIMIT);
  };

  const startWarningTimer = () => {
    warningTimer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(warningTimer);
          handleLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Replace the handleLogout function
  const handleLogout = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      const createdAt = localStorage.getItem('createdAt');

      if (userEmail) {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/enrollee-applicants/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: userEmail,
            createdAt: createdAt,
          }),
        });

        if (response.ok) {
          localStorage.clear();
          navigate('/scope-login', { state: { sessionExpired: true } });
        }
      }
    } catch (err) {
      console.error('Logout error:', err);
      localStorage.clear();
      navigate('/scope-login', { state: { sessionExpired: true } });
    }
  };

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

    const handleUserActivity = () => {
      resetInactivityTimer();
    };

    events.forEach((event) => {
      window.addEventListener(event, handleUserActivity);
    });

    resetInactivityTimer();

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
      clearTimeout(inactivityTimer);
      clearInterval(warningTimer);
    };
  }, []);

  return (
    <>
      {children}
      {showWarning && (
        <div className="session-warning-modal-overlay">
          <div className="session-warning-modal">
            <h3>Session Timeout Warning</h3>
            <p>Your session will expire in {remainingTime} seconds due to inactivity.</p>
            <p>Please make any movement to continue your session.</p>
          </div>
        </div>
      )}
    </>
  );
};

export default SessionManager;