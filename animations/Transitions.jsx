/**
 * @fileoverview Smooth Animations & Transitions with Framer Motion
 * @description Enhanced animation components for Financial $hift
 * Phase B - Task B2: Advanced animations with spring physics and micro-interactions
 */

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Spring physics presets for consistent animations
 */
const springPresets = {
  // Gentle spring for subtle animations
  gentle: {
    type: 'spring',
    stiffness: 120,
    damping: 14,
    mass: 0.5,
  },
  // Bouncy spring for playful interactions
  bouncy: {
    type: 'spring',
    stiffness: 260,
    damping: 20,
    mass: 1,
  },
  // Snappy spring for quick interactions
  snappy: {
    type: 'spring',
    stiffness: 400,
    damping: 30,
    mass: 0.8,
  },
  // Smooth tween for linear animations
  smooth: {
    type: 'tween',
    duration: 0.3,
    ease: [0.4, 0, 0.2, 1], // cubic-bezier ease-out
  },
};

/**
 * Enhanced AnimatedCard with hover and tap interactions
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.hover=true] - Enable hover effects
 * @param {boolean} [props.tap=true] - Enable tap/click effects
 * @param {boolean} [props.lift=true] - Enable lift effect on hover
 * @param {string} [props.spring='gentle'] - Spring preset (gentle/bouncy/snappy/smooth)
 * @param {Function} [props.onClick] - Click handler
 * @param {Object} [props.style] - Additional inline styles
 * 
 * @example
 * <AnimatedCard hover lift onClick={handleClick}>
 *   <CardContent />
 * </AnimatedCard>
 */
export function AnimatedCard({
  children,
  className,
  hover = true,
  tap = true,
  lift = true,
  spring = 'gentle',
  onClick,
  style,
  ...props
}) {
  return (
    <motion.div
      className={cn(
        'rounded-lg border bg-card text-card-foreground shadow-sm',
        'will-change-transform', // Hardware acceleration
        className
      )}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={
        hover
          ? {
              scale: lift ? 1.02 : 1,
              y: lift ? -4 : 0,
              boxShadow: lift
                ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                : undefined,
            }
          : undefined
      }
      whileTap={tap ? { scale: 0.98 } : undefined}
      transition={springPresets[spring]}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * FadeIn animation wrapper with customizable delay and direction
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to animate
 * @param {string} [props.className] - Additional CSS classes
 * @param {number} [props.delay=0] - Delay before animation starts (seconds)
 * @param {number} [props.duration=0.5] - Animation duration (seconds)
 * @param {string} [props.direction='up'] - Fade direction (up/down/left/right/none)
 * @param {number} [props.distance=20] - Distance to move (pixels)
 * 
 * @example
 * <FadeIn delay={0.2} direction="up">
 *   <Content />
 * </FadeIn>
 */
export function FadeIn({
  children,
  className,
  delay = 0,
  duration = 0.5,
  direction = 'up',
  distance = 20,
  ...props
}) {
  const directionOffset = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
    none: {},
  };

  return (
    <motion.div
      className={cn('will-change-transform', className)}
      initial={{ opacity: 0, ...directionOffset[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, ...directionOffset[direction] }}
      transition={{
        duration,
        delay,
        ease: [0.4, 0, 0.2, 1],
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * SlideIn animation with configurable direction and spring physics
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to animate
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.direction='left'] - Slide direction (left/right/up/down)
 * @param {number} [props.distance=100] - Slide distance (percentage)
 * @param {number} [props.delay=0] - Delay before animation starts (seconds)
 * @param {string} [props.spring='snappy'] - Spring preset
 * 
 * @example
 * <SlideIn direction="right" spring="bouncy">
 *   <Sidebar />
 * </SlideIn>
 */
export function SlideIn({
  children,
  className,
  direction = 'left',
  distance = 100,
  delay = 0,
  spring = 'snappy',
  ...props
}) {
  const directionOffset = {
    left: { x: `-${distance}%` },
    right: { x: `${distance}%` },
    up: { y: `-${distance}%` },
    down: { y: `${distance}%` },
  };

  return (
    <motion.div
      className={cn('will-change-transform', className)}
      initial={{ opacity: 0, ...directionOffset[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, ...directionOffset[direction] }}
      transition={{
        ...springPresets[spring],
        delay,
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * ScaleIn animation with smooth entrance effect
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to animate
 * @param {string} [props.className] - Additional CSS classes
 * @param {number} [props.delay=0] - Delay before animation starts (seconds)
 * @param {number} [props.initialScale=0.8] - Initial scale (0-1)
 * @param {string} [props.spring='gentle'] - Spring preset
 * 
 * @example
 * <ScaleIn initialScale={0.9} spring="bouncy">
 *   <Modal />
 * </ScaleIn>
 */
export function ScaleIn({
  children,
  className,
  delay = 0,
  initialScale = 0.8,
  spring = 'gentle',
  ...props
}) {
  return (
    <motion.div
      className={cn('will-change-transform', className)}
      initial={{ opacity: 0, scale: initialScale }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: initialScale }}
      transition={{
        ...springPresets[spring],
        delay,
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Staggered children animation container
 * Animates children one after another with configurable delay
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Children to stagger
 * @param {string} [props.className] - Additional CSS classes
 * @param {number} [props.staggerDelay=0.1] - Delay between children (seconds)
 * @param {string} [props.direction='up'] - Animation direction
 * 
 * @example
 * <StaggerContainer staggerDelay={0.05}>
 *   <Card />
 *   <Card />
 *   <Card />
 * </StaggerContainer>
 */
export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.1,
  direction = 'up',
  ...props
}) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };

  const directionOffset = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 },
  };

  const itemVariants = {
    hidden: { opacity: 0, ...directionOffset[direction] },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: springPresets.gentle,
    },
  };

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      {...props}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

/**
 * Bouncy button with micro-interactions
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Button content
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.disabled] - Disabled state
 * @param {Function} [props.onClick] - Click handler
 * @param {string} [props.variant='default'] - Button variant
 * 
 * @example
 * <BouncyButton onClick={handleClick}>
 *   Click Me
 * </BouncyButton>
 */
export function BouncyButton({
  children,
  className,
  disabled = false,
  onClick,
  variant = 'default',
  ...props
}) {
  return (
    <motion.button
      className={cn(
        'inline-flex items-center justify-center rounded-md px-4 py-2',
        'font-medium transition-colors focus-visible:outline-none',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        'will-change-transform',
        {
          'bg-primary text-primary-foreground hover:bg-primary/90':
            variant === 'default',
          'bg-secondary text-secondary-foreground hover:bg-secondary/80':
            variant === 'secondary',
          'bg-destructive text-destructive-foreground hover:bg-destructive/90':
            variant === 'destructive',
        },
        className
      )}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      transition={springPresets.bouncy}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.button>
  );
}

/**
 * Enhanced PageTransition with spring physics
 * Replaces basic PageTransition from LoadingStates.jsx with advanced animations
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Page content
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.transition='fade'] - Transition type (fade/slide/scale/slideScale)
 * @param {string} [props.direction='up'] - Direction for slide transitions
 * @param {string} [props.spring='snappy'] - Spring preset
 * 
 * @example
 * <EnhancedPageTransition transition="slideScale" spring="bouncy">
 *   <Dashboard />
 * </EnhancedPageTransition>
 */
export function EnhancedPageTransition({
  children,
  className,
  transition = 'fade',
  direction = 'up',
  spring = 'snappy',
  ...props
}) {
  const transitions = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    slide: {
      initial: {
        opacity: 0,
        x: direction === 'left' ? -50 : direction === 'right' ? 50 : 0,
        y: direction === 'up' ? 50 : direction === 'down' ? -50 : 0,
      },
      animate: { opacity: 1, x: 0, y: 0 },
      exit: {
        opacity: 0,
        x: direction === 'left' ? 50 : direction === 'right' ? -50 : 0,
        y: direction === 'up' ? -50 : direction === 'down' ? 50 : 0,
      },
    },
    scale: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
    },
    slideScale: {
      initial: {
        opacity: 0,
        scale: 0.95,
        y: direction === 'up' ? 20 : -20,
      },
      animate: { opacity: 1, scale: 1, y: 0 },
      exit: {
        opacity: 0,
        scale: 0.95,
        y: direction === 'up' ? -20 : 20,
      },
    },
  };

  return (
    <motion.div
      className={cn('will-change-transform', className)}
      initial={transitions[transition].initial}
      animate={transitions[transition].animate}
      exit={transitions[transition].exit}
      transition={springPresets[spring]}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Hover glow effect with smooth color transition
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.color='primary'] - Glow color
 * @param {number} [props.intensity=0.5] - Glow intensity (0-1)
 * 
 * @example
 * <HoverGlow color="emerald" intensity={0.7}>
 *   <Card />
 * </HoverGlow>
 */
export function HoverGlow({
  children,
  className,
  color = 'primary',
  intensity = 0.5,
  ...props
}) {
  const glowColors = {
    primary: `rgba(var(--primary-rgb, 0, 0, 0), ${intensity})`,
    emerald: `rgba(16, 185, 129, ${intensity})`,
    blue: `rgba(59, 130, 246, ${intensity})`,
    purple: `rgba(168, 85, 247, ${intensity})`,
    orange: `rgba(249, 115, 22, ${intensity})`,
  };

  return (
    <motion.div
      className={cn('relative will-change-transform', className)}
      whileHover={{
        boxShadow: `0 0 20px ${glowColors[color] || glowColors.primary}`,
      }}
      transition={springPresets.smooth}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Number counter animation with spring physics
 * 
 * @component
 * @param {Object} props - Component props
 * @param {number} props.value - Target value
 * @param {string} [props.className] - Additional CSS classes
 * @param {number} [props.duration=1] - Animation duration (seconds)
 * @param {string} [props.prefix=''] - Prefix (e.g., '$')
 * @param {string} [props.suffix=''] - Suffix (e.g., '%')
 * @param {number} [props.decimals=0] - Decimal places
 * 
 * @example
 * <CountUp value={1234.56} prefix="$" decimals={2} />
 */
export function CountUp({
  value,
  className,
  duration = 1,
  prefix = '',
  suffix = '',
  decimals = 0,
  ...props
}) {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      {...props}
    >
      <motion.span
        initial={{ innerText: 0 }}
        animate={{ innerText: value }}
        transition={{ duration, ease: 'easeOut' }}
        onUpdate={(latest) => {
          if (props.onUpdate) {
            const formatted = latest.innerText.toFixed(decimals);
            props.onUpdate(`${prefix}${formatted}${suffix}`);
          }
        }}
      >
        {prefix}
        {value.toFixed(decimals)}
        {suffix}
      </motion.span>
    </motion.span>
  );
}

/**
 * Pulse animation for notifications/badges
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.pulse=true] - Enable pulse animation
 * 
 * @example
 * <PulseEffect>
 *   <NotificationBadge count={5} />
 * </PulseEffect>
 */
export function PulseEffect({ children, className, pulse = true, ...props }) {
  return (
    <motion.div
      className={cn('relative', className)}
      animate={
        pulse
          ? {
              scale: [1, 1.05, 1],
              opacity: [1, 0.8, 1],
            }
          : {}
      }
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Shake animation for errors or attention
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.shake] - Trigger shake
 * 
 * @example
 * <ShakeEffect shake={hasError}>
 *   <Input />
 * </ShakeEffect>
 */
export function ShakeEffect({ children, className, shake, ...props }) {
  return (
    <motion.div
      className={className}
      animate={
        shake
          ? {
              x: [0, -10, 10, -10, 10, 0],
            }
          : {}
      }
      transition={{ duration: 0.4 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export default {
  AnimatedCard,
  FadeIn,
  SlideIn,
  ScaleIn,
  StaggerContainer,
  BouncyButton,
  EnhancedPageTransition,
  HoverGlow,
  CountUp,
  PulseEffect,
  ShakeEffect,
  springPresets,
};
