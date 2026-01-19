
import React, { useState, useEffect } from 'react';
import { MahjongTile } from '../types';

interface TileProps {
  tile: MahjongTile;
  isSelected: boolean;
  isHint: boolean;
  isBlocked: boolean;
  onClick: (id: string) => void;
  centerX: number;
  centerY: number;
}

const Tile: React.FC<TileProps> = ({ tile, isSelected, isHint, isBlocked, onClick, centerX, centerY }) => {
  const [shouldHide, setShouldHide] = useState(false);
  const [isVanishing, setIsVanishing] = useState(false);

  useEffect(() => {
    if (tile.isMatched) {
      setIsVanishing(true);
      // 動畫時間延長至 1200ms，讓長輩能完整看到翻轉與縮小
      const timer = setTimeout(() => setShouldHide(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [tile.isMatched]);

  if (shouldHide) return null;

  const { x, y, z, symbol, color } = tile;
  
  // 消失動畫：強化的翻轉、縮小與漸隱
  const vanishStyle = isVanishing ? {
    transform: 'translate(-50%, -50%) rotateY(180deg) scale(0)',
    opacity: 0,
    zIndex: 2000,
  } : {
    transform: isSelected ? 'translate(-50%, -60%) scale(1.1)' : 'translate(-50%, -50%)',
    opacity: isBlocked ? 0.6 : 1,
    zIndex: z * 10 + (isSelected ? 1000 : 0),
  };
  
  const style: React.CSSProperties = {
    position: 'absolute',
    left: `calc(50% + ${(x - centerX) * 75 + z * 5}px)`,
    top: `calc(50% + ${(y - centerY) * 100 - z * 5}px)`,
    cursor: isBlocked || tile.isMatched ? 'not-allowed' : 'pointer',
    transition: 'all 1.2s ease-in-out', // 慢速平滑曲線
    perspective: '1200px',
    ...vanishStyle
  };

  return (
    <div
      style={style}
      onClick={() => !isBlocked && !tile.isMatched && onClick(tile.id)}
      className={`
        relative w-[70px] h-[95px] sm:w-[85px] sm:h-[110px]
        rounded-xl border-[4px]
        flex items-center justify-center
        select-none active:scale-95
        shadow-[4px_4px_0px_#bbb,8px_8px_0px_#999]
        ${isSelected ? 'border-yellow-400 bg-yellow-50 shadow-2xl' : 'border-gray-200 bg-white'}
        ${isHint ? 'ring-[10px] ring-blue-400 animate-pulse' : ''}
        ${isBlocked ? 'bg-gray-200 grayscale' : 'hover:brightness-105'}
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-black/5 pointer-events-none rounded-lg"></div>
      
      {/* 超大麻將圖示 */}
      <span className={`text-6xl sm:text-8xl leading-none font-normal drop-shadow-md ${color}`}>
        {symbol}
      </span>

      {isSelected && (
        <div className="absolute inset-0 rounded-xl border-4 border-yellow-400 animate-pulse pointer-events-none"></div>
      )}
    </div>
  );
};

export default Tile;
