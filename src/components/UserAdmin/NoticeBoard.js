import React, { useState } from 'react';
import { 
  MdOutlineKeyboardArrowLeft, 
  MdOutlineKeyboardArrowRight,
  MdNotifications,
  MdInfo,
  MdCircle
} from "react-icons/md";
import { FaUser } from "react-icons/fa";
import '../../css/UserAdmin/NoticeBoard.css';

const NoticeBoard = () => {
  const [currentNoticeIndex, setCurrentNoticeIndex] = useState(0);
  
  // Sample notices array - in real app, this would come from props or API
  const notices = [
    {
      id: 1,
      title: "Enrollment Period Extended to March 20, 2025",
      message: "Ensure all pending applications are thoroughly reviewed before the new deadline. This includes verifying submitted documents, checking for missing requirements, and updating applicant statuses accordingly.",
      postedBy: "John Doe",
      postedDate: "January 24, 2025 10:25 am",
      type: "important"
    },
    {
      id: 2,
      title: "System Maintenance Scheduled",
      message: "The system will be down for scheduled maintenance on Saturday, February 15, from 10:00 PM to 2:00 AM. Please complete any pending tasks before this time.",
      postedBy: "IT Department",
      postedDate: "February 10, 2025 9:15 am",
      type: "urgent"
    },
    {
      id: 3,
      title: "New Faculty Training Session",
      message: "Training for the updated grading module will be conducted on February 20. All faculty members must attend one of the scheduled sessions.",
      postedBy: "Sarah Johnson",
      postedDate: "February 9, 2025 2:45 pm",
      type: "info"
    },
  ];

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
        <div className={`notice-badge ${currentNotice.type === 'urgent' ? 'urgent' : currentNotice.type === 'info' ? 'info' : ''}`}>
          {currentNotice.type === 'urgent' ? 'URGENT' : 
           currentNotice.type === 'info' ? 'INFO' : 'IMPORTANT'}
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