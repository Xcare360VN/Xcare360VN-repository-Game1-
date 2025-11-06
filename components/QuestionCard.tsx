
import React from 'react';
import { Question } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';

interface QuestionCardProps {
  question: Question | null;
  onAnswer: (option: string) => void;
  isLoading: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onAnswer, isLoading }) => {
  if (isLoading) {
    return (
       <Card>
        <div className="animate-pulse">
            <div className="h-6 bg-slate-700/50 rounded w-full mb-6"></div>
            <div className="h-6 bg-slate-700/50 rounded w-5/6 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-12 bg-slate-700/50 rounded-full"></div>
                <div className="h-12 bg-slate-700/50 rounded-full"></div>
            </div>
        </div>
      </Card>
    );
  }
  
  if (!question) return null;

  return (
    <Card>
      <p className="text-center text-xl md:text-2xl font-medium text-white mb-8">{question.text}</p>
      <div className={`grid grid-cols-1 ${question.options.length > 2 ? 'md:grid-cols-2' : 'sm:grid-cols-2'} gap-4`}>
        {question.options.map(option => (
          <Button key={option} onClick={() => onAnswer(option)}>
            {option}
          </Button>
        ))}
      </div>
    </Card>
  );
};

export default QuestionCard;
