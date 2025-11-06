import React from 'react';
import htm from 'htm';
import Card from './ui/Card.js';
import Button from './ui/Button.js';

const html = htm.bind(React.createElement);

const QuestionCard = ({ question, onAnswer, isLoading }) => {
  if (isLoading) {
    return html`
       <${Card}>
        <div className="animate-pulse">
            <div className="h-6 bg-slate-700/50 rounded w-full mb-6"></div>
            <div className="h-6 bg-slate-700/50 rounded w-5/6 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-12 bg-slate-700/50 rounded-full"></div>
                <div className="h-12 bg-slate-700/50 rounded-full"></div>
            </div>
        </div>
      </>
    `;
  }
  
  if (!question) return null;

  return html`
    <${Card}>
      <p className="text-center text-xl md:text-2xl font-medium text-white mb-8">${question.text}</p>
      <div className=${`grid grid-cols-1 ${question.options.length > 2 ? 'md:grid-cols-2' : 'sm:grid-cols-2'} gap-4`}>
        ${question.options.map(option => html`
          <${Button} key=${option} onClick=${() => onAnswer(option)}>
            ${option}
          </>
        `)}
      </div>
    </>
  `;
};

export default QuestionCard;
