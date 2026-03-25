// onboarding.controller.ts - Onboarding endpoints
//
// Tương tự auth.controller.ts, controller chỉ làm:
//   1. Nhận + validate request
//   2. Gọi service method
//   3. Trả về response
//
// Tất cả routes đều cần @UseGuards(JwtAuthGuard):
//   → User phải đăng nhập trước khi vào onboarding
//   → req.user sẽ có { id, email, role } sau khi guard validate token
//
// Lưu ý: GET /questions là read-only, không cần body
//   → Các endpoint POST sẽ dùng @Body() + DTO để validate

import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import type { Request } from 'express';

import { JwtAuthGuard } from '../auth/index.js';
import { OnboardingService } from './onboarding.service.js';
import {
  SubmitOnboardingDto,
  ConfirmPathDto,
  SubmitRoundTwoDto,
  SubmitRoundThreeDto,
} from './dto/index.js';

// req.user được gắn bởi JwtStrategy.validate()
// Shape: { id: string, email: string, role: string }
type JwtUser = { id: string; email: string; role: string };

@Controller('onboarding')
@UseGuards(JwtAuthGuard) // Áp dụng guard cho TẤT CẢ routes trong controller này
// Tại sao để ở class level thay vì từng method?
// → Tất cả endpoint onboarding đều cần auth → đặt một lần là đủ
// → Gọn hơn, ít lặp code hơn
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  // ── GET /api/v1/onboarding/questions ─────────────────────────────────────

  /**
   * Trả về danh sách câu hỏi onboarding.
   *
   * Static data từ constants → không cần DB query, không cần userId.
   * Response: { success: true, data: [{ id, question, type, options }] }
   */
  @Get('questions')
  getQuestions() {
    return this.onboardingService.getQuestions();
    // TransformInterceptor tự wrap thành:
    // { success: true, data: [...], meta: { timestamp, path } }
  }

  // ── POST /api/v1/onboarding/submit ────────────────────────────────────────

  /**
   * POST /api/v1/onboarding/submit
   *
   * User submit câu trả lời onboarding.
   * Validate input bằng SubmitOnboardingDto trước khi vào service.
   *
   * Response 201: OnboardingData vừa tạo
   * Response 409: user đã submit trước đó (ConflictException)
   * Response 400: input không hợp lệ (ValidationPipe)
   */
  @Post('submit')
  @HttpCode(HttpStatus.CREATED) // 201 vì tạo mới OnboardingData record
  async submitAnswers(@Req() req: Request, @Body() dto: SubmitOnboardingDto) {
    const user = req.user as JwtUser;
    return this.onboardingService.submitAnswers(user.id, dto);
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  async getStatus(@Req() req: Request) {
    const user = req.user as JwtUser;
    return this.onboardingService.getStatus(user.id);
  }

  @Get('questions/:round')
  @UseGuards(JwtAuthGuard)
  async getQuestionsForRound(
    @Req() req: Request,
    @Param('round', ParseIntPipe) round: number,
  ) {
    const user = req.user as JwtUser;
    return this.onboardingService.getQuestionsForRound(user.id, round);
  }

  @Post('submit/round-two')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async submitRoundTwo(@Req() req: Request, @Body() dto: SubmitRoundTwoDto) {
    const user = req.user as JwtUser;
    return this.onboardingService.submitRoundTwo(user.id, dto);
  }

  @Post('submit/round-three')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async submitRoundThree(@Req() req: Request, @Body() dto: SubmitRoundThreeDto) {
    const user = req.user as JwtUser;
    return this.onboardingService.submitRoundThree(user.id, dto);
  }

  // ── GET /api/v1/onboarding/recommendation ────────────────────────────────

  /**
   * Lấy gợi ý learning path từ AI.
   * Chỉ khả dụng sau khi user hoàn thành đủ 3 round onboarding.
   */
  @Get('recommendation')
  async getRecommendation(@Req() req: Request) {
    const user = req.user as JwtUser;
    return this.onboardingService.getRecommendation(user.id);
  }

  // ── POST /api/v1/onboarding/confirm ──────────────────────────────────────

  /**
   * User confirm learning path đã chọn.
   * Tạo UserLearningPath record.
   */
  @Post('confirm')
  @HttpCode(HttpStatus.CREATED) // 201 vì tạo mới UserLearningPath record
  async confirmPath(@Req() req: Request, @Body() dto: ConfirmPathDto) {
    const user = req.user as JwtUser;
    return this.onboardingService.confirmPath(user.id, dto);
  }
}
