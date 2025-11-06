import React from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseClasses = 'font-bold py-3 px-6 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4';

  const variantClasses = {
    primary: 'bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg focus:ring-cyan-300',
    secondary: 'bg-white/20 hover:bg-white/30 text-white focus:ring-white/50'
  };

  return html`
    <button className=${`${baseClasses} ${variantClasses[variant]} ${className}`} ...${props}>
      ${children}
    </button>
  `;
};

export default Button;
