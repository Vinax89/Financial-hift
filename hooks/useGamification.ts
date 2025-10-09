/**
 * @fileoverview Gamification system hook for Financial $hift
 * @description Manages XP, levels, badges, and achievement tracking
 * to encourage user engagement and financial progress
 */

import { useState, useEffect, useCallback } from 'react';
import { Gamification } from '@/api/entities';
import { User } from '@/api/entities';
import { useToast } from '@/ui/use-toast';
import { logError } from '@/utils/logger';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Badge identifier
 */
export type BadgeId = 
  | 'FIRST_TRANSACTION'
  | 'FIRST_SHIFT'
  | 'FIRST_GOAL'
  | 'BUDGET_MASTER'
  | 'DEBT_CRUSHER'
  | 'SAVER'
  | 'LEVEL_5'
  | 'LEVEL_10'
  | 'LEVEL_25'
  | 'WEEK_STREAK'
  | 'MONTH_STREAK'
  | 'ANALYZER'
  | 'OPTIMIZER'
  | 'PLANNER';

/**
 * Badge definition
 */
export interface Badge {
  /** Display name of the badge */
  name: string;
  /** Description of how to earn this badge */
  description: string;
}

/**
 * Game state for a user
 */
export interface GameState {
  /** Unique identifier */
  id: string;
  /** User's email */
  user_email: string;
  /** Current experience points */
  xp: number;
  /** Current level */
  level: number;
  /** Earned badge IDs */
  badges: BadgeId[];
  /** Last update timestamp */
  last_updated: string;
}

/**
 * Level progress information
 */
export interface LevelProgress {
  /** Current level */
  level: number;
  /** Current XP in this level */
  xp: number;
  /** Progress percentage to next level (0-100) */
  progress: number;
  /** XP required to reach next level */
  xpToNext: number;
}

/**
 * Trackable action types
 */
export type GameAction =
  | 'transaction_added'
  | 'shift_added'
  | 'goal_created'
  | 'goal_achieved'
  | 'debt_paid_off'
  | 'budget_created'
  | 'budget_optimized'
  | 'ai_analysis'
  | 'scenario_run';

/**
 * Return type of useGamification hook
 */
export interface UseGamificationReturn {
  /** Current game state (null if not loaded) */
  gameState: GameState | null;
  /** Whether game state is loading */
  isLoading: boolean;
  /** Award XP to user */
  awardXp: (amount: number, reason?: string) => Promise<void>;
  /** Award badge to user */
  awardBadge: (badgeId: BadgeId) => Promise<void>;
  /** Track action and award appropriate XP/badges */
  trackAction: (action: GameAction, data?: Record<string, any>) => Promise<void>;
  /** Get level progress information */
  getProgress: () => LevelProgress;
  /** All available badges */
  allBadges: Record<BadgeId, Badge>;
  /** XP required per level */
  xpPerLevel: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const XP_PER_LEVEL = 100;

const BADGES: Record<BadgeId, Badge> = {
  FIRST_TRANSACTION: { 
    name: 'First Steps', 
    description: 'Added your first transaction' 
  },
  FIRST_SHIFT: { 
    name: 'Worker', 
    description: 'Logged your first shift' 
  },
  FIRST_GOAL: { 
    name: 'Dreamer', 
    description: 'Set your first financial goal' 
  },
  BUDGET_MASTER: { 
    name: 'Budget Master', 
    description: 'Created a complete monthly budget' 
  },
  DEBT_CRUSHER: { 
    name: 'Debt Crusher', 
    description: 'Paid off a debt account' 
  },
  SAVER: { 
    name: 'Saver', 
    description: 'Reached a savings goal' 
  },
  LEVEL_5: { 
    name: 'Financial Novice', 
    description: 'Reached level 5' 
  },
  LEVEL_10: { 
    name: 'Money Manager', 
    description: 'Reached level 10' 
  },
  LEVEL_25: { 
    name: 'Financial Expert', 
    description: 'Reached level 25' 
  },
  WEEK_STREAK: { 
    name: 'Consistent', 
    description: 'Used the app 7 days in a row' 
  },
  MONTH_STREAK: { 
    name: 'Dedicated', 
    description: 'Used the app 30 days in a row' 
  },
  ANALYZER: { 
    name: 'Analyzer', 
    description: 'Used AI financial analysis 10 times' 
  },
  OPTIMIZER: { 
    name: 'Optimizer', 
    description: 'Optimized your envelope budget' 
  },
  PLANNER: { 
    name: 'Planner', 
    description: 'Ran debt payoff scenarios' 
  }
};

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Gamification hook for XP, levels, and badges
 * 
 * @returns Gamification state and methods
 * 
 * @example
 * ```tsx
 * function Dashboard() {
 *   const { gameState, trackAction, getProgress } = useGamification();
 *   
 *   const handleTransactionAdded = async () => {
 *     await trackAction('transaction_added');
 *   };
 *   
 *   const progress = getProgress();
 *   
 *   return (
 *     <div>
 *       <p>Level {progress.level}</p>
 *       <p>XP: {progress.xp} / {progress.xpToNext}</p>
 *       <p>Progress: {progress.progress.toFixed(1)}%</p>
 *     </div>
 *   );
 * }
 * ```
 */
const useGamification = (): UseGamificationReturn => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  /**
   * Fetch current game state from API
   */
  const fetchGameState = useCallback(async (): Promise<void> => {
    try {
      const user = await User.me();
      if (!user) return;

      // Try to find existing gamification record
      const existingRecords = await Gamification.filter({ user_email: user.email });
      
      if (existingRecords.length > 0) {
        setGameState(existingRecords[0] as GameState);
      } else {
        // Create new gamification record
        const newGameState: Omit<GameState, 'id'> = {
          user_email: user.email,
          xp: 0,
          level: 1,
          badges: [],
          last_updated: new Date().toISOString()
        };
        const created = await Gamification.create(newGameState);
        setGameState(created as GameState);
      }
    } catch (error) {
      if ((import.meta as any).env?.DEV) {
        logError('Failed to fetch game state', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Initialize game state on mount
   */
  useEffect(() => {
    fetchGameState();
  }, [fetchGameState]);

  /**
   * Award a badge to the user
   */
  const awardBadge = useCallback(async (badgeId: BadgeId): Promise<void> => {
    if (!gameState || gameState.badges.includes(badgeId)) return;

    const badge = BADGES[badgeId];
    if (!badge) return;

    const newBadges = [...gameState.badges, badgeId];
    const updatedState: GameState = { 
      ...gameState, 
      badges: newBadges,
      last_updated: new Date().toISOString()
    };

    try {
      await Gamification.update(gameState.id, updatedState);
      setGameState(updatedState);

      toast({
        title: 'Badge Unlocked! 🏆',
        description: `You've earned the "${badge.name}" badge: ${badge.description}`,
      });
    } catch (error) {
      if ((import.meta as any).env?.DEV) {
        logError('Failed to award badge', error);
      }
    }
  }, [gameState, toast]);

  /**
   * Award XP to the user (handles level ups)
   */
  const awardXp = useCallback(async (
    amount: number, 
    reason = ''
  ): Promise<void> => {
    if (!gameState || amount <= 0) return;

    let newXp = gameState.xp + amount;
    let newLevel = gameState.level;
    let levelUp = false;

    // Calculate level progression
    let totalXpNeeded = newLevel * XP_PER_LEVEL;
    while (newXp >= totalXpNeeded) {
      newXp -= totalXpNeeded;
      newLevel++;
      levelUp = true;
      totalXpNeeded = newLevel * XP_PER_LEVEL;
    }

    const updatedState: GameState = { 
      ...gameState, 
      xp: newXp, 
      level: newLevel, 
      last_updated: new Date().toISOString()
    };

    try {
      await Gamification.update(gameState.id, updatedState);
      setGameState(updatedState);

      toast({
        title: `+${amount} XP! ⚡`,
        description: levelUp 
          ? `Level up! You've reached Level ${newLevel}! ${reason}` 
          : `Great work! ${reason}`,
      });

      // Check for level-based badges
      if (newLevel >= 5 && !gameState.badges.includes('LEVEL_5')) {
        await awardBadge('LEVEL_5');
      }
      if (newLevel >= 10 && !gameState.badges.includes('LEVEL_10')) {
        await awardBadge('LEVEL_10');
      }
      if (newLevel >= 25 && !gameState.badges.includes('LEVEL_25')) {
        await awardBadge('LEVEL_25');
      }
    } catch (error) {
      if ((import.meta as any).env?.DEV) {
        logError('Failed to award XP', error);
      }
    }
  }, [gameState, toast, awardBadge]);

  /**
   * Track user action and award appropriate XP/badges
   */
  const trackAction = useCallback(async (
    action: GameAction, 
    data: Record<string, any> = {}
  ): Promise<void> => {
    switch (action) {
      case 'transaction_added':
        await awardXp(10, 'Transaction recorded');
        if (!gameState?.badges.includes('FIRST_TRANSACTION')) {
          await awardBadge('FIRST_TRANSACTION');
        }
        break;
        
      case 'shift_added':
        await awardXp(15, 'Shift logged');
        if (!gameState?.badges.includes('FIRST_SHIFT')) {
          await awardBadge('FIRST_SHIFT');
        }
        break;
        
      case 'goal_created':
        await awardXp(25, 'Goal set');
        if (!gameState?.badges.includes('FIRST_GOAL')) {
          await awardBadge('FIRST_GOAL');
        }
        break;
        
      case 'goal_achieved':
        await awardXp(100, 'Goal achieved!');
        if (!gameState?.badges.includes('SAVER')) {
          await awardBadge('SAVER');
        }
        break;
        
      case 'debt_paid_off':
        await awardXp(150, 'Debt eliminated!');
        if (!gameState?.badges.includes('DEBT_CRUSHER')) {
          await awardBadge('DEBT_CRUSHER');
        }
        break;
        
      case 'budget_created':
        await awardXp(30, 'Budget planned');
        break;
        
      case 'budget_optimized':
        await awardXp(50, 'Budget optimized');
        if (!gameState?.badges.includes('OPTIMIZER')) {
          await awardBadge('OPTIMIZER');
        }
        break;
        
      case 'ai_analysis':
        await awardXp(20, 'AI insight gained');
        break;
        
      case 'scenario_run':
        await awardXp(15, 'Scenario analyzed');
        if (!gameState?.badges.includes('PLANNER')) {
          await awardBadge('PLANNER');
        }
        break;
    }
  }, [gameState, awardXp, awardBadge]);

  /**
   * Get current level progress information
   */
  const getProgress = useCallback((): LevelProgress => {
    if (!gameState) {
      return { 
        level: 1, 
        xp: 0, 
        progress: 0, 
        xpToNext: XP_PER_LEVEL 
      };
    }
    
    const xpToNext = gameState.level * XP_PER_LEVEL;
    const progress = (gameState.xp / xpToNext) * 100;
    
    return {
      level: gameState.level,
      xp: gameState.xp,
      progress: Math.min(progress, 100),
      xpToNext
    };
  }, [gameState]);

  return {
    gameState,
    isLoading,
    awardXp,
    awardBadge,
    trackAction,
    getProgress,
    allBadges: BADGES,
    xpPerLevel: XP_PER_LEVEL
  };
};

export default useGamification;
