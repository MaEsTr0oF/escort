import { AxiosError } from 'axios';

export interface ErrorResponse {
  message: string;
  status?: number;
}

export const handleAxiosError = (error: unknown): ErrorResponse => {
  if (error instanceof AxiosError) {
    return {
      message: error.response?.data?.message || error.message,
      status: error.response?.status
    };
  }
  
  if (error instanceof Error) {
    return {
      message: error.message
    };
  }

  return {
    message: 'Произошла неизвестная ошибка'
  };
}; 