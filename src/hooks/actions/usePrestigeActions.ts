
import { useCallback } from 'react';
import { toast } from '@/components/ui/sonner';
import { getFreshInitialItems, getFreshInitialItemUpgrades, getFreshInitialWorkshopUpgrades } from '@/hooks/useGameState';
import { prestigeUpgrades } from '@/lib/prestigeUpgrades';
import type { GameActionProps } from './types';

export const usePrestigeActions = (props: GameActionProps) => {
    const {
        currencies, setCurrencies,
        setItems,
        setItemUpgrades,
        setWorkshopUpgrades,
        setLifetimeMana,
        prestigeUpgradeLevels, setPrestigeUpgradeLevels,
        setNotifiedUpgrades,
        canPrestige,
        potentialShards,
        immediateSave,
        setHasEverPrestiged,
        setPrestigeCount,
        setOverclockLevel,
    } = props;
    
    const handlePrestige = useCallback(() => {
        if (!canPrestige) return;

        const shardsGained = potentialShards;
        
        setCurrencies({
            mana: 0,
            cogwheelGears: 0,
            essenceFlux: 0,
            researchPoints: 0,
            aetherShards: currencies.aetherShards + shardsGained,
        });
        
        setItems(getFreshInitialItems());
        setItemUpgrades(getFreshInitialItemUpgrades());
        setWorkshopUpgrades(getFreshInitialWorkshopUpgrades());
        setLifetimeMana(0);
        setNotifiedUpgrades(new Set());
        setHasEverPrestiged(true);
        setPrestigeCount(prev => prev + 1);
        setOverclockLevel(0);
        
        toast("Dimensional Shift!", {
          description: `You have gained ${shardsGained} Aether Shards. The world resets, but you are stronger.`,
        });
        immediateSave();
    }, [
        canPrestige, potentialShards, currencies.aetherShards, 
        setCurrencies, setItems, setItemUpgrades, setWorkshopUpgrades, 
        setLifetimeMana, setNotifiedUpgrades, immediateSave, setHasEverPrestiged,
        setPrestigeCount, setOverclockLevel,
    ]);

    const handleBuyPrestigeUpgrade = useCallback((upgradeId: string) => {
        const upgrade = prestigeUpgrades.find(u => u.id === upgradeId);
        if (!upgrade) return;

        const currentLevel = prestigeUpgradeLevels[upgrade.id] || 0;
        if (currentLevel >= upgrade.maxLevel) {
            toast.error("Max level reached for this upgrade.");
            return;
        };

        const cost = upgrade.cost(currentLevel);
        if (currencies.aetherShards < cost) {
            toast.error("Not enough Aether Shards.");
            return;
        }

        setCurrencies(prev => ({ ...prev, aetherShards: prev.aetherShards - cost }));
        setPrestigeUpgradeLevels(prev => ({ ...prev, [upgradeId]: currentLevel + 1 }));
        immediateSave();
    }, [currencies.aetherShards, prestigeUpgradeLevels, immediateSave, setCurrencies, setPrestigeUpgradeLevels]);

    return {
        handlePrestige,
        handleBuyPrestigeUpgrade,
    };
};
