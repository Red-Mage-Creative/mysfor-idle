import React from 'react';
import { useGameState } from './useGameState';
import { useGameCalculations } from './useGameCalculations';
import { useGameSession } from './useGameSession';
import { useGameActions } from './useGameActions';
import { prestigeUpgrades } from '@/lib/prestigeUpgrades';
import { allGolems, golemMap, MAX_ACTIVE_GOLEMS } from '@/lib/golems';

import { useAchievementManager } from './effects/useAchievementManager';
import { useAutoBuy } from './effects/useAutoBuy';
import { useOverclockManager } from './effects/useOverclockManager';
import { useUpgradeNotifier } from './effects/useUpgradeNotifier';
import { useGameCompletion } from './effects/useGameCompletion';
import { challengeMap } from '@/lib/challenges';
import { toast } from '@/components/ui/sonner';

export const useGameLogic = () => {
    const gameState = useGameState();
    const [lastAutoBuy, setLastAutoBuy] = React.useState<{ item: string | null; upgrade: string | null }>({ item: null, upgrade: null });

    const calculations = useGameCalculations(gameState);
    
    const { manualSave, debouncedSave, immediateSave, resetGame, exportSave, importSave } = useGameSession({
        ...gameState,
        generationPerSecond: calculations.generationPerSecond,
    });

    const actions = useGameActions({
        ...gameState,
        ...calculations,
        debouncedSave,
        immediateSave,
    });

    // Effect Hooks
    useAchievementManager({ ...gameState, ...calculations, debouncedSave });
    useAutoBuy({
        ...gameState, 
        ...calculations,
        handleBuyItem: actions.handleBuyItem,
        handleBuyItemUpgrade: actions.handleBuyItemUpgrade,
        handleBuyWorkshopUpgrade: actions.handleBuyWorkshopUpgrade,
        setLastAutoBuy
    });
    useOverclockManager({ ...gameState, ...calculations, handleSetOverclockLevel: actions.handleSetOverclockLevel });
    useUpgradeNotifier({ ...gameState, ...calculations });
    useGameCompletion({ ...gameState, immediateSave });

    // Challenge Completion and Failure Logic
    React.useEffect(() => {
        if (!gameState.activeChallengeId) return;

        const challenge = challengeMap.get(gameState.activeChallengeId);
        if (!challenge) return;

        // Check for completion
        if (challenge.isGoalReached(gameState)) {
            actions.handleCompleteChallenge(gameState.activeChallengeId);
            // Don't check for failure on the same tick as completion
            return;
        }

        // Check for failure
        const failConditions = calculations.challengeEffects.challengeFailConditions || [];
        for (const condition of failConditions) {
            if (condition(gameState)) {
                toast.error(`Challenge Failed: ${challenge.name}`, {
                    description: "The conditions for the challenge were not met. Your run has been reset.",
                    duration: 8000,
                });
                actions.abandonChallenge();
                break; // Exit after first failure
            }
        }

    }, [gameState, actions, calculations.challengeEffects]);

    const showEssenceTab = gameState.hasEverPrestiged;

    return {
        ...gameState,
        ...calculations,
        ...actions,
        manualSave,
        immediateSave,
        saveStatus: gameState.saveStatus,
        lastSaveTime: gameState.lastSaveTime,
        resetGame,
        exportSave,
        importSave,
        prestigeUpgrades,
        showEssenceTab,
        allGolems,
        golemMap,
        MAX_ACTIVE_GOLEMS,
        lastAutoBuy,
    };
};
