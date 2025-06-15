
import { useCallback } from 'react';
import { toast } from '@/components/ui/sonner';
import { researchNodeMap } from '@/lib/researchTree';
import type { GameActionProps } from './types';

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

    return { handleBuyResearch };
};
