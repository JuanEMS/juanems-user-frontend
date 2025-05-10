import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Button, List, Skeleton, Form, message, Input, DatePicker, Select, Divider, Card, Typography, Badge, Tag, Tooltip, Radio, Switch } from 'antd';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import utc from 'dayjs/plugin/utc';

import { MdOutlineKeyboardArrowLeft } from 'react-icons/md';
import { FaUser, FaEye, FaArchive, FaUndo } from "react-icons/fa";
import { PlusOutlined, ClockCircleOutlined, InboxOutlined } from '@ant-design/icons';

import '../../css/UserAdmin/Global.css';
import '../../css/UserAdmin/CreateAnnouncement.css';

import Footer from './Footer';
import Header from './Header';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

dayjs.extend(utc);
dayjs.extend(isBetween);
const PAGE_SIZE = 3;

const CreateAnnouncementsPage = () => {
  const navigate = useNavigate();
  const [initLoading, setInitLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [allAnnouncements, setAllAnnouncements] = useState([]);
  const [data, setData] = useState([]);
  const [list, setList] = useState([]);
  const [userName, setUserName] = useState('');
  const [userID, setUserID] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin');
    }

    const fullName = localStorage.getItem('fullName') || 'Administrator';
    const userID = localStorage.getItem('userID');

    setUserName(fullName);
    setUserID(userID); // Store userID in state

    // Fetch user's announcements once we have the userID
    if (userID) {
      fetchUserAnnouncements(userID);
    }
  }, [navigate]);

  // Filter announcements based on the showArchived toggle
  useEffect(() => {
    if (allAnnouncements.length > 0) {
      const filteredData = allAnnouncements.filter(announcement =>
        showArchived ? announcement.status === 'Inactive' : announcement.status !== 'Inactive'
      );

      setData(filteredData);
      setList(filteredData);
    }
  }, [showArchived, allAnnouncements]);

  // New function to fetch announcements by userID
  const fetchUserAnnouncements = async (userID) => {
    setInitLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/announcements/by-user/${userID}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setAllAnnouncements(result.announcements);

        // Filter based on showArchived toggle state
        const filteredData = result.announcements.filter(announcement =>
          showArchived ? announcement.status === 'Inactive' : announcement.status !== 'Inactive'
        );

        setData(filteredData);
        setList(filteredData);
      } else {
        message.error(result.message || 'Failed to fetch announcements');
      }
    } catch (error) {
      console.error('Error fetching user announcements:', error);
      message.error('Failed to load your announcements');
    } finally {
      setInitLoading(false);
    }
  };

  const handleToggleArchived = (checked) => {
    setShowArchived(checked);
    // Reset form and preview when switching views
    setShowForm(false);
    setShowPreview(false);
    setEditingAnnouncement(null);
  };

  const onLoadMore = async () => {
    // If we're using the API pagination, we would implement this differently
    // For now, let's just simulate loading more items from the current data set
    if (data.length <= list.length) {
      message.info('No more announcements to load');
      return;
    }

    setLoading(true);
    setList(list.concat(Array.from({ length: PAGE_SIZE }).map(() => ({ loading: true }))));

    // Simulate loading delay
    setTimeout(() => {
      const nextItems = data.slice(list.length, list.length + PAGE_SIZE);
      setList(prevList => {
        const newList = [...prevList];
        // Remove loading placeholders
        return newList.slice(0, newList.length - PAGE_SIZE).concat(nextItems);
      });
      setLoading(false);
    }, 1000);
  };

  // Define loadMore button/functionality for the List component
  const loadMore = (
    <div
      style={{
        textAlign: 'center',
        marginTop: 12,
        height: 32,
        lineHeight: '32px',
      }}
    >
      {list.length < data.length ? (
        <Button onClick={onLoadMore} loading={loading}>
          Load More
        </Button>
      ) : (
        list.length > 0 && <div>No more announcements</div>
      )}
    </div>
  );

  const handleBack = () => navigate('/admin/dashboard');

  const handleCreateAnnouncement = () => {
    // Reset form and preview
    form.resetFields();
    setShowPreview(false);
    setEditingAnnouncement(null);
    setShowForm(true);
    message.info('Create a new announcement');
  };

  const handleEditAnnouncement = (announcement) => {
    setEditingAnnouncement(announcement);

    // Prepare dateRange for form
    const startDate = dayjs(announcement.startDate);
    const endDate = dayjs(announcement.endDate);
    const dateRange = [startDate, endDate];

    // Set form values
    form.setFieldsValue({
      ...announcement,
      dateRange
    });

    setShowPreview(false);
    setShowForm(true);
    message.info('Edit announcement');
  };

  const handlePreview = () => {
    form.validateFields().then(values => {
      // Store the complete form values in previewData for later submission
      setPreviewData({ ...values });
      setShowPreview(true);
    }).catch(info => {
      message.error('Please fill in all required fields before preview');
    });
  };

  const handleClearForm = () => {
    form.resetFields();
    setShowPreview(false);
    message.success('Form cleared successfully');
  };

  const handleCancel = () => {
    setShowForm(false);
    setShowPreview(false);
    setEditingAnnouncement(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      // If we're in preview mode, use the previewData
      // Otherwise, validate the form fields
      let values;
      if (showPreview) {
        values = previewData;
      } else {
        values = await form.validateFields();
      }
      console.log('Submitting:', values);

      message.loading('Processing announcement...', 0);

      // Extract dateRange from form values and format it properly
      const { dateRange, ...otherValues } = values;

      // Create announcement data with proper startDate and endDate fields
      const announcementData = {
        ...otherValues,
        startDate: dateRange[0].toISOString ? dateRange[0].toISOString() : dateRange[0],  // Handle both dayjs object and string
        endDate: dateRange[1].toISOString ? dateRange[1].toISOString() : dateRange[1],    // Handle both dayjs object and string
        announcer: userName || 'System',
        userID: userID  // Include the userID in the announcement data
      };

      // Determine if we're creating or updating
      const endpoint = editingAnnouncement
        ? `${process.env.REACT_APP_API_URL}/api/announcements/update-announcement/${editingAnnouncement._id}`
        : `${process.env.REACT_APP_API_URL}/api/announcements/create-announcement`;

      const method = editingAnnouncement ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(announcementData)
      });

      const data = await response.json();

      message.destroy();

      if (response.ok && data.success) {
        message.success(editingAnnouncement
          ? 'Announcement updated successfully!'
          : 'Announcement posted successfully!');

        // Get values from localStorage for system logs
        const fullName = localStorage.getItem('fullName');
        const role = localStorage.getItem('role');
        const userID = localStorage.getItem('userID');

        // Log the action
        const logAction = editingAnnouncement ? 'Update' : 'Create';

        // Create detailed log message
        const logDetail = editingAnnouncement
          ? `Updated announcement [ID: ${editingAnnouncement._id}]}`
          : `Created new announcement`;

        const logData = {
          userID: userID,
          accountName: fullName,
          role: role,
          action: logAction,
          detail: logDetail,
        };

        // Make API call to save the system log
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
          })
          .catch(error => {
            console.error('Failed to record system log:', error);
          });

        form.resetFields();
        setShowPreview(false);
        setShowForm(false);
        setEditingAnnouncement(null);

        // Refresh the announcement list after successful submission
        fetchUserAnnouncements(userID);
      } else {
        message.error(data.message || 'Failed to process announcement');
      }
    } catch (error) {
      message.destroy();
      console.error('Error processing announcement:', error);

      if (error.response && error.response.data && error.response.data.errors) {
        // Display specific validation errors from backend
        const errorMessages = error.response.data.errors.join(', ');
        message.error(`Validation failed: ${errorMessages}`);
      } else {
        message.error('Failed to process announcement. Please try again.');
      }
    }
  }

  // Updated function to handle archiving with system logs
  const handleArchiveAnnouncement = async (id) => {
    try {
      message.loading('Archiving announcement...', 0);

      // Fetch announcement details before archiving to include in logs
      const detailsResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/announcements/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!detailsResponse.ok) {
        throw new Error('Failed to fetch announcement details');
      }

      const announcementDetails = await detailsResponse.json();
      const { title, category } = announcementDetails.data || {};

      // Proceed with archiving
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/announcements/archive/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();
      message.destroy();

      if (response.ok && result.success) {
        message.success('Announcement archived successfully');

        // Log the action using the current user's info
        const adminID = localStorage.getItem('userID');
        const adminName = localStorage.getItem('fullName');
        const adminRole = localStorage.getItem('role');

        const logDetail = `Archived announcement [ID: ${id}])`;

        const logData = {
          userID: adminID,
          accountName: adminName,
          role: adminRole,
          action: 'Archive',
          detail: logDetail,
        };

        await fetch(`${process.env.REACT_APP_API_URL}/api/admin/system-logs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(logData)
        });

        // Refresh the announcement list
        fetchUserAnnouncements(userID);
      } else {
        message.error(result.message || 'Failed to archive announcement');
      }
    } catch (error) {
      message.destroy();
      console.error('Error archiving announcement:', error);
      message.error('Failed to archive announcement. Please try again.');
    }
  };

  // Updated function to handle unarchiving with system logs
  const handleUnarchiveAnnouncement = async (id) => {
    try {
      message.loading('Unarchiving announcement...', 0);

      // Fetch announcement details before unarchiving to include in logs
      const detailsResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/announcements/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!detailsResponse.ok) {
        throw new Error('Failed to fetch announcement details');
      }

      const announcementDetails = await detailsResponse.json();
      const { title, category } = announcementDetails.data || {};

      // Proceed with unarchiving
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/announcements/unarchive/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();
      message.destroy();

      if (response.ok && result.success) {
        message.success('Announcement unarchived successfully');

        // Log the action using the current user's info
        const adminID = localStorage.getItem('userID');
        const adminName = localStorage.getItem('fullName');
        const adminRole = localStorage.getItem('role');

        const logDetail = `Unarchived announcement [ID: ${id}])`;

        const logData = {
          userID: adminID,
          accountName: adminName,
          role: adminRole,
          action: 'Unarchive',
          detail: logDetail,
        };

        await fetch(`${process.env.REACT_APP_API_URL}/api/admin/system-logs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(logData)
        });

        // Refresh the announcement list
        fetchUserAnnouncements(userID);
      } else {
        message.error(result.message || 'Failed to unarchive announcement');
      }
    } catch (error) {
      message.destroy();
      console.error('Error unarchiving announcement:', error);
      message.error('Failed to unarchive announcement. Please try again.');
    }
  };

  const getAudienceColor = (audience) => {
    const colors = {
      'Applicants': 'blue',
      'Students': 'green',
      'Staffs': 'orange',
      'Faculty': 'purple',
      'Admissions': 'cyan',
      'Registrar': 'magenta',
      'Accounting': 'gold',
      'IT': 'geekblue',
      'Administration': 'red',
      'All Users': 'volcano'
    };
    return colors[audience] || 'default';
  };

  const renderAudienceTag = (audience) => {
    return <Tag color={getAudienceColor(audience)}>{audience}</Tag>;
  };

  // Function to get priority badge color
  const getPriorityColor = (priority) => {
    const colors = {
      'important': 'red',
      'urgent': 'orange',
      'info': 'blue'
    };
    return colors[priority] || 'blue';
  };

  // Render priority badge
  const renderPriorityBadge = (priority) => {
    if (!priority) return null;

    const colorMap = {
      'important': '#f5222d', // red
      'urgent': '#fa8c16',    // orange
      'info': '#1890ff'       // blue
    };

    const textMap = {
      'important': 'Important',
      'urgent': 'Urgent',
      'info': 'Info'
    };

    return (
      <Badge
        color={colorMap[priority] || '#1890ff'}
        text={textMap[priority] || 'Info'}
      />
    );
  };

  // Format date range for display
  const formatDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return '';
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    return `${start.format('MMM DD, YYYY')} - ${end.format('MMM DD, YYYY')}`;
  };

  // Get status badge for announcements
  const getStatusBadge = (status, endDate) => {
    if (!status) return null;

    const now = dayjs();
    const end = dayjs(endDate);
    const daysRemaining = end.diff(now, 'day');

    switch (status) {
      case 'Active':
        return <Badge status="processing" text={
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {daysRemaining > 0 ? `Expires in ${daysRemaining} days` : 'Expires today'}
          </Text>
        } />;
      case 'Draft':
        return <Badge status="warning" text={<Text type="secondary" style={{ fontSize: '12px' }}>Draft</Text>} />;
      case 'Inactive':
        return <Badge status="default" text={<Text type="secondary" style={{ fontSize: '12px' }}>Archived</Text>} />;
      default:
        return null;
    }
  };

  // Render the default empty state when no form is showing
  const renderEmptyState = () => (
    <div className="empty-state">
      <div className="empty-state-content">
        <Title level={4}>No Announcement Selected</Title>
        <Paragraph>
          Select an announcement to edit or click "New" to create a new announcement.
        </Paragraph>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateAnnouncement}
          disabled={showArchived}
        >
          Create New Announcement
        </Button>
      </div>
    </div>
  );

  // Determine what action buttons to show based on announcement status
  const getActionButtons = (item) => {
    if (item.status === 'Inactive') {
      return [
        <Tooltip title="Edit">
          <Button
            type="text"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleEditAnnouncement(item);
            }}
          >
            Edit
          </Button>
        </Tooltip>,
        <Tooltip title="Unarchive">
          <Button
            type="text"
            icon={<FaUndo />}
            style={{ color: '#52c41a' }} // Green color for unarchive
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleUnarchiveAnnouncement(item._id);
            }}
          >
            Unarchive
          </Button>
        </Tooltip>
      ];
    } else {
      return [
        <Tooltip title="Edit">
          <Button
            type="text"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleEditAnnouncement(item);
            }}
          >
            Edit
          </Button>
        </Tooltip>,
        <Tooltip title="Archive">
          <Button
            type="text"
            icon={<FaArchive />}
            danger
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleArchiveAnnouncement(item._id);
            }}
          >
            Archive
          </Button>
        </Tooltip>
      ];
    }
  };

  // Get the appropriate empty state message based on the showArchived toggle
  const getEmptyListMessage = () => {
    return showArchived
      ? 'No archived announcements found'
      : 'No active announcements found';
  };

  return (
    <div className="main main-container">
      <Header />
      <div className="main-content">
        <div className="page-title">
          <div className="arrows" onClick={handleBack}>
            <MdOutlineKeyboardArrowLeft />
          </div>
          <p className="heading">Create Announcements</p>
        </div>
        <div className='container-columns'>
          <div className='column announcement-sidebar'>
            <Card
              title="My Announcements"
              bordered={false}
              className='announcement-list-card'
              extra={
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center'}}>
                      <Text type={showArchived ? "secondary" : "primary"}>Active</Text>
                      <Switch
                        checked={showArchived}
                        onChange={handleToggleArchived}
                        style={{ margin: '0 8px' }}
                      />
                      <Text type={showArchived ? "primary" : "secondary"}>Archived</Text>
                    </div>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreateAnnouncement}
                    size="small"
                    disabled={showArchived}
                  >
                    New
                  </Button>
                </div>
              }
            >

              <div className='announcement-list-scroll'>
                <List
                  className="announcement-list"
                  loading={initLoading}
                  itemLayout="horizontal"
                  loadMore={loadMore}
                  dataSource={list}
                  locale={{ emptyText: getEmptyListMessage() }}
                  pagination={false} /* Disable default pagination to use our custom load more */
                  renderItem={item => (
                    <List.Item
                      className="announcement-list-item"
                      onClick={() => handleEditAnnouncement(item)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="announcement-item-wrapper">
                        <Skeleton avatar title={false} loading={item.loading} active>
                          <List.Item.Meta
                            avatar={<Avatar icon={<FaUser />} style={{ backgroundColor: '#1890ff' }} />}
                            title={
                              <div className="announcement-item-header">
                                <Text strong>{item.subject}</Text>
                                {getStatusBadge(item.status, item.endDate)}
                              </div>
                            }
                            description={
                              <div className="announcement-item-content">
                                <Paragraph ellipsis={{ rows: 2 }}>
                                  {item.content}
                                </Paragraph>
                                <div className="announcement-item-meta">
                                  {item.audience && renderAudienceTag(item.audience)}
                                  {item.priority && renderPriorityBadge(item.priority)}
                                  {item.startDate && item.endDate && (
                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                      <ClockCircleOutlined /> {formatDateRange(item.startDate, item.endDate)}
                                    </Text>
                                  )}
                                </div>
                              </div>
                            }
                          />
                        </Skeleton>

                        {/* Action buttons moved below the content */}
                        <div className="announcement-item-actions">
                          {item.status === 'Inactive' ? (
                            <>
                              <Button
                                type="text"
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditAnnouncement(item);
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                type="text"
                                icon={<FaUndo />}
                                style={{ color: '#52c41a' }}
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUnarchiveAnnouncement(item._id);
                                }}
                              >
                                Unarchive
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                type="text"
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditAnnouncement(item);
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                type="text"
                                icon={<FaArchive />}
                                danger
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleArchiveAnnouncement(item._id);
                                }}
                              >
                                Archive
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              </div>
            </Card>
          </div>

          <div className='column announcement-form-container'>
            <Card
              bordered={false}
              className='write-announcement-card'
              title={
                <div className="announcement-postedby">
                  <Avatar icon={<FaUser />} style={{ backgroundColor: '#1890ff' }} />
                  <div className="announcement-postedby-descrip">
                    <Text strong style={{ fontSize: '16px' }}>{userName}</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>{userID}</Text>
                  </div>
                </div>
              }
            >
              {showForm ? (
                !showPreview ? (
                  <>
                    <Form
                      form={form}
                      layout="vertical"
                      className="announcement-form"
                    >
                      <Form.Item
                        label="Subject"
                        name="subject"
                        rules={[{ required: true, message: 'Please input the subject!' }]}
                      >
                        <Input placeholder="Enter announcement subject" />
                      </Form.Item>

                      <div className="form-row">
                        <Form.Item
                          label="Target Audience"
                          name="audience"
                          rules={[{ required: true, message: 'Please select an audience!' }]}
                          className="audience-selector"
                        >
                          <Select
                            placeholder="Select the target audience"
                            options={[
                              { value: 'All Users', label: 'All Users' },
                              { value: 'Applicants', label: 'Applicants' },
                              { value: 'Students', label: 'Students' },
                              { value: 'Faculty', label: 'Faculty' },
                              { value: 'Staffs', label: 'Staffs' },
                              { value: 'Admissions', label: 'Admissions Dept.' },
                              { value: 'Registrar', label: 'Registrar Dept.' },
                              { value: 'Accounting', label: 'Accounting Dept.' },
                              { value: 'IT', label: 'IT Dept.' },
                              { value: 'Administration', label: 'Administration Dept.' },
                            ]}
                          />
                        </Form.Item>

                        <Form.Item
                          label="Active Period"
                          name="dateRange"
                          rules={[{ required: true, message: 'Please enter date range!' }]}
                          className="date-range-picker"
                        >
                          <DatePicker.RangePicker
                            style={{ width: '100%' }}
                            disabledDate={(current) => {
                              // Disable all dates before today
                              return current && current < dayjs().startOf('day');
                            }}
                          />
                        </Form.Item>
                      </div>

                      <Form.Item
                        label="Badge (Priority Level)"
                        name="priority"
                        rules={[{ required: true, message: 'Please select a priority level!' }]}
                        className="priority-selector"
                      >
                        <Radio.Group buttonStyle="solid">
                          <Radio.Button value="important" className="priority-important">
                            <Badge color="#f5222d" text="Important" />
                          </Radio.Button>
                          <Radio.Button value="urgent" className="priority-urgent">
                            <Badge color="#fa8c16" text="Urgent" />
                          </Radio.Button>
                          <Radio.Button value="info" className="priority-info">
                            <Badge color="#1890ff" text="Info" />
                          </Radio.Button>
                        </Radio.Group>
                      </Form.Item>

                      <Form.Item
                        label="Content"
                        name="content"
                        rules={[{ required: true, message: 'Please enter content!' }]}
                      >
                        <TextArea rows={8} placeholder="Write your announcement here..." />
                      </Form.Item>

                      <div className="form-actions">
                        <Button onClick={handleCancel}>Cancel</Button>
                        <Button onClick={handleClearForm}>Clear</Button>
                        <Button onClick={handlePreview} icon={<FaEye />}>Preview</Button>
                        <Button
                          type="primary"
                          onClick={handleSubmit}
                        >
                          {editingAnnouncement ? 'Update Announcement' : 'Post Announcement'}
                        </Button>
                      </div>
                    </Form>
                  </>
                ) : (
                  <div className="announcement-preview">
                    <div className="preview-header">
                      <Title level={4}>{previewData.subject}</Title>
                      <div className="preview-meta">
                        {previewData.audience && renderAudienceTag(previewData.audience)}
                        {previewData.priority && renderPriorityBadge(previewData.priority)}
                        {previewData.dateRange && (
                          <Text type="secondary">
                            <ClockCircleOutlined /> {previewData.dateRange[0].format('MMM DD, YYYY')} - {previewData.dateRange[1].format('MMM DD, YYYY')}
                          </Text>
                        )}
                      </div>
                    </div>
                    <Divider />
                    <div className="preview-content">
                      <Paragraph>
                        {previewData.content}
                      </Paragraph>
                    </div>
                    <Divider />
                    <div className="preview-actions">
                      <Button onClick={() => setShowPreview(false)}>Edit</Button>
                      <Button type="primary" onClick={handleSubmit}>
                        {editingAnnouncement ? 'Confirm & Update' : 'Confirm & Post'}
                      </Button>
                    </div>
                  </div>
                )
              ) : (
                renderEmptyState()
              )}
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CreateAnnouncementsPage;