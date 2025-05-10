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
  
  // Add state to track active tab
  const [activeTab, setActiveTab] = useState('main'); // 'main' or 'skipped'
  
  // Sample queue data
  const queueItems = [
    { id: 1, number: 'AAB', time: '10:15 AM', current: true },
    { id: 2, number: 'AAC', time: '10:18 AM' },
    { id: 3, number: 'AAD', time: '10:25 AM' },
    { id: 4, number: 'AAE', time: '10:30 AM' },
    { id: 5, number: 'AAF', time: '10:35 AM' },
    { id: 6, number: 'AAG', time: '10:40 AM' },
    { id: 7, number: 'AAH', time: '10:45 AM' },
    { id: 8, number: 'AAI', time: '10:50 AM' },
  ];

  // Sample skipped queue items
  const skippedItems = [
    { id: 101, number: 'XYZ', time: '9:45 AM' },
    { id: 102, number: 'ABC', time: '9:50 AM' }
  ];

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
          <div className="column">
            <h2>Currently Serving</h2>
            <h1>Queue No.</h1>
            <div className="queue-token-container">
              <h1>XXX</h1>
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
          
          <div className="column">
            <div className='queue-button-container'>
              <div className='queue-button'>History</div>
              <div className='queue-button'>Remove</div>
              <div className='queue-button'>Transfer</div>
              <div className='queue-button'>Skip</div>
              <div className='queue-button'>Notify</div>
              <div className='queue-button'>Done</div>
            </div>
          </div>
          
          <div className="column">
            <div className='queue-list-container'>
              <div className='queue-list-header'>
                <div>Waiting List (22)</div>
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
                  <button className="add-button">
                    <AddIcon /> Add Queue
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ManageQueuePage;