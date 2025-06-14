import { useEffect, useMemo, useCallback, useRef } from 'react';
import { prestigeUpgrades } from '@/lib/prestigeUpgrades';
import { allItemUpgrades } from '@/lib/itemUpgrades';
import { allWorkshopUpgrades } from '@/lib/workshopUpgrades';
import { Item, ItemUpgrade, WorkshopUpgrade, Currencies, Currency, CurrencyRecord, GameSaveData, ItemWithStats } from '@/lib/gameTypes';
import { toast } from "@/components/ui/sonner";
import { useGameState, getFreshInitialItems, getFreshInitialItemUpgrades, getFreshInitialWorkshopUpgrades, BuyQuantity } from './useGameState';
import * as C from '@/constants/gameConstants';

export type PurchaseDetails = {
    purchaseQuantity: number;
    purchaseCost: CurrencyRecord;
    canAffordPurchase: boolean;
    nextLevelTarget: number | null;
    displayQuantity: string;
};

const UPGRADE_THRESHOLDS = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000];
const BUY_QUANTITY_KEY = 'magitech_idle_buy_quantity_v2';

export const useGameLogic = () => {
    const {
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
    } = useGameState();

    const debounceSaveTimeout = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(BUY_QUANTITY_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (['1', '5', '10', 'next', 'max'].includes(String(parsed))) {
                    setBuyQuantity(parsed);
                }
            }
        } catch (e) {
            console.error("Could not load buy quantity", e)
        }
    }, [setBuyQuantity]);

    const updateBuyQuantity = useCallback((q: BuyQuantity) => {
        setBuyQuantity(q);
        localStorage.setItem(BUY_QUANTITY_KEY, JSON.stringify(q));
    }, [setBuyQuantity]);

    const saveGame = useCallback((isAutoSave = false) => {
        try {
            const saveData: GameSaveData = {
                version: C.CURRENT_SAVE_VERSION,
                lastSaveTimestamp: Date.now(),
                currencies,
                items,
                itemUpgrades,
                workshopUpgrades,
                lifetimeMana,
                prestigeUpgradeLevels,
                notifiedUpgrades: Array.from(notifiedUpgrades),
                hasEverClicked,
            };
            localStorage.setItem(C.SAVE_KEY, JSON.stringify(saveData));
            setLastSaveTime(new Date(saveData.lastSaveTimestamp));
        } catch (error) {
            console.error("Failed to save game:", error);
            setSaveStatus('error');
            toast.error("Could not save game progress.");
            throw error;
        }
    }, [currencies, items, itemUpgrades, workshopUpgrades, lifetimeMana, prestigeUpgradeLevels, notifiedUpgrades, hasEverClicked, setLastSaveTime, setSaveStatus]);

    const manualSave = useCallback(() => {
        if (saveStatus === 'saving') return;
        setSaveStatus('saving');
        
        setTimeout(() => {
            try {
                saveGame();
                setSaveStatus('complete');
                setTimeout(() => setSaveStatus('idle'), 2000);
            } catch (e) {
                setTimeout(() => setSaveStatus('idle'), 2000);
            }
        }, 100);
    }, [saveGame, saveStatus, setSaveStatus]);

    const debouncedSave = useCallback(() => {
        if (debounceSaveTimeout.current) {
            clearTimeout(debounceSaveTimeout.current);
        }
        debounceSaveTimeout.current = setTimeout(() => {
            manualSave();
        }, C.DEBOUNCE_SAVE_DELAY);
    }, [manualSave]);
    
    const prestigeMultipliers = useMemo(() => {
        const multipliers = {
            manaClick: 1,
            allProduction: 1,
            shardGain: 1,
        };

        for (const upgrade of prestigeUpgrades) {
            const level = prestigeUpgradeLevels[upgrade.id] || 0;
            if (level > 0) {
                switch (upgrade.effect.type) {
                    case 'manaClickMultiplier':
                        multipliers.manaClick *= upgrade.effect.value(level);
                        break;
                    case 'allProductionMultiplier':
                        multipliers.allProduction *= upgrade.effect.value(level);
                        break;
                    case 'shardGainMultiplier':
                        multipliers.shardGain *= upgrade.effect.value(level);
                        break;
                }
            }
        }
        return multipliers;
    }, [prestigeUpgradeLevels]);

    const workshopUpgradeMultipliers = useMemo(() => {
        const multipliers = {
            gearProduction: 1,
            clickEffectiveness: 1,
            manaFromMachinery: 1,
        };

        for (const upgrade of workshopUpgrades) {
            if (upgrade.purchased) {
                switch (upgrade.effect.type) {
                    case 'gearProductionMultiplier':
                        multipliers.gearProduction *= upgrade.effect.value;
                        break;
                    case 'clickEffectivenessMultiplier':
                        multipliers.clickEffectiveness *= upgrade.effect.value;
                        break;
                    case 'manaFromMachineryMultiplier':
                        multipliers.manaFromMachinery *= upgrade.effect.value;
                        break;
                }
            }
        }
        return multipliers;
    }, [workshopUpgrades]);

    const itemUpgradeMultipliers = useMemo(() => {
        const multipliers: Record<string, { generation: number; click: number }> = {};
        for (const item of items) {
            multipliers[item.id] = { generation: 1, click: 1 };
        }

        for (const upgrade of itemUpgrades) {
            if (upgrade.purchased) {
                if (upgrade.effect.type === 'generationMultiplier') {
                    multipliers[upgrade.parentItemId].generation *= upgrade.effect.value;
                }
                if (upgrade.effect.type === 'clickMultiplier') {
                    multipliers[upgrade.parentItemId].click *= upgrade.effect.value;
                }
            }
        }
        return multipliers;
    }, [itemUpgrades, items]);

    const generationPerSecond = useMemo(() => {
        const baseGeneration = items.reduce((acc, item) => {
            if (item.level > 0) {
                for (const currency in item.generation) {
                    const key = currency as Currency;
                    const itemMultiplier = itemUpgradeMultipliers[item.id]?.generation || 1;
                    let value = (item.generation[key] || 0) * item.level * itemMultiplier;
                    
                    if (key === 'mana' && item.category === 'Advanced Machinery') {
                        value *= workshopUpgradeMultipliers.manaFromMachinery;
                    }
                    if (key === 'cogwheelGears') {
                        value *= workshopUpgradeMultipliers.gearProduction;
                    }
                    
                    acc[key] = (acc[key] || 0) + value;
                }
            }
            return acc;
        }, {} as Partial<Currencies>);

        for (const key in baseGeneration) {
            const currency = key as Currency;
            baseGeneration[currency] = (baseGeneration[currency] || 0) * prestigeMultipliers.allProduction;
        }
        return baseGeneration;
    }, [items, prestigeMultipliers.allProduction, itemUpgradeMultipliers, workshopUpgradeMultipliers]);

    useEffect(() => {
        const loadGame = () => {
            try {
                const savedGame = localStorage.getItem(C.SAVE_KEY);

                if (!savedGame) {
                    return; // No save data, start fresh
                }
                
                const saveData: GameSaveData = JSON.parse(savedGame);

                if(saveData.version !== C.CURRENT_SAVE_VERSION) {
                    console.warn(`Save file version mismatch. Expected ${C.CURRENT_SAVE_VERSION}, got ${saveData.version}. Starting fresh.`);
                    localStorage.removeItem(C.SAVE_KEY);
                    return;
                }
                
                if (saveData.lastSaveTimestamp) {
                    setLastSaveTime(new Date(saveData.lastSaveTimestamp));
                }

                const timeAway = (Date.now() - saveData.lastSaveTimestamp) / 1000; // seconds

                if (timeAway > 60) { // Only calculate for >1 min away
                    // --- Re-calculate multipliers and generation based on SAVED data ---
                    
                    const prestigeMultipliers = { manaClick: 1, allProduction: 1, shardGain: 1 };
                    for (const upgrade of prestigeUpgrades) {
                        const level = saveData.prestigeUpgradeLevels[upgrade.id] || 0;
                        if (level > 0) {
                            switch (upgrade.effect.type) {
                                case 'manaClickMultiplier': prestigeMultipliers.manaClick *= upgrade.effect.value(level); break;
                                case 'allProductionMultiplier': prestigeMultipliers.allProduction *= upgrade.effect.value(level); break;
                                case 'shardGainMultiplier': prestigeMultipliers.shardGain *= upgrade.effect.value(level); break;
                            }
                        }
                    }

                    const itemUpgradeMultipliers: Record<string, { generation: number; click: number }> = {};
                    for (const item of saveData.items) {
                        itemUpgradeMultipliers[item.id] = { generation: 1, click: 1 };
                    }
                    for (const upgrade of saveData.itemUpgrades) {
                        if (upgrade.purchased) {
                            if (upgrade.effect.type === 'generationMultiplier') {
                                itemUpgradeMultipliers[upgrade.parentItemId].generation *= upgrade.effect.value;
                            }
                            if (upgrade.effect.type === 'clickMultiplier') {
                                itemUpgradeMultipliers[upgrade.parentItemId].click *= upgrade.effect.value;
                            }
                        }
                    }

                    const workshopUpgradeMultipliers = {
                        gearProduction: 1,
                        clickEffectiveness: 1,
                        manaFromMachinery: 1,
                    };
                    for (const upgrade of saveData.workshopUpgrades || getFreshInitialWorkshopUpgrades()) {
                        if (upgrade.purchased) {
                            switch (upgrade.effect.type) {
                                case 'gearProductionMultiplier':
                                    workshopUpgradeMultipliers.gearProduction *= upgrade.effect.value;
                                    break;
                                case 'clickEffectivenessMultiplier':
                                    workshopUpgradeMultipliers.clickEffectiveness *= upgrade.effect.value;
                                    break;
                                case 'manaFromMachineryMultiplier':
                                    workshopUpgradeMultipliers.manaFromMachinery *= upgrade.effect.value;
                                    break;
                            }
                        }
                    }

                    const offlineGps = saveData.items.reduce((acc, item) => {
                        if (item.level > 0) {
                            for (const currency in item.generation) {
                                const key = currency as Currency;
                                const itemMultiplier = itemUpgradeMultipliers[item.id]?.generation || 1;
                                let value = (item.generation[key] || 0) * item.level * itemMultiplier;

                                if (key === 'mana' && item.category === 'Advanced Machinery') {
                                    value *= workshopUpgradeMultipliers.manaFromMachinery;
                                }
                                if (key === 'cogwheelGears') {
                                    value *= workshopUpgradeMultipliers.gearProduction;
                                }
                                
                                acc[key] = (acc[key] || 0) + value;
                            }
                        }
                        return acc;
                    }, {} as Partial<Currencies>);

                    for (const key in offlineGps) {
                        const currency = key as Currency;
                        offlineGps[currency] = (offlineGps[currency] || 0) * prestigeMultipliers.allProduction;
                    }

                    // --- Calculate and apply earnings ---
                    const earnings: CurrencyRecord = {};
                    Object.entries(offlineGps).forEach(([currency, rate]) => {
                        earnings[currency as Currency] = rate * timeAway * C.OFFLINE_EARNING_RATE;
                    });
                    
                    let manaEarned = 0;
                    Object.entries(earnings).forEach(([currency, amount]) => {
                        const key = currency as Currency;
                        saveData.currencies[key] = (saveData.currencies[key] || 0) + amount;
                        if(key === 'mana') manaEarned = amount;
                    });

                    saveData.lifetimeMana += manaEarned;
                    
                    if (Object.values(earnings).some(v => v > 0)) {
                        setOfflineEarnings({ timeAway, earnings });
                    }
                }
                
                // --- Set all state from save data ---
                setCurrencies(saveData.currencies);
                setItems(saveData.items);
                setItemUpgrades(saveData.itemUpgrades);
                setWorkshopUpgrades(saveData.workshopUpgrades || getFreshInitialWorkshopUpgrades());
                setLifetimeMana(saveData.lifetimeMana);
                setPrestigeUpgradeLevels(saveData.prestigeUpgradeLevels);
                setNotifiedUpgrades(new Set(saveData.notifiedUpgrades));
                setHasEverClicked(saveData.hasEverClicked);

            } catch (error) {
                console.error("Failed to load save data. Starting fresh.", error);
                localStorage.removeItem(C.SAVE_KEY);
            } finally {
                setIsLoaded(true);
            }
        };

        loadGame();
    }, [setCurrencies, setItems, setItemUpgrades, setWorkshopUpgrades, setLifetimeMana, setPrestigeUpgradeLevels, setNotifiedUpgrades, setHasEverClicked, setIsLoaded, setOfflineEarnings, setLastSaveTime]); // Dependencies are now just setters

    useEffect(() => {
        const gameLoop = setInterval(() => {
            let manaGeneratedThisTick = 0;
            setCurrencies(prev => {
                const newCurrencies = { ...prev };
                for (const key in generationPerSecond) {
                    const currency = key as Currency;
                    const amountGenerated = (generationPerSecond[currency] || 0) / (1000 / C.GAME_TICK_MS);
                    newCurrencies[currency] += amountGenerated;
                    if (currency === 'mana') {
                        manaGeneratedThisTick = amountGenerated;
                    }
                }
                return newCurrencies;
            });
            setLifetimeMana(prev => prev + manaGeneratedThisTick);
        }, C.GAME_TICK_MS);
        return () => clearInterval(gameLoop);
    }, [generationPerSecond, isLoaded, setCurrencies, setLifetimeMana]);

    // Periodic Autosave
    useEffect(() => {
        if (!isLoaded) return;

        const autoSaveInterval = setInterval(() => {
            manualSave();
        }, C.AUTOSAVE_INTERVAL);

        return () => clearInterval(autoSaveInterval);
    }, [isLoaded, manualSave]);

    const manaPerClick = useMemo(() => {
        const baseClick = 1;
        const clickItemBonus = items
            .filter(i => i.clickBonus && i.level > 0)
            .reduce((sum, i) => {
                const itemMultiplier = itemUpgradeMultipliers[i.id]?.click || 1;
                return sum + (i.clickBonus || 0) * i.level * itemMultiplier;
            }, 0);
        
        const effectiveClickBonus = clickItemBonus * workshopUpgradeMultipliers.clickEffectiveness;
        
        return (baseClick + effectiveClickBonus) * prestigeMultipliers.manaClick;
    }, [items, prestigeMultipliers.manaClick, itemUpgradeMultipliers, workshopUpgradeMultipliers]);

    const addMana = useCallback((amount: number) => {
        setCurrencies(prev => ({ ...prev, mana: prev.mana + amount }));
        setLifetimeMana(prev => prev + amount);
        if (!hasEverClicked) {
            setHasEverClicked(true);
        }
    }, [hasEverClicked, setCurrencies, setLifetimeMana, setHasEverClicked]);

    const calculateBulkCost = useCallback((item: Item, quantity: number): CurrencyRecord => {
        if (quantity <= 0) return {};
        
        const totalCost: CurrencyRecord = {};
        
        for (const currency in item.baseCost) {
            totalCost[currency as Currency] = 0;
        }

        let currentLevel = item.level;
        for (let i = 0; i < quantity; i++) {
            for (const currency in item.baseCost) {
                const key = currency as Currency;
                const base = item.baseCost[key] || 0;
                const costForThisLevel = Math.ceil(base * Math.pow(C.ITEM_COST_GROWTH_RATE, currentLevel + i));
                totalCost[key] = (totalCost[key] || 0) + costForThisLevel;
            }
        }

        return totalCost;
    }, []);

    const calculateMaxAffordable = useCallback((item: Item, currentCurrencies: Currencies): number => {
        let affordableLevels = 0;
        const tempCurrencies = { ...currentCurrencies };
    
        while (true) {
            const nextLevel = item.level + affordableLevels;
            const nextLevelCost: CurrencyRecord = {};
            let canAffordNext = true;
    
            for (const currency in item.baseCost) {
                const key = currency as Currency;
                const base = item.baseCost[key] || 0;
                const cost = Math.ceil(base * Math.pow(C.ITEM_COST_GROWTH_RATE, nextLevel));
                nextLevelCost[key] = cost;
                if ((tempCurrencies[key] || 0) < cost) {
                    canAffordNext = false;
                }
            }
            
            if (canAffordNext) {
                Object.entries(nextLevelCost).forEach(([c, cost]) => {
                    const key = c as Currency;
                    tempCurrencies[key] = (tempCurrencies[key] || 0) - cost;
                });
                affordableLevels++;
            } else {
                break;
            }
        }
        return affordableLevels;
    }, []);

    const itemPurchaseDetails = useMemo((): Map<string, PurchaseDetails> => {
        const detailsMap = new Map<string, PurchaseDetails>();
        
        for (const item of items) {
            const maxAffordable = calculateMaxAffordable(item, currencies);
            let purchaseQuantity = 0;
            let displayQuantity = '';
            let nextLevelTarget: number | null = null;
            
            if (buyQuantity === 1) {
                purchaseQuantity = maxAffordable >= 1 ? 1 : 0;
            } else if (buyQuantity === 'max') {
                purchaseQuantity = maxAffordable;
            } else if (buyQuantity === 'next') {
                const nextThreshold = UPGRADE_THRESHOLDS.find(t => t > item.level);
                if (nextThreshold) {
                    const quantityToNext = nextThreshold - item.level;
                    if(maxAffordable >= quantityToNext) {
                        purchaseQuantity = quantityToNext;
                        nextLevelTarget = nextThreshold;
                    }
                }
            } else { // 5, 10
                if (maxAffordable >= buyQuantity) {
                     purchaseQuantity = maxAffordable - (maxAffordable % buyQuantity);
                }
            }
    
            // Set display quantity based on the result
            if (nextLevelTarget) {
                displayQuantity = `to Lvl ${nextLevelTarget}`;
            } else if (purchaseQuantity > 0) {
                displayQuantity = `${purchaseQuantity} Lvl${purchaseQuantity > 1 ? '(s)' : ''}`;
            } else {
                // Fallback for button text when disabled
                displayQuantity = `1 Lvl`;
            }

            const purchaseCost = calculateBulkCost(item, purchaseQuantity);
            const canAffordPurchase = purchaseQuantity > 0;

            detailsMap.set(item.id, {
                purchaseQuantity,
                purchaseCost,
                canAffordPurchase,
                nextLevelTarget,
                displayQuantity,
            });
        }
        return detailsMap;
    }, [items, currencies, buyQuantity, calculateMaxAffordable, calculateBulkCost]);

    const handleBuyItem = useCallback((itemId: string) => {
        const details = itemPurchaseDetails.get(itemId);
        const item = items.find(i => i.id === itemId);

        if (!details || !item || !details.canAffordPurchase || details.purchaseQuantity <= 0) {
            return;
        }
        
        const { purchaseQuantity, purchaseCost } = details;

        setCurrencies(prev => {
            const newCurrencies = { ...prev };
            for (const currency in purchaseCost) {
                const key = currency as Currency;
                newCurrencies[key] -= purchaseCost[key] || 0;
            }
            return newCurrencies;
        });
        
        setItems(prevItems =>
          prevItems.map(i => {
            if (i.id !== itemId) return i;

            const newLevel = i.level + purchaseQuantity;
            const newCost: CurrencyRecord = {};
            for (const currency in i.baseCost) {
                const key = currency as Currency;
                const base = i.baseCost[key] || 0;
                newCost[key] = Math.ceil(base * Math.pow(C.ITEM_COST_GROWTH_RATE, newLevel));
            }

            return {
              ...i,
              level: newLevel,
              cost: newCost,
            };
          })
        );
        debouncedSave();
    }, [items, itemPurchaseDetails, setCurrencies, setItems, debouncedSave]);
    
    const handleBuyItemUpgrade = useCallback((upgradeId: string) => {
        const upgrade = itemUpgrades.find(u => u.id === upgradeId);
        if (!upgrade || upgrade.purchased) return;
        
        const canAfford = Object.entries(upgrade.cost).every(([currency, cost]) => {
            return currencies[currency as Currency] >= cost;
        });

        if (!canAfford) {
            toast.error("Not enough resources.");
            return;
        }

        setCurrencies(prev => {
            const newCurrencies = { ...prev };
            for (const currency in upgrade.cost) {
                newCurrencies[currency as Currency] -= upgrade.cost[currency as Currency] || 0;
            }
            return newCurrencies;
        });

        setItemUpgrades(prev => prev.map(u => u.id === upgradeId ? {...u, purchased: true} : u));
        
        toast.success("Item Upgraded!", {
          description: `You have purchased ${upgrade.name}.`,
        });
        debouncedSave();
    }, [currencies, itemUpgrades, debouncedSave]);

    const handleBuyWorkshopUpgrade = useCallback((upgradeId: string) => {
        const upgrade = workshopUpgrades.find(u => u.id === upgradeId);
        if (!upgrade || upgrade.purchased) return;
        
        const canAfford = Object.entries(upgrade.cost).every(([currency, cost]) => {
            return currencies[currency as Currency] >= cost;
        });

        if (!canAfford) {
            toast.error("Not enough resources.");
            return;
        }

        setCurrencies(prev => {
            const newCurrencies = { ...prev };
            for (const currency in upgrade.cost) {
                newCurrencies[currency as Currency] -= upgrade.cost[currency as Currency] || 0;
            }
            return newCurrencies;
        });

        setWorkshopUpgrades(prev => prev.map(u => u.id === upgradeId ? {...u, purchased: true} : u));
        
        toast.success("Workshop Upgraded!", {
          description: `You have purchased ${upgrade.name}.`,
        });
        debouncedSave();
    }, [currencies, workshopUpgrades, setCurrencies, setWorkshopUpgrades, debouncedSave]);

    const canPrestige = useMemo(() => lifetimeMana >= C.PRESTIGE_REQUIREMENT, [lifetimeMana]);
    
    const prestigeVisibility = useMemo(() => {
        if (currencies.aetherShards > 0 || lifetimeMana >= C.PRESTIGE_VISIBLE_THRESHOLD) return 'visible';
        if (lifetimeMana >= C.PRESTIGE_TEASER_THRESHOLD) return 'teaser';
        return 'hidden';
    }, [lifetimeMana, currencies.aetherShards]);

    const potentialShards = useMemo(() => {
        if (lifetimeMana < C.PRESTIGE_REQUIREMENT) return 0;
        const baseShards = Math.floor(Math.pow(lifetimeMana / 1e9, 0.5) * 5);
        return Math.floor(baseShards * prestigeMultipliers.shardGain);
    }, [lifetimeMana, prestigeMultipliers.shardGain]);

    const handlePrestige = () => {
        if (!canPrestige) return;

        const shardsGained = potentialShards;
        
        setCurrencies({
            mana: 0,
            cogwheelGears: 0,
            essenceFlux: 0,
            researchPoints: 0,
            aetherShards: currencies.aetherShards + shardsGained,
        });
        
        setItems(getFreshInitialItems());
        setItemUpgrades(getFreshInitialItemUpgrades());
        setWorkshopUpgrades(getFreshInitialWorkshopUpgrades());
        setLifetimeMana(0);
        setNotifiedUpgrades(new Set()); // Reset notifications on prestige
        
        toast("Dimensional Shift!", {
          description: `You have gained ${shardsGained} Aether Shards. The world resets, but you are stronger.`,
        });
        saveGame(); // Immediate save on prestige
    };

    const handleBuyPrestigeUpgrade = useCallback((upgradeId: string) => {
        const upgrade = prestigeUpgrades.find(u => u.id === upgradeId);
        if (!upgrade) return;

        const currentLevel = prestigeUpgradeLevels[upgrade.id] || 0;
        if (currentLevel >= upgrade.maxLevel) {
            toast.error("Max level reached for this upgrade.");
            return;
        };

        const cost = upgrade.cost(currentLevel);
        if (currencies.aetherShards < cost) {
            toast.error("Not enough Aether Shards.");
            return;
        }

        setCurrencies(prev => ({ ...prev, aetherShards: prev.aetherShards - cost }));
        setPrestigeUpgradeLevels(prev => ({ ...prev, [upgradeId]: currentLevel + 1 }));
        debouncedSave();
    }, [currencies.aetherShards, prestigeUpgradeLevels, debouncedSave]);

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

    const itemCategories = useMemo(() => {
        const categories: Record<string, ItemWithStats[]> = {
            'Basic Magitech': [],
            'Advanced Machinery': [],
            'Mystical Artifacts': [],
        };
        
        const allUpgradesByItem = allItemUpgrades.reduce((acc, upg) => {
            if (!acc[upg.parentItemId]) acc[upg.parentItemId] = [];
            acc[upg.parentItemId].push(upg);
            return acc;
        }, {} as Record<string, ItemUpgrade[]>);

        for (const item of items) {
            const requiredCurrencies = Object.keys(item.baseCost) as Currency[];
            const allCurrenciesUnlocked = requiredCurrencies.every(c => unlockedCurrencies.has(c));
            
            if (!allCurrenciesUnlocked && item.level === 0) continue;

            const initialCostSum = Object.values(item.baseCost).reduce((a, b) => a + (b || 0), 0);
            const manaRequirement = initialCostSum * 0.8;

            if (lifetimeMana < manaRequirement && item.level === 0) continue;

            const itemGenMultiplier = itemUpgradeMultipliers[item.id]?.generation || 1;
            const itemClickMultiplier = itemUpgradeMultipliers[item.id]?.click || 1;
            
            const totalProduction: CurrencyRecord = {};
            const productionPerLevel: CurrencyRecord = {};
            for (const currency in item.generation) {
                const key = currency as Currency;
                const baseGen = (item.generation[key] || 0) * itemGenMultiplier;
                productionPerLevel[key] = baseGen;
                totalProduction[key] = baseGen * item.level;
            }
            
            const clickBonusPerLevel = (item.clickBonus || 0) * itemClickMultiplier;
            const totalClickBonus = clickBonusPerLevel * item.level;
            
            const purchasedUpgradesCount = itemUpgrades.filter(u => u.parentItemId === item.id && u.purchased).length;
            const totalUpgradesCount = (allUpgradesByItem[item.id] || []).length;

            categories[item.category].push({
                ...item,
                totalProduction,
                productionPerLevel,
                totalClickBonus,
                clickBonusPerLevel,
                upgradeStats: {
                    purchased: purchasedUpgradesCount,
                    total: totalUpgradesCount
                }
            });
        }

        return categories;
    }, [items, unlockedCurrencies, lifetimeMana, itemUpgradeMultipliers, itemUpgrades]);
    
    const categoryUnlockStatus = useMemo(() => {
        const totalBasicLevels = itemCategories['Basic Magitech'].reduce((sum, u) => sum + u.level, 0);
        return {
          'Basic Magitech': true,
          'Advanced Machinery': totalBasicLevels >= 5 || currencies.mana > 10000,
          'Mystical Artifacts': (items.find(u => u.id === 'clockwork_automaton')?.level || 0) > 0 || currencies.cogwheelGears > 500,
        }
    }, [itemCategories, currencies.mana, currencies.cogwheelGears, items]);

    const showUpgradesTab = useMemo(() => {
        return items.some(i => i.level >= 10);
    }, [items]);

    const showWorkshopTab = useMemo(() => {
        const hasGears = currencies.cogwheelGears > 0;
        const hasPurchasedWorkshopUpgrade = workshopUpgrades.some(u => u.purchased);
        const hasUnlockedAutomaton = (items.find(i => i.id === 'clockwork_automaton')?.level || 0) > 0;
        
        return hasGears || hasPurchasedWorkshopUpgrade || hasUnlockedAutomaton;
    }, [currencies.cogwheelGears, workshopUpgrades, items]);

    const availableItemUpgrades = useMemo(() => {
        return itemUpgrades.filter(upgrade => {
            if (upgrade.purchased) return false;
            const parentItem = items.find(i => i.id === upgrade.parentItemId);
            return parentItem && parentItem.level >= upgrade.unlocksAtLevel;
        });
    }, [itemUpgrades, items]);

    const availableWorkshopUpgrades = useMemo(() => {
        return workshopUpgrades.filter(upgrade => !upgrade.purchased);
    }, [workshopUpgrades]);

    useEffect(() => {
        const newlyAvailable = availableItemUpgrades.filter(upgrade => !notifiedUpgrades.has(upgrade.id));

        if (newlyAvailable.length > 0) {
            const firstUpgrade = newlyAvailable[0];
            const parentItem = items.find(i => i.id === firstUpgrade.parentItemId);
            let description = `'${firstUpgrade.name}' for your ${parentItem?.name || 'item'}.`;
            if (newlyAvailable.length > 1) {
                description += ` (+${newlyAvailable.length - 1} more)`;
            }
            description += " Check the Upgrades tab!";

            toast.info("New Upgrade Available!", { description });

            setNotifiedUpgrades(prev => {
                const newSet = new Set(prev);
                newlyAvailable.forEach(u => newSet.add(u.id));
                return newSet;
            });
        }
    }, [availableItemUpgrades, items, notifiedUpgrades]);

    const showTutorial = useMemo(() => {
        return !hasEverClicked && currencies.mana === 0 && (generationPerSecond.mana || 0) === 0;
    }, [hasEverClicked, currencies.mana, generationPerSecond]);

    const clearOfflineEarnings = useCallback(() => setOfflineEarnings(null), [setOfflineEarnings]);

    const resetGame = useCallback(() => {
        if(window.confirm("Are you sure you want to reset all progress? This cannot be undone.")){
            localStorage.removeItem(C.SAVE_KEY);
            window.location.reload();
        }
    }, []);

    const exportSave = useCallback(() => {
        try {
            const dataStr = localStorage.getItem(C.SAVE_KEY);
            if (!dataStr) {
                toast.error("No save data to export.");
                return;
            }
            const data = new Blob([dataStr], { type: 'text/plain' });
            const url = window.URL.createObjectURL(data);
            const link = document.createElement('a');
            link.href = url;
            link.download = `magitech-idle-save-${Date.now()}.txt`;
            link.click();
            window.URL.revokeObjectURL(url);
            toast.success("Save data exported!");
        } catch (error) {
            console.error("Export failed", error);
            toast.error("Failed to export save data.");
        }
    }, []);

    const importSave = useCallback((file: File) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedString = event.target?.result as string;
                // Basic validation before reloading
                const data = JSON.parse(importedString);
                if (data.version && data.currencies) {
                    localStorage.setItem(C.SAVE_KEY, importedString);
                    toast.success("Save data imported successfully! Reloading game...");
                    setTimeout(() => window.location.reload(), 1500);
                } else {
                    throw new Error("Invalid save file format.");
                }
            } catch (error) {
                console.error("Import failed", error);
                toast.error("Failed to import save data. File may be corrupt or invalid.");
            }
        };
        reader.readAsText(file);
    }, []);

    return {
        isLoaded,
        currencies,
        lifetimeMana,
        generationPerSecond,
        manaPerClick,
        addMana,
        handleBuyItem,
        canPrestige,
        potentialShards,
        handlePrestige,
        itemCategories,
        itemPurchaseDetails,
        categoryUnlockStatus,
        prestigeUpgrades,
        prestigeUpgradeLevels,
        handleBuyPrestigeUpgrade,
        prestigeVisibility,
        showUpgradesTab,
        availableItemUpgrades,
        handleBuyItemUpgrade,
        showWorkshopTab,
        availableWorkshopUpgrades,
        handleBuyWorkshopUpgrade,
        showTutorial,
        offlineEarnings,
        clearOfflineEarnings,
        resetGame,
        exportSave,
        importSave,
        manualSave,
        saveStatus,
        lastSaveTime,
        buyQuantity,
        setBuyQuantity: updateBuyQuantity,
    };
};
