
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
    zIndex: 5000,
  } : {
    transform: isSelected ? 'translate(-50%, -65%) scale(1.08)' : 'translate(-50%, -50%)',
    opacity: isBlocked ? 0.7 : 1,
    zIndex: Math.floor(z * 100 + (isSelected ? 4000 : 0)),
  };

  const style: React.CSSProperties = {
    position: 'absolute',
    left: `calc(50% + ${(x - centerX) * 96 + z * 10}px)`,
    top: `calc(50% + ${(y - centerY) * 132 - z * 10}px)`,
    cursor: isBlocked || tile.isMatched ? 'not-allowed' : 'pointer',
    transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
    perspective: '1200px',
    willChange: 'transform, opacity',
    ...vanishStyle
  };

  return (
    <div
      style={style}
      onClick={() => !isBlocked && !tile.isMatched && onClick(tile.id)}
      className={`
        relative w-[86px] h-[120px] sm:w-[102px] sm:h-[142px]
        rounded-md border border-gray-200
        flex items-center justify-center
        select-none active:scale-95 transition-shadow
        /* 厚實的 3D 立體底座與陰影 */
        shadow-[
          -1px_-1px_3px_rgba(255,255,255,0.8)_inset, 
          1px_1px_3px_rgba(0,0,0,0.1)_inset,      
          1px_1px_0px_#eee,                       
          2px_2px_0px_#ddd,
          3px_3px_0px_#ccc,
          4px_4px_0px_#aaa,
          5px_5px_0px_#999,
          6px_6px_0px_#2d5a27,                    
          7px_7px_0px_#2d5a27,
          8px_8px_0px_#2d5a27,
          9px_9px_0px_#2d5a27,
          10px_10px_0px_#2d5a27,
          11px_11px_0px_#2d5a27,
          12px_12px_0px_#1e3d1a,                 
          18px_18px_25px_rgba(0,0,0,0.5)         
        ]
        ${isSelected ? 'bg-[#ffedb3] ring-4 ring-amber-500 ring-offset-2 scale-105' : 'bg-white'}
        ${isHint ? 'ring-4 ring-yellow-400 animate-pulse bg-yellow-50' : ''}
        ${isBlocked ? 'brightness-[0.65] grayscale-[0.3]' : 'hover:brightness-105'}
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
