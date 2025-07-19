import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import { validateForm, validateEmail, validateName } from '../../utils/validation';

const ProfileForm = ({ user, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || ''
      });
    }
  }, [user]);

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
    <form onSubmit={handleSubmit} className="profile-form">
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
        disabled={true}
      />
      
      <Button
        type="submit"
        variant="primary"
        loading={loading}
      >
        Update Profile
      </Button>
    </form>
  );
};

export default ProfileForm;