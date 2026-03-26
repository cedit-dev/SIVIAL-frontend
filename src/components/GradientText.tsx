import { ReactNode } from 'react';

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  colors?: string[];
  animationSpeed?: number;
  showBorder?: boolean;
  direction?: 'horizontal' | 'vertical' | 'diagonal';
  pauseOnHover?: boolean;
  yoyo?: boolean;
}

export default function GradientText({
  children,
  className = '',
  colors = ['#5227FF', '#FF9FFC', '#B19EEF'],
  animationSpeed = 8,
  showBorder = false,
}: GradientTextProps) {
  const gradientColors = [...colors, colors[0]].join(', ');

  return (
    <span
      className={`inline-block text-transparent bg-clip-text ${showBorder ? 'py-1 px-2' : ''} ${className}`}
      style={{
        backgroundImage: `linear-gradient(to right, ${gradientColors})`,
        backgroundSize: '300% 100%',
        WebkitBackgroundClip: 'text',
        animation: `gradient-shift ${animationSpeed}s ease infinite alternate`,
      }}
    >
      {children}
    </span>
  );
}

