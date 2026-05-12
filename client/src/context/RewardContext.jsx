import React, { createContext, useState, useCallback } from 'react';
import api from '../utils/api';

export const RewardContext = createContext();

export const RewardProvider = ({ children }) => {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRewards = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/rewards');
      setRewards(response.data);
    } catch (error) {
      console.error('Error fetching rewards:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createReward = useCallback(async (rewardData) => {
    try {
      const response = await api.post('/rewards', rewardData);
      setRewards([...rewards, response.data]);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create reward');
    }
  }, [rewards]);

  const deleteReward = useCallback(async (rewardId) => {
    try {
      await api.delete(`/rewards/${rewardId}`);
      setRewards(rewards.filter((r) => r._id !== rewardId));
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete reward');
    }
  }, [rewards]);

  const value = {
    rewards,
    loading,
    fetchRewards,
    createReward,
    deleteReward,
  };

  return (
    <RewardContext.Provider value={value}>
      {children}
    </RewardContext.Provider>
  );
};
