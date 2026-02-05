/**
 * Standardized API Response Interfaces
 *
 * Tất cả API responses đều tuân theo format này để frontend
 * dễ dàng handle responses một cách nhất quán.
 */

// Response thành công
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: ResponseMeta;
}

// Response lỗi
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string; // VD: "VALIDATION_ERROR", "UNAUTHORIZED"
    message: string; // Human-readable message
    details?: unknown; // Chi tiết lỗi (optional)
  };
  meta?: ResponseMeta;
}

// Metadata đi kèm response
export interface ResponseMeta {
  timestamp: string;
  path?: string;
  // Pagination info (optional)
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Union type cho cả 2 loại response
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
