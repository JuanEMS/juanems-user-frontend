import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card, Checkbox, message, Select, Switch, Tabs } from 'antd';
import { FaUser } from "react-icons/fa";
import { IoSettings } from "react-icons/io5";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { LockOutlined } from '@ant-design/icons';

import { createAccountSchema } from './schema';
import CustomAccessForm from './CustomAccessForm';
import { generateUserID, checkAvailability, createOrUpdateAccount, fetchAccount, logSystemAction } from './api';
import Footer from '../Footer';
import Header from '../Header';
import '../../css/JuanScope/Register.css';
import '../../css/UserAdmin/CreateAccount.css';
import '../../css/UserAdmin/Global.css';

const formatMobile = (value) => {
  if (!value) return '';
  let digits = value.replace(/\D/g, '').slice(0, 10);
  return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 10)]
    .filter(Boolean)
    .join(' ');
};

const CreateAccount = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isChecked, setIsChecked] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasCustomAccess, setHasCustomAccess] = useState(false);
  const [selectedModules, setSelectedModules] = useState([]);
  const [activeTab, setActiveTab] = useState('basic');
  const [isArchived, setIsArchived] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      status: 'Pending Verification',
      hasCustomAccess: false,
    },
  });

  const role = watch('role');

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      const result = await fetchAccount(id);
      if (result.success) {
        const { data } = result;
        setHasCustomAccess(data.hasCustomAccess || false);
        setIsArchived(data.isArchived);

        const mobileDigits = data.mobile ? data.mobile.replace(/\D/g, '').slice(-10) : '';
        const formattedMobile = mobileDigits ? formatMobile(mobileDigits) : '';
        setMobileNumber(formattedMobile);

        reset({
          ...data,
          mobile: formattedMobile,
          hasCustomAccess: data.hasCustomAccess || false,
        });

        if (data.hasCustomAccess && data.customModules?.length > 0) {
          setSelectedModules(data.customModules);
        }
      } else {
        message.error(result.error || 'Failed to load account data.');
      }
    };

    fetchData();
  }, [id, reset]);

  const onSubmit = async (data) => {
    console.log('Form data:', data);
    
    if (!isChecked && !id) {
      message.error('Please agree to the data privacy agreement');
      return;
    }

    try {
      setIsSubmitting(true);

      // Format the data
      const formattedData = {
        ...data,
        mobile: '0' + data.mobile.replace(/\D/g, ''),
        hasCustomAccess,
        customModules: hasCustomAccess ? selectedModules : [],
      };

      // Generate userID if needed
      if (!formattedData.userID) {
        const generatedID = await generateUserID(formattedData.role);
        if (!generatedID) throw new Error('Failed to generate user ID');
        formattedData.userID = generatedID;
      }

      console.log('Formatted data:', formattedData);

      // Create or update account
      const result = await createOrUpdateAccount(formattedData, id);
      if (!result.success) throw new Error(result.error);

      // Log the action
      const fullName = localStorage.getItem('fullName');
      const userRole = localStorage.getItem('role');
      const userID = localStorage.getItem('userID');

      const logAction = id ? 'Update' : 'Create';
      const fullAccountName = `${data.firstName} ${data.middleName} ${data.lastName}`.replace(/\s+/g, ' ').trim();
      
      await logSystemAction({
        userID,
        accountName: fullName,
        role: userRole,
        action: logAction,
        detail: `${logAction === 'Create' ? 'Created' : 'Updated'} account [${formattedData.userID}] of ${fullAccountName} (${formattedData.role})`,
      });

      message.success(id ? 'Account successfully updated!' : 'Account successfully created!');
      navigate('/admin/manage-accounts');
    } catch (error) {
      console.error('Error:', error);
      message.error(error.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
      setShowConfirmModal(false);
    }
  };

  const items = [
    {
      key: 'basic',
      label: 'Basic Information',
      children: (
        <div className="container-columns">
          {/* Basic Information Form */}
          {/* ... (Keep the existing JSX for basic information) ... */}
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
    },
  ];

  return (
    <div className="main main-container">
      <Header />
      <div className="main-content">
        <div className="page-title">
          <div className="arrows" onClick={() => navigate('/admin/manage-accounts')}>
            <MdOutlineKeyboardArrowLeft />
          </div>
          <p className="heading">
            {isArchived ? 'View Archived Account' : id ? 'Edit Account' : 'Create Account'}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Tabs items={items} activeKey={activeTab} onChange={setActiveTab} />
          {/* ... (Keep the existing modal JSX) ... */}
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default CreateAccount;
