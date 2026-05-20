import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './LikesScreen.css';

const LikesScreen: React.FC = () => {
  const { user, accessToken } = useAuth();
  const [likes, setLikes] = useState<any[]>([]);
  const [isBlurred, setIsBlurred] = useState(user?.subscription.tier === 'free');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLikes();
  }, []);

  const fetchLikes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/matches/likes`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const data = await response.json();
      setLikes(data.filter((like: any) => !like.isMatch));
    } catch (error) {
      console.error('Error fetching likes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="likes-screen">
      <h2 className="screen-title">Who Likes You</h2>

      {isBlurred && (
        <div className="upgrade-banner">
          <div className="banner-content">
            <p className="banner-text">Upgrade to Love Birds Gold to see who likes you</p>
            <button className="upgrade-btn">Upgrade Now</button>
          </div>
        </div>
      )}

      <div className={`likes-grid ${isBlurred ? 'blurred' : ''}`}>
        {isLoading ? (
          <p>Loading...</p>
        ) : likes.length > 0 ? (
          likes.map((like) => (
            <div key={like._id} className="like-card">
              <img
                src={like.swiper.photos[0]?.url}
                alt={like.swiper.firstName}
                className="like-avatar"
              />
              {isBlurred && <div className="blur-overlay">🔒</div>}
              {!isBlurred && (
                <div className="like-info">
                  <h3>{like.swiper.firstName}</h3>
                  <p>{like.direction === 'superlike' ? '⭐ Super Like' : '❤️ Like'}</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="empty-message">No likes yet. Keep swiping!</p>
        )}
      </div>
    </div>
  );
};

export default LikesScreen;
