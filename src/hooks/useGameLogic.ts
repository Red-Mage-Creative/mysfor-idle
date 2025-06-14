import { useState, useEffect, useMemo, useCallback } from 'react';
import { initialUpgrades } from '@/lib/initialUpgrades';
import { prestigeUpgrades } from '@/lib/prestigeUpgrades';
import { Upgrade, Currencies, Currency, CurrencyRecord } from '@/lib/gameTypes';
import { toast } from "@/components/ui/sonner";

const PRESTIGE_REQUIREMENT = 1e9; // 1 Billion Mana
const PRESTIGE_TEASER_THRESHOLD = PRESTIGE_REQUIREMENT * 0.25; // 250M
const PRESTIGE_VISIBLE_THRESHOLD = PRESTIGE_REQUIREMENT * 0.50; // 500M

const getFreshInitialUpgrades = (): Upgrade[] => {
    // This creates a fresh copy of the upgrades, preserving the icon components.
    return initialUpgrades.map(upgrade => ({
        ...upgrade,
        cost: { ...upgrade.cost },
        baseCost: { ...upgrade.baseCost },
        generation: { ...upgrade.generation },
    }));
};

export const useGameLogic = () => {
    const [currencies, setCurrencies] = useState<Currencies>({
        mana: 0,
        cogwheelGears: 0,
        essenceFlux: 0,
        researchPoints: 0,
        aetherShards: 0,
    });
    const [upgrades, setUpgrades] = useState<Upgrade[]>(getFreshInitialUpgrades());
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

    const generationPerSecond = useMemo(() => {
        const baseGeneration = upgrades.reduce((acc, upgrade) => {
            if (upgrade.level > 0) {
                for (const currency in upgrade.generation) {
                    const key = currency as Currency;
                    acc[key] = (acc[key] || 0) + (upgrade.generation[key] || 0) * upgrade.level;
                }
            }
            return acc;
        }, {} as Partial<Currencies>);

        for (const key in baseGeneration) {
            const currency = key as Currency;
            baseGeneration[currency] = (baseGeneration[currency] || 0) * prestigeMultipliers.allProduction;
        }
        return baseGeneration;
    }, [upgrades, prestigeMultipliers.allProduction]);

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
        const clickUpgradeBonus = upgrades
            .filter(u => u.clickBonus && u.level > 0)
            .reduce((sum, u) => sum + (u.clickBonus || 0) * u.level, 0);
        
        return (baseClick + clickUpgradeBonus) * prestigeMultipliers.manaClick;
    }, [upgrades, prestigeMultipliers.manaClick]);

    const addMana = useCallback((amount: number) => {
        setCurrencies(prev => ({ ...prev, mana: prev.mana + amount }));
        setLifetimeMana(prev => prev + amount);
    }, []);

    const handleBuyUpgrade = useCallback((upgradeId: string) => {
        const upgrade = upgrades.find(u => u.id === upgradeId);
        if (!upgrade) return;

        const canAfford = Object.entries(upgrade.cost).every(([currency, cost]) => {
            return currencies[currency as Currency] >= cost;
        });

        if (!canAfford) return;

        setCurrencies(prev => {
            const newCurrencies = { ...prev };
            for (const currency in upgrade.cost) {
                const key = currency as Currency;
                newCurrencies[key] -= upgrade.cost[key] || 0;
            }
            return newCurrencies;
        });
        
        setUpgrades(prevUpgrades =>
          prevUpgrades.map(u => {
            if (u.id !== upgradeId) return u;

            const newLevel = u.level + 1;
            const newCost: CurrencyRecord = {};
            for (const currency in u.baseCost) {
                const key = currency as Currency;
                const base = u.baseCost[key] || 0;
                newCost[key] = Math.ceil(base * Math.pow(1.15, newLevel));
            }

            return {
              ...u,
              level: newLevel,
              cost: newCost,
            };
          })
        );
    }, [currencies, upgrades]);

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
        
        setUpgrades(getFreshInitialUpgrades());
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

    const upgradeCategories = useMemo(() => {
        const categories: Record<string, Upgrade[]> = {
            'Basic Magitech': [],
            'Advanced Machinery': [],
            'Mystical Artifacts': [],
        };

        for (const upgrade of upgrades) {
            // Condition 1: Check if all required currencies for cost are unlocked
            const requiredCurrencies = Object.keys(upgrade.baseCost) as Currency[];
            const allCurrenciesUnlocked = requiredCurrencies.every(c => unlockedCurrencies.has(c));
            
            if (!allCurrenciesUnlocked && upgrade.level === 0) continue;

            // Condition 2: Check if lifetime mana is 80% of the initial cost
            const initialCostSum = Object.values(upgrade.baseCost).reduce((a, b) => a + (b || 0), 0);
            const manaRequirement = initialCostSum * 0.8;

            if (lifetimeMana < manaRequirement && upgrade.level === 0) continue;

            categories[upgrade.category].push(upgrade);
        }

        return categories;
    }, [upgrades, unlockedCurrencies, lifetimeMana]);
    
    const categoryUnlockStatus = useMemo(() => {
        const totalBasicLevels = upgradeCategories['Basic Magitech'].reduce((sum, u) => sum + u.level, 0);
        return {
          'Basic Magitech': true,
          'Advanced Machinery': totalBasicLevels >= 5 || currencies.mana > 10000,
          'Mystical Artifacts': (upgrades.find(u => u.id === 'clockwork_automaton')?.level || 0) > 0 || currencies.cogwheelGears > 500,
        }
    }, [upgradeCategories, currencies.mana, currencies.cogwheelGears, upgrades]);

    return {
        currencies,
        upgrades,
        lifetimeMana,
        generationPerSecond,
        manaPerClick,
        addMana,
        handleBuyUpgrade,
        canPrestige,
        potentialShards,
        handlePrestige,
        upgradeCategories,
        categoryUnlockStatus,
        prestigeUpgrades,
        prestigeUpgradeLevels,
        handleBuyPrestigeUpgrade,
        prestigeVisibility,
    };
};
