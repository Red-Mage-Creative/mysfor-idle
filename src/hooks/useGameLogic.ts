import { useEffect, useRef } from 'react';
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
            const needsRepair = workshopUpgrades.some(u => typeof u.icon !== 'function' || !u.description);
            if (needsRepair) {
                console.log("Corrupted workshop upgrades detected in state, repairing...");
                
                const originalUpgradesMap = new Map(allWorkshopUpgrades.map(u => [u.id, u]));
                
                const repairedUpgrades = workshopUpgrades
                    .map(savedUpgrade => {
                        const original = originalUpgradesMap.get(savedUpgrade.id);
                        if (original) {
                            return { ...original, purchased: savedUpgrade.purchased };
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
    
    const { saveGame, manualSave, debouncedSave, resetGame, exportSave, importSave } = useGameSession({
        ...gameState,
        generationPerSecond: calculations.generationPerSecond,
    });

    const actions = useGameActions({
        ...gameState,
        ...calculations,
        debouncedSave,
        saveGame
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
