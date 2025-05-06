import React from 'react';
import '../../css/JuanScope/RegistrationSummary.css';

const RegistrationSummary = ({ formData }) => {
  return (
    <div className="summary-container">
      <h3>Registration Summary</h3>
      <div className="summary-section">
        <h4>Personal Information (Step 1)</h4>
        <p><strong>Prefix:</strong> {formData.prefix}</p>
        <p><strong>First Name:</strong> {formData.firstName}</p>
        <p><strong>Middle Name:</strong> {formData.middleName}</p>
        <p><strong>Last Name:</strong> {formData.lastName}</p>
        <p><strong>Suffix:</strong> {formData.suffix}</p>
        <p><strong>Gender:</strong> {formData.gender}</p>
        <p><strong>LRN No:</strong> {formData.lrnNo}</p>
        <p><strong>Civil Status:</strong> {formData.civilStatus}</p>
        <p><strong>Religion:</strong> {formData.religion}</p>
        <p><strong>Birth Date:</strong> {formData.birthDate}</p>
        <p><strong>Country of Birth:</strong> {formData.countryOfBirth}</p>
        <p><strong>Birth Place (City):</strong> {formData.birthPlaceCity}</p>
        <p><strong>Birth Place (Province):</strong> {formData.birthPlaceProvince}</p>
        <p><strong>Nationality:</strong> {formData.nationality}</p>
      </div>

      <div className="summary-section">
        <h4>Admission and Enrollment Requirements (Step 2)</h4>
        <p><strong>Academic Year:</strong> {formData.academicYear}</p>
        <p><strong>Academic Strand:</strong> {formData.academicStrand}</p>
        <p><strong>Academic Term:</strong> {formData.academicTerm}</p>
        <p><strong>Academic Level:</strong> {formData.academicLevel}</p>
        <p><strong>Entry Level:</strong> {formData.entryLevel}</p>
      </div>

      <div className="summary-section">
        <h4>Contact Details (Step 3)</h4>
        <p><strong>Present Address:</strong> {formData.presentHouseNo}, Brgy. {formData.presentBarangay}, {formData.presentCity}, {formData.presentProvince}, {formData.presentPostalCode}</p>
        <p><strong>Permanent Address:</strong> {formData.permanentHouseNo}, Brgy. {formData.permanentBarangay}, {formData.permanentCity}, {formData.permanentProvince}, {formData.permanentPostalCode}</p>
        <p><strong>Mobile No:</strong> {formData.mobile}</p>
        <p><strong>Telephone No:</strong> {formData.telephoneNo}</p>
        <p><strong>Email Address:</strong> {formData.emailAddress}</p>
      </div>

      <div className="summary-section">
        <h4>Educational Background (Step 4)</h4>
        <p><strong>Elementary School Name:</strong> {formData.elementarySchoolName}</p>
        <p><strong>Elementary Last Year Attended:</strong> {formData.elementaryLastYearAttended}</p>
        <p><strong>Elementary General Average:</strong> {formData.elementaryGeneralAverage}</p>
        <p><strong>Elementary Remarks:</strong> {formData.elementaryRemarks}</p>
        <p><strong>Junior High School Name:</strong> {formData.juniorHighSchoolName}</p>
        <p><strong>Junior High Last Year Attended:</strong> {formData.juniorHighLastYearAttended}</p>
        <p><strong>Junior High General Average:</strong> {formData.juniorHighGeneralAverage}</p>
        <p><strong>Junior High Remarks:</strong> {formData.juniorHighRemarks}</p>
      </div>

      <div className="summary-section">
        <h4>Family Background (Step 5)</h4>
        {formData.contacts && formData.contacts.map((contact, index) => (
          <div key={index} className="contact-summary">
            <p><strong>Relationship:</strong> {contact.relationship}</p>
            <p><strong>Name:</strong> {contact.firstName} {contact.middleName} {contact.lastName}</p>
            <p><strong>Occupation:</strong> {contact.occupation}</p>
            <p><strong>Address:</strong> {contact.houseNo}, {contact.city}, {contact.province}, {contact.country}</p>
            <p><strong>Mobile No:</strong> {contact.mobileNo}</p>
            <p><strong>Telephone No:</strong> {contact.telephoneNo}</p>
            <p><strong>Email Address:</strong> {contact.emailAddress}</p>
            <p><strong>Emergency Contact:</strong> {contact.isEmergencyContact ? 'Yes' : 'No'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RegistrationSummary;