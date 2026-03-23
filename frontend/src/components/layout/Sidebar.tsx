import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Compass,
  MessageSquare,
  Trophy,
  User,
  Bell,
  Shield,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Zap,
  Flame,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../stores/authStore';
import { useSidebarContext } from './AppLayout';
import { vi } from '../../strings/vi';

const EASE_SMOOTH = [0.16, 1, 0.3, 1] as const;

// ─── Nav Items Config ─────────────────────────────────────────────────────────

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  section: 'main' | 'user' | 'admin';
}

const NAV_ITEMS: NavItem[] = [
  { icon: LayoutDashboard, label: vi.sidebar.dashboard, path: '/dashboard', section: 'main' },
  { icon: Compass, label: vi.sidebar.explore, path: '/explore', section: 'main' },
  { icon: MessageSquare, label: vi.sidebar.aiChat, path: '/ai-chat', section: 'main' },
  { icon: Trophy, label: vi.sidebar.leaderboard, path: '/leaderboard', section: 'main' },
  { icon: User, label: vi.sidebar.settings, path: '/settings', section: 'user' },
  { icon: Bell, label: vi.sidebar.notifications, path: '/notifications', section: 'user' },
  { icon: Shield, label: vi.sidebar.admin, path: '/admin', section: 'admin' },
];

// ─── Mock Gamification Data ───────────────────────────────────────────────────

const MOCK_GAMIFICATION = {
  xp: 2450,
  streak: 7,
  xpProgress: 65, // % toward next level
};

// ─── Sidebar Component ────────────────────────────────────────────────────────

export default function Sidebar() {
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen } = useSidebarContext();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);

  // Close mobile sidebar on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, setMobileOpen]);

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  // Filter nav items based on user role
  const visibleItems = NAV_ITEMS.filter(
    (item) => item.section !== 'admin' || user?.role === 'ADMIN'
  );

  const mainItems = visibleItems.filter((i) => i.section === 'main');
  const userItems = visibleItems.filter((i) => i.section === 'user');
  const adminItems = visibleItems.filter((i) => i.section === 'admin');

  // ─── Sidebar Content (shared between desktop & mobile) ────────────────────

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center h-16 px-4 shrink-0">
        <Link to="/dashboard" className="flex items-center gap-2 overflow-hidden">
          <div className="w-8 h-8 rounded-lg-dp bg-gradient-to-br from-dp-primary to-dp-secondary flex items-center justify-center text-white font-bold text-sm shrink-0">
            D
          </div>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="text-lg font-bold gradient-text whitespace-nowrap"
            >
              DevPath
            </motion.span>
          )}
        </Link>
      </div>

      {/* Toggle button (desktop only) */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex items-center justify-center mx-3 mb-2 h-8 rounded-md-dp text-dp-text-muted hover:text-dp-text-secondary hover:bg-dp-glass-hover transition-all duration-base"
        title={collapsed ? vi.sidebar.expandSidebar : vi.sidebar.collapseSidebar}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto px-2 space-y-1">
        {/* Main nav */}
        <div className="space-y-0.5">
          {mainItems.map((item) => (
            <NavLink key={item.path} item={item} collapsed={collapsed} active={isActive(item.path)} />
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-dp-border-subtle my-3" />

        {/* User nav */}
        <div className="space-y-0.5">
          {userItems.map((item) => (
            <NavLink key={item.path} item={item} collapsed={collapsed} active={isActive(item.path)} />
          ))}
        </div>

        {/* Admin section */}
        {adminItems.length > 0 && (
          <>
            <div className="h-px bg-dp-border-subtle my-3" />
            <div className="space-y-0.5">
              {adminItems.map((item) => (
                <NavLink key={item.path} item={item} collapsed={collapsed} active={isActive(item.path)} />
              ))}
            </div>
          </>
        )}
      </nav>

      {/* Gamification Widget (bottom) */}
      <div className="shrink-0 p-3 border-t border-dp-border-subtle">
        {collapsed ? (
          /* Collapsed: icons only */
          <div className="flex flex-col items-center gap-2">
            <div className="badge badge-xp" title={`${MOCK_GAMIFICATION.xp.toLocaleString()} XP`}>
              <Zap size={12} />
            </div>
            <div className="badge badge-streak" title={`${MOCK_GAMIFICATION.streak} ${vi.sidebar.streakDays}`}>
              <Flame size={12} />
            </div>
          </div>
        ) : (
          /* Expanded: full widget */
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="badge badge-xp">
                <Zap size={12} />
                {MOCK_GAMIFICATION.xp.toLocaleString()} XP
              </span>
              <span className="badge badge-streak">
                <Flame size={12} />
                {MOCK_GAMIFICATION.streak} {vi.sidebar.streakDays}
              </span>
            </div>
            {/* Mini progress bar */}
            <div className="progress-track">
              <div
                className="progress-fill progress-fill-xp h-full rounded-full"
                style={{ width: `${MOCK_GAMIFICATION.xpProgress}%` }}
              />
            </div>
            <p className="text-mono-sm text-dp-text-ghost text-center">
              {MOCK_GAMIFICATION.xpProgress}% {vi.sidebar.toNextLevel}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col fixed left-0 top-0 h-screen z-[30]',
          'glass-sidebar transition-all duration-slow ease-smooth'
        )}
        style={{ width: collapsed ? 64 : 256 }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-[35] p-2 glass rounded-md-dp text-dp-text-secondary hover:text-dp-text-primary transition-colors"
        aria-label={vi.sidebar.openSidebar}
      >
        <Menu size={20} />
      </button>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 bg-black/60 z-[39]"
              onClick={() => setMobileOpen(false)}
            />
            {/* Slide-in sidebar */}
            <motion.aside
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ duration: 0.3, ease: EASE_SMOOTH }}
              className="lg:hidden fixed left-0 top-0 h-screen w-64 z-[40] glass-sidebar"
            >
              {/* Close button */}
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-3 p-1.5 rounded-md-dp text-dp-text-muted hover:text-dp-text-primary hover:bg-dp-glass-hover transition-colors"
                aria-label={vi.sidebar.closeSidebar}
              >
                <X size={18} />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── NavLink Sub-component ──────────────────────────────────────────────────

function NavLink({
  item,
  collapsed,
  active,
}: {
  item: NavItem;
  collapsed: boolean;
  active: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link
      to={item.path}
      title={collapsed ? item.label : undefined}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg-dp text-sm font-medium transition-all duration-base relative',
        collapsed && 'justify-center px-0',
        active
          ? 'bg-dp-glass-bg text-dp-primary'
          : 'text-dp-text-muted hover:text-dp-text-secondary hover:bg-dp-glass-hover'
      )}
    >
      {/* Active left border accent */}
      {active && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-dp-primary"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
      <Icon size={18} className="shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
}
