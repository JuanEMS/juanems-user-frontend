import { AiFillSchedule } from "react-icons/ai";
import { FaLayerGroup, FaPen, FaStamp, FaUser } from "react-icons/fa";
import { FaMoneyCheckDollar, FaPersonWalkingDashedLineArrowRight } from "react-icons/fa6";
import { IoDocuments } from "react-icons/io5";
import { MdOutlineSecurity, MdTableChart } from "react-icons/md";

import React, { useState, useEffect } from 'react';
import '../../css/UserAdmin/DashboardPage.css';
import '../../css/UserAdmin/Global.css';
import CardModule from './CardModule';
import NoticeBoard from './NoticeBoard';
import Footer from './Footer';
import Header from './Header';

const Dashboard = () => {
  const [authorizedModules, setAuthorizedModules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const userRole = localStorage.getItem('role') || 'ROLE';
  const id = localStorage.getItem('id') || '';

  // Module definitions with their icons and paths
  const allModules = {
    "Manage Applications": {
      description: "Review, process, and track student applications",
      path: "/admin/manage-applications",
      icon: IoDocuments
    },
    "Manage Accounts": {
      description: "Manage student, teacher, and staff accounts",
      path: "/admin/manage-accounts",
      icon: FaUser
    },
    "Manage Student Records": {
      description: "View and update student academic records",
      path: "/admin/manage-student-records",
      icon: FaLayerGroup
    },
    "Manage Enrollment": {
      description: "Oversee and process student enrollment statuses",
      path: "/admin/manage-enrollment",
      icon: FaStamp
    },
    "Manage Schedule": {
      description: "Set and adjust class schedules and timetables",
      path: "/admin/manage-schedule",
      icon: AiFillSchedule
    },
    "Manage Program": {
      description: "Configure degree programs and course structures",
      path: "/admin/manage-program",
      icon: MdTableChart
    },
    "Manage Payments": {
      description: "Control and update payment system",
      path: "/admin/manage-payments",
      icon: FaMoneyCheckDollar
    },
    "Manage Queue": {
      description: "Control and update queuing system",
      path: "/admin/manage-queue",
      icon: FaPersonWalkingDashedLineArrowRight
    },
    "Overall System Logs": {
      description: "Monitor logins, account updates, and system changes.",
      path: "/admin/manage-overall-system-logs",
      icon: MdOutlineSecurity
    },
    "Create Announcements": {
      description: "Post important updates for students and staff",
      path: "/admin/create-announcements",
      icon: FaPen
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
        <div className='content-announcement'>
          <div className='announcement-left'>
            <p className='heading'>Dashboard</p>
            <p className='date'>{formattedDate}</p>
          </div>
          <div className='announcement-right'>
            <NoticeBoard />
          </div>
        </div>

        <p className='section-title'>PROCESS MANAGEMENT</p>
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
  );
};

export default Dashboard;