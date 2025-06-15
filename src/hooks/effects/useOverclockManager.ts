
import { useEffect, useRef } from 'react';
import { toast } from "@/components/ui/sonner";
import type { useGameState } from '@/hooks/useGameState';
import type { useGameCalculations } from '@/hooks/useGameCalculations';
import type { useGameActions } from '@/hooks/useGameActions';

type OverclockManagerProps = ReturnType<typeof useGameState> & Pick<ReturnType<typeof useGameCalculations>, 'generationPerSecond'> & {
    handleSetOverclockLevel: ReturnType<typeof useGameActions>['handleSetOverclockLevel'];
};

export const useOverclockManager = (props: OverclockManagerProps) => {
    const {
        currencies,
        overclockLevel,
        generationPerSecond,
        handleSetOverclockLevel,
        items
    } = props;
    const lastDownshiftTimeRef = useRef(0);

    useEffect(() => {
        const gearGeneration = generationPerSecond.cogwheelGears || 0;
        const hasGearProducers = items.some(item => item.id === 'workshop_gears' && item.level > 0);

        if (
            overclockLevel > 0 &&
            currencies.cogwheelGears <= 0 &&
            gearGeneration < 0 &&
            hasGearProducers
        ) {
            const now = Date.now();
            const DOWNSHIFT_COOLDOWN = 2000;

            if (now - lastDownshiftTimeRef.current > DOWNSHIFT_COOLDOWN) {
                handleSetOverclockLevel(overclockLevel - 1);
                toast.warning("Emergency Downshift!", {
                    id: 'emergency-downshift-toast',
                    description: "Overclock level reduced to prevent gear depletion."
                });
                lastDownshiftTimeRef.current = now;
            }
        }
    }, [
        currencies.cogwheelGears,
        overclockLevel,
        generationPerSecond.cogwheelGears,
        handleSetOverclockLevel,
        items
    ]);
};
