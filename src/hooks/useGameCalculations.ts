import { useMemo } from 'react';
import { prestigeUpgrades } from '@/lib/prestigeUpgrades';
import { allItemUpgrades } from '@/lib/itemUpgrades';
import { Item, ItemUpgrade, Currencies, Currency, CurrencyRecord, ItemWithStats, PurchaseDetails, GolemEffect, GolemEffectTarget, Golem } from '@/lib/gameTypes';
import * as C from '@/constants/gameConstants';
import { useGameState } from './useGameState';
import { researchNodeMap } from '@/lib/researchTree';
import { golemMap } from '@/lib/golems';
import { allSynergies } from '@/lib/golemSynergies';

type UseGameCalculationsProps = Pick<ReturnType<typeof useGameState>,
    'currencies' |
    'items' |
    'itemUpgrades' |
    'workshopUpgrades' |
    'lifetimeMana' |
    'prestigeUpgradeLevels' |
    'prestigeCount' |
    'buyQuantity' |
    'hasEverClicked' |
    'hasEverPrestiged' |
    'overclockLevel' |
    'devMode' |
    'achievements' |
    'unlockedResearchNodes' |
    'activeGolemIds'
>;

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

export const useGameCalculations = ({
    currencies,
    items,
    itemUpgrades,
    workshopUpgrades,
    lifetimeMana,
    prestigeUpgradeLevels,
    prestigeCount,
    buyQuantity,
    hasEverClicked,
    hasEverPrestiged,
    overclockLevel,
    devMode,
    achievements,
    unlockedResearchNodes,
    activeGolemIds,
}: UseGameCalculationsProps) => {

    const achievementBonus = useMemo(() => {
        if (!achievements) return 1;
        const unlockedCount = Object.values(achievements).filter(a => a.unlocked).length;
        return 1 + (unlockedCount * 0.05);
    }, [achievements]);

    const researchBonuses = useMemo(() => {
        const bonuses = {
            mana: 1,
            allProduction: 1,
            costReduction: 1,
            manaPerClick: 1,
            essenceFlux: 1,
            researchPoints: 1,
            specificItem: {} as Record<string, number>,
        };

        unlockedResearchNodes.forEach(nodeId => {
            const node = researchNodeMap.get(nodeId);
            if (!node) return;

            switch (node.effect.type) {
                case 'manaMultiplier':
                    bonuses.mana *= node.effect.value;
                    break;
                case 'allProductionMultiplier':
                    bonuses.allProduction *= node.effect.value;
                    break;
                case 'costReductionMultiplier':
                    bonuses.costReduction *= node.effect.value;
                    break;
                case 'manaPerClickMultiplier':
                    bonuses.manaPerClick *= node.effect.value;
                    break;
                case 'essenceFluxMultiplier':
                    bonuses.essenceFlux *= node.effect.value;
                    break;
                case 'researchPointsMultiplier':
                    bonuses.researchPoints *= node.effect.value;
                    break;
                case 'specificItemMultiplier':
                    if (node.effect.itemId) {
                        bonuses.specificItem[node.effect.itemId] = (bonuses.specificItem[node.effect.itemId] || 1) * node.effect.value;
                    }
                    break;
            }
        });

        return bonuses;
    }, [unlockedResearchNodes]);

    const activeGolems = useMemo(() => {
        return activeGolemIds
            .map(id => golemMap.get(id))
            .filter((g): g is Golem => !!g);
    }, [activeGolemIds]);

    const activeSynergies = useMemo(() => {
        const activeGolemIdSet = new Set(activeGolemIds);
        return allSynergies.filter(synergy => 
            synergy.golemIds.every(id => activeGolemIdSet.has(id))
        );
    }, [activeGolemIds]);

    const golemEffects = useMemo(() => {
        const effects = {
            generationMultiplier: {} as Partial<Record<Currency, number>>,
            flatGeneration: {} as Partial<Record<Currency, number>>,
            costMultiplier: 1,
            shardGainMultiplier: 1,
            disabledFeatures: new Set<'autoBuyItems' | 'autoBuyUpgrades'>(),
        };

        const processEffect = (effect: GolemEffect) => {
            switch (effect.type) {
                case 'generationMultiplier':
                    effects.generationMultiplier[effect.target] = (effects.generationMultiplier[effect.target] || 1) * effect.value;
                    break;
                case 'flatGeneration':
                    effects.flatGeneration[effect.target] = (effects.flatGeneration[effect.target] || 0) + effect.value;
                    break;
                case 'costMultiplier':
                    effects.costMultiplier *= effect.value;
                    break;
                case 'shardGainMultiplier':
                    effects.shardGainMultiplier *= effect.value;
                    break;
                case 'disableFeature':
                    effects.disabledFeatures.add(effect.feature);
                    break;
                case 'randomEffect': {
                    // Cycle every 60 seconds
                    const effectIndex = Math.floor((Date.now() / 1000) / 60) % effect.effects.length;
                    const activeEffect = effect.effects[effectIndex];
                    if (activeEffect) {
                        processEffect(activeEffect);
                    }
                    break;
                }
            }
        };

        activeGolemIds.forEach(golemId => {
            const golem = golemMap.get(golemId);
            if (golem) {
                golem.effects.forEach(effect => {
                    processEffect(effect);
                });
            }
        });
        
        // Also process active synergy effects
        activeSynergies.forEach(synergy => {
            processEffect(synergy.effect);
        });

        return effects;
    }, [activeGolemIds, activeSynergies]);

    const prestigeMultipliers = useMemo(() => {
        const multipliers = {
            manaClick: 1,
            allProduction: 1,
            shardGain: 1,
            offlineProduction: 1,
            costReduction: 1,
            autoBuyItemsUnlocked: false,
            autoBuyUpgradesUnlocked: false,
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
                    case 'offlineProductionMultiplier':
                        multipliers.offlineProduction *= upgrade.effect.value(level);
                        break;
                    case 'costReductionMultiplier':
                        multipliers.costReduction *= upgrade.effect.value(level);
                        break;
                    case 'unlockAutoBuyItems':
                        multipliers.autoBuyItemsUnlocked = true;
                        break;
                    case 'unlockAutoBuyUpgrades':
                        multipliers.autoBuyUpgradesUnlocked = true;
                        break;
                }
            }
        }

        if (golemEffects.disabledFeatures.has('autoBuyItems')) {
            multipliers.autoBuyItemsUnlocked = false;
        }
        if (golemEffects.disabledFeatures.has('autoBuyUpgrades')) {
            multipliers.autoBuyUpgradesUnlocked = false;
        }

        return multipliers;
    }, [prestigeUpgradeLevels, golemEffects]);

    const workshopUpgradeMultipliers = useMemo(() => {
        const multipliers = {
            mana: 1,
            essenceFlux: 1,
            researchPoints: 1,
        };

        for (const upgrade of workshopUpgrades) {
            if (upgrade.level > 0) {
                const bonus = upgrade.effect.value * upgrade.level;
                switch (upgrade.effect.type) {
                    case 'manaMultiplier':
                        multipliers.mana += bonus;
                        break;
                    case 'essenceFluxMultiplier':
                        multipliers.essenceFlux += bonus;
                        break;
                    case 'researchPointsMultiplier':
                        multipliers.researchPoints += bonus;
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
                    const researchMultiplier = researchBonuses.specificItem[item.id] || 1;
                    let value = (item.generation[key] || 0) * item.level * itemMultiplier * researchMultiplier;
                    
                    acc[key] = (acc[key] || 0) + value;
                }
            }
            return acc;
        }, {} as Partial<Currencies>);

        for (const key in baseGeneration) {
            const currency = key as Currency;
            baseGeneration[currency] = (baseGeneration[currency] || 0) * prestigeMultipliers.allProduction * researchBonuses.allProduction;
        }

        // Apply new workshop multipliers
        if (baseGeneration.mana) {
            baseGeneration.mana *= workshopUpgradeMultipliers.mana * researchBonuses.mana;
        }
        if (baseGeneration.essenceFlux) {
            baseGeneration.essenceFlux *= workshopUpgradeMultipliers.essenceFlux * researchBonuses.essenceFlux;
        }
        if (baseGeneration.researchPoints) {
            baseGeneration.researchPoints *= workshopUpgradeMultipliers.researchPoints * researchBonuses.researchPoints;
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

        // Apply achievement bonus
        for (const key in baseGeneration) {
            const currency = key as Currency;
            baseGeneration[currency] = (baseGeneration[currency] || 0) * achievementBonus;
        }

        if (devMode) {
            baseGeneration.mana = (baseGeneration.mana || 0) * C.DEV_MODE_MULTIPLIER;
        }

        // Apply golem multipliers
        for (const key in baseGeneration) {
            const currency = key as Currency;
            const golemMultiplier = golemEffects.generationMultiplier[currency];
            if (golemMultiplier) {
                baseGeneration[currency] = (baseGeneration[currency] || 0) * golemMultiplier;
            }
        }
        
        // Apply golem flat generation/drain
        for (const key in golemEffects.flatGeneration) {
            const currency = key as Currency;
            const flatValue = golemEffects.flatGeneration[currency] || 0;
            baseGeneration[currency] = (baseGeneration[currency] || 0) + flatValue;
        }

        return baseGeneration;
    }, [items, prestigeMultipliers.allProduction, itemUpgradeMultipliers, workshopUpgradeMultipliers, overclockInfo, devMode, achievementBonus, researchBonuses, golemEffects]);

    const manaPerClick = useMemo(() => {
        const baseClick = 1;
        const clickItemBonus = items
            .filter(i => i.clickBonus && i.level > 0)
            .reduce((sum, i) => {
                const itemMultiplier = itemUpgradeMultipliers[i.id]?.click || 1;
                return sum + (i.clickBonus || 0) * i.level * itemMultiplier;
            }, 0);
        
        let totalClick = (baseClick + clickItemBonus) * prestigeMultipliers.manaClick * researchBonuses.manaPerClick;

        // Apply new workshop multiplier for mana
        totalClick *= workshopUpgradeMultipliers.mana * researchBonuses.mana;

        // Add scaling based on mana generation per second
        const manaGeneration = generationPerSecond.mana || 0;
        const scalingFactor = 0.01; // 1% of mana/sec is added to click power multiplier
        totalClick *= (1 + (manaGeneration * scalingFactor));

        // Apply achievement bonus
        totalClick *= achievementBonus;

        if (devMode) {
            totalClick *= C.DEV_MODE_MULTIPLIER;
        }

        // Apply golem multipliers
        const golemManaMultiplier = golemEffects.generationMultiplier.mana;
        if (golemManaMultiplier) {
            totalClick *= golemManaMultiplier;
        }

        return totalClick;
    }, [items, prestigeMultipliers.manaClick, itemUpgradeMultipliers, workshopUpgradeMultipliers, devMode, generationPerSecond.mana, achievementBonus, researchBonuses.manaPerClick, golemEffects]);

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
            } else { // 1, 5, 10
                intendedPurchaseQuantity = buyQuantity;
            }

            let canAffordIntended = maxAffordable >= intendedPurchaseQuantity;
            if (buyQuantity === 'max') {
                canAffordIntended = maxAffordable > 0;
            }
            
            if (buyQuantity === 'max') {
                purchaseQuantity = maxAffordable; // For 'max', you always buy what you can afford.
            } else if (canAffordIntended) {
                purchaseQuantity = intendedPurchaseQuantity;
            }
            // else, purchaseQuantity remains 0 for bulk buys you can't afford.
            
            const intendedPurchaseCost = calculateBulkCost(item, intendedPurchaseQuantity, totalCostReduction * finalCostMultiplier);
            const purchaseCost = calculateBulkCost(item, purchaseQuantity, totalCostReduction * finalCostMultiplier);

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
    }, [items, currencies, buyQuantity, prestigeMultipliers.costReduction, researchBonuses.costReduction, golemEffects.costMultiplier]);

    const prestigeRequirement = useMemo(() => {
        return 1e9 * Math.pow(10, prestigeCount);
    }, [prestigeCount]);

    const canPrestige = useMemo(() => lifetimeMana >= prestigeRequirement, [lifetimeMana, prestigeRequirement]);
    
    const prestigeVisibility = useMemo(() => {
        if (currencies.aetherShards > 0 || hasEverPrestiged) return 'visible';
        
        const teaserThreshold = prestigeRequirement * 0.25;
        const visibleThreshold = prestigeRequirement * 0.50;

        if (lifetimeMana >= visibleThreshold) return 'visible';
        if (lifetimeMana >= teaserThreshold) return 'teaser';
        return 'hidden';
    }, [lifetimeMana, currencies.aetherShards, prestigeRequirement, hasEverPrestiged]);

    const potentialShards = useMemo(() => {
        if (lifetimeMana < prestigeRequirement) return 0;
        
        const manaRatio = lifetimeMana / prestigeRequirement;
        const baseShards = Math.floor(Math.pow(manaRatio, 0.75) * 10 * (prestigeCount + 1));
        const prestigeCountBonus = 1 + prestigeCount * 0.2;
        
        return Math.floor(baseShards * prestigeCountBonus * prestigeMultipliers.shardGain * golemEffects.shardGainMultiplier);
    }, [lifetimeMana, prestigeRequirement, prestigeCount, prestigeMultipliers.shardGain, golemEffects]);
    
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
            'Transcendent Artifacts': [],
        };
        
        const allUpgradesByItem = allItemUpgrades.reduce((acc, upg) => {
            if (!acc[upg.parentItemId]) acc[upg.parentItemId] = [];
            acc[upg.parentItemId].push(upg);
            return acc;
        }, {} as Record<string, ItemUpgrade[]>);

        const cosmicResonatorOwned = (items.find(i => i.id === 'cosmic_resonator')?.level || 0) > 0;

        for (const item of items) {
            const requiredCurrencies = Object.keys(item.baseCost) as Currency[];
            const allCurrenciesUnlocked = requiredCurrencies.every(c => unlockedCurrencies.has(c));
            
            if (!allCurrenciesUnlocked && item.level === 0) continue;

            const initialCostSum = Object.values(item.baseCost).reduce((a, b) => a + (b || 0), 0);
            const manaRequirement = initialCostSum * 0.8;

            if (lifetimeMana < manaRequirement && item.level === 0) continue;

            // Hide Anti-Matter Mana until a Cosmic Resonator is purchased
            if (item.id === 'antimatter_mana' && !cosmicResonatorOwned && item.level === 0) {
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
        return {
          'Basic Magitech': true,
          'Advanced Machinery': totalBasicLevels >= 5 || currencies.mana > 10000,
          'Mystical Artifacts': (items.find(u => u.id === 'clockwork_automaton')?.level || 0) > 0 || currencies.cogwheelGears > 500,
          'Transcendent Artifacts': hasEverPrestiged,
        }
    }, [itemCategories, currencies.mana, currencies.cogwheelGears, items, hasEverPrestiged]);

    const showUpgradesTab = useMemo(() => {
        return items.some(i => i.level >= 10);
    }, [items]);

    const showWorkshopTab = useMemo(() => {
        const hasGears = currencies.cogwheelGears > 0;
        const hasLeveledWorkshopUpgrade = workshopUpgrades.some(u => u.level > 0);
        const hasUnlockedAutomaton = (items.find(i => i.id === 'clockwork_automaton')?.level || 0) > 0;
        
        return hasGears || hasLeveledWorkshopUpgrade || hasUnlockedAutomaton;
    }, [currencies.cogwheelGears, workshopUpgrades, items]);

    const showResearchTab = useMemo(() => {
        return currencies.researchPoints > 0 || unlockedResearchNodes.size > 0;
    }, [currencies.researchPoints, unlockedResearchNodes]);

    const availableItemUpgrades = useMemo(() => {
        return itemUpgrades.filter(upgrade => {
            if (upgrade.purchased) return false;
            const parentItem = items.find(i => i.id === upgrade.parentItemId);
            return parentItem && parentItem.level >= upgrade.unlocksAtLevel;
        });
    }, [itemUpgrades, items]);

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
        prestigeRequirement,
        unlockedCurrencies,
        itemCategories,
        categoryUnlockStatus,
        showUpgradesTab,
        showWorkshopTab,
        showResearchTab,
        availableItemUpgrades,
        showTutorial,
        achievementBonus,
        researchBonuses,
        activeGolems,
        activeSynergies,
        golemEffects,
    };
};
