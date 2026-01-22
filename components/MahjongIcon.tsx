
import React from 'react';
import { TileType } from '../types';

interface MahjongIconProps {
  type: TileType;
  value: number | string;
  className?: string;
}

const MahjongIcon: React.FC<MahjongIconProps> = ({ type, value, className = "" }) => {
  const isChar = type === TileType.CHAR;
  const isDot = type === TileType.DOT;
  const isBamboo = type === TileType.BAMBOO;
  const isWind = type === TileType.WIND;
  const isDragon = type === TileType.DRAGON;

  const COLORS = {
    RED: '#dc2626',   // 鮮艷紅
    GREEN: '#16a34a', // 鮮艷綠
    BLUE: '#2563eb',  // 鮮艷藍
    BLACK: '#000000'  // 純黑（最高對比度）
  };

  // 渲染萬子
  if (isChar) {
    const chars: Record<number, string> = { 1: '一', 2: '二', 3: '三', 4: '四', 5: '五', 6: '六', 7: '七', 8: '八', 9: '九' };
    return (
      <svg viewBox="0 0 100 120" className={className} style={{ width: '92%', height: '92%' }}>
        <text x="50" y="58" textAnchor="middle" fontSize="68" fontWeight="900" fill={COLORS.BLACK}>{chars[Number(value)]}</text>
        <text x="50" y="108" textAnchor="middle" fontSize="58" fontWeight="900" fill={COLORS.RED}>萬</text>
      </svg>
    );
  }

  // 渲染筒子
  if (isDot) {
    const v = Number(value);
    const dotCoords: Record<number, [number, number, string][]> = {
      1: [[50, 60, COLORS.RED]],
      2: [[50, 35, COLORS.BLUE], [50, 85, COLORS.BLUE]],
      3: [[25, 30, COLORS.BLUE], [50, 60, COLORS.BLUE], [75, 90, COLORS.BLUE]],
      4: [[30, 35, COLORS.BLUE], [70, 35, COLORS.GREEN], [30, 85, COLORS.GREEN], [70, 85, COLORS.BLUE]],
      5: [[25, 30, COLORS.BLUE], [75, 30, COLORS.GREEN], [50, 60, COLORS.RED], [25, 90, COLORS.GREEN], [75, 90, COLORS.BLUE]],
      6: [[30, 30, COLORS.GREEN], [70, 30, COLORS.GREEN], [30, 60, COLORS.RED], [70, 60, COLORS.RED], [30, 90, COLORS.RED], [70, 90, COLORS.RED]],
      7: [[25, 25, COLORS.GREEN], [50, 45, COLORS.GREEN], [75, 65, COLORS.GREEN], [30, 85, COLORS.RED], [70, 85, COLORS.RED], [30, 110, COLORS.RED], [70, 110, COLORS.RED]],
      8: [[30, 25, COLORS.BLUE], [70, 25, COLORS.BLUE], [30, 50, COLORS.BLUE], [70, 50, COLORS.BLUE], [30, 75, COLORS.BLUE], [70, 75, COLORS.BLUE], [30, 100, COLORS.BLUE], [70, 100, COLORS.BLUE]],
      9: [[25, 25, COLORS.GREEN], [50, 25, COLORS.GREEN], [75, 25, COLORS.GREEN], [25, 60, COLORS.RED], [50, 60, COLORS.RED], [75, 60, COLORS.RED], [25, 95, COLORS.BLUE], [50, 95, COLORS.BLUE], [75, 95, COLORS.BLUE]],
    };
    return (
      <svg viewBox="0 0 100 120" className={className} style={{ width: '92%', height: '92%' }}>
        {(dotCoords[v] || []).map(([cx, cy, color], i) => (
          <circle key={i} cx={cx} cy={cy} r={v === 1 ? 32 : 15} fill={color} stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
        ))}
      </svg>
    );
  }

  // 渲染條子
  if (isBamboo) {
    const v = Number(value);
    const bCoords: Record<number, [number, number, string][]> = {
      1: [[50, 60, COLORS.GREEN]],
      2: [[50, 35, COLORS.GREEN], [50, 85, COLORS.BLUE]],
      3: [[50, 35, COLORS.GREEN], [30, 85, COLORS.BLUE], [70, 85, COLORS.BLUE]],
      4: [[35, 35, COLORS.BLUE], [65, 35, COLORS.GREEN], [35, 85, COLORS.GREEN], [65, 85, COLORS.BLUE]],
      5: [[30, 35, COLORS.BLUE], [70, 35, COLORS.GREEN], [50, 60, COLORS.RED], [30, 85, COLORS.GREEN], [70, 85, COLORS.BLUE]],
      6: [[30, 35, COLORS.GREEN], [50, 35, COLORS.GREEN], [70, 35, COLORS.GREEN], [30, 85, COLORS.BLUE], [50, 85, COLORS.BLUE], [70, 85, COLORS.BLUE]],
      7: [[50, 25, COLORS.RED], [30, 55, COLORS.GREEN], [50, 55, COLORS.GREEN], [70, 55, COLORS.GREEN], [30, 85, COLORS.BLUE], [50, 85, COLORS.BLUE], [70, 85, COLORS.BLUE]],
      8: [[30, 30, COLORS.GREEN], [50, 30, COLORS.GREEN], [70, 30, COLORS.GREEN], [30, 60, COLORS.RED], [70, 60, COLORS.RED], [30, 90, COLORS.BLUE], [50, 90, COLORS.BLUE], [70, 90, COLORS.BLUE]],
      9: [[30, 30, COLORS.GREEN], [50, 30, COLORS.GREEN], [70, 30, COLORS.GREEN], [30, 60, COLORS.RED], [50, 60, COLORS.RED], [70, 60, COLORS.RED], [30, 90, COLORS.BLUE], [50, 90, COLORS.BLUE], [70, 90, COLORS.BLUE]],
    };
    return (
      <svg viewBox="0 0 100 120" className={className} style={{ width: '92%', height: '92%' }}>
        {(bCoords[v] || []).map(([cx, cy, color], i) => (
          <rect key={i} x={cx - 8} y={cy - 16} width="16" height="32" rx="5" fill={color} stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
        ))}
      </svg>
    );
  }

  const windDragonMap: Record<string, { label: string, color: string }> = {
    'E': { label: '東', color: COLORS.BLACK },
    'S': { label: '南', color: COLORS.BLACK },
    'W': { label: '西', color: COLORS.BLACK },
    'N': { label: '北', color: COLORS.BLACK },
    'C': { label: '中', color: COLORS.RED },
    'F': { label: '發', color: COLORS.GREEN },
    'P': { label: '白', color: COLORS.BLUE }
  };

  const item = windDragonMap[String(value)];
  if (item) {
    return (
      <svg viewBox="0 0 100 120" className={className} style={{ width: '94%', height: '94%' }}>
        {value === 'P' ? (
          <rect x="18" y="22" width="64" height="76" rx="5" fill="none" stroke={item.color} strokeWidth="14" />
        ) : (
          <text x="50" y="92" textAnchor="middle" fontSize="95" fontWeight="900" fill={item.color}>{item.label}</text>
        )}
      </svg>
    );
  }

  return null;
};

export default MahjongIcon;
