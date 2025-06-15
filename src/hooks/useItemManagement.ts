
import { useMemo } from 'react';
import { useGameState } from './useGameState';
import { useGameMultipliers } from './useGameMultipliers';
import { useProduction } from './useProduction';
import { useItemStats } from './useItemStats';
import { useItemVisibility } from './useItemVisibility';
import { useItemPurchasing } from './useItemPurchasing';
import { useItemCategories } from './useItemCategories';
import { Currency } from '@/lib/gameTypes';

type UseItemManagementProps = Pick<ReturnType<typeof useGameState>,
    'items' |
    'itemUpgrades' |
    'currencies' |
    'buyQuantity' |
    'lifetimeMana' |
    'hasEverPrestiged'
> & {
    multipliers: ReturnType<typeof useGameMultipliers>;
    production: ReturnType<typeof useProduction>;
};

export const useItemManagement = ({
    items,
    itemUpgrades,
    currencies,
    buyQuantity,
    lifetimeMana,
    hasEverPrestiged,
    multipliers,
    production,
}: UseItemManagementProps) => {
    const { prestigeMultipliers, researchBonuses, golemEffects, itemUpgradeMultipliers } = multipliers;
    const { generationPerSecond } = production;

    const unlockedCurrencies = useMemo(() => {
        const unlocked = new Set<Currency>(['mana']);
        for (const currency in generationPerSecond) {
            if ((generationPerSecond[currency as Currency] || 0) > 0) {
                unlocked.add(currency as Currency);
            }
        }
        Object.entries(currencies).forEach(([currency, amount]) => {
            if (amount > 0) {
                unlocked.add(currency as Currency);
            }
        });
        return unlocked;
    }, [generationPerSecond, currencies]);
    
    const itemCostMultiplier = useMemo(() => 
        prestigeMultipliers.costReduction * researchBonuses.costReduction * golemEffects.costMultiplier,
        [prestigeMultipliers.costReduction, researchBonuses.costReduction, golemEffects.costMultiplier]
    );

    const { itemStats } = useItemStats({ items, itemUpgrades, itemUpgradeMultipliers });
    const { visibleItemIds } = useItemVisibility({ items, unlockedCurrencies, lifetimeMana });
    const { itemPurchaseDetails } = useItemPurchasing({ items, currencies, buyQuantity, costMultiplier: itemCostMultiplier });
    const { itemCategories, categoryUnlockStatus } = useItemCategories({ items, visibleItemIds, itemStats, currencies, hasEverPrestiged });

    const availableItemUpgrades = useMemo(() => {
        return itemUpgrades.filter(upgrade => {
            if (upgrade.purchased) return false;
            const parentItem = items.find(i => i.id === upgrade.parentItemId);
            return parentItem && parentItem.level >= upgrade.unlocksAtLevel;
        });
    }, [itemUpgrades, items]);

    return {
        unlockedCurrencies,
        itemPurchaseDetails,
        itemCategories,
        categoryUnlockStatus,
        availableItemUpgrades,
    };
};
