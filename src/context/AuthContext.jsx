import React, { createContext, useContext, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loginUser, registerUser, logoutUser, getCurrentUser, updateUser,
  selectAuth, selectIsAuthenticated } from '../store/slices/authSlice';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const authState = useSelector(selectAuth);

  // Ensure user is authenticated on app load
  useEffect(() => {
    if (authState.token) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, authState.token]);

  const login = async (credentials, rememberMe = false) => {
    try {
      const result = await dispatch(loginUser({ credentials, rememberMe }));
      // Check if the thunk was fulfilled
      if (loginUser.fulfilled.match(result)) {
        return result.payload;
      } else {
        throw new Error(result.payload || 'Login failed');
      }
    } catch (error) {
      console.error('AuthContext login error:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    return dispatch(registerUser(userData));
  };

  const logout = async () => {
    return dispatch(logoutUser());
  };

  const updateUserProfile = (userData) => {
    dispatch(updateUser(userData));
  };

  const value = {
    ...authState,
    login,
    register,
    logout,
    updateUser: updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
