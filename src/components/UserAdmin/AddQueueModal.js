import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Space, message } from 'antd';

const AddQueueModal = ({ isOpen, onClose, onAddQueue }) => {
    const [form] = Form.useForm();
    const [mobileNumber, setMobileNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [department, setDepartment] = useState('');

    useEffect(() => {
        // Get the admin's department from localStorage
        const userRole = localStorage.getItem('role') || 'ROLE';
        const userDepartment = userRole.replace(/\s*\([^)]*\)\s*/g, '');
        setDepartment(userDepartment);
    }, []);

    const formatMobile = (digits) => {
        if (!digits) return '';

        if (digits.length <= 3) {
            return digits;
        } else if (digits.length <= 6) {
            return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
        } else {
            return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)} ${digits.slice(6)}`;
        }
    };

    // Filter out non-letter characters for name input
    const handleNameBeforeInput = (e) => {
        if (!/^[A-Za-z.\s]*$/.test(e.data)) {
            e.preventDefault();
        }
    };

    const handleNameChange = (e) => {
        const value = e.target.value;
        // Only allow letters, spaces, and periods
        const filteredValue = value.replace(/[^A-Za-z.\s]/g, '');
        form.setFieldsValue({ name: filteredValue });
    };

    const handleJoin = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();
            const digits = values.mobile.replace(/\D/g, '');
            const finalMobileNumber = '+63' + digits.slice(-10);

            // Step 1: Create or find guest user
            const createUserResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/guestUsers/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: values.name.trim(),
                    mobileNumber: finalMobileNumber,
                }),
            });

            if (!createUserResponse.ok) {
                const errorData = await createUserResponse.json();
                throw new Error(errorData.message || 'Failed to create guest user');
            }

            const userData = await createUserResponse.json();
            const guestUserId = userData.data._id;

            // Step 2: Generate queue number (department prefix + random number)
            const queueNumber = `${department.substring(0, 2).toUpperCase()}${Math.floor(Math.random() * 100) + 1}`;

            // Step 3: Add the guest to the queue
            const addToQueueResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/guestQueueData/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    guestUserId,
                    department,
                    queueNumber,
                }),
            });

            if (!addToQueueResponse.ok) {
                const errorData = await addToQueueResponse.json();
                throw new Error(errorData.message || 'Failed to add to queue');
            }

            const queueData = await addToQueueResponse.json();

            // Pass complete information back to parent component
            onAddQueue({
                name: values.name,
                mobileNumber: finalMobileNumber,
                id: guestUserId,
                queueNumber: queueData.data.queueNumber,
                department: department
            });

            message.success(`Successfully added ${values.name} to ${department} queue with number ${queueData.data.queueNumber}`);
            form.resetFields();
            setMobileNumber('');
            onClose();
        } catch (error) {
            console.error('Error joining queue:', error);
            message.error(error.message || 'Failed to join queue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={`Add to ${department} Queue`}
            open={isOpen}
            onCancel={onClose}
            footer={null}
            destroyOnClose
        >
            <p>Please enter the guest's information for {department} department</p>

            <Form
                form={form}
                layout="vertical"
                preserve={false}
            >
                <Form.Item
                    name="name"
                    label="Guest Name"
                    validateFirst
                    rules={[
                        { required: true, message: 'Name is required' },
                        { max: 50, message: 'Name cannot exceed 50 characters' },
                        {
                            pattern: /^[A-Za-z.\s]+$/,
                            message: 'Only letters, spaces, and periods are allowed'
                        }
                    ]}
                >
                    <Input
                        maxLength={50}
                        showCount={{ formatter: ({ count, maxLength }) => `${count}/${maxLength}` }}
                        placeholder="Enter guest name"
                        autoComplete="off"
                        onBeforeInput={handleNameBeforeInput}
                        onChange={handleNameChange}
                    />
                </Form.Item>

                <Form.Item
                    label="Mobile Number"
                    name="mobile"
                    validateFirst
                    rules={[
                        { required: true, message: 'Please input mobile number!' },
                        {
                            validator: async (_, value) => {
                                if (!value) return Promise.reject('Please input mobile number!');

                                // Extract digits
                                let digits = value.replace(/\D/g, '');

                                // Take only the last 10 digits if more are entered
                                if (digits.length > 10) {
                                    digits = digits.slice(-10);
                                }

                                // Validate the number starts with 9
                                if (digits.length > 0 && digits[0] !== '9') {
                                    return Promise.reject('Please enter a valid Philippine mobile number (starts with 9)');
                                }

                                // Validate the length
                                if (digits.length !== 10) {
                                    return Promise.reject('Please enter a valid 10-digit mobile number');
                                }

                                return Promise.resolve();
                            },
                        },
                    ]}
                >
                    <Input
                        placeholder="(XXX) XXX XXXX"
                        addonBefore="+63"
                        value={mobileNumber}
                        onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, '').slice(0, 10); // restrict to 10 digits
                            const formattedValue = formatMobile(digits); // format after slicing
                            setMobileNumber(formattedValue);
                            form.setFieldsValue({ mobile: formattedValue });
                        }}
                    />
                </Form.Item>

                <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button onClick={() => {
                        form.resetFields();
                        setMobileNumber('');
                        onClose();
                    }}>
                        Cancel
                    </Button>
                    <Button type="primary" onClick={handleJoin} loading={loading}>
                        Add to Queue
                    </Button>
                </Space>
            </Form>
        </Modal>
    );
};

export default AddQueueModal;