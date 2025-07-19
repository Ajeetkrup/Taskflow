import React from 'react';

const Loader = ({ size = 'medium', text = 'Loading...' }) => {
  return (
    <div className="loader-container">
      <div className={`loader loader-${size}`}></div>
      <p className="loader-text">{text}</p>
    </div>
  );
};

export default Loader;