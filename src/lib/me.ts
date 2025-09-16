import type { User } from "@/types/user";
import { api } from "./api";

// Mengambil data user dari endpoint baru
export const fetchMe = async (): Promise<User> => {
  const res = await api.get("/user/me");
  return res.data;
};

// Mengambil data subscription user
export const fetchMySubscription = async () => {
  const res = await api.get("/user/me/subscription");
  return res.data;
};

// Fallback function untuk mendapatkan user dari session/localStorage
export const getUserFromSession = (): User | null => {
  try {
    // Coba ambil dari localStorage jika ada
    const userData = localStorage.getItem('user');
    if (userData) {
      return JSON.parse(userData);
    }
  } catch (error) {
    console.error("Error reading user from session:", error);
  }
  return null;
};
