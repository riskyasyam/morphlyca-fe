
import { User } from '@/types/user';
import { api } from './api';

export interface AuthResponse {
  authenticated: boolean;
  user: User | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}

// Login function
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  try {
    const { data } = await api.post<LoginResponse>('/auth/login', credentials);
    
    if (data.success && data.token) {
      // Store token in localStorage and cookie
      localStorage.setItem('token', data.token);
      
      // Set cookie with token
      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + 7); // 7 days
      document.cookie = `token=${data.token}; expires=${expireDate.toUTCString()}; path=/; SameSite=Lax`;
      
      // Store user data if available
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    }
    
    return data;
  } catch (error: any) {
    console.error('Login failed:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Login failed'
    };
  }
}

// Check authentication status
export async function checkAuth(): Promise<AuthResponse | null> {
  try {
    const { data } = await api.get<AuthResponse>('/auth/me');
    return data;
  } catch (error) {
    console.error('Auth check failed:', error);
    return null;
  }
}

// Alternative auth check using /user/me endpoint
export async function checkAuthUser(): Promise<User | null> {
  try {
    const { data } = await api.get<User>('/user/me');
    return data;
  } catch (error) {
    console.error('User auth check failed:', error);
    return null;
  }
}

// Fungsi untuk handle logout
export async function handleLogout(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Logout API failed:', error);
  } finally {
    // Always clear local storage and cookies
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear token cookie
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    // Redirect to login
    window.location.href = '/login';
  }
}
