
import React, { useState } from 'react';
import { Question } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import ShareIcon from './icons/ShareIcon';

interface ResultsCardProps {
  question: Question;
  selectedOption: string;
  onNextQuestion: () => void;
}

const ResultsCard: React.FC<ResultsCardProps> = ({ question, selectedOption, onNextQuestion }) => {
  const [isCopied, setIsCopied] = useState(false);
  const totalVotes = Object.values(question.stats).reduce<number>((sum, count) => sum + Number(count), 0);

  const handleShare = async () => {
    const shareData = {
      title: 'Có Bao Nhiêu Người Giống Bạn?',
      text: `Tôi vừa trả lời câu hỏi: "${question.text}". Hãy xem bạn có nghĩ giống tôi không!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        console.log('Chia sẻ thành công!');
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
      }
    } catch (error) {
      console.error('Lỗi khi chia sẻ:', error);
      // Fallback for browsers that might fail clipboard write
       alert("Không thể chia sẻ. Vui lòng sao chép link từ thanh địa chỉ.");
    }
  };

  return (
    <Card className="animate-fade-in">
      <h3 className="text-2xl font-bold text-center text-white mb-2">Kết quả</h3>
      <p className="text-center text-cyan-200/90 mb-6 italic">"{question.text}"</p>
      
      <div className="space-y-4 mb-8">
        {question.options.map(option => {
          const votes = question.stats[option] || 0;
          const percentage = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(0) : '0';
          const isSelected = option === selectedOption;

          return (
            <div key={option} className={`p-4 rounded-lg border-2 ${isSelected ? 'bg-cyan-500/30 border-cyan-400' : 'bg-white/10 border-transparent'}`}>
              <div className="flex justify-between items-center mb-1 text-white">
                <span className={`font-bold ${isSelected ? 'text-cyan-200' : ''}`}>{option} {isSelected && '(Lựa chọn của bạn)'}</span>
                <span className="font-mono">{percentage}%</span>
              </div>
              <div className="w-full bg-black/20 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full ${isSelected ? 'bg-cyan-400' : 'bg-cyan-400'}`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button onClick={handleShare} variant="secondary" className="inline-flex items-center gap-2 w-full sm:w-auto">
            <ShareIcon className="w-5 h-5" />
            {isCopied ? 'Đã sao chép!' : 'Chia sẻ'}
        </Button>
        <Button onClick={onNextQuestion} className="w-full sm:w-auto">
          Câu hỏi tiếp theo →
        </Button>
      </div>
    </Card>
  );
};

export default ResultsCard;
