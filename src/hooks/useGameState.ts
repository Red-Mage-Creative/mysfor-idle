
import { useState } from 'react';
import { initialItems } from '@/lib/initialItems';
import { allItemUpgrades } from '@/lib/itemUpgrades';
import { allWorkshopUpgrades } from '@/lib/workshopUpgrades';
import { Currencies, Item, ItemUpgrade, WorkshopUpgrade, OfflineEarnings } from '@/lib/gameTypes';

export type BuyQuantity = 1 | 5 | 10 | 'next' | 'max';

export const getFreshInitialItems = (): Item[] => initialItems.map(item => ({...item, cost: { ...item.cost }, baseCost: { ...item.baseCost }, generation: { ...item.generation }}));
export const getFreshInitialItemUpgrades = (): ItemUpgrade[] => allItemUpgrades.map(upgrade => ({ ...upgrade }));
export const getFreshInitialWorkshopUpgrades = (): WorkshopUpgrade[] => allWorkshopUpgrades.map(upgrade => ({ ...upgrade }));

export const useGameState = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [offlineEarnings, setOfflineEarnings] = useState<OfflineEarnings | null>(null);

    const [currencies, setCurrencies] = useState<Currencies>({ mana: 0, cogwheelGears: 0, essenceFlux: 0, researchPoints: 0, aetherShards: 0 });
    const [items, setItems] = useState<Item[]>(getFreshInitialItems);
    const [itemUpgrades, setItemUpgrades] = useState<ItemUpgrade[]>(getFreshInitialItemUpgrades);
    const [workshopUpgrades, setWorkshopUpgrades] = useState<WorkshopUpgrade[]>(getFreshInitialWorkshopUpgrades);
    const [lifetimeMana, setLifetimeMana] = useState(0);
    const [prestigeUpgradeLevels, setPrestigeUpgradeLevels] = useState<Record<string, number>>({});
    const [notifiedUpgrades, setNotifiedUpgrades] = useState<Set<string>>(new Set());
    const [hasEverClicked, setHasEverClicked] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'complete' | 'error'>('idle');
    const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
    const [buyQuantity, setBuyQuantity] = useState<BuyQuantity>(1);

    return {
        isLoaded, setIsLoaded,
        offlineEarnings, setOfflineEarnings,
        currencies, setCurrencies,
        items, setItems,
        itemUpgrades, setItemUpgrades,
        workshopUpgrades, setWorkshopUpgrades,
        lifetimeMana, setLifetimeMana,
        prestigeUpgradeLevels, setPrestigeUpgradeLevels,
        notifiedUpgrades, setNotifiedUpgrades,
        hasEverClicked, setHasEverClicked,
        saveStatus, setSaveStatus,
        lastSaveTime, setLastSaveTime,
        buyQuantity, setBuyQuantity,
    };
};

export type UseGameState = ReturnType<typeof useGameState>;
