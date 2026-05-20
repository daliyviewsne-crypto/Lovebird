import React, { useState, useEffect } from 'react';
import SwipeCard from '../components/SwipeCard';
import ActionButtons from '../components/ActionButtons';
import MatchOverlay from '../components/MatchOverlay';
import { useAuth } from '../context/AuthContext';
import './DiscoveryScreen.css';

const DiscoveryScreen: React.FC = () => {
  const { user, accessToken } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedUser, setMatchedUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDiscoveryUsers();
  }, []);

  const fetchDiscoveryUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/users/discover?limit=20`,
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwipe = async (direction: 'like' | 'nope' | 'superlike') => {
    const currentUser = users[currentIndex];
    if (!currentUser) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/matches/swipe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          swipedUserId: currentUser._id,
          direction
        })
      });

      const data = await response.json();

      if (data.message === 'Match!') {
        setMatchedUser(currentUser);
        setShowMatch(true);
      }

      // Move to next user
      if (currentIndex < users.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        fetchDiscoveryUsers();
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error('Error swiping:', error);
    }
  };

  const handleLike = () => handleSwipe('like');
  const handleNope = () => handleSwipe('nope');
  const handleSuperLike = () => handleSwipe('superlike');

  const handleRewind = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleBoost = () => {
    console.log('Boost activated');
  };

  if (isLoading) {
    return <div className="discovery-screen"><div className="loading">Loading profiles...</div></div>;
  }

  if (users.length === 0 || currentIndex >= users.length) {
    return (
      <div className="discovery-screen">
        <div className="empty-state">
          <p>No more profiles to discover. Come back later!</p>
        </div>
      </div>
    );
  }

  const currentUser = users[currentIndex];

  return (
    <div className="discovery-screen">
      {/* Header */}
      <div className="discovery-header">
        <div className="logo">💕 Love Birds</div>
        <button className="notification-btn">
          🔔
          <span className="badge">3</span>
        </button>
      </div>

      {/* Swipe Card */}
      <SwipeCard
        user={currentUser}
        onLike={handleLike}
        onNope={handleNope}
        onSuperLike={handleSuperLike}
      />

      {/* Action Buttons */}
      <ActionButtons
        onLike={handleLike}
        onNope={handleNope}
        onSuperLike={handleSuperLike}
        onRewind={handleRewind}
        onBoost={handleBoost}
        hasRewindAvailable={currentIndex > 0}
        hasBoostAvailable={true}
      />

      {/* Match Overlay */}
      {showMatch && matchedUser && (
        <MatchOverlay
          user1={user!}
          user2={matchedUser}
          onSendMessage={() => {
            setShowMatch(false);
            // Navigate to chat
          }}
          onKeepSwiping={() => setShowMatch(false)}
        />
      )}
    </div>
  );
};

export default DiscoveryScreen;
