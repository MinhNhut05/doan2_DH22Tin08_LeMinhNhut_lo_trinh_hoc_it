import { type ReactNode } from 'react';
import { Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { vi } from '../../strings/vi';

interface PageEmptyProps {
  title?: string;
  description?: string;
  ctaText?: string;
  ctaTo?: string;
  icon?: ReactNode;
}

/**
 * Friendly empty-state card with illustration + heading + body + CTA.
 * Vertical order: icon -> heading -> body -> CTA.
 */
export function PageEmpty({
  title = vi.dashboard.emptyPathTitle,
  description = vi.dashboard.emptyPathDesc,
  ctaText = vi.common.goExplore,
  ctaTo = '/explore',
  icon,
}: PageEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="w-16 h-16 rounded-full bg-dp-primary-muted flex items-center justify-center mb-4">
        {icon ?? <Compass size={28} className="text-dp-primary" />}
      </div>
      <h2 className="text-h4 text-dp-text-primary mb-2">{title}</h2>
      <p className="text-body-sm text-dp-text-muted mb-5 max-w-sm">
        {description}
      </p>
      <Link to={ctaTo} className="btn-primary h-11 px-6">
        <Compass size={16} />
        {ctaText}
      </Link>
    </div>
  );
}
