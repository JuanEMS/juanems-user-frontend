import { CalendarOutlined, EditOutlined } from "@ant-design/icons";
import {
    Button,
    Col,
    DatePicker,
    Divider,
    Form,
    Input,
    InputNumber,
    Modal,
    Row,
    Select,
    TimePicker,
    Typography,
} from "antd";
import React from "react";

const { Text } = Typography;
const { Option } = Select;

const ExamScheduleModal = ({
    visible,
    onCancel,
    onSubmit,
    currentApplicant,
    form,
}) => {
    // Render status tag helper function
    const renderStatusTag = (status) => {
        let color = "default";

        switch (status) {
            case "Complete":
                color = "success";
                break;
            case "Incomplete":
                color = "warning";
                break;
            case "Pending":
                color = "processing";
                break;
            case "On-going":
                color = "blue";
                break;
            case "Required":
                color = "error";
                break;
            default:
                color = "default";
        }

        return <span className={`text-${color}-600`}>{status}</span>;
    };

    // Check if preferred date exists
    const hasPreferredDate = currentApplicant?.preferredExamAndInterviewDate;

    return (
        <Modal
            title={
                <div className="flex items-center gap-2">
                    <CalendarOutlined />
                    <span>Manage Exam Schedule</span>
                </div>
            }
            open={visible}
            onCancel={onCancel}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    Cancel
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={onSubmit}
                >
                    Update Schedule
                </Button>,
            ]}
            width={700}
        >
            {currentApplicant && (
                <>
                    <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Text strong>Name:</Text>{" "}
                                <Text>{`${currentApplicant.lastName}, ${currentApplicant.firstName
                                    } ${currentApplicant.middleName
                                        ? currentApplicant.middleName.charAt(0) + "."
                                        : ""
                                    }`}</Text>
                            </div>
                            <div>
                                <Text strong>ID:</Text>{" "}
                                <Text>{currentApplicant.applicantID}</Text>
                            </div>
                            <div>
                                <Text strong>Email:</Text> <Text>{currentApplicant.email}</Text>
                            </div>
                            <div>
                                <Text strong>Mobile:</Text>{" "}
                                <Text>{currentApplicant.mobile}</Text>
                            </div>
                            <div>
                                <Text strong>Academic:</Text>{" "}
                                <Text>{`${currentApplicant.academicLevel} - ${currentApplicant.academicStrand}`}</Text>
                            </div>
                            <div>
                                <Text strong>Status:</Text>{" "}
                                <Text>
                                    {renderStatusTag(currentApplicant.admissionExamDetailsStatus)}
                                </Text>
                            </div>
                            <div>
                                <Text strong>Preferred Exam Date:</Text>{" "}
                                <Text>
                                    {currentApplicant.preferredExamAndInterviewDate || "N/A"}
                                </Text>
                            </div>
                        </div>
                    </div>

                    <Divider orientation="left">Schedule Details</Divider>

                    <Form
                        form={form}
                        layout="vertical"
                        initialValues={{
                            approvedFeeAmount: 500,
                            approvedExamFeeStatus: 'Required'
                        }}
                    >
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="preferredDate"
                                    label={
                                        hasPreferredDate
                                            ? "Preferred Date (Student's Choice)"
                                            : "Set Preferred Date"
                                    }
                                    rules={[
                                        {
                                            required: !hasPreferredDate,
                                            message: "Please set the preferred date",
                                        },
                                    ]}
                                >
                                    <DatePicker
                                        disabled={hasPreferredDate}
                                        style={{ width: "100%" }}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="approvedDate"
                                    label="Approved Exam Date"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select the exam date",
                                        },
                                    ]}
                                >
                                    <DatePicker style={{ width: "100%" }} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="approvedTime"
                                    label="Approved Exam Time"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select the exam time",
                                        },
                                    ]}
                                >
                                    <TimePicker format="HH:mm" style={{ width: "100%" }} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="approvedRoom"
                                    label="Exam Room"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please enter the exam room",
                                        },
                                    ]}
                                >
                                    <Input placeholder="e.g. Room 141" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="approvedFeeAmount"
                                    label="Exam Fee Amount"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please enter the exam fee",
                                        },
                                    ]}
                                >
                                    <InputNumber
                                        style={{ width: "100%" }}
                                        formatter={(value) =>
                                            `₱ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                        }
                                        parser={(value) => value.replace(/₱\s?|(,*)/g, "")}
                                        min={0}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="approvedExamFeeStatus"
                                    label="Exam Fee Status"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select the fee status",
                                        },
                                    ]}
                                >
                                    <Select>
                                        <Option value="Required">Required</Option>
                                        <Option value="Paid">Paid</Option>
                                        <Option value="Waived">Waived</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </>
            )}
        </Modal>
    );
};

export default ExamScheduleModal;