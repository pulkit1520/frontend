import React, { createContext, useContext, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchDashboardStats, 
  notifyFileUploaded, 
  notifyAnalysisCreated 
} from '../store/slices/dashboardSlice';

const DashboardContext = createContext();

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

export const DashboardProvider = ({ children }) => {
  const dispatch = useDispatch();
  const dashboardState = useSelector(state => state.dashboard);

  // Format storage size utility
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 KB';
    const k = 1024;
    const sizes = ['KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Format number utility
  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const updateDashboardStats = () => {
    dispatch(fetchDashboardStats());
  };

  const forceNotifyFileUploaded = (fileData) => {
    dispatch(notifyFileUploaded(fileData));
    // Refresh stats after notification with delays
    setTimeout(() => dispatch(fetchDashboardStats()), 1000);
    setTimeout(() => dispatch(fetchDashboardStats()), 3000);
    setTimeout(() => dispatch(fetchDashboardStats()), 6000);
  };

  const forceNotifyAnalysisCreated = (analysisData) => {
    dispatch(notifyAnalysisCreated(analysisData));
    // Refresh stats after notification
    setTimeout(() => dispatch(fetchDashboardStats()), 1000);
  };

  // Load dashboard stats on mount
  useEffect(() => {
    updateDashboardStats();
  }, []);

  const value = {
    dashboardStats: dashboardState.stats,
    uploadCount: dashboardState.uploadCount,
    recentActivity: dashboardState.recentActivity,
    loading: dashboardState.loading,
    error: dashboardState.error,
    updateDashboardStats,
    notifyFileUploaded: forceNotifyFileUploaded,
    notifyAnalysisCreated: forceNotifyAnalysisCreated,
    formatBytes,
    formatNumber,
    forceUpdateStats: updateDashboardStats,
    refreshDashboardWithRetry: updateDashboardStats
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};
