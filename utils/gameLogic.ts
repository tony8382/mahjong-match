
import { MahjongTile, Difficulty, TileType } from '../types';
import { TILE_DEFINITIONS, LAYOUT_PATTERNS } from '../constants';

/**
 * 判定牌是否被擋住
 * 一張牌如果上方有牌，或者左右兩側「同時」都有牌，則被擋住。
 * 特殊規則：如果全場只剩最後兩張且相同，則不視為被擋住。
 */
export const isTileBlocked = (tile: MahjongTile, allTiles: MahjongTile[]): boolean => {
  const activeTiles = allTiles.filter(t => !t.isMatched);
  
  // 特殊獲勝輔助：如果只剩最後兩張且成對，直接解鎖讓長輩點擊
  if (activeTiles.length === 2) {
    const [t1, t2] = activeTiles;
    if (t1.type === t2.type && t1.value === t2.value) {
      return false;
    }
  }

  const otherActiveTiles = activeTiles.filter(t => t.id !== tile.id);
  
  // 1. 檢查上方 (Z 軸較高) 是否有任何重疊
  const isBlockedTop = otherActiveTiles.some(t => 
    t.z > tile.z && 
    Math.abs(t.x - tile.x) < 0.85 && 
    Math.abs(t.y - tile.y) < 0.85
  );
  if (isBlockedTop) return true;

  // 2. 檢查左側
  const isBlockedLeft = otherActiveTiles.some(t => 
    t.z === tile.z && 
    t.x <= tile.x - 0.7 && t.x >= tile.x - 1.3 && 
    Math.abs(t.y - tile.y) < 0.8
  );
  
  // 3. 檢查右側
  const isBlockedRight = otherActiveTiles.some(t => 
    t.z === tile.z && 
    t.x >= tile.x + 0.7 && t.x <= tile.x + 1.3 && 
    Math.abs(t.y - tile.y) < 0.8
  );

  // 左右都被擋住才算 Blocked
  return isBlockedLeft && isBlockedRight;
};

export const findHint = (tiles: MahjongTile[]): [string, string] | null => {
  const activeTiles = tiles.filter(t => !t.isMatched && !isTileBlocked(t, tiles));
  
  for (let i = 0; i < activeTiles.length; i++) {
    for (let j = i + 1; j < activeTiles.length; j++) {
      const a = activeTiles[i];
      const b = activeTiles[j];
      if (a.type === b.type && a.value === b.value) {
        return [a.id, b.id];
      }
    }
  }
  return null;
};

export const createGame = (difficulty: Difficulty): MahjongTile[] => {
  const layout = LAYOUT_PATTERNS[difficulty];
  const pattern = layout.pattern;
  const totalPositions = pattern.length;
  const usablePositions = totalPositions % 2 === 0 ? totalPositions : totalPositions - 1;
  
  let attempts = 0;
  let finalTiles: MahjongTile[] = [];

  while (attempts < 500) {
    const tiles: MahjongTile[] = [];
    const pairsNeeded = usablePositions / 2;
    let currentDeck: any[] = [];
    
    for (let k = 0; k < pairsNeeded; k++) {
      const def = TILE_DEFINITIONS[Math.floor(Math.random() * TILE_DEFINITIONS.length)];
      currentDeck.push({ ...def }, { ...def });
    }
    
    currentDeck = currentDeck.sort(() => Math.random() - 0.5);

    for (let i = 0; i < usablePositions; i++) {
      const pos = pattern[i];
      const def = currentDeck[i];
      tiles.push({
        id: `tile-${i}-${Date.now()}-${attempts}`,
        type: def.type,
        value: def.value,
        label: def.label,
        symbol: def.symbol,
        color: def.color,
        x: pos.x,
        y: pos.y,
        z: pos.z,
        isMatched: false
      });
    }

    if (findHint(tiles) !== null) {
      return tiles;
    }
    finalTiles = tiles;
    attempts++;
  }

  return finalTiles; 
};

export const shuffleTilesSolvable = (allTiles: MahjongTile[]): MahjongTile[] => {
  const activeTiles = allTiles.filter(t => !t.isMatched);
  const matchedTiles = allTiles.filter(t => t.isMatched);
  const positions = activeTiles.map(t => ({ x: t.x, y: t.y, z: t.z }));
  
  let attempts = 0;
  while (attempts < 100) {
    const shuffledPositions = [...positions].sort(() => Math.random() - 0.5);
    const newActiveTiles = activeTiles.map((t, i) => ({
      ...t,
      ...shuffledPositions[i]
    }));
    
    const combined = [...matchedTiles, ...newActiveTiles];
    if (findHint(combined) !== null) {
      return combined;
    }
    attempts++;
  }
  
  const finalPositions = [...positions].sort(() => Math.random() - 0.5);
  return [...matchedTiles, ...activeTiles.map((t, i) => ({ ...t, ...finalPositions[i] }))];
};
