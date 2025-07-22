import React from 'react';

const Input = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  error, 
  placeholder,
  required = false,
  className = '',
  name='',
  ...props 
}) => {
  const inputClass = `input ${error ? 'input-error' : ''} ${className}`.trim();

  return (
    <div className="input-group">
      {label && (
        <label className="input-label" htmlFor={name} aria-label={label}>
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={inputClass}
        name={name}
        id={name}
        {...props}
      />
      {error && <span className="input-error-message">{error}</span>}
    </div>
  );
};

export default Input;