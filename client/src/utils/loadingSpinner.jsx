import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ size = 'md', color = 'text-indigo-500', thickness = 4, className = '', message }) => {
  // Define spinner sizes
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  // Spinner variants for Framer Motion
  const spinnerVariants = {
    animate: {
      rotate: 360,
      transition: {
        repeat: Infinity,
        duration: 1,
        ease: "linear",
      },
    },
  };

  // Optional: Message animation
  const messageVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, delay: 0.5 } },
  };

  return (
    <div
      className={`flex flex-col items-center justify-center p-4 ${className}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <motion.div
        className={`relative ${sizeClasses[size]}`}
        variants={spinnerVariants}
        initial={{ rotate: 0 }}
        animate="animate"
      >
        <svg className="absolute inset-0" viewBox="0 0 50 50">
          <circle
            className={`opacity-25 ${color}`}
            cx="25"
            cy="25"
            r="20"
            stroke="currentColor"
            strokeWidth={thickness}
            fill="none"
          ></circle>
          <motion.circle
            className={`${color}`}
            cx="25"
            cy="25"
            r="20"
            stroke="currentColor"
            strokeWidth={thickness}
            fill="none"
            strokeDasharray="80, 160" // Controls the visible part of the circle
            strokeLinecap="round"
            initial={{ strokeDashoffset: 160 }}
            animate={{
              strokeDashoffset: 40, // Animates the dash offset to create the "moving" effect
              transition: {
                repeat: Infinity,
                duration: 1,
                ease: "linear",
              },
            }}
          ></motion.circle>
        </svg>
      </motion.div>

      {message && (
        <motion.p
          className={`mt-4 text-gray-600 text-center ${size === 'sm' ? 'text-sm' : 'text-base'}`}
          variants={messageVariants}
          initial="hidden"
          animate="visible"
        >
          {message}
        </motion.p>
      )}
    </div>
  );
};

export default LoadingSpinner;