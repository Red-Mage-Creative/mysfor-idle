
import { useMemo } from 'react';
import { Item, Currency } from '@/lib/gameTypes';

type UseItemVisibilityProps = {
    items: Item[];
    unlockedCurrencies: Set<Currency>;
    lifetimeMana: number;
};

export const useItemVisibility = ({ items, unlockedCurrencies, lifetimeMana }: UseItemVisibilityProps) => {
    const visibleItemIds = useMemo(() => {
        const visibleIds = new Set<string>();
        const cosmicResonatorOwned = (items.find(i => i.id === 'cosmic_resonator')?.level || 0) > 0;

        for (const item of items) {
            if (item.level > 0) {
                visibleIds.add(item.id);
                continue;
            }

            // New explicit rule for Anti-Matter Mana visibility.
            if (item.id === 'antimatter_mana') {
                if (cosmicResonatorOwned) {
                    visibleIds.add(item.id);
                }
                // Skip all other checks for this item.
                continue;
            }
            
            // Rule 1: Must have unlocked required currencies
            const requiredCurrencies = Object.keys(item.baseCost) as Currency[];
            const allCurrenciesUnlocked = requiredCurrencies.every(c => unlockedCurrencies.has(c));
            if (!allCurrenciesUnlocked) {
                continue;
            }

            // Rule 2 for Anti-Matter Mana is now handled above.

            // Rule 3: Lifetime mana requirement to prevent cluttering the UI early on
            const initialCostSum = Object.values(item.baseCost).reduce((a, b) => a + (b || 0), 0);
            const manaRequirement = initialCostSum * 0.8;
            if (lifetimeMana < manaRequirement) {
                // Exception for first items
                if (item.id !== 'apprentice_wand' && item.id !== 'clicking_gloves') {
                    continue;
                }
            }

            // If all checks pass for a level 0 item, it's visible
            visibleIds.add(item.id);
        }
        return visibleIds;
    }, [items, unlockedCurrencies, lifetimeMana]);

    return { visibleItemIds };
};
