import { useEffect, useRef, useCallback } from 'react';
import { useGameState } from './useGameState';
import { useGameCalculations } from './useGameCalculations';
import { useGameSession } from './useGameSession';
import { useGameActions } from './useGameActions';
import { toast } from "@/components/ui/sonner";
import { prestigeUpgrades } from '@/lib/prestigeUpgrades';
import { allWorkshopUpgrades } from '@/lib/workshopUpgrades';
import { WorkshopUpgrade, Currency } from '@/lib/gameTypes';

export const useGameLogic = () => {
    const gameState = useGameState();
    const { isLoaded, items, notifiedUpgrades, setNotifiedUpgrades, workshopUpgrades, setWorkshopUpgrades, currencies, overclockLevel, autoBuySettings } = gameState;
    const repairAttempted = useRef(false);

    useEffect(() => {
        if (isLoaded && !repairAttempted.current) {
            // A more robust check for incomplete upgrade data. Freshly initialized or
            // correctly loaded upgrades from a save should have all their properties.
            const needsRepair = workshopUpgrades.some(u => !u.name || !u.description || typeof u.icon !== 'function');

            if (needsRepair) {
                console.log("Incomplete workshop upgrade data detected in state, attempting repair...");
                // For debugging, log the state of the problematic data.
                console.log('Problematic workshopUpgrades:', workshopUpgrades.map(
                    u => ({ id: u.id, purchased: u.purchased, hasName: !!u.name, hasDescription: !!u.description, iconType: typeof u.icon })
                ));
                
                const originalUpgradesMap = new Map(allWorkshopUpgrades.map(u => [u.id, u]));
                
                const repairedUpgrades = workshopUpgrades
                    .map(savedUpgrade => {
                        const original = originalUpgradesMap.get(savedUpgrade.id);
                        if (original) {
                            // Reconstitute the upgrade object from the original template, preserving its purchased status.
                            return { ...original, purchased: savedUpgrade.purchased || false };
                        }
                        console.warn(`Could not find original workshop upgrade for id during auto-repair: ${savedUpgrade.id}`);
                        return null; 
                    })
                    .filter((u): u is WorkshopUpgrade => u !== null);
                
                setWorkshopUpgrades(repairedUpgrades);
                toast.info("Game data repaired", { description: "Some game data was found to be out of date and has been automatically repaired." });
            }
            repairAttempted.current = true;
        }
    }, [isLoaded, workshopUpgrades, setWorkshopUpgrades]);

    const calculations = useGameCalculations(gameState);
    const { availableItemUpgrades, generationPerSecond, itemPurchaseDetails, availableWorkshopUpgrades, prestigeMultipliers } = calculations;
    
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
                if (availableWorkshopUpgrades.length > 0) {
                    const upgrade = availableWorkshopUpgrades[0];
                     const canAfford = Object.entries(upgrade.cost).every(([c, cost]) => {
                        const actualCost = Math.ceil((cost || 0) * prestigeMultipliers.costReduction);
                        return currencies[c as Currency] >= actualCost;
                    });
                    if (canAfford) {
                        actions.handleBuyWorkshopUpgrade(upgrade.id);
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
        availableWorkshopUpgrades,
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
