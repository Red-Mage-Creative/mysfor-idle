
import { useEffect } from 'react';
import * as C from '@/constants/gameConstants';

type UseAutoSaveProps = {
    isLoaded: boolean;
    saveGame: (isAutoSave: boolean) => void;
}

export const useAutoSave = ({ isLoaded, saveGame }: UseAutoSaveProps) => {
    // Periodic Autosave
    useEffect(() => {
        if (!isLoaded) return;

        const autoSaveInterval = setInterval(() => {
            saveGame(true);
        }, C.AUTOSAVE_INTERVAL);

        return () => clearInterval(autoSaveInterval);
    }, [isLoaded, saveGame]);

    // Save on Unload
    useEffect(() => {
        const handleBeforeUnload = () => {
            console.log("Saving progress on page unload...");
            saveGame(true);
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [saveGame]);
};
