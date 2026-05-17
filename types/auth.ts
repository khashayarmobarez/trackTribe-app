/**
 * Authentication related types
 */

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

export type UserRole = 'admin' | 'user' | 'moderator';

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  confirmPassword?: string;
}

export interface AuthResponse {
  user: IUser;
  // Tokens are handled as httpOnly cookies, not in response
}

export interface AuthState {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
