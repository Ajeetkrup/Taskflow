import React, { useState } from 'react';

const NotificationPreferences = ({ preferences, onUpdate }) => {
  const [settings, setSettings] = useState(preferences || {
    email_enabled: true,
    due_date_reminder: true,
    reminder_minutes: 60,
    daily_summary: false
  });

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(settings);
  };

  return (
    <form onSubmit={handleSubmit} className="notification-preferences">
      <h3>Notification Preferences</h3>
      
      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={settings.email_enabled}
            onChange={(e) => handleChange('email_enabled', e.target.checked)}
          />
          Email notifications
        </label>
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={settings.due_date_reminder}
            onChange={(e) => handleChange('due_date_reminder', e.target.checked)}
          />
          Due date reminders
        </label>
      </div>

      <div className="form-group">
        <label>
          Reminder time (minutes before due date):
          <select
            value={settings.reminder_minutes}
            onChange={(e) => handleChange('reminder_minutes', parseInt(e.target.value))}
          >
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={60}>1 hour</option>
            <option value={120}>2 hours</option>
            <option value={1440}>1 day</option>
          </select>
        </label>
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={settings.daily_summary}
            onChange={(e) => handleChange('daily_summary', e.target.checked)}
          />
          Daily summary emails
        </label>
      </div>

      <button type="submit" className="btn-primary">
        Save Preferences
      </button>
    </form>
  );
};

export default NotificationPreferences;