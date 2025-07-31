import React, { createContext, useContext, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loginUser, registerUser, logoutUser, getCurrentUser,
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
    return dispatch(loginUser({ credentials, rememberMe }));
  };

  const register = async (userData) => {
    return dispatch(registerUser(userData));
  };

  const logout = async () => {
    return dispatch(logoutUser());
  };

  const value = {
    ...authState,
    login,
    register,
    logout,
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
