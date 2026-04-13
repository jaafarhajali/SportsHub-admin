import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  activeColor?: string;
  inactiveColor?: string;
}

const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  size = 'md',
  className = '',
  activeColor = 'bg-green-500',
  inactiveColor = 'bg-red-500 dark:bg-red-500',
}) => {
  // Size configurations
  const sizeClasses = {
    sm: {
      toggle: 'w-8 h-4',
      circle: 'w-3 h-3',
      translateX: 'translate-x-4',
    },
    md: {
      toggle: 'w-10 h-5',
      circle: 'w-4 h-4',
      translateX: 'translate-x-5',
    },
    lg: {
      toggle: 'w-14 h-7',
      circle: 'w-6 h-6',
      translateX: 'translate-x-7',
    },
  };

  const { toggle, circle, translateX } = sizeClasses[size];

  return (
    <label className={`flex items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      {label && (
        <span className="mr-3 text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </span>
      )}
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          disabled={disabled}
          onChange={() => !disabled && onChange(!checked)}
        />
        <div
          className={`${toggle} ${
            checked ? activeColor : inactiveColor
          } rounded-full transition-colors duration-200`}
        ></div>
        <div
          className={`absolute left-0.5 top-0.5 ${circle} bg-white rounded-full shadow transform transition-transform duration-200 ${
            checked ? translateX : 'translate-x-0'
          }`}
        ></div>
      </div>
    </label>
  );
};

export default Toggle;