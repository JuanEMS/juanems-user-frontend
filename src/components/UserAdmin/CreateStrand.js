import Footer from './Footer';
import Header from './Header';
import '../../css/UserAdmin/Global.css';
import '../../css/UserAdmin/CreateStrand.css';

import { Button, Form, Input, Select, Table, Modal, message } from 'antd';
import React, { useState, useEffect } from 'react';
import { BsXDiamondFill } from "react-icons/bs";
import { IoMdInformationCircle } from "react-icons/io";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { useNavigate, useParams } from 'react-router-dom';
import { FaPlus, FaTrashAlt } from 'react-icons/fa';
import axios from 'axios';

const { Column, ColumnGroup } = Table;

const CreateStrand = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [subjects, setSubjects] = useState([]);
    const [selectedSubjects, setSelectedSubjects] = useState({});
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentCell, setCurrentCell] = useState({ grade: null, semester: null, rowIndex: null });
    const [rowCounts, setRowCounts] = useState({
        grade11: 1,
        grade12: 1
    });
    const variant = Form.useWatch('variant', form);
    const { id } = useParams();
    const [isArchived, setIsArchived] = useState(false);

    useEffect(() => {
        fetchSubjects();
    }, []);

    useEffect(() => {
        const fetchStrand = async () => {
            if (!id) return; // Only fetch if editing

            try {
                const res = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/strands/${id}`);
                const result = await res.json();

                if (!res.ok) {
                    return message.error(result.message || 'Failed to load strand data.');
                }

                // Log the fetched data to the console
                console.log('Fetched strand data:', result);

                const data = result.data;
                setIsArchived(data.isArchived);

                // Set form fields with fetched data
                form.setFieldsValue({
                    strandCode: data.strandCode,
                    strandName: data.strandName,
                    status: data.status,
                });

            } catch (error) {
                console.error('Error fetching strand:', error);
                message.error('Error fetching strand data.');
            }
        };

        fetchStrand();
    }, [id, form]); // Depend on 'id' and 'form' for reloading


    const fetchSubjects = async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/subjects`);
            setSubjects(res.data.data);
        } catch (error) {
            console.error('Failed to fetch subjects:', error);
        }
    };

    const handleSelect = (subject) => {
        const { grade, semester, rowIndex } = currentCell;
        const key = `${grade}-${semester}-${rowIndex}`;
        setSelectedSubjects(prev => ({ ...prev, [key]: subject }));

        // Update row count if we're adding to the last row
        const gradeKey = `grade${grade}`;
        if (rowIndex === rowCounts[gradeKey] - 1) {
            setRowCounts(prev => ({
                ...prev,
                [gradeKey]: prev[gradeKey] + 1
            }));
        }

        setIsModalVisible(false);
    };

    const handleRemove = (grade, semester, rowIndex) => {
        const key = `${grade}-${semester}-${rowIndex}`;
        setSelectedSubjects(prev => {
            const updated = { ...prev };
            delete updated[key];
            return updated;
        });

        // Check if we can reduce row count
        const gradeKey = `grade${grade}`;
        const hasSubjectsInLastRow = Object.keys(selectedSubjects).some(k => {
            const [g, , r] = k.split('-');
            return g === grade.toString() && parseInt(r) === rowCounts[gradeKey] - 2;
        });

        if (!hasSubjectsInLastRow && rowCounts[gradeKey] > 1) {
            setRowCounts(prev => ({
                ...prev,
                [gradeKey]: prev[gradeKey] - 1
            }));
        }
    };

    const handleSubmit = async (values) => {
        try {
            // Trim and sanitize input
            const trimmedValues = {
                strandCode: values.strandCode.trim(),
                strandName: values.strandName.trim(),
                status: values.status.trim(),
            };

            // Determine if it's a create or update operation
            const url = id
                ? `${process.env.REACT_APP_API_URL}/api/admin/strands/${id}`
                : `${process.env.REACT_APP_API_URL}/api/admin/strands/create-strand`;

            const method = id ? 'PUT' : 'POST';

            // API call to create or update the strand
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(trimmedValues)
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 409) {
                    return message.error(data.message);
                }
                if (response.status >= 400 && response.status < 500) {
                    return message.warning(data.message || 'Invalid input.');
                }
                return message.error('Server error. Please try again later.');
            }

            message.success(id ? 'Strand updated successfully!' : 'Strand created successfully!');

            // Get values from localStorage without parsing as JSON
            const fullName = localStorage.getItem('fullName');
            const role = localStorage.getItem('role');
            const userID = localStorage.getItem('userID');

            // Log the action
            const logAction = id ? 'Update' : 'Create';
            const logDetail = `${logAction === 'Create' ? 'Created' : 'Updated'} strand [${trimmedValues.strandName}] with code ${trimmedValues.strandCode}`;

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

            navigate('/admin/manage-strands');

        } catch (error) {
            console.error('Error saving strand:', error);
            message.error(error.message || 'Failed to save strand. Please try again.');
        }
    };


    const handleBack = () => navigate('/admin/manage-strands');

    const handleAddSubject = (grade, semester, rowIndex) => {
        setCurrentCell({ grade, semester, rowIndex });
        setIsModalVisible(true);
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
    };

    // Generate table data with dynamic number of rows for each grade
    const generateTableData = (grade) => {
        const count = rowCounts[`grade${grade}`];
        const data = [];

        for (let i = 0; i < count; i++) {
            data.push({ key: `row-${grade}-${i}` });
        }

        return data;
    };

    const subjectColumns = [
        {
            title: 'Subject Code',
            dataIndex: 'subjectCode',
            key: 'subjectCode',
        },
        {
            title: 'Subject Name',
            dataIndex: 'subjectName',
            key: 'subjectName',
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Button type="primary" onClick={() => handleSelect(record)}>
                    Add
                </Button>
            ),
        },
    ];

    const isPreviousRowOccupied = (grade, semester, currentRowIndex) => {
        if (currentRowIndex === 0) return true; // Always show for first row

        const previousRowIndex = currentRowIndex - 1;
        const previousKey = `${grade}-${semester}-${previousRowIndex}`;
        return !!selectedSubjects[previousKey];
    };

    const renderSubjectCell = (grade, semester, rowIndex) => {
        const key = `${grade}-${semester}-${rowIndex}`;
        const subject = selectedSubjects[key];
        const showAddButton = isPreviousRowOccupied(grade, semester, rowIndex);

        return subject ? (
            <div className='table-cell'>
                <span>{subject.subjectCode}</span>
                <p>{subject.subjectName}</p>
                <Button
                    className='table-button'
                    icon={<FaTrashAlt />}
                    danger
                    onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(grade, semester, rowIndex);
                    }}
                >
                    Remove
                </Button>
            </div>
        ) : (
            showAddButton && (
                <div className='table-cell'>
                    <Button
                        className='table-button'
                        icon={<FaPlus />}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleAddSubject(grade, semester, rowIndex);
                        }}
                    >
                        Add Subject
                    </Button>
                </div>
            )
        );
    };

    return (
        <div className="main main-container">
            <Header />
            <div className="main-content">
                <div className="page-title">
                    <div className="arrows" onClick={handleBack}>
                        <MdOutlineKeyboardArrowLeft />
                    </div>
                    <p className="heading">
                        {isArchived
                            ? 'View Archived Strand'  // Display when the account is archived
                            : id
                                ? 'Edit Strand'           // Display when editing an existing account
                                : 'Create Strand'         // Display when creating a new account
                        }
                    </p>
                </div>

                <Form
                    form={form}
                    variant={variant || 'outlined'}
                    initialValues={{ variant: 'outlined' }}
                    labelCol={{ xs: { span: 24 }, sm: { span: 6 } }}
                    wrapperCol={{ xs: { span: 24 }, sm: { span: 30 } }}
                    onFinish={handleSubmit}
                >
                    <div className="container-columns">
                        <div className="column">
                            <div className="group-title">
                                <IoMdInformationCircle className="section-icon" />
                                <p className="section-title">STRAND DETAILS</p>
                            </div>
                            <Form.Item
                                label="Strand Code"
                                name="strandCode"
                                rules={[{ required: true, message: 'Please input strand code!' }]}
                            >
                                <Input placeholder="Please enter strand code" />
                            </Form.Item>
                            <Form.Item
                                label="Strand Name"
                                name="strandName"
                                rules={[{ required: true, message: 'Please input strand name!' }]}
                            >
                                <Input placeholder="Please enter strand name" />
                            </Form.Item>
                            <Form.Item
                                label="Status"
                                name="status"
                                rules={[{ required: true, message: 'Please select a status!' }]}
                            >
                                <Select placeholder="Select a status">
                                    <Select.Option value="Active">Active</Select.Option>
                                    <Select.Option value="Inactive">Inactive</Select.Option>
                                </Select>
                            </Form.Item>
                            {!isArchived && (
                                <div className="buttons" style={{ marginTop: '20px' }}>
                                    <Button type="default" htmlType="button" onClick={handleBack}>
                                        Cancel
                                    </Button>
                                    <Button type="primary" htmlType="submit" className={id ? '' : 'create-btn'}>
                                        {id ? 'Update' : 'Save'}
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="column">
                        </div>

                        <div className="column">
                        </div>
                    </div>
                    {/* <div className="container-columns">
                        <div className="column">
                            <div className="group-title">
                                <BsXDiamondFill className="section-icon" />
                                <p className="section-title">FLOWCHART</p>
                            </div>
                        </div>
                    </div> */}
                    {/* <div className="container-columns">
                        <div className="column">
                            <Table
                                dataSource={generateTableData(11)}
                                pagination={false}
                                bordered
                                showHeader={true}
                            >
                                <ColumnGroup title="Grade 11">
                                    <Column
                                        title="1st Semester"
                                        key="grade11_first"
                                        width={180}
                                        render={(_, record, rowIndex) => renderSubjectCell(11, '1st Semester', rowIndex)}
                                    />
                                    <Column
                                        title="2nd Semester"
                                        key="grade11_second"
                                        width={180}
                                        render={(_, record, rowIndex) => renderSubjectCell(11, '2nd Semester', rowIndex)}
                                    />
                                </ColumnGroup>
                            </Table>
                        </div>
                        <div className="column">
                            <Table
                                dataSource={generateTableData(12)}
                                pagination={false}
                                bordered
                                showHeader={true}
                            >
                                <ColumnGroup title="Grade 12">
                                    <Column
                                        title="1st Semester"
                                        key="grade12_first"
                                        width={180}
                                        render={(_, record, rowIndex) => renderSubjectCell(12, '1st Semester', rowIndex)}
                                    />
                                    <Column
                                        title="2nd Semester"
                                        key="grade12_second"
                                        width={180}
                                        render={(_, record, rowIndex) => renderSubjectCell(12, '2nd Semester', rowIndex)}
                                    />
                                </ColumnGroup>
                            </Table>
                        </div>
                    </div> */}
                </Form>
            </div>

            <Modal
                title={`Select Subject for Grade ${currentCell.grade} - ${currentCell.semester}`}
                open={isModalVisible}
                onCancel={handleModalCancel}
                footer={null}
                width={800}
            >
                <Table
                    dataSource={subjects}
                    columns={subjectColumns}
                    rowKey="subjectID"
                />
            </Modal>
            <Footer />
        </div>
    );
};

export default CreateStrand;