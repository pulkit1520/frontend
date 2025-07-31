import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  analytics: [],
  selectedAnalysis: null,
  loading: false,
  error: null,
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setAnalytics: (state, action) => {
      state.analytics = action.payload;
      state.loading = false;
      state.error = null;
    },
    addAnalysis: (state, action) => {
      state.analytics = [action.payload, ...state.analytics];
    },
    removeAnalysis: (state, action) => {
      state.analytics = state.analytics.filter(
        (analysis) => analysis._id !== action.payload
      );
    },
    setSelectedAnalysis: (state, action) => {
      state.selectedAnalysis = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setAnalytics,
  addAnalysis,
  removeAnalysis,
  setSelectedAnalysis,
  setLoading,
  setError,
  clearError,
} = analyticsSlice.actions;

export default analyticsSlice.reducer;

