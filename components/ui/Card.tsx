import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-black/20 backdrop-blur-lg border border-white/20 rounded-2xl shadow-lg p-6 md:p-8 ${className}`}>
      {children}
    </div>
  );
};

export default Card;