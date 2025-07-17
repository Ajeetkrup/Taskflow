// File: src/components/auth/AuthLayout.js
import React from 'react';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="auth-layout">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-title">TaskFlow</h1>
          <h2 className="auth-subtitle">{title}</h2>
          {subtitle && <p className="auth-description">{subtitle}</p>}
        </div>
        <div className="auth-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;