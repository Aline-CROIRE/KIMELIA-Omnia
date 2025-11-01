// src/contexts/AuthContext.tsx
// src/contexts/AuthContext.tsx
import React, { useState, createContext, useContext, ReactNode, useMemo, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as authService from '../services/authService'; 
import { UserProfile, LoginCredentials, RegisterCredentials } from '../types/auth';

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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuthStatus = async () => {
    console.log('AuthContext - checkAuthStatus: Starting...');
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      if (token) {
        console.log('AuthContext - checkAuthStatus: Token found, attempting to get profile.');
        const profile = await authService.getProfile();
        setUser(profile);
        setIsAuthenticated(true);
        console.log('AuthContext - checkAuthStatus: Profile loaded, isAuthenticated = true.');
      } else {
        console.log('AuthContext - checkAuthStatus: No token found.');
      }
    } catch (err: any) {
      console.error("AuthContext - Auto-login failed:", err.message);
      await AsyncStorage.removeItem('jwtToken');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
      console.log('AuthContext - checkAuthStatus: Finished, isLoading = false.');
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const memoizedLogin = useCallback(async (credentials: LoginCredentials) => {
    console.log('AuthContext - login: Attempting login...');
    setIsLoading(true);
    setError(null);
    try {
      const loggedInUser = await authService.loginUser(credentials);
      setUser(loggedInUser);
      setIsAuthenticated(true);
      console.log('AuthContext - login: Successful.');
      return Promise.resolve();
    } catch (err: any) {
      console.error('AuthContext - login: Failed:', err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      setIsAuthenticated(false);
      setUser(null);
      await AsyncStorage.removeItem('jwtToken');
      return Promise.reject(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ... (keep memoizedRegister, memoizedVerifyEmail, memoizedLogout, memoizedClearError as they are, but you can add logs to them too if needed)

  const memoizedRegister = useCallback(async (credentials: RegisterCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.registerUser(credentials);
      setIsLoading(false);
      return Promise.resolve();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      setIsAuthenticated(false);
      setUser(null);
      return Promise.reject(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const memoizedVerifyEmail = useCallback(async (token: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.verifyEmail(token);
      return Promise.resolve();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Email verification failed.');
      return Promise.reject(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const memoizedLogout = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.logoutUser();
      setIsAuthenticated(false);
      setUser(null);
    } catch (err: any) {
      console.error("Logout error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const memoizedClearError = useCallback(() => setError(null), []);


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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};