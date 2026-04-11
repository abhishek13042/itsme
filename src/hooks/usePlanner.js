import { useEffect } from 'react';
import { usePlannerStore } from '../store/plannerStore';

export const usePlanner = () => {
  const {
    todaysPlan,
    todaysReview,
    isGenerating,
    error,
    loadTodaysPlan,
    generatePlan,
    generateReview
  } = usePlannerStore();

  useEffect(() => {
    loadTodaysPlan();
  }, [loadTodaysPlan]);

  return {
    plan: todaysPlan,
    review: todaysReview,
    isLoading: isGenerating,
    error,
    generatePlan,
    generateReview,
    refreshPlan: loadTodaysPlan
  };
};
