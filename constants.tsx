
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
  color: string;
}

export const TILE_DEFINITIONS: TileDef[] = [
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map(v => ({
    type: TileType.CHAR, value: v, label: `${v}萬`, color: 'text-gray-900'
  })),
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map(v => ({
    type: TileType.DOT, value: v, label: `${v}筒`, color: 'text-gray-900'
  })),
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map(v => ({
    type: TileType.BAMBOO, value: v, label: `${v}條`, color: 'text-gray-900'
  })),
  { type: TileType.WIND, value: 'E', label: '東', color: 'text-gray-900' },
  { type: TileType.WIND, value: 'S', label: '南', color: 'text-gray-900' },
  { type: TileType.WIND, value: 'W', label: '西', color: 'text-gray-900' },
  { type: TileType.WIND, value: 'N', label: '北', color: 'text-gray-900' },
  { type: TileType.DRAGON, value: 'C', label: '中', color: 'text-gray-900' },
  { type: TileType.DRAGON, value: 'F', label: '發', color: 'text-gray-900' },
  { type: TileType.DRAGON, value: 'P', label: '白', color: 'text-gray-900' },
];

/**
 * 各種經典麻將佈局樣式
 */

// 金字塔佈局
const pyramidLayout = (scale: number) => {
  const pattern: Array<{ x: number; y: number; z: number }> = [];
  const baseSize = 6 + scale * 2;
  const layers = 3 + Math.floor(scale / 2);

  for (let z = 0; z < layers; z++) {
    const size = baseSize - z * 2;
    const offset = z;
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        pattern.push({ x: x + offset, y: y + offset, z });
      }
    }
  }

  return { pattern, center: { x: baseSize / 2, y: baseSize / 2 }, baseWidth: baseSize + 2, baseHeight: baseSize + 2 };
};

// 十字架佈局
const crossLayout = (scale: number) => {
  const pattern: Array<{ x: number; y: number; z: number }> = [];
  const size = 5 + scale;
  const width = 3 + Math.floor(scale / 2);
  const center = Math.floor(size / 2);

  // 橫向
  for (let x = 0; x < size; x++) {
    for (let y = center - Math.floor(width / 2); y <= center + Math.floor(width / 2); y++) {
      pattern.push({ x, y, z: 0 });
    }
  }

  // 縱向
  for (let y = 0; y < size; y++) {
    for (let x = center - Math.floor(width / 2); x <= center + Math.floor(width / 2); x++) {
      if (!pattern.some(p => p.x === x && p.y === y && p.z === 0)) {
        pattern.push({ x, y, z: 0 });
      }
    }
  }

  // 中心加層
  if (scale >= 2) {
    for (let z = 1; z <= Math.floor(scale / 2); z++) {
      const layerSize = width - z;
      for (let x = center - Math.floor(layerSize / 2); x <= center + Math.floor(layerSize / 2); x++) {
        for (let y = center - Math.floor(layerSize / 2); y <= center + Math.floor(layerSize / 2); y++) {
          pattern.push({ x, y, z });
        }
      }
    }
  }

  return { pattern, center: { x: size / 2, y: size / 2 }, baseWidth: size, baseHeight: size };
};

// 蝴蝶佈局
const butterflyLayout = (scale: number) => {
  const pattern: Array<{ x: number; y: number; z: number }> = [];
  const wingSize = 3 + scale;
  const bodyWidth = 2;

  // 左翼
  for (let x = 0; x < wingSize; x++) {
    for (let y = 0; y < wingSize; y++) {
      pattern.push({ x, y, z: 0 });
    }
  }

  // 右翼
  for (let x = 0; x < wingSize; x++) {
    for (let y = 0; y < wingSize; y++) {
      pattern.push({ x: x + wingSize + bodyWidth, y, z: 0 });
    }
  }

  // 身體
  for (let x = wingSize; x < wingSize + bodyWidth; x++) {
    for (let y = Math.floor(wingSize / 3); y < wingSize - Math.floor(wingSize / 3); y++) {
      pattern.push({ x, y, z: 0 });
    }
  }

  // 中心層
  if (scale >= 1) {
    const centerX = wingSize + Math.floor(bodyWidth / 2);
    const centerY = Math.floor(wingSize / 2);
    for (let z = 1; z <= Math.min(2, scale); z++) {
      const size = 3 - z;
      for (let x = centerX - Math.floor(size / 2); x <= centerX + Math.floor(size / 2); x++) {
        for (let y = centerY - Math.floor(size / 2); y <= centerY + Math.floor(size / 2); y++) {
          pattern.push({ x, y, z });
        }
      }
    }
  }

  const totalWidth = wingSize * 2 + bodyWidth;
  return { pattern, center: { x: totalWidth / 2, y: wingSize / 2 }, baseWidth: totalWidth, baseHeight: wingSize };
};

// 龜殼佈局（六邊形）
const turtleLayout = (scale: number) => {
  const pattern: Array<{ x: number; y: number; z: number }> = [];
  const radius = 3 + scale;
  const centerX = radius;
  const centerY = radius;

  // 創建六邊形
  for (let x = 0; x <= radius * 2; x++) {
    for (let y = 0; y <= radius * 2; y++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= radius && Math.abs(dx) + Math.abs(dy) <= radius * 1.5) {
        pattern.push({ x, y, z: 0 });
      }
    }
  }

  // 中心層
  for (let z = 1; z <= Math.min(3, scale); z++) {
    const layerRadius = radius - z;
    for (let x = centerX - layerRadius; x <= centerX + layerRadius; x++) {
      for (let y = centerY - layerRadius; y <= centerY + layerRadius; y++) {
        const dx = x - centerX;
        const dy = y - centerY;
        if (Math.abs(dx) + Math.abs(dy) <= layerRadius) {
          pattern.push({ x, y, z });
        }
      }
    }
  }

  const size = radius * 2 + 1;
  return { pattern, center: { x: centerX, y: centerY }, baseWidth: size, baseHeight: size };
};

// 城堡佈局
const castleLayout = (scale: number) => {
  const pattern: Array<{ x: number; y: number; z: number }> = [];
  const width = 8 + scale * 2;
  const height = 6 + scale;
  const towerWidth = 2 + Math.floor(scale / 2);

  // 1. 左塔：x 從 0 到 towerWidth-1
  for (let x = 0; x < towerWidth; x++) {
    for (let y = 0; y < height; y++) {
      pattern.push({ x, y, z: 0 });
    }
  }

  // 2. 右塔：x 從 width-towerWidth 到 width-1
  for (let x = width - towerWidth; x < width; x++) {
    for (let y = 0; y < height; y++) {
      pattern.push({ x, y, z: 0 });
    }
  }

  // 3. 中間連通牆：x 夾在塔之間，y 低於塔的高度
  // 注意：這裡的 y 從 0 開始，x 起點是 towerWidth，因此與塔柱完全【互斥】不重疊
  const wallMidHeight = Math.floor(height / 2);
  for (let x = towerWidth; x < width - towerWidth; x++) {
    for (let y = 0; y < wallMidHeight; y++) {
      pattern.push({ x, y, z: 0 });
    }
  }

  // 塔頂層
  if (scale >= 1) {
    for (let z = 1; z <= Math.min(2, scale); z++) {
      // 左塔頂
      for (let x = 0; x < towerWidth - z; x++) {
        for (let y = height - towerWidth + z; y < height; y++) {
          pattern.push({ x, y, z });
        }
      }
      // 右塔頂
      for (let x = width - towerWidth + z; x < width; x++) {
        for (let y = height - towerWidth + z; y < height; y++) {
          pattern.push({ x, y, z });
        }
      }
    }
  }

  return { pattern, center: { x: width / 2, y: height / 2 }, baseWidth: width, baseHeight: height };
};

// 鑽石佈局
const diamondLayout = (scale: number) => {
  const pattern: Array<{ x: number; y: number; z: number }> = [];
  const size = 5 + scale;
  const center = Math.floor(size / 2);

  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      const dx = Math.abs(x - center);
      const dy = Math.abs(y - center);
      if (dx + dy <= center) {
        pattern.push({ x, y, z: 0 });
      }
    }
  }

  // 中心層
  for (let z = 1; z <= Math.min(3, scale); z++) {
    const layerSize = center - z;
    for (let x = center - layerSize; x <= center + layerSize; x++) {
      for (let y = center - layerSize; y <= center + layerSize; y++) {
        const dx = Math.abs(x - center);
        const dy = Math.abs(y - center);
        if (dx + dy <= layerSize) {
          pattern.push({ x, y, z });
        }
      }
    }
  }

  return { pattern, center: { x: center, y: center }, baseWidth: size, baseHeight: size };
};

// 階梯佈局
const stairLayout = (scale: number) => {
  const pattern: Array<{ x: number; y: number; z: number }> = [];
  const steps = 4 + scale;
  const stepWidth = 3 + Math.floor(scale / 2);

  for (let step = 0; step < steps; step++) {
    for (let x = step * 2; x < step * 2 + stepWidth; x++) {
      for (let y = step * 2; y < step * 2 + stepWidth; y++) {
        pattern.push({ x, y, z: step });
      }
    }
  }

  const totalSize = (steps - 1) * 2 + stepWidth;
  return { pattern, center: { x: totalSize / 2, y: totalSize / 2 }, baseWidth: totalSize, baseHeight: totalSize };
};

/**
 * 根據關卡動態生成佈局
 * 每個關卡使用不同的造型，讓遊戲更有趣
 */
export const generateLayoutForLevel = (level: number) => {
  // 計算難度係數
  const scale = Math.floor((level - 1) / 3);

  // 根據關卡選擇不同的佈局樣式（每 7 關循環一次）
  const layoutType = (level - 1) % 7;

  let layout;
  switch (layoutType) {
    case 0:
      layout = pyramidLayout(scale);
      break;
    case 1:
      layout = crossLayout(scale);
      break;
    case 2:
      layout = butterflyLayout(scale);
      break;
    case 3:
      layout = turtleLayout(scale);
      break;
    case 4:
      layout = castleLayout(scale);
      break;
    case 5:
      layout = diamondLayout(scale);
      break;
    case 6:
      layout = stairLayout(scale);
      break;
    default:
      layout = pyramidLayout(scale);
  }

  // 重要提醒：這裡過濾的是「同一坐標且同一高度 (x,y,z 均相同)」的重複點。
  // 不同層 (z 不同) 的「疊加」是被允許且保留的。
  const uniquePattern = layout.pattern.filter((p, index, self) =>
    index === self.findIndex((t) => (
      t.x === p.x && t.y === p.y && t.z === p.z
    ))
  );

  return { ...layout, pattern: uniquePattern };
};
