import { useState, useEffect } from 'react';

type ProgressBarSize = 'small' | 'medium' | 'large';
type ProgressBarVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error';

interface ProgressBarProps {
  progress?: number;
  showPercentage?: boolean;
  animated?: boolean;
  size?: ProgressBarSize;
  label?: string;
  variant?: ProgressBarVariant;
}

const ProgressBar = ({ 
  progress = 0, 
  showPercentage = true, 
  animated = true, 
  size = 'medium',
  label = '',
  variant = 'primary'
}: ProgressBarProps) => {
  const [displayProgress, setDisplayProgress] = useState(0);

  // Smooth animation effect
  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setDisplayProgress(progress);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setDisplayProgress(progress);
    }
  }, [progress, animated]);

  const progressBarStyles = {
    'small': {
      height: 'var(--space-2)',
    },
    'medium': {
      height: 'var(--space-3)',
    },
    'large': {
      height: 'var(--space-4)',
    }
  };

  const variantStyles = {
    'primary': {
      backgroundColor: 'var(--color-accent-primary)',
      boxShadow: '0 0 var(--space-4) rgba(124, 58, 237, 0.3)',
    },
    'secondary': {
      backgroundColor: 'var(--color-accent-secondary)',
      boxShadow: '0 0 var(--space-4) rgba(6, 182, 212, 0.3)',
    },
    'success': {
      backgroundColor: 'var(--color-success)',
      boxShadow: '0 0 var(--space-4) rgba(16, 185, 129, 0.3)',
    },
    'warning': {
      backgroundColor: 'var(--color-warning)',
      boxShadow: '0 0 var(--space-4) rgba(245, 158, 11, 0.3)',
    },
    'error': {
      backgroundColor: 'var(--color-error)',
      boxShadow: '0 0 var(--space-4) rgba(239, 68, 68, 0.3)',
    }
  };

  return (
    <div className="w-full">
      {/* Label and Percentage */}
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-4">
          {label && (
            <span className="text-sm font-medium text-secondary">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="text-sm font-medium text-secondary">
              {Math.round(displayProgress)}%
            </span>
          )}
        </div>
      )}
      
      {/* Progress Bar Container */}
      <div 
        className="w-full border-subtle rounded-lg"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          ...progressBarStyles[size]
        }}
      >
        {/* Progress Fill */}
        <div
          style={{
            width: `${Math.max(0, Math.min(100, displayProgress))}%`,
            height: '100%',
            borderRadius: 'var(--radius-lg)',
            transition: animated ? 'all var(--transition-slow)' : 'none',
            position: 'relative',
            overflow: 'hidden',
            ...variantStyles[variant]
          }}
        >
          {/* Animated shine effect */}
          {animated && displayProgress > 0 && (
            <div 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                transform: 'skewX(-12deg)',
                animation: 'shine 2s infinite',
              }}
            />
          )}
        </div>
      </div>

      <style>{`
        @keyframes shine {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
      `}</style>
    </div>
  );
};

export default ProgressBar;