import { cn } from '../../lib/utils';

interface SkeletonProps {
  className?: string;
}

/**
 * Reusable skeleton shimmer block for loading states.
 * Follows existing Dashboard skeleton pattern with animate-pulse.
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse bg-dp-glass-bg rounded-lg-dp', className)}
    />
  );
}
