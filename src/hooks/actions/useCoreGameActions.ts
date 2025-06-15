
import { useCallback } from 'react';
import type { BuyQuantity } from '@/hooks/useGameState';
import * as C from '@/constants/gameConstants';
import type { GameActionProps } from './types';
import { toast } from '@/components/ui/sonner';

const BUY_QUANTITY_KEY = 'magitech_idle_buy_quantity_v2';

export const useCoreGameActions = (props: GameActionProps) => {
    const {
        setCurrencies,
        setLifetimeMana,
        hasEverClicked, setHasEverClicked,
        setBuyQuantity,
        setOverclockLevel,
        overclockInfo,
        setOfflineEarnings,
        setAutoBuySettings,
        setIsIntroModalOpen,
        debouncedSave,
    } = props;

    const updateBuyQuantity = useCallback((q: BuyQuantity) => {
        setBuyQuantity(q);
        localStorage.setItem(BUY_QUANTITY_KEY, JSON.stringify(q));
    }, [setBuyQuantity]);
    
    const addMana = useCallback((amount: number) => {
        setCurrencies(prev => ({ ...prev, mana: prev.mana + amount }));
        setLifetimeMana(prev => prev + amount);
        if (!hasEverClicked) {
            setHasEverClicked(true);
        }
    }, [hasEverClicked, setCurrencies, setLifetimeMana, setHasEverClicked]);

    const handleSetOverclockLevel = useCallback((level: number) => {
        if (level < 0 || level > overclockInfo.maxLevelUnlocked) {
            return;
        }
        setOverclockLevel(level);
        debouncedSave();
    }, [overclockInfo.maxLevelUnlocked, setOverclockLevel, debouncedSave]);

    const clearOfflineEarnings = useCallback(() => setOfflineEarnings(null), [setOfflineEarnings]);

    const toggleAutoBuySetting = useCallback((setting: 'items' | 'upgrades') => {
        setAutoBuySettings(prev => ({
            ...prev,
            [setting]: !prev[setting],
        }));
        debouncedSave();
    }, [setAutoBuySettings, debouncedSave]);

    const handleCloseIntroModal = useCallback((dontShowAgain: boolean) => {
        if (setIsIntroModalOpen) {
            setIsIntroModalOpen(false);
            if (dontShowAgain) {
                try {
                    localStorage.setItem(C.INTRO_SEEN_KEY, 'true');
                } catch (e) {
                    console.error("Could not save 'intro seen' preference", e);
                    toast.error("Could not save preference.");
                }
            }
        }
    }, [setIsIntroModalOpen]);

    return {
        updateBuyQuantity,
        addMana,
        handleSetOverclockLevel,
        clearOfflineEarnings,
        toggleAutoBuySetting,
        handleCloseIntroModal,
    };
};
