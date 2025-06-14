
import { useState } from 'react';
import { initialItems } from '@/lib/initialItems';
import { allItemUpgrades } from '@/lib/itemUpgrades';
import { Currencies, Item, ItemUpgrade, OfflineEarnings } from '@/lib/gameTypes';

const getFreshInitialItems = (): Item[] => initialItems.map(item => ({...item, cost: { ...item.cost }, baseCost: { ...item.baseCost }, generation: { ...item.generation }}));
const getFreshInitialItemUpgrades = (): ItemUpgrade[] => allItemUpgrades.map(upgrade => ({ ...upgrade }));

export const useGameState = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [offlineEarnings, setOfflineEarnings] = useState<OfflineEarnings | null>(null);

    const [currencies, setCurrencies] = useState<Currencies>({ mana: 0, cogwheelGears: 0, essenceFlux: 0, researchPoints: 0, aetherShards: 0 });
    const [items, setItems] = useState<Item[]>(getFreshInitialItems);
    const [itemUpgrades, setItemUpgrades] = useState<ItemUpgrade[]>(getFreshInitialItemUpgrades);
    const [lifetimeMana, setLifetimeMana] = useState(0);
    const [prestigeUpgradeLevels, setPrestigeUpgradeLevels] = useState<Record<string, number>>({});
    const [notifiedUpgrades, setNotifiedUpgrades] = useState<Set<string>>(new Set());
    const [hasEverClicked, setHasEverClicked] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'complete' | 'error'>('idle');
    const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);

    return {
        isLoaded, setIsLoaded,
        offlineEarnings, setOfflineEarnings,
        currencies, setCurrencies,
        items, setItems,
        itemUpgrades, setItemUpgrades,
        lifetimeMana, setLifetimeMana,
        prestigeUpgradeLevels, setPrestigeUpgradeLevels,
        notifiedUpgrades, setNotifiedUpgrades,
        hasEverClicked, setHasEverClicked,
        saveStatus, setSaveStatus,
        lastSaveTime, setLastSaveTime,
    };
};
