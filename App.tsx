import React, { useState, useEffect, useCallback } from 'react';
import htm from 'htm';
import { Topic, Question, Sponsor } from './types.js';
import { getTopics, getQuestionsForTopic, getAllQuestions, getSponsors, submitAnswer } from './services/gameService.js';
import TopicCard from './components/TopicCard.js';
import QuestionCard from './components/QuestionCard.js';
import ResultsCard from './components/ResultsCard.js';
import SponsorBanner from './components/SponsorBanner.js';
import SponsorContentCard from './components/SponsorContentCard.js';
import Button from './components/ui/Button.js';
import ShareIcon from './components/icons/ShareIcon.js';
import ShuffleIcon from './components/icons/ShuffleIcon.js';
import Card from './components/ui/Card.js';

const html = htm.bind(React.createElement);

const shuffleArray = (array) => {
  return array.map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
};

const RANDOM_TOPIC = {
  id: 'random',
  name: 'Ngẫu nhiên',
  description: 'Các câu hỏi được trộn từ tất cả các chủ đề.'
};

const App = () => {
  const [activeSponsor, setActiveSponsor] = useState(null);
  const [allTopics, setAllTopics] = useState([]);
  const [currentTopic, setCurrentTopic] = useState(null);
  const [questionBank, setQuestionBank] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answeredQuestion, setAnsweredQuestion] = useState(null);
  const [gameState, setGameState] = useState('loading');
  const [error, setError] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  
  // Tải dữ liệu ban đầu: danh sách chủ đề và nhà tài trợ
  useEffect(() => {
    const loadInitialData = async () => {
      setError(null);
      try {
        const [topics, sponsors] = await Promise.all([getTopics(), getSponsors()]);
        setAllTopics(topics);
        setActiveSponsor(sponsors.find(s => s.isActive) || null);
        setGameState('selection');
      } catch (e) {
        console.error("Không thể tải dữ liệu ban đầu:", e);
        const errorMessage = e instanceof Error ? e.message : 'Lỗi tải dữ liệu. Vui lòng làm mới trang.';
        setError(errorMessage);
        setGameState('finished');
      }
    };
    loadInitialData();
  }, []);

  const handleSelectTopic = useCallback(async (topic) => {
    setGameState('loading');
    setError(null);
    try {
      const questions = await getQuestionsForTopic(topic.id);
      if (questions.length === 0) {
        throw new Error(`Chủ đề "${topic.name}" hiện chưa có câu hỏi nào.`);
      }
      setQuestionBank(shuffleArray(questions));
      setCurrentQuestion(questions[0]);
      setCurrentTopic(topic);
      setGameState('playing');
    } catch (e) {
      console.error(`Lỗi khi chọn chủ đề ${topic.id}:`, e);
      setError(e instanceof Error ? e.message : 'Không thể tải câu hỏi cho chủ đề này.');
      setGameState('selection');
    }
  }, []);

  const handleSelectRandomMix = useCallback(async () => {
    setGameState('loading');
    setError(null);
    try {
      const questions = await getAllQuestions(allTopics);
      if (questions.length === 0) {
        throw new Error("Không có câu hỏi nào trong tất cả các chủ đề.");
      }
      const shuffled = shuffleArray(questions);
      setQuestionBank(shuffled);
      setCurrentQuestion(shuffled[0]);
      setCurrentTopic(RANDOM_TOPIC);
      setGameState('playing');
    } catch (e) {
      console.error('Lỗi khi trộn câu hỏi:', e);
      setError(e instanceof Error ? e.message : 'Không thể tải câu hỏi để trộn.');
      setGameState('selection');
    }
  }, [allTopics]);

  const handleNewGame = () => {
    setGameState('selection');
    setError(null);
    setAnsweredQuestion(null);
    setCurrentTopic(null);
    setCurrentQuestion(null);
    setQuestionBank([]);
  };

  const handleNextQuestion = () => {
    setAnsweredQuestion(null);
    const currentIndex = questionBank.findIndex(q => q.id === currentQuestion?.id);
    const nextIndex = currentIndex + 1;

    if (nextIndex < questionBank.length) {
      setCurrentQuestion(questionBank[nextIndex]);
      setGameState('playing');
    } else {
      setGameState('finished');
      setError("Chúc mừng! Bạn đã hoàn thành tất cả câu hỏi. Hãy chia sẻ với bạn bè để xem họ nghĩ gì nhé!");
      setCurrentQuestion(null);
    }
  };

  const handleAnswer = (option) => {
    if (currentQuestion && currentTopic) {
      const originalTopicId = allTopics.find(t => t.name === currentTopic.name)?.id || 'random';
      submitAnswer(originalTopicId, currentQuestion.id, option);

      const updatedQuestion = { ...currentQuestion };
      setAnsweredQuestion({ question: updatedQuestion, selectedOption: option });
      setCurrentQuestion(updatedQuestion);
      setGameState('results');
    }
  };
  
  const handleShareGame = async () => {
    const shareData = {
      title: 'Có Bao Nhiêu Người Giống Bạn?',
      text: `Hãy chơi thử game này và xem bạn thuộc nhóm người nào nhé!`,
      url: window.location.href,
    };
    try {
      await navigator.share(shareData);
    } catch (error) {
      await navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const renderContent = () => {
    switch (gameState) {
      case 'loading':
        return html`
          <${Card} className="text-center p-12">
            <div className="flex justify-center items-center">
              <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="mt-4 text-cyan-200">Đang tải dữ liệu...</p>
          </>
        `;
      case 'selection':
        return html`
          <${Card}>
            <h2 className="text-2xl font-bold text-center mb-6 text-white">Chọn chế độ chơi</h2>
            ${error && html`<p className="text-center text-red-400 mb-4">${error}</p>`}
            <div className="space-y-4">
              <button onClick=${handleSelectRandomMix} className="w-full text-left p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="bg-cyan-500 p-3 rounded-md">
                    <${ShuffleIcon} className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">${RANDOM_TOPIC.name}</h3>
                    <p className="text-sm text-cyan-200/80">${RANDOM_TOPIC.description}</p>
                  </div>
                </div>
              </button>
              ${allTopics.map(topic => html`
                <button key=${topic.id} onClick=${() => handleSelectTopic(topic)} className="w-full text-left p-4 bg-black/20 rounded-lg hover:bg-black/30 transition-colors">
                  <h3 className="font-bold text-lg text-cyan-300">${topic.name}</h3>
                  <p className="text-sm text-cyan-100/80">${topic.description}</p>
                </button>
              `)}
            </div>
          </>
        `;
      case 'playing':
      case 'results':
      case 'finished':
        return html`
          <div className="space-y-6">
            <${TopicCard} topic=${currentTopic} onNewTopic=${handleNewGame} isLoading=${false} />
            ${gameState === 'playing' && html`<${QuestionCard} question=${currentQuestion} onAnswer=${handleAnswer} isLoading=${false} />`}
            ${gameState === 'results' && answeredQuestion && html`
              <${ResultsCard} 
                question=${answeredQuestion.question} 
                selectedOption=${answeredQuestion.selectedOption} 
                onNextQuestion=${handleNextQuestion}
              />
            `}
            ${gameState === 'finished' && html`
              <div className="text-center py-10 bg-black/10 rounded-2xl p-6">
                <p className="text-lg text-cyan-300 mb-6 font-semibold">${error || 'Đã có lỗi xảy ra.'}</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <${Button} onClick=${handleShareGame} variant="secondary" className="inline-flex items-center gap-2 w-full sm:w-auto">
                      <${ShareIcon} className="w-5 h-5" />
                      ${isCopied ? 'Đã sao chép link!' : 'Chia sẻ trò chơi'}
                  </>
                  <${Button} onClick=${handleNewGame}>
                    Chơi lại
                  </>
                </div>
              </div>
            `}
            <${SponsorContentCard} sponsor=${activeSponsor} />
          </div>
        `;
      default:
        return null;
    }
  };

  return html`
    <div className="min-h-screen bg-gradient-to-br from-cyan-900 via-blue-900 to-violet-900 text-white font-sans flex flex-col p-4 md:p-8">
      <main className="w-full max-w-2xl mx-auto flex-grow">
        <header className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Có Bao Nhiêu Người <span className="text-cyan-400">Giống Bạn?</span>
          </h1>
          <p className="text-cyan-200/80 mt-2">Bạn đang ở nhóm nào?</p>
        </header>

        ${renderContent()}
      </main>
      
      <${SponsorBanner} sponsor=${activeSponsor} />
    </div>
  `;
};

export default App;
