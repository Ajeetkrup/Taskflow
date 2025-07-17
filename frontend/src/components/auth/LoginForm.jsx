// File: src/components/auth/LoginForm.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import Input from '../common/Input';
import { validateForm, validateEmail } from '../../utils/validation';

const LoginForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validationRules = {
      email: {
        required: true,
        validate: validateEmail,
        message: 'Please enter a valid email'
      },
      password: {
        required: true,
        message: 'Password is required'
      }
    };

    const validationErrors = validateForm(formData, validationRules);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <Input
        label="Email"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        placeholder="Enter your email"
        required
      />
      
      <Input
        label="Password"
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        placeholder="Enter your password"
        required
      />
      
      <Button
        type="submit"
        variant="primary"
        size="large"
        loading={loading}
        className="auth-submit"
      >
        Sign In
      </Button>
      
      <p className="auth-link">
        Don't have an account? <Link to="/register">Sign up</Link>
      </p>
    </form>
  );
};

export default LoginForm;