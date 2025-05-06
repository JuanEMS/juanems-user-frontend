import React, { useEffect, useState } from 'react';
import '../../css/JuanEMS/SplashScreen.css';
import { useNavigate } from 'react-router-dom';
import SJDEFILogo from '../../images/SJDEFILogo.png';
import JuanEMSLogo from '../../images/JuanEMSlogo.png';

function SplashScreen() {
  const navigate = useNavigate();
  const [showSecondSplash, setShowSecondSplash] = useState(false);

  useEffect(() => {
    const firstDelay = setTimeout(() => setShowSecondSplash(true), 1000); // Transition to second splash after 2.5s
    const finalDelay = setTimeout(() => navigate('/home'), 6000); // Navigate after full splash duration

    return () => {
      clearTimeout(firstDelay);
      clearTimeout(finalDelay);
    };
  }, [navigate]);

  return (
    <div className="splash-screen-container">
      <div className={`splash-screen-logo-container ${showSecondSplash ? 'fade-out' : 'fade-in'}`}>
        <img src={SJDEFILogo} alt="SJDEFI Logo" className="splash-screen-logo" />
        <h1 className="splash-screen-big-text">SJDEFI</h1>
        <p className="splash-screen-small-text">San Juan De Dios Educational Foundation, Inc.</p>
      </div>

      <div className={`splash-screen-logo-container splash-screen-overlay ${showSecondSplash ? 'fade-in' : 'fade-out'}`}>
        <img src={JuanEMSLogo} alt="JuanEMS Logo" className="splash-screen-logo" />
        <h1 className="splash-screen-big-text">JuanEMS</h1>
        <p className="splash-screen-small-text">Juan Enrollment Management System</p>
      </div>
    </div>
  );
}

export default SplashScreen;
