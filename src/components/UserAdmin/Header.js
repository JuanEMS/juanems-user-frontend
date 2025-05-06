import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMdMenu } from "react-icons/io";
import { IoSettingsOutline, IoLogOutOutline, IoPersonCircleOutline } from "react-icons/io5";
import '../../css/UserAdmin/Header.css';
import '../../css/UserAdmin/Global.css';
import SJDEFILogo from '../../images/SJDEFILogo.png';

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [department, setDepartment] = useState('');
  const [userInitials, setUserInitials] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin');
    }

    const fullName = localStorage.getItem('fullName') || '';
    const userRole = localStorage.getItem('role') || 'ROLE';
    
    setUserName(fullName);
    
    // Generate initials from full name
    const initialsArray = fullName.split(' ').map(name => name.charAt(0).toUpperCase());
    // Take first and last initials if available, otherwise just use what we have
    const initials = initialsArray.length > 1 
      ? initialsArray[0] + initialsArray[initialsArray.length - 1]
      : initialsArray.join('');
    setUserInitials(initials);

    // Remove anything in parentheses from department name
    const userDepartment = userRole.replace(/\s*\([^)]*\)\s*/g, '').toUpperCase();
    setDepartment(userDepartment);
  }, [navigate]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      const userEmail = localStorage.getItem('userEmail');
      const userID = localStorage.getItem('userID');
      const fullName = localStorage.getItem('fullName');
      const role = localStorage.getItem('role');
      
      // Get the MongoDB _id from localStorage - this is the key change
      const mongoId = localStorage.getItem('id');
      
      if (!mongoId) {
        console.error('MongoDB ID not found in localStorage');
        throw new Error('MongoDB ID not found');
      }
  
      // Send logout request using MongoDB _id instead of email
      const logoutResponse = await fetch('http://localhost:5000/api/admin/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: mongoId // Use MongoDB _id directly
        })
      });
      
      const logoutData = await logoutResponse.json();
      console.log('Logout response:', logoutData);
      
      // Create system log entry for logout action
      const logData = {
        userID: userID,
        accountName: fullName,
        role: role || 'ROLE',
        action: 'Logged Out',
        detail: `User ${fullName} logged out successfully.`,
      };
      
      // Send the log data to the server
      await fetch('http://localhost:5000/api/admin/system-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(logData),
      })
      .then(response => response.json())
      .then(data => {
        console.log('Logout system log recorded:', data);
      })
      .catch(error => {
        console.error('Failed to record logout system log:', error);
      });
    } catch (err) {
      console.error('Failed to process logout:', err);
      // Still proceed with logout even if backend calls fail
    } finally {
      // Clear localStorage and redirect
      localStorage.clear(); // Clear all localStorage items
      navigate('/admin');
    }
  };

  // Function to close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const profileElement = document.querySelector('.user-profile');
      const dropdownElement = document.querySelector('.dropdown-menu');
      
      if (isDropdownOpen && 
          profileElement && 
          !profileElement.contains(event.target) && 
          dropdownElement && 
          !dropdownElement.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);
  
  return (
    <div className='header-container'>
      <div className='header-blue'>
        <div className='header-section'>
          <IoMdMenu className="menu-icon" />
          <span className="header-text">{department}</span>
        </div>
        {/* <img
          src={SJDEFILogo}
          alt="SJDEFI Logo"
          className="juan-logo-register"
        /> */}
        <div className='relative'>
          <div 
            className={`header-section user-profile ${isDropdownOpen ? 'active-profile' : ''}`}
            onClick={toggleDropdown}
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
          >
            <span className="header-text">{userName}</span>
            <div className='profile-avatar'>
              {userInitials || <IoPersonCircleOutline />}
            </div>
          </div>
          
          {isDropdownOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-header">
                <div className='profile-avatar-large'>
                  {userInitials || <IoPersonCircleOutline />}
                </div>
                <div className="dropdown-user-info">
                  <span className="dropdown-name">{userName}</span>
                  <span className="dropdown-role">{department}</span>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <div className="dropdown-item">
                <IoSettingsOutline className="dropdown-icon" />
                <span>Settings</span>
              </div>
              <div className="dropdown-item logout-item" onClick={handleLogout}>
                <IoLogOutOutline className="dropdown-icon" />
                <span>Logout</span>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className='header-yellow'></div>
    </div>
  );
};

export default Header;