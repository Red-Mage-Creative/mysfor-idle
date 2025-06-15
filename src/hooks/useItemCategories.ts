
import { useMemo } from 'react';
import { Item, ItemWithStats, Currencies } from '@/lib/gameTypes';

type UseItemCategoriesProps = {
    items: Item[];
    visibleItemIds: Set<string>;
    itemStats: Map<string, Omit<ItemWithStats, keyof Item>>;
    currencies: Currencies;
    hasEverPrestiged: boolean;
};

export const useItemCategories = ({
    items,
    visibleItemIds,
    itemStats,
    currencies,
    hasEverPrestiged,
}: UseItemCategoriesProps) => {
    const itemCategories = useMemo(() => {
        const categories: Record<string, ItemWithStats[]> = {
            'Basic Magitech': [],
            'Advanced Machinery': [],
            'Mystical Artifacts': [],
            'Transcendent Artifacts': [],
        };
        
        const visibleItems = items.filter(item => visibleItemIds.has(item.id));

        for (const item of visibleItems) {
            const stats = itemStats.get(item.id);
            if (!stats) continue;

            categories[item.category].push({
                ...item,
                ...stats,
            });
        }

        return categories;
    }, [items, visibleItemIds, itemStats]);
    
    const categoryUnlockStatus = useMemo(() => {
        const totalBasicLevels = items
            .filter(i => i.category === 'Basic Magitech')
            .reduce((sum, u) => sum + u.level, 0);
        
        const hasClockworkAutomaton = (items.find(u => u.id === 'clockwork_automaton')?.level || 0) > 0;
        const cosmicResonatorOwned = (items.find(i => i.id === 'cosmic_resonator')?.level || 0) > 0;

        return {
          'Basic Magitech': true,
          'Advanced Machinery': totalBasicLevels >= 5 || currencies.mana > 10000,
          'Mystical Artifacts': hasClockworkAutomaton || currencies.cogwheelGears > 500,
          'Transcendent Artifacts': hasEverPrestiged || cosmicResonatorOwned,
        }
    }, [items, currencies.mana, currencies.cogwheelGears, hasEverPrestiged]);

    return { itemCategories, categoryUnlockStatus };
};
