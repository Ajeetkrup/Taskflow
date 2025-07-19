import React, { useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import { validateForm, validatePassword } from '../../utils/validation';

const PasswordForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
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
      currentPassword: {
        required: true,
        message: 'Current password is required'
      },
      newPassword: {
        required: true,
        validate: validatePassword,
        message: 'New password must be at least 8 characters'
      }
    };

    const validationErrors = validateForm(formData, validationRules);
    
    if (formData.newPassword !== formData.confirmPassword) {
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
    <form onSubmit={handleSubmit} className="password-form">
      <Input
        label="Current Password"
        type="password"
        name="currentPassword"
        value={formData.currentPassword}
        onChange={handleChange}
        error={errors.currentPassword}
        placeholder="Enter current password"
        required
      />
      
      <Input
        label="New Password"
        type="password"
        name="newPassword"
        value={formData.newPassword}
        onChange={handleChange}
        error={errors.newPassword}
        placeholder="Enter new password"
        required
      />
      
      <Input
        label="Confirm New Password"
        type="password"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        error={errors.confirmPassword}
        placeholder="Confirm new password"
        required
      />
      
      <Button
        type="submit"
        variant="primary"
        loading={loading}
      >
        Update Password
      </Button>
    </form>
  );
};

export default PasswordForm;