
import { useState, useEffect, useMemo, useCallback } from 'react';
import { initialUpgrades } from '@/lib/initialUpgrades';
import { prestigeUpgrades } from '@/lib/prestigeUpgrades';
import { Upgrade, Currencies, Currency, CurrencyRecord } from '@/lib/gameTypes';
import { toast } from "@/components/ui/sonner";

const PRESTIGE_REQUIREMENT = 1e9; // 1 Billion Mana

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

    const manaPerClick = useMemo(() => 1 * prestigeMultipliers.manaClick, [prestigeMultipliers.manaClick]);

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


    const upgradeCategories = useMemo(() => ({
        'Basic Magitech': upgrades.filter(u => u.category === 'Basic Magitech'),
        'Advanced Machinery': upgrades.filter(u => u.category === 'Advanced Machinery'),
        'Mystical Artifacts': upgrades.filter(u => u.category === 'Mystical Artifacts'),
    }), [upgrades]);
    
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
    };
};
