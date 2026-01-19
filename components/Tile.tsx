
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
      // 動畫時間延長至 800ms，讓長輩看清楚翻轉縮小的過程
      const timer = setTimeout(() => setShouldHide(true), 800);
      return () => clearTimeout(timer);
    }
  }, [tile.isMatched]);

  if (shouldHide) return null;

  const { x, y, z, symbol, color } = tile;
  
  // 消失動畫組合：翻轉 180 度 + 縮小為 0 + 漸隱
  const vanishTransform = isVanishing ? 'rotateY(180deg) scale(0)' : '';
  
  const style: React.CSSProperties = {
    position: 'absolute',
    left: `calc(50% + ${(x - centerX) * 75 + z * 5}px)`,
    top: `calc(50% + ${(y - centerY) * 100 - z * 5}px)`,
    transform: `translate(-50%, -50%) ${vanishTransform}`,
    zIndex: z * 10 + (isSelected ? 1000 : 0),
    cursor: isBlocked || tile.isMatched ? 'not-allowed' : 'pointer',
    transition: 'all 0.8s cubic-bezier(0.19, 1, 0.22, 1)', // 使用平滑的慢速曲線
    opacity: isVanishing ? 0 : (isBlocked ? 0.6 : 1),
    perspective: '1000px', // 增加 3D 透視感
  };

  return (
    <div
      style={style}
      onClick={() => !isBlocked && !tile.isMatched && onClick(tile.id)}
      className={`
        relative w-[70px] h-[95px] sm:w-[85px] sm:h-[110px]
        rounded-xl border-[4px]
        flex items-center justify-center
        select-none active:scale-90
        shadow-[4px_4px_0px_#bbb,8px_8px_0px_#999]
        ${isSelected ? 'border-yellow-400 bg-yellow-50 -translate-y-4 shadow-2xl scale-110' : 'border-gray-200 bg-white'}
        ${isHint ? 'ring-8 ring-blue-400 animate-pulse' : ''}
        ${isBlocked ? 'bg-gray-200 grayscale' : 'hover:brightness-105 hover:-translate-y-1'}
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-black/5 pointer-events-none rounded-lg"></div>
      
      {/* 超大麻將圖示 */}
      <span className={`text-6xl sm:text-8xl leading-none font-normal drop-shadow-md ${color} transition-transform duration-500`}>
        {symbol}
      </span>

      {isSelected && (
        <div className="absolute inset-0 rounded-xl border-4 border-yellow-400 animate-pulse pointer-events-none"></div>
      )}
    </div>
  );
};

export default Tile;
