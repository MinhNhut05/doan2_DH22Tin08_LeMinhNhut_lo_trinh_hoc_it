// lessons.controller.ts - Lesson endpoints
//
// Tất cả routes trong controller này cần @UseGuards(JwtAuthGuard):
//   → User phải login để xem lesson detail (content là protected)
//   → Start/Complete cần userId để track progress
//
// Tại sao đặt guard ở class level?
// → Tất cả 3 routes đều cần auth → đặt 1 lần gọn hơn
// → Khác với LearningPathsController (mix public + protected)

import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { CurrentUser } from '../../common/decorators/index.js';
import { JwtAuthGuard } from '../auth/index.js';
import { SlugParamDto, SubmitQuizDto } from './dto/index.js';
import { LessonsService } from './lessons.service.js';

@Controller('lessons')
@UseGuards(JwtAuthGuard)
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  // ── GET /api/v1/lessons/:slug ───────────────────────────────────────────

  @Get(':slug')
  async getLessonBySlug(
    @Param() params: SlugParamDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.lessonsService.getLessonBySlug(userId, params.slug);
  }

  // ── POST /api/v1/lessons/:slug/start ────────────────────────────────────

  @Post(':slug/start')
  @HttpCode(HttpStatus.OK)
  async startLesson(
    @Param() params: SlugParamDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.lessonsService.startLesson(userId, params.slug);
  }

  // ── POST /api/v1/lessons/:slug/complete ─────────────────────────────────

  @Post(':slug/complete')
  @HttpCode(HttpStatus.OK)
  async completeLesson(
    @Param() params: SlugParamDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.lessonsService.completeLesson(userId, params.slug);
  }

  // ── GET /api/v1/lessons/:slug/quiz ──────────────────────────────────────

  /**
   * Lấy quiz data cho lesson (questions without correctAnswer).
   */
  @Get(':slug/quiz')
  async getQuiz(
    @Param() params: SlugParamDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.lessonsService.getQuizByLessonSlug(userId, params.slug);
  }

  // ── POST /api/v1/lessons/:slug/quiz/submit ──────────────────────────────

  /**
   * Submit quiz answers → server-side grading → return result.
   */
  @Post(':slug/quiz/submit')
  @HttpCode(HttpStatus.OK)
  async submitQuiz(
    @Param() params: SlugParamDto,
    @CurrentUser('id') userId: string,
    @Body() dto: SubmitQuizDto,
  ) {
    return this.lessonsService.submitQuiz(userId, params.slug, dto.answers);
  }
}

