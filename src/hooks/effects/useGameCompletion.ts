
import { useEffect } from 'react';
import { toast } from "@/components/ui/sonner";
import type { useGameState } from '@/hooks/useGameState';

type GameCompletionProps = Pick<ReturnType<typeof useGameState>, 'isLoaded' | 'hasBeatenGame' | 'items' | 'setHasBeatenGame'> & {
    immediateSave: () => void;
};

export const useGameCompletion = (props: GameCompletionProps) => {
    const { isLoaded, items, hasBeatenGame, setHasBeatenGame, immediateSave } = props;

    useEffect(() => {
        if (isLoaded && !hasBeatenGame) {
            const cosmicResonator = items.find(item => item.id === 'cosmic_resonator');
            if (cosmicResonator && cosmicResonator.level > 0) {
                setHasBeatenGame(true);
                toast.success("Game Complete!", {
                    description: "You have forged a Cosmic Resonator and transcended the limits of creation!",
                    duration: 10000,
                });
                immediateSave();
            }
        }
    }, [isLoaded, items, hasBeatenGame, setHasBeatenGame, immediateSave]);
};
