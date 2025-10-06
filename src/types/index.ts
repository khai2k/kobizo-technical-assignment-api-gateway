export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  expires: number;
  user: User;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  description?: string;
  stock_quantity: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface DirectusAuthResponse {
  access_token: string;
  refresh_token?: string;
  expires: number;
  user: User;
}

export interface DirectusError {
  errors: Array<{
    message: string;
    extensions: {
      code: string;
    };
  }>;
}

export interface CheckoutItem {
  productId: string;
  quantity: number;
}

export interface CheckoutRequest {
  items: CheckoutItem[];
}

export interface StockCheckResult {
  productId: string;
  productName: string;
  requestedQuantity: number;
  availableStock: number;
  isAvailable: boolean;
}

export interface CheckoutResponse {
  success: boolean;
  message: string;
  stockCheck: StockCheckResult[];
  totalItems: number;
  canProceed: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  author: string;
  published_date: string;
}

export interface BlogAuthor {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}
