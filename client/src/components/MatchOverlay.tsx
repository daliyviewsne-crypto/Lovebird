import React from 'react';
import './MatchOverlay.css';

interface MatchOverlayProps {
  user1: any;
  user2: any;
  onSendMessage: () => void;
  onKeepSwiping: () => void;
}

const MatchOverlay: React.FC<MatchOverlayProps> = ({
  user1,
  user2,
  onSendMessage,
  onKeepSwiping
}) => {
  return (
    <div className="match-overlay">
      <div className="match-content">
        <h1 className="match-title">It's a Match!</h1>
        <p className="match-subtitle">
          You and {user2.firstName} have liked each other.
        </p>

        <div className="profile-photos">
          <div className="photo-circle user1">
            <img src={user1.photos[0]?.url} alt={user1.firstName} />
          </div>
          <div className="photo-circle user2">
            <img src={user2.photos[0]?.url} alt={user2.firstName} />
          </div>
        </div>

        <div className="action-buttons">
          <button className="btn btn-primary" onClick={onSendMessage}>
            Send a Message
          </button>
          <button className="btn btn-secondary" onClick={onKeepSwiping}>
            Keep Swiping
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchOverlay;
