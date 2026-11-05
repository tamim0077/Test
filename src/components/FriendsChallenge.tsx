import React, { useState, useEffect } from 'react';
import type { ChallengeData, UserAccount, StudentProfile } from '../types';
import {
  Trophy,
  Swords,
  Share2,
  Copy,
  Check,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Zap,
  Clock,
  Flame,
  ArrowLeft,
  Bot
} from 'lucide-react';

interface FriendsChallengeProps {
  currentChallenge?: ChallengeData | null;
  currentUser?: UserAccount | null;
  studentProfile?: StudentProfile;
  onCreateChallenge?: (params: any) => Promise<any>;
  onStartTakingChallenge?: (challenge: any) => void;
  onBack: () => void;
}

export const FriendsChallenge: React.FC<FriendsChallengeProps> = ({
  currentChallenge,
  currentUser,
  studentProfile,
  onBack,
}) => {
  const isWinnerView = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('winner') === '1';
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'winner'>(isWinnerView ? 'winner' : 'lobby');
  const [copiedLink, setCopiedLink] = useState(false);

  // Authenticated user identity
  const myName = currentUser?.name || studentProfile?.name || 'শিক্ষার্থী';
  const opponentName = currentChallenge?.challengerName || 'রোবট প্রতিযোগী (AI Bot)';
  const isOpponentBot = !currentChallenge?.challengerName;

  // 5 Authentic Questions for the Challenge
  const defaultQuestions = [
    {
      question: 'যদি a + b = 5 এবং ab = 6 হয়, তবে a² + b² এর মান কত?',
      options: ['13', '19', '25', '12'],
      correct: 0, // 13
      chapter: 'বীজগাণিতিক রাশি',
    },
    {
      question: 'নিচের কোনটি মৌলিক সংখ্যা?',
      options: ['21', '23', '25', '27'],
      correct: 1, // 23
      chapter: 'বাস্তব সংখ্যা',
    },
    {
      question: 'সুষম বেগে চলমান কোনো বস্তুর ত্বরণ কত?',
      options: ['9.8 ms⁻²', '0 ms⁻²', '1 ms⁻²', 'পরিবর্তনশীল'],
      correct: 1, // 0
      chapter: 'গতি',
    },
    {
      question: 'log₁₀(1000) এর মান কত?',
      options: ['1', '2', '3', '10'],
      correct: 2, // 3
      chapter: 'সূচক ও লগারিদম',
    },
    {
      question: 'পানির অণুতে (H₂O) হাইড্রোজেন ও অক্সিজেনের ভরের অনুপাত কত?',
      options: ['1 : 8', '1 : 2', '2 : 1', '8 : 1'],
      correct: 0, // 1:8
      chapter: 'পদার্থের গঠন',
    },
  ];

  const questions = currentChallenge?.questions && currentChallenge.questions.length > 0
    ? currentChallenge.questions.map((q) => ({
        question: q.questionText,
        options: q.options,
        correct: 0,
        chapter: currentChallenge.chapter || 'সাধারণ গণিত',
      }))
    : defaultQuestions;

  // Live Game State - Scores and streaks start STRICTLY AT ZERO
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(30);
  const [myScore, setMyScore] = useState(0);
  const [myStreak, setMyStreak] = useState(0);
  const [myCorrect, setMyCorrect] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [opponentStreak, setOpponentStreak] = useState(0);
  const [opponentCorrect, setOpponentCorrect] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // Per-Question 30s Countdown Timer
  useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          handleNextQuestion();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState, currentQIndex]);

  const handleSelectAnswer = (index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);

    const q = questions[currentQIndex];
    if (index === q.correct) {
      setMyScore((prev) => prev + 100);
      setMyStreak((prev) => prev + 1);
      setMyCorrect((prev) => prev + 1);
    } else {
      setMyStreak(0);
    }

    // Bot simulation with realistic 65% accuracy
    if (isOpponentBot) {
      setTimeout(() => {
        if (Math.random() > 0.35) {
          setOpponentScore((prev) => prev + 100);
          setOpponentStreak((prev) => prev + 1);
          setOpponentCorrect((prev) => prev + 1);
        } else {
          setOpponentStreak(0);
        }
      }, 500);
    }

    // Auto advance after brief review
    setTimeout(() => {
      handleNextQuestion();
    }, 1200);
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setTimerSeconds(30);
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
    } else {
      setGameState('winner');
    }
  };

  const handleShareLink = () => {
    const code = currentChallenge?.code || 'DNA2027';
    navigator.clipboard.writeText(`${window.location.origin}/?challenge=${code}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const isUserWinner = myScore > opponentScore;
  const isDraw = myScore === opponentScore;

  return (
    <div className="min-h-screen bg-[#080C1A] text-white flex flex-col justify-between p-4 sm:p-8 font-sans relative overflow-hidden">
      
      {/* Ambient Neon Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar with Exit */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between z-10 pb-4 border-b border-slate-800/80">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>এরিনা থেকে বের হন (Exit Arena)</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-800/60 shadow-xs">
          <Zap className="w-3.5 h-3.5 fill-cyan-400 animate-pulse" />
          <span>ফ্রেন্ড চ্যালেঞ্জ কুইজ (Friend Challenge)</span>
        </div>
      </div>

      {/* SCREEN 12: FRIEND CHALLENGE ARENA LOBBY */}
      {gameState === 'lobby' && (
        <main className="max-w-4xl mx-auto w-full my-auto py-10 z-10 animate-in fade-in zoom-in-95 duration-300">
          
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center justify-center gap-2.5">
              <span>Challenge Arena</span>
              <Swords className="w-7 h-7 text-cyan-400" />
            </h1>
            <p className="text-sm font-semibold text-cyan-400 mt-1">
              {questions.length}টি বহুনিবার্চনি প্রশ্ন • দ্রুত ও নির্ভুল উত্তর দাও
            </p>
          </div>

          {/* 1v1 VS Card Container */}
          <div className="bg-gradient-to-b from-slate-900/90 via-[#0D152D] to-slate-950 p-6 sm:p-10 rounded-3xl border border-blue-500/30 shadow-2xl shadow-blue-500/20 relative">
            
            <div className="grid grid-cols-1 sm:grid-cols-11 gap-6 items-center">
              
              {/* Left Player: You */}
              <div className="sm:col-span-5 flex flex-col items-center text-center p-6 rounded-2xl bg-slate-800/40 border border-cyan-500/30 backdrop-blur-md">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-2xl font-black text-white mb-3 shadow-lg shadow-cyan-500/30">
                  {myName.charAt(0)}
                </div>
                <h3 className="text-lg font-black text-white truncate max-w-[200px]">{myName}</h3>
                <div className="text-xs text-cyan-400 font-bold mt-1">
                  বর্তমান ম্যাচ স্কোর: ০ পয়েন্ট
                </div>
                <div className="text-[11px] text-slate-400 mt-1">প্রতিযোগী প্রস্তুত</div>
              </div>

              {/* Center VS Badge */}
              <div className="sm:col-span-1 flex flex-col items-center justify-center my-2 sm:my-0">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-rose-500 via-purple-600 to-blue-600 flex items-center justify-center text-white font-black text-lg shadow-xl shadow-purple-500/40 ring-4 ring-slate-900 animate-pulse">
                  VS
                </div>
              </div>

              {/* Right Player: Opponent */}
              <div className="sm:col-span-5 flex flex-col items-center text-center p-6 rounded-2xl bg-slate-800/40 border border-purple-500/30 backdrop-blur-md">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-400 to-rose-600 flex items-center justify-center text-2xl font-black text-white mb-3 shadow-lg shadow-purple-500/30">
                  {isOpponentBot ? <Bot className="w-10 h-10 text-white" /> : opponentName.charAt(0)}
                </div>
                <h3 className="text-lg font-black text-white truncate max-w-[200px]">{opponentName}</h3>
                <div className="text-xs text-purple-400 font-bold mt-1">
                  বর্তমান ম্যাচ স্কোর: ০ পয়েন্ট
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {isOpponentBot ? 'স্বয়ংক্রিয় এআই প্র্যাকটিস বট' : 'আমন্ত্রিত প্রতিপক্ষ'}
                </div>
              </div>

            </div>

            {/* Sub-bar: Exact Question Count & Per-Question Timing */}
            <div className="mt-8 pt-6 border-t border-slate-800 text-center">
              <span className="inline-block px-4 py-1.5 rounded-full bg-slate-800/80 text-xs font-bold text-slate-300 border border-slate-700">
                {questions.length}টি প্রশ্ন • প্রতি প্রশ্নে ৩০ সেকেন্ড • ফ্রেন্ড চ্যালেঞ্জ মোড
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <button
                type="button"
                onClick={() => {
                  setGameState('playing');
                  setCurrentQIndex(0);
                  setTimerSeconds(30);
                  setMyScore(0);
                  setOpponentScore(0);
                  setMyCorrect(0);
                  setOpponentCorrect(0);
                }}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm shadow-lg shadow-cyan-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span>ম্যাচ শুরু করো (Start Match)</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>

              <button
                type="button"
                onClick={handleShareLink}
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>{copiedLink ? 'লিংক কপি হয়েছে!' : 'বন্ধুকে আমন্ত্রণ জানাও'}</span>
              </button>
            </div>

          </div>

        </main>
      )}

      {/* SCREEN 13: LIVE CHALLENGE GAMEPLAY HUD */}
      {gameState === 'playing' && (
        <main className="max-w-4xl mx-auto w-full my-auto py-8 z-10 animate-in fade-in duration-200">
          
          {/* Top Live Score HUD */}
          <div className="grid grid-cols-3 items-center gap-4 bg-slate-900/90 backdrop-blur-md p-5 rounded-3xl border border-blue-500/30 shadow-xl mb-8">
            
            {/* Player 1 (You) */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center font-black text-white shrink-0">
                {myName.charAt(0)}
              </div>
              <div>
                <div className="text-xs font-bold text-white truncate max-w-[120px]">{myName}</div>
                <div className="text-sm font-black text-cyan-400 font-mono-numbers">
                  স্কোর: {myScore}
                </div>
                <div className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-amber-400" />
                  <span>স্ট্রিক: {myStreak}</span>
                </div>
              </div>
            </div>

            {/* Center Circular Countdown Timer */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-full border-4 border-cyan-400/40 border-t-cyan-400 flex items-center justify-center text-lg font-black text-cyan-300 font-mono-numbers shadow-lg shadow-cyan-500/20">
                {timerSeconds}s
              </div>
              <div className="text-[10px] text-slate-400 font-semibold mt-1">সময় বাকি</div>
            </div>

            {/* Player 2 (Opponent) */}
            <div className="flex items-center justify-end gap-3 text-right">
              <div>
                <div className="text-xs font-bold text-white truncate max-w-[120px]">{opponentName}</div>
                <div className="text-sm font-black text-purple-400 font-mono-numbers">
                  স্কোর: {opponentScore}
                </div>
                <div className="text-[10px] text-amber-400 font-bold flex items-center justify-end gap-1">
                  <Flame className="w-3 h-3 fill-amber-400" />
                  <span>স্ট্রিক: {opponentStreak}</span>
                </div>
              </div>
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-purple-400 to-rose-500 flex items-center justify-center font-black text-white shrink-0">
                {isOpponentBot ? <Bot className="w-6 h-6 text-white" /> : opponentName.charAt(0)}
              </div>
            </div>

          </div>

          {/* Battle Question Card */}
          <div className="bg-gradient-to-b from-slate-900/90 to-slate-950 p-6 sm:p-10 rounded-3xl border border-blue-500/30 shadow-2xl text-center space-y-8">
            <div>
              <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-800">
                প্রশ্ন {currentQIndex + 1} / {questions.length} • {questions[currentQIndex]?.chapter}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-4 leading-relaxed">
                {questions[currentQIndex]?.question}
              </h2>
            </div>

            {/* 4 Gaming Styled Option Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {questions[currentQIndex]?.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === questions[currentQIndex]?.correct;
                const optionLetter = ['ক', 'খ', 'গ', 'ঘ'][idx];

                let btnStyle = 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-white';
                if (selectedOption !== null) {
                  if (isSelected) {
                    btnStyle = isCorrect
                      ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-500/40 ring-2 ring-emerald-300'
                      : 'bg-rose-600 border-rose-400 text-white shadow-lg shadow-rose-500/40';
                  } else if (isCorrect) {
                    btnStyle = 'bg-emerald-700/60 border-emerald-500 text-white';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={selectedOption !== null}
                    onClick={() => handleSelectAnswer(idx)}
                    className={`p-4 rounded-2xl border-2 font-bold text-sm sm:text-base flex items-center gap-3 transition-all cursor-pointer ${btnStyle}`}
                  >
                    <span className="w-8 h-8 rounded-xl bg-slate-900/60 flex items-center justify-center text-xs font-mono">
                      {optionLetter}
                    </span>
                    <span className="truncate">{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </main>
      )}

      {/* SCREEN 14: CHALLENGE WINNER SCREEN */}
      {gameState === 'winner' && (
        <main className="max-w-2xl mx-auto w-full my-auto py-10 z-10 text-center space-y-8 animate-in zoom-in-95 duration-300">
          
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 p-1.5 shadow-2xl shadow-amber-500/40 mx-auto animate-bounce">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                <Trophy className="w-12 h-12 text-amber-400 fill-amber-400" />
              </div>
            </div>
            <Sparkles className="w-6 h-6 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {isUserWinner
                ? 'অভিনন্দন! তুমি বিজয়ী হয়েছো!'
                : isDraw
                ? 'ম্যাচ টাই হয়েছে!'
                : `${opponentName} এগিয়ে গিয়েছে!`}
            </h2>
            <p className="text-xs sm:text-sm text-cyan-400 font-bold mt-1">
              মোট {questions.length}টি প্রশ্নের মধ্যে তোমার {myCorrect}টি সঠিক হয়েছে
            </p>
          </div>

          {/* Head-to-Head Result Comparison Card */}
          <div className="bg-slate-900/90 p-6 rounded-3xl border border-blue-500/30 shadow-2xl grid grid-cols-2 gap-4">
            
            {/* Player 1 */}
            <div className={`p-4 rounded-2xl text-center space-y-1.5 ${
              isUserWinner ? 'bg-cyan-950/40 border-2 border-cyan-400' : 'bg-slate-800/40 border border-slate-700'
            }`}>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                isUserWinner ? 'bg-cyan-500 text-slate-950' : 'bg-slate-700 text-slate-300'
              }`}>
                {isUserWinner ? 'WINNER' : isDraw ? 'DRAW' : 'PLAYER'}
              </span>
              <div className="text-xs font-black text-white truncate">{myName}</div>
              <div className="text-2xl font-black text-cyan-400 font-mono-numbers">
                {myScore} পয়েন্ট
              </div>
              <div className="text-[11px] text-slate-400">সঠিক: {myCorrect}/{questions.length}</div>
            </div>

            {/* Player 2 */}
            <div className={`p-4 rounded-2xl text-center space-y-1.5 ${
              !isUserWinner && !isDraw ? 'bg-purple-950/40 border-2 border-purple-400' : 'bg-slate-800/40 border border-slate-700'
            }`}>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                !isUserWinner && !isDraw ? 'bg-purple-500 text-white' : 'bg-slate-700 text-slate-300'
              }`}>
                {!isUserWinner && !isDraw ? 'WINNER' : isDraw ? 'DRAW' : 'OPPONENT'}
              </span>
              <div className="text-xs font-black text-slate-300 truncate">{opponentName}</div>
              <div className="text-2xl font-black text-slate-400 font-mono-numbers">
                {opponentScore} পয়েন্ট
              </div>
              <div className="text-[11px] text-slate-400">সঠিক: {opponentCorrect}/{questions.length}</div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => {
                setGameState('playing');
                setCurrentQIndex(0);
                setMyScore(0);
                setOpponentScore(0);
                setMyCorrect(0);
                setOpponentCorrect(0);
                setTimerSeconds(30);
              }}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>আবার খেলুন (Play Again)</span>
            </button>

            <button
              type="button"
              onClick={handleShareLink}
              className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>{copiedLink ? 'ফলাফল লিংক কপি হয়েছে!' : 'ফলাফল শেয়ার করো'}</span>
            </button>
          </div>

        </main>
      )}

      {/* Footer */}
      <div className="max-w-5xl mx-auto w-full text-center text-xs text-slate-500 z-10 pt-4">
        ExamDNA BD ফ্রেন্ড চ্যালেঞ্জ এরিনা • একাডেমিক এমসিকিউ অনুশীলন প্ল্যাটফর্ম
      </div>

    </div>
  );
};
