
import { useMemo } from 'react';
import { Item, ItemUpgrade, Currencies, Currency, CurrencyRecord, ItemWithStats, PurchaseDetails } from '@/lib/gameTypes';
import * as C from '@/constants/gameConstants';
import { useGameState } from './useGameState';
import { useGameMultipliers } from './useGameMultipliers';
import { useProduction } from './useProduction';
import { allItemUpgrades } from '@/lib/itemUpgrades';

type UseItemManagementProps = Pick<ReturnType<typeof useGameState>,
    'items' |
    'itemUpgrades' |
    'currencies' |
    'buyQuantity' |
    'lifetimeMana' |
    'hasEverPrestiged'
> & {
    multipliers: ReturnType<typeof useGameMultipliers>;
    production: ReturnType<typeof useProduction>;
};

const UPGRADE_THRESHOLDS = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000];

const calculateBulkCost = (item: Item, quantity: number, costReduction: number): CurrencyRecord => {
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
            const costForThisLevel = Math.ceil(base * Math.pow(C.ITEM_COST_GROWTH_RATE, currentLevel + i) * costReduction);
            totalCost[key] = (totalCost[key] || 0) + costForThisLevel;
        }
    }

    return totalCost;
};

const calculateMaxAffordable = (item: Item, currentCurrencies: Currencies, costReduction: number): number => {
    let affordableLevels = 0;
    const tempCurrencies = { ...currentCurrencies };

    while (true) {
        const nextLevel = item.level + affordableLevels;
        const nextLevelCost: CurrencyRecord = {};
        let canAffordNext = true;

        for (const currency in item.baseCost) {
            const key = currency as Currency;
            const base = item.baseCost[key] || 0;
            const cost = Math.ceil(base * Math.pow(C.ITEM_COST_GROWTH_RATE, nextLevel) * costReduction);
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

export const useItemManagement = ({
    items,
    itemUpgrades,
    currencies,
    buyQuantity,
    lifetimeMana,
    hasEverPrestiged,
    multipliers,
    production,
}: UseItemManagementProps) => {
    const { prestigeMultipliers, researchBonuses, golemEffects, itemUpgradeMultipliers } = multipliers;
    const { generationPerSecond } = production;

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
    
    const itemPurchaseDetails = useMemo(() => {
        const detailsMap = new Map<string, PurchaseDetails>();
        
        const totalCostReduction = prestigeMultipliers.costReduction * researchBonuses.costReduction;
        const finalCostMultiplier = golemEffects.costMultiplier;

        for (const item of items) {
            const maxAffordable = calculateMaxAffordable(item, currencies, totalCostReduction * finalCostMultiplier);
            
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
            } else {
                intendedPurchaseQuantity = buyQuantity;
            }

            let canAffordIntended = maxAffordable >= intendedPurchaseQuantity;
            if (buyQuantity === 'max') {
                canAffordIntended = maxAffordable > 0;
            }
            
            if (buyQuantity === 'max') {
                purchaseQuantity = maxAffordable;
            } else if (canAffordIntended) {
                purchaseQuantity = intendedPurchaseQuantity;
            }
            
            const intendedPurchaseCost = calculateBulkCost(item, intendedPurchaseQuantity, totalCostReduction * finalCostMultiplier);
            const purchaseCost = calculateBulkCost(item, purchaseQuantity, totalCostReduction * finalCostMultiplier);

            if (nextLevelTarget) {
                displayQuantity = `to Lvl ${nextLevelTarget}`;
            } else if (buyQuantity === 'max') {
                displayQuantity = `${purchaseQuantity} Lvl${purchaseQuantity !== 1 ? 's' : ''}`;
            } else {
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
    }, [items, currencies, buyQuantity, prestigeMultipliers.costReduction, researchBonuses.costReduction, golemEffects.costMultiplier]);

    const itemCategories = useMemo(() => {
        const categories: Record<string, ItemWithStats[]> = {
            'Basic Magitech': [],
            'Advanced Machinery': [],
            'Mystical Artifacts': [],
            'Transcendent Artifacts': [],
        };
        
        const allUpgradesByItem = allItemUpgrades.reduce((acc, upg) => {
            if (!acc[upg.parentItemId]) acc[upg.parentItemId] = [];
            acc[upg.parentItemId].push(upg);
            return acc;
        }, {} as Record<string, ItemUpgrade[]>);

        const cosmicResonatorOwned = (items.find(i => i.id === 'cosmic_resonator')?.level || 0) > 0;

        for (const item of items) {
            let isVisible = true;

            const requiredCurrencies = Object.keys(item.baseCost) as Currency[];
            const allCurrenciesUnlocked = requiredCurrencies.every(c => unlockedCurrencies.has(c));
            if (!allCurrenciesUnlocked && item.level === 0) {
                isVisible = false;
            }

            const initialCostSum = Object.values(item.baseCost).reduce((a, b) => a + (b || 0), 0);
            const manaRequirement = initialCostSum * 0.8;
            if (item.id !== 'antimatter_mana' && lifetimeMana < manaRequirement && item.level === 0) {
                isVisible = false;
            }

            if (item.id === 'antimatter_mana' && !cosmicResonatorOwned && item.level === 0) {
                isVisible = false;
            }

            if (!isVisible) {
                continue;
            }

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
        const cosmicResonatorOwned = (items.find(i => i.id === 'cosmic_resonator')?.level || 0) > 0;
        return {
          'Basic Magitech': true,
          'Advanced Machinery': totalBasicLevels >= 5 || currencies.mana > 10000,
          'Mystical Artifacts': (items.find(u => u.id === 'clockwork_automaton')?.level || 0) > 0 || currencies.cogwheelGears > 500,
          'Transcendent Artifacts': hasEverPrestiged || cosmicResonatorOwned,
        }
    }, [itemCategories, currencies.mana, currencies.cogwheelGears, items, hasEverPrestiged]);

    const availableItemUpgrades = useMemo(() => {
        return itemUpgrades.filter(upgrade => {
            if (upgrade.purchased) return false;
            const parentItem = items.find(i => i.id === upgrade.parentItemId);
            return parentItem && parentItem.level >= upgrade.unlocksAtLevel;
        });
    }, [itemUpgrades, items]);

    return {
        unlockedCurrencies,
        itemPurchaseDetails,
        itemCategories,
        categoryUnlockStatus,
        availableItemUpgrades,
    };
};
