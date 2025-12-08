/**
 * API client for communicating with the FastAPI backend.
 */
import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type {
  AnalyzeRequest,
  AnalyzeResponse,
  HistoryResponse,
  UserProfile,
} from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // For cookie-based auth
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Redirect to login if unauthorized
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication endpoints
  async login(): Promise<void> {
    window.location.href = `${API_BASE_URL}/auth/login`;
  }

  async logout(): Promise<void> {
    await this.client.post('/auth/logout');
  }

  async getCurrentUser(): Promise<UserProfile> {
    const response = await this.client.get<UserProfile>('/auth/me');
    return response.data;
  }

  async getAuthStatus(): Promise<{
    authenticated: boolean;
    user: UserProfile | null;
  }> {
    const response = await this.client.get('/auth/status');
    return response.data;
  }

  // Analysis endpoints
  async analyzeMR(request: AnalyzeRequest): Promise<AnalyzeResponse> {
    const response = await this.client.post<AnalyzeResponse>(
      '/api/analyze',
      request
    );
    return response.data;
  }

  async getHistory(params?: {
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<HistoryResponse> {
    const response = await this.client.get<HistoryResponse>('/api/history', {
      params,
    });
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    const response = await this.client.get('/health');
    return response.data;
  }
}

// Export singleton instance
export const apiClient = new APIClient();
