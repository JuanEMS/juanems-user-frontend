import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faArrowLeft, faTimes, faBars, faChevronDown, faChevronUp, faEdit, faTrash, faCheckCircle, faUsers } from '@fortawesome/free-solid-svg-icons';
import { FaPlus } from 'react-icons/fa';
import SJDEFILogo from '../../images/SJDEFILogo.png';
import '../../css/JuanScope/ScopeRegistration1.css';
import SideNavigation from './SideNavigation';
import FamilyRecordModal from './FamilyRecordModal';

function ScopeRegistration5() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [nextLocation, setNextLocation] = useState(null);
  const [contacts, setContacts] = useState(() => {
    const savedContacts = localStorage.getItem('familyContacts');
    return savedContacts ? JSON.parse(savedContacts) : [
      {
        id: 1,
        relationship: 'Parent',
        firstName: 'Juan',
        middleName: 'A',
        lastName: 'Dela Cruz',
        occupation: 'Engineer',
        country: 'philippines',
        province: 'Metro Manila',
        city: 'Quezon City',
        houseNo: '123 Main St',
        postalCode: '1100',
        mobileNo: '+639123456789',
        telephoneNo: '',
        emailAddress: 'juan.delacruz@example.com',
        isEmergencyContact: true,
        isOpen: true,
      },
    ];
  });
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [modalFormData, setModalFormData] = useState({
    relationship: '',
    firstName: '',
    middleName: '',
    lastName: '',
    occupation: '',
    sameAsApplicant: false,
    country: 'philippines',
    province: '',
    city: '',
    houseNo: '',
    postalCode: '',
    mobileNo: '',
    telephoneNo: '',
    emailAddress: '',
    isEmergencyContact: 'no',
  });
  const [modalErrors, setModalErrors] = useState({});
  const [modalTouchedFields, setModalTouchedFields] = useState({});

  // Format mobile number for display
  const formatMobileNumber = (number) => {
    if (!number) return '';
    // Remove any non-digits
    const digits = number.replace(/[^0-9]/g, '');
    // If number starts with +63, keep it, otherwise assume it's the 10-digit number
    if (digits.startsWith('63') && digits.length === 12) {
      return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
    }
    if (digits.length === 10 && digits.startsWith('9')) {
      return `+63 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    }
    return number; // Return original if format doesn't match
  };

  // Update current date and time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Save contacts to localStorage whenever contacts change
  useEffect(() => {
    localStorage.setItem('familyContacts', JSON.stringify(contacts));
  }, [contacts]);

 // Replace the fetchUserData useEffect
 useEffect(() => {
  const userEmail = localStorage.getItem('userEmail');
  const createdAt = localStorage.getItem('createdAt');

  if (!userEmail) {
    navigate('/scope-login');
    return;
  }

  const fetchUserData = async () => {
    try {
      setLoading(true);

      const createdAtDate = new Date(createdAt);
      if (isNaN(createdAtDate.getTime())) {
        handleLogout();
        navigate('/scope-login', { state: { accountInactive: true } });
        return;
      }

      const verificationResponse = await fetch(
        `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/verification-status/${userEmail}`
      );

      if (!verificationResponse.ok) {
        throw new Error('Failed to verify account status');
      }

      const verificationData = await verificationResponse.json();

      if (
        verificationData.status !== 'Active' ||
        (createdAt &&
          Math.abs(
            new Date(verificationData.createdAt).getTime() -
              new Date(createdAt).getTime()
          ) > 1000)
      ) {
        handleLogout();
        navigate('/scope-login', { state: { accountInactive: true } });
        return;
      }

      const userResponse = await fetch(
        `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/activity/${userEmail}?createdAt=${encodeURIComponent(
          createdAt
        )}`
      );

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data');
      }

      const userData = await userResponse.json();

      localStorage.setItem('applicantID', userData.applicantID);
      localStorage.setItem('firstName', userData.firstName);
      localStorage.setItem('middleName', '');
      localStorage.setItem('lastName', userData.lastName);
      localStorage.setItem('dob', userData.dob ? new Date(userData.dob).toISOString().split('T')[0] : '');
      localStorage.setItem('nationality', userData.nationality || '');

      setUserData({
        email: userEmail,
        firstName: userData.firstName || 'User',
        middleName: '',
        lastName: userData.lastName || '',
        dob: userData.dob ? new Date(userData.dob).toISOString().split('T')[0] : '',
        nationality: userData.nationality || '',
        studentID: userData.studentID || 'N/A',
        applicantID: userData.applicantID || 'N/A',
      });

      try {
        const contactsResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/family-contacts/${userEmail}`
        );
        if (contactsResponse.ok) {
          const contactsData = await contactsResponse.json();
          if (contactsData.length > 0) {
            setContacts(contactsData.map(contact => ({
              ...contact,
              mobileNo: formatMobileNumber(contact.mobileNo),
              isOpen: true,
            })));
          }
        }
      } catch (err) {
        console.warn('Family contacts fetch failed, using localStorage:', err);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error loading registration data:', err);
      setError('Failed to load user data. Please try again.');
      setLoading(false);
    }
  };

  fetchUserData();
  const refreshInterval = setInterval(fetchUserData, 5 * 60 * 1000);
  return () => clearInterval(refreshInterval);
}, [navigate]);

    // Replace the checkAccountStatus useEffect
    useEffect(() => {
      const checkAccountStatus = async () => {
        try {
          const userEmail = localStorage.getItem('userEmail');
          const createdAt = localStorage.getItem('createdAt');
  
          if (!userEmail || !createdAt) return;
  
          const response = await fetch(
            `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/verification-status/${userEmail}`
          );
  
          if (!response.ok) {
            throw new Error('Failed to verify account status');
          }
  
          const data = await response.json();
  
          if (
            data.status !== 'Active' ||
            new Date(data.createdAt).getTime() !== new Date(createdAt).getTime()
          ) {
            handleLogout();
            navigate('/scope-login', { state: { accountInactive: true } });
          }
        } catch (err) {
          console.error('Error checking account status:', err);
        }
      };
  
      const interval = setInterval(checkAccountStatus, 60 * 1000);
      checkAccountStatus();
      return () => clearInterval(interval);
    }, [navigate]);
  

  // Handle unsaved changes warning
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
        navigate('/scope-login');
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
        setError('Failed to logout. Please try again.');
      }
    } catch (err) {
      setError('Error during logout process');
    } finally {
      setShowLogoutModal(false);
    }
  };

  const handleAnnouncements = () => {
    if (isFormDirty) {
      setNextLocation('/scope-announcements');
      setShowUnsavedModal(true);
    } else {
      navigate('/scope-announcements', { state: { contacts } });
    }
  };

  // Replace the handleNext function
  const handleNext = async () => {
    if (!contacts.some(contact => contact.isEmergencyContact)) {
      alert('Please select one family record as the contact for emergency.');
      return;
    }
    try {
      const userEmail = localStorage.getItem('userEmail');
      await fetch(`${process.env.REACT_APP_API_URL}/api/enrollee-applicants/family-contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          contacts,
        }),
      });
      setIsFormDirty(false);
      navigate('/scope-registration-6', { state: { contacts } });
    } catch (err) {
      setError('Failed to save family contacts.');
    }
  };

  const handleBack = () => {
    if (isFormDirty) {
      setNextLocation('/scope-registration-4');
      setShowUnsavedModal(true);
    } else {
      navigate('/scope-registration-4', { state: { contacts } });
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const toggleContact = (id) => {
    setContacts(contacts.map(contact =>
      contact.id === id ? { ...contact, isOpen: !contact.isOpen } : contact
    ));
  };

  const handleAddContact = () => {
    setEditingContact(null);
    setModalFormData({
      relationship: '',
      firstName: '',
      middleName: '',
      lastName: '',
      occupation: '',
      sameAsApplicant: false,
      country: 'philippines',
      province: '',
      city: '',
      houseNo: '',
      postalCode: '',
      mobileNo: '',
      telephoneNo: '',
      emailAddress: '',
      isEmergencyContact: contacts.length === 0 ? 'yes' : 'no',
    });
    setModalErrors({});
    setModalTouchedFields({});
    setShowModal(true);
  };

  const handleEditContact = (contact) => {
    setEditingContact(contact);
    setModalFormData({
      relationship: contact.relationship,
      firstName: contact.firstName,
      middleName: contact.middleName,
      lastName: contact.lastName,
      occupation: contact.occupation,
      sameAsApplicant: false,
      country: contact.country,
      province: contact.province,
      city: contact.city,
      houseNo: contact.houseNo,
      postalCode: contact.postalCode,
      mobileNo: contact.mobileNo.replace(/[^0-9]/g, '').slice(-10), // Strip to 10 digits
      telephoneNo: contact.telephoneNo,
      emailAddress: contact.emailAddress,
      isEmergencyContact: contact.isEmergencyContact ? 'yes' : 'no',
    });
    setModalErrors({});
    setModalTouchedFields({});
    setShowModal(true);
  };

  const handleDeleteContact = (id) => {
    if (id === 1 && contacts.length === 1) {
      alert('Contact 1 cannot be deleted as at least one contact is required.');
      return;
    }
    const contactToDelete = contacts.find(contact => contact.id === id);
    if (contactToDelete.isEmergencyContact) {
      setContacts(contacts.filter(contact => contact.id !== id).map((contact, index) => ({
        ...contact,
        isEmergencyContact: index === 0,
      })));
    } else {
      setContacts(contacts.filter(contact => contact.id !== id));
    }
    setIsFormDirty(true);
  };

  const handleModalSave = (newContact) => {
    let updatedContact = { 
      ...newContact,
      mobileNo: formatMobileNumber(newContact.mobileNo)
    };

    if (!editingContact) {
      // Generate sequential ID for new contact
      const maxId = contacts.length > 0 ? Math.max(...contacts.map(c => c.id)) : 0;
      updatedContact.id = maxId + 1;
    }

    if (newContact.isEmergencyContact) {
      setContacts(prev => prev.map(contact => ({
        ...contact,
        isEmergencyContact: contact.id === updatedContact.id,
      })));
    }

    if (editingContact) {
      setContacts(contacts.map(contact =>
        contact.id === editingContact.id ? updatedContact : contact
      ));
    } else {
      setContacts([...contacts, updatedContact]);
    }
    setShowModal(false);
    setIsFormDirty(true);
  };

  const handleModalReset = () => {
    setModalFormData({
      relationship: '',
      firstName: '',
      middleName: '',
      lastName: '',
      occupation: '',
      sameAsApplicant: false,
      country: 'philippines',
      province: '',
      city: '',
      houseNo: '',
      postalCode: '',
      mobileNo: '',
      telephoneNo: '',
      emailAddress: '',
      isEmergencyContact: contacts.length === 0 ? 'yes' : 'no',
    });
    setModalErrors({});
    setModalTouchedFields({});
  };

  const handleModalConfirm = () => {
    setShowUnsavedModal(false);
    if (nextLocation) {
      navigate(nextLocation, { state: { contacts } });
    }
  };

  const handleModalCancelNavigation = () => {
    setShowUnsavedModal(false);
    setNextLocation(null);
  };

  return (
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
                    <div className="step-circle completed">1</div>
                    <div className="step-line completed"></div>
                    <div className="step-circle completed">2</div>
                    <div className="step-line completed"></div>
                    <div className="step-circle completed">3</div>
                    <div className="step-line completed"></div>
                    <div className="step-circle completed">4</div>
                    <div className="step-line completed"></div>
                    <div className="step-circle active">5</div>
                    <div className="step-line"></div>
                    <div className="step-circle">6</div>
                  </div>
                  <div className="step-text">Step 5 of 6</div>
                </div>
                <div className="personal-info-section">
                  <div className="personal-info-header">
                    <FontAwesomeIcon icon={faHome} />
                    <h3>Family Background</h3>
                  </div>
                  <div className="personal-info-divider"></div>
                  <div className="reminder-box">
                    <p>
                      <strong>Reminder:</strong> Exactly one family record must be set as the contact for emergency. Contact 1 is set by default if only one contact exists.
                    </p>
                  </div>
                  <div className="form-section">
                    {contacts.map(contact => (
                      <div className="collapsible-container" key={contact.id}>
                        <div
                          className="section-title collapsible-header"
                          onClick={() => toggleContact(contact.id)}
                        >
                          <h4 style={{ color: '#2A67D5', fontWeight: 'bold', margin: 0 }}>Contact {contact.id}</h4>
                          <FontAwesomeIcon
                            icon={contact.isOpen ? faChevronUp : faChevronDown}
                          />
                        </div>
                        {contact.isOpen && (
                          <div className="collapsible-content">
                            <div className="contact-details">
                              <FontAwesomeIcon icon={faUsers} />
                              <div>
                                <p><strong>Name:</strong> {contact.firstName} {contact.middleName} {contact.lastName}</p>
                                <p><strong>Relationship:</strong> {contact.relationship}</p>
                                <p><strong>Address:</strong> {contact.houseNo}, {contact.city}, {contact.province}, {contact.country}</p>
                                <p><strong>Mobile Number:</strong> {formatMobileNumber(contact.mobileNo)}</p>
                                {contact.isEmergencyContact && (
                                  <div className="emergency-contact">
                                    <FontAwesomeIcon icon={faCheckCircle} />
                                    <span>Contact on emergency</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="contact-actions">
                              <button onClick={() => handleEditContact(contact)}>
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                              <button onClick={() => handleDeleteContact(contact.id)}>
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    <button
                      className="add-contact-button"
                      onClick={handleAddContact}
                      aria-label="Add new contact"
                    >
                      <FaPlus />
                    </button>
                  </div>
                  <div className="form-buttons">
                    <button
                      type="button"
                      className="back-button"
                      onClick={handleBack}
                    >
                      <FontAwesomeIcon icon={faArrowLeft} />
                      Back
                    </button>
                    <div>
                      <button
                        type="button"
                        className="next-button"
                        onClick={handleNext}
                      >
                        Next
                      </button>
                    </div>
                  </div>
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
                onClick={handleModalCancelNavigation}
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
      {showModal && (
        <FamilyRecordModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleModalSave}
          onReset={handleModalReset}
          formData={modalFormData}
          setFormData={setModalFormData}
          errors={modalErrors}
          setErrors={setModalErrors}
          touchedFields={modalTouchedFields}
          setTouchedFields={setModalTouchedFields}
          editingContact={editingContact}
          setIsFormDirty={setIsFormDirty}
          contacts={contacts}
        />
      )}
    </div>
  );
}

export default ScopeRegistration5;