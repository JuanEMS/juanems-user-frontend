import { Button, DatePicker, Input, Table, Tag } from 'antd';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import utc from 'dayjs/plugin/utc';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { BiExport } from 'react-icons/bi';
import { FaPen, FaPlus, FaSearch, FaUserCheck, FaUserTimes } from 'react-icons/fa';
import { FiFilter } from 'react-icons/fi';
import { GrPowerReset } from "react-icons/gr";
import { HiOutlineRefresh } from 'react-icons/hi';
import { MdOutlineKeyboardArrowLeft, MdOutlineManageAccounts } from 'react-icons/md';

import '../../css/UserAdmin/Global.css';
import '../../css/UserAdmin/ManageAccountsPage.css';

import Footer from './Footer';
import Header from './Header';

dayjs.extend(utc);
dayjs.extend(isBetween);

const { RangePicker } = DatePicker;

const QueueHistory = () => {
    const navigate = useNavigate();

  const handleBack = () => navigate('/admin/manage-queue');

  return (
    <div className="main main-container">
      <Header />
      <div className="main-content">
        <div className="page-title">
          <div className="arrows" onClick={handleBack}>
            <MdOutlineKeyboardArrowLeft />
          </div>
          <p className="heading">Queue History</p>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default QueueHistory

