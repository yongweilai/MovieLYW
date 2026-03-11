import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { API_CONFIG } from './config';

type GetParams = Record<string, string | number | boolean | undefined>;

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiFailure = {
  success: false;
  message: string;
  status?: number;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${API_CONFIG.TOKEN}`,
      },
    });
  }

  async get<T>(
    url: string,
    params?: GetParams,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get<T>(url, {
        ...config,
        params,
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  private statusMessage(status: number | undefined): string {
    if (status === undefined) return '';
    const map: Record<number, string> = {
      400: 'Bad request (400)',
      401: 'Unauthorized (401)',
      403: 'Forbidden (403)',
      404: 'Not found (404)',
      422: 'Unprocessable entity (422)',
      429: 'Too many requests (429)',
      500: 'Server error (500)',
      502: 'Bad gateway (502)',
      503: 'Service unavailable (503)',
    };
    return map[status] || `Error (${status})`;
  }

  private handleError(error: unknown): ApiFailure {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ status_message?: string }>;

      const status = axiosError.response?.status;
      const serverMessage = axiosError.response?.data?.status_message;

      if (axiosError.code === 'ECONNABORTED') {
        return {
          success: false,
          message: 'Request timeout. Please try again.',
          status,
        };
      }

      const fallback = this.statusMessage(status) || axiosError.message || 'Request failed';
      const message = serverMessage ? `${serverMessage} (${status})` : fallback;

      return {
        success: false,
        message,
        status,
      };
    }

    return {
      success: false,
      message: 'Unknown error occurred',
    };
  }
}

export const apiClient = new ApiClient();