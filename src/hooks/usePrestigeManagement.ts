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
        // More aggressive scaling: 15x -> 50x per prestige
        return 1e9 * Math.pow(50, prestigeCount);
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
        // Rebalanced shard gain: lower base, adjusted linear prestige bonus
        const baseShards = Math.floor(Math.pow(manaRatio, 0.75) * 5 * (1 + prestigeCount * 0.5));
        
        return Math.floor(baseShards * prestigeMultipliers.shardGain * golemEffects.shardGainMultiplier);
    }, [lifetimeMana, prestigeRequirement, prestigeCount, prestigeMultipliers.shardGain, golemEffects]);

    const multiPrestigeDetails = useMemo(() => {
        if (!canPrestige) {
            return { prestigesToGain: 0, totalShards: 0, nextPrestigeCount: prestigeCount + 1 };
        }

        let prestigesToGain = 0;
        let totalShards = 0;
        let currentPrestigeCheck = prestigeCount;
        let remainingMana = lifetimeMana; // This pool is used for requirements AND rewards

        const loopCap = 1000; 

        while (prestigesToGain < loopCap) {
            // More aggressive scaling: 15x -> 50x per prestige
            const requirement = 1e9 * Math.pow(50, currentPrestigeCheck);
            if (remainingMana < requirement) {
                break;
            }

            prestigesToGain++;
            
            // Shard calculation now uses the diminishing remainingMana pool
            const manaRatio = remainingMana / requirement;
            // Rebalanced shard gain: lower base, adjusted linear prestige bonus
            const baseShards = Math.floor(Math.pow(manaRatio, 0.75) * 5 * (1 + currentPrestigeCheck * 0.5));
            const shardsForThisLevel = Math.floor(baseShards * prestigeMultipliers.shardGain * golemEffects.shardGainMultiplier);
            
            totalShards += shardsForThisLevel;

            // "Spend" the mana for the next iteration
            remainingMana -= requirement;

            currentPrestigeCheck++;
        }

        return {
            prestigesToGain,
            totalShards,
            nextPrestigeCount: prestigeCount + prestigesToGain,
        };
    }, [canPrestige, lifetimeMana, prestigeCount, prestigeMultipliers.shardGain, golemEffects]);

    return {
        prestigeRequirement,
        canPrestige,
        prestigeVisibility,
        potentialShards,
        multiPrestigeDetails,
    };
};
