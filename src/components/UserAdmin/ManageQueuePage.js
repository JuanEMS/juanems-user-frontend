import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import utc from 'dayjs/plugin/utc';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";

import '../../css/UserAdmin/Global.css';
import '../../css/UserAdmin/ManageQueuePage.css';

import Footer from './Footer';
import Header from './Header';
import AddQueueModal from './AddQueueModal';

dayjs.extend(utc);
dayjs.extend(isBetween);

const AddIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const ManageQueuePage = () => {
  const navigate = useNavigate();
  const handleBack = () => navigate('/admin/dashboard');
  
  // Add state for modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Add state to track active tab
  const [activeTab, setActiveTab] = useState('main'); // 'main' or 'skipped'
  
  // Sample queue data
  const [queueItems, setQueueItems] = useState([
    { id: 1, number: 'AAB', time: '10:15 AM', current: true, name: 'John Smith', mobileNumber: '98765432' },
    { id: 2, number: 'AAC', time: '10:18 AM', name: 'Alice Johnson', mobileNumber: '91234567' },
    { id: 3, number: 'AAD', time: '10:25 AM', name: 'Bob Williams', mobileNumber: '98123456' },
    { id: 4, number: 'AAE', time: '10:30 AM', name: 'Carol Brown', mobileNumber: '87654321' },
    { id: 5, number: 'AAF', time: '10:35 AM', name: 'David Miller', mobileNumber: '90123456' },
    { id: 6, number: 'AAG', time: '10:40 AM', name: 'Emma Davis', mobileNumber: '81234567' },
    { id: 7, number: 'AAH', time: '10:45 AM', name: 'Frank Wilson', mobileNumber: '96543210' },
    { id: 8, number: 'AAI', time: '10:50 AM', name: 'Grace Lee', mobileNumber: '85432109' },
  ]);

  // Sample skipped queue items
  const [skippedItems, setSkippedItems] = useState([
    { id: 101, number: 'XYZ', time: '9:45 AM', name: 'Michael Taylor', mobileNumber: '90876543' },
    { id: 102, number: 'ABC', time: '9:50 AM', name: 'Sophie Wong', mobileNumber: '81239876' }
  ]);

  // Function to generate the next queue number
  const generateQueueNumber = () => {
    const lastQueue = queueItems[queueItems.length - 1];
    if (!lastQueue) return 'AAA';
    
    let lastChar = lastQueue.number.charAt(2);
    let middleChar = lastQueue.number.charAt(1);
    let firstChar = lastQueue.number.charAt(0);
    
    if (lastChar === 'Z') {
      lastChar = 'A';
      if (middleChar === 'Z') {
        middleChar = 'A';
        firstChar = String.fromCharCode(firstChar.charCodeAt(0) + 1);
      } else {
        middleChar = String.fromCharCode(middleChar.charCodeAt(0) + 1);
      }
    } else {
      lastChar = String.fromCharCode(lastChar.charCodeAt(0) + 1);
    }
    
    return `${firstChar}${middleChar}${lastChar}`;
  };

  // Function to add a new queue item
  const handleAddQueue = (guestInfo) => {
    const currentTime = dayjs().format('h:mm A');
    const newQueueNumber = generateQueueNumber();
    
    const newQueueItem = {
      id: queueItems.length + 1000, // Just to ensure unique ID
      number: newQueueNumber,
      time: currentTime,
      name: guestInfo.name,
      mobileNumber: guestInfo.mobileNumber
    };
    
    setQueueItems([...queueItems, newQueueItem]);
  };

  // Determine which items to display based on active tab
  const displayItems = activeTab === 'main' ? queueItems : skippedItems;

  return (
    <div className="main main-container">
      <Header />
      <div className="main-content">
        <div className="page-title">
          <div className="arrows" onClick={handleBack}>
            <MdOutlineKeyboardArrowLeft/>
          </div>
          <p className="heading">Manage Queue</p>
        </div>
        
        <div className="container-columns">
          <div className="queue-column">
            <h2>Currently Serving</h2>
            <h1>Queue No.</h1>
            <div className="queue-token-container">
              <h1>{queueItems.find(item => item.current)?.number || 'XXX'}</h1>
            </div>
            <h2>Serving Time</h2>
            <h2>00:30:00</h2>
            <div className="queue-details-container">
              <div className="queue-details-box">
                <h2>Served Queue</h2>
                <h2>12</h2>
              </div>
              <div className="vertical-divider" />
              <div className="queue-details-box">
                <h2>Avg Serving Time</h2>
                <h2>5.2 min</h2>
              </div>
            </div>
          </div>
          
          <div className="queue-column">
            <div className='queue-button-container'>
              <div className='queue-button'>History</div>
              <div className='queue-button'>Remove</div>
              <div className='queue-button'>Transfer</div>
              <div className='queue-button'>Skip</div>
              <div className='queue-button'>Notify</div>
              <div className='queue-button'>Done</div>
            </div>
          </div>
          
          <div className="queue-column">
            <div className='queue-list-container'>
              <div className='queue-list-header'>
                <div>Waiting List ({activeTab === 'main' ? queueItems.length : skippedItems.length})</div>
                <div className='queue-list-subheader'>
                  {/* Update tabs to use the activeTab state */}
                  <div 
                    className={activeTab === 'main' ? 'active' : ''} 
                    onClick={() => setActiveTab('main')}
                  >
                    Main Queue
                  </div>
                  <div 
                    className={activeTab === 'skipped' ? 'active' : ''} 
                    onClick={() => setActiveTab('skipped')}
                  >
                    Skipped
                  </div>
                </div>
                <div className='queue-list'>
                  {displayItems.map(item => (
                    <div key={item.id} className={`queue-item ${item.current ? 'current' : ''}`}>
                      <div className="queue-number">{item.number}</div>
                      <div className="queue-time">{item.time}</div>
                    </div>
                  ))}
                </div>
                <div className='queue-add-button'>
                  <button className="add-button" onClick={() => setIsModalOpen(true)}>
                    <AddIcon /> Add Queue
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add Queue Modal */}
      <AddQueueModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onAddQueue={handleAddQueue}
      />
      
      <Footer />
    </div>
  );
};

export default ManageQueuePage;