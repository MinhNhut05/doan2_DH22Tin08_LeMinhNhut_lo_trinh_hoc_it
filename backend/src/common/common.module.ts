import { Module } from '@nestjs/common';

/**
 * CommonModule
 *
 * Module này chứa các utilities dùng chung trong toàn app:
 * - Interceptors (TransformInterceptor)
 * - Filters (HttpExceptionFilter)
 * - Interfaces (ApiResponse types)
 *
 * Lưu ý: Interceptor và Filter được register GLOBALLY trong main.ts,
 * không cần import CommonModule vào các modules khác.
 * Module này chủ yếu để organize code.
 */
@Module({})
export class CommonModule {}
