import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { Form, Input, Select, Button, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IoMdInformationCircle } from "react-icons/io";
import { BsXDiamondFill } from "react-icons/bs";

import Footer from './Footer';
import Header from './Header';
import '../../css/UserAdmin/CreateSubject.css';
import '../../css/UserAdmin/Global.css';

const CreateSection = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const variant = Form.useWatch('variant', form);
    const { id } = useParams();
    const [isArchived, setIsArchived] = useState(false);

    useEffect(() => {
        const fetchSection = async () => {
            if (!id) return; // only fetch if editing

            try {
                const res = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/sections/${id}`);
                const result = await res.json();

                if (!res.ok) {
                    return message.error(result.message || 'Failed to load section data.');
                }

                // Log the fetched data to the console
                console.log('Fetched section data:', result);

                // Extract the actual section data from the "data" object
                const data = result.data;
                setIsArchived(data.isArchived);

                // Use setFieldsValue after form is loaded to set the values correctly
                form.setFieldsValue({
                    sectionName: data.sectionName,
                    gradeLevel: data.gradeLevel,
                    strand: data.strand,
                    capacity: data.capacity,
                    status: data.status,
                });

            } catch (error) {
                console.error('Error fetching section:', error);
                message.error('Error fetching section data.');
            }
        };

        fetchSection();
    }, [id, form]); // Depend on 'id' and 'form' to reload when necessary


    const handleBack = () => navigate('/admin/manage-sections');

    const handleSubmit = async (values) => {
        try {
            const trimmedValues = {
                sectionName: values.sectionName.trim(),
                gradeLevel: values.gradeLevel.trim(),
                strand: values.strand.trim(),
                capacity: values.capacity.trim(),
                status: values.status.trim(),
            };

            const url = id
                ? `${process.env.REACT_APP_API_URL}/api/admin/sections/${id}`
                : `${process.env.REACT_APP_API_URL}/api/admin/sections/create-section`;

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

            message.success(`Section successfully ${id ? 'updated' : 'created'}!`);

            // Get values from localStorage without parsing as JSON
            const fullName = localStorage.getItem('fullName');
            const role = localStorage.getItem('role');
            const userID = localStorage.getItem('userID');

            // After successful create/update, log the action
            const logAction = id ? 'Update' : 'Create';
            const logDetail = `${logAction === 'Create' ? 'Created' : 'Updated'} section [${trimmedValues.sectionName}] for ${trimmedValues.gradeLevel} - ${trimmedValues.strand}`;

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

            navigate('/admin/manage-sections');
        } catch (error) {
            console.error('Error submitting section:', error);
            message.error(error.message || 'Failed to submit section. Please try again.');
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
                            ? 'View Archived Section'  // Display when the account is archived
                            : id
                                ? 'Edit Section'           // Display when editing an existing account
                                : 'Create Section'         // Display when creating a new account
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
                                <p className="section-title">SECTION DETAILS</p>
                            </div>
                            <Form.Item
                                label="Section Name"
                                name="sectionName"
                                rules={[{ required: true, message: 'Please input section name!' }]}
                            >
                                <Input placeholder="Please enter section name" />
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
                            <div className="group-title">
                                <BsXDiamondFill className="section-icon" />
                                <p className="section-title">CAPACITY & STATUS</p>
                            </div>
                            <Form.Item
                                label="Capacity"
                                name="capacity"
                                rules={[{ required: true, message: 'Please input capacity!' }]}
                            >
                                <Input
                                    placeholder="Enter capacity"
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
                        <div className="column">
                        </div>
                        <div className="column">
                        </div>
                    </div>
                </Form>
            </div>
            <Footer />
        </div>
    )
}

export default CreateSection