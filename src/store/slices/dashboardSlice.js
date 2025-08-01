import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fileService } from '../../services/fileService';

const initialState = {
  stats: {
    totalFiles: 0,
    totalAnalyses: 0,
    totalDataPoints: 0,
    totalSize: 0
  },
  uploadCount: parseInt(localStorage.getItem('uploadCount') || '0', 10),
  recentActivity: [],
  loading: false,
  error: null,
};

// Async thunks for API calls
export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      console.log('📊 Fetching dashboard stats from Redux...');
      
      // Check if user is authenticated before making the request
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        console.warn('⚠️ No authentication token found, skipping dashboard stats fetch');
        return rejectWithValue('No authentication token available');
      }
      
      const response = await fileService.getDashboardStats();
      console.log('📊 Dashboard stats response:', response);
      
      if (response && response.dashboardStats) {
        const stats = response.dashboardStats;
        const newStats = {
          totalFiles: stats.totalFiles || 0,
          totalAnalyses: stats.totalAnalyses || 0,
          totalDataPoints: stats.totalDataPoints || 0,
          totalSize: stats.totalSize || 0
        };
        
        // Create recent activities from file details
        const activities = (response.filesDetails || []).slice(0, 4).map(file => ({
          action: `Uploaded ${file.name}`,
          time: new Date(file.uploadedAt).toLocaleDateString(),
          type: 'upload'
        }));
        
        return {
          stats: newStats,
          activities,
          userInfo: {
            name: response.userName,
            email: response.userEmail,
            userId: response.userId
          }
        };
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error);
      
      // More detailed error logging
      if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_RESET') {
        console.error('🌐 Network connectivity issue in dashboard stats fetch');
        return rejectWithValue('Network connection error. Please check your internet connection and try again.');
      }
      
      if (error.response?.status === 401) {
        console.error('🔐 Authentication error in dashboard stats fetch');
        return rejectWithValue('Authentication failed. Please log in again.');
      }
      
      if (error.response?.status === 404) {
        console.error('📍 Dashboard stats endpoint not found');
        return rejectWithValue('Dashboard stats service is not available.');
      }
      
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to load dashboard data');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    incrementUploadCount: (state) => {
      state.uploadCount += 1;
      localStorage.setItem('uploadCount', state.uploadCount.toString());
    },
    addRecentActivity: (state, action) => {
      state.recentActivity = [action.payload, ...state.recentActivity.slice(0, 3)];
    },
    updateStats: (state, action) => {
      state.stats = { ...state.stats, ...action.payload };
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    notifyFileUploaded: (state, action) => {
      // Increment upload count
      state.uploadCount += 1;
      localStorage.setItem('uploadCount', state.uploadCount.toString());
      
      // Add to recent activity
      const newActivity = {
        action: `Uploaded ${action.payload?.originalName || 'file'}`,
        time: new Date().toLocaleDateString(),
        type: 'upload'
      };
      state.recentActivity = [newActivity, ...state.recentActivity.slice(0, 3)];
    },
    notifyAnalysisCreated: (state, action) => {
      // Add to recent activity
      const newActivity = {
        action: `Created analysis: ${action.payload.name}`,
        time: new Date().toLocaleDateString(),
        type: 'analysis'
      };
      state.recentActivity = [newActivity, ...state.recentActivity.slice(0, 3)];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.stats;
        state.recentActivity = action.payload.activities;
        state.error = null;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  incrementUploadCount,
  addRecentActivity,
  updateStats,
  setLoading,
  clearError,
  notifyFileUploaded,
  notifyAnalysisCreated,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
