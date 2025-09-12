// User utilities untuk handle user operations
import { api } from './api';
import { User } from '@/types/user';

// Fetch all users
export async function fetchUsers(): Promise<User[]> {
  try {
    const response = await api.get('/user');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch users:', error);
    throw error;
  }
}

// Get user by ID
export async function getUserById(id: string): Promise<User> {
  try {
    const response = await api.get(`/user/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw error;
  }
}

// Update user
export async function updateUser(id: string, userData: Partial<User>): Promise<User> {
  try {
    const response = await api.put(`/user/${id}`, userData);
    return response.data;
  } catch (error) {
    console.error('Failed to update user:', error);
    throw error;
  }
}

// Delete user
export async function deleteUser(id: string): Promise<boolean> {
  try {
    await api.delete(`/user/${id}`);
    return true;
  } catch (error) {
    console.error('Failed to delete user:', error);
    throw error;
  }
}
