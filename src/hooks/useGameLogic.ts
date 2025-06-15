import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { useGameState } from './useGameState';
import { useGameCalculations } from './useGameCalculations';
import { useGameSession } from './useGameSession';
import { useGameActions } from './useGameActions';
import { toast } from "@/components/ui/sonner";
import { prestigeUpgrades } from '@/lib/prestigeUpgrades';
import { Currency, Item } from '@/lib/gameTypes';
import { allAchievements, achievementMap } from '@/lib/achievements';
import { researchNodeMap } from '@/lib/researchTree';
import { allGolems, golemMap, MAX_ACTIVE_GOLEMS } from '@/lib/golems';
import { allSynergies } from '@/lib/golemSynergies';

export const useGameLogic = () => {
    const gameState = useGameState();
    const { isLoaded, items, notifiedUpgrades, setNotifiedUpgrades, workshopUpgrades, currencies, overclockLevel, autoBuySettings, hasBeatenGame, setHasBeatenGame, achievements, setAchievements, lifetimeMana, hasEverPrestiged, prestigeCount, itemUpgrades, prestigeUpgradeLevels, unlockedResearchNodes, setUnlockedResearchNodes, setCurrencies, activeGolemIds } = gameState;
    const repairAttempted = useRef(false);

    const calculations = useGameCalculations(gameState);
    const { availableItemUpgrades, generationPerSecond, itemPurchaseDetails, prestigeMultipliers, activeGolems, activeSynergies, golemEffects } = calculations;
    
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

    const { handleBuyItem, handleBuyItemUpgrade, handleBuyWorkshopUpgrade, handleBuyGolem } = actions;

    const handleBuyResearch = useCallback((nodeId: string) => {
        const node = researchNodeMap.get(nodeId);
        if (!node) {
            console.error(`Research node with id ${nodeId} not found.`);
            return;
        }

        if (unlockedResearchNodes.has(nodeId)) {
            toast.info("Already Researched", { description: "You have already completed this research." });
            return;
        }

        if (currencies.researchPoints < node.cost) {
            toast.error("Not enough Research Points", { description: `You need ${node.cost} to unlock ${node.name}.` });
            return;
        }

        const hasAllPrerequisites = node.prerequisites.every(prereqId => unlockedResearchNodes.has(prereqId));
        if (!hasAllPrerequisites) {
            toast.warning("Prerequisites not met", { description: `You must unlock previous research nodes first.` });
            return;
        }

        setCurrencies(prev => ({
            ...prev,
            researchPoints: prev.researchPoints - node.cost,
        }));

        setUnlockedResearchNodes(prev => {
            const newSet = new Set(prev);
            newSet.add(nodeId);
            return newSet;
        });
        
        toast.success("Research Complete!", { description: `You have unlocked: ${node.name}` });
        debouncedSave();
    }, [currencies.researchPoints, unlockedResearchNodes, setCurrencies, setUnlockedResearchNodes, debouncedSave]);

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
            icon: React.createElement(achievement.icon, { className: "w-5 h-5" }),
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

        // Research
        if (unlockedResearchNodes.size >= 1) unlockAchievement('research_start');
        if (unlockedResearchNodes.size >= 10) unlockAchievement('research_10_nodes');
        if (unlockedResearchNodes.size >= 25) unlockAchievement('research_25_nodes');
        if (unlockedResearchNodes.size >= 50) unlockAchievement('research_50_nodes');
        if (unlockedResearchNodes.has('magitech_mastery')) unlockAchievement('research_path_magitech');
        if (unlockedResearchNodes.has('mechanical_mastery')) unlockAchievement('research_path_mechanical');
        if (unlockedResearchNodes.has('trans_1_junction_3')) unlockAchievement('research_path_mystical');
        if (unlockedResearchNodes.has('trans_5_final')) unlockAchievement('research_complete_tree');
        
        // Golem Achievements
        if (activeGolemIds.length > 0) unlockAchievement('golem_first');
        if (activeGolemIds.length >= 3) unlockAchievement('golem_3_active');
        if (activeGolemIds.length >= 5) unlockAchievement('golem_5_active');
        if (activeSynergies.length > 0) unlockAchievement('golem_first_synergy');
        if (activeGolemIds.includes('chaos_golem')) unlockAchievement('golem_chaos');

        // Cosmic Resonator
        const cosmicResonator = items.find(item => item.id === 'cosmic_resonator');
        if (cosmicResonator && cosmicResonator.level > 0) {
            unlockAchievement('cosmic_resonator_1');
            if (cosmicResonator.level >= 10) unlockAchievement('cosmic_resonator_10');
            if (cosmicResonator.level >= 100) unlockAchievement('cosmic_resonator_100');
            if (cosmicResonator.level >= 1000) unlockAchievement('cosmic_resonator_1k');
        }

    }, [isLoaded, items, itemUpgrades, hasEverPrestiged, prestigeUpgradeLevels, prestigeCount, lifetimeMana, currencies, unlockAchievement, unlockedResearchNodes, activeGolemIds, activeSynergies]);

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
        handleBuyWorkshopUpgrade,
        golemEffects // Add golemEffects to dependency array
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
                immediateSave();
            }
        }
    }, [isLoaded, items, hasBeatenGame, setHasBeatenGame, immediateSave]);

    const showEssenceTab = hasEverPrestiged;

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
        handleBuyResearch,
        handleBuyGolem,
        showEssenceTab,
        allGolems,
        golemMap,
        MAX_ACTIVE_GOLEMS,
    };
};
