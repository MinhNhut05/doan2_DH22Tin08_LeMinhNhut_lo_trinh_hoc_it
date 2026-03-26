// onboarding-recommendation.parser.ts - Parse AI JSON response thành structured data
//
// Tại sao cần parser riêng?
// → AI không phải lúc nào cũng trả về JSON hoàn hảo
// → Parser handle defensive: thiếu field, sai type, extra whitespace
// → Trả về null nếu không parse được → service dùng fallback
//
// Tại sao trả về null thay vì throw?
// → Service cần biết "parse thành công hay không" để quyết định dùng fallback
// → Throw sẽ bị catch cùng với network error → khó debug
// → null rõ ràng hơn: "AI respond nhưng format sai"

import { VALID_PATH_SLUGS } from './onboarding-prompt.builder.js';

// ── RecommendationResult (shared type) ───────────────────────────────────────

/**
 * Một recommendation item trong ranked result.
 */
export interface RankedRecommendation {
  pathSlug: string;
  matchScore: number;
  explanation: string;
  focusAreas: string[];
}

/**
 * Shape của recommendation result — contract giữa recommendation engine và service.
 *
 * source: 'ai' khi parse thành công, 'fallback' khi dùng rule-based fallback
 * rankings: tối đa 3 learning paths được xếp hạng theo độ phù hợp
 * tips: lời khuyên học tập cá nhân hóa
 */
export interface RecommendationResult {
  source: 'ai' | 'fallback';
  rankings: RankedRecommendation[];
  tips: string[];
}

// ── Parser function ───────────────────────────────────────────────────────────

/**
 * Parse raw AI response string thành ranked RecommendationResult.
 */
export function parseRecommendation(raw: string): RecommendationResult | null {
  const cleaned = extractJsonString(raw.trim());

  let parsed: { rankings?: unknown; tips?: unknown };
  try {
    parsed = JSON.parse(cleaned) as { rankings?: unknown; tips?: unknown };
  } catch {
    return null;
  }

  if (!Array.isArray(parsed.rankings) || parsed.rankings.length === 0) {
    return null;
  }

  const validatedRankings: RankedRecommendation[] = [];
  const usedSlugs = new Set<string>();

  for (const item of parsed.rankings) {
    if (typeof item !== 'object' || item === null) continue;

    const rawItem = item as Record<string, unknown>;

    if (typeof rawItem.pathSlug !== 'string') continue;
    const pathSlug = rawItem.pathSlug.trim().toLowerCase();
    if (!VALID_PATH_SLUGS.includes(pathSlug)) continue;
    if (usedSlugs.has(pathSlug)) continue;

    const matchScore = Number(rawItem.matchScore);
    if (Number.isNaN(matchScore) || matchScore < 0 || matchScore > 100) continue;

    if (typeof rawItem.explanation !== 'string' || rawItem.explanation.trim() === '') continue;

    const focusAreas = normalizeStringArray(rawItem.focusAreas);

    usedSlugs.add(pathSlug);
    validatedRankings.push({
      pathSlug,
      matchScore: Math.round(matchScore),
      explanation: rawItem.explanation.trim(),
      focusAreas,
    });
  }

  if (validatedRankings.length === 0) {
    return null;
  }

  validatedRankings.sort((a, b) => b.matchScore - a.matchScore);

  const tips = normalizeStringArray(parsed.tips);

  return {
    source: 'ai',
    rankings: validatedRankings.slice(0, 3),
    tips,
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Nếu AI vẫn wrap JSON trong ```json...``` block → extract phần JSON thuần.
 * Nếu không tìm thấy code block → trả về nguyên string để JSON.parse thử.
 *
 * @example
 * extractJsonString('```json\n{"foo": "bar"}\n```') → '{"foo": "bar"}'
 * extractJsonString('{"foo": "bar"}') → '{"foo": "bar"}'
 */
function extractJsonString(raw: string): string {
  // Match ```json...``` hoặc ```...```
  const codeBlockMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch?.[1]) {
    return codeBlockMatch[1].trim();
  }
  return raw;
}

/**
 * Normalize một giá trị unknown thành string[].
 * Nếu không phải array → trả về []
 * Nếu là array → filter lấy phần tử là string, trim whitespace
 *
 * @example
 * normalizeStringArray(["a", "b", 42]) → ["a", "b"]
 * normalizeStringArray(null) → []
 * normalizeStringArray("not-array") → []
 */
function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}
