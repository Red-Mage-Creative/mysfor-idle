
import { useEffect, useRef, useCallback } from 'react';
import { useGameState } from './useGameState';
import { useGameCalculations } from './useGameCalculations';
import { useGameSession } from './useGameSession';
import { useGameActions } from './useGameActions';
import { toast } from "@/components/ui/sonner";
import { prestigeUpgrades } from '@/lib/prestigeUpgrades';
import { Currency, Item } from '@/lib/gameTypes';
import { allAchievements, achievementMap } from '@/lib/achievements';

export const useGameLogic = () => {
    const gameState = useGameState();
    const { isLoaded, items, notifiedUpgrades, setNotifiedUpgrades, workshopUpgrades, currencies, overclockLevel, autoBuySettings, hasBeatenGame, setHasBeatenGame, achievements, setAchievements, lifetimeMana, hasEverPrestiged, prestigeCount, itemUpgrades, prestigeUpgradeLevels } = gameState;
    const repairAttempted = useRef(false);

    const calculations = useGameCalculations(gameState);
    const { availableItemUpgrades, generationPerSecond, itemPurchaseDetails, prestigeMultipliers } = calculations;
    
    const { manualSave, debouncedSave, immediateSave, resetGame, exportSave, importSave } = useGameSession({
        ...gameState,
        generationPerSecond: calculations.generationPerSecond,
    });

    const actions = useGameActions({
        ...gameState,
        ...calculations,
        debouncedSave,
        immediateSave,
    });

    const { handleBuyItem, handleBuyItemUpgrade, handleBuyWorkshopUpgrade } = actions;

    const unlockAchievement = useCallback((achievementId: string) => {
        if (!achievements[achievementId] || achievements[achievementId].unlocked) {
            return;
        }

        const achievement = achievementMap.get(achievementId);
        if (!achievement) return;

        setAchievements(prev => ({
            ...prev,
            [achievementId]: { unlocked: true, unlockedAt: Date.now() }
        }));

        toast.success("Achievement Unlocked!", {
            description: achievement.name,
            icon: <achievement.icon className="w-5 h-5" />,
        });
        debouncedSave();
    }, [achievements, setAchievements, debouncedSave]);

    // Achievement checking logic
    useEffect(() => {
        if (!isLoaded) return;

        // First Steps
        if (items.some(i => i.level > 0)) unlockAchievement('first_item');
        if (itemUpgrades.some(u => u.purchased)) unlockAchievement('first_upgrade');
        if (hasEverPrestiged) unlockAchievement('first_prestige');
        if (Object.keys(prestigeUpgradeLevels).length > 0) unlockAchievement('first_prestige_upgrade');

        // Prestige
        if (prestigeCount >= 1) unlockAchievement('prestige_1');
        if (prestigeCount >= 2) unlockAchievement('prestige_2');
        if (prestigeCount >= 3) unlockAchievement('prestige_3');
        if (prestigeCount >= 4) unlockAchievement('prestige_4');
        if (prestigeCount >= 5) unlockAchievement('prestige_5');

        // Currency - Mana (lifetime)
        if (lifetimeMana >= 1e3) unlockAchievement('mana_1k');
        if (lifetimeMana >= 1e6) unlockAchievement('mana_1m');
        if (lifetimeMana >= 1e9) unlockAchievement('mana_1b');
        if (lifetimeMana >= 1e12) unlockAchievement('mana_1t');
        if (lifetimeMana >= 1e15) unlockAchievement('mana_1qa');

        // Currency - Gears
        if (currencies.cogwheelGears >= 100) unlockAchievement('gears_100');
        if (currencies.cogwheelGears >= 10_000) unlockAchievement('gears_10k');
        if (currencies.cogwheelGears >= 1_000_000) unlockAchievement('gears_1m');

        // Currency - Shards
        if (currencies.aetherShards >= 10) unlockAchievement('shards_10');
        if (currencies.aetherShards >= 100) unlockAchievement('shards_100');
        if (currencies.aetherShards >= 1_000) unlockAchievement('shards_1k');
        if (currencies.aetherShards >= 10_000) unlockAchievement('shards_10k');

        // Currency - Essence
        if (currencies.essenceFlux >= 1) unlockAchievement('essence_1');
        if (currencies.essenceFlux >= 100) unlockAchievement('essence_100');
        if (currencies.essenceFlux >= 10_000) unlockAchievement('essence_10k');
        
        // Currency - Research
        if (currencies.researchPoints >= 10) unlockAchievement('research_10');
        if (currencies.researchPoints >= 1_000) unlockAchievement('research_1k');
        if (currencies.researchPoints >= 100_000) unlockAchievement('research_100k');

        // Cosmic Resonator
        const cosmicResonator = items.find(item => item.id === 'cosmic_resonator');
        if (cosmicResonator && cosmicResonator.level > 0) {
            unlockAchievement('cosmic_resonator_1');
            if (cosmicResonator.level >= 10) unlockAchievement('cosmic_resonator_10');
            if (cosmicResonator.level >= 100) unlockAchievement('cosmic_resonator_100');
            if (cosmicResonator.level >= 1000) unlockAchievement('cosmic_resonator_1k');
        }

    }, [isLoaded, items, itemUpgrades, hasEverPrestiged, prestigeUpgradeLevels, prestigeCount, lifetimeMana, currencies, unlockAchievement]);

    // Auto-buy logic
    useEffect(() => {
        const autoBuyTick = () => {
            if (!isLoaded) return;
            
            // Auto-buy items
            if (autoBuySettings.items && prestigeMultipliers.autoBuyItemsUnlocked) {
                // Iterate backwards to prioritize later-game items
                for (let i = items.length - 1; i >= 0; i--) {
                    const item = items[i];
                    const details = itemPurchaseDetails.get(item.id);
                    // Check if item is visible/unlocked via itemPurchaseDetails map
                    if (details && details.canAffordPurchase && details.purchaseQuantity > 0) {
                        handleBuyItem(item.id);
                        return; // Buy one type of item per tick to avoid draining resources instantly
                    }
                }
            }
            
            // Auto-buy upgrades
            if (autoBuySettings.upgrades && prestigeMultipliers.autoBuyUpgradesUnlocked) {
                // Item Upgrades
                if (availableItemUpgrades.length > 0) {
                    const upgrade = availableItemUpgrades[0];
                    const canAfford = Object.entries(upgrade.cost).every(([c, cost]) => {
                        const actualCost = Math.ceil((cost || 0) * prestigeMultipliers.costReduction);
                        return currencies[c as Currency] >= actualCost;
                    });
                    if (canAfford) {
                        handleBuyItemUpgrade(upgrade.id);
                        return;
                    }
                }
                
                // Workshop Upgrades
                if (workshopUpgrades.length > 0) {
                    const WORKSHOP_UPGRADE_COST_GROWTH_RATE = 1.25;
                    const affordableUpgrades = workshopUpgrades.map(upgrade => {
                        const cost = Math.ceil(
                            (upgrade.baseCost.cogwheelGears || 0) * 
                            Math.pow(WORKSHOP_UPGRADE_COST_GROWTH_RATE, upgrade.level)
                        );
                        return { upgrade, cost };
                    }).filter(({ cost }) => currencies.cogwheelGears >= cost)
                      .sort((a, b) => a.cost - b.cost);

                    if (affordableUpgrades.length > 0) {
                        handleBuyWorkshopUpgrade(affordableUpgrades[0].upgrade.id);
                        return;
                    }
                }
            }
        };
        
        const intervalId = setInterval(autoBuyTick, 500); // Check every 500ms
        
        return () => clearInterval(intervalId);
    }, [
        isLoaded, 
        autoBuySettings, 
        prestigeMultipliers, 
        items, 
        itemPurchaseDetails,
        availableItemUpgrades,
        workshopUpgrades,
        currencies,
        handleBuyItem,
        handleBuyItemUpgrade,
        handleBuyWorkshopUpgrade
    ]);

    // Auto-downshift for overclock
    useEffect(() => {
        const gearGeneration = generationPerSecond.cogwheelGears || 0;
        if (
            overclockLevel > 0 &&
            currencies.cogwheelGears <= 0 &&
            gearGeneration < 0
        ) {
            actions.handleSetOverclockLevel(overclockLevel - 1);
            toast.warning("Emergency Downshift!", { description: "Overclock level reduced to prevent gear depletion." });
        }
    }, [currencies.cogwheelGears, overclockLevel, generationPerSecond.cogwheelGears, actions.handleSetOverclockLevel]);

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
    }, [availableItemUpgrades, items, notifiedUpgrades, setNotifiedUpgrades]);

    // Game completion logic
    useEffect(() => {
        if (isLoaded && !hasBeatenGame) {
            const cosmicResonator = items.find(item => item.id === 'cosmic_resonator');
            if (cosmicResonator && cosmicResonator.level > 0) {
                setHasBeatenGame(true);
                toast.success("Game Complete!", {
                    description: "You have forged a Cosmic Resonator and transcended the limits of creation!",
                    duration: 10000,
                });
                immediateSave('game-beaten');
            }
        }
    }, [isLoaded, items, hasBeatenGame, setHasBeatenGame, immediateSave]);

    return {
        ...gameState,
        ...calculations,
        ...actions,
        // session returns
        manualSave,
        immediateSave,
        saveStatus: gameState.saveStatus,
        lastSaveTime: gameState.lastSaveTime,
        resetGame,
        exportSave,
        importSave,
        setBuyQuantity: actions.updateBuyQuantity,
        prestigeUpgrades,
    };
};
