'use client';

import * as React from 'react';
import { Sparkles, PartyPopper, Trophy, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ConfettiProps {
  active?: boolean;
  duration?: number;
  particleCount?: number;
  colors?: string[];
  onComplete?: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  size: number;
  opacity: number;
}

export function Confetti({
  active = false,
  duration = 3000,
  particleCount = 100,
  colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'],
  onComplete,
}: ConfettiProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const particlesRef = React.useRef<Particle[]>([]);
  const animationRef = React.useRef<number>();
  const startTimeRef = React.useRef<number>(0);

  React.useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create particles
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 3 + 2,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      opacity: 1,
    }));

    startTimeRef.current = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;

      if (elapsed > duration) {
        onComplete?.();
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.rotation += particle.rotationSpeed;
        particle.vy += 0.1; // Gravity

        // Fade out in last 500ms
        if (elapsed > duration - 500) {
          particle.opacity = Math.max(0, 1 - (elapsed - (duration - 500)) / 500);
        }

        // Draw particle
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate((particle.rotation * Math.PI) / 180);
        ctx.globalAlpha = particle.opacity;
        ctx.fillStyle = particle.color;
        ctx.fillRect(
          -particle.size / 2,
          -particle.size / 2,
          particle.size,
          particle.size
        );
        ctx.restore();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [active, duration, particleCount, colors, onComplete]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
    />
  );
}

// Celebration trigger component
export function CelebrationTrigger({
  onTrigger,
  children,
  className,
}: {
  onTrigger?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  const [showConfetti, setShowConfetti] = React.useState(false);

  const handleClick = () => {
    setShowConfetti(true);
    onTrigger?.();
  };

  return (
    <>
      <button onClick={handleClick} className={className}>
        {children}
      </button>
      <Confetti
        active={showConfetti}
        onComplete={() => setShowConfetti(false)}
      />
    </>
  );
}

// Success celebration with message
export function SuccessCelebration({
  show,
  title,
  message,
  onClose,
  className,
}: {
  show: boolean;
  title: string;
  message?: string;
  onClose?: () => void;
  className?: string;
}) {
  React.useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose?.();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <>
      <Confetti active={show} />
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div
          className={cn(
            'bg-card border shadow-2xl rounded-2xl p-8 text-center max-w-md animate-in zoom-in-95 duration-500',
            className
          )}
        >
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
              <Trophy className="h-10 w-10 text-green-500" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-2">{title}</h2>
          {message && (
            <p className="text-muted-foreground">{message}</p>
          )}
        </div>
      </div>
    </>
  );
}

// Airdrop eligibility celebration
export function AirdropEligibilityCelebration({
  show,
  projectName,
  score,
  onClose,
}: {
  show: boolean;
  projectName: string;
  score: number;
  onClose?: () => void;
}) {
  return (
    <SuccessCelebration
      show={show}
      title={`${projectName} Eligible! 🎉`}
      message={`Your eligibility score: ${score}/100`}
      onClose={onClose}
    />
  );
}

// Achievement unlocked animation
export function AchievementUnlocked({
  show,
  achievement,
  icon,
  onClose,
}: {
  show: boolean;
  achievement: {
    title: string;
    description: string;
    points?: number;
  };
  icon?: React.ReactNode;
  onClose?: () => void;
}) {
  React.useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose?.();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-5 duration-500">
      <div className="bg-card border shadow-xl rounded-lg p-4 min-w-[300px]">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
              {icon || <Trophy className="h-6 w-6 text-yellow-500" />}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <span className="text-xs font-semibold text-yellow-500">
                ACHIEVEMENT UNLOCKED
              </span>
            </div>
            <h4 className="font-bold mb-1">{achievement.title}</h4>
            <p className="text-sm text-muted-foreground">
              {achievement.description}
            </p>
            {achievement.points && (
              <div className="mt-2">
                <span className="text-xs font-semibold text-primary">
                  +{achievement.points} points
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Sparkle effect overlay
export function SparkleEffect({
  show,
  intensity = 'medium',
  className,
}: {
  show: boolean;
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
}) {
  const sparkleCount = {
    low: 20,
    medium: 40,
    high: 60,
  }[intensity];

  if (!show) return null;

  return (
    <div className={cn('fixed inset-0 pointer-events-none z-40', className)}>
      {Array.from({ length: sparkleCount }).map((_, i) => (
        <div
          key={i}
          className="absolute animate-ping"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${1 + Math.random()}s`,
          }}
        >
          <Star
            className="h-4 w-4 text-yellow-400 fill-yellow-400"
            style={{ opacity: Math.random() * 0.7 + 0.3 }}
          />
        </div>
      ))}
    </div>
  );
}

// Fireworks effect
export function FireworksEffect({
  show,
  duration = 5000,
  className,
}: {
  show: boolean;
  duration?: number;
  className?: string;
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    if (!show) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const fireworks: any[] = [];
    const startTime = Date.now();

    const createFirework = () => {
      const x = Math.random() * canvas.width;
      const y = canvas.height;
      const targetY = Math.random() * canvas.height * 0.5;
      const color = `hsl(${Math.random() * 360}, 100%, 60%)`;

      fireworks.push({
        x,
        y,
        targetY,
        color,
        particles: [],
        exploded: false,
        vy: -8,
      });
    };

    const animate = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed > duration) return;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Create new fireworks randomly
      if (Math.random() < 0.03) {
        createFirework();
      }

      fireworks.forEach((firework, index) => {
        if (!firework.exploded) {
          firework.y += firework.vy;
          firework.vy += 0.1;

          ctx.beginPath();
          ctx.arc(firework.x, firework.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = firework.color;
          ctx.fill();

          if (firework.y <= firework.targetY) {
            firework.exploded = true;
            // Create explosion particles
            for (let i = 0; i < 50; i++) {
              const angle = (Math.PI * 2 * i) / 50;
              firework.particles.push({
                x: firework.x,
                y: firework.y,
                vx: Math.cos(angle) * (2 + Math.random() * 2),
                vy: Math.sin(angle) * (2 + Math.random() * 2),
                life: 1,
              });
            }
          }
        } else {
          let allDead = true;
          firework.particles.forEach((particle: any) => {
            if (particle.life > 0) {
              allDead = false;
              particle.x += particle.vx;
              particle.y += particle.vy;
              particle.vy += 0.1;
              particle.life -= 0.01;

              ctx.beginPath();
              ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
              ctx.fillStyle = firework.color;
              ctx.globalAlpha = particle.life;
              ctx.fill();
              ctx.globalAlpha = 1;
            }
          });

          if (allDead) {
            fireworks.splice(index, 1);
          }
        }
      });

      requestAnimationFrame(animate);
    };

    animate();
  }, [show, duration]);

  if (!show) return null;

  return (
    <canvas
      ref={canvasRef}
      className={cn('fixed inset-0 pointer-events-none z-50', className)}
    />
  );
}

// Party popper button
export function PartyPopperButton({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const [showEffect, setShowEffect] = React.useState(false);

  const handleClick = () => {
    setShowEffect(true);
    onClick?.();
  };

  return (
    <>
      <button onClick={handleClick} className={className}>
        <PartyPopper className="mr-2 h-4 w-4" />
        {children}
      </button>
      <Confetti
        active={showEffect}
        duration={2000}
        onComplete={() => setShowEffect(false)}
      />
    </>
  );
}

// Milestone celebration
export function MilestoneCelebration({
  show,
  milestone,
  onClose,
}: {
  show: boolean;
  milestone: {
    title: string;
    value: number;
    unit: string;
  };
  onClose?: () => void;
}) {
  return (
    <>
      <Confetti active={show} />
      <FireworksEffect show={show} />
      <SuccessCelebration
        show={show}
        title={`🎊 ${milestone.title}!`}
        message={`${milestone.value} ${milestone.unit}`}
        onClose={onClose}
      />
    </>
  );
}

