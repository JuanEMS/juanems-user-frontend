import { Button, DatePicker, Input, Table, Tag, Tooltip } from 'antd';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import utc from 'dayjs/plugin/utc';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { BiExport } from 'react-icons/bi';
import { FaSearch } from 'react-icons/fa';
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

const QueueHistory = () => {
  const navigate = useNavigate();
  const [department, setDepartment] = useState('');
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tableFilters, setTableFilters] = useState({});
  const [sorter, setSorter] = useState({});
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin');
      return;
    }

    const userRole = localStorage.getItem('role') || 'ROLE';
    const userDepartment = userRole.replace(/\s*\([^)]*\)\s*/g, '');
    setDepartment(userDepartment);
  }, [navigate]);

  useEffect(() => {
    if (department) {
      fetchArchivedQueueHistory();
    }
  }, [department]);

  const fetchArchivedQueueHistory = async (search = '') => {
    setLoading(true);
    try {
      // Only include department parameter if it's not IT or Administration
      const url = department && ['IT', 'Administration'].includes(department)
        ? `${process.env.REACT_APP_API_URL}/api/admin/guestQueueData/queue/archived`
        : `${process.env.REACT_APP_API_URL}/api/admin/guestQueueData/queue/archived?department=${encodeURIComponent(department)}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      console.log("API response:", result);

      // Apply search filter if provided
      const searchFiltered = result.data.filter(item => {
        const archivedAtFormatted = dayjs(item.archivedAt).isValid()
          ? dayjs(item.archivedAt).format('MMM D, YYYY h:mm A').toLowerCase()
          : '';

        if (search === '') return true;

        return (
          (item.queueNumber && item.queueNumber.toLowerCase().includes(search.toLowerCase())) ||
          (item.department && item.department.toLowerCase().includes(search.toLowerCase())) ||
          (item.status && item.status.toLowerCase().includes(search.toLowerCase())) ||
          (item.exitReason && item.exitReason.toLowerCase().includes(search.toLowerCase())) ||
          archivedAtFormatted.includes(search.toLowerCase())
        );
      });

      const formattedData = searchFiltered.map((item, index) => ({
        ...item,
        key: item._id || index,
        totalTimeMinutes: item.totalTimeMinutes || '—',
        waitingTimeMinutes: item.waitingTimeMinutes || '—',
        servingTimeMinutes: item.servingTimeMinutes || '—'
      }));

      setDataSource(formattedData);
      applyFiltersToData(formattedData);
    } catch (error) {
      console.error('Error fetching archived queue history:', error);
      setDataSource([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to apply local filters to data
  const applyFiltersToData = (data) => {
    if (!data || data.length === 0) {
      setFilteredData([]);
      return;
    }

    let filtered = [...data];

    if (tableFilters.department?.length) {
      filtered = filtered.filter(record =>
        tableFilters.department.includes(record.department)
      );
    }

    if (tableFilters.status?.length) {
      filtered = filtered.filter(record =>
        tableFilters.status.includes(record.status)
      );
    }

    if (tableFilters.exitReason?.length) {
      filtered = filtered.filter(record =>
        tableFilters.exitReason.includes(record.exitReason)
      );
    }

    // Apply date range filter
    if (tableFilters.archivedAt?.length) {
      const [start, end] = tableFilters.archivedAt[0].split('|');
      filtered = filtered.filter(record =>
        isInDateRange(tableFilters.archivedAt[0], record.archivedAt)
      );
    }

    // Apply sorting if needed
    if (sorter.columnKey && sorter.order) {
      filtered = [...filtered].sort((a, b) => {
        const key = sorter.columnKey;

        if (['archivedAt', 'timestamp', 'servingStartTime', 'servingEndTime'].includes(key)) {
          return sorter.order === 'ascend'
            ? dayjs(a[key]).unix() - dayjs(b[key]).unix()
            : dayjs(b[key]).unix() - dayjs(a[key]).unix();
        } else if (['totalTimeMinutes', 'waitingTimeMinutes', 'servingTimeMinutes'].includes(key)) {
          // Handle cases where value is '—' (dash)
          const valueA = a[key] === '—' ? -1 : a[key];
          const valueB = b[key] === '—' ? -1 : b[key];
          
          return sorter.order === 'ascend'
            ? valueA - valueB
            : valueB - valueA;
        } else {
          return sorter.order === 'ascend'
            ? (a[key] || '').toString().localeCompare((b[key] || '').toString())
            : (b[key] || '').toString().localeCompare((a[key] || '').toString());
        }
      });
    }
    setFilteredData(filtered);
  };

  // Apply filter changes when tableFilters or sorter changes
  useEffect(() => {
    applyFiltersToData(dataSource);
  }, [tableFilters, sorter]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    fetchArchivedQueueHistory(value);
  };

  const handleClearFilters = () => {
    setTableFilters({});
    setSorter({});
    setSearchTerm('');
    fetchArchivedQueueHistory('');
  };

  const handleExport = () => {
    const currentDate = new Date().toISOString().split('T')[0];
    const fileName = `archived-queue-history-report-${currentDate}.pdf`;

    // Get values from localStorage without parsing as JSON
    const fullName = localStorage.getItem('fullName');
    const role = localStorage.getItem('role');
    const userID = localStorage.getItem('userID');

    // Include user data in the request URL as query parameters
    fetch(`${process.env.REACT_APP_API_URL}/api/admin/export/queue-history?userID=${encodeURIComponent(userID)}&fullName=${encodeURIComponent(fullName)}&role=${encodeURIComponent(role)}`, {
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
          detail: `Exported archived queue history report: ${fileName}`
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
            fetchArchivedQueueHistory(searchTerm); // Refresh the queue history data
          })
          .catch(error => {
            console.error('Failed to record system log:', error);
          });
      })
      .catch(error => {
        console.error('Export failed:', error);
      });
  };

  const handleBack = () => navigate('/admin/manage-queue');

  // Helper to check if record is in range
  const isInDateRange = (value, dateField) => {
    const [start, end] = value.split('|');
    const recordDate = dayjs(dateField);
    return recordDate.isValid() && recordDate.isBetween(dayjs(start), dayjs(end).endOf('day'), null, '[]');
  };

  // Helper to format time
  const formatTimeMinutes = (time) => {
    // Check if time is '—' (dash) or not a valid number
    if (time === '—' || isNaN(parseFloat(time))) {
      return time;
    }
    
    // Convert time to a readable format
    const minutes = Math.floor(parseFloat(time));
    const seconds = Math.round((parseFloat(time) - minutes) * 60);

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  // Table column definitions
  const columns = [
    {
      title: 'Queue #',
      width: 120,
      dataIndex: 'queueNumber',
      key: 'queueNumber',
      sorter: (a, b) => a.queueNumber.localeCompare(b.queueNumber),
      sortDirections: ['ascend', 'descend'],
      sortOrder: sorter.columnKey === 'queueNumber' ? sorter.order : null,
    },
    {
      title: 'Department',
      width: 120,
      dataIndex: 'department',
      key: 'department',
      filters: [
        { text: 'Admissions', value: 'Admissions' },
        { text: 'Registrar', value: 'Registrar' },
        { text: 'Accounting', value: 'Accounting' },
      ],
      onFilter: (value, record) => record.department.includes(value),
      filteredValue: tableFilters.department || null,
    },
    {
      title: 'Status',
      width: 70,
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Completed', value: 'completed' },
        { text: 'Left', value: 'left' },
        { text: 'Rejoined', value: 'rejoined' },
        { text: 'Transferred', value: 'transferred' },
        { text: 'Removed', value: 'removed_by_admin' },
      ],
      onFilter: (value, record) => record.status.includes(value),
      filteredValue: tableFilters.status || null,
      render: (status) => {
        const colorMap = {
          'completed': 'green',
          'left': 'blue',
          'rejoined': 'gold',
          'transferred': 'purple',
          'removed_by_admin': 'red',
        };

        return <Tag color={colorMap[status] || 'default'}>{status}</Tag>;
      },
    },
    {
      title: 'Exit Reason',
      width: 120,
      dataIndex: 'exitReason',
      key: 'exitReason',
      filters: [
        { text: 'Served', value: 'served' },
        { text: 'User Left', value: 'user_left' },
        { text: 'Rejoined', value: 'rejoined' },
        { text: 'Removed', value: 'removed_by_admin' },
        { text: 'Transferred', value: 'transferred' },
        { text: 'Other', value: 'other' },
      ],
      onFilter: (value, record) => record.exitReason.includes(value),
      filteredValue: tableFilters.exitReason || null,
    },
    {
      title: 'Waiting Time',
      width: 120,
      dataIndex: 'waitingTimeMinutes',
      key: 'waitingTimeMinutes',
      sorter: (a, b) => {
        const valueA = a.waitingTimeMinutes === '—' ? -1 : a.waitingTimeMinutes;
        const valueB = b.waitingTimeMinutes === '—' ? -1 : b.waitingTimeMinutes;
        return valueA - valueB;
      },
      sortDirections: ['ascend', 'descend'],
      sortOrder: sorter.columnKey === 'waitingTimeMinutes' ? sorter.order : null,
      render: (time, record) => {
        const formattedTime = formatTimeMinutes(time);
        const hasNoWaitingTime = time === '—';
        
        return (
          <Tooltip title={hasNoWaitingTime ? "No waiting time data available" : null}>
            <span className={hasNoWaitingTime ? "text-muted" : ""}>{formattedTime}</span>
          </Tooltip>
        );
      }
    },
    {
      title: 'Serving Time',
      width: 120,
      dataIndex: 'servingTimeMinutes',
      key: 'servingTimeMinutes',
      sorter: (a, b) => {
        const valueA = a.servingTimeMinutes === '—' ? -1 : a.servingTimeMinutes;
        const valueB = b.servingTimeMinutes === '—' ? -1 : b.servingTimeMinutes;
        return valueA - valueB;
      },
      sortDirections: ['ascend', 'descend'],
      sortOrder: sorter.columnKey === 'servingTimeMinutes' ? sorter.order : null,
      render: (time, record) => {
        const formattedTime = formatTimeMinutes(time);
        const hasNoServingTime = time === '—';
        
        return (
          <Tooltip title={hasNoServingTime ? "No serving time data available" : null}>
            <span className={hasNoServingTime ? "text-muted" : ""}>{formattedTime}</span>
          </Tooltip>
        );
      }
    },
    {
      title: 'Total Time',
      width: 120,
      dataIndex: 'totalTimeMinutes',
      key: 'totalTimeMinutes',
      sorter: (a, b) => {
        const valueA = a.totalTimeMinutes === '—' ? -1 : a.totalTimeMinutes;
        const valueB = b.totalTimeMinutes === '—' ? -1 : b.totalTimeMinutes;
        return valueA - valueB;
      },
      sortDirections: ['ascend', 'descend'],
      sortOrder: sorter.columnKey === 'totalTimeMinutes' ? sorter.order : null,
      render: (time, record) => {
        const formattedTime = formatTimeMinutes(time);
        const hasNoTotalTime = time === '—';
        
        return (
          <Tooltip title={hasNoTotalTime ? "No total time data available" : null}>
            <span className={hasNoTotalTime ? "text-muted" : ""}>{formattedTime}</span>
          </Tooltip>
        );
      }
    },
    {
      title: 'Archived At',
      width: 160,
      dataIndex: 'archivedAt',
      key: 'archivedAt',
      render: (text) => {
        const date = dayjs(text);
        return date.isValid() ? date.format('YYYY-MM-DD HH:mm:ss') : 'Invalid Date';
      },
      sorter: (a, b) => dayjs(a.archivedAt).unix() - dayjs(b.archivedAt).unix(),
      sortOrder: sorter.columnKey === 'archivedAt' ? sorter.order : null,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <DateRangeFilter selectedKeys={selectedKeys} setSelectedKeys={setSelectedKeys} confirm={confirm} clearFilters={clearFilters} />
      ),
      onFilter: (value, record) => isInDateRange(value, record.archivedAt),
      filteredValue: tableFilters.archivedAt || null,
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

  return (
    <div className="main main-container">
      <Header />
      <div className="main-content">
        <div className="page-title">
          <div className="arrows" onClick={handleBack}>
            <MdOutlineKeyboardArrowLeft />
          </div>
          <p className="heading">Queue History</p>
        </div>

        <div className="table-functions">
          <div className="left-tools">
            <Button icon={<FiFilter />} onClick={handleClearFilters}>Clear Filter</Button>
            <Button icon={<HiOutlineRefresh />} onClick={() => fetchArchivedQueueHistory(searchTerm)}>Refresh</Button>
            <Button icon={<BiExport />} onClick={handleExport}>Export</Button>
          </div>
          <div className="right-tools">
            <Input
              placeholder="Search Record"
              allowClear
              style={{ width: 300 }}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              suffix={<FaSearch style={{ color: '#aaa' }} />}
            />
          </div>
        </div>

        {/* Queue History Table */}
        <Table
          style={{ width: '100%', flex: 1 }}
          columns={columns}
          dataSource={filteredData.length > 0 ? filteredData : dataSource}
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

export default QueueHistory;