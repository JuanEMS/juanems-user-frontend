import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faBell, faCalendarAlt, faBars, faTimes, faPerson, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';
import Fuse from 'fuse.js';
import SJDEFILogo from '../../images/SJDEFILogo.png';
import '../../css/JuanScope/ScopeRegistration1.css';
import SessionManager from '../JuanScope/SessionManager';
import SideNavigation from './SideNavigation';
import axios from 'axios';

const countries = [
  { value: 'afghanistan', label: 'Afghanistan' },
  { value: 'albania', label: 'Albania' },
  { value: 'algeria', label: 'Algeria' },
  { value: 'andorra', label: 'Andorra' },
  { value: 'angola', label: 'Angola' },
  { value: 'antigua-and-barbuda', label: 'Antigua and Barbuda' },
  { value: 'argentina', label: 'Argentina' },
  { value: 'armenia', label: 'Armenia' },
  { value: 'australia', label: 'Australia' },
  { value: 'austria', label: 'Austria' },
  { value: 'azerbaijan', label: 'Azerbaijan' },
  { value: 'bahamas', label: 'Bahamas' },
  { value: 'bahrain', label: 'Bahrain' },
  { value: 'bangladesh', label: 'Bangladesh' },
  { value: 'barbados', label: 'Barbados' },
  { value: 'belarus', label: 'Belarus' },
  { value: 'belgium', label: 'Belgium' },
  { value: 'belize', label: 'Belize' },
  { value: 'benin', label: 'Benin' },
  { value: 'bhutan', label: 'Bhutan' },
  { value: 'bolivia', label: 'Bolivia' },
  { value: 'bosnia-and-herzegovina', label: 'Bosnia and Herzegovina' },
  { value: 'botswana', label: 'Botswana' },
  { value: 'brazil', label: 'Brazil' },
  { value: 'brunei', label: 'Brunei' },
  { value: 'bulgaria', label: 'Bulgaria' },
  { value: 'burkina-faso', label: 'Burkina Faso' },
  { value: 'burundi', label: 'Burundi' },
  { value: 'cambodia', label: 'Cambodia' },
  { value: 'cameroon', label: 'Cameroon' },
  { value: 'canada', label: 'Canada' },
  { value: 'cape-verde', label: 'Cape Verde' },
  { value: 'central-african-republic', label: 'Central African Republic' },
  { value: 'chad', label: 'Chad' },
  { value: 'chile', label: 'Chile' },
  { value: 'china', label: 'China' },
  { value: 'colombia', label: 'Colombia' },
  { value: 'comoros', label: 'Comoros' },
  { value: 'congo', label: 'Congo' },
  { value: 'costa-rica', label: 'Costa Rica' },
  { value: 'croatia', label: 'Croatia' },
  { value: 'cuba', label: 'Cuba' },
  { value: 'cyprus', label: 'Cyprus' },
  { value: 'czech-republic', label: 'Czech Republic' },
  { value: 'denmark', label: 'Denmark' },
  { value: 'djibouti', label: 'Djibouti' },
  { value: 'dominica', label: 'Dominica' },
  { value: 'dominican-republic', label: 'Dominican Republic' },
  { value: 'east-timor', label: 'East Timor' },
  { value: 'ecuador', label: 'Ecuador' },
  { value: 'egypt', label: 'Egypt' },
  { value: 'el-salvador', label: 'El Salvador' },
  { value: 'equatorial-guinea', label: 'Equatorial Guinea' },
  { value: 'eritrea', label: 'Eritrea' },
  { value: 'estonia', label: 'Estonia' },
  { value: 'ethiopia', label: 'Ethiopia' },
  { value: 'fiji', label: 'Fiji' },
  { value: 'finland', label: 'Finland' },
  { value: 'france', label: 'France' },
  { value: 'gabon', label: 'Gabon' },
  { value: 'gambia', label: 'Gambia' },
  { value: 'georgia', label: 'Georgia' },
  { value: 'germany', label: 'Germany' },
  { value: 'ghana', label: 'Ghana' },
  { value: 'greece', label: 'Greece' },
  { value: 'grenada', label: 'Grenada' },
  { value: 'guatemala', label: 'Guatemala' },
  { value: 'guinea', label: 'Guinea' },
  { value: 'guinea-bissau', label: 'Guinea-Bissau' },
  { value: 'guyana', label: 'Guyana' },
  { value: 'haiti', label: 'Haiti' },
  { value: 'honduras', label: 'Honduras' },
  { value: 'hungary', label: 'Hungary' },
  { value: 'iceland', label: 'Iceland' },
  { value: 'india', label: 'India' },
  { value: 'indonesia', label: 'Indonesia' },
  { value: 'iran', label: 'Iran' },
  { value: 'iraq', label: 'Iraq' },
  { value: 'ireland', label: 'Ireland' },
  { value: 'israel', label: 'Israel' },
  { value: 'italy', label: 'Italy' },
  { value: 'ivory-coast', label: 'Ivory Coast' },
  { value: 'jamaica', label: 'Jamaica' },
  { value: 'japan', label: 'Japan' },
  { value: 'jordan', label: 'Jordan' },
  { value: 'kazakhstan', label: 'Kazakhstan' },
  { value: 'kenya', label: 'Kenya' },
  { value: 'kiribati', label: 'Kiribati' },
  { value: 'korea-north', label: 'Korea, North' },
  { value: 'korea-south', label: 'Korea, South' },
  { value: 'kosovo', label: 'Kosovo' },
  { value: 'kuwait', label: 'Kuwait' },
  { value: 'kyrgyzstan', label: 'Kyrgyzstan' },
  { value: 'laos', label: 'Laos' },
  { value: 'latvia', label: 'Latvia' },
  { value: 'lebanon', label: 'Lebanon' },
  { value: 'lesotho', label: 'Lesotho' },
  { value: 'liberia', label: 'Liberia' },
  { value: 'libya', label: 'Libya' },
  { value: 'liechtenstein', label: 'Liechtenstein' },
  { value: 'lithuania', label: 'Lithuania' },
  { value: 'luxembourg', label: 'Luxembourg' },
  { value: 'macedonia', label: 'Macedonia' },
  { value: 'madagascar', label: 'Madagascar' },
  { value: 'malawi', label: 'Malawi' },
  { value: 'malaysia', label: 'Malaysia' },
  { value: 'maldives', label: 'Maldives' },
  { value: 'mali', label: 'Mali' },
  { value: 'malta', label: 'Malta' },
  { value: 'marshall-islands', label: 'Marshall Islands' },
  { value: 'mauritania', label: 'Mauritania' },
  { value: 'mauritius', label: 'Mauritius' },
  { value: 'mexico', label: 'Mexico' },
  { value: 'micronesia', label: 'Micronesia' },
  { value: 'moldova', label: 'Moldova' },
  { value: 'monaco', label: 'Monaco' },
  { value: 'mongolia', label: 'Mongolia' },
  { value: 'montenegro', label: 'Montenegro' },
  { value: 'morocco', label: 'Morocco' },
  { value: 'mozambique', label: 'Mozambique' },
  { value: 'myanmar', label: 'Myanmar' },
  { value: 'namibia', label: 'Namibia' },
  { value: 'nauru', label: 'Nauru' },
  { value: 'nepal', label: 'Nepal' },
  { value: 'netherlands', label: 'Netherlands' },
  { value: 'new-zealand', label: 'New Zealand' },
  { value: 'nicaragua', label: 'Nicaragua' },
  { value: 'niger', label: 'Niger' },
  { value: 'nigeria', label: 'Nigeria' },
  { value: 'norway', label: 'Norway' },
  { value: 'oman', label: 'Oman' },
  { value: 'pakistan', label: 'Pakistan' },
  { value: 'palau', label: 'Palau' },
  { value: 'palestine', label: 'Palestine' },
  { value: 'panama', label: 'Panama' },
  { value: 'papua-new-guinea', label: 'Papua New Guinea' },
  { value: 'paraguay', label: 'Paraguay' },
  { value: 'peru', label: 'Peru' },
  { value: 'philippines', label: 'Philippines' },
  { value: 'poland', label: 'Poland' },
  { value: 'portugal', label: 'Portugal' },
  { value: 'qatar', label: 'Qatar' },
  { value: 'romania', label: 'Romania' },
  { value: 'russia', label: 'Russia' },
  { value: 'rwanda', label: 'Rwanda' },
  { value: 'saint-kitts-and-nevis', label: 'Saint Kitts and Nevis' },
  { value: 'saint-lucia', label: 'Saint Lucia' },
  { value: 'saint-vincent-and-the-grenadines', label: 'Saint Vincent and the Grenadines' },
  { value: 'samoa', label: 'Samoa' },
  { value: 'san-marino', label: 'San Marino' },
  { value: 'sao-tome-and-principe', label: 'Sao Tome and Principe' },
  { value: 'saudi-arabia', label: 'Saudi Arabia' },
  { value: 'senegal', label: 'Senegal' },
  { value: 'serbia', label: 'Serbia' },
  { value: 'seychelles', label: 'Seychelles' },
  { value: 'sierra-leone', label: 'Sierra Leone' },
  { value: 'singapore', label: 'Singapore' },
  { value: 'slovakia', label: 'Slovakia' },
  { value: 'slovenia', label: 'Slovenia' },
  { value: 'solomon-islands', label: 'Solomon Islands' },
  { value: 'somalia', label: 'Somalia' },
  { value: 'south-africa', label: 'South Africa' },
  { value: 'south-sudan', label: 'South Sudan' },
  { value: 'spain', label: 'Spain' },
  { value: 'sri-lanka', label: 'Sri Lanka' },
  { value: 'sudan', label: 'Sudan' },
  { value: 'suriname', label: 'Suriname' },
  { value: 'swaziland', label: 'Swaziland' },
  { value: 'sweden', label: 'Sweden' },
  { value: 'switzerland', label: 'Switzerland' },
  { value: 'syria', label: 'Syria' },
  { value: 'taiwan', label: 'Taiwan' },
  { value: 'tajikistan', label: 'Tajikistan' },
  { value: 'tanzania', label: 'Tanzania' },
  { value: 'thailand', label: 'Thailand' },
  { value: 'togo', label: 'Togo' },
  { value: 'tonga', label: 'Tonga' },
  { value: 'trinidad-and-tobago', label: 'Trinidad and Tobago' },
  { value: 'tunisia', label: 'Tunisia' },
  { value: 'turkey', label: 'Turkey' },
  { value: 'turkmenistan', label: 'Turkmenistan' },
  { value: 'tuvalu', label: 'Tuvalu' },
  { value: 'uganda', label: 'Uganda' },
  { value: 'ukraine', label: 'Ukraine' },
  { value: 'united-arab-emirates', label: 'United Arab Emirates' },
  { value: 'united-kingdom', label: 'United Kingdom' },
  { value: 'united-states', label: 'United States' },
  { value: 'uruguay', label: 'Uruguay' },
  { value: 'uzbekistan', label: 'Uzbekistan' },
  { value: 'vanuatu', label: 'Vanuatu' },
  { value: 'vatican-city', label: 'Vatican City' },
  { value: 'venezuela', label: 'Venezuela' },
  { value: 'vietnam', label: 'Vietnam' },
  { value: 'yemen', label: 'Yemen' },
  { value: 'zambia', label: 'Zambia' },
  { value: 'zimbabwe', label: 'Zimbabwe' },
];

const prefixOptions = [
  { value: '', label: 'None' },
  { value: 'Mr.', label: 'Mr.' },
  { value: 'Ms.', label: 'Ms.' },
  { value: 'Mrs.', label: 'Mrs.' },
  { value: 'Dr.', label: 'Dr.' },
  { value: 'Prof.', label: 'Prof.' },
];

const suffixOptions = [
  { value: '', label: 'None' },
  { value: 'Jr.', label: 'Jr.' },
  { value: 'Sr.', label: 'Sr.' },
  { value: 'II', label: 'II' },
  { value: 'III', label: 'III' },
  { value: 'IV', label: 'IV' },
];

const religionOptions = [
  { value: '', label: 'Select Religion' },
  { value: 'Roman Catholic', label: 'Roman Catholic' },
  { value: 'Islam', label: 'Islam' },
  { value: 'Iglesia ni Cristo', label: 'Iglesia ni Cristo' },
  { value: 'Other/None', label: 'Other/None' },
];

const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    height: '34px',
    minHeight: '34px',
    borderColor: state.isFocused ? '#00245A' : (state.selectProps.error ? '#880D0C' : '#ccc'),
    boxShadow: state.isFocused ? '0 0 0 1px #00245A' : 'none',
    '&:hover': {
      borderColor: state.isFocused ? '#00245A' : '#aaa',
    },
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: '0 8px',
    height: '34px',
  }),
  input: (provided) => ({
    ...provided,
    margin: '0',
    padding: '0',
    fontSize: '12px',
  }),
  indicatorsContainer: (provided) => ({
    ...provided,
    height: '34px',
  }),
  placeholder: (provided) => ({
    ...provided,
    fontSize: '12px',
  }),
  singleValue: (provided) => ({
    ...provided,
    fontSize: '12px',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#00245A' : (state.isFocused ? '#f0f0f0' : null),
    fontSize: '12px',
    padding: '6px 12px',
  }),
};

const fuseOptions = {
  keys: ['label', 'value'],
  threshold: 0.4,
  includeScore: true,
  minMatchCharLength: 2,
};

function ScopeRegistration1() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState({});
  const [registrationStatus, setRegistrationStatus] = useState('Incomplete');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unviewedCount, setUnviewedCount] = useState(0);
  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem('registrationData');
    return savedData ? JSON.parse(savedData) : {
      prefix: '',
      lastName: '',
      firstName: '',
      middleName: '',
      suffix: '',
      gender: '',
      lrnNo: '',
      civilStatus: '',
      religion: '',
      birthDate: '',
      countryOfBirth: '',
      birthPlaceCity: '',
      birthPlaceProvince: '',
      nationality: '',
      ...location.state?.formData,
    };
  });
  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [countryOptions, setCountryOptions] = useState(countries);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [nextLocation, setNextLocation] = useState(null);

  const fuse = useMemo(() => new Fuse(countries, fuseOptions), []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Replace the fetchUserData useEffect
  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    const createdAt = localStorage.getItem('createdAt');

    if (!userEmail || !createdAt) {
      navigate('/scope-login', { state: { error: 'No active session found. Please log in.' } });
      return;
    }

    const fetchWithRetry = async (url, retries = 3, delay = 1000) => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetchWithRetry(url, retries - 1, delay);
        }
        throw error;
      }
    };

    const axiosWithRetry = async (config, retries = 3, delay = 1000) => {
      try {
        const response = await axios(config);
        return response;
      } catch (error) {
        if (retries > 0 && error.response?.status !== 400) {
          await new Promise(resolve => setTimeout(resolve, delay));
          return axiosWithRetry(config, retries - 1, delay);
        }
        throw error;
      }
    };

    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError('');

        const createdAtDate = new Date(createdAt);
        if (isNaN(createdAtDate.getTime())) {
          handleLogout();
          navigate('/scope-login', { state: { accountInactive: true, error: 'Invalid session data. Please log in again.' } });
          return;
        }

        const verificationData = await fetchWithRetry(
          `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/verification-status/${userEmail}`
        );

        if (
          verificationData.status !== 'Active' ||
          (createdAt &&
            Math.abs(
              new Date(verificationData.createdAt).getTime() -
                new Date(createdAt).getTime()
            ) > 1000)
        ) {
          handleLogout();
          navigate('/scope-login', { state: { accountInactive: true, error: 'Account is inactive or session expired.' } });
          return;
        }

        const userDataResponse = await fetchWithRetry(
          `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/activity/${userEmail}?createdAt=${encodeURIComponent(createdAt)}`
        );

        const applicantData = await fetchWithRetry(
          `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/personal-details/${userEmail}`
        );

        const registrationData = await fetchWithRetry(
          `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/personal-details/${userEmail}`
        );

        localStorage.setItem('applicantID', applicantData.applicantID || userDataResponse.applicantID || '');
        localStorage.setItem('firstName', applicantData.firstName || userDataResponse.firstName || '');
        localStorage.setItem('middleName', applicantData.middleName || '');
        localStorage.setItem('lastName', applicantData.lastName || userDataResponse.lastName || '');
        localStorage.setItem('dob', applicantData.dob ? new Date(applicantData.dob).toISOString().split('T')[0] : '');
        localStorage.setItem('nationality', applicantData.nationality || '');

        setUserData({
          email: userEmail,
          firstName: applicantData.firstName || userDataResponse.firstName || 'User',
          middleName: applicantData.middleName || '',
          lastName: applicantData.lastName || userDataResponse.lastName || '',
          dob: applicantData.dob ? new Date(applicantData.dob).toISOString().split('T')[0] : '',
          nationality: applicantData.nationality || '',
          studentID: applicantData.studentID || userDataResponse.studentID || 'N/A',
          applicantID: applicantData.applicantID || userDataResponse.applicantID || 'N/A',
        });

        setRegistrationStatus(registrationData.registrationStatus || 'Incomplete');

        if (registrationData.registrationStatus === 'Complete') {
          navigate('/scope-registration-status-complete');
          return;
        }

        setFormData((prev) => ({
          ...prev,
          prefix: location.state?.formData?.prefix || applicantData.prefix || '',
          lastName: location.state?.formData?.lastName || applicantData.lastName || userDataResponse.lastName || '',
          firstName: location.state?.formData?.firstName || applicantData.firstName || userDataResponse.firstName || '',
          middleName: location.state?.formData?.middleName || applicantData.middleName || '',
          suffix: location.state?.formData?.suffix || applicantData.suffix || '',
          gender: location.state?.formData?.gender || applicantData.gender || '',
          lrnNo: location.state?.formData?.lrnNo || applicantData.lrnNo || '',
          civilStatus: location.state?.formData?.civilStatus || applicantData.civilStatus || '',
          religion: location.state?.formData?.religion || applicantData.religion || '',
          birthDate: location.state?.formData?.birthDate || (applicantData.dob ? new Date(applicantData.dob).toISOString().split('T')[0] : ''),
          countryOfBirth: location.state?.formData?.countryOfBirth || applicantData.countryOfBirth || '',
          birthPlaceCity: location.state?.formData?.birthPlaceCity || applicantData.birthPlaceCity || '',
          birthPlaceProvince: location.state?.formData?.birthPlaceProvince || applicantData.birthPlaceProvince || '',
          nationality: location.state?.formData?.nationality || applicantData.nationality || '',
        }));

        const announcementsResponse = await axiosWithRetry({
          method: 'get',
          url: `${process.env.REACT_APP_API_URL}/api/announcements`,
          params: {
            userEmail,
            status: 'Active',
            audience: 'Applicants',
          },
        });
        setUnviewedCount(announcementsResponse.data.unviewedCount || 0);

        setLoading(false);
      } catch (err) {
        console.error('Error loading registration data:', err);
        if (err.response?.status === 400) {
          setError('Invalid request. Please check your session and try again.');
        } else if (err.response?.status === 429) {
          setError('Too many requests. Please try again later.');
        } else {
          setError('Failed to load user data. Please check your connection and try again.');
        }
        setLoading(false);
      }
    };

    fetchUserData();
    const refreshInterval = setInterval(fetchUserData, 5 * 60 * 1000);
    return () => clearInterval(refreshInterval);
  }, [navigate, location.state]);

  // Replace the checkAccountStatus useEffect
  useEffect(() => {
    const checkAccountStatus = async () => {
      try {
        const userEmail = localStorage.getItem('userEmail');
        const createdAt = localStorage.getItem('createdAt');

        if (!userEmail || !createdAt) {
          navigate('/scope-login', { state: { error: 'Session expired. Please log in.' } });
          return;
        }

        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/verification-status/${userEmail}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }

        const data = await response.json();

        if (
          data.status !== 'Active' ||
          new Date(data.createdAt).getTime() !== new Date(createdAt).getTime()
        ) {
          handleLogout();
          navigate('/scope-login', { state: { accountInactive: true, error: 'Account is inactive or session expired.' } });
        }
      } catch (err) {
        console.error('Error checking account status:', err);
        setError('Unable to verify account status. Please check your connection.');
      }
    };

    const interval = setInterval(checkAccountStatus, 60 * 1000);
    checkAccountStatus();
    return () => clearInterval(interval);
  }, [navigate]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isFormDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isFormDirty]);

  // Replace the handleLogout function
  const handleLogout = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      const createdAt = localStorage.getItem('createdAt');

      if (!userEmail) {
        navigate('/scope-login', { state: { error: 'No active session found.' } });
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/logout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: userEmail,
            createdAt: createdAt,
          }),
        }
      );

      if (response.ok) {
        localStorage.clear();
        navigate('/scope-login');
      } else {
        setError('Failed to log out. Please try again.');
      }
    } catch (err) {
      setError('Error during logout process. Please check your connection.');
    } finally {
      setShowLogoutModal(false);
    }
  };

  const handleAnnouncements = () => {
    if (isFormDirty) {
      setNextLocation('/scope-announcements');
      setShowUnsavedModal(true);
    } else {
      navigate('/scope-announcements', { state: { formData } });
    }
  };

  const handleNext = () => {
    if (validateForm()) {
      localStorage.setItem('registrationData', JSON.stringify(formData));
      navigate('/scope-registration-2', { state: { formData } });
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let sanitizedValue = value.replace(/<[^>]*>?/gm, '').replace(/[^a-zA-Z\s]/g, '');
    if (['birthPlaceCity', 'birthPlaceProvince'].includes(name)) {
      sanitizedValue = sanitizedValue.charAt(0).toUpperCase() + sanitizedValue.slice(1);
      if (sanitizedValue.length > 50) return;
    }
    if (name === 'lrnNo') {
      sanitizedValue = value.replace(/[^0-9]/g, '').slice(0, 12);
    }
    setFormData({
      ...formData,
      [name]: sanitizedValue,
    });
    setTouchedFields({
      ...touchedFields,
      [name]: true,
    });
    setIsFormDirty(true);
  };

  const handleSelectChange = (selectedOption, { name }) => {
    setFormData({
      ...formData,
      [name]: selectedOption ? selectedOption.value : '',
    });
    setTouchedFields({
      ...touchedFields,
      [name]: true,
    });
    setIsFormDirty(true);
  };

  const handleCountryInputChange = (inputValue) => {
    if (!inputValue) {
      setCountryOptions(countries);
      return;
    }
    const results = fuse.search(inputValue);
    const formattedResults = results.map((result) => result.item);
    setCountryOptions(formattedResults.length > 0 ? formattedResults : countries);
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'lastName':
      case 'firstName':
        return !value ? `${name === 'firstName' ? 'First Name' : 'Last Name'} is required` : null;
      case 'gender':
        return !value ? 'Gender is required' : null;
      case 'lrnNo':
        if (!value) return 'LRN No is required';
        if (!/^\d{12}$/.test(value)) return 'LRN must be exactly 12 digits';
        return null;
      case 'civilStatus':
        return !value ? 'Civil Status is required' : null;
      case 'religion':
        return !value ? 'Religion is required' : null;
      case 'birthDate':
        return !value ? 'Birth Date is required' : null;
      case 'countryOfBirth':
        return !value ? 'Country of Birth is required' : null;
      case 'birthPlaceCity':
        if (!value) return 'Birth Place (City) is required';
        if (value.length < 2) return 'Birth Place (City) must be at least 2 characters';
        if (value.length > 50) return 'Birth Place (City) cannot exceed 50 characters';
        return null;
      case 'birthPlaceProvince':
        if (!value) return 'Birth Place (Province) is required';
        if (value.length < 2) return 'Birth Place (Province) must be at least 2 characters';
        if (value.length > 50) return 'Birth Place (Province) cannot exceed 50 characters';
        return null;
      case 'nationality':
        return !value ? 'Nationality is required' : null;
      default:
        return null;
    }
  };

  useEffect(() => {
    const newErrors = {};
    Object.keys(touchedFields).forEach((field) => {
      if (touchedFields[field]) {
        const error = validateField(field, formData[field]);
        if (error) newErrors[field] = error;
      }
    });
    setErrors(newErrors);
  }, [formData, touchedFields]);

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      'lastName',
      'firstName',
      'gender',
      'lrnNo',
      'civilStatus',
      'religion',
      'birthDate',
      'countryOfBirth',
      'birthPlaceCity',
      'birthPlaceProvince',
      'nationality',
    ];
    requiredFields.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });
    setErrors(newErrors);
    setTouchedFields(
      requiredFields.reduce((acc, field) => ({ ...acc, [field]: true }), {})
    );
    return Object.keys(newErrors).length === 0;
  };

  const handleModalConfirm = () => {
    setShowUnsavedModal(false);
    if (nextLocation) {
      navigate(nextLocation, { state: { formData } });
    }
  };

  const handleModalCancel = () => {
    setShowUnsavedModal(false);
    setNextLocation(null);
  };

  const selectedPrefix = prefixOptions.find((option) => option.value === formData.prefix);
  const selectedSuffix = suffixOptions.find((option) => option.value === formData.suffix);
  const selectedReligion = religionOptions.find((option) => option.value === formData.religion);
  const selectedCountryOfBirth = countries.find((option) => option.value === formData.countryOfBirth);

  return (
    <SessionManager>
      <div className="scope-registration-container">
        <header className="juan-register-header">
          <div className="juan-header-left">
            <img
              src={SJDEFILogo}
              alt="SJDEFI Logo"
              className="juan-logo-register"
            />
            <div className="juan-header-text">
              <h1>JUAN SCOPE</h1>
            </div>
          </div>
          <div className="hamburger-menu">
            <button
              className="hamburger-button"
              onClick={toggleSidebar}
              aria-label="Toggle navigation menu"
            >
              <FontAwesomeIcon
                icon={sidebarOpen ? faTimes : faBars}
                size="lg"
              />
            </button>
          </div>
        </header>
        <div className="scope-registration-content">
          <SideNavigation
            userData={userData}
            registrationStatus={registrationStatus}
            onNavigate={closeSidebar}
            isOpen={sidebarOpen}
          />
          <main
            className={`scope-main-content ${sidebarOpen ? 'sidebar-open' : ''}`}
          >
            {loading ? (
              <div className="scope-loading">Loading...</div>
            ) : error ? (
              <div className="scope-error">{error}</div>
            ) : (
              <div className="registration-content">
                <h2 className="registration-title">Registration</h2>
                <div className="registration-divider"></div>
                <div className="registration-container">
                  <div className="step-indicator">
                    <div className="step-circles">
                      <div
                        className="step-circle active"
                        style={{ backgroundColor: '#64676C' }}
                      >
                        1
                      </div>
                      <div
                        className="step-line"
                        style={{ backgroundColor: '#D8D8D8' }}
                      ></div>
                      <div
                        className="step-circle"
                        style={{ backgroundColor: '#D8D8D8' }}
                      >
                        2
                      </div>
                      <div
                        className="step-line"
                        style={{ backgroundColor: '#D8D8D8' }}
                      ></div>
                      <div
                        className="step-circle"
                        style={{ backgroundColor: '#D8D8D8' }}
                      >
                        3
                      </div>
                      <div
                        className="step-line"
                        style={{ backgroundColor: '#D8D8D8' }}
                      ></div>
                      <div
                        className="step-circle"
                        style={{ backgroundColor: '#D8D8D8' }}
                      >
                        4
                      </div>
                      <div
                        className="step-line"
                        style={{ backgroundColor: '#D8D8D8' }}
                      ></div>
                      <div
                        className="step-circle"
                        style={{ backgroundColor: '#D8D8D8' }}
                      >
                        5
                      </div>
                      <div
                        className="step-line"
                        style={{ backgroundColor: '#D8D8D8' }}
                      ></div>
                      <div
                        className="step-circle"
                        style={{ backgroundColor: '#D8D8D8' }}
                      >
                        6
                      </div>
                    </div>
                    <div className="step-text">Step 1 of 6</div>
                  </div>
                  <div className="personal-info-section">
                    <div className="personal-info-header">
                      <FontAwesomeIcon
                        icon={faPerson}
                        style={{ color: '#212121' }}
                      />
                      <h3>Personal Information</h3>
                    </div>
                    <div className="personal-info-divider"></div>
                    <div className="reminder-box">
                      <p>
                        <strong>Reminder:</strong> Please provide your correct
                        and complete information. Fields marked with asterisk
                        (<span className="required-asterisk">*</span>) are
                        required. Finish Steps 1 to 6 to complete and save your Registration.
                      </p>
                    </div>
                    <form>
                      <div className="form-grid">
                        <div className="form-group">
                          <label htmlFor="prefix">
                            Prefix: <span className="optional-text">Leave empty if none</span>
                          </label>
                          <Select
                            id="prefix"
                            name="prefix"
                            options={prefixOptions}
                            value={selectedPrefix}
                            onChange={(option) => handleSelectChange(option, { name: 'prefix' })}
                            styles={customSelectStyles}
                            placeholder="Select Prefix"
                            isClearable
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="lastName">
                            Last Name:<span className="required-asterisk">*</span>
                          </label>
                          <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            disabled
                            className="disabled-input"
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="firstName">
                            First Name:<span className="required-asterisk">*</span>
                          </label>
                          <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            disabled
                            className="disabled-input"
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="middleName">
                            Middle Name:
                          </label>
                          <input
                            type="text"
                            id="middleName"
                            name="middleName"
                            value={formData.middleName}
                            disabled
                            className="disabled-input"
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="suffix">
                            Suffix: <span className="optional-text">Leave empty if none</span>
                          </label>
                          <Select
                            id="suffix"
                            name="suffix"
                            options={suffixOptions}
                            value={selectedSuffix}
                            onChange={(option) => handleSelectChange(option, { name: 'suffix' })}
                            styles={customSelectStyles}
                            placeholder="Select Suffix"
                            isClearable
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="gender">
                            Gender:<span className="required-asterisk">*</span>
                          </label>
                          <select
                            id="gender"
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                            onBlur={() =>
                              setTouchedFields({
                                ...touchedFields,
                                gender: true,
                              })
                            }
                            className={errors.gender ? 'input-error' : ''}
                          >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                          </select>
                          {errors.gender && (
                            <span className="error-message">
                              <FontAwesomeIcon icon={faExclamationCircle} /> {errors.gender}
                            </span>
                          )}
                        </div>
                        <div className="form-group">
                          <label htmlFor="lrnNo">
                            LRN No:<span className="required-asterisk">*</span>
                          </label>
                          <input
                            type="text"
                            id="lrnNo"
                            name="lrnNo"
                            value={formData.lrnNo}
                            onChange={handleInputChange}
                            onBlur={() =>
                              setTouchedFields({
                                ...touchedFields,
                                lrnNo: true,
                              })
                            }
                            className={errors.lrnNo ? 'input-error' : ''}
                            placeholder="Enter 12-digit LRN"
                            maxLength={12}
                          />
                          <div className={`character-count ${formData.lrnNo.length > 11 ? 'warning' : ''}`}>
                            {formData.lrnNo.length}/12
                          </div>
                          {errors.lrnNo && (
                            <span className="error-message">
                              <FontAwesomeIcon icon={faExclamationCircle} /> {errors.lrnNo}
                            </span>
                          )}
                        </div>
                        <div className="form-group">
                          <label htmlFor="civilStatus">
                            Civil Status:<span className="required-asterisk">*</span>
                          </label>
                          <select
                            id="civilStatus"
                            name="civilStatus"
                            value={formData.civilStatus}
                            onChange={handleInputChange}
                            onBlur={() =>
                              setTouchedFields({
                                ...touchedFields,
                                civilStatus: true,
                              })
                            }
                            className={errors.civilStatus ? 'input-error' : ''}
                          >
                            <option value="">Select Civil Status</option>
                            <option value="Single">Single</option>
                            <option value="Married">Married</option>
                            <option value="Divorced">Divorced</option>
                            <option value="Widowed">Widowed</option>
                          </select>
                          {errors.civilStatus && (
                            <span className="error-message">
                              <FontAwesomeIcon icon={faExclamationCircle} /> {errors.civilStatus}
                            </span>
                          )}
                        </div>
                        <div className="form-group">
                          <label htmlFor="religion">
                            Religion:<span className="required-asterisk">*</span>
                          </label>
                          <Select
                            id="religion"
                            name="religion"
                            options={religionOptions}
                            value={selectedReligion}
                            onChange={(option) => handleSelectChange(option, { name: 'religion' })}
                            onBlur={() =>
                              setTouchedFields({
                                ...touchedFields,
                                religion: true,
                              })
                            }
                            styles={customSelectStyles}
                            placeholder="Select Religion"
                            error={errors.religion}
                          />
                          {errors.religion && (
                            <span className="error-message">
                              <FontAwesomeIcon icon={faExclamationCircle} /> {errors.religion}
                            </span>
                          )}
                        </div>
                        <div className="form-group">
                          <label htmlFor="birthDate">
                            Birth Date:<span className="required-asterisk">*</span>
                          </label>
                          <input
                            type="date"
                            id="birthDate"
                            name="birthDate"
                            value={formData.birthDate}
                            disabled
                            className="disabled-input"
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="countryOfBirth">
                            Country of Birth:<span className="required-asterisk">*</span>
                          </label>
                          <Select
                            id="countryOfBirth"
                            name="countryOfBirth"
                            options={countryOptions}
                            value={selectedCountryOfBirth}
                            onChange={(option) => handleSelectChange(option, { name: 'countryOfBirth' })}
                            onInputChange={handleCountryInputChange}
                            onBlur={() =>
                              setTouchedFields({
                                ...touchedFields,
                                countryOfBirth: true,
                              })
                            }
                            styles={customSelectStyles}
                            placeholder="Select Country"
                            error={errors.countryOfBirth}
                          />
                          {errors.countryOfBirth && (
                            <span className="error-message">
                              <FontAwesomeIcon icon={faExclamationCircle} /> {errors.countryOfBirth}
                            </span>
                          )}
                        </div>
                        <div className="form-group">
                          <label htmlFor="birthPlaceCity">
                            Birth Place (City):<span className="required-asterisk">*</span>
                          </label>
                          <input
                            type="text"
                            id="birthPlaceCity"
                            name="birthPlaceCity"
                            value={formData.birthPlaceCity}
                            onChange={handleInputChange}
                            onBlur={() =>
                              setTouchedFields({
                                ...touchedFields,
                                birthPlaceCity: true,
                              })
                            }
                            className={errors.birthPlaceCity ? 'input-error' : ''}
                            placeholder="Enter City"
                            maxLength={50}
                          />
                          <div className={`character-count ${formData.birthPlaceCity.length > 45 ? 'warning' : ''}`}>
                            {formData.birthPlaceCity.length}/50
                          </div>
                          {errors.birthPlaceCity && (
                            <span className="error-message">
                              <FontAwesomeIcon icon={faExclamationCircle} /> {errors.birthPlaceCity}
                            </span>
                          )}
                        </div>
                        <div className="form-group">
                          <label htmlFor="birthPlaceProvince">
                            Birth Place (Province):<span className="required-asterisk">*</span>
                          </label>
                          <input
                            type="text"
                            id="birthPlaceProvince"
                            name="birthPlaceProvince"
                            value={formData.birthPlaceProvince}
                            onChange={handleInputChange}
                            onBlur={() =>
                              setTouchedFields({
                                ...touchedFields,
                                birthPlaceProvince: true,
                              })
                            }
                            className={errors.birthPlaceProvince ? 'input-error' : ''}
                            placeholder="Enter Province"
                            maxLength={50}
                          />
                          <div className={`character-count ${formData.birthPlaceProvince.length > 45 ? 'warning' : ''}`}>
                            {formData.birthPlaceProvince.length}/50
                          </div>
                          {errors.birthPlaceProvince && (
                            <span className="error-message">
                              <FontAwesomeIcon icon={faExclamationCircle} /> {errors.birthPlaceProvince}
                            </span>
                          )}
                        </div>
                        <div className="form-group">
                          <label htmlFor="nationality">
                            Nationality:<span className="required-asterisk">*</span>
                          </label>
                          <input
                            type="text"
                            id="nationality"
                            name="nationality"
                            value={formData.nationality}
                            disabled
                            className="disabled-input"
                          />
                        </div>
                      </div>
                      <div className="form-buttons">
                        <button type="button" className="next-button" onClick={handleNext}>
                          Next
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
        {sidebarOpen && (
          <div
            className="sidebar-overlay active"
            onClick={toggleSidebar}
          ></div>
        )}
        {showLogoutModal && (
          <div className="scope-modal-overlay">
            <div className="scope-confirm-modal">
              <h3>Confirm Logout</h3>
              <p>Are you sure you want to logout?</p>
              <div className="scope-modal-buttons">
                <button
                  className="scope-modal-cancel"
                  onClick={() => setShowLogoutModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="scope-modal-confirm"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
        {showUnsavedModal && (
          <div className="scope-modal-overlay">
            <div className="scope-confirm-modal">
              <h3>Unsaved Changes</h3>
              <p>You have unsaved changes. Do you want to leave without saving?</p>
              <div className="scope-modal-buttons">
                <button
                  className="scope-modal-cancel"
                  onClick={handleModalCancel}
                >
                  Stay
                </button>
                <button
                  className="scope-modal-confirm"
                  onClick={handleModalConfirm}
                >
                  Leave
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SessionManager>
  );
}

export default ScopeRegistration1;