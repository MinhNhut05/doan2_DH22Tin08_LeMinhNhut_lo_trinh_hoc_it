// submit-quiz.dto.ts - DTO cho quiz submission
//
// Validates request body cho POST /lessons/:slug/quiz/submit
// answers: Record<questionId, selectedOptionIds[]>

import { IsNotEmpty, IsObject } from 'class-validator';

export class SubmitQuizDto {
  @IsObject()
  @IsNotEmpty()
  answers!: Record<string, string[]>; // questionId → selected option ids
}
