
import { useCallback } from 'react';
import { toast } from '@/components/ui/sonner';
import { getFreshInitialItems, getFreshInitialItemUpgrades, getFreshInitialWorkshopUpgrades } from '@/lib/initialState';
import { challengeMap } from '@/lib/challenges';
import type { GameActionProps } from './types';
import { CurrencyRecord } from '@/lib/gameTypes';
import { dimensionalUpgradesMap } from '@/lib/dimensionalUpgrades';

export const useChallengeActions = (props: GameActionProps) => {
    const {
        activeChallengeId, setActiveChallengeId,
        setCurrencies,
        setItems,
        setItemUpgrades,
        setWorkshopUpgrades,
        setLifetimeMana,
        setNotifiedUpgrades,
        setOverclockLevel,
        setRunStartTime,
        setCompletedChallenges,
        dimensionalUpgrades,
        immediateSave,
    } = props;
    
    const performChallengeReset = useCallback((startingResources: CurrencyRecord = {}) => {
        setCurrencies(prev => ({
            ...prev,
            mana: startingResources.mana || 0,
            cogwheelGears: startingResources.cogwheelGears || 0,
            essenceFlux: startingResources.essenceFlux || 0,
            researchPoints: startingResources.researchPoints || 0,
        }));
        setItems(getFreshInitialItems());
        setItemUpgrades(getFreshInitialItemUpgrades());
        setWorkshopUpgrades(getFreshInitialWorkshopUpgrades());
        setLifetimeMana(0);
        setNotifiedUpgrades(new Set());
        setOverclockLevel(0);
        setRunStartTime(Date.now());
        immediateSave();
    }, [
        setCurrencies, setItems, setItemUpgrades, setWorkshopUpgrades,
        setLifetimeMana, setNotifiedUpgrades, setOverclockLevel,
        setRunStartTime, immediateSave
    ]);

    const startChallenge = useCallback((challengeId: string) => {
        if (activeChallengeId) {
            toast.error("You are already in a challenge.", { description: "Abandon the current challenge to start a new one." });
            return;
        }
        const challenge = challengeMap.get(challengeId);
        if (!challenge) return;

        if (window.confirm(`Are you sure you want to start the "${challenge.name}" challenge? This will reset your current run.`)) {
            performChallengeReset(challenge.startingResources);
            setActiveChallengeId(challengeId);
            toast.info(`Challenge Started: ${challenge.name}`, { description: challenge.description });
        }
    }, [activeChallengeId, performChallengeReset, setActiveChallengeId]);
    
    const abandonChallenge = useCallback(() => {
        if (!activeChallengeId) return;
         if (window.confirm("Are you sure you want to abandon this challenge? Your run will be reset.")) {
            performChallengeReset();
            setActiveChallengeId(null);
            toast.warning("Challenge Abandoned.", { description: "Your run has been reset." });
        }
    }, [activeChallengeId, performChallengeReset, setActiveChallengeId]);
    
    const handleCompleteChallenge = useCallback((challengeId: string) => {
        if (!activeChallengeId) return; // Should not happen, but for safety
        const challenge = challengeMap.get(challengeId);
        if (!challenge) return;

        let reward = challenge.reward;
        const tokenUpgrade = dimensionalUpgradesMap.get('token_gain_i');
        const tokenUpgradeLevel = dimensionalUpgrades?.['token_gain_i'] || 0;
        if (tokenUpgrade && tokenUpgradeLevel > 0) {
            reward *= tokenUpgrade.effect.value(tokenUpgradeLevel);
        }
        reward = Math.floor(reward);
        
        setCurrencies(prev => ({
            ...prev,
            challengeTokens: (prev.challengeTokens || 0) + reward
        }));

        setCompletedChallenges(prev => ({
            ...prev,
            [challengeId]: (prev[challengeId] || 0) + 1
        }));

        setActiveChallengeId(null);

        toast.success(`Challenge Complete: ${challenge.name}!`, {
            description: `You have earned ${reward} Challenge Tokens.`,
            duration: 8000
        });
        immediateSave();

    }, [activeChallengeId, setCurrencies, setCompletedChallenges, setActiveChallengeId, immediateSave, dimensionalUpgrades]);

    return { startChallenge, abandonChallenge, handleCompleteChallenge };
};
