import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import Input from '../common/Input';
import { validateForm, validateEmail, validatePassword, validateName } from '../../utils/validation';

const RegisterForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
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
      firstName: {
        required: true,
        validate: validateName,
        message: 'Name must be at least 2 characters'
      },
      lastName: {
        required: true,
        validate: validateName,
        message: 'Name must be at least 2 characters'
      },
      email: {
        required: true,
        validate: validateEmail,
        message: 'Please enter a valid email'
      },
      password: {
        required: true,
        validate: validatePassword,
        message: 'Password must be at least 8 characters'
      }
    };

    const validationErrors = validateForm(formData, validationRules);

    if (formData.password !== formData.confirmPassword) {
      validationErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const { confirmPassword, ...submitData } = formData;
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <Input
        label="First Name"
        type="text"
        name="firstName"
        value={formData.firstName}
        onChange={handleChange}
        error={errors.firstName}
        placeholder="Enter your first name"
        required
      />

      <Input
        label="Last Name"
        type="text"
        name="lastName"
        value={formData.lastName}
        onChange={handleChange}
        error={errors.lastName}
        placeholder="Enter your last name"
        required
      />

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

      <Input
        label="Confirm Password"
        type="password"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        error={errors.confirmPassword}
        placeholder="Confirm your password"
        required
      />

      <Button
        type="submit"
        variant="primary"
        size="large"
        loading={loading}
        className="auth-submit"
      >
        Sign Up
      </Button>

      <p className="auth-link">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </form>
  );
};

export default RegisterForm;