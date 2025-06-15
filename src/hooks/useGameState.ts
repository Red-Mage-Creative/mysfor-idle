import { useState, useCallback } from 'react';
import { getFreshInitialItems, getFreshInitialItemUpgrades, getFreshInitialWorkshopUpgrades } from '@/lib/initialState';
import { Currencies, Item, ItemUpgrade, WorkshopUpgrade, OfflineEarnings, AchievementProgress } from '@/lib/gameTypes';
import { DEV_MODE_KEY } from '@/constants/gameConstants';

export type BuyQuantity = 1 | 5 | 10 | 'next' | 'max';

export { getFreshInitialItems, getFreshInitialItemUpgrades, getFreshInitialWorkshopUpgrades };

export const useGameState = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [offlineEarnings, setOfflineEarnings] = useState<OfflineEarnings | null>(null);
    const [isIntroModalOpen, setIsIntroModalOpen] = useState(false);

    const [currencies, setCurrencies] = useState<Currencies>({ mana: 0, cogwheelGears: 0, essenceFlux: 0, researchPoints: 0, aetherShards: 0 });
    const [items, setItems] = useState<Item[]>(getFreshInitialItems);
    const [itemUpgrades, setItemUpgrades] = useState<ItemUpgrade[]>(getFreshInitialItemUpgrades);
    const [workshopUpgrades, setWorkshopUpgrades] = useState<WorkshopUpgrade[]>(getFreshInitialWorkshopUpgrades);
    const [lifetimeMana, setLifetimeMana] = useState(0);
    const [prestigeUpgradeLevels, setPrestigeUpgradeLevels] = useState<Record<string, number>>({});
    const [notifiedUpgrades, setNotifiedUpgrades] = useState<Set<string>>(new Set());
    const [hasEverClicked, setHasEverClicked] = useState(false);
    const [hasEverPrestiged, setHasEverPrestiged] = useState(false);
    const [prestigeCount, setPrestigeCount] = useState(0);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'complete' | 'error'>('idle');
    const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
    const [buyQuantity, setBuyQuantity] = useState<BuyQuantity>(1);
    const [overclockLevel, setOverclockLevel] = useState(0);
    const [autoBuySettings, setAutoBuySettings] = useState({ items: false, upgrades: false });
    const [achievements, setAchievements] = useState<Record<string, AchievementProgress>>({});
    const [unlockedResearchNodes, setUnlockedResearchNodes] = useState<Set<string>>(new Set());
    const [activeGolemIds, setActiveGolemIds] = useState<string[]>([]);
    const [hasBeatenGame, setHasBeatenGame] = useState(false);
    const [gameCompletionShown, setGameCompletionShown] = useState(false);
    const [ancientKnowledgeNodes, setAncientKnowledgeNodes] = useState<Set<string>>(new Set());

    // New state for achievements
    const [runStartTime, setRunStartTime] = useState(Date.now());

    const [devMode, _setDevMode] = useState(() => {
        // Dev mode is only available in development environments
        if (!import.meta.env.DEV) {
            return false;
        }
        try {
            const stored = localStorage.getItem(DEV_MODE_KEY);
            return stored ? JSON.parse(stored) : false;
        } catch {
            return false;
        }
    });

    const setDevMode = useCallback((value: boolean | ((prevState: boolean) => boolean)) => {
        // Do not allow changing dev mode in production
        if (!import.meta.env.DEV) {
            return;
        }
        _setDevMode(prev => {
            const newState = typeof value === 'function' ? value(prev) : value;
            localStorage.setItem(DEV_MODE_KEY, JSON.stringify(newState));
            return newState;
        });
    }, []);

    return {
        isLoaded, setIsLoaded,
        offlineEarnings, setOfflineEarnings,
        isIntroModalOpen, setIsIntroModalOpen,
        currencies, setCurrencies,
        items, setItems,
        itemUpgrades, setItemUpgrades,
        workshopUpgrades, setWorkshopUpgrades,
        lifetimeMana, setLifetimeMana,
        prestigeUpgradeLevels, setPrestigeUpgradeLevels,
        notifiedUpgrades, setNotifiedUpgrades,
        hasEverClicked, setHasEverClicked,
        hasEverPrestiged, setHasEverPrestiged,
        prestigeCount, setPrestigeCount,
        saveStatus, setSaveStatus,
        lastSaveTime, setLastSaveTime,
        buyQuantity, setBuyQuantity,
        overclockLevel, setOverclockLevel,
        autoBuySettings, setAutoBuySettings,
        achievements, setAchievements,
        devMode, setDevMode,
        hasBeatenGame, setHasBeatenGame,
        gameCompletionShown, setGameCompletionShown,
        unlockedResearchNodes, setUnlockedResearchNodes,
        activeGolemIds, setActiveGolemIds,
        ancientKnowledgeNodes, setAncientKnowledgeNodes,
        // New state
        runStartTime, setRunStartTime,
    };
};
