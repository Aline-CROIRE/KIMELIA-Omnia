// src/contexts/AuthContext.tsx
// This file defines the Authentication Context for the entire application.
// It manages user authentication state, loading indicators, errors, and interacts with the authService API.

import React, { useState, createContext, useContext, ReactNode, useMemo, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as authService from '../services/authService'; // API service for authentication
import { UserProfile, LoginCredentials, RegisterCredentials } from '../types/auth'; // TypeScript types

// Define the shape of the AuthContext data
interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// Create the React Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component to wrap the application and provide auth context
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Initial state is loading while checking for token
  const [error, setError] = useState<string | null>(null);

  // Function to check for an existing JWT token and validate it on app startup
  const checkAuthStatus = async () => {
    console.log('AuthContext - checkAuthStatus: Starting...');
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      if (token) {
        console.log('AuthContext - checkAuthStatus: Token found, attempting to get profile.');
        // Attempt to get user profile; apiClient will automatically attach the token
        const profile = await authService.getProfile();
        setUser(profile);
        setIsAuthenticated(true);
        console.log('AuthContext - checkAuthStatus: Profile loaded, isAuthenticated = true.');
      } else {
        console.log('AuthContext - checkAuthStatus: No token found.');
      }
    } catch (err: any) {
      // If token validation fails (e.g., expired, invalid), clear it and set unauthenticated
      console.error("AuthContext - Auto-login failed:", err.message);
      await AsyncStorage.removeItem('jwtToken');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false); // Authentication check is complete
      console.log('AuthContext - checkAuthStatus: Finished, isLoading = false.');
    }
  };

  // Run auth status check once on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Memoized login function to prevent unnecessary re-renders
  const memoizedLogin = useCallback(async (credentials: LoginCredentials) => {
    console.log('AuthContext - login: Attempting login...');
    setIsLoading(true);
    setError(null);
    try {
      const loggedInUser = await authService.loginUser(credentials);
      setUser(loggedInUser);
      setIsAuthenticated(true);
      console.log('AuthContext - login: Successful.');
      return Promise.resolve(); // Return a resolved promise on success
    } catch (err: any) {
      console.error('AuthContext - login: Failed:', err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      setIsAuthenticated(false);
      setUser(null);
      await AsyncStorage.removeItem('jwtToken');
      return Promise.reject(err); // Re-throw the error to allow calling component to handle it
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Memoized register function
  const memoizedRegister = useCallback(async (credentials: RegisterCredentials) => {
    console.log('AuthContext - register: Attempting registration...');
    setIsLoading(true);
    setError(null);
    try {
      await authService.registerUser(credentials);
      console.log('AuthContext - register: Successful.');
      setIsLoading(false);
      return Promise.resolve();
    } catch (err: any) {
      console.error('AuthContext - register: Failed:', err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      setIsAuthenticated(false); // User is not authenticated after just registering
      setUser(null);
      return Promise.reject(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Memoized email verification function
  const memoizedVerifyEmail = useCallback(async (token: string) => {
    console.log('AuthContext - verifyEmail: Attempting email verification...');
    setIsLoading(true);
    setError(null);
    try {
      await authService.verifyEmail(token);
      console.log('AuthContext - verifyEmail: Successful.');
      return Promise.resolve();
    } catch (err: any) {
      console.error('AuthContext - verifyEmail: Failed:', err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Email verification failed.');
      return Promise.reject(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Memoized logout function
  const memoizedLogout = useCallback(async () => {
    console.log('AuthContext - logout: Attempting logout...');
    setIsLoading(true);
    setError(null);
    try {
      await authService.logoutUser(); // Clears token from AsyncStorage
      setIsAuthenticated(false);
      setUser(null);
      console.log('AuthContext - logout: Successful.');
    } catch (err: any) {
      console.error("AuthContext - logout error:", err); // Log but don't stop flow for logout errors
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Memoized function to clear current error message
  const memoizedClearError = useCallback(() => setError(null), []);

  // Memoize the context value to prevent unnecessary re-renders of consumers
  const authContextValue = useMemo(() => ({
    isAuthenticated,
    user,
    isLoading,
    error,
    login: memoizedLogin,
    register: memoizedRegister,
    verifyEmail: memoizedVerifyEmail,
    logout: memoizedLogout,
    clearError: memoizedClearError,
  }), [isAuthenticated, user, isLoading, error, memoizedLogin, memoizedRegister, memoizedVerifyEmail, memoizedLogout, memoizedClearError]);

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to consume the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};