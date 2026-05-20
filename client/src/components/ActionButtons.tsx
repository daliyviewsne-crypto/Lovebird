import React from 'react';
import './ActionButtons.css';

interface ActionButtonsProps {
  onNope: () => void;
  onLike: () => void;
  onSuperLike: () => void;
  onRewind: () => void;
  onBoost: () => void;
  hasRewindAvailable: boolean;
  hasBoostAvailable: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onNope,
  onLike,
  onSuperLike,
  onRewind,
  onBoost,
  hasRewindAvailable,
  hasBoostAvailable
}) => {
  return (
    <div className="action-buttons-container">
      <button
        className="action-btn small rewind"
        onClick={onRewind}
        disabled={!hasRewindAvailable}
        title="Rewind"
      >
        <span className="icon">↶</span>
      </button>

      <button className="action-btn large nope" onClick={onNope} title="Nope">
        <span className="icon">✕</span>
      </button>

      <button
        className="action-btn small superlike"
        onClick={onSuperLike}
        title="Super Like"
      >
        <span className="icon">⭐</span>
      </button>

      <button className="action-btn large like" onClick={onLike} title="Like">
        <span className="icon">♥</span>
      </button>

      <button
        className="action-btn small boost"
        onClick={onBoost}
        disabled={!hasBoostAvailable}
        title="Boost"
      >
        <span className="icon">⚡</span>
      </button>
    </div>
  );
};

export default ActionButtons;
