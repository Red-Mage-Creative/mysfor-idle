import { useEffect, useRef, useCallback } from 'react';
import { useGameState } from './useGameState';
import { useGameCalculations } from './useGameCalculations';
import { useGameSession } from './useGameSession';
import { useGameActions } from './useGameActions';
import { toast } from "@/components/ui/sonner";
import { prestigeUpgrades } from '@/lib/prestigeUpgrades';
import { Currency } from '@/lib/gameTypes';

export const useGameLogic = () => {
    const gameState = useGameState();
    const { isLoaded, items, notifiedUpgrades, setNotifiedUpgrades, workshopUpgrades, currencies, overclockLevel, autoBuySettings } = gameState;
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
                        actions.handleBuyItem(item.id);
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
                        actions.handleBuyItemUpgrade(upgrade.id);
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
                        actions.handleBuyWorkshopUpgrade(affordableUpgrades[0].upgrade.id);
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
        actions
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

    return {
        ...gameState,
        ...calculations,
        ...actions,
        // session returns
        manualSave,
        saveStatus: gameState.saveStatus,
        lastSaveTime: gameState.lastSaveTime,
        resetGame,
        exportSave,
        importSave,
        setBuyQuantity: actions.updateBuyQuantity,
        prestigeUpgrades,
    };
};
