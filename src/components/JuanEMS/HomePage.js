import React, { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { FaRegSmileWink, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faPhone, faEnvelope, faClock } from '@fortawesome/free-solid-svg-icons';
import { faFacebookSquare } from '@fortawesome/free-brands-svg-icons';
import '../../css/JuanEMS/HomePage.css';
import SJDEFILogo from '../../images/SJDEFILogo.png';
import Banner1 from '../../images/be an sjdcian.png';
import Banner2 from '../../images/banner 2 sjdefi.png';
import Banner3 from '../../images/banner 3 sjdefi.png';
import ScopeImage from '../../images/scope.png';
import JuanEMSLogo from '../../images/JuanEMS logotop image final.png';

function HomePage() {
    const navigate = useNavigate(); // Initialize useNavigate
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const banners = [Banner1, Banner2, Banner3];

    // Intersection observer hooks
    const [headingRef, headingInView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    const [cardsRef, cardsInView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    const [teleprompterRef, teleprompterInView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    const [aboutRef, aboutInView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    const [footerRef, footerInView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    // Card data
    const cards = [
        {
            number: '1',
            title: 'JUAN SC',
            imageLetter: true,
            imageLetterPath: ScopeImage,
            restOfTitle: 'PE',
            description: 'Provides you the fastest way to apply for SJDEFI admission. Create your profile and set an appointment for your entrance examination.',
            buttons: [
                { text: 'Login', style: 'login', destination: '/scope-login' },
                { text: 'Register', style: 'register', destination: '/register' },
            ],
        },
        {
            number: '2',
            title: 'JUAN IS',
            description: 'Access and use JUAN IS modules anytime, anywhere. The Information System of San Juan De Dios Educational Foundation, Inc.',
            buttons: [{ text: 'Login', style: 'login', destination: '/juan-is' }],
        },
        {
            number: '3',
            title: 'USER ADMIN',
            description: 'A dedicated portal for authorized administrators to access and manage essential system modules.',
            buttons: [
                { text: 'Login', style: 'login', destination: '/admin' },
            ],
        },
    ];

    // Function to go to next slide
    const nextSlide = () => {
        setCurrentSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 5000);
    };

    // Function to go to previous slide
    const prevSlide = () => {
        setCurrentSlide((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 5000);
    };

    // Auto-rotate slides every 5 seconds
    useEffect(() => {
        let interval;
        if (isAutoPlaying) {
            interval = setInterval(() => {
                setCurrentSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
            }, 5000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isAutoPlaying, banners.length]);

    return (
        <div className="home-container">
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

            {/* Gradient and Carousel Section */}
            <div className="gradient-carousel-container">
                <div className="gradient-background"></div>
                <div className="carousel-wrapper">
                    <div className="carousel">
                        {banners.map((banner, index) => (
                            <div
                                key={index}
                                className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
                            >
                                <img
                                    src={banner}
                                    alt={`Banner ${index + 1}`}
                                    className="carousel-image"
                                />
                            </div>
                        ))}
                        <button
                            className="carousel-button prev"
                            onClick={prevSlide}
                            aria-label="Previous slide"
                            type="button"
                        >
                            <FaChevronLeft />
                        </button>
                        <button
                            className="carousel-button next"
                            onClick={nextSlide}
                            aria-label="Next slide"
                            type="button"
                        >
                            <FaChevronRight />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="homepage-main">
                {/* Heading Section */}
                <div
                    ref={headingRef}
                    className={`heading-section ${headingInView ? 'fade-in-up' : ''}`}
                >
                    <h2 className="heading-title">Start Your SJDCIAN Journey</h2>
                    <p className="heading-description">
                        Begin your educational adventure at San Juan De Dios Educational Foundation, Inc. with JuanEMS—your gateway to a seamless enrollment experience. Explore Juan Scope for hassle-free online admission and stay connected with Juan IS, the institution's comprehensive information system.
                    </p>
                </div>

                {/* Cards Section */}
                <div
                    ref={cardsRef}
                    className={`cards-container ${cardsInView ? 'fade-in-up' : ''}`}
                >
                    {cards.map((card, index) => (
                        <div key={index} className="card-wrapper">
                            {/* Card Number */}
                            <div className="number-circle">
                                <span className="number-text">{card.number}</span>
                            </div>

                            {/* Card */}
                            <div className="card">
                                {/* Title Area */}
                                <div className="card-title-container">
                                    {card.imageLetter ? (
                                        <div className="title-with-image-container">
                                            <div className="title-image-wrapper">
                                                <h3 className="card-title">{card.title}</h3>
                                                <img
                                                    src={card.imageLetterPath}
                                                    alt="Scope"
                                                    className="letter-image"
                                                />
                                            </div>
                                            <h3 className="card-title">{card.restOfTitle}</h3>
                                        </div>
                                    ) : (
                                        <h3 className="card-title">{card.title}</h3>
                                    )}
                                </div>

                                {/* Description Area */}
                                <div className="card-body">
                                    <p className="card-description">{card.description}</p>

                                    {/* Buttons */}
                                    <div className={`button-container ${card.buttons.length === 1 ? 'single-button-container' : ''}`}>
                                        {card.buttons.map((button, buttonIndex) => (
                                            <button
                                                key={buttonIndex}
                                                className={`${button.style === 'login' ? 'login-button' : 'register-button'} ${card.buttons.length === 1 ? 'single-button' : ''}`}
                                                onClick={() => navigate(button.destination)}
                                            >
                                                {button.text}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Teleprompter Text Line */}
                <div
                    ref={teleprompterRef}
                    className={`teleprompter-container ${teleprompterInView ? 'fade-in-up' : ''}`}
                >
                    <div className="teleprompter-track">
                        <span>ENROLL NOW • PAASCU ACCREDITED • ENROLL NOW • +400 ENROLLED STUDENTS • ENROLL NOW • 4 STRANDS OFFERED </span>
                        <span>ENROLL NOW • PAASCU ACCREDITED • ENROLL NOW • +400 ENROLLED STUDENTS • ENROLL NOW • 4 STRANDS OFFERED </span>
                    </div>
                </div>

                {/* About JuanEMS Section */}
                <div
                    ref={aboutRef}
                    className={`about-section-container ${aboutInView ? 'fade-in-up' : ''}`}
                >
                    <div className="about-section">
                        <h2 className="about-title">About JuanEMS</h2>
                        <p className="about-description">
                            JuanEMS (Juan Enrollment Management System) is a portal of all online applications San Juan De Dios Educational Foundation, Inc. offers to its clients to extend its support and services and bring the satisfaction they deserve.
                        </p>
                        <a
                            href="https://sjdefi.edu.ph/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="sjdefi-button"
                        >
                            Go to SJDEFI Official Website
                        </a>
                    </div>
                    <img
                        src={JuanEMSLogo}
                        alt="JuanEMS Logo"
                        className="about-logo-external"
                    />
                </div>
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

export default HomePage;