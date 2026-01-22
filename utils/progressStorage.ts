import { GameProgress } from '../types';

const STORAGE_KEY = 'mahjong-match-progress';

/**
 * 從 localStorage 讀取遊戲進度
 */
export const loadProgress = (): GameProgress => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.error('Failed to load progress:', error);
    }

    // 預設進度
    return {
        maxLevel: 1,
        totalScore: 0,
        lastPlayedLevel: 1
    };
};

/**
 * 儲存遊戲進度到 localStorage
 */
export const saveProgress = (progress: GameProgress): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
        console.error('Failed to save progress:', error);
    }
};

/**
 * 更新最高關卡（過關時調用）
 */
export const unlockNextLevel = (currentLevel: number, score: number): GameProgress => {
    const progress = loadProgress();
    const newProgress: GameProgress = {
        maxLevel: Math.max(progress.maxLevel, currentLevel + 1),
        totalScore: progress.totalScore + score,
        lastPlayedLevel: currentLevel
    };
    saveProgress(newProgress);
    return newProgress;
};

/**
 * 更新最後遊玩的關卡
 */
export const updateLastPlayedLevel = (level: number): void => {
    const progress = loadProgress();
    progress.lastPlayedLevel = level;
    saveProgress(progress);
};

/**
 * 清除所有進度（重置遊戲）
 */
export const resetProgress = (): void => {
    localStorage.removeItem(STORAGE_KEY);
};
