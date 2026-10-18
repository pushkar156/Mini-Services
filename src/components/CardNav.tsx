'use client';

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode
} from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowUpRight01Icon } from '@hugeicons/core-free-icons';

export interface CardNavLink {
  label: string;
  href?: string;
  ariaLabel?: string;
  isActive?: boolean;
}

export interface CardNavItem {
  label: string;
  description?: string;
  bgColor?: string;
  textColor?: string;
  links?: CardNavLink[];
}

export interface CardNavCta {
  label: string;
  href?: string;
  onClick?: (event: ReactMouseEvent<HTMLElement>) => void;
}

export interface CardNavProps {
  logo?: string | ReactNode;
  logoAlt?: string;
  logoHref?: string;
  items?: CardNavItem[];
  cta?: CardNavCta;
  theme?: 'dark' | 'light';
  surface?: 'glass' | 'solid';
  openOn?: 'click' | 'hover';
  cardEffect?: 'rise' | 'unfold' | 'fade';
  stagger?: number;
  bounce?: number;
  speed?: number;
  barHeight?: number;
  cardHeight?: number;
  maxWidth?: number;
  fullWidth?: boolean;
  radius?: number;
  inset?: number;
  accentColor?: string;
  menuLabel?: boolean;
  openLabel?: string;
  closeLabel?: string;
  intro?: boolean;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  linkComponent?: ElementType;
  onLinkClick?: (link: CardNavLink, item: CardNavItem, event: ReactMouseEvent<HTMLElement>) => void;
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

interface AnchorProps {
  className: string;
  'aria-label'?: string;
  tabIndex?: number;
  onClick?: (event: ReactMouseEvent<HTMLElement>) => void;
}

const THEMES: Record<string, Record<string, string>> = {
  dark: {
    '--cn-panel': 'rgba(18, 20, 24, 0.88)',
    '--cn-solid': '#121418',
    '--cn-edge': 'rgba(255, 255, 255, 0.1)',
    '--cn-highlight': 'rgba(255, 255, 255, 0.12)',
    '--cn-shadow': '0 24px 48px -20px rgba(0, 0, 0, 0.9), 0 6px 16px -8px rgba(0, 0, 0, 0.7)',
    '--cn-text': '#edeae5',
    '--cn-muted': '#969087',
    '--cn-hover': 'rgba(255, 255, 255, 0.08)',
    '--cn-ring': '#c89b6d',
    '--cn-tile': 'linear-gradient(180deg, #1f2024 0%, #17181c 100%)',
    '--cn-tile-rim':
      'inset 0 0 0 1px rgba(255, 255, 255, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 4px 10px -4px rgba(0, 0, 0, 0.6)',
    '--cn-cta': 'linear-gradient(180deg, #e3e2e5 0%, #cdc6bb 100%)',
    '--cn-cta-ink': '#0e0f12',
    '--cn-cta-shadow': 'inset 0 1px 0 rgba(255, 255, 255, 0.9), 0 6px 16px -6px rgba(0, 0, 0, 0.6)',
    '--cn-cta-hover': 'brightness(0.92)'
  },
  light: {
    '--cn-panel': 'rgba(247, 246, 242, 0.94)',
    '--cn-solid': '#f7f6f2',
    '--cn-edge': 'rgba(26, 26, 28, 0.15)',
    '--cn-highlight': 'rgba(255, 255, 255, 0.95)',
    '--cn-shadow': '0 24px 48px -24px rgba(26, 26, 28, 0.25), 0 6px 16px -10px rgba(26, 26, 28, 0.15)',
    '--cn-text': '#141416',
    '--cn-muted': '#4a4b4f',
    '--cn-hover': 'rgba(26, 26, 28, 0.07)',
    '--cn-ring': '#9e642d',
    '--cn-tile': 'linear-gradient(180deg, #ffffff 0%, #f0eee6 100%)',
    '--cn-tile-rim':
      'inset 0 0 0 1px rgba(26, 26, 28, 0.12), inset 0 1px 0 rgba(255, 255, 255, 1), 0 4px 10px -5px rgba(26, 26, 28, 0.18)',
    '--cn-cta': 'linear-gradient(180deg, #252629 0%, #141416 100%)',
    '--cn-cta-ink': '#ffffff',
    '--cn-cta-shadow': 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 6px 14px -6px rgba(26, 26, 28, 0.4)',
    '--cn-cta-hover': 'brightness(1.2)'
  }
};

const ROOT =
  'group/cn relative mx-auto h-[var(--cn-bar)] w-full max-w-[var(--cn-max)] text-[14px] leading-[1.4] [-webkit-tap-highlight-color:transparent] z-50';
const PANEL =
  'absolute inset-x-0 top-0 z-50 h-[var(--cn-bar)] overflow-hidden rounded-[var(--cn-radius)] [background:var(--cn-panel)] [box-shadow:var(--cn-shadow)] [-webkit-backdrop-filter:var(--cn-blur)] [backdrop-filter:var(--cn-blur)]';
const RIM =
  'pointer-events-none absolute inset-0 z-[3] rounded-[inherit] [box-shadow:inset_0_0_0_1px_var(--cn-edge),inset_0_1px_0_var(--cn-highlight)]';
const BAR =
  'relative z-[2] box-border flex h-[var(--cn-bar)] items-center justify-between px-[var(--cn-inset)]';
const MENU =
  'inline-flex h-[calc(var(--cn-bar)_-_var(--cn-inset)*2)] cursor-pointer items-center gap-[9px] rounded-[calc(var(--cn-radius)_-_var(--cn-inset))] border border-white/10 dark:border-white/10 light:border-black/10 px-[12px] bg-white/[0.04] dark:bg-white/[0.04] font-mono text-[11px] uppercase tracking-wider font-semibold text-[var(--cn-text)] outline-none transition-all duration-200 ease-[ease] hover:bg-white/[0.08] hover:border-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cn-ring)] data-[icon-only]:w-[calc(var(--cn-bar)_-_var(--cn-inset)*2)] data-[icon-only]:justify-center data-[icon-only]:p-0';
const BURGER = 'relative h-[12px] w-[18px]';
const LINE_TOP =
  'absolute left-0 top-[2.25px] h-[1.5px] w-full rounded-[2px] bg-current transition-[top,rotate] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[open]/cn:top-[5.25px] group-data-[open]/cn:rotate-45 motion-reduce:transition-none';
const LINE_BOTTOM =
  'absolute left-0 top-[8.25px] h-[1.5px] w-full rounded-[2px] bg-current transition-[top,rotate] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[open]/cn:top-[5.25px] group-data-[open]/cn:-rotate-45 motion-reduce:transition-none';
const MENU_LABEL = 'relative inline-grid overflow-hidden';
const WORD_OPEN =
  '[grid-area:1/1] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[open]/cn:-translate-y-[110%] motion-reduce:transition-none';
const WORD_CLOSE =
  '[grid-area:1/1] translate-y-[110%] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[open]/cn:translate-y-0 motion-reduce:transition-none';
const LOGO =
  'inline-flex items-center text-[var(--cn-text)] no-underline outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cn-ring)]';
const CTA =
  'inline-flex h-[calc(var(--cn-bar)_-_var(--cn-inset)*2)] justify-self-end cursor-pointer items-center justify-center whitespace-nowrap rounded-[calc(var(--cn-radius)_-_var(--cn-inset))] border-0 px-[16px] [background:var(--cn-cta)] [box-shadow:var(--cn-cta-shadow)] [font-family:inherit] [font-size:inherit] font-semibold text-[var(--cn-cta-ink)] no-underline outline-none transition-[filter] duration-200 ease-[ease] hover:[filter:var(--cn-cta-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cn-ring)]';
const CTA_WIDE =
  'flex h-[44px] w-full cursor-pointer items-center justify-center whitespace-nowrap rounded-[calc(var(--cn-radius)_-_var(--cn-inset))] border-0 px-[16px] [background:var(--cn-cta)] [box-shadow:var(--cn-cta-shadow)] [font-family:inherit] [font-size:inherit] font-semibold text-[var(--cn-cta-ink)] no-underline outline-none transition-[filter] duration-200 ease-[ease] hover:[filter:var(--cn-cta-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cn-ring)]';
const CONTENT =
  'invisible absolute inset-x-0 top-[var(--cn-bar)] box-border flex flex-col gap-[var(--cn-gap)] px-[var(--cn-inset)] pb-[var(--cn-inset)] [perspective:900px] group-data-[shown]/cn:visible';
const CARDS = 'flex gap-[var(--cn-gap)] group-data-[narrow]/cn:flex-col';
const CARD =
  'group/card relative box-border flex min-h-[var(--cn-card)] min-w-0 flex-[1_1_0] origin-top flex-col gap-[18px] rounded-[calc(var(--cn-radius)_-_var(--cn-inset))] px-[16px] pb-[14px] pt-[16px] [background:var(--cn-tile)] [box-shadow:var(--cn-tile-rim)] text-[var(--cn-text)] will-change-[transform,opacity] data-[tinted]:[box-shadow:inset_0_1px_0_rgba(255,255,255,0.16),0_4px_10px_-4px_rgba(0,0,0,0.45)] group-data-[narrow]/cn:min-h-0 group-data-[narrow]/cn:flex-none group-data-[narrow]/cn:gap-[10px] group-data-[narrow]/cn:px-[14px] group-data-[narrow]/cn:pb-[12px] group-data-[narrow]/cn:pt-[14px]';
const CARD_HEAD = 'flex flex-col gap-[4px]';
const LABEL = 'text-[15px] sm:text-[16px] font-sans font-bold tracking-tight text-[var(--cn-text)]';
const DESCRIPTION =
  'm-0 text-[12px] font-sans leading-[1.4] text-[var(--cn-muted)] group-data-[tinted]/card:text-inherit group-data-[tinted]/card:opacity-75';
const LINKS =
  'm-0 mt-auto flex list-none flex-col gap-[3px] p-0 group-data-[narrow]/cn:flex-row group-data-[narrow]/cn:flex-wrap group-data-[narrow]/cn:gap-x-[16px] group-data-[narrow]/cn:gap-y-[3px]';
const LINK =
  'group/link inline-flex cursor-pointer items-center gap-[8px] rounded-[6px] border-0 px-0 py-[2.5px] [background:none] font-mono text-[11px] sm:text-[12px] uppercase tracking-wider text-inherit no-underline opacity-[0.85] outline-none transition-all duration-200 ease-[ease] hover:opacity-100 hover:text-[var(--cn-ring)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cn-ring)]';
const ARROW = 'relative inline-block h-[14px] w-[14px] flex-none overflow-hidden';
const ARROW_OUT =
  'absolute inset-0 h-full w-full transition-transform duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/link:translate-x-[110%] group-hover/link:-translate-y-[110%] group-focus-visible/link:translate-x-[110%] group-focus-visible/link:-translate-y-[110%] motion-reduce:transition-none';
const ARROW_IN =
  'absolute inset-0 h-full w-full -translate-x-[110%] translate-y-[110%] transition-transform duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/link:translate-x-0 group-hover/link:translate-y-0 group-focus-visible/link:translate-x-0 group-focus-visible/link:translate-y-0 motion-reduce:transition-none';

const DEFAULT_ITEMS: CardNavItem[] = [
  {
    label: 'About',
    description: 'The people and the story behind the studio.',
    links: [
      { label: 'Company', href: '#' },
      { label: 'Careers', href: '#' }
    ]
  },
  {
    label: 'Projects',
    description: 'Selected work from the last few years.',
    links: [
      { label: 'Featured', href: '#' },
      { label: 'Case studies', href: '#' }
    ]
  },
  {
    label: 'Contact',
    description: 'Say hello, we read everything.',
    links: [
      { label: 'Email', href: '#' },
      { label: 'X', href: '#' },
      { label: 'LinkedIn', href: '#' }
    ]
  }
];

const NARROW = 560;
const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const easeOut = (t: number) => 1 - (1 - t) ** 3;

const contrastInk = (color?: string): string | null => {
  const hex = String(color || '')
    .trim()
    .replace('#', '');
  if (!/^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) return null;
  const full =
    hex.length === 3
      ? hex
          .split('')
          .map(c => c + c)
          .join('')
      : hex;
  const channel = (index: number) => {
    const value = parseInt(full.slice(index, index + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  const luminance = 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
  return luminance > 0.36 ? '#121016' : '#ffffff';
};

const CardNav = ({
  logo,
  logoAlt = 'Logo',
  logoHref = '#',
  items = DEFAULT_ITEMS,
  cta,
  theme = 'dark',
  surface = 'glass',
  openOn = 'click',
  cardEffect = 'rise',
  stagger = 0.12,
  bounce = 0.2,
  speed = 1,
  barHeight = 60,
  cardHeight = 176,
  maxWidth = 800,
  fullWidth = false,
  radius = 18,
  inset = 8,
  accentColor,
  menuLabel = true,
  openLabel = 'Menu',
  closeLabel = 'Close',
  intro = true,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  linkComponent: LinkComponent = 'a',
  onLinkClick,
  ariaLabel = 'Main',
  className = '',
  style,
  children
}: CardNavProps) => {
  const contentId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const engineRef = useRef<{ wake: () => void; refresh: () => void } | null>(null);
  const leaveRef = useRef(0);
  const barRef = useRef<HTMLDivElement>(null);
  const introRef = useRef(intro);
  const [openState, setOpenState] = useState(defaultOpen);
  const [narrow, setNarrow] = useState(false);
  const [shown, setShown] = useState(defaultOpen);

  const controlled = openProp !== undefined;
  const hasCta = Boolean(cta);
  const open = controlled ? openProp : openState;

  const settings = {
    open,
    cardEffect,
    stagger: clamp(stagger, 0, 0.3),
    bounce: clamp(bounce, 0, 1),
    speed: clamp(speed, 0.2, 3)
  };
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const palette = THEMES[theme] ?? THEMES.dark;
  const vars: Record<string, string> = {
    ...palette,
    '--cn-max': fullWidth ? '100%' : `${maxWidth}px`,
    '--cn-bar': `${barHeight}px`,
    '--cn-inset': `${inset}px`,
    '--cn-gap': '8px',
    '--cn-radius': `${radius}px`,
    '--cn-logo': '24px',
    '--cn-card': `${cardHeight}px`
  };
  if (surface === 'glass') vars['--cn-blur'] = 'blur(20px) saturate(1.6)';
  if (surface === 'solid') {
    vars['--cn-panel'] = palette['--cn-solid'];
    vars['--cn-blur'] = 'none';
  }
  if (accentColor) {
    vars['--cn-cta'] = accentColor;
    vars['--cn-cta-ink'] = contrastInk(accentColor) || '#ffffff';
    vars['--cn-cta-shadow'] = 'inset 0 1px 0 rgba(255, 255, 255, 0.22), 0 6px 16px -6px rgba(0, 0, 0, 0.45)';
    vars['--cn-cta-hover'] = 'brightness(1.08)';
  }

  const setOpen = (next: boolean) => {
    if (next === open) return;
    if (!controlled) setOpenState(next);
    onOpenChange?.(next);
  };
  const setOpenRef = useRef(setOpen);
  setOpenRef.current = setOpen;

  useEffect(() => {
    const panel = panelRef.current;
    const content = contentRef.current;
    if (!panel || !content) return undefined;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const state = { p: settingsRef.current.open ? 1 : 0, v: 0, height: content.offsetHeight, bar: 60 };
    let raf = 0;
    let last = 0;

    const render = () => {
      const s = settingsRef.current;
      state.bar = parseFloat(getComputedStyle(panel).getPropertyValue('--cn-bar')) || 60;
      panel.style.height = `${state.bar + Math.max(0, state.p) * state.height}px`;
      const cards = cardRefs.current.filter((card): card is HTMLDivElement => card !== null);
      const count = cards.length;
      const lag = count > 1 ? Math.min(s.stagger, 0.7 / (count - 1)) : 0;
      const span = 1 - lag * (count - 1);
      cards.forEach((card, index) => {
        const local = clamp((state.p - index * lag) / Math.max(span, 0.05), 0, 1);
        const e = easeOut(local);
        if (s.cardEffect === 'unfold') {
          card.style.transform = `translateY(${(1 - e) * -10}px) rotateX(${(1 - e) * -72}deg)`;
          card.style.opacity = `${clamp(local * 1.8, 0, 1)}`;
          card.style.filter = '';
        } else if (s.cardEffect === 'fade') {
          card.style.transform = `translateY(${(1 - e) * 6}px)`;
          card.style.opacity = `${e}`;
          card.style.filter = e < 0.999 ? `blur(${(1 - e) * 6}px)` : '';
        } else {
          card.style.transform = `translateY(${(1 - e) * 26}px) scale(${0.97 + 0.03 * e})`;
          card.style.opacity = `${e}`;
          card.style.filter = '';
        }
      });
    };

    const tick = (now: number) => {
      raf = 0;
      const s = settingsRef.current;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;
      const target = s.open ? 1 : 0;
      if (reduce) {
        state.p = target;
        state.v = 0;
      } else {
        const k = 160 * s.speed * s.speed;
        const zeta = s.open ? 1 - 0.68 * s.bounce : 1;
        const steps = Math.ceil(dt / (1 / 240));
        const h = dt / steps;
        for (let i = 0; i < steps; i++) {
          state.v += (-k * (state.p - target) - 2 * zeta * Math.sqrt(k) * state.v) * h;
          state.p += state.v * h;
        }
      }
      const done = Math.abs(state.p - target) < 0.0005 && Math.abs(state.v) < 0.002;
      if (done) {
        state.p = target;
        state.v = 0;
      }
      render();
      if (done && target === 0) setShown(false);
      if (!done) raf = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (!raf) {
        last = 0;
        raf = requestAnimationFrame(tick);
      }
    };

    engineRef.current = {
      wake,
      refresh: () => {
        state.height = content.offsetHeight;
        render();
      }
    };

    render();
    const observer = new ResizeObserver(() => {
      state.height = content.offsetHeight;
      render();
    });
    observer.observe(content);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      engineRef.current = null;
    };
  }, [items.length, hasCta, narrow]);

  useLayoutEffect(() => {
    if (open) setShown(true);
    engineRef.current?.refresh();
    engineRef.current?.wake();
  }, [open]);

  useEffect(() => {
    engineRef.current?.refresh();
  });

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const measure = () => setNarrow(root.offsetWidth < NARROW);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && rootRef.current?.contains(target)) return;
      setOpenRef.current(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpenRef.current(false);
      menuRef.current?.focus();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  useEffect(() => () => window.clearTimeout(leaveRef.current), []);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    const bar = barRef.current;
    if (!panel || !bar || !introRef.current) return;
    introRef.current = false;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const width = panel.offsetWidth;
    const height = panel.offsetHeight;
    const radius = parseFloat(getComputedStyle(panel).borderTopLeftRadius) || 18;
    const anim = panel.animate(
      [
        { clipPath: `inset(0px ${Math.max(0, (width - height) / 2)}px round ${height / 2}px)`, opacity: 0 },
        { clipPath: `inset(0px 0px round ${radius}px)`, opacity: 1 }
      ],
      { duration: 820, easing: EASE_OUT, fill: 'backwards' }
    );
    anim.onfinish = () => {
      panel.style.clipPath = '';
    };
    Array.from(bar.children).forEach((child, index) => {
      child.animate(
        [
          { opacity: 0, transform: 'translateY(8px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ],
        { duration: 560, delay: 220 + index * 70, easing: EASE_OUT, fill: 'backwards' }
      );
    });
  }, []);

  const hover = openOn === 'hover';

  const onPointerEnter = (event: ReactPointerEvent) => {
    if (!hover || event.pointerType === 'touch') return;
    window.clearTimeout(leaveRef.current);
    setOpen(true);
  };

  const onPointerLeave = (event: ReactPointerEvent) => {
    if (!hover || event.pointerType === 'touch') return;
    window.clearTimeout(leaveRef.current);
    leaveRef.current = window.setTimeout(() => setOpenRef.current(false), 160);
  };

  const anchor = (target: CardNavLink | CardNavCta, props: AnchorProps, children: ReactNode) => {
    if (!target.href) {
      return (
        <button type="button" {...props}>
          {children}
        </button>
      );
    }
    return (
      <LinkComponent href={target.href} {...props}>
        {children}
      </LinkComponent>
    );
  };

  const ctaButton = (target: CardNavCta, wide: boolean) =>
    anchor(
      target,
      {
        className: wide ? CTA_WIDE : CTA,
        tabIndex: wide && !open ? -1 : undefined,
        onClick: event => {
          target.onClick?.(event);
          if (wide) setOpen(false);
        }
      },
      target.label
    );

  return (
    <div
      ref={rootRef}
      className={[ROOT, className].filter(Boolean).join(' ')}
      data-open={open ? '' : undefined}
      data-shown={shown || open ? '' : undefined}
      data-narrow={narrow ? '' : undefined}
      style={{ ...vars, ...style } as CSSProperties}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <nav ref={panelRef} className={PANEL} aria-label={ariaLabel}>
        <div ref={barRef} className={BAR}>
          <div className="flex items-center gap-2 sm:gap-3">
            {logo && (
              <LinkComponent href={logoHref} className={LOGO} aria-label={logoAlt}>
                {typeof logo === 'string' ? <img src={logo} alt="" draggable={false} /> : logo}
              </LinkComponent>
            )}

            <button
              ref={menuRef}
              type="button"
              className={MENU}
              data-icon-only={menuLabel ? undefined : ''}
              aria-expanded={open}
              aria-controls={contentId}
              aria-label={menuLabel ? undefined : open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen(!open)}
            >
              <span className={BURGER} aria-hidden="true">
                <span className={LINE_TOP} />
                <span className={LINE_BOTTOM} />
              </span>
              {menuLabel && (
                <span className={MENU_LABEL}>
                  <span className={WORD_OPEN} aria-hidden={open}>
                    {openLabel}
                  </span>
                  <span className={WORD_CLOSE} aria-hidden={!open}>
                    {closeLabel}
                  </span>
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center justify-self-end gap-1.5 sm:gap-2">
            {children}
            {cta && !narrow && ctaButton(cta, false)}
          </div>
        </div>

        <div ref={contentRef} id={contentId} className={CONTENT} aria-hidden={!open}>
          <div className={CARDS}>
            {items.map((item, index) => (
              <div
                key={`${item.label}-${index}`}
                ref={element => {
                  cardRefs.current[index] = element;
                }}
                className={CARD}
                data-tinted={item.bgColor ? '' : undefined}
                style={item.bgColor ? { background: item.bgColor, color: item.textColor } : undefined}
              >
                <div className={CARD_HEAD}>
                  <span className={LABEL}>{item.label}</span>
                  {item.description && <p className={DESCRIPTION}>{item.description}</p>}
                </div>
                <ul className={LINKS}>
                  {(item.links ?? []).map((link, linkIndex) => (
                    <li key={`${link.label}-${linkIndex}`}>
                      {anchor(
                        link,
                        {
                          className: LINK,
                          'aria-label': link.ariaLabel,
                          tabIndex: open ? undefined : -1,
                          onClick: event => {
                            onLinkClick?.(link, item, event);
                            setOpen(false);
                          }
                        },
                        <>
                          <span className={ARROW} aria-hidden="true">
                            <HugeiconsIcon className={ARROW_OUT} icon={ArrowUpRight01Icon} size={14} strokeWidth={2} />
                            <HugeiconsIcon className={ARROW_IN} icon={ArrowUpRight01Icon} size={14} strokeWidth={2} />
                          </span>
                          <span className={link.isActive ? 'font-bold text-[var(--cn-ring)] underline underline-offset-4' : ''}>
                            {link.label}
                          </span>
                          {link.isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--cn-ring)] ml-1" />
                          )}
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          {cta && narrow && (
            <div
              ref={element => {
                cardRefs.current[items.length] = element;
              }}
            >
              {ctaButton(cta, true)}
            </div>
          )}
        </div>
        <span className={RIM} />
      </nav>
    </div>
  );
};

export default CardNav;
