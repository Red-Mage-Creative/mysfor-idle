import { useMemo, useCallback } from 'react';
import { prestigeUpgrades } from '@/lib/prestigeUpgrades';
import { allItemUpgrades } from '@/lib/itemUpgrades';
import { Item, ItemUpgrade, Currencies, Currency, CurrencyRecord, ItemWithStats, PurchaseDetails } from '@/lib/gameTypes';
import * as C from '@/constants/gameConstants';
import { UseGameState } from './useGameState';

type UseGameCalculationsProps = Pick<UseGameState,
    'currencies' |
    'items' |
    'itemUpgrades' |
    'workshopUpgrades' |
    'lifetimeMana' |
    'prestigeUpgradeLevels' |
    'buyQuantity' |
    'hasEverClicked' |
    'overclockLevel'
>;

const UPGRADE_THRESHOLDS = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000];

const calculateBulkCost = (item: Item, quantity: number): CurrencyRecord => {
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
};

const calculateMaxAffordable = (item: Item, currentCurrencies: Currencies): number => {
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
};

export const useGameCalculations = ({
    currencies,
    items,
    itemUpgrades,
    workshopUpgrades,
    lifetimeMana,
    prestigeUpgradeLevels,
    buyQuantity,
    hasEverClicked,
    overclockLevel,
}: UseGameCalculationsProps) => {

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

    const overclockInfo = useMemo(() => {
        const maxLevelUnlocked = itemUpgrades
            .filter(u => u.purchased && u.effect.type === 'unlockOverclockLevel')
            .length;

        const currentLevel = Math.min(overclockLevel, maxLevelUnlocked);

        const speedMultiplier = currentLevel > 0 ? Math.pow(1.5, currentLevel) : 1;
        const gearDrainPerSecond = currentLevel > 0 ? 5 * Math.pow(2, currentLevel - 1) : 0;
        
        return {
            currentLevel,
            maxLevelUnlocked,
            speedMultiplier,
            gearDrainPerSecond,
            isUnlocked: maxLevelUnlocked > 0,
        };
    }, [itemUpgrades, overclockLevel]);

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

        // Apply overclock effects
        if (overclockInfo.speedMultiplier > 1) {
            for (const key in baseGeneration) {
                const currency = key as Currency;
                baseGeneration[currency] = (baseGeneration[currency] || 0) * overclockInfo.speedMultiplier;
            }
        }
        if (overclockInfo.gearDrainPerSecond > 0) {
            baseGeneration.cogwheelGears = (baseGeneration.cogwheelGears || 0) - overclockInfo.gearDrainPerSecond;
        }

        return baseGeneration;
    }, [items, prestigeMultipliers.allProduction, itemUpgradeMultipliers, workshopUpgradeMultipliers, overclockInfo]);

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

    const itemPurchaseDetails = useMemo(() => {
        const detailsMap = new Map<string, PurchaseDetails>();
        
        for (const item of items) {
            const maxAffordable = calculateMaxAffordable(item, currencies);
            
            let intendedPurchaseQuantity = 0;
            let purchaseQuantity = 0;
            let displayQuantity = '';
            let nextLevelTarget: number | null = null;
            
            if (buyQuantity === 'max') {
                intendedPurchaseQuantity = maxAffordable;
            } else if (buyQuantity === 'next') {
                const nextThreshold = UPGRADE_THRESHOLDS.find(t => t > item.level);
                if (nextThreshold) {
                    const quantityToNext = nextThreshold - item.level;
                    intendedPurchaseQuantity = quantityToNext > 0 ? quantityToNext : 1;
                    nextLevelTarget = nextThreshold;
                } else {
                    intendedPurchaseQuantity = 1;
                }
            } else { // 1, 5, 10
                intendedPurchaseQuantity = buyQuantity;
            }

            const canAffordIntended = maxAffordable >= intendedPurchaseQuantity;
            
            if (buyQuantity === 'max') {
                purchaseQuantity = maxAffordable; // For 'max', you always buy what you can afford.
            } else if (canAffordIntended) {
                purchaseQuantity = intendedPurchaseQuantity;
            }
            // else, purchaseQuantity remains 0 for bulk buys you can't afford.
            
            const intendedPurchaseCost = calculateBulkCost(item, intendedPurchaseQuantity);
            const purchaseCost = calculateBulkCost(item, purchaseQuantity);

            // Determine display string for the button
            if (nextLevelTarget) {
                displayQuantity = `to Lvl ${nextLevelTarget}`;
            } else if (buyQuantity === 'max') {
                displayQuantity = `${purchaseQuantity} Lvl${purchaseQuantity !== 1 ? 's' : ''}`;
            } else { // 1, 5, 10, 'next' without a valid target
                displayQuantity = `${intendedPurchaseQuantity} Lvl${intendedPurchaseQuantity !== 1 ? 's' : ''}`;
            }

            detailsMap.set(item.id, {
                purchaseQuantity,
                purchaseCost,
                canAffordPurchase: canAffordIntended,
                nextLevelTarget,
                displayQuantity,
                intendedPurchaseQuantity,
                intendedPurchaseCost,
            });
        }
        return detailsMap;
    }, [items, currencies, buyQuantity]);

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
        const purchasedIds = new Set(workshopUpgrades.filter(u => u.purchased).map(u => u.id));
        
        return workshopUpgrades.filter(upgrade => {
            if (upgrade.purchased) return false;

            // Unlock logic: A tier 2 or 3 upgrade is available if the previous tier is purchased.
            // Tier 1 upgrades are available if they haven't been purchased yet.
            const isTier1 = !upgrade.id.includes('_2') && !upgrade.id.includes('_3');

            switch (upgrade.id) {
                // Tier 2 unlocks
                case 'gear_optimization_2':
                    return purchasedIds.has('gear_optimization_1');
                case 'precision_engineering_2':
                    return purchasedIds.has('precision_engineering_1');
                case 'advanced_assembly_lines_2':
                    return purchasedIds.has('advanced_assembly_lines_1');
                // Tier 3 unlocks
                case 'gear_optimization_3':
                    return purchasedIds.has('gear_optimization_2');
                case 'precision_engineering_3':
                    return purchasedIds.has('precision_engineering_2');
                case 'advanced_assembly_lines_3':
                    return purchasedIds.has('advanced_assembly_lines_2');
                default:
                    // Show tier 1 by default
                    return isTier1;
            }
        });
    }, [workshopUpgrades]);
    
    const showTutorial = useMemo(() => {
        return !hasEverClicked && currencies.mana === 0 && (generationPerSecond.mana || 0) === 0;
    }, [hasEverClicked, currencies.mana, generationPerSecond]);

    return {
        prestigeMultipliers,
        workshopUpgradeMultipliers,
        itemUpgradeMultipliers,
        overclockInfo,
        generationPerSecond,
        manaPerClick,
        itemPurchaseDetails,
        canPrestige,
        prestigeVisibility,
        potentialShards,
        unlockedCurrencies,
        itemCategories,
        categoryUnlockStatus,
        showUpgradesTab,
        showWorkshopTab,
        availableItemUpgrades,
        availableWorkshopUpgrades,
        showTutorial,
    };
};
