
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, MahjongTile, Difficulty } from './types';
import { createGame, isTileBlocked, findHint, shuffleTilesSolvable } from './utils/gameLogic';
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
  const [isMuted, setIsMuted] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [boardScale, setBoardScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // 優化動態縮放：精確計算可用空間與盤面範圍
  const handleResize = useCallback(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const padding = 20; // 邊距
    const availableWidth = container.clientWidth - padding;
    const availableHeight = container.clientHeight - padding;
    
    // 定義各模式下盤面的參考尺寸 (像素)
    let baseWidth = 800;
    let baseHeight = 650;
    
    if (gameState.difficulty === 'HARD') {
      baseWidth = 1050;
      baseHeight = 900;
    } else if (gameState.difficulty === 'EASY') {
      baseWidth = 600;
      baseHeight = 550;
    }
    
    // 計算寬高比例，取較小者以保證完整顯示
    const scaleW = availableWidth / baseWidth;
    const scaleH = availableHeight / baseHeight;
    const finalScale = Math.min(scaleW, scaleH);
    
    // 設定下限防止太小，設定上限防止太大
    setBoardScale(Math.max(0.3, Math.min(finalScale, 1.1)));
  }, [gameState.difficulty]);

  useEffect(() => {
    handleResize();
    // 使用 ResizeObserver 替代 window resize 以獲得更準確的容器監測
    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) observer.observe(containerRef.current);
    
    return () => observer.disconnect();
  }, [handleResize, gameState.status]);

  const startNewGame = useCallback(async (difficulty: Difficulty) => {
    audioService.startBGM();
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
    }, 400);
  }, []);

  useEffect(() => {
    if (gameState.status === 'playing') {
      const activeTiles = gameState.tiles.filter(t => !t.isMatched);
      
      if (gameState.tiles.length > 0 && activeTiles.length === 0) {
        setGameState(prev => ({ ...prev, status: 'won' }));
        audioService.playWin();
        return;
      }

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
          }, 1200); 
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
    <div className="h-screen flex flex-col items-center bg-emerald-950/20 overflow-hidden">
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}

      <header className="w-full max-w-5xl px-4 pt-4 sm:pt-6">
        <div className="bg-emerald-900/95 rounded-[2.5rem] p-4 sm:p-5 text-white border-b-4 border-emerald-800 shadow-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 sm:gap-5">
              <div className="bg-yellow-500 p-2 sm:p-3 rounded-2xl shadow-lg animate-pulse">
                <i className="fas fa-chess-board text-2xl sm:text-3xl text-white"></i>
              </div>
              <div>
                <h1 className="text-2xl sm:text-4xl font-black tracking-tighter" style={{ fontFamily: 'var(--font-main)' }}>麻將對對碰</h1>
                <p className="hidden sm:block text-xs text-emerald-200 font-bold opacity-80 mt-1">專為長輩設計 · 益智動腦</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setShowRules(true)} className="bg-white/10 hover:bg-white/20 p-2 rounded-2xl w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center transition-all border border-white/10 active:scale-95">
                <i className="fas fa-question text-xl sm:text-2xl"></i>
              </button>
              <button onClick={() => { audioService.toggleMute(); setIsMuted(!isMuted); }} className="bg-white/10 hover:bg-white/20 p-2 rounded-2xl w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center transition-all border border-white/10 active:scale-95">
                <i className={`fas ${isMuted ? 'fa-volume-mute' : 'fa-volume-up'} text-xl sm:text-2xl`}></i>
              </button>
            </div>
          </div>

          {gameState.status !== 'selecting' && gameState.status !== 'loading' && (
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/10">
              <div className="bg-black/40 rounded-2xl p-2 sm:p-3 text-center border-b-2 border-black/20">
                <span className="text-xs font-bold text-yellow-500 block">得分</span>
                <span className="text-2xl sm:text-4xl font-mono font-black text-white">{gameState.score}</span>
              </div>
              <div className="bg-black/40 rounded-2xl p-2 sm:p-3 text-center border-b-2 border-black/20">
                <span className="text-xs font-bold text-green-400 block">剩餘</span>
                <span className="text-2xl sm:text-4xl font-mono font-black text-white">
                  {gameState.tiles.filter(t => !t.isMatched).length}
                </span>
              </div>
            </div>
          )}
        </div>
      </header>

      <main 
        ref={containerRef}
        className="relative flex-1 w-full max-w-6xl p-4 overflow-hidden flex items-center justify-center"
      >
        {gameState.status === 'selecting' ? (
          <div className="text-center bg-white/10 backdrop-blur-xl p-8 sm:p-12 rounded-[4rem] border border-white/20 max-w-md w-full animate-fade-in shadow-2xl">
            <h2 className="text-3xl sm:text-5xl text-white font-black mb-10">開始遊戲</h2>
            <div className="flex flex-col gap-6">
              <button onClick={() => startNewGame('EASY')} className="group py-6 sm:py-8 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-3xl text-3xl sm:text-4xl font-black shadow-[0_10px_0_#065f46] active:translate-y-2 active:shadow-none flex items-center justify-center gap-4 transition-all">
                簡單模式
              </button>
              <button onClick={() => startNewGame('STANDARD')} className="group py-6 sm:py-8 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-3xl text-3xl sm:text-4xl font-black shadow-[0_10px_0_#1e3a8a] active:translate-y-2 active:shadow-none flex items-center justify-center gap-4 transition-all">
                標準模式
              </button>
              <button onClick={() => startNewGame('HARD')} className="group py-6 sm:py-8 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-3xl text-3xl sm:text-4xl font-black shadow-[0_10px_0_#9f1239] active:translate-y-2 active:shadow-none flex items-center justify-center gap-4 transition-all">
                大師挑戰
              </button>
            </div>
          </div>
        ) : gameState.status === 'loading' ? (
          <div className="text-center">
             <div className="inline-block w-20 h-20 border-[10px] border-yellow-500 border-t-transparent rounded-full animate-spin mb-8"></div>
             <p className="text-white text-2xl sm:text-3xl font-black animate-pulse">正在精選牌組...</p>
          </div>
        ) : gameState.status === 'won' ? (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white p-8 sm:p-16 rounded-[4rem] border-[10px] border-yellow-400 text-center max-w-lg shadow-[0_0_80px_rgba(255,255,0,0.5)]">
              <div className="mb-6 animate-bounce">
                <i className="fas fa-trophy text-8xl sm:text-9xl text-yellow-500"></i>
              </div>
              <h2 className="text-5xl sm:text-7xl font-black text-gray-800 mb-4">大獲全勝！</h2>
              <p className="text-2xl sm:text-3xl text-gray-600 mb-10">您的頭腦真是靈活過人！</p>
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => startNewGame(gameState.difficulty)} 
                  className="py-5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-[2rem] text-3xl font-black shadow-lg active:scale-95 transition-all"
                >
                  再玩一次
                </button>
                <button 
                  onClick={() => {
                    audioService.stopBGM();
                    setGameState(prev => ({ ...prev, status: 'selecting' }));
                  }} 
                  className="py-4 bg-gray-100 text-gray-600 rounded-[2rem] text-2xl font-black active:scale-95 transition-all"
                >
                  返回選單
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div 
            style={{ 
              transform: `scale(${boardScale})`, 
              transformOrigin: 'center center',
              width: '100%',
              height: '100%',
              position: 'relative'
            }}
            className="transition-transform duration-500 ease-out"
          >
            {gameState.status === 'no-moves' && (
              <div className="absolute inset-0 z-[2000] bg-black/60 backdrop-blur-md rounded-[3rem] flex items-center justify-center animate-fade-in">
                <div className="bg-white p-10 rounded-[4rem] border-[8px] border-yellow-500 text-center max-w-sm shadow-2xl">
                  <i className="fas fa-redo-alt text-7xl text-yellow-500 mb-8"></i>
                  <h3 className="text-3xl font-black text-gray-800 mb-8">沒牌可消啦</h3>
                  <button onClick={handleShuffle} className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-[2rem] text-2xl font-black shadow-xl active:scale-95">自動洗牌</button>
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

      <nav className="w-full max-w-4xl px-4 pb-6 sm:pb-8">
        <div className="bg-white/95 backdrop-blur-2xl rounded-[2.5rem] p-3 sm:p-4 flex justify-between gap-3 sm:gap-4 shadow-2xl border-t border-gray-100">
          <button onClick={() => {
            audioService.stopBGM();
            setGameState(prev => ({ ...prev, status: 'selecting' }));
          }} className="flex-1 py-3 sm:py-4 bg-gray-50 text-gray-600 rounded-2xl font-black flex flex-col items-center justify-center active:scale-90 border-b-4 border-gray-200 transition-all">
            <i className="fas fa-home text-xl sm:text-2xl mb-1"></i>
            <span className="text-sm">回首頁</span>
          </button>
          <button onClick={handleShuffle} disabled={gameState.status !== 'playing'} className="flex-1 py-3 sm:py-4 bg-indigo-50 text-indigo-600 rounded-2xl font-black flex flex-col items-center justify-center active:scale-90 disabled:opacity-30 border-b-4 border-indigo-100 transition-all">
            <i className="fas fa-sync-alt text-xl sm:text-2xl mb-1"></i>
            <span className="text-sm">洗牌</span>
          </button>
          <button onClick={() => { audioService.playSelect(); setHintIds(findHint(gameState.tiles) || []); }} disabled={gameState.status !== 'playing'} className="flex-1 py-3 sm:py-4 bg-yellow-50 text-yellow-600 rounded-2xl font-black flex flex-col items-center justify-center active:scale-90 disabled:opacity-30 border-b-4 border-yellow-100 transition-all">
            <i className="fas fa-magic text-xl sm:text-2xl mb-1"></i>
            <span className="text-sm">提示</span>
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
          }} disabled={gameState.history.length === 0 || gameState.status !== 'playing'} className="flex-1 py-3 sm:py-4 bg-zinc-800 text-white rounded-2xl font-black flex flex-col items-center justify-center active:scale-90 disabled:bg-gray-100 disabled:text-gray-300 border-b-4 border-zinc-950 transition-all">
            <i className="fas fa-undo text-xl sm:text-2xl mb-1"></i>
            <span className="text-sm">回一步</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default App;
