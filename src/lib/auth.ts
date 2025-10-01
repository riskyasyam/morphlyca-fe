
import { User } from '@/types/user';
import { api } from './api';

export interface AuthResponse {
  authenticated: boolean;
  user: User | null;
}

export interface LoginRequest {
  username: string;
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
    // Validate input before sending to backend
    if (!credentials.username || credentials.username.length < 3) {
      return {
        success: false,
        message: 'Username must be at least 3 characters long'
      };
    }
    
    if (!credentials.password || credentials.password.length < 6) {
      return {
        success: false,
        message: 'Password must be at least 6 characters long'
      };
    }

    console.log('Sending login request to /auth/prime/manual-login');
    console.log('Username length:', credentials.username.length);
    console.log('Request payload:', { username: credentials.username, password: '[HIDDEN]' });

    const response = await api.post('/auth/prime/manual-login', {
      username: credentials.username.trim(),
      password: credentials.password
    });
    
    console.log('Login response status:', response.status);
    console.log('Login response data:', response.data);
    
    // Manual login API returns: { message, user, isAuthenticated }
    if (response.data.isAuthenticated && response.data.user) {
      // Store user data
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Backend sets HTTP-only cookies automatically
      // Try to also get access_token from response if provided
      if (response.data.tokens?.access_token) {
        localStorage.setItem('access_token', response.data.tokens.access_token);
      }
      
      return {
        success: true,
        user: response.data.user,
        token: response.data.tokens?.access_token,
        message: response.data.message || 'Login successful'
      };
    } else {
      return {
        success: false,
        message: response.data.message || 'Login failed'
      };
    }
  } catch (error: any) {
    console.error('Login error details:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    
    // Handle specific error cases
    if (error.response?.status === 400) {
      const errorData = error.response.data;
      
      // Handle authentication_failed specifically
      if (errorData.error === 'authentication_failed') {
        return {
          success: false,
          message: 'Invalid username or password. Please check your credentials.'
        };
      }
      
      // Handle validation errors
      if (Array.isArray(errorData.message)) {
        return {
          success: false,
          message: errorData.message.join('. ')
        };
      }
      
      // Handle other 400 errors
      return {
        success: false,
        message: errorData.message || 'Invalid request. Please check your input.'
      };
    }
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      return {
        success: false,
        message: 'Invalid username or password'
      };
    }
    
    // Handle 502 Bad Gateway (PrimeAuth server issues)
    if (error.response?.status === 502) {
      return {
        success: false,
        message: 'Authentication server temporarily unavailable. Please try again later.'
      };
    }
    
    // Handle network errors
    if (!error.response) {
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.'
      };
    }
    
    return {
      success: false,
      message: error.response?.data?.message || 'Login failed. Please try again.'
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
    // Always clear local storage
    localStorage.removeItem('user');
    
    // Clear HTTP-only cookies (access_token and refresh_token)
    // Note: HTTP-only cookies can't be cleared from frontend directly
    // Backend should handle cookie clearing on /auth/logout endpoint
    
    // Clear any client-side token cookie if exists
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    // Note: Component should handle redirect after calling this function
  }
}

// Debug function untuk troubleshooting (hanya untuk development)
export async function debugLogin(credentials: LoginRequest): Promise<any> {
  try {
    console.log('🔍 Debug Login - Testing with debug endpoint');
    const response = await api.post('/auth/debug-manual-login', credentials);
    console.log('🔍 Debug Response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('🔍 Debug Login Error:', error);
    console.error('🔍 Debug Error Response:', error.response?.data);
    throw error;
  }
}

// Test function untuk memeriksa koneksi backend
export async function testBackendConnection(): Promise<boolean> {
  try {
    console.log('🌐 Testing backend connection...');
    // Use a different endpoint since /health doesn't exist
    const response = await api.get('/auth/me');
    console.log('🌐 Backend connection OK:', response.status);
    return true;
  } catch (error: any) {
    // If it's 401, that means backend is running but not authenticated (which is expected)
    if (error.response?.status === 401) {
      console.log('🌐 Backend connection OK (401 expected for unauthenticated request)');
      return true;
    }
    console.error('🌐 Backend connection failed:', error);
    return false;
  }
}
