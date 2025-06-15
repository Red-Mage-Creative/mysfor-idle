
import type { useGameState } from '@/hooks/useGameState';
import type { useGameCalculations } from '@/hooks/useGameCalculations';

export type GameActionProps = ReturnType<typeof useGameState> & ReturnType<typeof useGameCalculations> & {
    debouncedSave: () => void;
    immediateSave: () => void;
};
