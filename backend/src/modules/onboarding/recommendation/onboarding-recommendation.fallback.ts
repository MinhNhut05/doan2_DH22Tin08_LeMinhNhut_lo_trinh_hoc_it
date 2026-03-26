// onboarding-recommendation.fallback.ts - Rule-based fallback khi AI fail
//
// Khi nào fallback được gọi?
// 1. AI API timeout (> 30 giây)
// 2. Network error (AI server down)
// 3. AI trả về format sai (parseRecommendation trả về null)
//
// Tại sao cần fallback thay vì chỉ throw error?
// → Onboarding là bước quan trọng — user không thể "bị kẹt" ở đây
// → Rule-based đủ tốt cho majority of cases (4 career goals rõ ràng)
// → UX tốt hơn: user vẫn thấy recommendation, không thấy error screen
//
// Fallback KHÔNG BAO GIỜ throw — luôn trả về valid RecommendationResult

import { CareerGoal, LearningBackground } from '@prisma/client';

import type { OnboardingDataInput } from './onboarding-prompt.builder.js';
import type {
  RecommendationResult,
  RankedRecommendation,
} from './onboarding-recommendation.parser.js';

type RecommendationSlug = RankedRecommendation['pathSlug'];

// ── Fallback Rules ────────────────────────────────────────────────────────────

const GOAL_RANKING_ORDER: Record<CareerGoal, { slug: RecommendationSlug; baseScore: number }[]> = {
  [CareerGoal.FRONTEND]: [
    { slug: 'frontend-developer', baseScore: 92 },
    { slug: 'fullstack-developer', baseScore: 68 },
    { slug: 'backend-developer', baseScore: 45 },
  ],
  [CareerGoal.BACKEND]: [
    { slug: 'backend-developer', baseScore: 92 },
    { slug: 'fullstack-developer', baseScore: 70 },
    { slug: 'frontend-developer', baseScore: 40 },
  ],
  [CareerGoal.FULLSTACK]: [
    { slug: 'fullstack-developer', baseScore: 90 },
    { slug: 'frontend-developer', baseScore: 72 },
    { slug: 'backend-developer', baseScore: 70 },
  ],
  [CareerGoal.AI_PYTHON]: [
    { slug: 'ai-python', baseScore: 95 },
    { slug: 'backend-developer', baseScore: 55 },
    { slug: 'fullstack-developer', baseScore: 35 },
  ],
};

const BASE_REASONS: Record<RecommendationSlug, string> = {
  'frontend-developer':
    'Lộ trình Frontend phù hợp nếu bạn muốn xây dựng giao diện web, đi từ nền tảng HTML/CSS/JavaScript đến React.',
  'backend-developer':
    'Lộ trình Backend phù hợp nếu bạn muốn tập trung vào API, business logic, cơ sở dữ liệu và hệ thống phía server.',
  'fullstack-developer':
    'Lộ trình Fullstack phù hợp nếu bạn muốn hiểu và xây dựng được cả frontend lẫn backend trong cùng một sản phẩm.',
  'ai-python':
    'Lộ trình AI Python phù hợp nếu bạn muốn học Python, xử lý dữ liệu và các nền tảng Machine Learning theo hướng thực hành.',
};

const ALL_FOCUS_AREAS: Record<RecommendationSlug, string[]> = {
  'frontend-developer': [
    'HTML & CSS fundamentals',
    'JavaScript ES6+',
    'DOM manipulation',
    'React cơ bản',
    'Responsive design',
  ],
  'backend-developer': [
    'Node.js fundamentals',
    'REST API design',
    'SQL & PostgreSQL',
    'Authentication & JWT',
    'NestJS framework',
  ],
  'fullstack-developer': [
    'HTML, CSS, JavaScript',
    'React',
    'Node.js & Express',
    'SQL Database',
    'API integration',
  ],
  'ai-python': [
    'Python fundamentals',
    'NumPy & Pandas',
    'Data visualization',
    'Statistics cơ bản',
    'Scikit-learn',
  ],
};

const ADVANCED_FOCUS_AREAS: Record<RecommendationSlug, string[]> = {
  'frontend-developer': ['State management', 'Component architecture'],
  'backend-developer': ['Database indexing', 'System design basics'],
  'fullstack-developer': ['App architecture', 'Feature integration workflows'],
  'ai-python': ['Feature engineering', 'Model evaluation basics'],
};

const PRIOR_KNOWLEDGE_COVERAGE: Record<string, string[]> = {
  html: ['HTML & CSS fundamentals', 'HTML, CSS, JavaScript'],
  css: ['HTML & CSS fundamentals', 'Responsive design', 'HTML, CSS, JavaScript'],
  javascript: ['JavaScript ES6+', 'DOM manipulation', 'HTML, CSS, JavaScript'],
  typescript: ['JavaScript ES6+'],
  python: ['Python fundamentals'],
  react: ['React cơ bản', 'React'],
  nodejs: ['Node.js fundamentals', 'Node.js & Express'],
  sql: ['SQL & PostgreSQL', 'SQL Database'],
};

const GOAL_LABELS: Record<CareerGoal, string> = {
  [CareerGoal.FRONTEND]: 'Frontend Developer',
  [CareerGoal.BACKEND]: 'Backend Developer',
  [CareerGoal.FULLSTACK]: 'Fullstack Developer',
  [CareerGoal.AI_PYTHON]: 'AI / Data Science',
};

const SLUG_LABELS: Record<RecommendationSlug, string> = {
  'frontend-developer': 'Frontend Developer',
  'backend-developer': 'Backend Developer',
  'fullstack-developer': 'Fullstack Developer',
  'ai-python': 'AI / Python',
};

const BACKGROUND_LABELS: Record<LearningBackground, string> = {
  [LearningBackground.NO_BACKGROUND]: 'chưa có nền tảng lập trình',
  [LearningBackground.SELF_TAUGHT]: 'đã tự học một phần',
  [LearningBackground.BOOTCAMP]: 'đã học qua bootcamp hoặc khóa học thực hành',
  [LearningBackground.CS_DEGREE]: 'có nền tảng đại học CNTT hoặc tương đương',
};

const PATH_ROLE_MESSAGES: Record<RecommendationSlug, string> = {
  'frontend-developer': 'Path này giúp bạn nhanh chóng tạo ra giao diện và trải nghiệm người dùng rõ ràng trên web.',
  'backend-developer': 'Path này giúp bạn đi sâu vào API, dữ liệu và tư duy thiết kế hệ thống phía server.',
  'fullstack-developer': 'Path này giúp bạn giữ góc nhìn end-to-end để tự xây dựng một sản phẩm hoàn chỉnh.',
  'ai-python': 'Path này giúp bạn xây nền tảng Python và dữ liệu trước khi tiến sang Machine Learning bài bản.',
};

const SECONDARY_ROLE_MESSAGES: Record<RecommendationSlug, string> = {
  'frontend-developer': 'Đây là lựa chọn phụ tốt nếu bạn muốn tăng khả năng xây UI và phối hợp tốt hơn với frontend team.',
  'backend-developer': 'Đây là lựa chọn phụ hợp lý nếu bạn muốn bổ sung tư duy server và xử lý dữ liệu thực tế.',
  'fullstack-developer': 'Đây là lựa chọn phụ cân bằng nếu bạn muốn mở rộng phạm vi làm việc ở cả client lẫn server.',
  'ai-python': 'Đây là lựa chọn phụ nếu bạn muốn nghiêng mạnh hơn sang xử lý dữ liệu và Python.',
};

// ── Fallback function ─────────────────────────────────────────────────────────

export function getFallbackRecommendation(
  data: OnboardingDataInput,
): RecommendationResult {
  const rankingOrder = GOAL_RANKING_ORDER[data.careerGoal];

  const rankings: RankedRecommendation[] = rankingOrder.map((item) => ({
    pathSlug: item.slug,
    matchScore: item.baseScore,
    explanation: buildFallbackExplanation(data, item.slug),
    focusAreas: buildFocusAreas(data, item.slug),
  }));

  const tips = buildStudyTips(data);

  return {
    source: 'fallback',
    rankings,
    tips,
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildFallbackExplanation(
  data: OnboardingDataInput,
  slug: RecommendationSlug,
): string {
  const baseReason = BASE_REASONS[slug];
  const goalLabel = GOAL_LABELS[data.careerGoal];
  const pathLabel = SLUG_LABELS[slug];
  const backgroundLabel = BACKGROUND_LABELS[data.learningBackground];
  const timeContext = getHoursPerWeekDescription(data.hoursPerWeek);
  const isPrimaryRecommendation = GOAL_RANKING_ORDER[data.careerGoal][0]?.slug === slug;
  const roleMessage = isPrimaryRecommendation
    ? PATH_ROLE_MESSAGES[slug]
    : SECONDARY_ROLE_MESSAGES[slug];

  return `${baseReason} Bạn đang hướng tới ${goalLabel} và hiện ${backgroundLabel}, nên ${pathLabel} ${isPrimaryRecommendation ? 'là lựa chọn khớp nhất ở thời điểm này' : 'vẫn là một hướng bổ trợ đáng cân nhắc'}. ${roleMessage} Ngoài ra, ${timeContext}.`;
}

function buildFocusAreas(
  data: OnboardingDataInput,
  slug: RecommendationSlug,
): string[] {
  const allAreas = ALL_FOCUS_AREAS[slug];

  const priorKnowledge = Array.isArray(data.priorKnowledge)
    ? data.priorKnowledge.filter((item): item is string => typeof item === 'string')
    : [];

  const coveredTopics = new Set<string>();
  for (const knowledge of priorKnowledge) {
    const covered = PRIOR_KNOWLEDGE_COVERAGE[knowledge.toLowerCase()];
    if (covered) {
      covered.forEach((topic) => coveredTopics.add(topic));
    }
  }

  const remaining = allAreas.filter((area) => !coveredTopics.has(area));

  if (remaining.length === 0) {
    return ADVANCED_FOCUS_AREAS[slug];
  }

  return remaining.slice(0, 4);
}

function buildStudyTips(data: OnboardingDataInput): string[] {
  const tips: string[] = [];

  if (data.hoursPerWeek <= 5) {
    tips.push(
      'Với 5 giờ/tuần, hãy tập trung vào 1 bài/ngày và đừng bỏ qua bài quiz — đây là cách hiệu quả nhất để giữ kiến thức.',
    );
  } else if (data.hoursPerWeek <= 10) {
    tips.push(
      'Chia đều 1-2 giờ mỗi ngày thay vì học dồn 1 buổi/tuần — học đều đặn giúp nhớ lâu hơn nhiều.',
    );
  } else if (data.hoursPerWeek <= 20) {
    tips.push(
      'Với 10-20 giờ/tuần, bạn có thể hoàn thành 2-3 bài/tuần. Hãy thực hành code ngay sau mỗi bài lý thuyết.',
    );
  } else {
    tips.push(
      'Với hơn 20 giờ/tuần, đây là tốc độ rất tốt. Hãy xen kẽ giữa học lý thuyết và làm dự án thực tế để củng cố kiến thức.',
    );
  }

  if (data.learningBackground === LearningBackground.NO_BACKGROUND) {
    tips.push(
      'Đừng nản lòng nếu thấy khó ở đầu — mọi developer đều bắt đầu từ zero. Hãy đọc kỹ phần giải thích và thử code theo từng bước.',
    );
  } else if (data.learningBackground === LearningBackground.SELF_TAUGHT) {
    tips.push(
      'Kinh nghiệm tự học là lợi thế lớn. Hãy chú ý đến phần best practices trong mỗi bài — đây là thứ khó tìm được từ YouTube.',
    );
  } else if (data.learningBackground === LearningBackground.BOOTCAMP) {
    tips.push(
      'Với nền bootcamp, bạn đã quen với pace học nhanh. Hãy focus vào phần lý thuyết sâu và các design patterns thay vì chỉ làm cho chạy.',
    );
  } else {
    tips.push(
      'Với nền đại học CNTT, bạn có thể đi nhanh hơn ở các phần cơ bản. Hãy ưu tiên bài thực hành và so sánh nhiều cách triển khai thay vì chỉ đọc lý thuyết.',
    );
  }

  return tips;
}

function getHoursPerWeekDescription(hoursPerWeek: number): string {
  if (hoursPerWeek <= 5) {
    return 'quỹ thời gian của bạn còn hạn chế nên nên ưu tiên một lộ trình rõ ràng và học thật đều';
  }

  if (hoursPerWeek <= 10) {
    return 'bạn có quỹ thời gian vừa phải để tiến bộ ổn định nếu giữ nhịp học hằng tuần';
  }

  return 'bạn có đủ quỹ thời gian để vừa học nền tảng vừa thực hành sâu hơn trên các dự án nhỏ';
}
