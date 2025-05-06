import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { Form, Input, Select, Button, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { IoSettings } from "react-icons/io5";
import { useNavigate, useParams } from 'react-router-dom';
import { IoMdInformationCircle } from "react-icons/io";
import { FaStar } from "react-icons/fa";
import { BsXDiamondFill } from "react-icons/bs";

import Footer from './Footer';
import Header from './Header';
import '../../css/UserAdmin/CreateSubject.css';
import '../../css/UserAdmin/Global.css';

const CreateSubject = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const variant = Form.useWatch('variant', form);
    const { id } = useParams();
    const [isArchived, setIsArchived] = useState(false);

    useEffect(() => {
        const fetchSubject = async () => {
            if (!id) return; // only fetch if editing

            try {
                const res = await fetch(`http://localhost:5000/api/admin/subjects/${id}`);
                const result = await res.json();

                if (!res.ok) {
                    return message.error(result.message || 'Failed to load subject data.');
                }

                // Log the fetched data to the console
                console.log('Fetched subject data:', result);

                // Extract the actual subject data from the "data" object
                const data = result.data;
                setIsArchived(data.isArchived);

                // Use setFieldsValue after form is loaded to set the values correctly
                form.setFieldsValue({
                    subjectID: data.subjectID,
                    subjectCode: data.subjectCode,
                    subjectName: data.subjectName,
                    writtenWork: data.writtenWork,
                    performanceTask: data.performanceTask,
                    quarterlyAssessment: data.quarterlyAssessment,
                    classification: data.classification,
                    strand: data.strand,
                    term: data.term,
                    gradeLevel: data.gradeLevel,
                    status: data.status,
                    subjectOrder: data.subjectOrder,
                });

            } catch (error) {
                console.error('Error fetching subject:', error);
                message.error('Error fetching subject data.');
            }
        };

        fetchSubject();
    }, [id, form]); // Depend on 'id' and 'form' to reload when necessary  


    const handleBack = () => navigate('/admin/manage-subjects');

    const handleSubmit = async (values) => {
        try {
            // Convert to floats
            const ww = parseFloat(values.writtenWork);
            const pt = parseFloat(values.performanceTask);
            const qa = parseFloat(values.quarterlyAssessment);

            // Validate the total weight
            const total = ww + pt + qa;
            if (isNaN(total) || Math.abs(total - 1) > 0.001) {
                return message.error('Written Work, Performance Task, and Quarterly Assessment must add up to exactly 1.0.');
            }

            // Trim string fields
            const trimmedValues = {
                ...values,
                subjectID: values.subjectID.trim(),
                subjectCode: values.subjectCode?.trim(),
                subjectName: values.subjectName.trim(),
                writtenWork: ww.toString(),
                performanceTask: pt.toString(),
                quarterlyAssessment: qa.toString(),
                classification: values.classification,
                strand: values.strand,
                term: values.term,
                gradeLevel: values.gradeLevel,
                status: values.status,
                subjectOrder: values.subjectOrder.trim(),
            };

            const url = id
                ? `http://localhost:5000/api/admin/subjects/${id}`
                : 'http://localhost:5000/api/admin/subjects/create-subject';

            const method = id ? 'PUT' : 'POST';

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

            message.success('Subject successfully created!');

            // Get values from localStorage without parsing as JSON
            const fullName = localStorage.getItem('fullName');
            const role = localStorage.getItem('role');
            const userID = localStorage.getItem('userID');

            // After successful create/update, log the action
            const logAction = id ? 'Update' : 'Create';
            const logDetail = `${logAction === 'Create' ? 'Created' : 'Updated'} subject "${trimmedValues.subjectName}" (Code: ${trimmedValues.subjectCode || 'N/A'})`;

            const logData = {
                userID: userID,
                accountName: fullName,
                role: role,
                action: logAction,
                detail: logDetail,
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

            navigate('/admin/manage-subjects');
        } catch (error) {
            console.error('Error creating subject:', error);
            message.error(error.message || 'Failed to create subject. Please try again.');
        }
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
                            ? 'View Archived Subject'  // Display when the account is archived
                            : id
                                ? 'Edit Subject'           // Display when editing an existing account
                                : 'Create Subject'         // Display when creating a new account
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
                                <p className="section-title">SUBJECT DETAILS</p>
                            </div>
                            <Form.Item
                                label="Subject No."
                                name="subjectID"
                                rules={[{ required: true, message: 'Please input subject no.!' }]}
                            >
                                <Input
                                    placeholder="Enter subject number"
                                    onKeyDown={(e) => {
                                        const allowedKeys = [
                                            'Backspace', 'ArrowLeft', 'ArrowRight', 'Tab', 'Delete'
                                        ];
                                        if (
                                            !/[0-9]/.test(e.key) &&
                                            !allowedKeys.includes(e.key)
                                        ) {
                                            e.preventDefault();
                                        }
                                    }}
                                />
                            </Form.Item>

                            <Form.Item
                                label="Subject Code"
                                name="subjectCode"
                                rules={[{ required: true, message: 'Please input subject code!' }]}
                            >
                                <Input placeholder="E.g. CORSBJ1" />
                            </Form.Item>
                            <Form.Item
                                label="Subject Name"
                                name="subjectName"
                                rules={[{ required: true, message: 'Please input subject name!' }]}
                            >
                                <Input placeholder="E.g. Oral Communication" />
                            </Form.Item>
                            <div className="group-title">
                                <BsXDiamondFill className="section-icon" />
                                <p className="section-title">GRADING COMPONENTS</p>
                            </div>
                            <p>Enter the grading breakdown using decimal values (e.g., 0.3 for 30%).</p>
                            <Form.Item
                                label="Written Work"
                                name="writtenWork"
                                rules={[{ required: true, message: 'Please input written work!' }]}
                            >
                                <Input
                                    placeholder="Enter written work"
                                    onKeyDown={(e) => {
                                        const key = e.key;
                                        // Allow: backspace, delete, arrows, period (.), and numbers (0-9)
                                        if (!/[\d\.]/.test(key) && key !== 'Backspace' && key !== 'Delete' && key !== 'ArrowLeft' && key !== 'ArrowRight') {
                                            e.preventDefault(); // Prevent input of invalid characters
                                        }
                                    }}
                                />
                            </Form.Item>

                            <Form.Item
                                label="Performance Task"
                                name="performanceTask"
                                rules={[{ required: true, message: 'Please input performance task!' }]}
                            >
                                <Input
                                    placeholder="Enter performance task"
                                    onKeyDown={(e) => {
                                        const key = e.key;
                                        // Allow: backspace, delete, arrows, period (.), and numbers (0-9)
                                        if (!/[\d\.]/.test(key) && key !== 'Backspace' && key !== 'Delete' && key !== 'ArrowLeft' && key !== 'ArrowRight') {
                                            e.preventDefault(); // Prevent input of invalid characters
                                        }
                                    }}
                                />
                            </Form.Item>
                            <Form.Item
                                label="Quarterly Assessment"
                                name="quarterlyAssessment"
                                rules={[{ required: true, message: 'Please input quarterly assessment!' }]}
                            >
                                <Input
                                    placeholder="Enter quarterly assessment"
                                    onKeyDown={(e) => {
                                        const key = e.key;
                                        // Allow: backspace, delete, arrows, period (.), and numbers (0-9)
                                        if (!/[\d\.]/.test(key) && key !== 'Backspace' && key !== 'Delete' && key !== 'ArrowLeft' && key !== 'ArrowRight') {
                                            e.preventDefault(); // Prevent input of invalid characters
                                        }
                                    }}
                                />
                            </Form.Item>

                        </div>
                        <div className="column">
                            <div className="group-title">
                                <FaStar className="section-icon" />
                                <p className="section-title">CLASSIFICATION & ASSIGNMENT</p>
                            </div>
                            <Form.Item
                                label="Classification"
                                name="classification"
                                rules={[{ required: true, message: 'Please select a classification!' }]}
                            >
                                <Select placeholder="Select a classification">
                                    <Select.Option value="CORE">CORE</Select.Option>
                                    <Select.Option value="APPLIED">APPLIED</Select.Option>
                                    <Select.Option value="CVF">CVF</Select.Option>
                                    <Select.Option value="STRAND">STRAND</Select.Option>
                                </Select>
                            </Form.Item>
                            <Form.Item
                                label="Strand"
                                name="strand"
                                rules={[{ required: true, message: 'Please select a strand!' }]}
                            >
                                <Select placeholder="Select a strand">
                                    <Select.Option value="STEM">STEM</Select.Option>
                                    <Select.Option value="ABM">ABM</Select.Option>
                                    <Select.Option value="HUMSS">HUMSS</Select.Option>
                                    <Select.Option value="TVL">TVL</Select.Option>
                                </Select>
                            </Form.Item>
                            <Form.Item
                                label="Term"
                                name="term"
                                rules={[{ required: true, message: 'Please select a term!' }]}
                            >
                                <Select placeholder="Select a term">
                                    <Select.Option value="1st">1st</Select.Option>
                                    <Select.Option value="2nd">2nd</Select.Option>
                                </Select>
                            </Form.Item>
                            <Form.Item
                                label="Grade Level"
                                name="gradeLevel"
                                rules={[{ required: true, message: 'Please select a grade level!' }]}
                            >
                                <Select placeholder="Select a grade level">
                                    <Select.Option value="Grade 11">Grade 11</Select.Option>
                                    <Select.Option value="Grade 12">Grade 12</Select.Option>
                                </Select>
                            </Form.Item>
                            <div className="group-title">
                                <IoSettings className="section-icon" />
                                <p className="section-title">SETTINGS</p>
                            </div>
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
                            <Form.Item
                                label="Subject Order"
                                name="subjectOrder"
                                rules={[{ required: true, message: 'Please input subject order!' }]}
                            >
                                <Input placeholder="Enter subject order" />
                            </Form.Item>
                            {!isArchived && (
                                <div className="buttons">
                                    <Button type="default" htmlType="button" onClick={handleBack}>
                                        Cancel
                                    </Button>
                                    <Button type="primary" htmlType="submit" className={id ? '' : 'create-btn'}>
                                        {id ? 'Update' : 'Save'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </Form>
            </div>
            <Footer />
        </div>
    )
}

export default CreateSubject
