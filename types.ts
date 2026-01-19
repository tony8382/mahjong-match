
export enum TileType {
  DOT = 'DOT',      // 筒
  BAMBOO = 'BAMBOO', // 條
  CHAR = 'CHAR',   // 萬
  WIND = 'WIND',   // 風
  DRAGON = 'DRAGON', // 箭
  FLOWER = 'FLOWER', // 花
  SEASON = 'SEASON'  // 季
}

export type Difficulty = 'EASY' | 'STANDARD' | 'HARD';

export interface MahjongTile {
  id: string;
  type: TileType;
  value: number | string;
  x: number;
  y: number;
  z: number;
  isMatched: boolean;
  label: string;
  symbol: string;
  color: string;
}

export interface GameState {
  tiles: MahjongTile[];
  selectedId: string | null;
  score: number;
  moves: number;
  status: 'playing' | 'won' | 'no-moves' | 'loading' | 'selecting';
  history: string[][]; // IDs of matched pairs for undo
  difficulty: Difficulty;
}

export interface Encouragement {
  message: string;
  author: string;
}
