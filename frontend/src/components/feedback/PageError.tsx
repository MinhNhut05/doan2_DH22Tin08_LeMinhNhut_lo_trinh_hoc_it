import { AlertTriangle, RefreshCw } from 'lucide-react';
import { vi } from '../../strings/vi';

interface PageErrorProps {
  message?: string;
  onRetry?: () => void;
}

/**
 * Compact error card for first-load failures.
 * Renders inside page content area (not full-screen).
 * Uses secondary surface, 20px heading, 16px body, one primary retry button.
 */
export function PageError({ message, onRetry }: PageErrorProps) {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="bento-card text-center max-w-md">
        <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={28} className="text-red-400" />
        </div>
        <h2 className="text-h4 text-dp-text-primary mb-2">
          {vi.common.genericError}
        </h2>
        <p className="text-body-sm text-dp-text-muted mb-5">
          {message ?? vi.common.genericError}
        </p>
        {onRetry && (
          <button onClick={onRetry} className="btn-primary h-10 px-6 mx-auto">
            <RefreshCw size={16} />
            {vi.common.retry}
          </button>
        )}
      </div>
    </div>
  );
}
