import React from 'react';
import { MdVerified } from 'react-icons/md';

/**
 * VerificationBadge Component
 * Instagram-style verification badge for verified stores
 *
 * @param {string} size - Size variant: 'sm', 'md', 'lg' (default: 'md')
 * @param {string} color - Color variant: 'blue', 'white', 'gray' (default: 'blue')
 * @param {string} className - Additional CSS classes
 */
const VerificationBadge = ({ size = 'md', color = 'blue', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 text-[10px]',
    md: 'w-5 h-5 text-xs',
    lg: 'w-6 h-6 text-sm',
    xl: 'w-8 h-8 text-base'
  };

  const colorClasses = {
    blue: 'text-blue-500 dark:text-blue-400',
    white: 'text-white',
    gray: 'text-gray-300 dark:text-gray-400'
  };

  return (
    <div
      className={`${sizeClasses[size]} ${className}`}
      title="Verified Store"
    >
      <MdVerified
        className={`w-full h-full ${colorClasses[color]} drop-shadow-md`}
      />
    </div>
  );
};

export default VerificationBadge;
