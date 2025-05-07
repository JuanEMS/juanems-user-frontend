import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle, faTimes, faUndo, faSave } from '@fortawesome/free-solid-svg-icons';
import { FaMapMarkerAlt, FaPhone } from 'react-icons/fa';
import Select from 'react-select';
import '../../css/JuanScope/FamilyRecordModal.css';

// List of countries
const countries = [
    { value: 'philippines', label: 'Philippines' },
];

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

const FamilyRecordModal = ({
    isOpen,
    onClose,
    onSave,
    onReset,
    formData,
    setFormData,
    errors,
    setErrors,
    touchedFields,
    setTouchedFields,
    editingContact,
    setIsFormDirty,
    contacts,
}) => {
    const [permanentAddress, setPermanentAddress] = useState(null);
    const [localStorageError, setLocalStorageError] = useState(null);

    // Fetch permanent address from localStorage
    useEffect(() => {
        try {
            const savedData = localStorage.getItem('registrationData');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                if (!parsedData.permanentProvince || !parsedData.permanentCity) {
                    setLocalStorageError('Incomplete permanent address in registration data.');
                    return;
                }
                setPermanentAddress({
                    province: parsedData.permanentProvince || '',
                    city: parsedData.permanentCity || '',
                    houseNo: parsedData.permanentHouseNo || '',
                    postalCode: parsedData.permanentPostalCode || '',
                    barangay: parsedData.permanentBarangay || '',
                });
                setLocalStorageError(null);
            } else {
                setLocalStorageError('No registration data found. Please complete registration first.');
            }
        } catch (error) {
            console.error('Error parsing registrationData from localStorage:', error);
            setLocalStorageError('Failed to load registration data. Please try again.');
        }
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let sanitizedValue = value;

        if (['relationship', 'firstName', 'lastName', 'middleName', 'occupation', 'province', 'city'].includes(name)) {
            sanitizedValue = value.replace(/[^a-zA-Z\s]/g, '').slice(0, 50);
            sanitizedValue = sanitizedValue.charAt(0).toUpperCase() + sanitizedValue.slice(1);
        } else if (name === 'houseNo') {
            sanitizedValue = value.slice(0, 100);
        } else if (name === 'postalCode') {
            sanitizedValue = value.replace(/[^0-9]/g, '').slice(0, 4);
        } else if (name === 'mobileNo') {
            sanitizedValue = value.replace(/[^0-9]/g, '').slice(0, 10);
            if (sanitizedValue.length === 10 && !sanitizedValue.startsWith('9')) {
                sanitizedValue = '';
            }
        } else if (name === 'telephoneNo') {
            sanitizedValue = value.replace(/[^0-9-]/g, '').slice(0, 12);
        } else if (name === 'emailAddress') {
            sanitizedValue = value.slice(0, 100);
        } else if (name === 'isEmergencyContact') {
            sanitizedValue = value;
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

    const handleCheckboxChange = (e) => {
        const checked = e.target.checked;
        setFormData({
            ...formData,
            sameAsApplicant: checked,
            province: checked && permanentAddress ? permanentAddress.province : formData.province,
            city: checked && permanentAddress ? permanentAddress.city : formData.city,
            houseNo: checked && permanentAddress ? permanentAddress.houseNo : formData.houseNo,
            postalCode: checked && permanentAddress ? permanentAddress.postalCode : formData.postalCode,
            barangay: checked && permanentAddress ? permanentAddress.barangay : formData.barangay,
        });
        setTouchedFields({
            ...touchedFields,
            province: true,
            city: true,
            houseNo: true,
            postalCode: true,
            barangay: true,
        });
        setIsFormDirty(true);
    };

    const validateField = (name, value) => {
        switch (name) {
            case 'relationship':
            case 'firstName':
            case 'lastName':
                if (!value) return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
                if (value.length < 2) return `${name.charAt(0).toUpperCase() + name.slice(1)} must be at least 2 characters`;
                return null;
            case 'province':
            case 'city':
                if (!value) return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
                if (value.length < 2) return `${name.charAt(0).toUpperCase() + name.slice(1)} must be at least 2 characters`;
                return null;
            case 'houseNo':
                if (!value) return 'House No. & Street is required';
                return null;
            case 'postalCode':
                if (!value) return 'Postal Code is required';
                if (!/^\d{4}$/.test(value)) return 'Postal Code must be exactly 4 digits';
                return null;
            case 'barangay':
                if (!value) return 'Barangay is required';
                return null;
            case 'mobileNo':
                if (!value) return 'Mobile No. is required';
                if (!/^[9]\d{9}$/.test(value)) return 'Mobile No. must be 10 digits starting with 9';
                return null;
            case 'emailAddress':
                if (!value) return 'Email Address is required';
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
                return null;
            case 'isEmergencyContact':
                if (!value) return 'Emergency Contact selection is required';
                return null;
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
    }, [formData, touchedFields, setErrors]);

    const validateForm = () => {
        const newErrors = {};
        const requiredFields = ['relationship', 'firstName', 'lastName', 'province', 'city', 'houseNo', 'postalCode', 'barangay', 'mobileNo', 'emailAddress', 'isEmergencyContact'];

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

    const handleSave = () => {
        if (validateForm()) {
            const newContact = {
                id: editingContact ? editingContact.id : Date.now(),
                relationship: formData.relationship,
                firstName: formData.firstName,
                middleName: formData.middleName,
                lastName: formData.lastName,
                occupation: formData.occupation,
                country: formData.country,
                province: formData.sameAsApplicant && permanentAddress ? permanentAddress.province : formData.province,
                city: formData.sameAsApplicant && permanentAddress ? permanentAddress.city : formData.city,
                houseNo: formData.sameAsApplicant && permanentAddress ? permanentAddress.houseNo : formData.houseNo,
                postalCode: formData.sameAsApplicant && permanentAddress ? permanentAddress.postalCode : formData.postalCode,
                barangay: formData.sameAsApplicant && permanentAddress ? permanentAddress.barangay : formData.barangay,
                mobileNo: `+63${formData.mobileNo}`,
                telephoneNo: formData.telephoneNo,
                emailAddress: formData.emailAddress,
                isEmergencyContact: formData.isEmergencyContact === 'yes',
                isOpen: true,
            };
            onSave(newContact);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="scope-modal-overlay">
            <div className="scope-confirm-modal family-record-modal">
                <h3>Family Record</h3>
                <div className="modal-divider"></div>
                {localStorageError && (
                    <div className="error-message">
                        <FontAwesomeIcon icon={faExclamationCircle} /> {localStorageError}
                    </div>
                )}
                <div className="modal-content">
                    <div className="modal-section">
                        <div className="form-group">
                            <label htmlFor="relationship">
                                Relationship:<span className="required-asterisk">*</span>
                            </label>
                            <input
                                type="text"
                                id="relationship"
                                name="relationship"
                                value={formData.relationship}
                                onChange={handleInputChange}
                                onBlur={() => setTouchedFields({ ...touchedFields, relationship: true })}
                                className={errors.relationship ? 'input-error' : ''}
                                placeholder="Enter Relationship"
                                maxLength={50}
                            />
                            {errors.relationship && (
                                <span className="error-message">
                                    <FontAwesomeIcon icon={faExclamationCircle} /> {errors.relationship}
                                </span>
                            )}
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
                                onChange={handleInputChange}
                                onBlur={() => setTouchedFields({ ...touchedFields, firstName: true })}
                                className={errors.firstName ? 'input-error' : ''}
                                placeholder="Enter First Name"
                                maxLength={50}
                            />
                            {errors.firstName && (
                                <span className="error-message">
                                    <FontAwesomeIcon icon={faExclamationCircle} /> {errors.firstName}
                                </span>
                            )}
                        </div>
                        <div className="form-group">
                            <label htmlFor="middleName">Middle Name:</label>
                            <input
                                type="text"
                                id="middleName"
                                name="middleName"
                                value={formData.middleName}
                                onChange={handleInputChange}
                                placeholder="Enter Middle Name"
                                maxLength={50}
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
                                onChange={handleInputChange}
                                onBlur={() => setTouchedFields({ ...touchedFields, lastName: true })}
                                className={errors.lastName ? 'input-error' : ''}
                                placeholder="Enter Last Name"
                                maxLength={50}
                            />
                            {errors.lastName && (
                                <span className="error-message">
                                    <FontAwesomeIcon icon={faExclamationCircle} /> {errors.lastName}
                                </span>
                            )}
                        </div>
                        <div className="form-group">
                            <label htmlFor="occupation">Occupation:</label>
                            <input
                                type="text"
                                id="occupation"
                                name="occupation"
                                value={formData.occupation}
                                onChange={handleInputChange}
                                placeholder="Enter Occupation"
                                maxLength={50}
                            />
                        </div>
                        <div className="form-section">
                            <div className="section-title">
                                <FaMapMarkerAlt />
                                <h4>Address</h4>
                            </div>
                            <div className="personal-info-divider"></div>
                            <div className="checkbox-container">
                                <input
                                    type="checkbox"
                                    id="sameAsApplicant"
                                    checked={formData.sameAsApplicant}
                                    onChange={handleCheckboxChange}
                                    disabled={!permanentAddress}
                                />
                                <label htmlFor="sameAsApplicant">
                                    Same with applicant’s permanent address
                                    {!permanentAddress && ' (Address not available)'}
                                </label>
                            </div>
                            <div className="form-group">
                                <label htmlFor="country">
                                    Country:<span className="required-asterisk">*</span>
                                </label>
                                <Select
                                    id="country"
                                    name="country"
                                    options={countries}
                                    value={countries.find(option => option.value === formData.country)}
                                    onChange={(option) => handleSelectChange(option, { name: 'country' })}
                                    styles={customSelectStyles}
                                    placeholder="Select Country"
                                    isDisabled
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="province">
                                    Province:<span className="required-asterisk">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="province"
                                    name="province"
                                    value={formData.province}
                                    onChange={handleInputChange}
                                    onBlur={() => setTouchedFields({ ...touchedFields, province: true })}
                                    className={errors.province ? 'input-error' : ''}
                                    placeholder="Enter Province"
                                    maxLength={50}
                                    disabled={formData.sameAsApplicant}
                                />
                                {errors.province && (
                                    <span className="error-message">
                                        <FontAwesomeIcon icon={faExclamationCircle} /> {errors.province}
                                    </span>
                                )}
                            </div>
                            <div className="form-group">
                                <label htmlFor="city">
                                    City/Municipality:<span className="required-asterisk">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="city"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    onBlur={() => setTouchedFields({ ...touchedFields, city: true })}
                                    className={errors.city ? 'input-error' : ''}
                                    placeholder="Enter City/Municipality"
                                    maxLength={50}
                                    disabled={formData.sameAsApplicant}
                                />
                                {errors.city && (
                                    <span className="error-message">
                                        <FontAwesomeIcon icon={faExclamationCircle} /> {errors.city}
                                    </span>
                                )}
                            </div>
                            <div className="form-group">
                                <label htmlFor="houseNo">
                                    House No. & Street:<span className="required-asterisk">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="houseNo"
                                    name="houseNo"
                                    value={formData.houseNo}
                onChange={handleInputChange}
                                    onBlur={() => setTouchedFields({ ...touchedFields, houseNo: true })}
                                    className={errors.houseNo ? 'input-error' : ''}
                                    placeholder="Enter House No. & Street"
                                    maxLength={100}
                                    disabled={formData.sameAsApplicant}
                                />
                                {errors.houseNo && (
                                    <span className="error-message">
                                        <FontAwesomeIcon icon={faExclamationCircle} /> {errors.houseNo}
                                    </span>
                                )}
                            </div>
                            <div className="form-group">
                                <label htmlFor="postalCode">
                                    Postal Code:<span className="required-asterisk">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="postalCode"
                                    name="postalCode"
                                    value={formData.postalCode}
                                    onChange={handleInputChange}
                                    onBlur={() => setTouchedFields({ ...touchedFields, postalCode: true })}
                                    className={errors.postalCode ? 'input-error' : ''}
                                    placeholder="Enter 4-digit Postal Code"
                                    maxLength={4}
                                    disabled={formData.sameAsApplicant}
                                />
                                {errors.postalCode && (
                                    <span className="error-message">
                                        <FontAwesomeIcon icon={faExclamationCircle} /> {errors.postalCode}
                                    </span>
                                )}
                            </div>
                            <div className="form-group">
                                <label htmlFor="barangay">
                                    Barangay:<span className="required-asterisk">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="barangay"
                                    name="barangay"
                                    value={formData.barangay}
                                    onChange={handleInputChange}
                                    onBlur={() => setTouchedFields({ ...touchedFields, barangay: true })}
                                    className={errors.barangay ? 'input-error' : ''}
                                    placeholder="Enter Barangay"
                                    maxLength={50}
                                    disabled={formData.sameAsApplicant}
                                />
                                {errors.barangay && (
                                    <span className="error-message">
                                        <FontAwesomeIcon icon={faExclamationCircle} /> {errors.barangay}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="modal-section">
                        <div className="form-section">
                            <div className="section-title">
                                <FaPhone className="phone-icon" />
                                <h4>Contacts</h4>
                            </div>
                            <div className="personal-info-divider"></div>
                            <div className="form-group">
                                <label htmlFor="mobileNo">
                                    Mobile No.:<span className="required-asterisk">*</span>
                                </label>
                                <div className="mobile-input-container">
                                    <span className="country-code">+63</span>
                                    <input
                                        type="text"
                                        id="mobileNo"
                                        name="mobileNo"
                                        value={formData.mobileNo}
                                        onChange={handleInputChange}
                                        onBlur={() => setTouchedFields({ ...touchedFields, mobileNo: true })}
                                        className={errors.mobileNo ? 'input-error' : ''}
                                        placeholder="9123456789"
                                        maxLength={10}
                                    />
                                </div>
                                {errors.mobileNo && (
                                    <span className="error-message">
                                        <FontAwesomeIcon icon={faExclamationCircle} /> {errors.mobileNo}
                                    </span>
                                )}
                            </div>
                            <div className="form-group">
                                <label htmlFor="telephoneNo">Telephone No.:</label>
                                <input
                                    type="text"
                                    id="telephoneNo"
                                    name="telephoneNo"
                                    value={formData.telephoneNo}
                                    onChange={handleInputChange}
                                    placeholder="Enter Telephone No."
                                    maxLength={12}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="emailAddress">
                                    Email Address:<span className="required-asterisk">*</span>
                                </label>
                                <input
                                    type="email"
                                    id="emailAddress"
                                    name="emailAddress"
                                    value={formData.emailAddress}
                                    onChange={handleInputChange}
                                    onBlur={() => setTouchedFields({ ...touchedFields, emailAddress: true })}
                                    className={errors.emailAddress ? 'input-error' : ''}
                                    placeholder="Enter Email Address"
                                    maxLength={100}
                                />
                                {errors.emailAddress && (
                                    <span className="error-message">
                                        <FontAwesomeIcon icon={faExclamationCircle} /> {errors.emailAddress}
                                    </span>
                                )}
                            </div>
                            <div className="form-group">
                                <label>
                                    Contact on Emergency:<span className="required-asterisk">*</span>
                                </label>
                                <div className="radio-group">
                                    <label>
                                        <input
                                            type="radio"
                                            name="isEmergencyContact"
                                            value="yes"
                                            checked={formData.isEmergencyContact === 'yes'}
                                            onChange={handleInputChange}
                                            disabled={contacts.some(contact => contact.isEmergencyContact && (!editingContact || contact.id !== editingContact.id))}
                                        />
                                        Yes
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="isEmergencyContact"
                                            value="no"
                                            checked={formData.isEmergencyContact === 'no'}
                                            onChange={handleInputChange}
                                        />
                                        No
                                    </label>
                                </div>
                                {errors.isEmergencyContact && (
                                    <span className="error-message">
                                        <FontAwesomeIcon icon={faExclamationCircle} /> {errors.isEmergencyContact}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="scope-modal-buttons">
                    <button className="scope-modal-cancel" onClick={onClose}>
                        <FontAwesomeIcon icon={faTimes} /> Cancel
                    </button>
                    <div className="button-group">
                        <button className="scope-modal-reset" onClick={onReset}>
                            <FontAwesomeIcon icon={faUndo} /> Reset
                        </button>
                        <button className="scope-modal-confirm" onClick={handleSave}>
                            <FontAwesomeIcon icon={faSave} /> Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FamilyRecordModal;