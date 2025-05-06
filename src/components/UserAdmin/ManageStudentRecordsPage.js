import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { FaUserGroup } from "react-icons/fa6";
import { FaRankingStar } from "react-icons/fa6";
import { IoMdDocument } from "react-icons/io";

import React, { useState, useEffect } from 'react';
import CardModule from "./CardModule";
import Footer from './Footer';
import Header from './Header';

import { useNavigate } from "react-router-dom";
import '../../css/UserAdmin/Global.css';


const ManageStudentRecordsPage = () => {
  const navigate = useNavigate();
  const [authorizedModules, setAuthorizedModules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const userRole = localStorage.getItem('role') || 'ROLE';
  const id = localStorage.getItem('id') || '';

  const handleBack = () => navigate('/admin/dashboard');

   // Module definitions with their icons and paths
    const allModules = {
      "Manage Students": {
        description: "View and update student information",
        path: "",
        icon: FaUserGroup
      },
      "Attendance Summary": {
        description: "Track and review attendance records",
        path: "",
        icon: IoMdDocument
      },
      "Behavior Summary": {
        description: "Monitor and summarize student behavior",
        path: "",
        icon: IoMdDocument
      },
      "Grade Summary": {
        description: "View compiled grades by subject",
        path: "",
        icon: IoMdDocument
      },
      "Enrollment Summary": {
        description: "View overall enrollment statistics",
        path: "",
        icon: IoMdDocument
      },
      "Quarterly Ranking": {
        description: "Display student ranks per quarter",
        path: "",
        icon: FaRankingStar
      },
      "Yearly Ranking": {
        description: "Show overall student rankings per year",
        path: "",
        icon: FaRankingStar
      },
    };

      useEffect(() => {
        const fetchModules = async () => {
          try {
            setIsLoading(true);
    
            // Fetch user account data to get hasCustomAccess and modules
            const response = await fetch(`/api/admin/accounts/${id}`);
            if (!response.ok) throw new Error('Failed to fetch user account');
            const data = await response.json();
    
            if (!data.data) throw new Error('Invalid account data received');
    
            const { hasCustomAccess, customModules, role } = data.data;
    
            // If user has custom access, use their custom modules
            if (hasCustomAccess) {
              setAuthorizedModules(customModules || []);
            } else {
              // Get modules based on user role
              const roleResponse = await fetch(`/api/admin/roles/${encodeURIComponent(role || userRole)}`);
              if (!roleResponse.ok) throw new Error('Failed to fetch role modules');
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
        <p className="heading">Manage Student Records</p>
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

export default ManageStudentRecordsPage
