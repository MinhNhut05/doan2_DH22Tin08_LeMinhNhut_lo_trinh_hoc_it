import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiSuccessResponse, ResponseMeta } from '../interfaces/api-response.interface';

/**
 * TransformInterceptor
 *
 * Interceptor này wrap TẤT CẢ responses thành công vào format chuẩn:
 * {
 *   success: true,
 *   data: <original response>,
 *   meta: { timestamp, path }
 * }
 *
 * Cách hoạt động:
 * 1. Request đi vào → đi qua interceptor → đến controller
 * 2. Controller trả về data
 * 3. Data đi ngược lại qua interceptor → được wrap → trả về client
 *
 * RxJS Observable:
 * - NestJS sử dụng RxJS để handle async operations
 * - pipe() cho phép chain các operators
 * - map() transform data trước khi trả về
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiSuccessResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiSuccessResponse<T>> {
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      map((data) => {
        // Tạo metadata
        const meta: ResponseMeta = {
          timestamp: new Date().toISOString(),
          path: request.url,
        };

        // Nếu data đã có pagination, thêm vào meta
        if (data && typeof data === 'object' && 'pagination' in data) {
          meta.pagination = data.pagination;
          // Loại bỏ pagination từ data gốc vì đã move vào meta
          const { pagination, ...restData } = data;
          return {
            success: true as const,
            data: restData as T,
            meta,
          };
        }

        return {
          success: true as const,
          data,
          meta,
        };
      }),
    );
  }
}
