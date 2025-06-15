
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
        unlockedResearchNodes, setUnlockedResearchNodes,
        ancientKnowledgeNodes, setAncientKnowledgeNodes,
    } = props;
    
    const handlePrestige = useCallback(() => {
        if (!canPrestige) return;

        const shardsGained = potentialShards;
        const newlyGainedKnowledge = Array.from(unlockedResearchNodes).filter(nodeId => !ancientKnowledgeNodes.has(nodeId)).length;
        
        setAncientKnowledgeNodes(prev => {
            const newSet = new Set(prev);
            unlockedResearchNodes.forEach(nodeId => newSet.add(nodeId));
            return newSet;
        });
        
        setCurrencies({
            mana: 0,
            cogwheelGears: 0,
            essenceFlux: 0,
            researchPoints: 0,
            aetherShards: currencies.aetherShards + shardsGained,
            challengeTokens: currencies.challengeTokens || 0,
        });
        
        setItems(getFreshInitialItems());
        setItemUpgrades(getFreshInitialItemUpgrades());
        setWorkshopUpgrades(getFreshInitialWorkshopUpgrades());
        setLifetimeMana(0);
        setNotifiedUpgrades(new Set());
        setUnlockedResearchNodes(new Set());
        setHasEverPrestiged(true);
        setPrestigeCount(prev => prev + 1);
        setOverclockLevel(0);
        
        let toastDescription = `You have gained ${shardsGained} Aether Shards. The world resets, but you are stronger.`;
        if (newlyGainedKnowledge > 0) {
            toastDescription += ` You also converted ${newlyGainedKnowledge} new discoveries into permanent Ancient Knowledge.`;
        }

        toast("Dimensional Shift!", {
          description: toastDescription,
          duration: 8000,
        });
        immediateSave();
    }, [
        canPrestige, potentialShards, currencies, 
        setCurrencies, setItems, setItemUpgrades, setWorkshopUpgrades, 
        setLifetimeMana, setNotifiedUpgrades, immediateSave, setHasEverPrestiged,
        setPrestigeCount, setOverclockLevel, unlockedResearchNodes, ancientKnowledgeNodes,
        setUnlockedResearchNodes, setAncientKnowledgeNodes,
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
