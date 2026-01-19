
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
      const timer = setTimeout(() => setShouldHide(true), 1200);
      return () => clearTimeout(timer);
    } else {
      setShouldHide(false);
      setIsVanishing(false);
    }
  }, [tile.isMatched]);

  if (shouldHide) return null;

  const { x, y, z, symbol, color } = tile;
  
  const vanishStyle = isVanishing ? {
    transform: 'translate(-50%, -50%) rotateY(180deg) scale(0)',
    opacity: 0,
    zIndex: 2000,
  } : {
    transform: isSelected ? 'translate(-50%, -60%) scale(1.1)' : 'translate(-50%, -50%)',
    opacity: isBlocked ? 0.7 : 1,
    zIndex: Math.floor(z * 10 + (isSelected ? 1000 : 0)),
  };
  
  const style: React.CSSProperties = {
    position: 'absolute',
    left: `calc(50% + ${(x - centerX) * 75 + z * 5}px)`,
    top: `calc(50% + ${(y - centerY) * 100 - z * 5}px)`,
    cursor: isBlocked || tile.isMatched ? 'not-allowed' : 'pointer',
    transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)', // 更具彈性的動畫
    perspective: '1200px',
    willChange: 'transform, opacity',
    ...vanishStyle
  };

  return (
    <div
      style={style}
      onClick={() => !isBlocked && !tile.isMatched && onClick(tile.id)}
      className={`
        relative w-[72px] h-[98px] sm:w-[88px] sm:h-[115px]
        rounded-xl border-[4px]
        flex items-center justify-center
        select-none active:scale-95
        shadow-[3px_3px_0px_#ccc,6px_6px_0px_#aaa,9px_9px_15px_rgba(0,0,0,0.3)]
        ${isSelected ? 'border-yellow-400 bg-yellow-50 shadow-2xl' : 'border-gray-200 bg-white'}
        ${isHint ? 'ring-[8px] ring-blue-400 ring-offset-2 animate-pulse' : ''}
        ${isBlocked ? 'bg-gray-100' : 'hover:brightness-105'}
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-black/5 pointer-events-none rounded-lg"></div>
      
      {/* 核心字體優化：強制字體順序，防止 iOS 將其渲染為 Emoji */}
      <span 
        style={{ 
          fontFamily: '"Noto Sans TC", "Apple Color Emoji", "Segoe UI Emoji", sans-serif',
          textRendering: 'optimizeLegibility'
        }}
        className={`text-6xl sm:text-8xl leading-none font-bold drop-shadow-sm select-none ${color}`}
      >
        {symbol}
      </span>

      {/* 底部裝飾條增加層次感 */}
      <div className="absolute bottom-1 right-2 opacity-20 text-[10px] font-black pointer-events-none">
        {tile.label}
      </div>

      {isSelected && (
        <div className="absolute inset-0 rounded-xl border-4 border-yellow-400 animate-pulse pointer-events-none"></div>
      )}
    </div>
  );
};

export default Tile;
