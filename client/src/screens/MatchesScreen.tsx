import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './MatchesScreen.css';

interface Match {
  _id: string;
  user1: any;
  user2: any;
  lastMessageAt?: Date;
}

const MatchesScreen: React.FC = () => {
  const { user, accessToken } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [activeTab, setActiveTab] = useState<'likes' | 'matches'>('matches');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, [activeTab]);

  const fetchMatches = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/matches/matches`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const data = await response.json();
      setMatches(data);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getOtherUser = (match: Match) => {
    return match.user1._id === user?.id ? match.user2 : match.user1;
  };

  return (
    <div className="matches-screen">
      {/* Tabs */}
      <div className="tab-navigation">
        <button
          className={`tab ${activeTab === 'likes' ? 'active' : ''}`}
          onClick={() => setActiveTab('likes')}
        >
          Likes <span className="badge">5</span>
        </button>
        <button
          className={`tab ${activeTab === 'matches' ? 'active' : ''}`}
          onClick={() => setActiveTab('matches')}
        >
          Messages
        </button>
      </div>

      {/* Recent Matches Dock */}
      {activeTab === 'matches' && (
        <div className="recent-matches-dock">
          {matches.slice(0, 5).map((match) => {
            const otherUser = getOtherUser(match);
            return (
              <div key={match._id} className="recent-match-avatar">
                <img src={otherUser.photos[0]?.url} alt={otherUser.firstName} />
                <div className="online-indicator"></div>
              </div>
            );
          })}
        </div>
      )}

      {/* Matches List */}
      <div className="matches-list">
        {isLoading ? (
          <p>Loading...</p>
        ) : matches.length > 0 ? (
          matches.map((match) => {
            const otherUser = getOtherUser(match);
            return (
              <div key={match._id} className="match-item">
                <img
                  src={otherUser.photos[0]?.url}
                  alt={otherUser.firstName}
                  className="match-avatar"
                />
                <div className="match-content">
                  <h3 className="match-name">{otherUser.firstName}</h3>
                  <p className="last-message">Say hello to {otherUser.firstName}!</p>
                </div>
                <div className="match-time">
                  <span className="unread-dot"></span>
                </div>
              </div>
            );
          })
        ) : (
          <p className="empty-message">No matches yet. Start swiping!</p>
        )}
      </div>
    </div>
  );
};

export default MatchesScreen;
