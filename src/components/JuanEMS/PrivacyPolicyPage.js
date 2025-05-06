// src/components/Common/PrivacyPolicyPage.js
import '../../css/JuanEMS/PrivacyPolicyPage.css';
import { useInView } from 'react-intersection-observer';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaRegSmileWink } from 'react-icons/fa';
import { faMapMarkerAlt, faPhone, faEnvelope, faClock } from '@fortawesome/free-solid-svg-icons';
import { faFacebookSquare } from '@fortawesome/free-brands-svg-icons';
import SJDEFILogo from '../../images/SJDEFILogo.png';

function PrivacyPolicyPage() {
  const [headerRef, headerInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [contentRef, contentInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [footerRef, footerInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div className="privacy-container">
            {/* Header */}
            <header className="homepage-header">
                <div className="header-left">
                    <img
                        src={SJDEFILogo}
                        alt="SJDEFI Logo"
                        className="logohome"
                    />
                    <div className="header-text">
                        <h1>SAN JUAN DE DIOS EDUCATIONAL FOUNDATION, INC.</h1>
                        <p className="motto">Where faith and reason are expressed in Charity.</p>
                    </div>
                </div>
                <div className="header-right">
                    <p>
                        Welcome to <strong>JuanEMS</strong>{' '}
                        <FaRegSmileWink className="icon" />
                    </p>
                </div>
            </header>

      {/* Main Content */}
      <main className="privacypage-main">
        {/* Hero Section */}
        <section className="privacy-hero">
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <h1>Privacy Policy</h1>
            <p>Last Updated: {new Date().toLocaleDateString()}</p>
          </div>
        </section>

        {/* Privacy Content Section */}
        <section className={`privacy-content ${contentInView ? 'fade-in-up' : ''}`} ref={contentRef}>
          <div className="privacy-section">
            <h2>1. Data Collection</h2>
            <p>
              JuanEMS collects personal information necessary for enrollment and academic purposes, including but not limited to:
            </p>
            <ul>
              <li>Full name, birth date, and contact information</li>
              <li>Academic records and enrollment history</li>
              <li>Government-issued IDs and other identification documents</li>
              <li>Payment information for tuition and fees</li>
            </ul>
          </div>

          <div className="privacy-section">
            <h2>2. Purpose of Data Processing</h2>
            <p>
              We process your personal data for the following purposes:
            </p>
            <ul>
              <li>Processing enrollment applications and academic records</li>
              <li>Communicating important school announcements</li>
              <li>Generating official school documents and certificates</li>
              <li>Complying with government reporting requirements</li>
              <li>Improving our services and systems</li>
            </ul>
          </div>

          <div className="privacy-section">
            <h2>3. Data Protection Measures</h2>
            <p>
              SJDEFI implements appropriate organizational and technical security measures to protect your personal data, including:
            </p>
            <ul>
              <li>Secure servers with encryption and firewalls</li>
              <li>Role-based access controls</li>
              <li>Regular security audits and updates</li>
              <li>Staff training on data privacy</li>
            </ul>
          </div>

          <div className="privacy-section">
            <h2>4. Data Retention</h2>
            <p>
              We retain personal data only for as long as necessary:
            </p>
            <ul>
              <li>Active student records: Until graduation plus 10 years</li>
              <li>Financial records: 10 years from last transaction</li>
              <li>Inactive applications: 2 years from submission</li>
            </ul>
            <p>
              After retention periods, data is securely disposed of or anonymized.
            </p>
          </div>

          <div className="privacy-section">
            <h2>5. Your Rights Under Data Privacy Act</h2>
            <p>
              As a data subject, you have the right to:
            </p>
            <ul>
              <li>Be informed about how your data is processed</li>
              <li>Access your personal data in our possession</li>
              <li>Correct inaccurate or incomplete data</li>
              <li>Request deletion of your personal data</li>
              <li>Object to processing of your data</li>
              <li>File a complaint with the National Privacy Commission</li>
            </ul>
          </div>

          <div className="privacy-section">
            <h2>6. Third-Party Sharing</h2>
            <p>
              We may share your data with authorized third parties only when necessary for:
            </p>
            <ul>
              <li>Government agencies (DepEd, CHED, etc.) for reporting</li>
              <li>Accredited partner institutions for academic purposes</li>
              <li>Service providers under strict confidentiality agreements</li>
            </ul>
          </div>

          <div className="privacy-section">
            <h2>7. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy periodically. Significant changes will be communicated through our official channels.
            </p>
          </div>

          <div className="privacy-contact">
            <h3>For data privacy concerns, please contact:</h3>
            <p>SJDEFI Data Protection Officer</p>
            <p>Email: dpo@sjdefi.edu.ph</p>
            <p>Phone: +632 551-2763 (Local 123)</p>
          </div>
        </section>
      </main>

            {/* Footer */}
            <footer
                ref={footerRef}
                className={`homepage-footer ${footerInView ? 'fade-in-up' : ''}`}
            >
                {/* Left section - Logo and school name */}
                <div className="footer-left">
                    <img
                        src={SJDEFILogo}
                        alt="SJDEFI Logo"
                        className="footer-logo"
                    />
                    <div className="footer-text">
                        <h1>SAN JUAN DE DIOS EDUCATIONAL FOUNDATION, INC.</h1>
                        <p className="footer-motto">Where faith and reason are expressed in Charity.</p>
                    </div>
                </div>

                {/* Center and right section - organized in a row */}
                <div className="footer-content">
                    {/* About, Terms, Privacy links */}
                    <div className="footer-links">
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
                        className="footer-social-link"
                    >
                        <FontAwesomeIcon icon={faFacebookSquare} className="social-icon" />
                        <div className="social-text">
                            <span className="social-find">Find us on</span>
                            <span className="social-platform">Facebook</span>
                        </div>
                    </a>

                    {/* Contact Form section */}
                    <div className="footer-contact-container">
                        <div className="contact-title">
                            <FontAwesomeIcon icon={faPhone} />
                            <span>CONTACT US</span>
                        </div>
                        <div className="contact-items">
                            <div className="contact-item">
                                <FontAwesomeIcon icon={faMapMarkerAlt} />
                                <span>2772 Roxas Blvd., Pasay City, Philippines, 1300</span>
                            </div>
                            <div className="contact-item">
                                <FontAwesomeIcon icon={faPhone} />
                                <span>+632 551-2763</span>
                            </div>
                            <div className="contact-item">
                                <FontAwesomeIcon icon={faEnvelope} />
                                <span>admission_office@sjdefi.edu.ph | registrarsoffice@sjdefi.edu.ph</span>
                            </div>
                            <div className="contact-item">
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

export default PrivacyPolicyPage;