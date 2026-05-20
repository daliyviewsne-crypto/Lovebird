import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Swipeable } from 'react-swipeable';
import './SwipeCard.css';

interface SwipeCardProps {
  user: any;
  onLike: (userId: string) => void;
  onNope: (userId: string) => void;
  onSuperLike: (userId: string) => void;
}

const SwipeCard: React.FC<SwipeCardProps> = ({ user, onLike, onNope, onSuperLike }) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const cardRef = useRef<HTMLDivElement>(null);

  const photos = user.photos || [];
  const currentPhoto = photos[currentPhotoIndex]?.url || '';

  const handleSwipeRight = useCallback(() => {
    onLike(user._id);
  }, [user._id, onLike]);

  const handleSwipeLeft = useCallback(() => {
    onNope(user._id);
  }, [user._id, onNope]);

  const handleSwipeUp = useCallback(() => {
    onSuperLike(user._id);
  }, [user._id, onSuperLike]);

  const handlers = Swipeable({
    onSwipedRight: handleSwipeRight,
    onSwipedLeft: handleSwipeLeft,
    onSwipedUp: handleSwipeUp,
    trackMouse: true
  });

  const handlePhotoChange = (index: number) => {
    if (index >= 0 && index < photos.length) {
      setCurrentPhotoIndex(index);
    }
  };

  return (
    <div {...handlers} ref={cardRef} className="swipe-card-container">
      <div
        className="swipe-card"
        style={{
          transform: `rotate(${rotation}deg)`,
          opacity
        }}
      >
        {/* Photo indicators */}
        <div className="photo-indicators">
          {photos.map((_, index) => (
            <div
              key={index}
              className={`indicator ${index === currentPhotoIndex ? 'active' : ''}`}
            />
          ))}
        </div>

        {/* Main photo */}
        <div className="photo-wrapper">
          <img src={currentPhoto} alt={user.firstName} className="user-photo" />

          {/* Photo navigation */}
          <div
            className="photo-nav left"
            onClick={() => handlePhotoChange(currentPhotoIndex - 1)}
          />
          <div
            className="photo-nav right"
            onClick={() => handlePhotoChange(currentPhotoIndex + 1)}
          />

          {/* Gradient overlay */}
          <div className="gradient-overlay" />

          {/* Info overlay */}
          <div className="info-overlay">
            <h2 className="user-name">
              {user.firstName}, {user.age}
            </h2>
            <div className="user-details">
              {user.profession && (
                <span className="detail-item">
                  <span className="icon">🏢</span> {user.profession}
                </span>
              )}
              {user.distance && (
                <span className="detail-item">
                  <span className="icon">📍</span> {user.distance} miles away
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwipeCard;
