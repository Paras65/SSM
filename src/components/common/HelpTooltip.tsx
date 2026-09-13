import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, Info } from 'lucide-react';

interface HelpTooltipProps {
  content: string;
  title?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  variant?: 'info' | 'help' | 'warning';
  className?: string;
  size?: 'sm' | 'md';
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  content,
  title,
  position = 'top',
  variant = 'help',
  className = '',
  size = 'sm'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click (mobile support)
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isVisible]);

  // Position classes
  const getPositionClasses = () => {
    switch (position) {
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-2';
      case 'top':
      default:
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
    }
  };

  const getArrowClasses = () => {
    switch (position) {
      case 'bottom':
        return 'bottom-full left-1/2 -translate-x-1/2 border-b-stone-900 border-x-transparent border-t-transparent';
      case 'left':
        return 'left-full top-1/2 -translate-y-1/2 border-l-stone-900 border-y-transparent border-r-transparent';
      case 'right':
        return 'right-full top-1/2 -translate-y-1/2 border-r-stone-900 border-y-transparent border-l-transparent';
      case 'top':
      default:
        return 'top-full left-1/2 -translate-x-1/2 border-t-stone-900 border-x-transparent border-b-transparent';
    }
  };

  const iconColor =
    variant === 'warning'
      ? 'text-amber-500 hover:text-amber-600'
      : variant === 'info'
      ? 'text-cyan-600 hover:text-cyan-700'
      : 'text-stone-400 hover:text-amber-600';

  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center align-middle ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsVisible((prev) => !prev);
        }}
        className={`p-0.5 rounded-full transition-colors focus:outline-hidden focus:ring-1 focus:ring-amber-500 cursor-help ${iconColor}`}
        aria-label={title || 'सहायता जानकारी'}
        aria-expanded={isVisible}
      >
        {variant === 'info' ? (
          <Info className={iconSize} />
        ) : (
          <HelpCircle className={iconSize} />
        )}
      </button>

      {isVisible && (
        <div
          role="tooltip"
          className={`absolute z-60 w-64 p-3 bg-stone-900 text-white text-xs rounded-2xl shadow-xl border border-stone-800 pointer-events-none animate-in fade-in zoom-in-95 duration-150 ${getPositionClasses()}`}
        >
          {/* Arrow */}
          <div className={`absolute w-0 h-0 border-4 ${getArrowClasses()}`} />

          {title && (
            <div className="font-bold text-amber-400 mb-1 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <span>💡</span>
              <span>{title}</span>
            </div>
          )}
          <p className="text-stone-200 leading-relaxed text-[11px] font-medium whitespace-normal">
            {content}
          </p>
        </div>
      )}
    </div>
  );
};

export default HelpTooltip;

