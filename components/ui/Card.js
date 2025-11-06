import React from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

const Card = ({ children, className = '' }) => {
  return html`
    <div className=${`bg-black/20 backdrop-blur-lg border border-white/20 rounded-2xl shadow-lg p-6 md:p-8 ${className}`}>
      ${children}
    </div>
  `;
};

export default Card;