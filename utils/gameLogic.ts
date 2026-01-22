
import { MahjongTile, TileType } from '../types';
import { TILE_DEFINITIONS, generateLayoutForLevel } from '../constants';


/**
 * 判定牌是否被擋住
 * 一張牌如果上方有牌，或者左右兩側「同時」都有牌，則被擋住。
 * 特殊規則：如果全場只剩最後兩張且相同，則不視為被擋住。
 */
export const isTileBlocked = (tile: MahjongTile, allTiles: MahjongTile[]): boolean => {
  const activeTiles = allTiles.filter(t => !t.isMatched);

  // 特殊獲勝輔助：如果最後只剩兩張相同，無視遮擋直接解鎖。
  if (activeTiles.length === 2) {
    const [t1, t2] = activeTiles;
    if (t1.type === t2.type && t1.value === t2.value) {
      return false;
    }
  }

  const otherActiveTiles = activeTiles.filter(t => t.id !== tile.id);

  // 1. 【垂直遮擋】檢查上方 (Z 軸更高) 是否有任何重疊
  // 只要 X, Y 座標距離小於 1.0 (一單元)，就代表上方有牌壓住
  const isBlockedTop = otherActiveTiles.some(t =>
    t.z > tile.z &&
    Math.abs(t.x - tile.x) < 1.0 &&
    Math.abs(t.y - tile.y) < 1.0
  );
  if (isBlockedTop) return true;

  // 2. 【水平遮擋】經典規則：左右兩邊如果都有牌且同高度，就被擋住
  // 左右判定的範圍稍微放寬 (0.4 到 1.1 之間都視為鄰近牌)
  const isBlockedLeft = otherActiveTiles.some(t =>
    t.z === tile.z &&
    t.x < tile.x && t.x > tile.x - 1.1 &&
    Math.abs(t.y - tile.y) < 0.9
  );

  const isBlockedRight = otherActiveTiles.some(t =>
    t.z === tile.z &&
    t.x > tile.x && t.x < tile.x + 1.1 &&
    Math.abs(t.y - tile.y) < 0.9
  );

  // 只要有一邊是空的（或是頂層），就能拿
  return isBlockedLeft && isBlockedRight;
};

export const findHint = (tiles: MahjongTile[]): [string, string] | null => {
  // 只選出目前「絕對可以點擊」的牌
  const selectableTiles = tiles
    .filter(t => !t.isMatched && !isTileBlocked(t, tiles))
    // 重要：依照 Z 軸從高到低排序，優先提示最上面的牌
    .sort((a, b) => b.z - a.z);

  for (let i = 0; i < selectableTiles.length; i++) {
    for (let j = i + 1; j < selectableTiles.length; j++) {
      const a = selectableTiles[i];
      const b = selectableTiles[j];
      if (a.type === b.type && a.value === b.value) {
        return [a.id, b.id];
      }
    }
  }
  return null;
};

export const createGame = (level: number): MahjongTile[] => {
  const layout = generateLayoutForLevel(level);

  // 核心防止重複：過濾掉座標完全重疊（(x,y,z)均相同）的點，防止生成幽靈牌。
  // 注意：這不會刪除非重複層（z 軸不同）的正常疊加。
  const uniquePattern = layout.pattern.filter((p, index, self) =>
    index === self.findIndex((t) => t.x === p.x && t.y === p.y && t.z === p.z)
  );

  const totalPositions = uniquePattern.length;
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
      const pos = uniquePattern[i];
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
