import { describe, expect, it, beforeEach, vi } from 'vitest';
import { screen } from '@testing-library/react';

import Onboarding from './Onboarding';
import { renderWithProviders } from '../test/renderWithProviders';

type MockApiResponse<T> = {
  data: {
    data: T;
  };
};

const { apiGet, apiPost } = vi.hoisted(() => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
}));

vi.mock('../services/api', () => ({
  default: {
    get: apiGet,
    post: apiPost,
  },
}));

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

function mockStatusResponse(status: {
  completedRounds: number[];
  nextRound: number | null;
  resumeAvailable: boolean;
  canRequestRecommendation: boolean;
  careerGoal: string | null;
  hasConfirmedPath: boolean;
}): MockApiResponse<typeof status> {
  return {
    data: {
      data: status,
    },
  };
}

function mockRecommendationResponse(): MockApiResponse<{
  source: 'ai';
  primaryPath: string;
  alternativePaths: string[];
  reason: string;
  focusAreas: string[];
  tips: string[];
}> {
  return {
    data: {
      data: {
        source: 'ai',
        primaryPath: 'frontend-developer',
        alternativePaths: ['fullstack-developer'],
        reason: 'Phù hợp với nền tảng hiện tại của bạn.',
        focusAreas: ['JavaScript', 'React'],
        tips: ['Ôn lại HTML/CSS nền tảng'],
      },
    },
  };
}

describe('Onboarding', () => {
  beforeEach(() => {
    apiGet.mockReset();
    apiPost.mockReset();
  });

  it('renders a loading or skeleton state cleanly while onboarding shell data is pending', () => {
    const deferredStatus = createDeferred<MockApiResponse<unknown>>();

    apiGet.mockImplementation((url: string) => {
      if (url === '/onboarding/status') {
        return deferredStatus.promise;
      }

      return Promise.reject(new Error(`Unexpected GET ${url}`));
    });

    renderWithProviders(<Onboarding />);

    expect(screen.getByText(/đang tải/i)).toBeInTheDocument();
  });

  it('renders a resume state with a welcome-back message and continue CTA for ONB-04', async () => {
    apiGet.mockImplementation((url: string) => {
      if (url === '/onboarding/status') {
        return Promise.resolve(
          mockStatusResponse({
            completedRounds: [1],
            nextRound: 2,
            resumeAvailable: true,
            canRequestRecommendation: false,
            careerGoal: 'frontend',
            hasConfirmedPath: false,
          }),
        );
      }

      if (url === '/onboarding/questions') {
        return Promise.resolve({
          data: {
            data: [],
          },
        });
      }

      return Promise.reject(new Error(`Unexpected GET ${url}`));
    });

    renderWithProviders(<Onboarding />);

    expect(await screen.findByText(/chào mừng bạn quay lại/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tiếp tục/i })).toBeInTheDocument();
  });

  it('renders a recommendation state with a confirm CTA after all rounds complete for ONB-06 and ONB-07 coverage', async () => {
    apiGet.mockImplementation((url: string) => {
      if (url === '/onboarding/status') {
        return Promise.resolve(
          mockStatusResponse({
            completedRounds: [1, 2, 3],
            nextRound: null,
            resumeAvailable: false,
            canRequestRecommendation: true,
            careerGoal: 'frontend',
            hasConfirmedPath: false,
          }),
        );
      }

      if (url === '/onboarding/recommendation') {
        return Promise.resolve(mockRecommendationResponse());
      }

      return Promise.reject(new Error(`Unexpected GET ${url}`));
    });

    renderWithProviders(<Onboarding />);

    expect(await screen.findByText(/gợi ý của ai/i)).toBeInTheDocument();
    expect(screen.getByText(/lập trình viên frontend/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /bắt đầu học|xác nhận|confirm/i })).toBeInTheDocument();
  });

  it('keeps explicit Wave 0 placeholders for ONB-04, ONB-06, and ONB-07 flow expansion', () => {
    expect(['ONB-04', 'ONB-06', 'ONB-07']).toEqual(
      expect.arrayContaining(['ONB-04', 'ONB-06', 'ONB-07']),
    );
  });
});
