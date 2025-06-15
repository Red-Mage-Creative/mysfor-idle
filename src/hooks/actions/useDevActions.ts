
import { useCallback } from 'react';
import { toast } from '@/components/ui/sonner';
import type { GameActionProps } from './types';

export const useDevActions = (props: GameActionProps) => {
    const {
        setDevMode,
        generationPerSecond,
        currencies,
        prestigeCount,
        setCurrencies,
        setLifetimeMana
    } = props;

    const toggleDevMode = useCallback(() => {
        setDevMode(prev => {
            const newState = !prev;
            if (newState) {
                toast.info("Developer Mode Enabled", { description: "Mana generation and clicks are boosted." });
            } else {
                toast.info("Developer Mode Disabled");
            }
            return newState;
        });
    }, [setDevMode]);

    const devGrantResources = useCallback(() => {
        const secondsOfProduction = 3600;
        const gen = generationPerSecond || {};

        const manaToGrant = Math.max(1e8, (gen.mana || 0) * secondsOfProduction);
        const gearsToGrant = Math.max(1e5, (gen.cogwheelGears || 0) * secondsOfProduction);
        const essenceToGrant = Math.max(1e5, (gen.essenceFlux || 0) * secondsOfProduction);
        const researchToGrant = Math.max(1e5, (gen.researchPoints || 0) * secondsOfProduction);
        
        const shardsToGrant = Math.max(1000, Math.floor((currencies.aetherShards || 0) * 0.2) + 500 * (prestigeCount + 1));
        const tokensToGrant = 100;

        setCurrencies(prev => ({
            ...prev,
            mana: prev.mana + manaToGrant,
            cogwheelGears: prev.cogwheelGears + gearsToGrant,
            essenceFlux: prev.essenceFlux + essenceToGrant,
            researchPoints: prev.researchPoints + researchToGrant,
            aetherShards: prev.aetherShards + shardsToGrant,
            challengeTokens: (prev.challengeTokens || 0) + tokensToGrant,
        }));
        setLifetimeMana(prev => prev + manaToGrant);
        
        toast.success("Granted Dev Resources!", {
            description: `+${manaToGrant.toLocaleString('en-US', { notation: 'compact' })} Mana, +${shardsToGrant.toLocaleString('en-US', { notation: 'compact' })} Shards, etc.`
        });
    }, [generationPerSecond, currencies.aetherShards, prestigeCount, setCurrencies, setLifetimeMana]);

    return {
        toggleDevMode,
        devGrantResources,
    };
};
