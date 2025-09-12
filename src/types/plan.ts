export interface Plan {
  id: number;
  code: string;
  name: string;
  priority: number;
  createdAt: string; 
}

export interface PlansListResponse {
  items: Plan[];
  total: number;
  skip: number;
  take: number;
}