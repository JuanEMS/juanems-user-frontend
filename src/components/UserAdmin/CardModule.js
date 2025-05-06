import React from 'react';
import '../../css/UserAdmin/CardModule.css';
import { useNavigate } from 'react-router-dom';

const CardModule = ({ title, description, path, isActive = false, isInvisible = false, icon: Icon }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <div onClick={handleClick} className={`card-modules ${isActive ? 'active' : ''} ${isInvisible ? 'invisible-module' : ''}`}>
      <div className='card-content'>
        <div className='icon-container'>
        {Icon && <Icon style={{ fontSize: '1.5rem'}} />} 
        </div>
      </div>
      <div className='card-content'>
        <p className={`card-heading ${isActive ? 'active' : ''}`}>{title}</p>
        <p className={`card-message ${isActive ? 'active' : ''}`}>{description}</p>
      </div>
    </div>
  );
};

export default CardModule;
