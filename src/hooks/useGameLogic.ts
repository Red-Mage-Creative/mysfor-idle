import { useState, useEffect, useMemo, useCallback } from 'react';
import { initialItems } from '@/lib/initialItems';
import { prestigeUpgrades } from '@/lib/prestigeUpgrades';
import { allItemUpgrades } from '@/lib/itemUpgrades';
import { Item, ItemUpgrade, Currencies, Currency, CurrencyRecord } from '@/lib/gameTypes';
import { toast } from "@/components/ui/sonner";

const PRESTIGE_REQUIREMENT = 1e9; // 1 Billion Mana
const PRESTIGE_TEASER_THRESHOLD = PRESTIGE_REQUIREMENT * 0.25; // 250M
const PRESTIGE_VISIBLE_THRESHOLD = PRESTIGE_REQUIREMENT * 0.50; // 500M

const getFreshInitialItems = (): Item[] => {
    return initialItems.map(item => ({
        ...item,
        cost: { ...item.cost },
        baseCost: { ...item.baseCost },
        generation: { ...item.generation },
    }));
};

const getFreshInitialItemUpgrades = (): ItemUpgrade[] => {
    return allItemUpgrades.map(upgrade => ({ ...upgrade }));
};


export const useGameLogic = () => {
    const [currencies, setCurrencies] = useState<Currencies>({
        mana: 0,
        cogwheelGears: 0,
        essenceFlux: 0,
        researchPoints: 0,
        aetherShards: 0,
    });
    const [items, setItems] = useState<Item[]>(getFreshInitialItems());
    const [itemUpgrades, setItemUpgrades] = useState<ItemUpgrade[]>(getFreshInitialItemUpgrades());
    const [lifetimeMana, setLifetimeMana] = useState(0);
    const [prestigeUpgradeLevels, setPrestigeUpgradeLevels] = useState<Record<string, number>>({});

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
                    const value = (item.generation[key] || 0) * item.level * itemMultiplier;
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
    }, [items, prestigeMultipliers.allProduction, itemUpgradeMultipliers]);

    useEffect(() => {
        const gameLoop = setInterval(() => {
            let manaGeneratedThisTick = 0;
            setCurrencies(prev => {
                const newCurrencies = { ...prev };
                for (const key in generationPerSecond) {
                    const currency = key as Currency;
                    const amountGenerated = (generationPerSecond[currency] || 0) / 10;
                    newCurrencies[currency] += amountGenerated;
                    if (currency === 'mana') {
                        manaGeneratedThisTick = amountGenerated;
                    }
                }
                return newCurrencies;
            });
            setLifetimeMana(prev => prev + manaGeneratedThisTick);
        }, 100);
        return () => clearInterval(gameLoop);
    }, [generationPerSecond]);

    const manaPerClick = useMemo(() => {
        const baseClick = 1;
        const clickItemBonus = items
            .filter(i => i.clickBonus && i.level > 0)
            .reduce((sum, i) => {
                const itemMultiplier = itemUpgradeMultipliers[i.id]?.click || 1;
                return sum + (i.clickBonus || 0) * i.level * itemMultiplier;
            }, 0);
        
        return (baseClick + clickItemBonus) * prestigeMultipliers.manaClick;
    }, [items, prestigeMultipliers.manaClick, itemUpgradeMultipliers]);

    const addMana = useCallback((amount: number) => {
        setCurrencies(prev => ({ ...prev, mana: prev.mana + amount }));
        setLifetimeMana(prev => prev + amount);
    }, []);

    const handleBuyItem = useCallback((itemId: string) => {
        const item = items.find(i => i.id === itemId);
        if (!item) return;

        const canAfford = Object.entries(item.cost).every(([currency, cost]) => {
            return currencies[currency as Currency] >= cost;
        });

        if (!canAfford) return;

        setCurrencies(prev => {
            const newCurrencies = { ...prev };
            for (const currency in item.cost) {
                const key = currency as Currency;
                newCurrencies[key] -= item.cost[key] || 0;
            }
            return newCurrencies;
        });
        
        setItems(prevItems =>
          prevItems.map(i => {
            if (i.id !== itemId) return i;

            const newLevel = i.level + 1;
            const newCost: CurrencyRecord = {};
            for (const currency in i.baseCost) {
                const key = currency as Currency;
                const base = i.baseCost[key] || 0;
                newCost[key] = Math.ceil(base * Math.pow(1.15, newLevel));
            }

            return {
              ...i,
              level: newLevel,
              cost: newCost,
            };
          })
        );
    }, [currencies, items]);
    
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

    }, [currencies, itemUpgrades]);

    const canPrestige = useMemo(() => lifetimeMana >= PRESTIGE_REQUIREMENT, [lifetimeMana]);
    
    const prestigeVisibility = useMemo(() => {
        if (currencies.aetherShards > 0 || lifetimeMana >= PRESTIGE_VISIBLE_THRESHOLD) return 'visible';
        if (lifetimeMana >= PRESTIGE_TEASER_THRESHOLD) return 'teaser';
        return 'hidden';
    }, [lifetimeMana, currencies.aetherShards]);

    const potentialShards = useMemo(() => {
        if (lifetimeMana < PRESTIGE_REQUIREMENT) return 0;
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
        setLifetimeMana(0);
        
        toast("Dimensional Shift!", {
          description: `You have gained ${shardsGained} Aether Shards. The world resets, but you are stronger.`,
        });
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
    }, [currencies.aetherShards, prestigeUpgradeLevels]);


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
        const categories: Record<string, Item[]> = {
            'Basic Magitech': [],
            'Advanced Machinery': [],
            'Mystical Artifacts': [],
        };

        for (const item of items) {
            const requiredCurrencies = Object.keys(item.baseCost) as Currency[];
            const allCurrenciesUnlocked = requiredCurrencies.every(c => unlockedCurrencies.has(c));
            
            if (!allCurrenciesUnlocked && item.level === 0) continue;

            const initialCostSum = Object.values(item.baseCost).reduce((a, b) => a + (b || 0), 0);
            const manaRequirement = initialCostSum * 0.8;

            if (lifetimeMana < manaRequirement && item.level === 0) continue;

            categories[item.category].push(item);
        }

        return categories;
    }, [items, unlockedCurrencies, lifetimeMana]);
    
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

    const availableItemUpgrades = useMemo(() => {
        return itemUpgrades.filter(upgrade => {
            if (upgrade.purchased) return false;
            const parentItem = items.find(i => i.id === upgrade.parentItemId);
            return parentItem && parentItem.level >= upgrade.unlocksAtLevel;
        });
    }, [itemUpgrades, items]);

    return {
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
        categoryUnlockStatus,
        prestigeUpgrades,
        prestigeUpgradeLevels,
        handleBuyPrestigeUpgrade,
        prestigeVisibility,
        showUpgradesTab,
        availableItemUpgrades,
        handleBuyItemUpgrade,
    };
};
