import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';

// Helper functions for token storage
const getTokenFromStorage = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

const getRefreshTokenFromStorage = () => {
  return localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
};

const isTokenPersistent = () => {
  return localStorage.getItem('token') !== null;
};

const initialState = {
  user: null,
  token: getTokenFromStorage(),
  refreshToken: getRefreshTokenFromStorage(),
  isLoading: false,
  isAuthenticated: !!getTokenFromStorage(),
  isPersistentLogin: isTokenPersistent(),
  error: null,
};

// Async thunks for API calls
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ credentials, rememberMe = false }, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      
      // Handle token storage
      const storage = rememberMe ? localStorage : sessionStorage;
      
      // Clear tokens from both storages first
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('refreshToken');
      
      // Set tokens in the appropriate storage
      storage.setItem('token', response.token);
      storage.setItem('refreshToken', response.refreshToken);
      
      toast.success('Login successful!');
      return { ...response, rememberMe };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      
      // Store tokens in sessionStorage for registration
      sessionStorage.setItem('token', response.token);
      sessionStorage.setItem('refreshToken', response.refreshToken);
      
      toast.success('Registration successful!');
      return { ...response, rememberMe: false };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      if (!auth.token) {
        throw new Error('No token available');
      }
      const user = await authService.getCurrentUser();
      return user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get user');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear tokens regardless of API call success
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('refreshToken');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.isPersistentLogin = isTokenPersistent();
    },
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    initializeAuth: (state) => {
      const token = getTokenFromStorage();
      const refreshToken = getRefreshTokenFromStorage();
      
      state.token = token;
      state.refreshToken = refreshToken;
      state.isAuthenticated = !!token;
      state.isPersistentLogin = isTokenPersistent();
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.isPersistentLogin = action.payload.rememberMe;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.isPersistentLogin = action.payload.rememberMe;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get current user
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isPersistentLogin = isTokenPersistent();
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.isPersistentLogin = false;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.isPersistentLogin = false;
        state.error = null;
      });
  },
});

export const { 
  setLoading, 
  setUser, 
  updateUser, 
  clearError, 
  initializeAuth 
} = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
