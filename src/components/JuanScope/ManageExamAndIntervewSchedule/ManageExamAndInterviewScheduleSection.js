import {
  CalendarOutlined,
  FilterOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  notification,
  Skeleton,
} from "antd";
import dayjs from "dayjs";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  getAllApplicantsOngoingExamAndInterviewSchedule,
  updateApplicantExamAndScheduleDataApiRequest,
} from "../../../api/applicant";
import "../../../css/UserAdmin/Global.css";
import Footer from "../../UserAdmin/Footer";
import Header from "../../UserAdmin/Header";
import ExamScheduleModal from "./ExamScheduleModal";

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

// Academic level options - extracted to avoid recreating these objects on each render
const ACADEMIC_LEVEL_OPTIONS = [
  { text: "Grade 11", value: "Grade 11" },
  { text: "Grade 12", value: "Grade 12" },
];

// Academic strand options
const ACADEMIC_STRAND_OPTIONS = [
  { value: "STEM", label: "STEM" },
  { value: "HUMSS", label: "HUMSS" },
  { value: "ABM", label: "ABM" },
  { value: "TVL", label: "TVL" },
  { value: "GAS", label: "GAS" },
];

// Status tag colors mapping
const STATUS_COLORS = {
  Complete: "success",
  Incomplete: "warning",
  Pending: "processing",
  "On-going": "blue",
  Required: "error",
};

const TableSkeleton = () => {
  return (
    <div className="skeleton-table">
      <div className="skeleton-header">
        {Array(8)
          .fill(null)
          .map((_, index) => (
            <div key={`header-${index}`} className="skeleton-cell">
              <Skeleton.Button active style={{ width: "100%", height: 32 }} />
            </div>
          ))}
      </div>

      {Array(5)
        .fill(null)
        .map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="skeleton-row">
            {Array(8)
              .fill(null)
              .map((_, cellIndex) => (
                <div
                  key={`cell-${rowIndex}-${cellIndex}`}
                  className="skeleton-cell"
                >
                  <Skeleton.Button
                    active
                    style={{ width: "100%", height: 24 }}
                  />
                </div>
              ))}
          </div>
        ))}

      <div className="skeleton-pagination">
        <Skeleton.Button active style={{ width: 400, height: 32 }} />
      </div>

      <style jsx>{`
        .skeleton-table {
          width: 100%;
          background: #fff;
          border: 1px solid #f0f0f0;
          border-radius: 2px;
          padding: 16px;
        }
        .skeleton-header,
        .skeleton-row {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 16px;
          margin-bottom: 16px;
        }
        .skeleton-cell {
          min-height: 24px;
        }
        .skeleton-pagination {
          margin-top: 16px;
          display: flex;
          justify-content: flex-end;
        }
      `}</style>
    </div>
  );
};

const ManageExamAndInterviewScheduleSection = () => {
  // State variables
  const [allApplicants, setAllApplicants] = useState([]); // Store all applicants
  const [filteredApplicants, setFilteredApplicants] = useState([]); // Store filtered applicants
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [academicLevelFilter, setAcademicLevelFilter] = useState(null);
  const [academicStrandFilter, setAcademicStrandFilter] = useState(null);
  const [isScheduleModalVisible, setIsScheduleModalVisible] = useState(false);
  const [currentApplicant, setCurrentApplicant] = useState(null);
  const [scheduleForm] = Form.useForm();

  // Fetch all applicants data from API
  const fetchApplicants = useCallback(async () => {
    setLoading(true);
    try {
      // We're not passing filters to the API anymore as we'll filter locally
      const result = await getAllApplicantsOngoingExamAndInterviewSchedule(
        1, // Starting page
        1000 // Get a larger batch of records to filter locally
      );

      if (result.success) {
        setAllApplicants(result.data.applicants);
        // Initially, set filtered applicants to all applicants
        setFilteredApplicants(result.data.applicants);
        setPagination({
          current: 1,
          pageSize: 10,
          total: result.data.applicants.length,
        });
      } else {
        notification.error({
          message: "Error",
          description: result.error || "Failed to load applicants data",
        });
      }
    } catch (error) {
      console.error("Error fetching applicants:", error);
      notification.error({
        message: "Error",
        description: "An unexpected error occurred while fetching applicants",
      });
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, []);

  // Apply filters to the data
  const applyFilters = useCallback(() => {
    setLoading(true);

    // Start with all applicants
    let result = [...allApplicants];

    // Apply search filter (case-insensitive) on firstName, lastName, or applicantID
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      result = result.filter(
        (applicant) =>
          (applicant.firstName &&
            applicant.firstName.toLowerCase().includes(searchLower)) ||
          (applicant.lastName &&
            applicant.lastName.toLowerCase().includes(searchLower)) ||
          (applicant.applicantID &&
            applicant.applicantID.toLowerCase().includes(searchLower))
      );
    }

    // Apply academic level filter
    if (academicLevelFilter) {
      result = result.filter(
        (applicant) => applicant.academicLevel === academicLevelFilter
      );
    }

    // Apply academic strand filter
    if (academicStrandFilter) {
      result = result.filter(
        (applicant) => applicant.academicStrand === academicStrandFilter
      );
    }

    // Update filtered applicants and pagination
    setFilteredApplicants(result);
    setPagination((prev) => ({
      ...prev,
      current: 1, // Reset to first page when filters change
      total: result.length,
    }));

    setLoading(false);
  }, [allApplicants, searchText, academicLevelFilter, academicStrandFilter]);

  // Load data on component mount
  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  // Apply filters whenever filter criteria change
  useEffect(() => {
    if (allApplicants.length > 0) {
      applyFilters();
    }
  }, [
    allApplicants,
    searchText,
    academicLevelFilter,
    academicStrandFilter,
    applyFilters,
  ]);

  // Handle table pagination change - this is now just local pagination
  const handleTableChange = (pagination) => {
    setPagination((prev) => ({
      ...prev,
      current: pagination.current,
      pageSize: pagination.pageSize,
    }));
  };

  // Handle search functionality - now just updates state to trigger filter effect
  const handleSearch = () => {
    // The useEffect will handle the actual filtering
  };

  // Handle refresh - resets filters and fetches data again
  const handleRefresh = () => {
    setSearchText("");
    setAcademicLevelFilter(null);
    setAcademicStrandFilter(null);
    fetchApplicants();
  };

  // Open schedule modal
  const handleScheduleClick = useCallback(
    (applicant) => {
      setCurrentApplicant(applicant);

      // Pre-fill the form with existing data if available
      const prefDate = applicant.preferredExamAndInterviewDate
        ? dayjs(applicant.preferredExamAndInterviewDate)
        : null;

      const approvedDate = applicant.approvedExamDate
        ? dayjs(applicant.approvedExamDate)
        : null;

      const approvedTime = applicant.approvedExamTime
        ? dayjs(applicant.approvedExamTime, "HH:mm")
        : null;

      scheduleForm.setFieldsValue({
        preferredDate: prefDate,
        approvedDate: approvedDate,
        approvedTime: approvedTime,
        approvedRoom: applicant.approvedExamRoom || "",
        approvedFeeAmount: applicant.approvedExamFeeAmount || 500,
      });

      setIsScheduleModalVisible(true);
    },
    [scheduleForm]
  );

  // Handle schedule form submission
  const handleScheduleSubmit = async () => {
    try {
      // Validate form fields
      const values = await scheduleForm.validateFields();

      // Prepare schedule data
      const scheduleData = {
        approvedExamDate:
          values.approvedDate.format("YYYY-MM-DDTHH:mm:ss.000") + "Z",
        approvedExamTime: values.approvedTime.format("HH:mm"),
        approvedExamRoom: values.approvedRoom,
        approvedExamFeeAmount: values.approvedFeeAmount,
        approvedExamFeeStatus: values.approvedExamFeeStatus,
      };

      // Add preferred date if it's set in the form and applicant doesn't have one
      if (
        values.preferredDate &&
        !currentApplicant.preferredExamAndInterviewDate
      ) {
        scheduleData.preferredExamAndInterviewDate =
          values.preferredDate.format("YYYY-MM-DDTHH:mm:ss.000") + "Z";
      }

      // Call the API to update the applicant's schedule
      const result = await updateApplicantExamAndScheduleDataApiRequest(
        currentApplicant._id,
        scheduleData
      );

      // Handle the API response
      if (result.success) {
        notification.success({
          message: "Success",
          description: "Exam schedule updated successfully",
        });

        // Update the applicant in both state arrays
        const updatedAllApplicants = allApplicants.map((app) =>
          app._id === currentApplicant._id
            ? { ...app, ...scheduleData, admissionAdminFirstStatus: "Approved" }
            : app
        );

        const updatedFilteredApplicants = filteredApplicants.map((app) =>
          app._id === currentApplicant._id
            ? { ...app, ...scheduleData, admissionAdminFirstStatus: "Approved" }
            : app
        );

        setAllApplicants(updatedAllApplicants);
        setFilteredApplicants(updatedFilteredApplicants);
        setIsScheduleModalVisible(false);
      } else {
        notification.error({
          message: "Error",
          description: result.error || "Failed to update exam schedule",
        });
      }
    } catch (error) {
      console.error("Form validation or submission error:", error);
      notification.error({
        message: "Error",
        description: "Please check the form fields and try again",
      });
    }
  };

  // Status tag renderer - memoized to avoid recreating on each render
  const renderStatusTag = useCallback((status) => {
    const color = STATUS_COLORS[status] || "default";
    return <Tag color={color}>{status}</Tag>;
  }, []);

  // Memoize table columns to prevent recreation on each render
  const columns = useMemo(
    () => [
      {
        title: "Applicant ID",
        dataIndex: "applicantID",
        key: "applicantID",
        width: 120,
        fixed: "left",
        render: (text) => <strong>{text}</strong>,
        sorter: (a, b) => a.applicantID.localeCompare(b.applicantID),
      },
      {
        title: "Name",
        key: "name",
        fixed: "left",
        width: 200,
        render: (_, record) => (
          <span>
            {`${record.lastName}, ${record.firstName} ${
              record.middleName ? record.middleName.charAt(0) + "." : ""
            }`}
          </span>
        ),
        sorter: (a, b) => a.lastName.localeCompare(b.lastName),
      },
      {
        title: "Contact Information",
        children: [
          {
            title: "Email",
            dataIndex: "email",
            key: "email",
            width: 220,
          },
          {
            title: "Mobile",
            dataIndex: "mobile",
            key: "mobile",
            width: 150,
          },
        ],
      },
      {
        title: "Academic Details",
        children: [
          {
            title: "Level",
            dataIndex: "academicLevel",
            key: "academicLevel",
            width: 120,
          },
          {
            title: "Strand",
            dataIndex: "academicStrand",
            key: "academicStrand",
            width: 100,
          },
          {
            title: "Year",
            dataIndex: "academicYear",
            key: "academicYear",
            width: 120,
          },
        ],
      },
      {
        title: "Application Status",
        children: [
          {
            title: "Registration",
            dataIndex: "registrationStatus",
            key: "registrationStatus",
            width: 130,
            render: renderStatusTag,
          },
          {
            title: "Exam & Interview",
            dataIndex: "preferredExamAndInterviewApplicationStatus",
            key: "preferredExamAndInterviewApplicationStatus",
            width: 150,
            render: renderStatusTag,
          },
          {
            title: "Admin First Status",
            dataIndex: "admissionAdminFirstStatus",
            key: "admissionAdminFirstStatus",
            width: 150,
            render: renderStatusTag,
          },
          {
            title: "Exam Details",
            dataIndex: "admissionExamDetailsStatus",
            key: "admissionExamDetailsStatus",
            width: 130,
            render: renderStatusTag,
          },
        ],
      },
      {
        title: "Exam Schedule",
        children: [
          {
            title: "Preferred Date",
            key: "preferredDate",
            width: 150,
            render: (_, record) =>
              record.preferredExamAndInterviewDate ? (
                dayjs(record.preferredExamAndInterviewDate).format(
                  "MMM DD, YYYY"
                )
              ) : (
                <span className="text-red-500">Not Set</span>
              ),
          },
          {
            title: "Approved Date",
            key: "approvedDate",
            width: 150,
            render: (_, record) =>
              record.approvedExamDate
                ? dayjs(record.approvedExamDate).format("MMM DD, YYYY")
                : "Not Set",
          },
          {
            title: "Approved Time",
            dataIndex: "approvedExamTime",
            key: "approvedExamTime",
            width: 120,
          },
          {
            title: "Room",
            dataIndex: "approvedExamRoom",
            key: "approvedExamRoom",
            width: 120,
          },
        ],
      },
      {
        title: "Actions",
        key: "actions",
        fixed: "right",
        width: 120,
        render: (_, record) => (
          <Space>
            <Button type="primary" onClick={() => handleScheduleClick(record)}>
              {record.preferredExamAndInterviewDate ? "Edit" : "Set Schedule"}
            </Button>
          </Space>
        ),
      },
    ],
    [renderStatusTag, handleScheduleClick]
  );

  return (
    <div className="flex flex-col min-h-screen w-full">
      <Header />
      <div className="flex-grow p-6 bg-gray-50 w-full">
        <Card className="shadow-md">
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <div className="flex items-center gap-2 mb-2">
                <CalendarOutlined className="text-blue-600 text-xl" />
                <Title level={4} style={{ margin: 0 }}>
                  Manage Exam &amp; Interview Schedules
                </Title>
              </div>
              <Text type="secondary">
                View and manage applicants with admission status that requires
                exam and interview scheduling
              </Text>
            </Col>

            {/* Filters and controls */}
            <Col span={24}>
              <Card size="small" className="bg-gray-50">
                <Row gutter={[16, 16]} align="middle">
                  <Col xs={24} md={8}>
                    <Search
                      placeholder="Search by name or ID"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      onSearch={handleSearch}
                      enterButton
                    />
                  </Col>
                  <Col xs={24} md={6}>
                    <Select
                      placeholder="Academic Level"
                      style={{ width: "100%" }}
                      allowClear
                      value={academicLevelFilter}
                      onChange={(value) => setAcademicLevelFilter(value)}
                    >
                      {ACADEMIC_LEVEL_OPTIONS.map((option) => (
                        <Option key={option.value} value={option.value}>
                          {option.text}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                  <Col xs={24} md={6}>
                    <Select
                      placeholder="Academic Strand"
                      style={{ width: "100%" }}
                      allowClear
                      value={academicStrandFilter}
                      onChange={(value) => setAcademicStrandFilter(value)}
                    >
                      {ACADEMIC_STRAND_OPTIONS.map((option) => (
                        <Option key={option.value} value={option.value}>
                          {option.label}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                  <Col xs={24} md={4}>
                    <Space>
                      <Button
                        icon={<FilterOutlined />}
                        type="primary"
                        onClick={handleSearch}
                        disabled={loading}
                      >
                        Apply Filters
                      </Button>
                      <Button
                        icon={<ReloadOutlined />}
                        onClick={handleRefresh}
                        disabled={loading}
                      >
                        Reset
                      </Button>
                    </Space>
                  </Col>
                </Row>
              </Card>
            </Col>

            {/* Table with skeleton loading */}
            <Col span={24}>
              {initialLoading ? (
                <TableSkeleton />
              ) : (
                <div className="relative">
                  {loading && (
                    <div className="absolute inset-0 bg-white bg-opacity-70 z-10 flex items-center justify-center">
                      <Spin size="large" tip="Loading data..." />
                    </div>
                  )}
                  <Table
                    columns={columns}
                    dataSource={filteredApplicants}
                    rowKey="_id"
                    pagination={{
                      ...pagination,
                      showSizeChanger: true,
                      showTotal: (total) => `Total ${total} applicants`,
                      pageSizeOptions: ["10", "20", "50"],
                    }}
                    onChange={handleTableChange}
                    scroll={{ x: 1800 }}
                    size="middle"
                    bordered
                    className="custom-admin-table"
                  />
                </div>
              )}
            </Col>
          </Row>
        </Card>
      </div>
      <Footer />

      {/* Exam Schedule Modal Component */}
      <ExamScheduleModal
        visible={isScheduleModalVisible}
        onCancel={() => setIsScheduleModalVisible(false)}
        onSubmit={handleScheduleSubmit}
        currentApplicant={currentApplicant}
        form={scheduleForm}
      />
    </div>
  );
};

export default ManageExamAndInterviewScheduleSection;
