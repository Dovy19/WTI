'use client';

import { motion } from 'framer-motion';

interface FadeInTextProps {
  text: string;
  delay?: number;
  duration?: number;
  className?: string;
  size?: 'small' | 'medium' | 'large' | 'xl';
}

export default function FadeInText({ 
  text, 
  delay = 0, 
  duration = 0.8, 
  className = "",
  size = 'large'
}: FadeInTextProps) {
  const sizeClasses = {
    small: 'text-2xl',
    medium: 'text-3xl',
    large: 'text-5xl',
    xl: 'text-6xl'
  };

  return (
    <motion.h1
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, duration }}
      className={`font-bold text-white text-center ${sizeClasses[size]} ${className}`}
    >
      {text}
    </motion.h1>
  );
}