
import { useCallback } from 'react';
import { toast } from '@/components/ui/sonner';
import { getFreshInitialItems, getFreshInitialItemUpgrades, getFreshInitialWorkshopUpgrades } from '@/lib/initialState';
import { challengeMap } from '@/lib/challenges';
import type { GameActionProps } from './types';
import { CurrencyRecord } from '@/lib/gameTypes';

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
        
        setCurrencies(prev => ({
            ...prev,
            challengeTokens: (prev.challengeTokens || 0) + challenge.reward
        }));

        setCompletedChallenges(prev => ({
            ...prev,
            [challengeId]: (prev[challengeId] || 0) + 1
        }));

        setActiveChallengeId(null);

        toast.success(`Challenge Complete: ${challenge.name}!`, {
            description: `You have earned ${challenge.reward} Challenge Tokens.`,
            duration: 8000
        });
        immediateSave();

    }, [activeChallengeId, setCurrencies, setCompletedChallenges, setActiveChallengeId, immediateSave]);

    return { startChallenge, abandonChallenge, handleCompleteChallenge };
};
