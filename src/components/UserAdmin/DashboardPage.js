import { AiFillSchedule } from "react-icons/ai";
import { FaHistory, FaLayerGroup, FaPen, FaStamp, FaUser, FaUserCheck, FaUserClock } from "react-icons/fa";
import { FaMoneyCheckDollar, FaPersonWalkingDashedLineArrowRight } from "react-icons/fa6";
import { IoDocuments } from "react-icons/io5";
import { MdOutlineSecurity, MdTableChart } from "react-icons/md";

import React, { useEffect, useState } from 'react';
import '../../css/UserAdmin/DashboardPage.css';
import '../../css/UserAdmin/Global.css';
import CardModule from './CardModule';
import Footer from './Footer';
import Header from './Header';
import NoticeBoard from './NoticeBoard';

const Dashboard = () => {
  const [authorizedModules, setAuthorizedModules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasQueueAccess, setHasQueueAccess] = useState(false);
  const [department, setDepartment] = useState('');
  const [pendingCount, setPendingCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  // Move id and userRole inside the component using useState
  const [id, setId] = useState('');
  const [userRole, setUserRole] = useState('ROLE');

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Initialize id and userRole from localStorage
  useEffect(() => {
    const storedId = localStorage.getItem('id') || '';
    const storedUserRole = localStorage.getItem('role') || 'ROLE';
    const userDepartment = storedUserRole.replace(/\s*\([^)]*\)\s*/g, '');

    setId(storedId);
    setUserRole(storedUserRole);
    setDepartment(userDepartment);
  }, []);

  // Fetch queue statistics when department is set
  useEffect(() => {
    if (department && hasQueueAccess) {
      fetchQueueStatistics();
    }
  }, [department, hasQueueAccess]);

  // Updated Dashboard Component's fetchQueueStatistics function with timezone fix
  const fetchQueueStatistics = async () => {
    try {
      // Get today's date in YYYY-MM-DD format using local timezone
      function getLocalDate() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Add 1 since months are 0-indexed
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }

      const today = getLocalDate();
      console.log(`Fetching queue statistics for department: ${department}, date: ${today}`);

      // Fetch statistics endpoint to get completed count and pending count
      const statsResponse = await fetch(
        `${process.env.REACT_APP_API_URL}/api/admin/guestQueueData/statistics?department=${department}&date=${today}`
      );

      if (!statsResponse.ok) {
        throw new Error(`Failed to fetch queue statistics. Status: ${statsResponse.status}`);
      }

      const statsData = await statsResponse.json();
      console.log('Queue statistics received:', statsData);

      // Update state with the fetched data
      setPendingCount(statsData.pendingCount || 0);
      setCompletedCount(statsData.totalServed || 0);

    } catch (err) {
      console.error('Error fetching queue statistics:', err);
    }
  };

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

        if (!id) {
          setError('User ID not found. Please log in again.');
          setIsLoading(false);
          return;
        }

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
          const modules = customModules || [];
          setAuthorizedModules(modules);
          setHasQueueAccess(modules.includes("Manage Queue"));
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
            const modules = roleData.data.modules;
            setAuthorizedModules(modules);
            setHasQueueAccess(modules.includes("Manage Queue"));
          } else {
            setAuthorizedModules([]);
            setHasQueueAccess(false);
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

        <div className="section-wrapper">
          <p className='section-title'>PROCESS MANAGEMENT</p>
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

        {hasQueueAccess && (
          <>
            <div className="section-wrapper">
              <p className='section-title'>QUEUE OVERVIEW</p>
              <div className='content-process'>
                <div className='card-container'>
                  <CardModule
                    title={'Manage Queue'}
                    description={'Control and update queuing system'}
                    icon={FaPersonWalkingDashedLineArrowRight}
                    path={'/admin/manage-queue'}
                  />
                  <CardModule
                    title={'Waiting'}
                    description={'Total people waiting'}
                    icon={FaUserClock}
                    statistics={pendingCount.toString()}
                    path={'/admin/manage-queue'}
                  />
                  <CardModule
                    title={'Completed'}
                    description={'Total people served'}
                    icon={FaUserCheck}
                    statistics={completedCount.toString()}
                    path={'/admin/queue-history'}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;