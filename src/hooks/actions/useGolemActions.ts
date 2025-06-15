
import { useCallback } from 'react';
import { toast } from '@/components/ui/sonner';
import { golemMap, MAX_ACTIVE_GOLEMS } from '@/lib/golems';
import type { GameActionProps } from './types';

export const useGolemActions = (props: GameActionProps) => {
    const {
        currencies, setCurrencies,
        activeGolemIds, setActiveGolemIds,
        debouncedSave,
    } = props;

    const handleBuyGolem = useCallback((golemId: string) => {
        const golem = golemMap.get(golemId);
        if (!golem) return;

        if (activeGolemIds.includes(golemId)) {
            toast.info("Golem already active.");
            return;
        }

        if (activeGolemIds.length >= MAX_ACTIVE_GOLEMS) {
            toast.error("Golem limit reached", { description: `You can only have ${MAX_ACTIVE_GOLEMS} active golems.`});
            return;
        }

        if (currencies.essenceFlux < golem.cost) {
            toast.error("Not enough Essence Flux.");
            return;
        }

        setCurrencies(prev => ({...prev, essenceFlux: prev.essenceFlux - golem.cost}));
        setActiveGolemIds(prev => [...prev, golemId]);

        toast.success("Golem Activated!", {
            description: `Your new ${golem.name} is now active.`
        });
        debouncedSave();

    }, [activeGolemIds, currencies.essenceFlux, setActiveGolemIds, setCurrencies, debouncedSave]);
    
    return { handleBuyGolem };
};
