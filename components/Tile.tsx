
import React, { useState, useEffect } from 'react';
import { MahjongTile } from '../types';
import MahjongIcon from './MahjongIcon';

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

  const { x, y, z, color } = tile;
  
  const vanishStyle = isVanishing ? {
    transform: 'translate(-50%, -50%) rotateY(180deg) scale(0)',
    opacity: 0,
    zIndex: 2000,
  } : {
    transform: isSelected ? 'translate(-50%, -60%) scale(1.05)' : 'translate(-50%, -50%)',
    opacity: isBlocked ? 0.6 : 1,
    zIndex: Math.floor(z * 10 + (isSelected ? 1000 : 0)),
  };
  
  const style: React.CSSProperties = {
    position: 'absolute',
    left: `calc(50% + ${(x - centerX) * 82 + z * 4}px)`,
    top: `calc(50% + ${(y - centerY) * 110 - z * 4}px)`,
    cursor: isBlocked || tile.isMatched ? 'not-allowed' : 'pointer',
    transition: 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
    perspective: '1200px',
    willChange: 'transform, opacity',
    ...vanishStyle
  };

  return (
    <div
      style={style}
      onClick={() => !isBlocked && !tile.isMatched && onClick(tile.id)}
      className={`
        relative w-[80px] h-[112px] sm:w-[98px] sm:h-[135px]
        rounded-md border-t border-l border-gray-100
        flex items-center justify-center
        select-none active:scale-95
        /* 仿實體麻將的側面陰影與厚度 */
        shadow-[
          1px_1px_0px_#ddd,
          2px_2px_0px_#ccc,
          3px_3px_0px_#bbb,
          4px_4px_0px_#aaa,
          5px_5px_0px_#2d5a27, /* 側面綠色層 */
          8px_8px_15px_rgba(0,0,0,0.4)
        ]
        ${isSelected ? 'bg-[#fff9e6] ring-4 ring-yellow-600 ring-offset-2' : 'bg-[#fffef0]'}
        ${isHint ? 'ring-4 ring-amber-400 animate-pulse' : ''}
        ${isBlocked ? 'brightness-75' : 'hover:brightness-105'}
      `}
    >
      {/* 牌面微光與微紋理 */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-black/10 pointer-events-none rounded-sm"></div>
      
      <div className="w-full h-full flex items-center justify-center p-2">
        <MahjongIcon 
          type={tile.type} 
          value={tile.value} 
          className={color}
        />
      </div>

      {isSelected && (
        <div className="absolute inset-0 rounded-sm border-2 border-yellow-600/50 pointer-events-none"></div>
      )}
    </div>
  );
};

export default Tile;
