import React from 'react';
import htm from 'htm';
import Card from './ui/Card.js';
import Button from './ui/Button.js';
import ShuffleIcon from './icons/ShuffleIcon.js';

const html = htm.bind(React.createElement);

const TopicCard = ({ topic, onNewTopic, isLoading }) => {
  return html`
    <${Card} className="text-center">
      <h2 className="text-sm font-bold uppercase tracking-widest text-cyan-300 mb-2">
         ${topic?.id === 'random' ? 'Chế độ chơi' : 'Chủ đề trong ngày'}
      </h2>
      ${isLoading && !topic ? html`
        <div className="animate-pulse">
            <div className="h-8 bg-slate-700/50 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-4 bg-slate-700/50 rounded w-full mx-auto"></div>
            <div className="h-4 bg-slate-700/50 rounded w-5/6 mx-auto mt-2"></div>
        </div>
      ` : topic ? html`
        <>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">${topic.name}</h1>
          <p className="text-cyan-100/80 mb-6">${topic.description}</p>
        </>
      ` : html`
        <p className="text-cyan-100/80">Chưa có chủ đề nào được chọn.</p>
      `}
      <${Button} onClick=${onNewTopic} disabled=${isLoading} variant="secondary" className="inline-flex items-center gap-2">
        <${ShuffleIcon} className="w-5 h-5" />
        Chọn chủ đề khác
      </>
    </>
  `;
};

export default TopicCard;
