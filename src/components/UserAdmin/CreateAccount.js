import { BookOutlined, CalendarOutlined, DollarOutlined, FileTextOutlined, FolderOpenOutlined, FormOutlined, LineChartOutlined, LockOutlined, ScheduleOutlined, SettingOutlined, TeamOutlined, UsergroupAddOutlined } from "@ant-design/icons";
import { Button, Card, Checkbox, Col, Divider, Form, Input, message, Row, Select, Switch, Tabs } from 'antd';
import React, { useEffect, useState } from 'react';
import { FaUser } from "react-icons/fa";
import { IoSettings } from "react-icons/io5";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { useNavigate, useParams } from 'react-router-dom';

import '../../css/JuanScope/Register.css';
import '../../css/UserAdmin/CreateAccount.css';
import '../../css/UserAdmin/Global.css';
import Footer from './Footer';
import Header from './Header';
import { defaultRoleModules } from "./CreateAccount/utils";


export const moduleIcons = {
  'Class Schedule': <CalendarOutlined style={{ color: '#C68A00' }} />,
'Class Information': <BookOutlined style={ { color: '#C68A00' } } />,
'Handling of Grades': <FormOutlined style={ { color: '#C68A00' } } />,
'Viewing of OTE': <LineChartOutlined style={ { color: '#C68A00' } } />,
'Teacher Documents': <FileTextOutlined style={ { color: '#C68A00' } } />,
'Manage Applications': <UsergroupAddOutlined style={ { color: '#C68A00' } } />,
'Manage Accounts': <TeamOutlined style={ { color: '#C68A00' } } />,
'Manage Student Records': <FolderOpenOutlined style={ { color: '#C68A00' } } />,
'Manage Enrollment': <FormOutlined style={ { color: '#C68A00' } } />,
'Manage Schedule': <ScheduleOutlined style={ { color: '#C68A00' } } />,
'Manage Program': <SettingOutlined style={ { color: '#C68A00' } } />,
'Manage Payments': <DollarOutlined style={ { color: '#C68A00' } } />,
'Manage Queue': <ScheduleOutlined style={ { color: '#C68A00' } } />,
'Overall System Logs': <FileTextOutlined style={ { color: '#C68A00' } } />,
'Create Announcements': <FileTextOutlined style={ { color: '#C68A00' } } />,
'Student Handbook': <BookOutlined style={ { color: '#C68A00' } } />,
'Certificate of Registration': <FileTextOutlined style={ { color: '#C68A00' } } />,
'Flowchart': <FormOutlined style={ { color: '#C68A00' } } />,
'Online Class Registration': <FormOutlined style={ { color: '#C68A00' } } />,
'Viewing of Grades': <FormOutlined style={ { color: '#C68A00' } } />,
'Online Teacher\'s Evaluation': <FormOutlined style={ { color: '#C68A00' } } />,
'Student Ledger': <DollarOutlined style={ { color: '#C68A00' } } />,
'Enrollment': <FormOutlined style={ { color: '#C68A00' } } />,
'Joining Queue': <ScheduleOutlined style={ { color: '#C68A00' } } />,
'Pay Bills': <DollarOutlined style={ { color: '#C68A00' } } />,
};

// Custom Access Form component
const CustomAccessForm = ({ role, selectedModules, setSelectedModules, hasCustomAccess }) => {
  const moduleGroups = defaultRoleModules[role] || {};

  const getAllModuleKeys = () =>
    Object.entries(moduleGroups).flatMap(([parent, subs]) => [parent, ...subs]);

  // Handle custom access toggle effect - this should only reset when hasCustomAccess changes
  useEffect(() => {
    if (!hasCustomAccess) {
      // If custom access is turned off, reset to default role permissions
      setSelectedModules(getAllModuleKeys());
    }
  }, [hasCustomAccess]);

  // Remove the useEffect that fetches role data

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

  const isParentIndeterminate = (_parent, submodules) => {
    const hasSome = submodules.some((sub) => selectedModules.includes(sub));
    const hasAll = submodules.every((sub) => selectedModules.includes(sub));
    return hasSome && !hasAll;
  };

  return (
    <div style={{ display: hasCustomAccess ? 'block' : 'none' }}>
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
      </div>
    </div>
  );
};

const generateUserID = async (role) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/generate-userid`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role }), // Pass the role to the backend
    });

    if (!response.ok) {
      throw new Error('Failed to generate userID');
    }

    const data = await response.json();
    return data.userID; // Return the generated userID
  } catch (error) {
    console.error('Error generating userID:', error);
    return null;
  }
};

const handleNameBeforeInput = (e) => {
  if (!/^[A-Za-z.\s]*$/.test(e.data)) {
    e.preventDefault();
  }
};


const formatMobile = (value) => {
  if (!value) return '';

  let digits = value.replace(/\D/g, '');

  // Limit to 10 digits max
  digits = digits.slice(0, 10);

  const part1 = digits.slice(0, 3);
  const part2 = digits.slice(3, 6);
  const part3 = digits.slice(6, 10);

  let formatted = '';
  if (part1) formatted += `${part1}`;
  if (part2) formatted += ` ${part2}`;
  if (part3) formatted += ` ${part3}`;

  return formatted.trim();
};


const CreateAccount = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [mobileNumber, setMobileNumber] = useState('');
  const variant = Form.useWatch('variant', form);
  const status = Form.useWatch('status', form);
  const role = Form.useWatch('role', form);
  const { id } = useParams();
  const [isChecked, setIsChecked] = useState(false);
  const [errors, setErrors] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValues, setFormValues] = useState(null);
  const [hasCustomAccess, setHasCustomAccess] = useState(false);
  const [selectedModules, setSelectedModules] = useState([]);
  const [activeTab, setActiveTab] = useState('basic');
  const [isArchived, setIsArchived] = useState(false);

  const handleCheckboxChange = (e) => {
    setIsChecked(e.target.checked);
    if (errors.agreement) {
      setErrors(prev => ({
        ...prev,
        agreement: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!isChecked && !id) {
      newErrors.agreement = 'You must agree to the data privacy agreement';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    // When role changes, update the selected modules to match the default role modules
    if (role && defaultRoleModules[role]) {
      const moduleGroups = defaultRoleModules[role] || {};
      const allModules = Object.entries(moduleGroups).flatMap(([parent, subs]) => [parent, ...subs]);
      setSelectedModules(allModules);
    }
  }, [role]);


  useEffect(() => {
    const fetchAccount = async () => {
      if (!id) return; // only fetch if editing

      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/accounts/${id}`);
        const result = await res.json();

        if (!res.ok) {
          return message.error(result.message || 'Failed to load account data.');
        }

        // Extract the actual account data from the "data" object
        const data = result.data;

        // Check if mobile exists and format it
        // We only need the last 10 digits for display
        const mobileDigits = data.mobile ? data.mobile.replace(/\D/g, '').slice(-10) : '';
        const formattedMobile = mobileDigits ? formatMobile(mobileDigits) : '';

        // Set hasCustomAccess state
        setHasCustomAccess(data.hasCustomAccess || false);
        setIsArchived(data.isArchived);

        // Use setFieldsValue after form is loaded to set the values correctly
        form.setFieldsValue({
          userID: data.userID,
          firstName: data.firstName,
          middleName: data.middleName,
          lastName: data.lastName,
          email: data.email,
          mobile: formattedMobile,
          role: data.role,
          status: data.status,
          hasCustomAccess: data.hasCustomAccess || false, // Set form value for hasCustomAccess
        });

        setMobileNumber(formattedMobile);

        // Set custom access if it exists
        if (data.hasCustomAccess && data.customModules && data.customModules.length > 0) {
          setSelectedModules(data.customModules || []);
        } else {
          // Use default role modules
          const moduleGroups = defaultRoleModules[data.role] || {};
          const allModules = Object.entries(moduleGroups).flatMap(([parent, subs]) => [parent, ...subs]);
          setSelectedModules(allModules);
        }
      } catch (error) {
        console.error('Error fetching account:', error);
        message.error('Error fetching account data.');
      }
    };

    fetchAccount();
  }, [id, form]);



  useEffect(() => {
    if (role) {
      // Turn off custom access when role changes
      setHasCustomAccess(false);
      form.setFieldsValue({ hasCustomAccess: false });

      // Update the modules to default for this role
      if (defaultRoleModules[role]) {
        const moduleGroups = defaultRoleModules[role] || {};
        const allModules = Object.entries(moduleGroups).flatMap(([parent, subs]) => [parent, ...subs]);
        setSelectedModules(allModules);
      }
    }
  }, [role, form]);

  const handleSubmit = (values) => {
    console.log("values", values)
    if (validateForm()) {
      setFormValues(values);
      setShowConfirmModal(true);
    }
  };

  const handleBack = () => navigate('/admin/manage-accounts');

  const confirmAccountCreation = async () => {
    console.log("formValues", formValues)

    /* if (!formValues) return;

    setIsSubmitting(true); */
    try {
      // Trim string fields
      const trimmedValues = {
        ...formValues,
        firstName: formValues.firstName?.trim() || '',
        middleName: formValues.middleName?.trim() || '',
        lastName: formValues.lastName?.trim() || '',
        email: formValues.email?.trim() || '',
        // Format mobile number
        mobile: formatMobileNumber(formValues.mobile),
        role: formValues.role || '',
        status: formValues.status || '',
        // Remove password from frontend submission
        hasCustomAccess: !!hasCustomAccess,
        customModules: hasCustomAccess ? selectedModules : [],
      };

      console.log("tri,,ed", trimmedValues)

    /*   // Generate user ID if not provided
      if (!formValues.userID || !formValues.userID.trim()) {
        const generatedID = await generateUserID(trimmedValues.role);
        if (!generatedID) {
          throw new Error('Failed to generate user ID');
        }
        trimmedValues.userID = generatedID;
      }
      console.log('Creating/updating account with values:', trimmedValues);

      const url = id
        ? `${process.env.REACT_APP_API_URL}/api/admin/accounts/${id}`
        : `${process.env.REACT_APP_API_URL}/api/admin/create-account`;

      const method = id ? 'PUT' : 'POST';

      // API call to create or update the account
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(trimmedValues)
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle errors
        if (response.status === 409) {
          return message.error(data.message);
        }
        if (response.status >= 400 && response.status < 500) {
          return message.warning(data.message || 'Invalid input.');
        }
        return message.error('Server error. Please try again later.');
      }

      message.success(id ? 'Account successfully updated!' : 'Account successfully created!');

      // Get values from localStorage
      const fullName = localStorage.getItem('fullName');
      const role = localStorage.getItem('role');
      const userID = localStorage.getItem('userID');

      // Log the action
      const logAction = id ? 'Update' : 'Create';
      const fullAccountName = `${trimmedValues.firstName} ${trimmedValues.middleName} ${trimmedValues.lastName}`.replace(/\s+/g, ' ').trim();
      const logDetail = `${logAction === 'Create' ? 'Created' : 'Updated'} account [${trimmedValues.userID}] of ${fullAccountName} (${trimmedValues.role})`;

      const logData = {
        userID: userID,
        accountName: fullName,
        role: role,
        action: logAction,
        detail: logDetail,
      };

      // Record system log
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

      navigate('/admin/manage-accounts'); */
    } catch (error) {
      console.error('Error with account operation:', error);
      message.error(error.message || 'Operation failed. Please try again.');
    } finally {
      setIsSubmitting(false);
      setShowConfirmModal(false);
    }
  };

  // Helper function to format mobile number
  const formatMobileNumber = (mobile) => {
    if (!mobile) return '';

    // Get mobile digits and ensure it starts with a 0
    let mobileDigits = mobile.replace(/\D/g, '');

    // Add leading 0 if it doesn't start with 0
    if (mobileDigits && !mobileDigits.startsWith('0')) {
      mobileDigits = '0' + mobileDigits;
    }

    return mobileDigits;
  };

  const items = [
    {
      key: 'basic',
      label: 'Basic Information',
      children: (
        <div className="container-columns">
          <div className="column">
            <div className="group-title">
              <FaUser className="section-icon" />
              <p className="section-title">USER INFORMATION</p>
            </div>

            <Form.Item
              label="User ID"
              name="userID"
            >
              <Input placeholder="Auto-generated ID" disabled />
            </Form.Item>
            <Form.Item
              label="First Name"
              name="firstName"
              maxLength={50}
              rules={[{ required: true, message: 'Please input first name!' }]}
            >
              <Input maxLength={50} showCount={{ maxLength: 50 }} placeholder="Enter first name" onBeforeInput={handleNameBeforeInput} />
            </Form.Item>

            <Form.Item label="Middle Name" name="middleName">
              <Input placeholder="Leave blank if not applicable" onBeforeInput={handleNameBeforeInput} />
            </Form.Item>

            <Form.Item
              label="Last Name"
              name="lastName"
              rules={[{ required: true, message: 'Please input last name!' }]}
            >
              <Input maxLength={50} showCount={{ maxLength: 50 }} placeholder="Enter last name" onBeforeInput={handleNameBeforeInput} />
            </Form.Item>


            <Form.Item
              label="Mobile"
              name="mobile"
              validateFirst
              rules={[
                { required: true, message: 'Please input mobile number!' },
                {
                  validator: async (_, value) => {
                    if (!value) return Promise.reject('Please input mobile number!');

                    // Use 'let' instead of 'const' since we need to modify this variable
                    let digits = value.replace(/\D/g, '');

                    // Take only the last 10 digits if more are entered
                    if (digits.length > 10) {
                      digits = digits.slice(-10);
                    }

                    if (digits[0] !== '9') {
                      return Promise.reject('Please enter a valid Philippine mobile number (starts with 9)');
                    }

                    if (digits.length !== 10) {
                      return Promise.reject('Please enter a valid 10-digit mobile number');
                    }

                    // Store the current form mobile value's digits for comparison
                    let currentMobileDigits = form.getFieldValue('mobile')?.replace(/\D/g, '');
                    if (currentMobileDigits && currentMobileDigits.length > 10) {
                      currentMobileDigits = currentMobileDigits.slice(-10);
                    }

                    // Only check availability if we're not editing (no id) or if the mobile number has changed
                    if (!id || digits !== currentMobileDigits) {
                      try {
                        // Add a leading 0 when checking availability
                        const mobileWithLeadingZero = '0' + digits;

                        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/check-availability`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            mobile: mobileWithLeadingZero, // Check with leading zero
                            excludeId: id // Pass the current account ID to exclude it from check
                          }),
                        });

                        const data = await res.json();
                        if (data.mobileInUse) {
                          return Promise.reject(data.message || 'Mobile number is already in use.');
                        }
                      } catch (error) {
                        console.error('Validation error:', error);
                        // Don't reject on network errors - let the form submit
                      }
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


            <Form.Item
              label="Email"
              name="email"
              validateFirst
              rules={[
                { required: true, message: 'Please input an email address!' },
                { type: 'email', message: 'Please enter a valid email address!' },
                {
                  validator: async (_, value) => {
                    if (!value) return Promise.resolve();

                    // Only check availability if we're not editing (no id) or if the email has changed
                    if (!id || value !== form.getFieldValue('email')) {
                      try {
                        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/check-availability`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({ email: value, excludeId: id }),
                        });

                        const data = await res.json();
                        if (data.emailInUse) {
                          return Promise.reject('Email is already in use.');
                        }
                      } catch (error) {
                        console.error('Validation error:', error);
                        // Don't reject on network errors - let the form submit
                      }
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input placeholder="juandelacruz@email.com" />
            </Form.Item>
          </div>

          <div className="column">
            <div className="group-title">
              <IoSettings className="section-icon" />
              <p className="section-title">ACCOUNT SETTINGS</p>
            </div>

            <Form.Item
              label="Role"
              name="role"
              rules={[{ required: true, message: 'Please select a role!' }]}
            >
              <Select placeholder="Select a role">
                <Select.Option value="Student">Student</Select.Option>
                <Select.Option value="Faculty">Faculty</Select.Option>
                <Select.Option value="Admissions (Staff)">Admissions (Staff)</Select.Option>
                <Select.Option value="Registrar (Staff)">Registrar (Staff)</Select.Option>
                <Select.Option value="Accounting (Staff)">Accounting (Staff)</Select.Option>
                <Select.Option value="Administration (Sub-Admin)">Administration (Sub-Admin)</Select.Option>
                <Select.Option value="IT (Super Admin)">IT (Super Admin)</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Account Status"
              name="status"
              rules={[{ required: true, message: 'Please select account status!' }]}
              initialValues={{ variant: 'outlined', status: 'Pending Verification' }}
            >
              <Select
                placeholder="Select account status"
                disabled={status === 'Pending Verification'}
              >
                <Select.Option value="Active">Active</Select.Option>
                <Select.Option value="Inactive">Inactive</Select.Option>
                {(!status || status === 'Pending Verification') && (
                  <Select.Option value="Pending Verification">Pending Verification</Select.Option>
                )}
              </Select>
            </Form.Item>

            <Form.Item
              label="Custom Access"
              name="hasCustomAccess"
              valuePropName="checked"
            >
              <Switch
                checked={hasCustomAccess}
                disabled={role === 'IT (Super Admin)'}
                onChange={(checked) => {
                  setHasCustomAccess(checked);
                  form.setFieldsValue({ hasCustomAccess: checked });
                }}
              />
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

          {!isArchived && !id && (
            <div className="column">
              {/* Form title */}
              <h3 className="juan-form-title">Data Privacy Agreement</h3>
              <div className="juan-title-underline"></div>
              {/* Data Privacy Agreement Checkbox */}
              <div className="juan-form-group" style={{ gridColumn: '1 / -1' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="agreement"
                    checked={isChecked}
                    onChange={handleCheckboxChange}
                    style={{
                      width: '16px',
                      height: '16px',
                      margin: '2px 0 0 0',
                      flexShrink: 0
                    }}
                    className={`juan-custom-checkbox ${errors.agreement ? 'juan-input-error' : ''}`}
                  />
                  <label
                    htmlFor="agreement"
                    style={{
                      textAlign: 'justify',
                      whiteSpace: 'normal',
                      wordWrap: 'break-word',
                      display: 'inline-block',
                      width: '100%',
                      fontWeight: 'normal',
                      fontSize: '13px',
                      margin: 0
                    }}
                  >
                    {id ? (
                      // Message for updating an account
                      <span>
                        <strong>I hereby affirm that all information updated in this form is accurate and truthful to the best of my knowledge, and has been modified with the consent and acknowledgment of the concerned individual and/or their parent/guardian. </strong>This <strong>account update</strong> has been carried out by an authorized representative of the institution in accordance with institutional policies.
                      </span>
                    ) : (
                      // Message for creating a new account
                      <span>
                        <strong>I hereby affirm that all information provided in this form is accurate and truthful to the best of my knowledge, and has been submitted with the consent and acknowledgment of the concerned individual and/or their parent/guardian. </strong>This <strong>account creation</strong> has been carried out by an authorized representative of the institution in accordance with institutional policies.
                      </span>
                    )}
                    <br /><br />
                    In compliance with the Data Privacy Act of 2012, San Juan de Dios Educational Foundation Inc. – College will safeguard all submitted data and use it solely for official academic and administrative purposes.
                  </label>
                </div>
                {errors.agreement && (
                  <div className="juan-error-message" style={{ color: 'red', marginTop: '5px' }}>
                    {errors.agreement}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'access',
      label: 'Custom Access Permissions',
      children: (
        <div className="container-columns">
          <div className="column" style={{ gridColumn: '1 / -1' }}>
            <div className="group-title">
              <LockOutlined className="section-icon" />
              <p className="section-title">CUSTOM ACCESS PERMISSIONS</p>
            </div>

            {role ? (
              <>
                <div style={{ marginBottom: 20 }}>
                  <p>
                    {hasCustomAccess
                      ? "Configure custom access permissions for this user. These settings will override the default role permissions."
                      : "This user will use default role permissions. Toggle 'Custom Access' in the Basic Information tab to customize permissions."}
                  </p>
                </div>
                <CustomAccessForm
                  role={role}
                  selectedModules={selectedModules}
                  setSelectedModules={setSelectedModules}
                  hasCustomAccess={hasCustomAccess}
                />
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <p>Please select a role in the Basic Information tab first.</p>
              </div>
            )}
          </div>
        </div>
      ),
    }
  ];

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
              ? 'View Archived Account'  // Display when the account is archived
              : id
                ? 'Edit Account'           // Display when editing an existing account
                : 'Create Account'         // Display when creating a new account
            }
          </p>
        </div>

        <Form
          form={form}
          variant={variant || 'outlined'}
          initialValues={{ variant: 'outlined', status: 'Pending Verification' }}
          labelCol={{ xs: { span: 24 }, sm: { span: 6 } }}
          wrapperCol={{ xs: { span: 24 }, sm: { span: 30 } }}
          onFinish={handleSubmit}
        >
          <Tabs
            items={items}
            activeKey={activeTab}
            onChange={setActiveTab}
          />

          {/* Confirmation Modal */}
          {showConfirmModal && (
            <div className="juan-modal-overlay">
              <div className="juan-confirm-modal">
                <h3>{id ? 'Confirm Update' : 'Confirm Registration'}</h3>
                <p>
                  {id
                    ? 'Are you sure all the updated information is correct? Please review before confirming these changes.'
                    : 'Are you sure all the information provided is correct? Please review before creating this account.'
                  }
                </p>
                <div className="juan-modal-buttons">
                  <button
                    className="juan-modal-cancel"
                    onClick={() => setShowConfirmModal(false)}
                    disabled={isSubmitting}
                  >
                    Review Information
                  </button>
                  <button
                    className="juan-modal-confirm"
                    onClick={confirmAccountCreation}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : id ? 'Yes, Update' : 'Yes, Submit'}
                  </button>
                </div>
                {errors.submit && (
                  <div className="juan-error-message" style={{ marginTop: '10px', textAlign: 'center' }}>
                    {errors.submit}
                  </div>
                )}
              </div>
            </div>
          )}
        </Form>
      </div>
      <Footer />
    </div>
  );
};

export default CreateAccount;