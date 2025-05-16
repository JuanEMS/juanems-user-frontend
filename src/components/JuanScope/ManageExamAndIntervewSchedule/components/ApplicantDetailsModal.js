import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    EyeOutlined,
} from "@ant-design/icons";
import {
    Button,
    Card,
    Col,
    Descriptions,
    Modal,
    Row,
    Space,
    Tag,
    Typography,
    notification
} from "antd";
import React, { useState } from "react";
import { STATUS_COLORS, formatDate } from "./utils";

const { Title } = Typography;

const ApplicantDetailsModal = ({
    visible,
    applicant,
    onClose,
    onStatusUpdate,
}) => {
    const [updateLoading, setUpdateLoading] = useState(false);
    
    if (!applicant) return null;

    // Render status tag helper
    const renderStatusTag = (status) => {
        const color = STATUS_COLORS[status] || "default";
        return <Tag color={color}>{status}</Tag>;
    };
    
    // Handle status update
    const handleStatusUpdate = async (newStatus) => {
        console.group(`🔄 ${newStatus.toUpperCase()} ACTION INITIATED FROM MODAL`);
        console.log("Applicant ID:", applicant._id);
        console.log("Applicant ID (readable):", applicant.applicantID);
        console.log("Applicant Name:", `${applicant.firstName} ${applicant.lastName}`);
        console.log("Current Status:", applicant.admissionExamDetailsStatus);
        console.log("Target Status:", newStatus);
        console.groupEnd();
        
        setUpdateLoading(true);
        try {
            // Call the parent component's status update function
            await onStatusUpdate(applicant, newStatus);
            
            // Success notification is handled in the parent component
        } catch (error) {
            console.error("Error updating status from modal:", error);
            notification.error({
                message: "Error",
                description: "Failed to update application status",
            });
        } finally {
            setUpdateLoading(false);
        }
    };

    return (
        <Modal
            title={
                <div className="flex items-center">
                    <EyeOutlined className="mr-2 text-blue-500" />
                    <span className="text-lg font-medium">
                        Applicant Detail Information
                    </span>
                </div>
            }
            open={visible}
            onCancel={onClose}
            footer={[
                <Space key="actions">
                    <Button 
                        key="reject" 
                        danger
                        icon={<CloseCircleOutlined />}
                        onClick={() => handleStatusUpdate("Rejected")}
                        loading={updateLoading}
                        disabled={applicant?.interviewStatus === "Rejected" || applicant?.examStatus === "Rejected"}
                    >
                        Reject
                    </Button>
                    <Button 
                        key="approve" 
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        onClick={() => handleStatusUpdate("Approved")}
                        loading={updateLoading}
                        disabled={applicant?.interviewStatus === "Approved" || applicant?.examStatus === "Approved"}
                        style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
                    >
                        Approve
                    </Button>
                    <Button key="close" onClick={onClose}>
                        Close
                    </Button>
                </Space>
            ]}
            width={800}
            centered
        >
            <div className="p-2">
                <Card
                    className="mb-4 border-l-4"
                    style={{ borderLeftColor: "#1890ff" }}
                >
                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <div className="text-center mb-4">
                                <Title level={4} style={{ margin: 0 }} className="mb-1">
                                    {applicant.firstName}{" "}
                                    {applicant.middleName}{" "}
                                    {applicant.lastName}
                                </Title>
                                <Tag color="blue" className="text-base px-3 py-1">
                                    {applicant.applicantID}
                                </Tag>
                            </div>
                        </Col>
                    </Row>
                </Card>

                <Descriptions
                    title="Personal Information"
                    bordered
                    size="middle"
                    column={{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }}
                    className="mb-4"
                >
                    <Descriptions.Item label="First Name">
                        {applicant.firstName}
                    </Descriptions.Item>
                    <Descriptions.Item label="Middle Name">
                        {applicant.middleName || "N/A"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Last Name">
                        {applicant.lastName}
                    </Descriptions.Item>
                    <Descriptions.Item label="Gender">
                        {applicant.gender || "Not specified"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Email" span={2}>
                        {applicant.email}
                    </Descriptions.Item>
                    <Descriptions.Item label="Mobile Number">
                        {applicant.mobile}
                    </Descriptions.Item>
                    <Descriptions.Item label="Address" span={2}>
                        {applicant.address || "No address provided"}
                    </Descriptions.Item>
                </Descriptions>

                <Descriptions
                    title="Academic Information"
                    bordered
                    size="middle"
                    column={{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }}
                    className="mb-4"
                >
                    <Descriptions.Item label="Academic Level">
                        <Tag color="blue">{applicant.academicLevel}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Academic Strand">
                        <Tag color="cyan">{applicant.academicStrand}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Academic Year">
                        {applicant.academicYear}
                    </Descriptions.Item>
                    <Descriptions.Item label="Previous School">
                        {applicant.previousSchool || "N/A"}
                    </Descriptions.Item>
                </Descriptions>

                <Descriptions
                    title="Application Status"
                    bordered
                    size="middle"
                    column={{ xxl: 3, xl: 3, lg: 3, md: 3, sm: 1, xs: 1 }}
                    className="mb-4"
                >
                    <Descriptions.Item label="Admission Status">
                        {renderStatusTag(applicant.admissionAdminFirstStatus)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Interview Status">
                        {renderStatusTag(
                            applicant.interviewStatus || "Pending"
                        )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Exam Details Status">
                        {renderStatusTag(applicant.examStatus || "Pending")}
                    </Descriptions.Item>
                </Descriptions>

                <Descriptions
                    title="Additional Information"
                    bordered
                    size="middle"
                    column={{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }}
                >
                    <Descriptions.Item label="Application Date">
                        {formatDate(applicant.createdAt)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Last Updated">
                        {formatDate(applicant.updatedAt)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Notes" span={2}>
                        {applicant.notes || "No additional notes"}
                    </Descriptions.Item>
                </Descriptions>

            </div>
        </Modal>
    );
};

export default ApplicantDetailsModal;