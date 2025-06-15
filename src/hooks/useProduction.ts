
import { useMemo } from 'react';
import { Item, ItemUpgrade, Currencies, Currency, CurrencyRecord } from '@/lib/gameTypes';
import * as C from '@/constants/gameConstants';
import { useGameState } from './useGameState';
import { useGameMultipliers } from './useGameMultipliers';

type UseProductionProps = {
    items: Item[];
    itemUpgrades: ItemUpgrade[];
    overclockLevel: number;
    devMode: boolean;
    multipliers: ReturnType<typeof useGameMultipliers>;
}

export const useProduction = ({
    items,
    itemUpgrades,
    overclockLevel,
    devMode,
    multipliers,
}: UseProductionProps) => {
    const { 
        achievementBonus, 
        researchBonuses, 
        golemEffects, 
        prestigeMultipliers, 
        workshopUpgradeMultipliers, 
        itemUpgradeMultipliers 
    } = multipliers;

    const overclockInfo = useMemo(() => {
        const maxLevelUnlocked = itemUpgrades
            .filter(u => u.purchased && u.effect.type === 'unlockOverclockLevel')
            .length;

        const currentLevel = Math.min(overclockLevel, maxLevelUnlocked);

        const speedMultiplier = currentLevel > 0 ? Math.pow(1.5, currentLevel) : 1;
        const gearDrainPerSecond = currentLevel > 0 ? 5 * Math.pow(2, currentLevel - 1) : 0;
        
        return {
            currentLevel,
            maxLevelUnlocked,
            speedMultiplier,
            gearDrainPerSecond,
            isUnlocked: maxLevelUnlocked > 0,
        };
    }, [itemUpgrades, overclockLevel]);

    const generationPerSecond = useMemo(() => {
        const baseGeneration = items.reduce((acc, item) => {
            if (item.level > 0) {
                for (const currency in item.generation) {
                    const key = currency as Currency;
                    const itemMultiplier = itemUpgradeMultipliers[item.id]?.generation || 1;
                    const researchMultiplier = researchBonuses.specificItem[item.id] || 1;
                    let value = (item.generation[key] || 0) * item.level * itemMultiplier * researchMultiplier;
                    
                    acc[key] = (acc[key] || 0) + value;
                }
            }
            return acc;
        }, {} as Partial<Currencies>);

        for (const key in baseGeneration) {
            const currency = key as Currency;
            baseGeneration[currency] = (baseGeneration[currency] || 0) * prestigeMultipliers.allProduction * researchBonuses.allProduction;
        }

        if (baseGeneration.mana) {
            baseGeneration.mana *= workshopUpgradeMultipliers.mana * researchBonuses.mana;
        }
        if (baseGeneration.essenceFlux) {
            baseGeneration.essenceFlux *= workshopUpgradeMultipliers.essenceFlux * researchBonuses.essenceFlux;
        }
        if (baseGeneration.researchPoints) {
            baseGeneration.researchPoints *= workshopUpgradeMultipliers.researchPoints * researchBonuses.researchPoints;
        }

        if (overclockInfo.speedMultiplier > 1) {
            for (const key in baseGeneration) {
                const currency = key as Currency;
                baseGeneration[currency] = (baseGeneration[currency] || 0) * overclockInfo.speedMultiplier;
            }
        }
        if (overclockInfo.gearDrainPerSecond > 0) {
            baseGeneration.cogwheelGears = (baseGeneration.cogwheelGears || 0) - overclockInfo.gearDrainPerSecond;
        }

        for (const key in baseGeneration) {
            const currency = key as Currency;
            baseGeneration[currency] = (baseGeneration[currency] || 0) * achievementBonus;
        }

        if (devMode) {
            baseGeneration.mana = (baseGeneration.mana || 0) * C.DEV_MODE_MULTIPLIER;
        }

        for (const key in baseGeneration) {
            const currency = key as Currency;
            const golemMultiplier = golemEffects.generationMultiplier[currency];
            if (golemMultiplier) {
                baseGeneration[currency] = (baseGeneration[currency] || 0) * golemMultiplier;
            }
        }
        
        for (const key in golemEffects.flatGeneration) {
            const currency = key as Currency;
            const flatValue = golemEffects.flatGeneration[currency] || 0;
            baseGeneration[currency] = (baseGeneration[currency] || 0) + flatValue;
        }

        return baseGeneration;
    }, [items, prestigeMultipliers.allProduction, itemUpgradeMultipliers, workshopUpgradeMultipliers, overclockInfo, devMode, achievementBonus, researchBonuses, golemEffects]);

    const manaPerClick = useMemo(() => {
        const baseClick = 1;
        const clickItemBonus = items
            .filter(i => i.clickBonus && i.level > 0)
            .reduce((sum, i) => {
                const itemMultiplier = itemUpgradeMultipliers[i.id]?.click || 1;
                return sum + (i.clickBonus || 0) * i.level * itemMultiplier;
            }, 0);
        
        let totalClick = (baseClick + clickItemBonus) * prestigeMultipliers.manaClick * researchBonuses.manaPerClick;

        totalClick *= workshopUpgradeMultipliers.mana * researchBonuses.mana;

        const manaGeneration = generationPerSecond.mana || 0;
        const scalingFactor = 0.01; 
        totalClick *= (1 + (manaGeneration * scalingFactor));

        totalClick *= achievementBonus;

        if (devMode) {
            totalClick *= C.DEV_MODE_MULTIPLIER;
        }

        const golemManaMultiplier = golemEffects.generationMultiplier.mana;
        if (golemManaMultiplier) {
            totalClick *= golemManaMultiplier;
        }

        return totalClick;
    }, [items, prestigeMultipliers.manaClick, itemUpgradeMultipliers, workshopUpgradeMultipliers, devMode, generationPerSecond.mana, achievementBonus, researchBonuses.manaPerClick, golemEffects]);

    return {
        overclockInfo,
        generationPerSecond,
        manaPerClick,
    };
};
