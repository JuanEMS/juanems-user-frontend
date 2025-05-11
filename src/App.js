import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/JuanEMS/HomePage';
import SplashScreen from './components/JuanEMS/SplashScreen';
import Register from './components/JuanScope/Register';
import Register2 from './components/JuanScope/Register2';
import Register3 from './components/JuanScope/Register3';
import VerifyEmail from './components/JuanScope/VerifyEmail';
import ScopeLogin from './components/JuanScope/ScopeLogin';
import ScopeDashboard from './components/JuanScope/ScopeDashboard';
import AboutPage from './components/JuanEMS/AboutPage';
import TermsOfUsePage from './components/JuanEMS/TermsOfUsePage';
import PrivacyPolicyPage from './components/JuanEMS/PrivacyPolicyPage';
import SessionManager from './components/JuanScope/SessionManager';
import ScopeAnnouncement from './components/JuanScope/ScopeAnnouncement';
import ScopeRegistration1 from './components/JuanScope/ScopeRegistration1';
import ScopeRegistration2 from './components/JuanScope/ScopeRegistration2';
import ScopeRegistration3 from './components/JuanScope/ScopeRegistration3';
import ScopeRegistration4 from './components/JuanScope/ScopeRegistration4';
import ScopeRegistration5 from './components/JuanScope/ScopeRegistration5';
import ScopeRegistration6 from './components/JuanScope/ScopeRegistration6';
import RegistrationStatusComplete from './components/JuanScope/RegistrationStatusComplete';
import ScopeExamInterviewApplication from './components/JuanScope/ScopeExamInterviewApplication';
import ScopeAdmissionRequirements from './components/JuanScope/ScopeAdmissionRequirements';
import ScopeAdmissionExamDetails from './components/JuanScope/ScopeAdmissionExamDetails';
import ScopeExamFeePayment from './components/JuanScope/ScopeExamFeePayment';
import ScopeExamInterviewResult from './components/JuanScope/ScopeExamInterviewResult';
import ScopeReservationPayment from './components/JuanScope/ScopeReservationPayment';

import Admin_LoginPage from './components/UserAdmin/LoginPage';
import Admin_DashboardPage from './components/UserAdmin/DashboardPage';
import Admin_ManageAccountsPage from './components/UserAdmin/ManageAccountsPage';
import Admin_ManageApplicationsPage from './components/UserAdmin/ManageApplicationsPage';
import Admin_ManageEnrollmentPage from './components/UserAdmin/ManageEnrollmentPage';
import Admin_ManagePaymentsPage from './components/UserAdmin/ManagePaymentsPage';
import Admin_ManageProgramPage from './components/UserAdmin/ManageProgramPage';
import Admin_ManageQueuePage from './components/UserAdmin/ManageQueuePage';
import Admin_ManageSchedulePage from './components/UserAdmin/ManageSchedulePage';
import Admin_ManageStudentSchedule from './components/UserAdmin/ManageStudentSchedule';
import Admin_ManageFacultySchedule from './components/UserAdmin/ManageFacultySchedule';
import Admin_ManageStudentRecordsPage from './components/UserAdmin/ManageStudentRecordsPage';
import Admin_OverallSystemLogs from './components/UserAdmin/OverallSystemLogsPage';
import Admin_CreateAnnouncements from './components/UserAdmin/CreateAnnouncementsPage';
import Admin_CreateAccount from './components/UserAdmin/CreateAccount';
import Admin_ManageStrandsPage from './components/UserAdmin/ManageStrandsPage';
import Admin_CreateStrand from './components/UserAdmin/CreateStrand';
import Admin_ManageSectionsPage from './components/UserAdmin/ManageSectionsPage';
import Admin_CreateSection from './components/UserAdmin/CreateSection';
import Admin_ManageSubjectsPage from './components/UserAdmin/ManageSubjectsPage';
import Admin_CreateSubject from './components/UserAdmin/CreateSubject';
import Admin_AccessControl from './components/UserAdmin/AccessControl';
import Admin_VerifyEmail from './components/UserAdmin/VerifyEmail';
import Admin_ForgotPassword from './components/UserAdmin/ForgotPassword';




function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Default Route (SplashScreen) */}
          <Route path="/" element={<SplashScreen />} />

          {/* Other routes */}
          <Route path="/home" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/terms-of-use" element={<TermsOfUsePage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />

          <Route path="/register" element={<Register />} />
          <Route path="/register2" element={<Register2 />} />
          <Route path="/register3" element={<Register3 />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/scope-login" element={<ScopeLogin />} />
          <Route path="/scope-dashboard" element={<SessionManager><ScopeDashboard /></SessionManager>} />
          <Route path="/scope-announcements" element={<SessionManager><ScopeAnnouncement /></SessionManager>} />
          <Route path="/scope-registration" element={<SessionManager><ScopeRegistration1 /></SessionManager>} />
          <Route path="/scope-registration-2" element={<SessionManager><ScopeRegistration2 /></SessionManager>} />
          <Route path="/scope-registration-3" element={<SessionManager><ScopeRegistration3 /></SessionManager>} />
          <Route path="/scope-registration-4" element={<SessionManager><ScopeRegistration4 /></SessionManager>} />
          <Route path="/scope-registration-5" element={<SessionManager><ScopeRegistration5 /></SessionManager>} />
          <Route path="/scope-registration-6" element={<SessionManager><ScopeRegistration6 /></SessionManager>} />
          <Route path="/scope-registration-status-complete" element={<SessionManager><RegistrationStatusComplete /></SessionManager>} />
          <Route path="/scope-exam-interview-application" element={<SessionManager><ScopeExamInterviewApplication /></SessionManager>} />
          <Route path="/scope-admission-requirements" element={<SessionManager><ScopeAdmissionRequirements /></SessionManager>} />
          <Route path="/scope-admission-exam-details" element={<SessionManager><ScopeAdmissionExamDetails /></SessionManager>} />
          <Route path="/scope-exam-fee-payment" element={<SessionManager><ScopeExamFeePayment /></SessionManager>} />
          <Route path="/scope-exam-interview-result" element={<SessionManager><ScopeExamInterviewResult /></SessionManager>} />
          <Route path="/scope-reservation-payment" element={<SessionManager><ScopeReservationPayment /></SessionManager>} />


          {/* Admin Routes */}
          <Route path="/admin" element={<Admin_LoginPage />} />
          <Route path="/admin/forgot-password" element={<Admin_ForgotPassword />} />
          <Route path="/admin/dashboard" element={<Admin_DashboardPage />} />
          <Route path="/admin/manage-accounts" element={<Admin_ManageAccountsPage />} />
          <Route path="/admin/manage-accounts/create" element={<Admin_CreateAccount />} />
          <Route path="/admin/manage-accounts/edit/:id" element={<Admin_CreateAccount />} />
          <Route path="/admin/manage-applications" element={<Admin_ManageApplicationsPage />} />
          <Route path="/admin/manage-enrollment" element={<Admin_ManageEnrollmentPage />} />
          <Route path="/admin/manage-payments" element={<Admin_ManagePaymentsPage />} />
          <Route path="/admin/manage-program" element={<Admin_ManageProgramPage />} />
          <Route path="/admin/manage-queue" element={<Admin_ManageQueuePage />} />
          <Route path="/admin/manage-schedule" element={<Admin_ManageSchedulePage />} />
          <Route path="/admin/manage-student-schedule" element={<Admin_ManageStudentSchedule />} />
          <Route path="/admin/manage-faculty-schedule" element={<Admin_ManageFacultySchedule />} />
          <Route path="/admin/manage-student-records" element={<Admin_ManageStudentRecordsPage />} />
          <Route path="/admin/manage-overall-system-logs" element={<Admin_OverallSystemLogs />} />
          <Route path="/admin/create-announcements" element={<Admin_CreateAnnouncements />} />
          <Route path="/admin/manage-strands" element={<Admin_ManageStrandsPage />} />
          <Route path="/admin/manage-strands/create" element={<Admin_CreateStrand />} />
          <Route path="/admin/manage-strands/edit/:id" element={<Admin_CreateStrand />} />
          <Route path="/admin/manage-sections" element={<Admin_ManageSectionsPage />} />
          <Route path="/admin/manage-sections/create" element={<Admin_CreateSection />} />
          <Route path="/admin/manage-sections/edit/:id" element={<Admin_CreateSection />} />
          <Route path="/admin/manage-subjects" element={<Admin_ManageSubjectsPage />} />
          <Route path="/admin/manage-subjects/create" element={<Admin_CreateSubject />} />
          <Route path="/admin/manage-subjects/edit/:id" element={<Admin_CreateSubject />} />
          <Route path="/admin/access-control" element={<Admin_AccessControl />} />
          <Route path="/admin/verify-email" element={<Admin_VerifyEmail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;