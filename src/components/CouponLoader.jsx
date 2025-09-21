import React from 'react';

const CouponLoader = ({ 
  size = "medium", 
  text = "Loading...", 
  variant = "primary", 
  className = '' 
}) => {
  // Size configurations
  const sizeConfig = {
    small: { px: 32, textSize: 'text-sm' },
    medium: { px: 48, textSize: 'text-base' },
    large: { px: 64, textSize: 'text-lg' }
  };

  // Variant color configurations
  const variantConfig = {
    primary: '#3B82F6',    // Blue
    success: '#10B981',    // Green
    warning: '#F59E0B',    // Amber
    danger: '#EF4444',     // Red
    secondary: '#6B7280'   // Gray
  };

  const currentSize = sizeConfig[size] || sizeConfig.medium;
  const currentColor = variantConfig[variant] || variantConfig.primary;

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Loader Animation */}
      <div 
        className="inline-block relative mb-4"
        style={{ width: currentSize.px, height: currentSize.px }}
      >
        <div className="loader-element"></div>
      </div>
      
      {/* Loading Text */}
      {text && (
        <p className={`${currentSize.textSize} font-medium text-gray-700 animate-pulse`}>
          {text}
        </p>
      )}
      
      <style jsx>{`
        .loader-element::after,
        .loader-element::before {
          content: '';
          box-sizing: border-box;
          width: ${currentSize.px}px;
          height: ${currentSize.px}px;
          border-radius: 50%;
          border: 2px solid ${currentColor};
          position: absolute;
          left: 0;
          top: 0;
          animation: animloader 2s linear infinite;
        }
        
        .loader-element::after {
          animation-delay: 1s;
        }
        
        @keyframes animloader {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default CouponLoader;