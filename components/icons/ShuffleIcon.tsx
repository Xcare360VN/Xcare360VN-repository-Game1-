
import React from 'react';

const ShuffleIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19 11H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6m13-14v4m-4-4l4 4m-4 11v4m-4-4l4 4"
    />
  </svg>
);

export default ShuffleIcon;
