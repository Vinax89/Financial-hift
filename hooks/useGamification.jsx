/**
 * @fileoverview Gamification system hook for Financial $hift
 * @description Manages XP, levels, badges, and achievement tracking
 * to encourage user engagement and financial progress
 */

import { useState, useEffect, useCallback } from 'react';
import { Gamification } from '@/api/entities';
import { User } from '@/api/entities';
import { useToast } from '@/ui/use-toast.jsx';
import { logError } from '@/utils/logger.js';

const XP_PER_LEVEL = 100;

const BADGES = {
    FIRST_TRANSACTION: { name: 'First Steps', description: 'Added your first transaction' },
    FIRST_SHIFT: { name: 'Worker', description: 'Logged your first shift' },
    FIRST_GOAL: { name: 'Dreamer', description: 'Set your first financial goal' },
    BUDGET_MASTER: { name: 'Budget Master', description: 'Created a complete monthly budget' },
    DEBT_CRUSHER: { name: 'Debt Crusher', description: 'Paid off a debt account' },
    SAVER: { name: 'Saver', description: 'Reached a savings goal' },
    LEVEL_5: { name: 'Financial Novice', description: 'Reached level 5' },
    LEVEL_10: { name: 'Money Manager', description: 'Reached level 10' },
    LEVEL_25: { name: 'Financial Expert', description: 'Reached level 25' },
    WEEK_STREAK: { name: 'Consistent', description: 'Used the app 7 days in a row' },
    MONTH_STREAK: { name: 'Dedicated', description: 'Used the app 30 days in a row' },
    ANALYZER: { name: 'Analyzer', description: 'Used AI financial analysis 10 times' },
    OPTIMIZER: { name: 'Optimizer', description: 'Optimized your envelope budget' },
    PLANNER: { name: 'Planner', description: 'Ran debt payoff scenarios' }
};

/**
 * Gamification hook for XP, levels, and badges
 * @returns {Object} Gamification state and methods
 * @property {Object|null} gameState - Current game state (xp, level, badges)
 * @property {boolean} isLoading - Whether game state is loading
 * @property {Function} awardXp - Award XP to user
 * @property {Function} awardBadge - Award badge to user
 * @property {Function} trackAction - Track action and award appropriate XP/badges
 * @property {Function} getProgress - Get level progress information
 * @property {Object} allBadges - All available badges
 * @property {number} xpPerLevel - XP required per level
 * @example
 * const { trackAction, getProgress } = useGamification();
 * await trackAction('transaction_added');
 */
const useGamification = () => {
    const [gameState, setGameState] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchGameState = useCallback(async () => {
        try {
            const user = await User.me();
            if (!user) return;

            // Try to find existing gamification record
            const existingRecords = await Gamification.filter({ user_email: user.email });
            
            if (existingRecords.length > 0) {
                setGameState(existingRecords[0]);
            } else {
                // Create new gamification record
                const newGameState = {
                    user_email: user.email,
                    xp: 0,
                    level: 1,
                    badges: [],
                    last_updated: new Date().toISOString()
                };
                const created = await Gamification.create(newGameState);
                setGameState(created);
            }
        } catch (error) {
            if (import.meta.env.DEV) {
                logError('Failed to fetch game state', error);
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGameState();
    }, [fetchGameState]);

    const awardBadge = useCallback(async (badgeId) => {
        if (!gameState || gameState.badges.includes(badgeId)) return;

        const badge = BADGES[badgeId];
        if (!badge) return;

        const newBadges = [...gameState.badges, badgeId];
        const updatedState = { 
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
            if (import.meta.env.DEV) {
                logError('Failed to award badge', error);
            }
        }
    }, [gameState, toast]);

    const awardXp = useCallback(async (amount, reason = '') => {
        if (!gameState || amount <= 0) return;

        let newXp = gameState.xp + amount;
        let newLevel = gameState.level;
        let levelUp = false;

        // Calculate level progression
        const totalXpNeeded = newLevel * XP_PER_LEVEL;
        while (newXp >= totalXpNeeded) {
            newXp -= totalXpNeeded;
            newLevel++;
            levelUp = true;
        }

        const updatedState = { 
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
            if (import.meta.env.DEV) {
                logError('Failed to award XP', error);
            }
        }
    }, [gameState, toast, awardBadge]);

    // Helper functions to award XP for specific actions
    const trackAction = useCallback(async (action, data = {}) => {
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

    const getProgress = useCallback(() => {
        if (!gameState) return { level: 1, xp: 0, progress: 0, xpToNext: XP_PER_LEVEL };
        
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