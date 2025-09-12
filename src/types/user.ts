export interface User {
  id: string;
  email: string;
  displayName: string;
  role: "ADMIN" | "USER";
  createdAt: string;
}

export interface UserResponse {
  users: User[];
  total?: number;
  page?: number;
  limit?: number;
}