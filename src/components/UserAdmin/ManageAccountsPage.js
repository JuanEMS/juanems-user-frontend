import { Button, DatePicker, Input, Table, Tag } from 'antd';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import utc from 'dayjs/plugin/utc';
import React, { useEffect, useState } from 'react';
import { BiExport } from 'react-icons/bi';
import { FaPen, FaPlus, FaSearch, FaUserCheck, FaUserTimes } from 'react-icons/fa';
import { FaBoxArchive, FaBoxOpen } from "react-icons/fa6";
import { FiFilter } from 'react-icons/fi';
import { HiOutlineRefresh } from 'react-icons/hi';
import { MdOutlineKeyboardArrowLeft, MdOutlineManageAccounts } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { FaEye } from 'react-icons/fa';

import '../../css/UserAdmin/Global.css';
import '../../css/UserAdmin/ManageAccountsPage.css';

import Footer from './Footer';
import Header from './Header';

dayjs.extend(utc);
dayjs.extend(isBetween);

const { RangePicker } = DatePicker;

const ManageAccountsPage = () => {
  const navigate = useNavigate();

  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tableFilters, setTableFilters] = useState({});
  const [sorter, setSorter] = useState({});
  const [showArchived, setShowArchived] = useState(false);

  // Fetch user accounts
  const fetchAccounts = async (search = '', showArchived = false) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/accounts?archived=${showArchived}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();

      // Filter and format data
      const filteredData = result.data.filter(item => {
        const fullName = `${item.firstName} ${item.middleName || ''} ${item.lastName}`.toLowerCase();
        const createdAtFormatted = dayjs(item.createdAt).isValid()
          ? dayjs(item.createdAt).format('MMM D, YYYY h:mm A').toLowerCase()
          : '';
        const updatedAtFormatted = dayjs(item.updatedAt).isValid()
          ? dayjs(item.updatedAt).format('MMM D, YYYY h:mm A').toLowerCase()
          : '';

        return (
          fullName.includes(search.toLowerCase()) ||
          item.userID.toLowerCase().includes(search.toLowerCase()) ||
          item.email.toLowerCase().includes(search.toLowerCase()) ||
          item.role.toLowerCase().includes(search.toLowerCase()) ||
          item.status.toLowerCase().includes(search.toLowerCase()) ||
          createdAtFormatted.includes(search.toLowerCase()) ||
          updatedAtFormatted.includes(search.toLowerCase())
        );
      });

      const formattedData = filteredData.map((item, index) => ({
        ...item,
        key: item._id || index,
        name: `${item.firstName} ${item.middleName || ''} ${item.lastName}`,
      }));

      setDataSource(formattedData);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setDataSource([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts(searchTerm, showArchived);
  }, [showArchived]); // Re-fetch on toggle  

  const handleSearch = (value) => {
    setSearchTerm(value);
    fetchAccounts(value, showArchived);
  };

  const handleClearFilters = () => {
    setTableFilters({});
    setSorter({});
    setSearchTerm('');
    fetchAccounts('', showArchived);
  };

  const handleExport = () => {
    // Get the current date in YYYY-MM-DD format
    const currentDate = new Date().toISOString().split('T')[0];
    const fileName = `accounts-report-${currentDate}.pdf`;

    // Get values from localStorage without parsing as JSON
    const fullName = localStorage.getItem('fullName');
    const role = localStorage.getItem('role');
    const userID = localStorage.getItem('userID');

    fetch('http://localhost:5000/api/admin/export/accounts', {
      method: 'GET',
    })
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();

        // After successful export, log the action
        const logData = {
          userID: userID,
          accountName: fullName,
          role: role,
          action: 'Export',
          detail: `Exported accounts report: ${fileName}`
        };

        // Make API call to save the system log
        fetch('http://localhost:5000/api/admin/system-logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(logData)
        })
          .then(response => response.json())
          .then(data => {
            console.log('System log recorded:', data);
          })
          .catch(error => {
            console.error('Failed to record system log:', error);
          });
      })
      .catch(error => {
        console.error('Export failed:', error);
      });
  };

  const handleBack = () => navigate('/admin/dashboard');
  const handleCreate = () => navigate('/admin/manage-accounts/create');
  const handleAccessControl = () => navigate('/admin/access-control');


  const handleStatusToggle = async (record) => {
    const updatedStatus = record.status === 'Active' ? 'Inactive' : 'Active';

    try {
      const response = await fetch(`/api/admin/accounts/${record._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: updatedStatus }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      fetchAccounts(searchTerm, showArchived); // Refresh table
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };


  const handleArchiveToggle = async (record) => {
    const { _id, isArchived, status } = record;

    if (!isArchived && status === 'Active') {
      alert('Cannot archive an active account. Please deactivate the account first.');
      return null;
    }

    const actionType = isArchived ? 'Unarchive' : 'Archive';
    console.log(`Attempting to ${actionType.toLowerCase()} account: ${_id}`);

    try {
      // Fetch latest account info by ID
      const accountRes = await fetch(`http://localhost:5000/api/admin/accounts/${_id}`);
      if (!accountRes.ok) throw new Error('Failed to fetch account details');

      const account = await accountRes.json();
      const { userID, role, firstName, middleName, lastName } = account.data || {};

      // Safely construct full name
      const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ') || 'N/A';

      // Proceed with archiving/unarchiving
      const response = await fetch(`/api/admin/archive/${_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isArchived: !isArchived })
      });

      if (!response.ok) {
        throw new Error(`Failed to ${actionType.toLowerCase()} account`);
      }

      alert(`Account ${actionType.toLowerCase()}d successfully!`);

      // Log the action using the current admin's info
      const adminID = localStorage.getItem('userID');
      const adminName = localStorage.getItem('fullName');
      const adminRole = localStorage.getItem('role');

      const logDetail = `${actionType}d account [UserID: ${userID || 'N/A'}] of ${fullName} (Role: ${role || 'N/A'})`;

      const logData = {
        userID: adminID,
        accountName: adminName,
        role: adminRole,
        action: actionType,
        detail: logDetail,
      };

      await fetch('http://localhost:5000/api/admin/system-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logData)
      });

      // Refresh accounts
      fetchAccounts(searchTerm, showArchived);
      return await response.json();

    } catch (error) {
      console.error(`${actionType} error:`, error);
      alert(`Error ${actionType.toLowerCase()}ing account`);
      return null;
    }
  };


  // Table column definitions
  const columns = [
    {
      title: 'ID',
      width: 120,
      dataIndex: 'userID',
      key: 'userID',
      fixed: 'left',
      sorter: (a, b) => a.userID.localeCompare(b.userID),
      sortDirections: ['ascend', 'descend'],
      sortOrder: sorter.columnKey === 'userID' ? sorter.order : null,
    },
    {
      title: 'Full Name',
      width: 120,
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortDirections: ['ascend', 'descend'],
      sortOrder: sorter.columnKey === 'name' ? sorter.order : null,
    },
    {
      title: 'Email',
      width: 200,
      dataIndex: 'email',
      key: 'email',
      sorter: (a, b) => a.email.localeCompare(b.email),
      sortDirections: ['ascend', 'descend'],
      sortOrder: sorter.columnKey === 'email' ? sorter.order : null,
    },
    {
      title: 'Role',
      width: 120,
      dataIndex: 'role',
      key: 'role',
      filters: [
        { text: 'Student', value: 'Student' },
        { text: 'Faculty', value: 'Faculty' },
        { text: 'Admissions (Staff)', value: 'Admissions (Staff)' },
        { text: 'Registrar (Staff)', value: 'Registrar (Staff)' },
        { text: 'Accounting (Staff)', value: 'Accounting (Staff)' },
        { text: 'Administration (Sub-Admin)', value: 'Administration (Sub-Admin)' },
        { text: 'IT (Super Admin)', value: 'IT (Super Admin)' },
      ],
      onFilter: (value, record) => record.role.includes(value),
      filteredValue: tableFilters.role || null,
    },
    {
      title: 'Has Custom Access',
      width: 140,
      dataIndex: 'hasCustomAccess',
      key: 'hasCustomAccess',
      filters: [
        { text: 'Yes', value: true },
        { text: 'No', value: false },
      ],
      onFilter: (value, record) => record.hasCustomAccess === value,
      filteredValue: tableFilters.hasCustomAccess || null,
      render: (value) => (value ? 'Yes' : 'No'),
    },
    {
      title: 'Status',
      width: 100,
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Active', value: 'Active' },
        { text: 'Inactive', value: 'Inactive' },
        { text: 'Pending Verification', value: 'Pending Verification' },
      ],
      onFilter: (value, record) => record.status.includes(value),
      filteredValue: tableFilters.status || null,
      render: (status) => {
        let color;
        if (status === 'Active') {
          color = 'green';
        } else if (status === 'Pending Verification') {
          color = 'blue';
        } else {
          color = 'volcano';
        }
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Created At',
      width: 180,
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => {
        const date = dayjs(text);
        return date.isValid() ? date.format('YYYY-MM-DD HH:mm:ss') : 'Invalid Date';
      },
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
      sortOrder: sorter.columnKey === 'createdAt' ? sorter.order : null,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <DateRangeFilter selectedKeys={selectedKeys} setSelectedKeys={setSelectedKeys} confirm={confirm} clearFilters={clearFilters} />
      ),
      onFilter: (value, record) => isInDateRange(value, record.createdAt),
      filteredValue: tableFilters.createdAt || null,
    },
    {
      title: 'Updated At',
      width: 180,
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (text) => {
        const date = dayjs(text);
        return date.isValid() ? date.format('YYYY-MM-DD HH:mm:ss') : 'Invalid Date';
      },
      sorter: (a, b) => dayjs(a.updatedAt).unix() - dayjs(b.updatedAt).unix(),
      sortOrder: sorter.columnKey === 'updatedAt' ? sorter.order : null,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <DateRangeFilter selectedKeys={selectedKeys} setSelectedKeys={setSelectedKeys} confirm={confirm} clearFilters={clearFilters} />
      ),
      onFilter: (value, record) => isInDateRange(value, record.updatedAt),
      filteredValue: tableFilters.updatedAt || null,
    },
    {
      title: 'Action',
      key: 'action',
      fixed: 'right',
      width: 280,
      render: (_, record) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Button
            icon={record.isArchived ? <FaEye /> : <FaPen />} // Change the icon based on the archive status
            style={{ width: '150px', margin: '0 auto', display: 'flex', justifyContent: 'flex-start' }}
            onClick={() => navigate(`/admin/manage-accounts/edit/${record.key}`)} // Keep the path unchanged
          >
            {record.isArchived ? 'View' : 'Edit'} 
          </Button>
    
          {record.status !== 'Pending Verification' && (
            <Button
              icon={record.status === 'Active' ? <FaUserTimes /> : <FaUserCheck />}
              danger={record.status === 'Active'}
              style={{ width: '150px', margin: '0 auto', display: 'flex', justifyContent: 'flex-start' }}
              onClick={() => handleStatusToggle(record)}
              disabled={record.status !== 'Active' && record.isArchived} // Prevent activation if archived
              title={record.status !== 'Active' && record.isArchived ? 'Cannot activate archived account' : ''}
            >
              {record.status === 'Active' ? 'Deactivate' : 'Activate'}
            </Button>
          )}
    
          <Button
            icon={record.isArchived ? <FaBoxOpen /> : <FaBoxArchive />}
            style={{
              width: '150px',
              margin: '0 auto',
              display: 'flex',
              justifyContent: 'flex-start',
            }}
            onClick={() => handleArchiveToggle(record)}
            disabled={
              (!record.isArchived && record.status === 'Active') ||
              record.status === 'Pending Verification'
            }
            title={
              (!record.isArchived && record.status === 'Active')
                ? 'Cannot archive active accounts'
                : record.status === 'Pending Verification'
                ? 'Cannot archive accounts pending verification'
                : ''
            }
          >
            {record.isArchived ? 'Unarchive' : 'Archive'}
          </Button>
        </div>
      )
    }    
  ];

  // Reusable date range filter component
  const DateRangeFilter = ({ selectedKeys, setSelectedKeys, confirm, clearFilters }) => (
    <div style={{ padding: 8 }}>
      <RangePicker
        style={{ width: 250 }}
        value={selectedKeys[0] ? [dayjs(selectedKeys[0].split('|')[0]), dayjs(selectedKeys[0].split('|')[1])] : []}
        onChange={(dates) => {
          setSelectedKeys(dates ? [`${dates[0].toISOString()}|${dates[1].toISOString()}`] : []);
        }}
      />
      <div style={{ marginTop: 8 }}>
        <Button type="primary" onClick={confirm}>Filter</Button>
        <Button onClick={() => { clearFilters(); confirm(); }} style={{ marginLeft: 8 }}>Reset</Button>
      </div>
    </div>
  );

  // Helper to check if record is in range
  const isInDateRange = (value, dateField) => {
    const [start, end] = value.split('|');
    const recordDate = dayjs(dateField);
    return recordDate.isValid() && recordDate.isBetween(dayjs(start), dayjs(end).endOf('day'), null, '[]');
  };

  return (
    <div className="main main-container">
      <Header />
      {showArchived && (
        <Tag className="archived-tag" color="orange">
          Viewing Archived Accounts
        </Tag>
      )}
      <div className="main-content">
        {/* Page title */}
        <div className="page-title">
          <div className="arrows" onClick={handleBack}>
            <MdOutlineKeyboardArrowLeft />
          </div>
          <p className="heading">
            {showArchived ? "Archived Accounts" : "Manage Accounts"}
          </p>
        </div>

        {/* Table controls */}
        <div className="table-functions">
          <div className="left-tools">
            <Button icon={<FiFilter />} onClick={handleClearFilters}>Clear Filter</Button>
            <Button icon={<HiOutlineRefresh />} onClick={() => fetchAccounts(searchTerm, showArchived)}>Refresh</Button>
            <Button icon={<BiExport />} onClick={handleExport}>Export</Button>
          </div>
          <div className="right-tools">
            <Input
              placeholder="Search Account"
              allowClear
              style={{ width: 300 }}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              suffix={<FaSearch style={{ color: '#aaa' }} />}
            />
            <Button
              icon={showArchived ? <FaBoxOpen /> : <FaBoxArchive />}
              onClick={() => setShowArchived(!showArchived)}
            >
              {showArchived ? 'Close Archive' : 'Show Archived'}
            </Button>
            <Button icon={<MdOutlineManageAccounts />} onClick={handleAccessControl}>Access Control</Button>
            <Button type="ghost" className="create-btn" icon={<FaPlus />} onClick={handleCreate}>
              Create Account
            </Button>
          </div>
        </div>

        {/* Accounts table */}
        <Table
          style={{ width: '100%', flex: 1 }}
          columns={columns}
          dataSource={Array.isArray(dataSource) ? dataSource : []}
          loading={loading}
          scroll={{ x: true }}
          pagination
          bordered
          onChange={(pagination, filters, sorter) => {
            setTableFilters(filters);
            setSorter(sorter);
          }}
        />

      </div>
      <Footer />
    </div>
  );
};

export default ManageAccountsPage;