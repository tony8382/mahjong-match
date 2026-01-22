
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, MahjongTile, GameProgress } from './types';
import { createGame, isTileBlocked, findHint, shuffleTilesSolvable } from './utils/gameLogic';
import { audioService } from './services/audioService';
import { generateLayoutForLevel } from './constants';
import { loadProgress, unlockNextLevel, updateLastPlayedLevel } from './utils/progressStorage';
import Tile from './components/Tile';
import RulesModal from './components/RulesModal';

const App: React.FC = () => {
  const [progress, setProgress] = useState<GameProgress>(loadProgress());
  const [gameState, setGameState] = useState<GameState>({
    tiles: [],
    selectedId: null,
    score: 0,
    moves: 0,
    status: 'selecting',
    history: [],
    level: 1
  });
  const [hintIds, setHintIds] = useState<string[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [boardScale, setBoardScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleResize = useCallback(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const padding = 40;
    const availableWidth = container.clientWidth - padding;
    const availableHeight = container.clientHeight - padding;

    // 根據關卡動態計算基礎尺寸
    const layout = generateLayoutForLevel(gameState.level);
    const baseWidth = layout.baseWidth * 110 + 350; // 增加間距以容納更厚實的 3D 陰影
    const baseHeight = layout.baseHeight * 140 + 350;

    const scaleW = availableWidth / baseWidth;
    const scaleH = availableHeight / baseHeight;
    const finalScale = Math.min(scaleW, scaleH);
    setBoardScale(Math.max(0.25, Math.min(finalScale, 1.2)));
  }, [gameState.level]);

  useEffect(() => {
    handleResize();
    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [handleResize, gameState.status]);

  const startNewGame = useCallback(async (level: number) => {
    audioService.startBGM();
    updateLastPlayedLevel(level);
    setGameState(prev => ({ ...prev, status: 'loading', level, tiles: [] }));
    setTimeout(() => {
      const newTiles = createGame(level);
      setGameState({
        tiles: newTiles,
        selectedId: null,
        score: 0,
        moves: 0,
        status: 'playing',
        history: [],
        level
      });
      setHintIds([]);
    }, 500);
  }, []);

  useEffect(() => {
    if (gameState.status === 'playing') {
      const activeTiles = gameState.tiles.filter(t => !t.isMatched);
      if (gameState.tiles.length > 0 && activeTiles.length === 0) {
        setGameState(prev => ({ ...prev, status: 'won' }));
        audioService.playWin();
        // 解鎖下一關
        const newProgress = unlockNextLevel(gameState.level, gameState.score);
        setProgress(newProgress);
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
            // 解鎖下一關
            const newProgress = unlockNextLevel(gameState.level, gameState.score + 100);
            setProgress(newProgress);
          }, 1200);
          return;
        }
      }
      if (activeTiles.length > 0) {
        const hint = findHint(gameState.tiles);
        if (hint === null) setGameState(prev => ({ ...prev, status: 'no-moves' }));
      }
    }
  }, [gameState.tiles, gameState.status, gameState.level, gameState.score]);

  const handleTileClick = (id: string) => {
    if (gameState.status !== 'playing') return;
    setGameState(prev => {
      const { tiles, selectedId, score, moves, history } = prev;
      const clickedTile = tiles.find(t => t.id === id);
      if (!clickedTile || clickedTile.isMatched || isTileBlocked(clickedTile, tiles)) return prev;
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

  const currentLayout = generateLayoutForLevel(gameState.level);

  return (
    <div className="min-h-screen flex flex-col items-center">
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}

      {/* 頂部標題列：特大化 */}
      <header className="w-full bg-[#5d0000] border-b-8 border-[#b8860b] shadow-xl px-4 py-4 sm:py-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#b8860b] flex items-center justify-center rounded-md rotate-45 border-4 border-white/30">
              <i className="fas fa-gem text-white text-2xl sm:text-3xl -rotate-45"></i>
            </div>
            <div>
              <h1 className="text-3xl sm:text-5xl font-black text-[#f8e1a1] tracking-[0.2em]" style={{ fontFamily: 'var(--font-art)' }}>經典麻將對對碰</h1>
              {gameState.status === 'playing' && (
                <p className="text-lg sm:text-2xl text-[#b8860b] font-bold mt-1">第 {gameState.level} 關</p>
              )}
            </div>
          </div>

          <div className="flex gap-4 sm:gap-6 items-center">
            {gameState.status === 'playing' && (
              <div className="hidden md:flex items-center gap-10 mr-10">
                <div className="text-center">
                  <p className="text-sm sm:text-lg text-[#f8e1a1] font-bold">目前得分</p>
                  <p className="text-4xl sm:text-5xl text-white font-black">{gameState.score}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm sm:text-lg text-green-400 font-bold">剩餘牌數</p>
                  <p className="text-4xl sm:text-5xl text-white font-black">{gameState.tiles.filter(t => !t.isMatched).length}</p>
                </div>
              </div>
            )}
            <button onClick={() => setShowRules(true)} className="w-14 h-14 sm:w-16 sm:h-16 border-4 border-[#b8860b] text-[#f8e1a1] flex items-center justify-center hover:bg-white/10 transition-colors">
              <i className="fas fa-book-open text-2xl sm:text-3xl"></i>
            </button>
            <button onClick={() => { audioService.toggleMute(); setIsMuted(!isMuted); }} className="w-14 h-14 sm:w-16 sm:h-16 border-4 border-[#b8860b] text-[#f8e1a1] flex items-center justify-center hover:bg-white/10 transition-colors">
              <i className={`fas ${isMuted ? 'fa-volume-mute' : 'fa-volume-up'} text-2xl sm:text-3xl`}></i>
            </button>
          </div>
        </div>
      </header>

      <main
        ref={containerRef}
        className="flex-1 w-full max-w-7xl p-4 flex items-center justify-center min-h-0"
      >
        {gameState.status === 'selecting' ? (
          <div className="bg-[#1a0a00]/90 backdrop-blur-md p-10 sm:p-20 border-8 border-[#b8860b] shadow-[0_0_80px_rgba(0,0,0,0.9)] text-center max-w-4xl w-full">
            <h2 className="text-5xl sm:text-7xl text-[#f8e1a1] font-black mb-8 tracking-widest" style={{ fontFamily: 'var(--font-art)' }}>選擇關卡</h2>
            <div className="mb-12 text-3xl sm:text-4xl text-white/80">
              <p>已解鎖關卡：<span className="text-[#b8860b] font-black">{progress.maxLevel}</span></p>
              <p className="mt-2">累計總分：<span className="text-[#b8860b] font-black">{progress.totalScore}</span></p>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 sm:gap-6 max-h-[400px] overflow-y-auto p-4">
              {Array.from({ length: progress.maxLevel }, (_, i) => i + 1).map(level => (
                <button
                  key={level}
                  onClick={() => startNewGame(level)}
                  className={`py-6 sm:py-8 ${level === progress.lastPlayedLevel
                    ? 'bg-[#b8860b] text-[#1a0a00]'
                    : 'bg-[#2d1b0d] text-[#f8e1a1]'
                    } border-4 border-[#b8860b] text-3xl sm:text-4xl font-black transition-all hover:scale-105 active:scale-95 shadow-xl`}
                >
                  {level}
                </button>
              ))}
            </div>

            <button
              onClick={() => startNewGame(progress.lastPlayedLevel)}
              className="mt-12 w-full py-8 bg-[#5d0000] hover:bg-[#7d2222] text-[#f8e1a1] border-4 border-[#b8860b] text-4xl sm:text-5xl font-black transition-all active:scale-95 shadow-xl"
            >
              繼續遊戲 (第 {progress.lastPlayedLevel} 關)
            </button>
          </div>
        ) : gameState.status === 'loading' ? (
          <div className="text-center">
            <div className="w-32 h-32 border-[12px] border-[#b8860b] border-t-transparent animate-spin mb-10"></div>
            <p className="text-[#f8e1a1] text-4xl font-black tracking-widest animate-pulse">正在擺牌...</p>
          </div>
        ) : gameState.status === 'won' ? (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/95 p-4 animate-fade-in">
            <div className="bg-[#5d0000] border-[12px] border-[#b8860b] p-12 sm:p-24 text-center max-w-3xl shadow-[0_0_120px_rgba(184,134,11,0.6)]">
              <h2 className="text-7xl sm:text-9xl font-black text-[#f8e1a1] mb-10" style={{ fontFamily: 'var(--font-art)' }}>大吉大利</h2>
              <p className="text-4xl sm:text-5xl text-white/90 mb-8">恭喜過關，頭腦清晰！</p>
              <p className="text-3xl sm:text-4xl text-[#b8860b] mb-16">第 {gameState.level} 關完成</p>
              {gameState.level < progress.maxLevel ? (
                <p className="text-2xl sm:text-3xl text-green-400 mb-8">已解鎖第 {progress.maxLevel} 關</p>
              ) : null}
              <div className="flex flex-col sm:flex-row gap-8">
                <button
                  onClick={() => startNewGame(gameState.level + 1)}
                  className="flex-1 py-8 bg-[#b8860b] text-[#5d0000] text-4xl sm:text-5xl font-black hover:bg-[#d4a017] transition-colors shadow-2xl"
                >
                  下一關
                </button>
                <button
                  onClick={() => { audioService.stopBGM(); setGameState(prev => ({ ...prev, status: 'selecting' })); }}
                  className="flex-1 py-8 bg-white/10 text-white border-4 border-white/20 text-4xl sm:text-5xl font-black hover:bg-white/20 shadow-2xl"
                >
                  選擇關卡
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
          >
            {gameState.status === 'no-moves' && (
              <div className="absolute inset-0 z-[2000] bg-black/80 flex items-center justify-center">
                <div className="bg-[#2d1b0d] border-8 border-[#b8860b] p-16 text-center max-w-xl">
                  <h3 className="text-5xl font-black text-[#f8e1a1] mb-16">牌路已盡</h3>
                  <button onClick={() => { audioService.playSelect(); setGameState(prev => ({ ...prev, tiles: shuffleTilesSolvable(prev.tiles), selectedId: null, status: 'playing' })); setHintIds([]); }} className="px-16 py-8 bg-[#b8860b] text-[#2d1b0d] text-4xl font-black shadow-2xl hover:bg-[#d4a017]">重新洗牌</button>
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

      {/* 底部控制列：特大化按鈕 */}
      <nav className="flex-none w-full bg-[#1a0a00] border-t-8 border-[#b8860b] p-4 sm:p-6">
        <div className="max-w-6xl mx-auto flex justify-between gap-6 sm:gap-10">
          <button onClick={() => { audioService.stopBGM(); setGameState(prev => ({ ...prev, status: 'selecting' })); }} className="flex-1 py-6 sm:py-8 bg-[#3d2b1f] border-2 border-white/10 text-[#f8e1a1] flex flex-col items-center hover:bg-[#4d3b2f] transition-all active:scale-95">
            <i className="fas fa-home text-3xl sm:text-4xl mb-2"></i>
            <span className="text-lg sm:text-2xl font-bold">選關</span>
          </button>
          <button onClick={() => { audioService.playSelect(); setGameState(prev => ({ ...prev, tiles: shuffleTilesSolvable(prev.tiles), selectedId: null, status: 'playing' })); setHintIds([]); }} disabled={gameState.status !== 'playing'} className="flex-1 py-6 sm:py-8 bg-[#3d2b1f] border-2 border-white/10 text-[#f8e1a1] flex flex-col items-center hover:bg-[#4d3b2f] transition-all disabled:opacity-20 active:scale-95">
            <i className="fas fa-sync-alt text-3xl sm:text-4xl mb-2"></i>
            <span className="text-lg sm:text-2xl font-bold">洗牌</span>
          </button>
          <button onClick={() => { audioService.playSelect(); setHintIds(findHint(gameState.tiles) || []); }} disabled={gameState.status !== 'playing'} className="flex-1 py-6 sm:py-8 bg-[#3d2b1f] border-2 border-white/10 text-[#f8e1a1] flex flex-col items-center hover:bg-[#4d3b2f] transition-all disabled:opacity-20 active:scale-95">
            <i className="fas fa-search text-3xl sm:text-4xl mb-2"></i>
            <span className="text-lg sm:text-2xl font-bold">提示</span>
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
          }} disabled={gameState.history.length === 0 || gameState.status !== 'playing'} className="flex-1 py-6 sm:py-8 bg-[#3d2b1f] border-2 border-white/10 text-[#f8e1a1] flex flex-col items-center hover:bg-[#4d3b2f] transition-all disabled:opacity-20 active:scale-95">
            <i className="fas fa-undo text-3xl sm:text-4xl mb-2"></i>
            <span className="text-lg sm:text-2xl font-bold">上一步</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default App;
