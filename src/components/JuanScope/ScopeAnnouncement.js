import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBell, 
  faBars, 
  faTimes, 
  faBullhorn, 
  faSearch,
  faArrowUp,
  faArrowDown
} from '@fortawesome/free-solid-svg-icons';
import SJDEFILogo from '../../images/SJDEFILogo.png';
import '../../css/JuanScope/ScopeAnnouncement.css';
import SessionManager from '../JuanScope/SessionManager';
import SideNavigation from './SideNavigation';
import axios from 'axios';
import debounce from 'lodash.debounce';

function ScopeAnnouncement() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState({
    email: localStorage.getItem('userEmail') || '',
    firstName: localStorage.getItem('firstName') || 'User',
    middleName: localStorage.getItem('middleName') || '',
    lastName: localStorage.getItem('lastName') || '',
    applicantID: localStorage.getItem('applicantID') || 'N/A'
  });
  const [registrationStatus, setRegistrationStatus] = useState('Incomplete');
  const [admissionRequirementsStatus, setAdmissionRequirementsStatus] = useState('Incomplete');
  const [admissionAdminFirstStatus, setAdmissionAdminFirstStatus] = useState('On-going');
<<<<<<< HEAD
  const [admissionExamDetailsStatus, setAdmissionExamDetailsStatus] = useState('Incomplete'); // New state
=======
>>>>>>> a3fea0106862ae583da46e72204acb6def9bc737
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({
    key: 'startDate',
    direction: 'desc'
  });

  const debouncedSearch = useCallback(
    debounce((searchValue) => {
      setCurrentPage(1);
      fetchAnnouncements(1, searchValue);
    }, 500),
    [sortConfig]
  );

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      navigate('/scope-login');
      return;
    }
    fetchAnnouncements(currentPage);
  }, [navigate, currentPage, sortConfig]);

  useEffect(() => {
    if (searchTerm !== '') {
      debouncedSearch(searchTerm);
    }
    return () => debouncedSearch.cancel();
  }, [searchTerm, debouncedSearch]);

  const fetchAnnouncements = async (page = currentPage, searchValue = searchTerm) => {
    try {
      setLoading(true);
      setError(null);
      const userEmail = localStorage.getItem('userEmail');
      
      if (!userEmail) {
        navigate('/scope-login', { state: { error: 'No active session found. Please log in.' } });
        return;
      }

      const axiosWithRetry = async (config, retries = 3, delay = 1000) => {
        try {
          const response = await axios(config);
          return response;
        } catch (error) {
          if (retries > 0 && error.response?.status !== 400) {
            await new Promise(resolve => setTimeout(resolve, delay));
            return axiosWithRetry(config, retries - 1, delay);
          }
          throw error;
        }
      };

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

      const registrationResponse = await fetchWithRetry(
        `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/personal-details/${userEmail}`
      );

      if (!registrationResponse) {
        throw new Error('Failed to fetch registration status');
      }
      setRegistrationStatus(registrationResponse.registrationStatus || 'Incomplete');
      setAdmissionAdminFirstStatus(registrationResponse.admissionAdminFirstStatus || 'On-going');

      // Fetch admission requirements status
      let admissionData;
      try {
        admissionData = await fetchWithRetry(
          `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/admission-requirements/${userEmail}`
        );
        setAdmissionRequirementsStatus(admissionData.admissionRequirementsStatus || 'Incomplete');
        setAdmissionAdminFirstStatus(admissionData.admissionAdminFirstStatus || registrationResponse.admissionAdminFirstStatus || 'On-going');
      } catch (err) {
        console.error('Error fetching admission data:', err);
        setAdmissionRequirementsStatus('Incomplete');
      }

<<<<<<< HEAD
      // Fetch exam details for admissionExamDetailsStatus
      let examDetailsData;
      try {
        examDetailsData = await fetchWithRetry(
          `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/exam-details/${userEmail}`
        );
        setAdmissionExamDetailsStatus(examDetailsData.admissionExamDetailsStatus || 'Incomplete');
      } catch (err) {
        console.error('Error fetching exam details:', err);
        setAdmissionExamDetailsStatus('Incomplete');
      }

=======
>>>>>>> a3fea0106862ae583da46e72204acb6def9bc737
      const response = await axiosWithRetry({
        method: 'get',
        url: `${process.env.REACT_APP_API_URL}/api/announcements`,
        params: {
          page,
          limit: 5,
          search: searchValue,
          sortBy: sortConfig.key,
          sortOrder: sortConfig.direction,
          status: 'Active',
          audience: 'Applicants',
          userEmail
        }
      });
      
      const validAnnouncements = response.data.announcements.filter(
        announcement => announcement.audience === 'Applicants' && announcement.status === 'Active'
      );
      
      setAnnouncements(validAnnouncements);
      setTotalPages(response.data.totalPages || 1);
      setTotalItems(response.data.totalItems || response.data.announcements.length);
      
      const viewPromises = validAnnouncements.map(announcement =>
        axiosWithRetry({
          method: 'post',
          url: `${process.env.REACT_APP_API_URL}/api/announcements/view`,
          data: {
            userEmail,
            announcementId: announcement._id
          }
        })
      );
      await Promise.all(viewPromises);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching announcements:', err);
      if (err.response?.status === 400) {
        setError('Invalid request. Please check your input and try again.');
      } else if (err.response?.status === 429) {
        setError('Too many requests. Please try again later.');
      } else {
        setError('Failed to load announcements. Please check your connection and try again.');
      }
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
    fetchAnnouncements(1, '');
  };

  const requestSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <SessionManager>
      <div className="scope-dashboard-container">
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
              <FontAwesomeIcon icon={sidebarOpen ? faTimes : faBars} size="lg" />
            </button>
          </div>
        </header>
        <div className="scope-dashboard-content">
          <SideNavigation 
            userData={userData} 
            registrationStatus={registrationStatus}
            admissionRequirementsStatus={admissionRequirementsStatus}
            admissionAdminFirstStatus={admissionAdminFirstStatus}
<<<<<<< HEAD
            admissionExamDetailsStatus={admissionExamDetailsStatus} // Pass new prop
=======
>>>>>>> a3fea0106862ae583da46e72204acb6def9bc737
            onNavigate={closeSidebar}
            isOpen={sidebarOpen}
          />
          <main className={`scope-main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
            <div className="announcement-container">
              <div className="announcement-content">
                <h2 className="announcement-title">Announcements</h2>
                <div className="announcement-divider"></div>
                
                <div className="announcement-banner">
                  Stay updated with important news, reminders, and university updates.
                </div>

                <div className="announcement-controls">
                  <div className="announcement-search">
                    <div className="search-input-container">
                      <FontAwesomeIcon icon={faSearch} className="search-icon" />
                      <input
                        type="text"
                        placeholder="Search announcements..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="search-input"
                        aria-label="Search announcements"
                      />
                      {searchTerm && (
                        <button 
                          className="search-clear-button" 
                          onClick={clearSearch}
                          aria-label="Clear search"
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="sort-controls">
                    <span className="sort-label">Sort by: </span>
                    <button 
                      onClick={() => requestSort('startDate')}
                      className={`sort-button ${sortConfig.key === 'startDate' ? 'active' : ''}`}
                      aria-label="Sort by date"
                    >
                      Date
                      {sortConfig.key === 'startDate' && (
                        <FontAwesomeIcon 
                          icon={sortConfig.direction === 'asc' ? faArrowUp : faArrowDown} 
                          className="sort-icon" 
                        />
                      )}
                    </button>
                    <button 
                      onClick={() => requestSort('subject')}
                      className={`sort-button ${sortConfig.key === 'subject' ? 'active' : ''}`}
                      aria-label="Sort by title"
                    >
                      Title
                      {sortConfig.key === 'subject' && (
                        <FontAwesomeIcon 
                          icon={sortConfig.direction === 'asc' ? faArrowUp : faArrowDown} 
                          className="sort-icon" 
                        />
                      )}
                    </button>
                  </div>
                </div>

                {loading && (
                  <div className="announcement-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading announcements...</p>
                  </div>
                )}

                {error && (
                  <div className="announcement-error">
                    <p>{error}</p>
                    <button 
                      onClick={() => fetchAnnouncements()}
                      className="retry-button"
                    >
                      Try Again
                    </button>
                  </div>
                )}

                {!loading && !error && (
                  <>
                    <div className="announcement-list">
                      {announcements.length > 0 ? (
                        announcements.map(announcement => (
                          <div className="announcement-item" key={announcement._id}>
                            <div className="announcement-header">
                              <div className="announcement-uploader">
                                <div className="uploader-icon-container">
                                  <FontAwesomeIcon icon={faBullhorn} className="uploader-icon" />
                                </div>
                                <span className="uploader-name">{announcement.announcer}</span>
                              </div>
                              <h3 className="announcement-item-title">{announcement.subject}</h3>
                            </div>
                            <p className="announcement-item-content">
                              {announcement.content}
                            </p>
                            <div className="announcement-footer">
                              <span className="announcement-item-date">
                                Posted: {formatDate(announcement.startDate)}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="no-announcements">
                          <FontAwesomeIcon icon={faBell} className="no-data-icon" />
                          <p>No active announcements found</p>
                          {searchTerm && (
                            <button className="clear-search-button" onClick={clearSearch}>
                              Clear Search
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {announcements.length > 0 && totalPages > 1 && (
                      <div className="announcement-pagination">
                        <button
                          onClick={() => {
                            const newPage = Math.max(currentPage - 1, 1);
                            setCurrentPage(newPage);
                          }}
                          disabled={currentPage === 1}
                          className="pagination-button"
                          aria-label="Previous page"
                        >
                          Back
                        </button>
                        
                        <div className="pagination-info">
                          <span> {currentPage} of {totalPages} </span>
                        </div>
                        
                        <button
                          onClick={() => {
                            const newPage = Math.min(currentPage + 1, totalPages);
                            setCurrentPage(newPage);
                          }}
                          disabled={currentPage === totalPages}
                          className="pagination-button"
                          aria-label="Next page"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </main>
        </div>
        {sidebarOpen && (
          <div className="sidebar-overlay active" onClick={toggleSidebar}></div>
        )}
      </div>
    </SessionManager>
  );
}

export default ScopeAnnouncement;