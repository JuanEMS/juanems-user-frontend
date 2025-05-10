import React, { useState, useEffect } from 'react';
import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
  MdCircle
} from "react-icons/md";
import { FaUser } from "react-icons/fa";
import '../../css/UserAdmin/NoticeBoard.css';

const NoticeBoard = () => {
  const [notices, setNotices] = useState([]);
  const [currentNoticeIndex, setCurrentNoticeIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    const fetchNotices = async () => {
      setLoading(true);
      setError(null);
      setDebugInfo(null);

      // Get user role from localStorage
      const userRole = localStorage.getItem('role');
      console.log("Current user role:", userRole);

      // Determine which audience this role has access to
      const accessibleAudiences = getRoleAccessMap(userRole);
      console.log("Accessible audiences:", accessibleAudiences);

      // Make sure the API URL is correctly configured
      const apiUrl = `${process.env.REACT_APP_API_URL}/api/announcements/all`;
      console.log("Fetching from:", apiUrl);

      try {
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          // If you're using credentials/cookies for auth
          // credentials: 'include'
        });

        console.log("Response status:", response.status);

        // Always get the response as text first for reliable debugging
        const responseText = await response.text();

        let responseBody;
        try {
          // Then try to parse as JSON if possible
          responseBody = responseText ? JSON.parse(responseText) : null;
        } catch (e) {
          console.error("Failed to parse response as JSON:", e);
          responseBody = responseText;
        }

        // Store debug info for troubleshooting
        setDebugInfo({
          status: response.status,
          statusText: response.statusText,
          contentType: response.headers.get("content-type"),
          responseBody: responseBody
        });

        if (!response.ok) {
          throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }

        // Process data with better error handling
        if (responseBody && responseBody.success === true) {
          if (responseBody.announcements && Array.isArray(responseBody.announcements)) {
            console.log("Successfully received announcements:", responseBody.announcements.length);

            // Filter active announcements that are currently valid and match user's role access
            const now = new Date();
            const accessibleAnnouncements = responseBody.announcements.filter(announcement => {
              const startDate = new Date(announcement.startDate);
              const endDate = new Date(announcement.endDate);

              // Check if announcement is active and within date range
              const isActive = announcement.status === "Active" &&
                startDate <= now &&
                endDate >= now;

              // Enhanced debugging for each announcement
              // console.log(`Announcement: ${announcement.subject}`);
              // console.log(`  - Audience: ${announcement.audience}`);
              // console.log(`  - Status: ${announcement.status}`);
              // console.log(`  - Date range: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`);
              // console.log(`  - Is active date range: ${isActive}`);
              // console.log(`  - Is accessible audience: ${accessibleAudiences.includes(announcement.audience)}`);

              // Check if user has access to this announcement based on audience
              const hasAccess = accessibleAudiences.includes(announcement.audience);

              const shouldShow = isActive && hasAccess;
              console.log(`  - Should show: ${shouldShow}`);

              return shouldShow;
            });

            console.log(`Filtered to ${accessibleAnnouncements.length} accessible announcements for role: ${userRole}`);

            // Format the announcements with safe property access
            const formatted = accessibleAnnouncements.map(announcement => ({
              id: announcement._id || "unknown-id",
              title: announcement.subject || "No Title",
              message: announcement.content || "No Content",
              postedBy: announcement.announcer || "Unknown",
              postedDate: announcement.createdAt
                ? new Date(announcement.createdAt).toLocaleString()
                : "Unknown Date",
              type: announcement.priority || "normal",
              audience: announcement.audience || "All Users"
            }));

            setNotices(formatted);
          } else {
            console.error("No announcements array in response:", responseBody);
            setError("Server response is missing announcements data");
          }
        } else {
          console.error("API returned error:", responseBody);
          setError(responseBody?.message || "Unknown server error");
        }
      } catch (error) {
        console.error("Error fetching notices:", error);
        setError(`Failed to load announcements: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  // Function to determine which audiences a role has access to
  const getRoleAccessMap = (role) => {
    // Map role to accessible audience types
    // This mapping is based on your provided role access definition
    switch (role) {
      case 'Student':
        return ['Students', 'All Users'];
      case 'Faculty':
        return ['Faculty', 'Staffs', 'All Users'];
      case 'Admissions (Staff)':
        return ['Admissions', 'Staffs', 'All Users'];
      case 'Registrar (Staff)':
        return ['Registrar', 'Staffs', 'All Users'];
      case 'Accounting (Staff)':
        return ['Accounting', 'Staffs', 'All Users'];
      case 'Administration (Sub-Admin)':
        return ['Administration', 'Staffs', 'All Users'];
      case 'IT (Super Admin)':
        return ['All Users', 'Students', 'Faculty', 'Applicants', 'Staffs', 'Admissions', 'Registrar', 'Accounting', 'IT', 'Administration'];
      default:
        // For unknown roles or applicants, only show All Users and Applicants announcements
        return ['Applicants', 'All Users'];
    }
  };

  const handlePrevious = () => {
    setCurrentNoticeIndex(prev =>
      prev === 0 ? notices.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentNoticeIndex(prev =>
      prev === notices.length - 1 ? 0 : prev + 1
    );
  };

  // Show debug panel if there's an error
  const renderDebugPanel = () => {
    if (!debugInfo && !error) return null;

    return (
      <div className="debug-panel" style={{
        margin: '10px',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        background: '#f8f8f8',
        fontSize: '12px',
        overflow: 'auto',
        maxHeight: '300px'
      }}>
        <h4>Debug Information</h4>
        <p><strong>User Role:</strong> {localStorage.getItem('role') || 'Not set'}</p>
        {error && (
          <div style={{ color: 'red', marginBottom: '10px' }}>
            <strong>Error:</strong> {error}
          </div>
        )}
        {debugInfo && (
          <>
            <p><strong>Status:</strong> {debugInfo.status} {debugInfo.statusText}</p>
            <p><strong>Content-Type:</strong> {debugInfo.contentType}</p>
            <p><strong>API URL:</strong> {process.env.REACT_APP_API_URL}/api/announcements/all</p>
            <p><strong>Response:</strong></p>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {typeof debugInfo.responseBody === 'string'
                ? debugInfo.responseBody
                : JSON.stringify(debugInfo.responseBody, null, 2)
              }
            </pre>
          </>
        )}
      </div>
    );
  };

  if (loading) {
    return <div className="noticeboard"><p>Loading notices...</p></div>;
  }

  if (error) {
    return (
      <div className="noticeboard">
        <p className="error-message" style={{ color: 'red' }}>{error}</p>
        {renderDebugPanel()}
      </div>
    );
  }

  if (notices.length === 0) {
    return (
      <div className="noticeboard">
        <p>No announcements available at this time.</p>
        {renderDebugPanel()}
      </div>
    );
  }

  const currentNotice = notices[currentNoticeIndex];

  return (
    <div className="noticeboard">
      <div className="notification-count">{notices.length}</div>

      <div className="noticeboard-header">
        <p className="subheading">Notice Board</p>
        <div className="arrows">
          <div className="arrow-btn" onClick={handlePrevious}>
            <MdOutlineKeyboardArrowLeft />
          </div>
          <div className="arrow-btn" onClick={handleNext}>
            <MdOutlineKeyboardArrowRight />
          </div>
        </div>
      </div>

      <div className="divider" />

      <div className="notice-item">
        <div className={`notice-badge ${currentNotice.type === 'important' ? 'urgent' : currentNotice.type === 'info' ? 'info' : ''}`}>
          {currentNotice.type?.toUpperCase() || 'NOTICE'}
        </div>

        <h3 className="notice-title">{currentNotice.title}</h3>
        <p className="notice-message">{currentNotice.message}</p>

        <div className="postedby">
          <div className="postedby-pfp">
            <FaUser style={{ fontSize: '1.5rem', color: '#95a5a6' }} />
          </div>
          <div className="postedby-descrip">
            <p className="postedby-name">{currentNotice.postedBy}</p>
            <p>{currentNotice.postedDate}</p>
          </div>
        </div>

        <p className="audience-tag" style={{
          fontSize: '0.8rem',
          color: '#666',
          fontStyle: 'italic',
          marginTop: '8px'
        }}>
          For: {currentNotice.audience}
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
        {notices.map((_, index) => (
          <MdCircle
            key={index}
            style={{
              margin: '0 4px',
              fontSize: '10px',
              color: index === currentNoticeIndex ? '#3498db' : '#ddd',
              cursor: 'pointer'
            }}
            onClick={() => setCurrentNoticeIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default NoticeBoard;