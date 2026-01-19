
import React, { useState, useEffect, useCallback } from 'react';
import { GameState, MahjongTile, Encouragement, Difficulty } from './types';
import { createGame, isTileBlocked, findHint, shuffleTilesSolvable } from './utils/gameLogic';
import { getElderlyEncouragement } from './services/geminiService';
import { audioService } from './services/audioService';
import { LAYOUT_PATTERNS } from './constants';
import Tile from './components/Tile';
import RulesModal from './components/RulesModal';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    tiles: [],
    selectedId: null,
    score: 0,
    moves: 0,
    status: 'selecting',
    history: [],
    difficulty: 'STANDARD'
  });
  const [hintIds, setHintIds] = useState<string[]>([]);
  const [encouragement, setEncouragement] = useState<Encouragement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [showRules, setShowRules] = useState(false);

  const startNewGame = useCallback(async (difficulty: Difficulty) => {
    setGameState(prev => ({ ...prev, status: 'loading', difficulty, tiles: [] }));
    setTimeout(() => {
      const newTiles = createGame(difficulty);
      setGameState({
        tiles: newTiles,
        selectedId: null,
        score: 0,
        moves: 0,
        status: 'playing',
        history: [],
        difficulty
      });
      setHintIds([]);
      getElderlyEncouragement().then(setEncouragement);
    }, 400);
  }, []);

  useEffect(() => {
    if (gameState.status === 'playing') {
      const activeTiles = gameState.tiles.filter(t => !t.isMatched);
      
      // 基本獲勝判定
      if (gameState.tiles.length > 0 && activeTiles.length === 0) {
        setGameState(prev => ({ ...prev, status: 'won' }));
        audioService.playWin();
        return;
      }

      // 特殊規則：如果最後兩張相同，即便疊在一起也自動判定獲勝
      if (activeTiles.length === 2) {
        const [t1, t2] = activeTiles;
        if (t1.type === t2.type && t1.value === t2.value) {
          setTimeout(() => {
            setGameState(prev => ({
              ...prev,
              tiles: prev.tiles.map(t => ({ ...t, isMatched: true })),
              status: 'won',
              score: prev.score + 100
            }));
            audioService.playMatch();
            audioService.playWin();
          }, 1000); // 稍微長一點，配合翻轉動畫
          return;
        }
      }

      if (activeTiles.length > 0) {
        const hint = findHint(gameState.tiles);
        if (hint === null) {
          setGameState(prev => ({ ...prev, status: 'no-moves' }));
        }
      }
    }
  }, [gameState.tiles, gameState.status]);

  const handleTileClick = (id: string) => {
    if (gameState.status !== 'playing') return;

    setGameState(prev => {
      const { tiles, selectedId, score, moves, history } = prev;
      const clickedTile = tiles.find(t => t.id === id);
      
      if (!clickedTile || clickedTile.isMatched || isTileBlocked(clickedTile, tiles)) {
        return prev;
      }

      if (selectedId === id) {
        audioService.playSelect();
        return { ...prev, selectedId: null };
      }

      if (!selectedId) {
        audioService.playSelect();
        setHintIds([]);
        return { ...prev, selectedId: id };
      }

      const firstTile = tiles.find(t => t.id === selectedId);
      if (!firstTile) return { ...prev, selectedId: id };

      if (firstTile.type === clickedTile.type && firstTile.value === clickedTile.value) {
        audioService.playMatch();
        const newTiles = tiles.map(t => 
          (t.id === id || t.id === selectedId) ? { ...t, isMatched: true } : t
        );
        
        return {
          ...prev,
          tiles: newTiles,
          selectedId: null,
          score: score + 100,
          moves: moves + 1,
          history: [...history, [id, selectedId]],
          status: 'playing'
        };
      } else {
        audioService.playFail();
        return { ...prev, selectedId: id };
      }
    });
  };

  const handleShuffle = () => {
    audioService.playSelect();
    setGameState(prev => ({
      ...prev,
      tiles: shuffleTilesSolvable(prev.tiles),
      selectedId: null,
      status: 'playing'
    }));
    setHintIds([]);
  };

  const currentLayout = LAYOUT_PATTERNS[gameState.difficulty];

  return (
    <div className="min-h-screen flex flex-col items-center p-2 sm:p-4 bg-emerald-950/10">
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}

      <header className="w-full max-w-4xl bg-white/20 backdrop-blur-xl rounded-[2rem] p-4 sm:p-6 mb-4 sm:mb-8 text-white shadow-2xl border border-white/20">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-yellow-500 p-2 sm:p-3 rounded-2xl shadow-xl">
              <i className="fas fa-chess-board text-2xl sm:text-3xl text-white"></i>
            </div>
            <div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tighter">麻將對對碰</h1>
              {/* 移除副標題 */}
            </div>
          </div>

          <div className="flex gap-2 sm:gap-3">
            <button onClick={() => setShowRules(true)} className="bg-white/10 hover:bg-white/30 p-2 rounded-2xl w-14 h-14 flex items-center justify-center transition-all border border-white/10 active:scale-90 shadow-lg">
              <i className="fas fa-question text-2xl"></i>
            </button>
            <button onClick={() => { audioService.toggleMute(); setIsMuted(!isMuted); }} className="bg-white/10 hover:bg-white/30 p-2 rounded-2xl w-14 h-14 flex items-center justify-center transition-all border border-white/10 active:scale-90 shadow-lg">
              <i className={`fas ${isMuted ? 'fa-volume-mute' : 'fa-volume-up'} text-2xl`}></i>
            </button>
          </div>
        </div>

        {gameState.status !== 'selecting' && gameState.status !== 'loading' && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div className="bg-black/30 rounded-3xl p-3 sm:p-4 text-center border border-white/10">
              <p className="text-sm font-bold text-yellow-500 mb-1">得分</p>
              <p className="text-3xl sm:text-5xl font-mono font-black text-white">{gameState.score}</p>
            </div>
            <div className="bg-black/30 rounded-3xl p-3 sm:p-4 text-center border border-white/10">
              <p className="text-sm font-bold text-green-400 mb-1">剩餘</p>
              <p className="text-3xl sm:text-5xl font-mono font-black text-white">
                {gameState.tiles.filter(t => !t.isMatched).length}
              </p>
            </div>
          </div>
        )}
      </header>

      <main className="relative flex-1 w-full max-w-5xl bg-black/5 rounded-[3rem] overflow-hidden p-4 sm:p-10 mb-28 flex items-center justify-center min-h-[500px]">
        {gameState.status === 'selecting' ? (
          <div className="text-center bg-white/10 backdrop-blur-md p-10 rounded-[4rem] border border-white/10 max-w-md w-full animate-fade-in shadow-2xl">
            <h2 className="text-4xl text-white font-black mb-12">開始遊戲</h2>
            <div className="flex flex-col gap-6">
              <button onClick={() => startNewGame('EASY')} className="group py-8 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-3xl text-4xl font-black shadow-[0_12px_0_#065f46] active:translate-y-3 active:shadow-none flex items-center justify-center gap-4">
                簡單
              </button>
              <button onClick={() => startNewGame('STANDARD')} className="group py-8 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-3xl text-4xl font-black shadow-[0_12px_0_#1e3a8a] active:translate-y-3 active:shadow-none flex items-center justify-center gap-4">
                標準
              </button>
              <button onClick={() => startNewGame('HARD')} className="group py-8 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-3xl text-4xl font-black shadow-[0_12px_0_#9f1239] active:translate-y-3 active:shadow-none flex items-center justify-center gap-4">
                困難
              </button>
            </div>
          </div>
        ) : gameState.status === 'loading' ? (
          <div className="text-center">
             <div className="inline-block w-24 h-24 border-[12px] border-yellow-500 border-t-transparent rounded-full animate-spin mb-10 shadow-2xl"></div>
             <p className="text-white text-3xl font-black animate-pulse">正在精選牌組...</p>
          </div>
        ) : gameState.status === 'won' ? (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white p-10 sm:p-16 rounded-[4rem] border-[10px] border-yellow-400 text-center max-w-lg shadow-[0_0_100px_rgba(255,255,0,0.4)]">
              <div className="mb-8 animate-bounce">
                <i className="fas fa-trophy text-9xl text-yellow-500"></i>
              </div>
              <h2 className="text-6xl sm:text-8xl font-black text-gray-800 mb-6">過關了！</h2>
              <p className="text-3xl sm:text-4xl text-gray-600 mb-12">您真是太厲害了！</p>
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => startNewGame(gameState.difficulty)} 
                  className="py-6 bg-yellow-500 hover:bg-yellow-600 text-white rounded-[2.5rem] text-4xl font-black shadow-xl active:scale-95 transition-all"
                >
                  再玩一局
                </button>
                <button 
                  onClick={() => setGameState(prev => ({ ...prev, status: 'selecting' }))} 
                  className="py-5 bg-gray-200 text-gray-700 rounded-[2.5rem] text-3xl font-black active:scale-95 transition-all"
                >
                  回到主選單
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className={`relative w-full h-full transform transition-all duration-700 ease-out ${
            gameState.difficulty === 'HARD' ? 'scale-[0.5] sm:scale-[0.75]' : 
            gameState.difficulty === 'STANDARD' ? 'scale-[0.6] sm:scale-[0.9]' : 
            'scale-[0.8] sm:scale-[1.1]'
          }`}>
            {gameState.status === 'no-moves' && (
              <div className="absolute inset-0 z-[2000] bg-black/60 backdrop-blur-md rounded-[3rem] flex items-center justify-center animate-fade-in">
                <div className="bg-white p-10 rounded-[4rem] border-[8px] border-yellow-500 text-center max-w-sm shadow-2xl">
                  <i className="fas fa-redo-alt text-7xl text-yellow-500 mb-8"></i>
                  <h3 className="text-4xl font-black text-gray-800 mb-8">沒牌可消啦</h3>
                  <button onClick={handleShuffle} className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-[2rem] text-3xl font-black shadow-xl">自動洗牌</button>
                </div>
              </div>
            )}

            {gameState.tiles.map(tile => (
              <Tile
                key={tile.id}
                tile={tile}
                isSelected={gameState.selectedId === tile.id}
                isHint={hintIds.includes(tile.id)}
                isBlocked={isTileBlocked(tile, gameState.tiles)}
                onClick={handleTileClick}
                centerX={currentLayout.center.x}
                centerY={currentLayout.center.y}
              />
            ))}
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 bg-white/95 backdrop-blur-2xl shadow-[0_-20px_60px_rgba(0,0,0,0.4)] z-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto flex justify-between gap-4">
          <button onClick={() => setGameState(prev => ({ ...prev, status: 'selecting' }))} className="flex-1 py-5 bg-gray-100 text-gray-700 rounded-3xl font-black flex flex-col items-center justify-center active:scale-95 border-b-8 border-gray-300">
            <i className="fas fa-home text-3xl mb-1"></i>
            <span className="text-lg">回選單</span>
          </button>
          <button onClick={handleShuffle} disabled={gameState.status !== 'playing'} className="flex-1 py-5 bg-indigo-500 text-white rounded-3xl font-black flex flex-col items-center justify-center active:scale-95 disabled:opacity-50 border-b-8 border-indigo-700">
            <i className="fas fa-sync-alt text-3xl mb-1"></i>
            <span className="text-lg">洗牌</span>
          </button>
          <button onClick={() => { audioService.playSelect(); setHintIds(findHint(gameState.tiles) || []); }} disabled={gameState.status !== 'playing'} className="flex-1 py-5 bg-yellow-500 text-white rounded-3xl font-black flex flex-col items-center justify-center active:scale-95 disabled:opacity-50 border-b-8 border-yellow-700">
            <i className="fas fa-magic text-3xl mb-1"></i>
            <span className="text-lg">提示</span>
          </button>
          <button onClick={() => { 
            if (gameState.history.length === 0) return;
            audioService.playSelect();
            const lastMatch = gameState.history[gameState.history.length - 1];
            setGameState(prev => ({
              ...prev,
              tiles: prev.tiles.map(t => lastMatch.includes(t.id) ? { ...t, isMatched: false } : t),
              history: prev.history.slice(0, -1),
              score: Math.max(0, prev.score - 100),
              selectedId: null,
              status: 'playing'
            }));
            setHintIds([]);
          }} disabled={gameState.history.length === 0 || gameState.status !== 'playing'} className="flex-1 py-5 rounded-3xl font-black flex flex-col items-center justify-center bg-zinc-800 text-white disabled:bg-gray-200 border-b-8 border-zinc-950">
            <i className="fas fa-undo text-3xl mb-1"></i>
            <span className="text-lg">回一步</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default App;
