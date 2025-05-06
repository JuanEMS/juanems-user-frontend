import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../css/JuanScope/FamilyRecordModal.css';

function WaiverFormModal({ isOpen, onClose, onSubmit, requirements, userData }) {
  const [waiverData, setWaiverData] = useState({
    selectedRequirements: [],
    reason: '',
    promiseDate: null,
  });
  const [errors, setErrors] = useState({});

  const handleCheckboxChange = (reqId) => {
    setWaiverData((prev) => {
      const selected = prev.selectedRequirements.includes(reqId)
        ? prev.selectedRequirements.filter((id) => id !== reqId)
        : [...prev.selectedRequirements, reqId];
      return { ...prev, selectedRequirements: selected };
    });
    setErrors((prev) => ({ ...prev, selectedRequirements: null }));
  };

  const handleReasonChange = (e) => {
    const value = e.target.value;
    if (value.length <= 250) {
      setWaiverData((prev) => ({ ...prev, reason: value }));
      setErrors((prev) => ({ ...prev, reason: null }));
    }
  };

  const handleDateChange = (date) => {
    setWaiverData((prev) => ({ ...prev, promiseDate: date }));
    setErrors((prev) => ({ ...prev, promiseDate: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    // Removed selectedRequirements validation to allow zero selections
    if (waiverData.selectedRequirements.length > 0) {
      // Only validate reason and promiseDate if at least one requirement is selected
      if (!waiverData.reason.trim()) {
        newErrors.reason = 'Reason is required';
      }
      if (!waiverData.promiseDate) {
        newErrors.promiseDate = 'Promise date is required';
      } else if (waiverData.promiseDate < new Date()) {
        newErrors.promiseDate = 'Promise date cannot be in the past';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(waiverData);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="scope-modal-overlay">
      <div className="family-record-modal">
        <div className="personal-info-header">
          <FontAwesomeIcon icon={faFileAlt} style={{ color: '#212121' }} />
          <h3>Credentials Waiver</h3>
        </div>
        <div className="modal-divider"></div>
        <div className="modal-content">
          <div className="modal-section">
            <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '0.5rem' }}>
              To Whom It May Concern:
            </div>
            <div style={{ fontSize: '12px', marginBottom: '1rem' }}>
              May I request your good office to please allow me to enroll even I lack the following credentials:
            </div>
            <div className="form-section">
              {requirements.map((req) => (
                <div key={req.id} className="checkbox-container">
                  <input
                    type="checkbox"
                    id={`req-${req.id}`}
                    checked={waiverData.selectedRequirements.includes(req.id)}
                    onChange={() => handleCheckboxChange(req.id)}
                  />
                  <label htmlFor={`req-${req.id}`}>{req.name}</label>
                </div>
              ))}
              {errors.selectedRequirements && (
                <span className="error-message">{errors.selectedRequirements}</span>
              )}
            </div>
            <div className="form-section">
              <div className="section-title">
                <h4>Reason:</h4>
              </div>
              <textarea
                value={waiverData.reason}
                onChange={handleReasonChange}
                maxLength={250}
                style={{
                  width: '100%',
                  height: '80px',
                  padding: '0.4rem 0.6rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '12px',
                  resize: 'none',
                }}
              />
              <div style={{ fontSize: '10px', color: '#666', marginTop: '0.2rem' }}>
                {waiverData.reason.length}/250 characters
              </div>
              {errors.reason && (
                <span className="error-message">{errors.reason}</span>
              )}
            </div>
            <div
              style={{
                backgroundColor: '#4285F4',
                color: 'white',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <FontAwesomeIcon icon={faThumbsUp} />
              <span style={{ fontSize: '12px' }}>
                I promise to submit my credentials on or before the specified date below. I understand that failure to submit my credentials on the said date will automatically forfeit my enrollment in the school without any refund. I also understand that release of my transfer credentials will depend on my full payment of any remaining balance due the university.
              </span>
            </div>
            <div className="form-section">
              <div className="form-group">
                <label>
                  Promise Date:<span className="required-asterisk">*</span>
                </label>
                <DatePicker
                  selected={waiverData.promiseDate}
                  onChange={handleDateChange}
                  minDate={new Date()}
                  dateFormat="MMMM d, yyyy"
                  className="form-control"
                  style={{
                    width: '100%',
                    padding: '0.4rem 0.6rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}
                />
                {errors.promiseDate && (
                  <span className="error-message">{errors.promiseDate}</span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="scope-modal-buttons">
          <button className="scope-modal-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="scope-modal-confirm" onClick={handleSubmit}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default WaiverFormModal;