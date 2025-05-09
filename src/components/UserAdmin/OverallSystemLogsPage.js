import { Button, DatePicker, Input, Table, Tag } from 'antd';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import utc from 'dayjs/plugin/utc';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { BiExport } from 'react-icons/bi';
import { FaPen, FaPlus, FaSearch } from 'react-icons/fa';
import { FiFilter } from 'react-icons/fi';
import { HiOutlineRefresh } from 'react-icons/hi';
import { MdOutlineKeyboardArrowLeft } from 'react-icons/md';

import '../../css/UserAdmin/Global.css';
import '../../css/UserAdmin/ManageAccountsPage.css';

import Footer from './Footer';
import Header from './Header';

dayjs.extend(utc);
dayjs.extend(isBetween);

const { RangePicker } = DatePicker;

const OverallSystemLogs = () => {
  const navigate = useNavigate();

  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tableFilters, setTableFilters] = useState({});
  const [sorter, setSorter] = useState({});


  const fetchSystemLogs = async (search = '') => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/system-logs`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const logs = await response.json();

      // Optional: Apply frontend search (case-insensitive)
      const filteredLogs = logs.filter((log) => {
        const createdAtFormatted = dayjs(log.createdAt).format('MMM D, YYYY h:mm A').toLowerCase();
        return (
          log.userID.toLowerCase().includes(search.toLowerCase()) ||
          log.accountName.toLowerCase().includes(search.toLowerCase()) ||
          log.role.toLowerCase().includes(search.toLowerCase()) ||
          log.action.toLowerCase().includes(search.toLowerCase()) ||
          log.detail.toLowerCase().includes(search.toLowerCase()) ||
          createdAtFormatted.includes(search.toLowerCase())
        );
      });

      const formattedData = filteredLogs.map((log, index) => ({
        ...log,
        key: log._id || index,
        name: log.accountName,
      }));

      setDataSource(formattedData);
    } catch (error) {
      console.error('Error fetching system logs:', error);
      setDataSource([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemLogs(); // Initial fetch on page load
  }, []);

  const handleSearch = (value) => {
    setSearchTerm(value);
    fetchSystemLogs(value);
  };

  const handleClearFilters = () => {
    setTableFilters({});
    setSorter({});
    setSearchTerm('');
    fetchSystemLogs('');
  };

  const handleExport = () => {
    const currentDate = new Date().toISOString().split('T')[0];
    const fileName = `overall-system-logs-report-${currentDate}.pdf`;

    // Get values from localStorage without parsing as JSON
    const fullName = localStorage.getItem('fullName');
    const role = localStorage.getItem('role');
    const userID = localStorage.getItem('userID');

    // Include user data in the request URL as query parameters
    fetch(`${process.env.REACT_APP_API_URL}/api/admin/export/system-logs?userID=${encodeURIComponent(userID)}&fullName=${encodeURIComponent(fullName)}&role=${encodeURIComponent(role)}`, {
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

        // Log the export action in system logs
        const logData = {
          userID: userID,
          accountName: fullName,
          role: role,
          action: 'Export',
          detail: `Exported system logs report: ${fileName}`
        };

        fetch(`${process.env.REACT_APP_API_URL}/api/admin/system-logs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(logData)
        })
          .then(response => response.json())
          .then(data => {
            console.log('System log recorded:', data);
            fetchSystemLogs();
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

  // Table column definitions
  const columns = [
    {
      title: 'Timestamp',
      width: 90,
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
      title: 'User ID',
      width: 120,
      dataIndex: 'userID',
      key: 'userID',
      sorter: (a, b) => a.userID.localeCompare(b.userID),
      sortDirections: ['ascend', 'descend'],
      sortOrder: sorter.columnKey === 'userID' ? sorter.order : null,
    },
    {
      title: 'Account Name',
      width: 130,
      dataIndex: 'accountName',
      key: 'accountName',
      sorter: (a, b) => a.accountName.localeCompare(b.accountName),
      sortDirections: ['ascend', 'descend'],
      sortOrder: sorter.columnKey === 'accountName' ? sorter.order : null,
    },
    {
      title: 'Role',
      width: 120,
      dataIndex: 'role',
      key: 'role',
      filters: [
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
      title: 'Action',
      width: 70,
      dataIndex: 'action',
      key: 'action',
      filters: [
        { text: 'Logged In', value: 'Logged In' },
        { text: 'Logged Out', value: 'Logged Out' },
        { text: 'Create', value: 'Create' },
        { text: 'Update', value: 'Update' },
        { text: 'Delete', value: 'Delete' },
        { text: 'Archive', value: 'Archive' },
        { text: 'Unarchive', value: 'Unarchive' },
        { text: 'Export', value: 'Export' },
      ],
      onFilter: (value, record) => record.action.includes(value),
      filteredValue: tableFilters.action || null,
      render: (action) => {
        const colorMap = {
          'Logged In': 'green',
          'Logged Out': 'volcano',
          'Create': 'blue',
          'Update': 'gold',
          'Delete': 'red',
          'Archive': 'cyan',
          'Unarchive': 'purple',
          'Export': 'geekblue',
        };
    
        return <Tag color={colorMap[action] || 'default'}>{action}</Tag>;
      },
    },   
    {
      title: 'Detail',
      width: 400,
      dataIndex: 'detail',
      key: 'detail',
      sorter: (a, b) => a.detail.localeCompare(b.detail),
      sortDirections: ['ascend', 'descend'],
      sortOrder: sorter.columnKey === 'detail' ? sorter.order : null,
    },
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
      <div className="main-content">
        <div className="page-title">
          <div className="arrows" onClick={handleBack}>
            <MdOutlineKeyboardArrowLeft />
          </div>
          <p className="heading">Overall System Logs</p>
        </div>

        {/* Table controls */}
        <div className="table-functions">
          <div className="left-tools">
            <Button icon={<FiFilter />} onClick={handleClearFilters}>Clear Filter</Button>
            <Button icon={<HiOutlineRefresh />} onClick={() => fetchSystemLogs(searchTerm)}>Refresh</Button>
            <Button icon={<BiExport />} onClick={handleExport}>Export</Button>
          </div>
          <div className="right-tools">
            <Input
              placeholder="Search Log"
              allowClear
              style={{ width: 300 }}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              suffix={<FaSearch style={{ color: '#aaa' }} />}
            />
          </div>
        </div>

        {/* System Logs Table */}
        <Table
          style={{ width: '100%', flex: 1 }} // You can use any shade you want
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
  )
}

export default OverallSystemLogs


