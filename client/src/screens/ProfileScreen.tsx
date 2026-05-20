import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './ProfileScreen.css';

const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="profile-screen">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar-large">
          <img src={user?.photos?.[0]?.url || 'https://via.placeholder.com/150'} alt={user?.firstName} />
        </div>
        <h1 className="profile-name">{user?.firstName}</h1>
        <p className="profile-subtitle">Member since {new Date(user?.createdAt || '').getFullYear()}</p>

        {/* Action Buttons */}
        <div className="profile-actions">
          <button className="profile-action-btn settings" title="Settings">
            ⚙️
          </button>
          <button className="profile-action-btn edit" title="Edit" onClick={() => setIsEditing(!isEditing)}>
            ✏️
          </button>
          <button className="profile-action-btn add" title="Add Media">
            ➕
          </button>
        </div>
      </div>

      {/* User Info */}
      <div className="profile-info">
        <div className="info-section">
          <h3>About</h3>
          <p>{user?.bio || 'No bio added yet'}</p>
        </div>

        <div className="info-section">
          <h3>Interests</h3>
          <div className="interests-tags">
            {user?.interests?.map((interest) => (
              <span key={interest} className="interest-tag">
                {interest}
              </span>
            ))}
          </div>
        </div>

        <div className="info-section">
          <h3>Dating Intentions</h3>
          <div className="intentions-badges">
            {user?.datingIntentions?.map((intention) => (
              <span key={intention} className="intention-badge">
                {intention}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Subscription Info */}
      <div className="subscription-section">
        <h3>Current Plan</h3>
        <div className={`subscription-badge ${user?.subscription?.tier}`}>
          {user?.subscription?.tier?.toUpperCase() || 'FREE'}
        </div>
        {user?.subscription?.tier === 'free' && (
          <button className="upgrade-btn">Upgrade to Gold</button>
        )}
      </div>

      {/* Logout */}
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default ProfileScreen;
