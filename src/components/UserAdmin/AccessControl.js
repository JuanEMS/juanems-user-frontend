import React, { useEffect, useState } from 'react';
import { Button, Checkbox, Form, Tabs, Divider, Card, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
import { MdOutlineKeyboardArrowLeft } from 'react-icons/md';
import { BookOutlined, CalendarOutlined, UsergroupAddOutlined, SettingOutlined, FileTextOutlined, ScheduleOutlined, DollarOutlined, FormOutlined, FolderOpenOutlined, LineChartOutlined, TeamOutlined } from '@ant-design/icons';
import Footer from './Footer';
import Header from './Header';
import '../../css/UserAdmin/Global.css';

const admissionsModules = {
    'Manage Applications': [
        'Manage Student Applications',
        'Manage Exam and Interview Schedules',
        'Manage Exam and Interview Results',
        'Manage Enrollment Period',
    ],
    'Manage Queue': [],
    'Create Announcements': [],
};

const registrarModules = {
    'Manage Student Records': [
        'Manage Students',
        'Attendance Summary',
        'Behavior Summary',
        'Grade Summary',
        'Enrollment Summary',
        'Quarterly Ranking',
        'Yearly Ranking',
    ],
    'Manage Enrollment': [],
    'Manage Schedule': [
        'Student Schedule',
        'Faculty Schedule',
    ],
    'Manage Program': [
        'Manage Strands',
        'Manage Subjects',
        'Manage Sections',
    ],
    'Manage Queue': [],
    'Create Announcements': [],
};

const accountingModules = {
    'Manage Payments': [
        'Manage Fees',
        'Payment History',
    ],
    'Manage Queue': [],
    'Create Announcements': [],
};

const subAdminModules = {
    'Manage Accounts': [],
    'Manage Schedule': [
        'Student Schedule',
        'Faculty Schedule',
    ],
    'Manage Program': [
        'Manage Strands',
        'Manage Subjects',
        'Manage Sections',
    ],
    'Manage Student Records': [
        'Manage Students',
        'Attendance Summary',
        'Behavior Summary',
        'Grade Summary',
        'Enrollment Summary',
        'Quarterly Ranking',
        'Yearly Ranking',
    ],
    'Manage Enrollment': [],
    'Manage Payments': [
        'Manage Fees',
        'Payment History',
    ],
    'Overall System Logs': [],
    'Create Announcements': [],
};

// Define all staff modules for the super admin
const allStaffModules = {
    'Manage Applications': [
        'Manage Student Applications',
        'Manage Exam and Interview Schedules',
        'Manage Exam and Interview Results',
        'Manage Enrollment Period',
    ],
    'Manage Accounts': [],
    'Create Announcements': [],
    'Manage Enrollment': [],
    'Manage Schedule': [
        'Student Schedule',
        'Faculty Schedule',
    ],
    'Overall System Logs': [],
    'Manage Payments': [
        'Manage Fees',
        'Payment History',
    ],
    'Manage Program': [
        'Manage Strands',
        'Manage Subjects',
        'Manage Sections',
    ],
    'Manage Queue': [],
    'Manage Student Records': [
        'Manage Students',
        'Attendance Summary',
        'Behavior Summary',
        'Grade Summary',
        'Enrollment Summary',
        'Quarterly Ranking',
        'Yearly Ranking',
    ],
};

const defaultRoleModules = {
    Faculty: {
        'Class Schedule': [],
        'Class Information': [],
        'Handling of Grades': [],
        'Viewing of OTE': [],
        'Teacher Documents': [],
    },
    Student: {
        'Student Handbook': [],
        'Certificate of Registration': [],
        'Flowchart': [],
        'Online Class Registration': [],
        'Viewing of Grades': [],
        'Class Schedule': [],
        'Online Teacher\'s Evaluation': [],
        'Student Ledger': [],
        'Enrollment': [],
        'Joining Queue': [],
        'Pay Bills': [],
    },
    'Admissions (Staff)': admissionsModules,
    'Registrar (Staff)': registrarModules,
    'Accounting (Staff)': accountingModules,
    'Administration (Sub-Admin)': subAdminModules,
    'IT (Super Admin)': allStaffModules,
};

const RoleAccessForm = ({ role }) => {
    const moduleGroups = defaultRoleModules[role] || {};
    const [selectedModules, setSelectedModules] = useState([]);

    useEffect(() => {
        const fetchRoleData = async () => {
            try {
                // Use the role name to find the role
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/roles/${role}`);
                if (response.ok) {
                    const result = await response.json();
                    // Access modules from the correct path in the response
                    setSelectedModules(result.data.modules || []);
                } else {
                    console.error('Role not found, using defaults');
                    setSelectedModules(getAllModuleKeys()); // Use default if no role data found
                }
            } catch (error) {
                console.error('Error fetching role data:', error);
                setSelectedModules(getAllModuleKeys()); // Fallback to default
            }
        };

        fetchRoleData();
    }, [role]);


    const moduleIcons = {
        'Class Schedule': <CalendarOutlined style={{ color: '#C68A00' }} />,
        'Class Information': <BookOutlined style={{ color: '#C68A00' }} />,
        'Handling of Grades': <FormOutlined style={{ color: '#C68A00' }} />,
        'Viewing of OTE': <LineChartOutlined style={{ color: '#C68A00' }} />,
        'Teacher Documents': <FileTextOutlined style={{ color: '#C68A00' }} />,
        'Manage Applications': <UsergroupAddOutlined style={{ color: '#C68A00' }} />,
        'Manage Accounts': <TeamOutlined style={{ color: '#C68A00' }} />,
        'Manage Student Records': <FolderOpenOutlined style={{ color: '#C68A00' }} />,
        'Manage Enrollment': <FormOutlined style={{ color: '#C68A00' }} />,
        'Manage Schedule': <ScheduleOutlined style={{ color: '#C68A00' }} />,
        'Manage Program': <SettingOutlined style={{ color: '#C68A00' }} />,
        'Manage Payments': <DollarOutlined style={{ color: '#C68A00' }} />,
        'Manage Queue': <ScheduleOutlined style={{ color: '#C68A00' }} />,
        'Overall System Logs': <FileTextOutlined style={{ color: '#C68A00' }} />,
        'Create Announcements': <FileTextOutlined style={{ color: '#C68A00' }} />,
    };

    useEffect(() => {
        setSelectedModules(getAllModuleKeys());
    }, [role]);

    const getAllModuleKeys = () =>
        Object.entries(moduleGroups).flatMap(([parent, subs]) => [parent, ...subs]);

    const handleParentToggle = (parent, submodules) => {
        const isChecked = selectedModules.includes(parent);
        const updated = new Set(selectedModules);

        if (isChecked) {
            updated.delete(parent);
            submodules.forEach((sub) => updated.delete(sub));
        } else {
            updated.add(parent);
            submodules.forEach((sub) => updated.add(sub));
        }

        setSelectedModules(Array.from(updated));
    };

    const handleSubToggle = (parent, submodules, changedSub) => {
        const updated = new Set(selectedModules);

        // Toggle the changed submodule
        if (updated.has(changedSub)) {
            updated.delete(changedSub);
        } else {
            updated.add(changedSub);
        }

        // Check if the parent should be included (if any of its submodules are checked)
        const hasCheckedSubmodules = submodules.some((sub) => updated.has(sub));

        // If any submodule is checked, ensure the parent is also checked
        if (hasCheckedSubmodules) {
            updated.add(parent);
        } else {
            // If no submodules are checked, remove the parent
            updated.delete(parent);
        }

        setSelectedModules(Array.from(updated));
    };

    const isParentIndeterminate = (parent, submodules) => {
        const hasSome = submodules.some((sub) => selectedModules.includes(sub));
        const hasAll = submodules.every((sub) => selectedModules.includes(sub));
        return hasSome && !hasAll;
    };

    const handleSave = async () => {
        console.log(`Saving access for ${role}:`, selectedModules);

        try {
            // Send the selected modules to the backend to update the role access
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/roles/save-access`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    role,
                    selectedModules,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save access');
            }

            const data = await response.json();
            console.log('Access updated successfully:', data);
        } catch (error) {
            console.error('Error saving access:', error);
        }
    };

    return (
        <Form layout="vertical">
            <Row gutter={[16, 16]}>
                {Object.entries(moduleGroups).map(([parent, submodules]) => (
                    <Col key={parent} xs={24} sm={12} md={12} lg={6}>
                        <Card
                            title={
                                <span style={{ color: 'white' }}>
                                    {moduleIcons[parent] || <SettingOutlined style={{ color: '#C68A00' }} />} {parent}
                                </span>
                            }
                            headStyle={{ backgroundColor: '#00245A', borderBottom: '1px solid #001d4a' }}
                            bodyStyle={{ paddingTop: 12 }}
                            style={{
                                border: '1px solid #e0e0e0',
                                borderRadius: '12px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
                                height: '100%',
                            }}
                        >
                            <Checkbox
                                indeterminate={isParentIndeterminate(parent, submodules)}
                                checked={selectedModules.includes(parent)}
                                onChange={() => handleParentToggle(parent, submodules)}
                                style={{ marginBottom: submodules.length > 0 ? 8 : 0 }}
                            >
                                <strong>{parent}</strong>
                            </Checkbox>

                            {submodules.length > 0 && (
                                <div style={{ paddingLeft: 24 }}>
                                    {submodules.map((sub) => (
                                        <div key={sub} style={{ marginBottom: 4 }}>
                                            <Checkbox
                                                checked={selectedModules.includes(sub)}
                                                onChange={() => handleSubToggle(parent, submodules, sub)}
                                            >
                                                {sub}
                                            </Checkbox>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </Col>
                ))}
            </Row>

            <Divider />
            <div style={{ textAlign: 'right' }}>
                <Button onClick={() => setSelectedModules(getAllModuleKeys())} style={{ marginRight: 8 }}>
                    Reset to Default
                </Button>
                <Button onClick={() => setSelectedModules([])} style={{ marginRight: 8 }}>
                    Clear All
                </Button>
                <Button type="primary" onClick={handleSave}>
                    Save
                </Button>
            </div>
        </Form>
    );
};

const AccessControl = () => {
    const navigate = useNavigate();
    const handleBack = () => navigate('/admin/manage-accounts');
    return (
        <div className="main main-container">
            <Header />
            <div className="main-content">
                <div className="page-title">
                    <div className="arrows" onClick={handleBack}>
                        <MdOutlineKeyboardArrowLeft />
                    </div>
                    <p className="heading">Access Control</p>
                </div>
                <Tabs
                    defaultActiveKey="Faculty"
                    items={Object.keys(defaultRoleModules).map((role) => ({
                        key: role,
                        label: role,
                        children: <RoleAccessForm role={role} />,
                    }))}
                />
            </div>
            <Footer />
        </div>
    );
};

export default AccessControl;
