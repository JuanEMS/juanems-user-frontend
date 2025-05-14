import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import utc from 'dayjs/plugin/utc';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdOutlineKeyboardArrowLeft, MdRefresh } from "react-icons/md";
import { Modal, Input } from 'antd';

import '../../css/UserAdmin/Global.css';
import '../../css/UserAdmin/ManageQueuePage.css';

import Footer from './Footer';
import Header from './Header';
import AddQueueModal from './AddQueueModal';
import { message } from 'antd';

dayjs.extend(utc);
dayjs.extend(isBetween);

const AddIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const RemoveQueueModal = ({
  isOpen,
  onClose,
  onRemove,
  queueToRemove
}) => {
  const [removalReason, setRemovalReason] = useState('');

  const handleRemove = () => {
    onRemove(queueToRemove, removalReason);
    onClose();
  };

  return (
    <Modal
      title="Remove Queue"
      open={isOpen}
      onOk={handleRemove}
      onCancel={onClose}
      okText="Remove"
      okButtonProps={{ danger: true }}
    >
      <p>Are you sure you want to remove queue number {queueToRemove}?</p>
      <Input
        placeholder="Reason for removal (optional)"
        value={removalReason}
        onChange={(e) => setRemovalReason(e.target.value)}
        style={{ marginTop: '16px' }}
      />
    </Modal>
  );
};

const TransferQueueModal = ({
  isOpen,
  onClose,
  onTransfer,
  queueToTransfer
}) => {
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const departments = ['Admissions', 'Registrar', 'Accounting'];

  const handleTransfer = () => {
    if (!selectedDepartment) {
      message.error('Please select a department');
      return;
    }
    onTransfer(queueToTransfer, selectedDepartment, transferReason);
    onClose();
  };

  return (
    <Modal
      title="Transfer Queue"
      open={isOpen}
      onOk={handleTransfer}
      onCancel={onClose}
      okText="Transfer"
      okButtonProps={{ disabled: !selectedDepartment }}
    >
      <p>Select the department to transfer queue number {queueToTransfer}:</p>
      <div style={{ marginBottom: '16px', marginTop: '16px' }}>
        {departments.map((dept) => (
          <div key={dept} style={{ marginBottom: '8px' }}>
            <label>
              <input
                type="radio"
                name="department"
                value={dept}
                checked={selectedDepartment === dept}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                style={{ marginRight: '8px' }}
              />
              {dept}
            </label>
          </div>
        ))}
      </div>
      <Input
        placeholder="Reason for transfer (optional)"
        value={transferReason}
        onChange={(e) => setTransferReason(e.target.value)}
        style={{ marginTop: '16px' }}
      />
    </Modal>
  );
};


const ManageQueuePage = () => {
  const navigate = useNavigate();
  const handleBack = () => navigate('/admin/dashboard');
  const handleHistory = () => navigate('/admin/queue-history');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('main');
  const [department, setDepartment] = useState('');
  const [queueItems, setQueueItems] = useState([]);
  const [currentlyServing, setCurrentlyServing] = useState(null);
  const [servingTime, setServingTime] = useState(0); // in seconds
  const [servingStartTime, setServingStartTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasAcceptedQueue, setHasAcceptedQueue] = useState(false);
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [skippedItems, setSkippedItems] = useState([]);
  const [queueStats, setQueueStats] = useState({
    totalServed: 0,
    avgServingTime: '0.0',
    avgWaitingTime: '0.0'
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Function to check if there is an accepted queue
  const checkAcceptedQueue = (items, serving) => {
    const hasAccepted = items.some(item => item.status === 'accepted');
    return !!serving || hasAccepted;
  };

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin');
      return;
    }

    const userRole = localStorage.getItem('role') || 'ROLE';
    const userDepartment = userRole.replace(/\s*\([^)]*\)\s*/g, '');
    setDepartment(userDepartment);

    // Fetch data on initial load
    fetchAllData(userDepartment);
  }, [navigate]);

  // Single function to fetch all data
  const fetchAllData = async (dept) => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchPendingQueues(dept),
        fetchCurrentlyServing(dept),
        fetchSkippedQueues(dept),
        fetchQueueStatistics(dept)
      ]);
    } catch (err) {
      console.error('Error refreshing data:', err);
      message.error('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Timer for serving time
  useEffect(() => {
    let timer;
    if (currentlyServing && servingStartTime) {
      timer = setInterval(() => {
        const now = Date.now();
        const startTime = new Date(servingStartTime).getTime();
        const elapsedSeconds = Math.floor((now - startTime) / 1000);
        setServingTime(elapsedSeconds);
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [currentlyServing, servingStartTime]);

  // Update hasAcceptedQueue whenever queueItems or currentlyServing changes
  useEffect(() => {
    setHasAcceptedQueue(checkAcceptedQueue(queueItems, currentlyServing));
  }, [queueItems, currentlyServing]);

  // Format seconds to HH:MM:SS
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
  };

  const fetchQueueStatistics = async (dept, selectedDate = null) => {
    try {
      // Helper function to get date in YYYY-MM-DD format using local timezone
      function getLocalDate() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Add 1 since months are 0-indexed
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }

      // Get today's date in YYYY-MM-DD format using local timezone
      const queryDate = selectedDate || getLocalDate();
      console.log(`Fetching queue statistics for department: ${dept}, date: ${queryDate}`);

      // Build the URL with query parameters
      const url = new URL(`${process.env.REACT_APP_API_URL}/api/admin/guestQueueData/statistics`);
      url.searchParams.append('department', dept);
      url.searchParams.append('date', queryDate); // Always send a date to ensure timezone consistency

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`Error fetching statistics: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Queue statistics received:', data);

      // Update state with the enhanced data from our improved endpoint
      setQueueStats({
        totalServed: data.totalServed || 0,
        avgServingTime: data.avgServingTime || '0.0',
        avgWaitingTime: data.avgWaitingTime || '0.0',
        // New fields available from our improved endpoint
        weeklyTotalServed: data.weeklyTotalServed || 0,
        weeklyAvgServingTime: data.weeklyAvgServingTime || '0.0',
        pendingCount: data.pendingCount || 0,
        currentlyServing: data.currentlyServing || null,
        date: data.date // The date used for the query
      });

    } catch (err) {
      console.error('Failed to fetch queue statistics:', err);
      message.error('Failed to fetch queue statistics');
    }
  };

  // Fetch pending queues from the API
  const fetchPendingQueues = async (dept) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/guestQueueData/pending?department=${dept}`);

      if (!response.ok) {
        throw new Error(`Error fetching pending queues: ${response.statusText}`);
      }

      const data = await response.json();

      // Transform the data into the format expected by the component
      const formattedQueueItems = data.map(item => ({
        id: item._id,
        number: item.queueNumber,
        time: dayjs(item.timestamp).format('h:mm A'),
        current: item.status === 'accepted',
        guestUserId: item.guestUserId,
        status: item.status
      }));

      setQueueItems(formattedQueueItems);
    } catch (err) {
      console.error('Failed to fetch pending queues:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch skipped queues
  const fetchSkippedQueues = async (dept) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/guestQueueData/skippedQueues?department=${dept}`);

      if (!response.ok) {
        throw new Error(`Error fetching skipped queues: ${response.statusText}`);
      }

      const data = await response.json();

      // Transform the data into the format expected by the component
      const formattedSkippedItems = data.map(item => ({
        id: item._id,
        number: item.queueNumber,
        time: dayjs(item.skippedAt).format('h:mm A'),
        skippedBy: item.skippedBy,
        guestUserId: item.guestUserId,
        status: 'skipped'
      }));

      setSkippedItems(formattedSkippedItems);
    } catch (err) {
      console.error('Failed to fetch skipped queues:', err);
      message.error('Failed to fetch skipped queues');
    }
  };

  // Fetch currently serving queue
  const fetchCurrentlyServing = async (dept) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/guestQueueData/currentlyServing?department=${dept}`);

      if (!response.ok) {
        throw new Error(`Error fetching currently serving: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.queueNumber) {
        setCurrentlyServing(data.queueNumber);

        // Set serving start time from the database
        if (data.servingStartTime) {
          setServingStartTime(data.servingStartTime);

          // Calculate initial serving time
          const startTime = new Date(data.servingStartTime).getTime();
          const now = Date.now();
          const initialServingTime = Math.floor((now - startTime) / 1000);
          setServingTime(initialServingTime);
        }
      } else {
        setCurrentlyServing(null);
        setServingStartTime(null);
        setServingTime(0);
      }
    } catch (err) {
      console.error('Failed to fetch currently serving queue:', err);
      // Don't set error state here to avoid overriding pending queues error
    }
  };

  // Function to handle adding a new queue item
  const handleAddQueue = (guestInfo) => {
    message.success(`Successfully added ${guestInfo.name} to queue with number ${guestInfo.queueNumber}`);

    // Refresh the queue list
    fetchPendingQueues(department);
  };

  // Handle accepting a queue
  const handleAcceptQueue = async (queueNumber) => {
    // If there's already an accepted queue, don't allow accepting another one
    if (hasAcceptedQueue) {
      message.warning('There is already a queue being served. Please finish it first.');
      return;
    }

    try {
      // Immediately update UI state to prevent double-clicking
      setCurrentlyServing(queueNumber);

      // Update the queue item in the list immediately to show it's being served
      setQueueItems(prevItems => {
        const updatedItems = prevItems.map(item => {
          if (item.number === queueNumber) {
            return { ...item, status: 'accepted', current: true };
          }
          return item;
        });

        // Update hasAcceptedQueue state based on the updated items
        setHasAcceptedQueue(true);

        return updatedItems;
      });

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/guestQueueData/acceptQueue/${queueNumber}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        // Revert state if request fails
        setCurrentlyServing(null);

        setQueueItems(prevItems => {
          const revertedItems = prevItems.map(item => {
            if (item.number === queueNumber) {
              return { ...item, status: 'pending', current: false };
            }
            return item;
          });

          // Update hasAcceptedQueue state based on reverted items
          setHasAcceptedQueue(checkAcceptedQueue(revertedItems, null));

          return revertedItems;
        });

        throw new Error(`Error accepting queue: ${response.statusText}`);
      }

      const data = await response.json();

      // Update the serving start time
      setServingStartTime(data.servingStartTime);
      setServingTime(0);

      // Refresh the queues data
      fetchPendingQueues(department);

      message.success(`Now serving queue number ${queueNumber}`);
    } catch (err) {
      console.error('Failed to accept queue:', err);
      setError(err.message);
      message.error('Failed to accept queue');
    }
  };

  const handleRemoveQueue = async (queueNumber, removalReason) => {
    if (!currentlyServing) {
      message.warning('No queue is currently being served');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/guestQueueData/removeQueue/${currentlyServing}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          removedBy: localStorage.getItem('userID') || 'admin',
        })
      });

      if (!response.ok) {
        throw new Error(`Error removing queue: ${response.statusText}`);
      }

      const data = await response.json();

      // Reset serving state
      setCurrentlyServing(null);
      setServingStartTime(null);
      setServingTime(0);

      // Refresh the queues data
      fetchPendingQueues(department);

      message.success(`Queue number ${currentlyServing} has been removed`);

      // If there's a next queue, you might want to handle it
      if (data.remainingQueueCount > 0 && data.nextQueue) {
        message.info(`Next queue is ${data.nextQueue.queueNumber}`);
      }
    } catch (err) {
      console.error('Failed to remove queue:', err);
      setError(err.message);
      message.error('Failed to remove queue');
    }
  };

  const handleSkipQueue = async () => {
    if (!currentlyServing) {
      message.warning('No queue is currently being served');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/guestQueueData/skipQueue/${currentlyServing}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skippedBy: localStorage.getItem('userID') || 'admin'
        })
      });

      if (!response.ok) {
        throw new Error(`Error skipping queue: ${response.statusText}`);
      }

      // Reset serving state
      setCurrentlyServing(null);
      setServingStartTime(null);
      setServingTime(0);

      // Refresh the queues data
      fetchPendingQueues(department);
      fetchSkippedQueues(department);

      message.success(`Queue number ${currentlyServing} has been skipped`);
    } catch (err) {
      console.error('Failed to skip queue:', err);
      setError(err.message);
      message.error('Failed to skip queue');
    }
  };

  // Add a method to reintegrate a skipped queue
  const handleReintegrateQueue = async (queueNumber) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/guestQueueData/reintegrateQueue/${queueNumber}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Error reintegrating queue: ${response.statusText}`);
      }

      // Refresh the queues data
      fetchPendingQueues(department);
      fetchSkippedQueues(department);

      message.success(`Queue number ${queueNumber} has been reintegrated`);
    } catch (err) {
      console.error('Failed to reintegrate queue:', err);
      message.error('Failed to reintegrate queue');
    }
  };

  // Handle finishing the current queue
  const handleFinishQueue = async () => {
    if (!currentlyServing) {
      message.warning('No queue is currently being served');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/guestQueueData/finishQueue/${currentlyServing}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Error finishing queue: ${response.statusText}`);
      }

      const data = await response.json();

      // Reset serving state
      setCurrentlyServing(null);
      setServingStartTime(null);
      setServingTime(0);

      // Refresh all data including stats
      fetchPendingQueues(department);
      fetchQueueStatistics(department);

      // Update stats directly from response if available
      if (data.stats) {
        setQueueStats({
          totalServed: data.stats.totalServed || 0,
          avgServingTime: data.stats.avgServingTime || '0.0',
          avgWaitingTime: data.stats.avgWaitingTime || '0.0'
        });
      }

      message.success(`Finished serving queue number ${currentlyServing}`);
    } catch (err) {
      console.error('Failed to finish queue:', err);
      setError(err.message);
      message.error('Failed to finish queue');
    }
  };

  // Refresh all data manually
  const handleRefreshData = () => {
    if (department) {
      fetchAllData(department);
    }
  };

  // Determine which items to display based on active tab
  const displayItems = activeTab === 'main' ? queueItems : skippedItems;

  // Sort queue items to show the currently serving one at the top
  const sortedQueueItems = [...displayItems].sort((a, b) => {
    if (a.number === currentlyServing) return -1;
    if (b.number === currentlyServing) return 1;
    return 0;
  });

  const handleTransferQueue = async (queueNumber, targetDepartment, transferReason) => {
    if (!currentlyServing) {
      message.warning('No queue is currently being served');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/guestQueueData/transferQueue/${currentlyServing}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetDepartment,
          transferredBy: localStorage.getItem('userID') || 'admin',
          transferReason,
        })
      });

      if (!response.ok) {
        throw new Error(`Error transferring queue: ${response.statusText}`);
      }

      // Reset serving state
      setCurrentlyServing(null);
      setServingStartTime(null);
      setServingTime(0);

      // Refresh the queues data
      fetchPendingQueues(department);

      message.success(`Queue number ${queueNumber} has been transferred to ${targetDepartment}`);
    } catch (err) {
      console.error('Failed to transfer queue:', err);
      setError(err.message);
      message.error('Failed to transfer queue');
    }
  };

  if (loading) {
    return (
      <div className="main main-container">
        <Header />
        <div className="main-content">
          <h2>Loading queue data...</h2>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="main main-container">
        <Header />
        <div className="main-content">
          <h2>Error loading queue data</h2>
          <p>{error}</p>
          <button onClick={() => fetchPendingQueues(department)}>Retry</button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="main main-container">
      <Header />
      <div className="main-content">
        <div className="page-title">
          <div className="arrows" onClick={handleBack}>
            <MdOutlineKeyboardArrowLeft />
          </div>
          <p className="heading">Manage Queue - {department}</p>
        </div>

        <div className="container-columns">
          <div className="queue-column">
            <h2>Currently Serving</h2>
            <h1>Queue No.</h1>
            <div className="queue-token-container">
              <h1>{currentlyServing || 'None'}</h1>
            </div>
            <h2>Serving Time</h2>
            <h2>{formatTime(servingTime)}</h2>
            <div className="queue-details-container">
              <div className="queue-details-box">
                <h2>Served Queue</h2>
                <h2>{queueStats.totalServed}</h2>
              </div>
              <div className="vertical-divider" />
              <div className="queue-details-box">
                <h2>Avg Serving Time</h2>
                <h2>{queueStats.avgServingTime} min</h2>
              </div>
            </div>
          </div>

          <div className="queue-column">
            <div className='queue-button-container'>
              <div className='queue-button' onClick={handleHistory}>History</div>
              <div
                className={`queue-button ${!currentlyServing ? 'disabled' : ''}`}
                onClick={() => {
                  if (currentlyServing) {
                    setRemoveModalOpen(true);
                  }
                }}
                style={{ opacity: currentlyServing ? 1 : 0.5, cursor: currentlyServing ? 'pointer' : 'not-allowed' }}
              >
                Remove
              </div>
              <div
                className={`queue-button ${!currentlyServing ? 'disabled' : ''}`}
                onClick={() => {
                  if (currentlyServing) {
                    setTransferModalOpen(true);
                  }
                }}
                style={{ opacity: currentlyServing ? 1 : 0.5, cursor: currentlyServing ? 'pointer' : 'not-allowed' }}
              >
                Transfer
              </div>
              <div
                className={`queue-button ${!currentlyServing ? 'disabled' : ''}`}
                onClick={currentlyServing ? handleSkipQueue : undefined}
                style={{ opacity: currentlyServing ? 1 : 0.5, cursor: currentlyServing ? 'pointer' : 'not-allowed' }}
              >
                Skip
              </div>
              <div
                className={`queue-button ${!currentlyServing ? 'disabled' : ''}`}
                onClick={currentlyServing ? handleFinishQueue : undefined}
                style={{ opacity: currentlyServing ? 1 : 0.5, cursor: currentlyServing ? 'pointer' : 'not-allowed' }}
              >
                Done
              </div>
            </div>
          </div>

          <div className="queue-column">
            <div className='queue-list-container'>
              <div className='queue-list-header'>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2rem'}}>
                  <span>Waiting List ({activeTab === 'main' ? queueItems.length : skippedItems.length})</span>
                  <button 
                    onClick={handleRefreshData}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      color: 'white',
                      fontSize: '1.2rem',
                      marginRight: '12px'
                    }}
                    disabled={isRefreshing}
                  >
                    <MdRefresh size={24} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
                  </button>
                </div>
                <div className='queue-list-subheader'>
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
                  {sortedQueueItems.map(item => (
                    <div
                      key={item.id}
                      className={`queue-item ${activeTab === 'main' && item.number === currentlyServing ? 'current' : ''
                        }`}
                    >
                      <div className="queue-number">{item.number}</div>
                      <div className="queue-time">{item.time}</div>

                      {/* Conditionally render accept button only for main (pending) queue */}
                      {activeTab === 'main' && item.number !== currentlyServing && (
                        <button
                          className={`accept-button ${hasAcceptedQueue ? 'disabled' : ''}`}
                          onClick={() => !hasAcceptedQueue && handleAcceptQueue(item.number)}
                          disabled={hasAcceptedQueue}
                          style={{
                            opacity: hasAcceptedQueue ? 0.5 : 1,
                            cursor: hasAcceptedQueue ? 'not-allowed' : 'pointer'
                          }}
                        >
                          Accept
                        </button>
                      )}

                      {/* Render skipped queue details for skipped tab */}
                      {activeTab === 'skipped' && (
                        <>
                          <div className="queue-skipped-by">Skipped by: {item.skippedBy}</div>
                          <button
                            className="reintegrate-button"
                            onClick={() => handleReintegrateQueue(item.number)}
                          >
                            Reintegrate
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
                {department !== 'Administration' && department !== 'IT' && (
                  <div className='queue-add-button'>
                    <button className="add-button" onClick={() => setIsModalOpen(true)}>
                      <AddIcon /> Add Queue
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddQueueModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddQueue={handleAddQueue}
      />

      <RemoveQueueModal
        isOpen={removeModalOpen}
        onClose={() => setRemoveModalOpen(false)}
        onRemove={handleRemoveQueue}
        queueToRemove={currentlyServing}
      />

      <TransferQueueModal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        onTransfer={handleTransferQueue}
        queueToTransfer={currentlyServing}
      />

      <Footer />
    </div>
  );
};

export default ManageQueuePage;