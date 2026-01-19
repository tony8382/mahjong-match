
import { TileType } from './types';

export const TILE_COLORS = {
  GREEN: 'text-green-700',
  RED: 'text-red-600',
  BLUE: 'text-blue-700',
  BLACK: 'text-gray-900',
};

export interface TileDef {
  type: TileType;
  value: number | string;
  label: string;
  symbol: string;
  color: string;
}

// 增加 \uFE0E (Variation Selector-15) 以防止 iOS/Android 將 Unicode 麻將轉為 Emoji
export const TILE_DEFINITIONS: TileDef[] = [
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map(v => ({ 
    type: TileType.CHAR, value: v, label: `${v}萬`, symbol: String.fromCodePoint(0x1F007 + v - 1) + '\uFE0E', color: 'text-red-600' 
  })),
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map(v => ({ 
    type: TileType.DOT, value: v, label: `${v}筒`, symbol: String.fromCodePoint(0x1F019 + v - 1) + '\uFE0E', color: 'text-blue-700' 
  })),
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map(v => ({ 
    type: TileType.BAMBOO, value: v, label: `${v}條`, symbol: String.fromCodePoint(0x1F010 + v - 1) + '\uFE0E', color: 'text-green-700' 
  })),
  { type: TileType.WIND, value: 'E', label: '東', symbol: '🀀\uFE0E', color: 'text-gray-900' },
  { type: TileType.WIND, value: 'S', label: '南', symbol: '🀁\uFE0E', color: 'text-gray-900' },
  { type: TileType.WIND, value: 'W', label: '西', symbol: '🀂\uFE0E', color: 'text-gray-900' },
  { type: TileType.WIND, value: 'N', label: '北', symbol: '🀃\uFE0E', color: 'text-gray-900' },
  { type: TileType.DRAGON, value: 'C', label: '中', symbol: '🀄\uFE0E', color: 'text-red-600' },
  { type: TileType.DRAGON, value: 'F', label: '發', symbol: '🀅\uFE0E', color: 'text-green-700' },
  { type: TileType.DRAGON, value: 'P', label: '白', symbol: '🀆\uFE0E', color: 'text-blue-500' },
];

export const LAYOUT_PATTERNS = {
  EASY: {
    center: { x: 2, y: 1.5 },
    pattern: [
      ...Array.from({ length: 4 }, (_, i) => Array.from({ length: 4 }, (_, j) => ({ x: i, y: j, z: 0 }))).flat(),
      ...Array.from({ length: 2 }, (_, i) => Array.from({ length: 2 }, (_, j) => ({ x: i + 1, y: j + 1, z: 1 }))).flat(),
    ]
  },
  STANDARD: {
    center: { x: 3.5, y: 2.5 },
    pattern: [
      ...Array.from({ length: 8 }, (_, i) => Array.from({ length: 6 }, (_, j) => ({ x: i, y: j, z: 0 }))).flat(),
      ...Array.from({ length: 6 }, (_, i) => Array.from({ length: 4 }, (_, j) => ({ x: i + 1, y: j + 1, z: 1 }))).flat(),
      ...Array.from({ length: 4 }, (_, i) => Array.from({ length: 2 }, (_, j) => ({ x: i + 2, y: j + 2, z: 2 }))).flat(),
      { x: 3.5, y: 2.5, z: 3 }
    ]
  },
  HARD: {
    center: { x: 4.5, y: 3.5 },
    pattern: [
      ...Array.from({ length: 10 }, (_, i) => Array.from({ length: 8 }, (_, j) => ({ x: i, y: j, z: 0 }))).flat(),
      ...Array.from({ length: 8 }, (_, i) => Array.from({ length: 6 }, (_, j) => ({ x: i + 1, y: j + 1, z: 1 }))).flat(),
      ...Array.from({ length: 6 }, (_, i) => Array.from({ length: 4 }, (_, j) => ({ x: i + 2, y: j + 2, z: 2 }))).flat(),
      ...Array.from({ length: 4 }, (_, i) => Array.from({ length: 2 }, (_, j) => ({ x: i + 3, y: j + 3, z: 3 }))).flat(),
      { x: 4.5, y: 3.5, z: 4 }
    ]
  }
};
