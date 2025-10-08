export interface ErrorResponse {
    timestamp: string
    status: number
    error: string
}

export interface ToastData {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  visible: boolean;
}