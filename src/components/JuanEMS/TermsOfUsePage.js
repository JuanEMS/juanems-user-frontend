// src/components/Common/TermsOfUsePage.js
import '../../css/JuanEMS/TermsOfUsePage.css';
import { useInView } from 'react-intersection-observer';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faPhone, faEnvelope, faClock } from '@fortawesome/free-solid-svg-icons';
import { FaRegSmileWink } from 'react-icons/fa';
import { faFacebookSquare } from '@fortawesome/free-brands-svg-icons';
import SJDEFILogo from '../../images/SJDEFILogo.png';

function TermsOfUsePage() {
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
        <div className="terms-container">
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
            <main className="termspage-main">
                {/* Hero Section */}
                <section className="terms-hero">
                    <div className="hero-overlay"></div>
                    <div className="hero-content">
                        <h1>Terms of Use</h1>
                        <p>Last Updated: {new Date().toLocaleDateString()}</p>
                    </div>
                </section>

                {/* Terms Content Section */}
                <section className={`terms-content ${contentInView ? 'fade-in-up' : ''}`} ref={contentRef}>
                    <div className="terms-section">
                        <h2>1. Acceptance of Terms</h2>
                        <p>
                            By accessing and using JuanEMS (Juan Enrollment Management System), you accept and agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use this system.
                        </p>
                    </div>

                    <div className="terms-section">
                        <h2>2. System Usage</h2>
                        <p>
                            JuanEMS is designed for the exclusive use of San Juan De Dios Educational Foundation, Inc. (SJDEFI) students, faculty, and authorized personnel for enrollment and academic management purposes.
                        </p>
                        <ul>
                            <li>You must provide accurate and complete information during registration</li>
                            <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                            <li>Unauthorized access or misuse of the system is strictly prohibited</li>
                        </ul>
                    </div>

                    <div className="terms-section">
                        <h2>3. User Responsibilities</h2>
                        <p>
                            As a user of JuanEMS, you agree to:
                        </p>
                        <ul>
                            <li>Use the system only for its intended purposes</li>
                            <li>Not attempt to compromise system security or integrity</li>
                            <li>Not upload or share inappropriate, harmful, or illegal content</li>
                            <li>Comply with all applicable laws and institutional policies</li>
                        </ul>
                    </div>

                    <div className="terms-section">
                        <h2>4. Data Privacy</h2>
                        <p>
                            SJDEFI is committed to protecting your personal information in accordance with the Data Privacy Act of 2012 (Republic Act No. 10173). By using this system, you consent to:
                        </p>
                        <ul>
                            <li>The collection and processing of your personal data for enrollment and academic purposes</li>
                            <li>The sharing of your information with authorized SJDEFI personnel</li>
                            <li>The storage of your data in secure servers</li>
                        </ul>
                    </div>

                    <div className="terms-section">
                        <h2>5. Intellectual Property</h2>
                        <p>
                            All content, features, and functionality of JuanEMS, including but not limited to software, text, graphics, and logos, are the property of SJDEFI and are protected by intellectual property laws.
                        </p>
                    </div>

                    <div className="terms-section">
                        <h2>6. System Availability</h2>
                        <p>
                            While we strive to maintain 24/7 system availability, SJDEFI does not guarantee uninterrupted access to JuanEMS. The system may be temporarily unavailable for maintenance or due to circumstances beyond our control.
                        </p>
                    </div>

                    <div className="terms-section">
                        <h2>7. Limitation of Liability</h2>
                        <p>
                            SJDEFI shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use JuanEMS, including but not limited to errors, omissions, or system failures.
                        </p>
                    </div>

                    <div className="terms-section">
                        <h2>8. Changes to Terms</h2>
                        <p>
                            SJDEFI reserves the right to modify these Terms of Use at any time. Continued use of JuanEMS after such changes constitutes your acceptance of the new terms.
                        </p>
                    </div>

                    <div className="terms-section">
                        <h2>9. Governing Law</h2>
                        <p>
                            These Terms of Use shall be governed by and construed in accordance with the laws of the Republic of the Philippines. Any disputes shall be resolved in the proper courts of Pasay City.
                        </p>
                    </div>

                    <div className="terms-contact">
                        <h3>For questions regarding these Terms of Use, please contact:</h3>
                        <p>SJDEFI Registrar's Office</p>
                        <p>Email: registrarsoffice@sjdefi.edu.ph</p>
                        <p>Phone: +632 551-2763</p>
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

export default TermsOfUsePage;