import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { PiStudentFill } from "react-icons/pi";
import { FaClipboardList } from "react-icons/fa";

import React, { useEffect, useState } from 'react';
import CardModule from "./CardModule";
import Footer from './Footer';
import Header from './Header';

import { useNavigate } from "react-router-dom";
import '../../css/UserAdmin/Global.css';

const ManageSchedulePage = () => {
  const navigate = useNavigate();
  const [authorizedModules, setAuthorizedModules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const userRole = localStorage.getItem('role') || 'ROLE';
  const id = localStorage.getItem('id') || '';

  const handleBack = () => navigate('/admin/dashboard');

  // Module definitions with their icons and paths
  const allModules = {
    "Student Schedule": {
      description: "View and manage class schedules for students",
      path: "",
      icon: PiStudentFill
    },
    "Faculty Schedule": {
      description: "Access and update teaching schedules for faculty",
      path: "",
      icon: FaClipboardList
    },
  };

  useEffect(() => {
    const fetchModules = async () => {
      try {
        setIsLoading(true);

        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/accounts/${id}`);

        // Check for non-JSON responses
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error(`Expected JSON response but got ${contentType}. Status: ${response.status}`);
        }

        if (!response.ok) throw new Error(`Failed to fetch user account. Status: ${response.status}`);

        const data = await response.json();

        if (!data.data) throw new Error('Invalid account data received');

        const { hasCustomAccess, customModules, role } = data.data;

        // If user has custom access, use their custom modules
        if (hasCustomAccess) {
          setAuthorizedModules(customModules || []);
        } else {
          // Get modules based on user role - also updated with API_BASE_URL
          const roleResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/roles/${encodeURIComponent(role || userRole)}`);

          // Check for non-JSON responses
          const roleContentType = roleResponse.headers.get("content-type");
          if (!roleContentType || !roleContentType.includes("application/json")) {
            throw new Error(`Expected JSON response but got ${roleContentType}. Status: ${roleResponse.status}`);
          }

          if (!roleResponse.ok) throw new Error(`Failed to fetch role modules. Status: ${roleResponse.status}`);

          const roleData = await roleResponse.json();

          if (roleData.data && roleData.data.modules) {
            setAuthorizedModules(roleData.data.modules);
          } else {
            setAuthorizedModules([]);
          }
        }
      } catch (err) {
        console.error('Error fetching modules:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchModules();
    } else {
      setError('User ID not found. Please log in again.');
      setIsLoading(false);
    }
  }, [id, userRole]);

  return (
    <div className="main main-container">
      <Header />
      <div className="main-content">
        <div className="page-title">
          <div className="arrows" onClick={handleBack}>
            <MdOutlineKeyboardArrowLeft />
          </div>
          <p className="heading">Manage Schedule</p>
        </div>
        <div className='content-process'>
          {isLoading ? (
            <div className="loading-indicator">Loading modules...</div>
          ) : error ? (
            <div className="error-message">Error: {error}</div>
          ) : (
            <div className='card-container'>
              {authorizedModules.map((moduleName) => {
                const moduleInfo = allModules[moduleName];

                // Only render modules that have configuration in allModules
                if (moduleInfo) {
                  return (
                    <CardModule
                      key={moduleName}
                      title={moduleName}
                      description={moduleInfo.description}
                      path={moduleInfo.path}
                      icon={moduleInfo.icon}
                    />
                  );
                }
                return null;
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default ManageSchedulePage