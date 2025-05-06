import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faPhone, faEnvelope, faClock, faCheck, faArrowLeft, faSpinner, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { faFacebookSquare } from '@fortawesome/free-brands-svg-icons';
import Select from 'react-select';
import '../../css/JuanScope/Register.css';
import SJDEFILogo from '../../images/SJDEFILogo.png';
import JuanEMSLogo from '../../images/JuanEMSlogo.png';
import registrationPersonImg from '../../images/registrationperson.png';

// Custom styles for react-select
const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    height: '34px',
    minHeight: '34px',
    borderColor: state.isFocused ? '#00245A' : (state.selectProps.error ? '#880D0C' : '#ccc'),
    boxShadow: state.isFocused ? '0 0 0 1px #00245A' : 'none',
    '&:hover': {
      borderColor: state.isFocused ? '#00245A' : '#aaa',
    }
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
    fontSize: '13px',
  }),
  indicatorsContainer: (provided) => ({
    ...provided,
    height: '34px',
  }),
  placeholder: (provided) => ({
    ...provided,
    fontSize: '13px',
  }),
  singleValue: (provided) => ({
    ...provided,
    fontSize: '13px',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#00245A' : (state.isFocused ? '#f0f0f0' : null),
    fontSize: '13px',
    padding: '6px 12px',
  }),
};

function Register2() {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState(() => {
    const defaultData = {
      firstName: '',
      middleName: '',
      lastName: '',
      dob: '',
      email: '',
      mobile: '',
      nationality: '',
      academicYear: '',
      academicTerm: '',
      applyingFor: '',
      academicStrand: '',
    };
    return location.state?.formData || defaultData;
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [dropdownOptions, setDropdownOptions] = useState({
    academicYear: [],
    academicTerm: [],
    applyingFor: [],
    academicStrand: []
  });
  const [touchedFields, setTouchedFields] = useState({});

  // Replace the entire useEffect for fetchDropdownOptions
  useEffect(() => {
    const fetchDropdownOptions = async () => {
      try {
        const endpoints = [
          { key: 'academicYear', url: '/api/dropdown/academic-years' },
          { key: 'academicTerm', url: '/api/dropdown/academic-terms' },
          { key: 'applyingFor', url: '/api/dropdown/year-levels' },
          { key: 'academicStrand', url: '/api/dropdown/academic-strands' }
        ];

        const maxRetries = 3;
        const retryDelay = 1000; // 1 second

        const fetchWithRetry = async (url, retries) => {
          try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}${url}`);
            if (!response.ok) {
              throw new Error(`HTTP error ${response.status}`);
            }
            return await response.json();
          } catch (error) {
            if (retries > 0) {
              await new Promise(resolve => setTimeout(resolve, retryDelay));
              return fetchWithRetry(url, retries - 1);
            }
            throw error;
          }
        };

        const results = await Promise.all(
          endpoints.map(async ({ key, url }) => {
            console.log(`Fetching ${key} from ${url}...`);
            try {
              const data = await fetchWithRetry(url, maxRetries);
              console.log(`${key} data received:`, data);
              return { key, data };
            } catch (error) {
              console.error(`Error fetching ${key}:`, error);
              return { key, data: [], error: `Failed to fetch ${key}: ${error.message}` };
            }
          })
        );

        const options = {};
        let hasError = false;
        const errors = [];

        results.forEach(({ key, data, error }) => {
          options[key] = data;
          if (error) {
            hasError = true;
            errors.push(`${key}: ${error}`);
          }
        });

        setDropdownOptions(options);

        if (hasError) {
          setFetchError(`Unable to load some options: ${errors.join(', ')}. Please check your connection or try again later.`);
        } else {
          setFetchError(null);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching dropdown options:', error);
        setFetchError(`Failed to load application options: ${error.message}. Please refresh the page or contact support.`);
        setLoading(false);
      }
    };

    fetchDropdownOptions();
  }, []);

  // Check for required basic info on load
  useEffect(() => {
    if (!location.state?.formData ||
      !location.state.formData.firstName ||
      !location.state.formData.lastName) {
      navigate('/register');
    }
  }, [location, navigate]);

  // Real-time validation effect
  useEffect(() => {
    const validateField = (name, value) => {
      switch (name) {
        case 'academicYear':
          return !value ? 'Academic Year is required' : null;
        case 'academicTerm':
          return !value ? 'Academic Term is required' : null;
        case 'applyingFor':
          return !value ? 'Applying For is required' : null;
        case 'academicStrand':
          return !value ? 'Academic Strand is required' : null;
        default:
          return null;
      }
    };

    const newErrors = {};
    Object.keys(touchedFields).forEach(field => {
      if (touchedFields[field]) {
        const error = validateField(field, formData[field]);
        if (error) newErrors[field] = error;
      }
    });

    setErrors(newErrors);
  }, [formData, touchedFields]);

  const handleSelectChange = (selectedOption, { name }) => {
    setFormData({
      ...formData,
      [name]: selectedOption ? selectedOption.value : ''
    });

    // Mark field as touched
    if (!touchedFields[name]) {
      setTouchedFields({
        ...touchedFields,
        [name]: true
      });
    }

    // Clear error if field is now valid
    if (errors[name] && selectedOption) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.academicYear) newErrors.academicYear = 'Academic Year is required';
    if (!formData.academicTerm) newErrors.academicTerm = 'Academic Term is required';
    if (!formData.applyingFor) newErrors.applyingFor = 'Applying For is required';
    if (!formData.academicStrand) newErrors.academicStrand = 'Academic Strand is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Mark all fields as touched to show all errors
    const allFieldsTouched = {
      academicYear: true,
      academicTerm: true,
      applyingFor: true,
      academicStrand: true
    };
    setTouchedFields(allFieldsTouched);

    if (validateForm()) {
      navigate('/register3', { state: { formData } });
    }
  };

  const handleBack = () => {
    navigate('/register', { state: { formData } });
  };

  // Check if dropdowns have any options
  const hasNoOptions =
    dropdownOptions.academicYear.length === 0 &&
    dropdownOptions.academicTerm.length === 0 &&
    dropdownOptions.applyingFor.length === 0 &&
    dropdownOptions.academicStrand.length === 0;

  // Improved loading screen
  if (loading) {
    return (
      <div className="juan-register-container">
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
        </header>

        <div className="juan-loading-container" style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: 'calc(120vh - 200px)',
          textAlign: 'center'
        }}>
          <FontAwesomeIcon
            icon={faSpinner}
            spin
            style={{
              fontSize: '50px',
              color: '#00245A',
              marginBottom: '20px'
            }}
          />
          <div className="juan-loading-text" style={{
            fontSize: '18px',
            fontWeight: '500',
            color: '#00245A'
          }}>
            Loading application options...
          </div>
        </div>

        <footer className="juan-register-footer">
          <div className="juan-footer-left">
            <img
              src={JuanEMSLogo}
              alt="SJDEFI Logo"
              className="juan-footer-logo"
            />
            <div className="juan-footer-text">
              <h1>JuanEMS - JUAN SCOPE</h1>
              <p className="juan-footer-motto">© 2025. San Juan De Dios Educational Foundation Inc.</p>
            </div>
          </div>

          <div className="juan-footer-content">
            <div className="juan-footer-links">
              <a href="/about" className="juan-footer-link">About</a>
              <span className="juan-footer-link-separator">|</span>
              <a href="/terms" className="juan-footer-link">Terms of Use</a>
              <span className="juan-footer-link-separator">|</span>
              <a href="/privacy" className="juan-footer-link">Privacy</a>
            </div>

            <a
              href="https://www.facebook.com/SJDEFIcollege"
              target="_blank"
              rel="noopener noreferrer"
              className="juan-footer-social-link"
            >
              <FontAwesomeIcon icon={faFacebookSquare} className="juan-social-icon" />
              <div className="juan-social-text">
                <span className="juan-social-find">Find us on</span>
                <span className="juan-social-platform">Facebook</span>
              </div>
            </a>

            <div className="juan-footer-contact-container">
              <div className="juan-contact-title">
                <FontAwesomeIcon icon={faPhone} />
                <span>CONTACT US</span>
              </div>
              <div className="juan-contact-items">
                <div className="juan-contact-item">
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  <span>2772 Roxas Blvd., Pasay City, Philippines, 1300</span>
                </div>
                <div className="juan-contact-item">
                  <FontAwesomeIcon icon={faPhone} />
                  <span>+632 551-2763</span>
                </div>
                <div className="juan-contact-item">
                  <FontAwesomeIcon icon={faEnvelope} />
                  <span>admission_office@sjdefi.edu.ph | registrarsoffice@sjdefi.edu.ph</span>
                </div>
                <div className="juan-contact-item">
                  <FontAwesomeIcon icon={faClock} />
                  <span>Monday to Thursday - 7:00 AM to 5:00 PM | Friday - 7:00 AM to 4:00 PM</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="juan-register-container">
      {/* Header */}
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
      </header>

      <div className="juan-main-content">
        {/* Left side with gradient background and image */}
        <div className="juan-left-side">
          <div className="juan-gradient-background">
            <h2 className="juan-registration-title">Online Registration</h2>
            <img
              src={registrationPersonImg}
              alt="Registration"
              className="juan-registration-image"
            />
          </div>
        </div>

        {/* Right side with form content */}
        <div className="juan-right-side">
          <div className="juan-form-container">
            {/* Registration form */}
            <div className="juan-registration-form">
              {/* Error message if fetch failed */}
              {fetchError && (
                <div className="juan-error-box" style={{ color: 'red', marginBottom: '15px', padding: '10px', border: '1px solid red', borderRadius: '4px' }}>
                  <p><strong>Error loading options:</strong> {fetchError}</p>
                  <p>Please refresh the page or contact support if the issue persists.</p>
                </div>
              )}

              {/* Warning if no options found */}
              {!fetchError && hasNoOptions && (
                <div className="juan-warning-box" style={{ color: '#856404', backgroundColor: '#fff3cd', marginBottom: '15px', padding: '10px', border: '1px solid #ffeeba', borderRadius: '4px' }}>
                  <p><strong>Warning:</strong> No dropdown options were loaded. This might indicate a connection issue with the database.</p>
                </div>
              )}

              {/* Reminder box */}
              <div className="juan-reminder-box">
                <p>
                  <strong>Reminder:</strong> Please provide your correct and complete information.
                  Fields marked with asterisk (<span className="juan-required-asterisk">*</span>) are required.
                </p>
              </div>

              {/* Step indicator */}
              <div className="juan-step-indicator">
                <div className="juan-step-circles">
                  <div className="juan-step-circle" style={{ backgroundColor: '#34A853' }}>1</div>
                  <div className="juan-step-line" style={{ backgroundColor: '#34A853' }}></div>
                  <div className="juan-step-circle active">2</div>
                  <div className="juan-step-line"></div>
                  <div className="juan-step-circle">3</div>
                </div>
                <div className="juan-step-text">Step 2 of 3</div>
              </div>

              {/* Form title */}
              <h3 className="juan-form-title">Application Term & Strand</h3>
              <div className="juan-title-underline"></div>

              {/* Form fields */}
              <form onSubmit={handleSubmit}>
                <div className="juan-form-grid">
                  {/* Academic Year */}
                  <div className="juan-form-group">
                    <label htmlFor="academicYear">
                      Academic Year:<span className="juan-required-asterisk">*</span>
                    </label>
                    <Select
                      id="academicYear"
                      name="academicYear"
                      options={dropdownOptions.academicYear}
                      value={formData.academicYear ? dropdownOptions.academicYear.find(option => option.value === formData.academicYear) : null}
                      placeholder="Select Academic Year"
                      isClearable
                      onChange={(option) => handleSelectChange(option, { name: "academicYear" })}
                      onBlur={() => setTouchedFields({ ...touchedFields, academicYear: true })}
                      styles={customSelectStyles}
                      className="juan-select-wrapper"
                      classNamePrefix="juan-select"
                      error={errors.academicYear ? true : false}
                    />
                    {errors.academicYear && (
                      <span className="juan-error-message">
                        <FontAwesomeIcon icon={faExclamationCircle} /> {errors.academicYear}
                      </span>
                    )}
                  </div>

                  {/* Academic Term */}
                  <div className="juan-form-group">
                    <label htmlFor="academicTerm">
                      Academic Term:<span className="juan-required-asterisk">*</span>
                    </label>
                    <Select
                      id="academicTerm"
                      name="academicTerm"
                      options={dropdownOptions.academicTerm}
                      value={formData.academicTerm ? dropdownOptions.academicTerm.find(option => option.value === formData.academicTerm) : null}
                      placeholder="Select Academic Term"
                      isClearable
                      onChange={(option) => handleSelectChange(option, { name: "academicTerm" })}
                      onBlur={() => setTouchedFields({ ...touchedFields, academicTerm: true })}
                      styles={customSelectStyles}
                      className="juan-select-wrapper"
                      classNamePrefix="juan-select"
                      error={errors.academicTerm ? true : false}
                    />
                    {errors.academicTerm && (
                      <span className="juan-error-message">
                        <FontAwesomeIcon icon={faExclamationCircle} /> {errors.academicTerm}
                      </span>
                    )}
                  </div>

                  {/* Applying For */}
                  <div className="juan-form-group">
                    <label htmlFor="applyingFor">
                      Applying For:<span className="juan-required-asterisk">*</span>
                    </label>
                    <Select
                      id="applyingFor"
                      name="applyingFor"
                      options={dropdownOptions.applyingFor}
                      value={formData.applyingFor ? dropdownOptions.applyingFor.find(option => option.value === formData.applyingFor) : null}
                      placeholder="Select Application Type"
                      isClearable
                      onChange={(option) => handleSelectChange(option, { name: "applyingFor" })}
                      onBlur={() => setTouchedFields({ ...touchedFields, applyingFor: true })}
                      styles={customSelectStyles}
                      className="juan-select-wrapper"
                      classNamePrefix="juan-select"
                      error={errors.applyingFor ? true : false}
                    />
                    {errors.applyingFor && (
                      <span className="juan-error-message">
                        <FontAwesomeIcon icon={faExclamationCircle} /> {errors.applyingFor}
                      </span>
                    )}
                  </div>

                  {/* Academic Strand */}
                  <div className="juan-form-group">
                    <label htmlFor="academicStrand">
                      Academic Strand:<span className="juan-required-asterisk">*</span>
                    </label>
                    <Select
                      id="academicStrand"
                      name="academicStrand"
                      options={dropdownOptions.academicStrand}
                      value={formData.academicStrand ? dropdownOptions.academicStrand.find(option => option.value === formData.academicStrand) : null}
                      placeholder="Select Academic Strand"
                      isClearable
                      onChange={(option) => handleSelectChange(option, { name: "academicStrand" })}
                      onBlur={() => setTouchedFields({ ...touchedFields, academicStrand: true })}
                      styles={customSelectStyles}
                      className="juan-select-wrapper"
                      classNamePrefix="juan-select"
                      error={errors.academicStrand ? true : false}
                    />
                    {errors.academicStrand && (
                      <span className="juan-error-message">
                        <FontAwesomeIcon icon={faExclamationCircle} /> {errors.academicStrand}
                      </span>
                    )}
                  </div>
                </div>

                <div className="juan-form-buttons">
                  <button
                    type="button"
                    className="juan-cancel-button"
                    onClick={handleBack}
                  >
                    <FontAwesomeIcon icon={faArrowLeft} /> Back
                  </button>
                  <button
                    type="submit"
                    className="juan-next-button"
                  >
                    <FontAwesomeIcon icon={faCheck} /> Next
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="juan-register-footer">
        {/* Left section - Logo and school name */}
        <div className="juan-footer-left">
          <img
            src={JuanEMSLogo}
            alt="SJDEFI Logo"
            className="juan-footer-logo"
          />
          <div className="juan-footer-text">
            <h1>JuanEMS - JUAN SCOPE</h1>
            <p className="juan-footer-motto">© 2025. San Juan De Dios Educational Foundation Inc.</p>
          </div>
        </div>

        {/* Center and right section - organized in a row */}
        <div className="juan-footer-content">
          {/* About, Terms, Privacy links */}
          <div className="juan-footer-links">
            <a href="/about" className="footer-link">About</a>
            <span className="footer-link-separator">|</span>
            <a href="/terms-of-use" className="footer-link">Terms of Use</a>
            <span className="footer-link-separator">|</span>
            <a href="/privacy" className="footer-link">Privacy</a>
          </div>

          {/* Facebook link */}
          <a
            href="https://www.facebook.com/SJDEFIcollege"
            target="_blank"
            rel="noopener noreferrer"
            className="juan-footer-social-link"
          >
            <FontAwesomeIcon icon={faFacebookSquare} className="juan-social-icon" />
            <div className="juan-social-text">
              <span className="juan-social-find">Find us on</span>
              <span className="juan-social-platform">Facebook</span>
            </div>
          </a>

          {/* Contact Form section */}
          <div className="juan-footer-contact-container">
            <div className="juan-contact-title">
              <FontAwesomeIcon icon={faPhone} />
              <span>CONTACT US</span>
            </div>
            <div className="juan-contact-items">
              <div className="juan-contact-item">
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                <span>2772 Roxas Blvd., Pasay City, Philippines, 1300</span>
              </div>
              <div className="juan-contact-item">
                <FontAwesomeIcon icon={faPhone} />
                <span>+632 551-2763</span>
              </div>
              <div className="juan-contact-item">
                <FontAwesomeIcon icon={faEnvelope} />
                <span>admission_office@sjdefi.edu.ph | registrarsoffice@sjdefi.edu.ph</span>
              </div>
              <div className="juan-contact-item">
                <FontAwesomeIcon icon={faClock} />
                <span>Monday to Thursday - 7:00 AM to 5:00 PM | Friday - 7:00 AM to 4:00 PM</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Register2;