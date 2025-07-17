import React, { useState } from 'react';

const NotificationPreferences = ({ preferences, onUpdate }) => {
  const [settings, setSettings] = useState(preferences || {
    emailEnabled: true,
    dueDateReminder: true,
    reminderMinutes: 60,
    dailySummary: false
  });

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("settings inside submit -- ", settings)
    onUpdate(settings);
  };

  return (
    <form onSubmit={handleSubmit} className="notification-preferences">
      <h3>Notification Preferences</h3>
      
      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={settings.emailEnabled}
            onChange={(e) => handleChange('emailEnabled', e.target.checked)}
          />
          Email notifications
        </label>
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={settings.dueDateReminder}
            onChange={(e) => handleChange('dueDateReminder', e.target.checked)}
          />
          Due date reminders
        </label>
      </div>

      <div className="form-group">
        <label>
          Reminder time (minutes before due date):
          <select
            value={settings.reminderMinutes}
            onChange={(e) => handleChange('reminderMinutes', parseInt(e.target.value))}
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
            checked={settings.dailySummary}
            onChange={(e) => handleChange('dailySummary', e.target.checked)}
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