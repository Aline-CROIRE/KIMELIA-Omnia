// src/types/auth.ts
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
  // Add other registration fields like phone, role, etc.
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isEmailVerified: boolean;
  // Add other profile fields as per your backend User model
}

// Example types for API responses (adjust as per actual backend)
export interface AuthSuccessResponse {
  token: string;
  user: UserProfile;
}

export interface AuthErrorResponse {
  message: string;
}