import React from 'react';
import '../../css/JuanScope/RegistrationSummary.css';

const RegistrationSummary = ({ formData }) => {
  return (
    <div className="summary-container">
      <h3>Registration Summary</h3>
      <div className="summary-section">
        <h4>Personal Information (Step 1)</h4>
        <p><strong>Prefix:</strong> {formData.prefix || 'N/A'}</p>
        <p><strong>First Name:</strong> {formData.firstName || 'N/A'}</p>
        <p><strong>Middle Name:</strong> {formData.middleName || 'N/A'}</p>
        <p><strong>Last Name:</strong> {formData.lastName || 'N/A'}</p>
        <p><strong>Suffix:</strong> {formData.suffix || 'N/A'}</p>
        <p><strong>Gender:</strong> {formData.gender || 'N/A'}</p>
        <p><strong>LRN No:</strong> {formData.lrnNo || 'N/A'}</p>
        <p><strong>Civil Status:</strong> {formData.civilStatus || 'N/A'}</p>
        <p><strong>Religion:</strong> {formData.religion || 'N/A'}</p>
        <p><strong>Birth Date:</strong> {formData.birthDate || 'N/A'}</p>
        <p><strong>Country of Birth:</strong> {formData.countryOfBirth || 'N/A'}</p>
        <p><strong>Birth Place (City):</strong> {formData.birthPlaceCity || 'N/A'}</p>
        <p><strong>Birth Place (Province):</strong> {formData.birthPlaceProvince || 'N/A'}</p>
        <p><strong>Nationality:</strong> {formData.nationality || 'N/A'}</p>
      </div>

      <div className="summary-section">
        <h4>Admission and Enrollment Requirements (Step 2)</h4>
        <p><strong>Academic Year:</strong> {formData.academicYear || 'N/A'}</p>
        <p><strong>Academic Strand:</strong> {formData.academicStrand || 'N/A'}</p>
        <p><strong>Academic Term:</strong> {formData.academicTerm || 'N/A'}</p>
        <p><strong>Academic Level:</strong> {formData.academicLevel || 'N/A'}</p>
        <p><strong>Entry Level:</strong> {formData.entryLevel || 'N/A'}</p>
      </div>

      <div className="summary-section">
        <h4>Contact Details (Step 3)</h4>
        <p><strong>Present Address:</strong> {[
          formData.presentHouseNo,
          formData.presentBarangay ? `Brgy. ${formData.presentBarangay}` : null,
          formData.presentCity,
          formData.presentProvince,
          formData.presentPostalCode
        ].filter(Boolean).join(', ') || 'N/A'}</p>
        <p><strong>Permanent Address:</strong> {[
          formData.permanentHouseNo,
          formData.permanentBarangay ? `Brgy. ${formData.permanentBarangay}` : null,
          formData.permanentCity,
          formData.permanentProvince,
          formData.permanentPostalCode
        ].filter(Boolean).join(', ') || 'N/A'}</p>
        <p><strong>Mobile No:</strong> {formData.mobile || 'N/A'}</p>
        <p><strong>Telephone No:</strong> {formData.telephoneNo || 'N/A'}</p>
        <p><strong>Email Address:</strong> {formData.emailAddress || 'N/A'}</p>
      </div>

      <div className="summary-section">
        <h4>Educational Background (Step 4)</h4>
        <p><strong>Elementary School Name:</strong> {formData.elementarySchoolName || 'N/A'}</p>
        <p><strong>Elementary Last Year Attended:</strong> {formData.elementaryLastYearAttended || 'N/A'}</p>
        <p><strong>Elementary General Average:</strong> {formData.elementaryGeneralAverage || 'N/A'}</p>
        <p><strong>Elementary Remarks:</strong> {formData.elementaryRemarks || 'N/A'}</p>
        <p><strong>Junior High School Name:</strong> {formData.juniorHighSchoolName || 'N/A'}</p>
        <p><strong>Junior High Last Year Attended:</strong> {formData.juniorHighLastYearAttended || 'N/A'}</p>
        <p><strong>Junior High General Average:</strong> {formData.juniorHighGeneralAverage || 'N/A'}</p>
        <p><strong>Junior High Remarks:</strong> {formData.juniorHighRemarks || 'N/A'}</p>
      </div>

      <div className="summary-section">
        <h4>Family Background (Step 5)</h4>
        {Array.isArray(formData.contacts) && formData.contacts.length > 0 ? (
          formData.contacts.map((contact, index) => (
            <div key={index} className="contact-summary">
              <p><strong>Relationship:</strong> {contact.relationship || 'N/A'}</p>
              <p><strong>Name:</strong> {[
                contact.firstName,
                contact.middleName,
                contact.lastName
              ].filter(Boolean).join(' ') || 'N/A'}</p>
              <p><strong>Occupation:</strong> {contact.occupation || 'N/A'}</p>
              <p><strong>Address:</strong> {[
                contact.houseNo,
                contact.city,
                contact.province,
                contact.country
              ].filter(Boolean).join(', ') || 'N/A'}</p>
              <p><strong>Mobile No:</strong> {contact.mobileNo || 'N/A'}</p>
              <p><strong>Telephone No:</strong> {contact.telephoneNo || 'N/A'}</p>
              <p><strong>Email Address:</strong> {contact.emailAddress || 'N/A'}</p>
              <p><strong>Emergency Contact:</strong> {contact.isEmergencyContact ? 'Yes' : 'No'}</p>
            </div>
          ))
        ) : (
          <p>No family contact information provided.</p>
        )}
      </div>
    </div>
  );
};

export default RegistrationSummary;