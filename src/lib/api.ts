import axios from "axios";

// Get API URL with fallback logic
const getApiUrl = () => {
  // First try env variable
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Fallback: detect environment based on hostname
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Production
    if (hostname.includes('morphlyca.meetaza.com')) {
      return 'https://api.morphlyca.meetaza.com';
    }
    
    // Local development
    return 'http://localhost:3000';
  }
  
  // SSR fallback
  return 'http://localhost:3000';
};

const API_URL = getApiUrl();

// Log for debugging
if (typeof window !== 'undefined') {
  console.log('🌐 API BaseURL:', API_URL);
  console.log('🌐 Current hostname:', window.location.hostname);
}

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    // Try to get token from localStorage or cookies
    const token = localStorage.getItem('token') || getTokenFromCookies();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      
      // Only redirect to login if user is on an admin/protected route
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        const isAdminRoute = currentPath.startsWith('/admin');
        const isLoginPage = currentPath.includes('/login');
        
        // Only redirect if on admin route and not already on login page
        if (isAdminRoute && !isLoginPage) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Helper function to get token from cookies
function getTokenFromCookies(): string | null {
  if (typeof document === 'undefined') return null;
  
  const name = 'token=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(';');
  
  for (let i = 0; i < cookieArray.length; i++) {
    let cookie = cookieArray[i];
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1);
    }
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length, cookie.length);
    }
  }
  return null;
}