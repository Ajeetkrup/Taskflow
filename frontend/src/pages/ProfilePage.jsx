// File: src/pages/ProfilePage.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import ProfileForm from '../components/user/ProfileForm';
import PasswordForm from '../components/user/PasswordForm';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';

const ProfilePage = () => {
  const { user, logout, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);

  const handleProfileUpdate = async (profileData) => {
    try {
      setLoading(true);
      setMessage('');
      delete profileData.email;
      const updatedUser = await userService.updateProfile(profileData);
      setUser(updatedUser?.user);
      setMessage('Profile updated successfully!');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (passwordData) => {
    try {
      setPasswordLoading(true);
      setMessage('');
      await userService.updatePassword(passwordData);
      setMessage('Password updated successfully!');
      setShowPasswordForm(false);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeactivate = async () => {
    try {
      await userService.deactivateAccount();
      logout();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to deactivate account.');
      setShowDeactivateModal(false);
    }
  };

  return (
    <div className="page">
      <div className="profile-page">
        <header className="profile-header">
          <h1>Profile Settings</h1>
          <Link to="/dashboard" className="back-link">← Back to Dashboard</Link>
        </header>

        {message && (
          <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="profile-content">
          <div className="profile-section">
            <h2>Personal Information</h2>
            <ProfileForm
              user={user}
              onSubmit={handleProfileUpdate}
              loading={loading}
            />
          </div>

          <div className="profile-section">
            <h2>Security</h2>
            <div className="security-actions">
              <Button
                variant="secondary"
                onClick={() => setShowPasswordForm(!showPasswordForm)}
              >
                Change Password
              </Button>
            </div>
            
            {showPasswordForm && (
              <div className="password-section">
                <PasswordForm
                  onSubmit={handlePasswordUpdate}
                  loading={passwordLoading}
                />
              </div>
            )}
          </div>

          <div className="profile-section danger-zone">
            <h2>Danger Zone</h2>
            <p>Once you deactivate your account, there is no going back.</p>
            <Button
              variant="danger"
              onClick={() => setShowDeactivateModal(true)}
            >
              Deactivate Account
            </Button>
          </div>
        </div>

        <Modal
          isOpen={showDeactivateModal}
          onClose={() => setShowDeactivateModal(false)}
          title="Deactivate Account"
        >
          <div className="deactivate-modal">
            <p>Are you sure you want to deactivate your account?</p>
            <p>This action cannot be undone.</p>
            <div className="modal-actions">
              <Button
                variant="secondary"
                onClick={() => setShowDeactivateModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeactivate}
              >
                Deactivate
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default ProfilePage;