
import { useCallback } from 'react';
import { toast } from '@/components/ui/sonner';
import { researchNodeMap } from '@/lib/researchTree';
import type { GameActionProps } from './types';
import { Currency } from '@/lib/gameTypes';

export const useResearchActions = (props: GameActionProps) => {
    const {
        currencies, setCurrencies,
        unlockedResearchNodes, setUnlockedResearchNodes,
        debouncedSave,
    } = props;

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

        const canAfford = Object.entries(node.cost).every(([currency, cost]) => {
          return currencies[currency as Currency] >= (cost || 0);
        });

        if (!canAfford) {
            toast.error("Not enough resources", { description: `You cannot afford to unlock ${node.name}.` });
            return;
        }

        const hasAllPrerequisites = node.prerequisites.every(prereqId => unlockedResearchNodes.has(prereqId));
        if (!hasAllPrerequisites) {
            toast.warning("Prerequisites not met", { description: `You must unlock previous research nodes first.` });
            return;
        }

        setCurrencies(prev => {
            const newCurrencies = { ...prev };
            for (const [currency, cost] of Object.entries(node.cost)) {
                if (newCurrencies[currency as Currency] !== undefined && cost !== undefined) {
                    newCurrencies[currency as Currency] -= cost;
                }
            }
            return newCurrencies;
        });

        setUnlockedResearchNodes(prev => {
            const newSet = new Set(prev);
            newSet.add(nodeId);
            return newSet;
        });
        
        toast.success("Research Complete!", { description: `You have unlocked: ${node.name}` });
        debouncedSave();
    }, [currencies, unlockedResearchNodes, setCurrencies, setUnlockedResearchNodes, debouncedSave]);

    return { handleBuyResearch };
};
