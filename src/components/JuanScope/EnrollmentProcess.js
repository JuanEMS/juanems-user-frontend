import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import '../../css/JuanScope/EnrollmentProcess.css';

const EnrollmentProcess = ({
  registrationStatus,
  admissionRequirementsStatus,
  admissionExamDetailsStatus,
}) => {
  const [examInterviewStatus, setExamInterviewStatus] = useState('Incomplete');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExamInterviewStatus = async (retries = 3, delay = 1000) => {
      try {
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) {
          setError('Please log in to view your exam and interview status.');
          return;
        }

        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/enrollee-applicants/exam-interview/${userEmail}`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch exam and interview status');
        }
        const data = await response.json();
        setExamInterviewStatus(data.preferredExamAndInterviewApplicationStatus || 'Incomplete');
        setError(null);
      } catch (err) {
        console.error('Error fetching exam and interview status:', err);
        if (retries > 0) {
          setTimeout(() => fetchExamInterviewStatus(retries - 1, delay * 2), delay);
        } else {
          setError('Unable to fetch exam and interview status. Please try again later.');
        }
      }
    };

    fetchExamInterviewStatus();
  }, []);

  const steps = [
    {
      title: 'Step 1 of 14: Registration',
      content:
        "Complete your admission registration by filling out all the required information. Click button number 1 'Registration' menu to begin.",
      tips: ['Review and save your data after making any changes.'],
      note: 'This step will be marked as complete once all requirements have been fulfilled.',
    },
    {
      title: 'Step 2 of 14: Exam and Interview Application',
      content:
        'All applicants wishing to enroll in San Juan De Dios Educational Foundation, Inc. are required to take the exam and undergo an interview before becoming an official SJDCIAN.\n\nJuan Scope allows you to select your preferred examination and interview schedule.',
      reminders: ['Generate and bring your test permit on your examination date.'],
      note: 'This step will be marked as complete once you have generated your test permit.',
    },
    {
      title: 'Step 3 of 14: Admission Requirements',
      content: "Submit all necessary documents listed in the 'Admission Requirements' menu.",
<<<<<<< HEAD
      note:
        'If you cannot complete all the requirements, you may file a waiver form instead.\nThis step will be marked as complete once all required documents are submitted or the waiver form is filed.',
=======
      note: "If you cannot complete all the requirements, you may file a waiver form instead.\nThis step will be marked as complete once all required documents are submitted or the waiver form is filed."
>>>>>>> a3fea0106862ae583da46e72204acb6def9bc737
    },
    {
      title: 'Step 4 of 14: Admission Exam Details',
      content:
        'This section displays your exam and interview details, along with the next steps to finalize your schedule. It will indicate whether an exam fee is required and provide your exam permit once payment is made or if no payment is needed.',
      note: 'This step will be marked as complete once the exam permit is generated.',
    },
    {
      title: 'Step 5 of 14: Exam Fee Payment',
      content:
        'Proceed to admission by paying your exam fee through our payment options.\n\nChoose your preferred payment method: Credit Card/Debit Card or E-Wallet',
      note: 'This step will be marked as complete once payment is confirmed.',
    },
    {
      title: 'Step 6 of 14: Exam and Interview Result',
      content:
        'After taking the Admission Test and Interview, the result will determine whether you can continue with your admission process.\n\nThe result will display one of the following:',
      bulletPoints: [
        'Letter of Admission Continuation: If you passed, you may proceed to the next step.',
        'Letter of Regret: If you did not pass, your application process will end here.',
      ],
      note: 'This step will be marked as complete once the result is viewed.',
    },
    {
      title: 'Step 7 of 14: Reservation Payment',
      content:
        'Proceed to admission by paying your reservation slot through our payment options.\n\nChoose your preferred payment method: Credit Card/Debit Card or E-Wallet',
      note: 'This step will be marked as complete once payment is confirmed.',
    },
    {
      title: 'Step 8 of 14: Admission Approval',
      content: 'Wait for the Admissions Office to review your information and submitted documents.',
      note: 'This step will be marked as complete once your admission is approved.',
    },
    {
      title: 'Step 9 of 14: Enrollment Requirements',
      content: "Submit all necessary documents listed in the 'Enrollment Requirements' menu.",
<<<<<<< HEAD
      note:
        'If you cannot complete all the requirements, you may file a waiver form instead.\nThis step will be marked as complete once all required documents are submitted or the waiver form is filed.',
=======
      note: "If you cannot complete all the requirements, you may file a waiver form instead.\nThis step will be marked as complete once all required documents are submitted or the waiver form is filed."
>>>>>>> a3fea0106862ae583da46e72204acb6def9bc737
    },
    {
      title: 'Step 10 of 14: Voucher Application',
      content:
        'This step is optional and not required.\n\nYou may only apply for one voucher application. If you choose not to apply, simply select "Next"',
      note: 'This step will be marked as complete once you either submit a voucher application or not.',
    },
    {
      title: 'Step 11 of 14: Enrollment Approval',
      content:
        'The Office of the Registrar will review your application once it has been endorsed by the Admissions Office at the start of the enrollment period for the specified term.',
      reminders: [
        'If you registered and applied before the enrollment period begins, please wait for the official announcement of the enrollment start. Your application will be processed accordingly.',
      ],
      note: 'This step will be marked as complete once your enrollment is approved.',
    },
    {
      title: 'Step 12 of 14: Student Assessment',
      content: 'This will issue your assessment form that includes the breakdown of your billing.',
      note: 'This step will be marked as complete once your assessment form is issued.',
    },
    {
      title: 'Step 13 of 14: Tuition Payment',
      content:
        'Proceed to enrollment by paying your tuition and/or matriculation fees through our payment options.\n\nRefer to your generated temporary assessment to choose your preferred payment method: Cash Payment or any available Installment option.',
      note: 'This step will be marked as complete once payment is confirmed.',
    },
    {
      title: 'Step 14 of 14: Officially Enrolled',
      content: 'To complete your enrollment, secure the following:',
      bulletPoints: ['Certificate of Matriculation', 'School ID', 'Student Portal Account'],
      finalReminder:
        "Once your application is submitted, it will be subject to the Registrar's Office approval. All information provided in the application cannot be modified after submission.",
      note: 'This step will be marked as complete once all required documents and clearances are secured.',
    },
  ];

  return (
    <>
      <h2 className="enrollment-process-title">Step-by-Step Enrollment Process</h2>
      <div className="enrollment-process-divider"></div>

      <div className="enrollment-process-container">
        {error && <div className="error-message">{error}</div>}
        <div className="welcome-message">
          Welcome to the JuanEMS Enrollment System! Follow these fourteen (14) easy steps to successfully enroll at San Juan De Dios Educational Foundation.
        </div>

        <div className="steps-container">
          <div className="steps-line"></div>

          {steps.map((step, index) => (
            <div key={index} className="step-item">
              <div className="step-number-circle">
                <span>{index + 1}</span>
<<<<<<< HEAD
                {(index === 0 && registrationStatus === 'Complete') ||
                (index === 1 && examInterviewStatus === 'Complete') ||
                (index === 2 && admissionRequirementsStatus === 'Complete') ||
                (index === 3 && admissionExamDetailsStatus === 'Complete') ? (
=======
                {(index === 0 && registrationStatus === 'Complete') || 
                 (index === 1 && examInterviewStatus === 'Complete') ? (
>>>>>>> a3fea0106862ae583da46e72204acb6def9bc737
                  <FontAwesomeIcon icon={faCheckCircle} className="step-complete-icon" />
                ) : null}
              </div>

              <div className="step-content-container">
                <div className="step-content">
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-description">{step.content}</p>

                  {step.bulletPoints && step.bulletPoints.length > 0 && (
                    <ul className="step-bullet-points">
                      {step.bulletPoints.map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  )}

                  {step.tips && step.tips.length > 0 && (
                    <div className="step-tips">
                      <strong>Tip:</strong> {step.tips[0]}
                    </div>
                  )}

                  {step.reminders && step.reminders.length > 0 && (
                    <div className="step-reminders">
                      <strong>Reminder:</strong> {step.reminders[0]}
                    </div>
                  )}

                  {step.finalReminder && (
                    <div className="step-final-reminder">
                      <strong>Final Reminder:</strong> {step.finalReminder}
                    </div>
                  )}

                  <div className="step-note">
                    <strong>Note:</strong> {step.note}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default EnrollmentProcess;