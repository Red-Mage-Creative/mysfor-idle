import { useEffect, useRef, useCallback } from 'react';
import { useGameState } from './useGameState';
import { useGameCalculations } from './useGameCalculations';
import { useGameSession } from './useGameSession';
import { useGameActions } from './useGameActions';
import { toast } from "@/components/ui/sonner";
import { prestigeUpgrades } from '@/lib/prestigeUpgrades';
import { allWorkshopUpgrades } from '@/lib/workshopUpgrades';
import { WorkshopUpgrade } from '@/lib/gameTypes';

export const useGameLogic = () => {
    const gameState = useGameState();
    const { isLoaded, items, notifiedUpgrades, setNotifiedUpgrades, workshopUpgrades, setWorkshopUpgrades } = gameState;
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
    const { availableItemUpgrades } = calculations;
    
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
