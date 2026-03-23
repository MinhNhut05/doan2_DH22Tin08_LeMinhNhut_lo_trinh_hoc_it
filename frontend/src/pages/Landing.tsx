import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  Brain,
  Code,
  Gamepad2,
  Bot,
  ChevronDown,
  Github,
  ArrowRight,
} from 'lucide-react';
import { vi } from '../strings/vi';

// ─── Animation Variants ───────────────────────────────────────────────────────

const EASE_SMOOTH = [0.16, 1, 0.3, 1] as const;

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: EASE_SMOOTH },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

// ─── useCountUp Hook ──────────────────────────────────────────────────────────

function useCountUp(target: number, inView: boolean, duration = 2000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const startTime = performance.now();

    function step(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      start = Math.floor(eased * target);
      setCount(start);
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }, [inView, target, duration]);

  return count;
}

// ─── Feature Data ─────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Brain,
    title: vi.landing.featurePersonalizedTitle,
    desc: vi.landing.featurePersonalizedDesc,
  },
  {
    icon: Code,
    title: vi.landing.featureLiveCodeTitle,
    desc: vi.landing.featureLiveCodeDesc,
  },
  {
    icon: Gamepad2,
    title: vi.landing.featureGamificationTitle,
    desc: vi.landing.featureGamificationDesc,
  },
  {
    icon: Bot,
    title: vi.landing.featureAiMentorTitle,
    desc: vi.landing.featureAiMentorDesc,
  },
];

const STATS = [
  { value: 1200, suffix: '+', label: vi.landing.statsLearners },
  { value: 50, suffix: '+', label: vi.landing.statsPaths },
  { value: 500, suffix: '+', label: vi.landing.statsLessons },
  { value: 98, suffix: '%', label: vi.landing.statsSatisfaction },
];

const TESTIMONIALS = [
  {
    name: 'Minh Tuan',
    role: vi.landing.testimonials.minhTuanRole,
    review: vi.landing.testimonials.minhTuanReview,
    color: 'from-dp-primary to-dp-secondary',
  },
  {
    name: 'Thanh Ha',
    role: vi.landing.testimonials.thanhHaRole,
    review: vi.landing.testimonials.thanhHaReview,
    color: 'from-dp-secondary to-dp-accent',
  },
  {
    name: 'Duc Anh',
    role: vi.landing.testimonials.ducAnhRole,
    review: vi.landing.testimonials.ducAnhReview,
    color: 'from-dp-accent to-dp-primary',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// LANDING PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function Landing() {
  return (
    <div className="min-h-screen bg-dp-deep overflow-hidden">
      <HeroSection />
      <FeaturesSection />
      <StatsSection />
      <TestimonialsSection />
      <FooterSection />
    </div>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4">
      {/* Glow blobs */}
      <div className="glow-blob glow-blob-purple w-[500px] h-[500px] -top-20 -left-20 animate-float" />
      <div className="glow-blob glow-blob-blue w-[400px] h-[400px] -bottom-20 -right-20 animate-float" style={{ animationDelay: '3s' }} />

      <motion.div
        className="relative z-10 text-center max-w-3xl mx-auto"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          custom={0}
          variants={fadeInUp}
          className="text-display gradient-text mb-6"
        >
          {vi.landing.heroTitle}
        </motion.h1>

        <motion.p
          custom={1}
          variants={fadeInUp}
          className="text-body-lg text-dp-text-secondary mb-10 max-w-xl mx-auto"
        >
          {vi.landing.heroDesc}
        </motion.p>

        <motion.div
          custom={2}
          variants={fadeInUp}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/login" className="btn-primary h-12 px-8 text-base">
            {vi.landing.ctaStart}
            <ArrowRight size={18} />
          </Link>
          <Link to="/explore" className="btn-secondary h-12 px-8 text-base">
            {vi.landing.ctaExplore}
          </Link>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          custom={3}
          variants={fadeInUp}
          className="mt-20"
        >
          <ChevronDown size={24} className="mx-auto text-dp-text-ghost animate-bounce" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── Features Section (Bento Grid) ────────────────────────────────────────────

function FeaturesSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-h1 gradient-text text-center mb-14"
        >
          {vi.landing.whyTitle}
        </motion.h2>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          {FEATURES.map((feat, i) => (
            <motion.div
              key={feat.title}
              custom={i}
              variants={fadeInUp}
              className="bento-card group"
            >
              <div className="w-12 h-12 rounded-xl-dp bg-dp-primary-muted flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-slow">
                <feat.icon size={24} className="text-dp-primary" />
              </div>
              <h3 className="text-h4 text-dp-text-primary mb-2">{feat.title}</h3>
              <p className="text-body-sm text-dp-text-secondary">{feat.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Stats Section ────────────────────────────────────────────────────────────

function StatsSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <section ref={ref} className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="glass rounded-2xl-dp p-8 md:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <StatItem key={stat.label} stat={stat} inView={inView} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatItem({ stat, inView }: { stat: typeof STATS[number]; inView: boolean }) {
  const count = useCountUp(stat.value, inView);

  return (
    <div className="text-center">
      <p className="text-h1 gradient-text font-bold tabular-nums">
        {count.toLocaleString()}{stat.suffix}
      </p>
      <p className="text-body-sm text-dp-text-secondary mt-1">{stat.label}</p>
    </div>
  );
}

// ─── Testimonials Section ─────────────────────────────────────────────────────

function TestimonialsSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-h1 gradient-text text-center mb-14"
        >
          {vi.landing.testimonialsTitle}
        </motion.h2>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              custom={i}
              variants={fadeInUp}
              className="glass glass-hover rounded-xl-dp p-6"
            >
              {/* Avatar */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-sm`}>
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-dp-text-primary">{t.name}</p>
                  <p className="text-caption text-dp-text-muted">{t.role}</p>
                </div>
              </div>
              <p className="text-body-sm text-dp-text-secondary leading-relaxed">"{t.review}"</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Footer Section ───────────────────────────────────────────────────────────

function FooterSection() {
  return (
    <footer className="bg-dp-base border-t border-dp-border-subtle py-10 px-4">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md-dp bg-gradient-to-br from-dp-primary to-dp-secondary flex items-center justify-center text-white font-bold text-xs">
            D
          </div>
          <span className="font-semibold gradient-text">DevPath</span>
        </div>

        <p className="text-caption text-dp-text-ghost">
          {vi.landing.copyright}
        </p>

        <div className="flex items-center gap-4">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-dp-text-muted hover:text-dp-text-secondary transition-colors"
          >
            <Github size={18} />
          </a>
          <a
            href="https://discord.gg"
            target="_blank"
            rel="noopener noreferrer"
            className="text-dp-text-muted hover:text-dp-text-secondary transition-colors"
          >
            {/* Discord icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
