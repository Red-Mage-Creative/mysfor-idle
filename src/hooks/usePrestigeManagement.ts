
import { useMemo } from 'react';
import { useGameState } from './useGameState';
import { useGameMultipliers } from './useGameMultipliers';

type UsePrestigeManagementProps = Pick<ReturnType<typeof useGameState>,
    'lifetimeMana' |
    'prestigeCount' |
    'currencies' |
    'hasEverPrestiged'
> & {
    multipliers: ReturnType<typeof useGameMultipliers>;
};

export const usePrestigeManagement = ({
    lifetimeMana,
    prestigeCount,
    currencies,
    hasEverPrestiged,
    multipliers,
}: UsePrestigeManagementProps) => {
    const { prestigeMultipliers, golemEffects } = multipliers;

    const prestigeRequirement = useMemo(() => {
        return 1e9 * Math.pow(10, prestigeCount);
    }, [prestigeCount]);

    const canPrestige = useMemo(() => lifetimeMana >= prestigeRequirement, [lifetimeMana, prestigeRequirement]);
    
    const prestigeVisibility = useMemo(() => {
        if (currencies.aetherShards > 0 || hasEverPrestiged) return 'visible';
        
        const teaserThreshold = prestigeRequirement * 0.25;
        const visibleThreshold = prestigeRequirement * 0.50;

        if (lifetimeMana >= visibleThreshold) return 'visible';
        if (lifetimeMana >= teaserThreshold) return 'teaser';
        return 'hidden';
    }, [lifetimeMana, currencies.aetherShards, prestigeRequirement, hasEverPrestiged]);

    const potentialShards = useMemo(() => {
        if (lifetimeMana < prestigeRequirement) return 0;
        
        const manaRatio = lifetimeMana / prestigeRequirement;
        const baseShards = Math.floor(Math.pow(manaRatio, 0.75) * 10 * (prestigeCount + 1));
        const prestigeCountBonus = 1 + prestigeCount * 0.2;
        
        return Math.floor(baseShards * prestigeCountBonus * prestigeMultipliers.shardGain * golemEffects.shardGainMultiplier);
    }, [lifetimeMana, prestigeRequirement, prestigeCount, prestigeMultipliers.shardGain, golemEffects]);

    return {
        prestigeRequirement,
        canPrestige,
        prestigeVisibility,
        potentialShards,
    };
};
