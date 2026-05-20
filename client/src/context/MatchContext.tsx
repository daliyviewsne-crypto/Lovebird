import React, { createContext, useContext, useState, useCallback } from 'react';

interface Match {
  id: string;
  user1: any;
  user2: any;
  matchedAt: Date;
  lastMessageAt?: Date;
  isActive: boolean;
}

interface MatchContextType {
  matches: Match[];
  currentMatch: Match | null;
  likes: any[];
  isLoading: boolean;
  fetchMatches: () => Promise<void>;
  fetchLikes: () => Promise<void>;
  setCurrentMatch: (match: Match | null) => void;
}

const MatchContext = createContext<MatchContextType | undefined>(undefined);

export const MatchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [likes, setLikes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMatches = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/matches/matches`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setMatches(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchLikes = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/matches/likes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setLikes(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <MatchContext.Provider
      value={{
        matches,
        currentMatch,
        likes,
        isLoading,
        fetchMatches,
        fetchLikes,
        setCurrentMatch
      }}
    >
      {children}
    </MatchContext.Provider>
  );
};

export const useMatches = () => {
  const context = useContext(MatchContext);
  if (!context) {
    throw new Error('useMatches must be used within MatchProvider');
  }
  return context;
};
