
import { useEffect, useCallback } from 'react';
import { useGameState } from './useGameState';
import { useGameCalculations } from './useGameCalculations';
import { useGameSession } from './useGameSession';
import { useGameActions } from './useGameActions';
import { toast } from "@/components/ui/sonner";
import { prestigeUpgrades } from '@/lib/prestigeUpgrades';

export type { PurchaseDetails } from '@/hooks/useGameLogic';
export type PurchaseDetails = {
    purchaseQuantity: number;
    purchaseCost: import('@/lib/gameTypes').CurrencyRecord;
    canAffordPurchase: boolean;
    nextLevelTarget: number | null;
    displayQuantity: string;
};

export const useGameLogic = () => {
    const gameState = useGameState();
    const { items, notifiedUpgrades, setNotifiedUpgrades } = gameState;

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
