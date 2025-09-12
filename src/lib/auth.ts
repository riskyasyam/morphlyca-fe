
import { User } from '@/types/user';
import { api } from './api';


export interface AuthResponse {
  authenticated: boolean;
  user: User | null;
}

export async function checkAuth(): Promise<AuthResponse | null> {
  try {
    const { data } = await api.get<AuthResponse>('/auth/me');
    return data;
  } catch (error) {
    console.error('Auth check failed:', error);
    return null;
  }
}

// Fungsi untuk handle logout
export async function handleLogout(): Promise<void> {
  try {
    await api.post('/auth/logout');
    // Hapus token dari localStorage/cookie jika ada
    localStorage.removeItem('token');
    // Bisa tambahkan redirect di sini jika perlu
  } catch (error) {
    console.error('Logout failed:', error);
  }
}
