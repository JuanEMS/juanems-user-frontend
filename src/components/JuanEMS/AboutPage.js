// src/components/Common/AboutPage.js
import '../../css/JuanEMS/AboutPage.css';
import { useInView } from 'react-intersection-observer';
import React from 'react';
import { FaRegSmileWink, FaCode, FaServer, FaRobot, FaDatabase, FaShieldAlt } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faPhone, faEnvelope, faClock } from '@fortawesome/free-solid-svg-icons';
import { faFacebookSquare } from '@fortawesome/free-brands-svg-icons';
import SJDEFILogo from '../../images/SJDEFILogo.png';
import DeveloperTeam from '../../images/NU MOA Logo.png'; // You should add this image


function AboutPage() {
    const [headerRef, headerInView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    const [introRef, introInView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    const [techRef, techInView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    const [teamRef, teamInView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    const [footerRef, footerInView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    const techFeatures = [
        {
            icon: <FaCode className="tech-icon" />,
            title: "MERN Stack",
            description: "Built with MongoDB, Express, React, and Node.js for a modern, scalable architecture."
        },
        {
            icon: <FaRobot className="tech-icon" />,
            title: "AI Support",
            description: "Incorporates AI technology to provide intelligent assistance and automation."
        },
        {
            icon: <FaServer className="tech-icon" />,
            title: "Cloud-Based",
            description: "Hosted on secure cloud infrastructure for reliability and scalability."
        },
        {
            icon: <FaDatabase className="tech-icon" />,
            title: "Real-time Data",
            description: "Provides real-time updates and synchronization across all modules."
        },
        {
            icon: <FaShieldAlt className="tech-icon" />,
            title: "Secure",
            description: "Implements industry-standard security protocols to protect user data."
        }
    ];

    const developers = [
        {
            name: "Achilles Zeppelin Baranda",
        },
        {
            name: "Angeline Bedis",
        },
        {
            name: "Mark Jerald Esteves",
        },
        {
            name: "Jersey Love Usman",
        }
    ];

    return (
        <div className="about-container">
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
            <main className="aboutpage-main">
                {/* Hero Section */}
                <section className="about-hero">
                    <div className="hero-overlay"></div>
                    <div className="hero-content">
                        <h1>About JuanEMS</h1>
                        <p>The Modern Enrollment Solution for San Juan De Dios Educational Foundation</p>
                    </div>
                </section>

                {/* Introduction Section */}
                <section className={`about-intro ${introInView ? 'fade-in-up' : ''}`} ref={introRef}>
                    <div className="intro-content">
                        <div className="intro-text">
                            <h2>Revolutionizing Enrollment Management</h2>
                            <p>
                                JuanEMS (Juan Enrollment Management System) is a comprehensive digital platform developed to modernize and streamline the enrollment processes at San Juan De Dios Educational Foundation, Inc. As the central portal for all online applications, JuanEMS embodies our commitment to providing exceptional service and support to our students and stakeholders.
                            </p>
                            <p>
                                Designed as a capstone project by students from National University MOA, this system represents a significant leap forward in educational technology, combining cutting-edge web development with practical solutions to meet the evolving needs of modern academic institutions.
                            </p>
                        </div>
                        <div className="intro-image">
                            <img src={SJDEFILogo} alt="SJDEFI Logo" />
                        </div>
                    </div>
                </section>

                {/* Technology Section */}
                <section className={`about-tech ${techInView ? 'fade-in-up' : ''}`} ref={techRef}>
                    <div className="tech-header">
                        <h2>Built With Modern Technology</h2>
                        <p>JuanEMS leverages the latest technologies to deliver a seamless user experience</p>
                    </div>
                    <div className="tech-features">
                        {techFeatures.map((feature, index) => (
                            <div className="tech-card" key={index}>
                                <div className="tech-icon-container">
                                    {feature.icon}
                                </div>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Team Section */}
                <section className={`about-team ${teamInView ? 'fade-in-up' : ''}`} ref={teamRef}>
                    <div className="team-content">
                        <div className="team-image">
                            <img src={DeveloperTeam} alt="Development Team" />
                        </div>
                        <div className="team-info">
                            <h2>Developed by NU MOA Students</h2>
                            <p>
                                JuanEMS was created as a capstone project by Information Technology students from National University - Mall of Asia Campus, demonstrating their technical expertise and commitment to solving real-world problems through technology.
                            </p>
                            <div className="developer-list">
                                {developers.map((developer, index) => (
                                    <div className="developer-card" key={index}>
                                        <h3>{developer.name}</h3>
                                    </div>
                                ))}
                            </div>
                        </div>
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

export default AboutPage;