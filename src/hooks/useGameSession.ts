import { useEffect, useCallback, useRef, useState } from 'react';
import { getFreshInitialItems, getFreshInitialItemUpgrades, getFreshInitialWorkshopUpgrades, UseGameState } from './useGameState';
import { GameSaveData, Currencies, Currency, CurrencyRecord } from '@/lib/gameTypes';
import { allWorkshopUpgrades } from '@/lib/workshopUpgrades';
import { prestigeUpgrades } from '@/lib/prestigeUpgrades';
import { toast } from "@/components/ui/sonner";
import * as C from '@/constants/gameConstants';

type UseGameSessionProps = UseGameState & {
    generationPerSecond: Partial<Currencies>;
};

const BUY_QUANTITY_KEY = 'magitech_idle_buy_quantity_v2';

export const useGameSession = ({
    isLoaded, setIsLoaded,
    currencies, setCurrencies,
    items, setItems,
    itemUpgrades, setItemUpgrades,
    workshopUpgrades, setWorkshopUpgrades,
    lifetimeMana, setLifetimeMana,
    prestigeUpgradeLevels, setPrestigeUpgradeLevels,
    notifiedUpgrades, setNotifiedUpgrades,
    hasEverClicked, setHasEverClicked,
    setOfflineEarnings,
    setLastSaveTime,
    saveStatus, setSaveStatus,
    setBuyQuantity,
    generationPerSecond
}: UseGameSessionProps) => {

    const debounceSaveTimeout = useRef<NodeJS.Timeout | null>(null);
    const [saveRequest, setSaveRequest] = useState<string | null>(null);

    const resetState = useCallback(() => {
        setCurrencies({ mana: 0, cogwheelGears: 0, essenceFlux: 0, researchPoints: 0, aetherShards: 0 });
        setItems(getFreshInitialItems());
        setItemUpgrades(getFreshInitialItemUpgrades());
        setWorkshopUpgrades(getFreshInitialWorkshopUpgrades());
        setLifetimeMana(0);
        setPrestigeUpgradeLevels({});
        setNotifiedUpgrades(new Set());
        setHasEverClicked(false);
        setOfflineEarnings(null);
        setLastSaveTime(null);
        setSaveStatus('idle');
        setBuyQuantity(1);
        localStorage.removeItem(C.SAVE_KEY);
        localStorage.removeItem(BUY_QUANTITY_KEY);
    }, [
        setCurrencies, setItems, setItemUpgrades, setWorkshopUpgrades,
        setLifetimeMana, setPrestigeUpgradeLevels, setNotifiedUpgrades,
        setHasEverClicked, setOfflineEarnings, setLastSaveTime, setSaveStatus, setBuyQuantity
    ]);

    const saveGame = useCallback((isAutoSave = false) => {
        try {
            const saveData: GameSaveData = {
                version: C.CURRENT_SAVE_VERSION,
                lastSaveTimestamp: Date.now(),
                currencies,
                items,
                itemUpgrades,
                workshopUpgrades: workshopUpgrades.map(({ id, purchased }) => ({ id, purchased })),
                lifetimeMana,
                prestigeUpgradeLevels,
                notifiedUpgrades: Array.from(notifiedUpgrades),
                hasEverClicked,
            };
            localStorage.setItem(C.SAVE_KEY, JSON.stringify(saveData));
            setLastSaveTime(new Date(saveData.lastSaveTimestamp));
        } catch (error) {
            console.error("Failed to save game:", error);
            setSaveStatus('error');
            toast.error("Could not save game progress.");
            throw error;
        }
    }, [currencies, items, itemUpgrades, workshopUpgrades, lifetimeMana, prestigeUpgradeLevels, notifiedUpgrades, hasEverClicked, setLastSaveTime, setSaveStatus]);

    useEffect(() => {
        if (saveRequest) {
            if (saveStatus !== 'saving') setSaveStatus('saving');
            try {
                saveGame();
                setSaveStatus('complete');
                setTimeout(() => setSaveStatus('idle'), 1500);
            } catch (error) {
                console.error(`Save request failed for reason: ${saveRequest}.`, error);
                setSaveStatus('error');
                setTimeout(() => setSaveStatus('idle'), 1500);
            } finally {
                setSaveRequest(null);
            }
        }
    }, [saveRequest, saveGame, saveStatus, setSaveStatus]);

    const immediateSave = useCallback((reason: string = 'immediate') => {
        setSaveRequest(reason);
    }, []);

    const manualSave = useCallback(() => {
        if (saveStatus === 'saving') return;
        setSaveRequest('manual-save');
    }, [saveStatus]);
    
    const debouncedSave = useCallback(() => {
        if (debounceSaveTimeout.current) {
            clearTimeout(debounceSaveTimeout.current);
        }
        debounceSaveTimeout.current = setTimeout(() => {
            setSaveRequest('debounced-save');
        }, C.DEBOUNCE_SAVE_DELAY);
    }, []);

    useEffect(() => {
        const handleBeforeUnload = () => {
            if (debounceSaveTimeout.current) {
                clearTimeout(debounceSaveTimeout.current);
            }
            console.log("Saving progress on page unload...");
            saveGame();
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [saveGame]);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(BUY_QUANTITY_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (['1', '5', '10', 'next', 'max'].includes(String(parsed))) {
                    setBuyQuantity(parsed);
                }
            }
        } catch (e) {
            console.error("Could not load buy quantity", e)
        }
    }, [setBuyQuantity]);

    useEffect(() => {
        const loadGame = () => {
            try {
                const savedGame = localStorage.getItem(C.SAVE_KEY);

                if (!savedGame) {
                    setIsLoaded(true);
                    return; // No save data, start fresh
                }
                
                const saveData = JSON.parse(savedGame) as GameSaveData;
                
                if(saveData.version !== C.CURRENT_SAVE_VERSION) {
                    console.warn(`Save file version mismatch. Expected ${C.CURRENT_SAVE_VERSION}, got ${saveData.version}. Starting fresh.`);
                    resetState();
                    toast.info("Game updated!", { description: "Your save data was from an older version and has been reset." });
                    return;
                }
                
                let restoredWorkshopUpgrades = getFreshInitialWorkshopUpgrades();
                if (saveData.workshopUpgrades && saveData.workshopUpgrades.length > 0) {
                     const savedUpgradesMap = new Map(saveData.workshopUpgrades.map(u => [u.id, u.purchased]));
                     restoredWorkshopUpgrades = restoredWorkshopUpgrades.map(upgrade => ({
                        ...upgrade,
                        purchased: savedUpgradesMap.get(upgrade.id) || false
                    }));
                }
                
                if (saveData.lastSaveTimestamp) {
                    setLastSaveTime(new Date(saveData.lastSaveTimestamp));
                }

                const timeAway = (Date.now() - saveData.lastSaveTimestamp) / 1000; // seconds

                if (timeAway > 60) { // Only calculate for >1 min away
                    // --- Re-calculate multipliers and generation based on SAVED data ---
                    
                    const prestigeMultipliers = { manaClick: 1, allProduction: 1, shardGain: 1 };
                    for (const upgrade of prestigeUpgrades) {
                        const level = saveData.prestigeUpgradeLevels[upgrade.id] || 0;
                        if (level > 0) {
                            switch (upgrade.effect.type) {
                                case 'manaClickMultiplier': prestigeMultipliers.manaClick *= upgrade.effect.value(level); break;
                                case 'allProductionMultiplier': prestigeMultipliers.allProduction *= upgrade.effect.value(level); break;
                                case 'shardGainMultiplier': prestigeMultipliers.shardGain *= upgrade.effect.value(level); break;
                            }
                        }
                    }

                    const itemUpgradeMultipliers: Record<string, { generation: number; click: number }> = {};
                    for (const item of saveData.items) {
                        itemUpgradeMultipliers[item.id] = { generation: 1, click: 1 };
                    }
                    for (const upgrade of saveData.itemUpgrades) {
                        if (upgrade.purchased) {
                            if (upgrade.effect.type === 'generationMultiplier') {
                                itemUpgradeMultipliers[upgrade.parentItemId].generation *= upgrade.effect.value;
                            }
                            if (upgrade.effect.type === 'clickMultiplier') {
                                itemUpgradeMultipliers[upgrade.parentItemId].click *= upgrade.effect.value;
                            }
                        }
                    }

                    const workshopUpgradeMultipliers = {
                        gearProduction: 1,
                        clickEffectiveness: 1,
                        manaFromMachinery: 1,
                    };
                    for (const upgrade of restoredWorkshopUpgrades) { // Use restored upgrades for calculation
                        if (upgrade.purchased) {
                            switch (upgrade.effect.type) {
                                case 'gearProductionMultiplier':
                                    workshopUpgradeMultipliers.gearProduction *= upgrade.effect.value;
                                    break;
                                case 'clickEffectivenessMultiplier':
                                    workshopUpgradeMultipliers.clickEffectiveness *= upgrade.effect.value;
                                    break;
                                case 'manaFromMachineryMultiplier':
                                    workshopUpgradeMultipliers.manaFromMachinery *= upgrade.effect.value;
                                    break;
                            }
                        }
                    }

                    const offlineGps = saveData.items.reduce((acc, item) => {
                        if (item.level > 0) {
                            for (const currency in item.generation) {
                                const key = currency as Currency;
                                const itemMultiplier = itemUpgradeMultipliers[item.id]?.generation || 1;
                                let value = (item.generation[key] || 0) * item.level * itemMultiplier;

                                if (key === 'mana' && item.category === 'Advanced Machinery') {
                                    value *= workshopUpgradeMultipliers.manaFromMachinery;
                                }
                                if (key === 'cogwheelGears') {
                                    value *= workshopUpgradeMultipliers.gearProduction;
                                }
                                
                                acc[key] = (acc[key] || 0) + value;
                            }
                        }
                        return acc;
                    }, {} as Partial<Currencies>);

                    for (const key in offlineGps) {
                        const currency = key as Currency;
                        offlineGps[currency] = (offlineGps[currency] || 0) * prestigeMultipliers.allProduction;
                    }

                    // --- Calculate and apply earnings ---
                    const earnings: CurrencyRecord = {};
                    Object.entries(offlineGps).forEach(([currency, rate]) => {
                        earnings[currency as Currency] = rate * timeAway * C.OFFLINE_EARNING_RATE;
                    });
                    
                    let manaEarned = 0;
                    Object.entries(earnings).forEach(([currency, amount]) => {
                        const key = currency as Currency;
                        saveData.currencies[key] = (saveData.currencies[key] || 0) + amount;
                        if(key === 'mana') manaEarned = amount;
                    });

                    saveData.lifetimeMana += manaEarned;
                    
                    if (Object.values(earnings).some(v => v > 0)) {
                        setOfflineEarnings({ timeAway, earnings });
                        // --- Immediately save the updated progress to prevent gaming the system ---
                        try {
                            saveData.lastSaveTimestamp = Date.now(); // Update timestamp to now to prevent exploit
                            localStorage.setItem(C.SAVE_KEY, JSON.stringify(saveData));
                        } catch (error) {
                            console.error("Failed to immediately save offline progress:", error);
                            toast.error("Could not save offline progress. Please save manually.");
                        }
                    }
                }
                
                // --- Set all state from save data ---
                setCurrencies(saveData.currencies);
                setItems(saveData.items);
                setItemUpgrades(saveData.itemUpgrades);
                setWorkshopUpgrades(restoredWorkshopUpgrades);
                setLifetimeMana(saveData.lifetimeMana);
                setPrestigeUpgradeLevels(saveData.prestigeUpgradeLevels);
                setNotifiedUpgrades(new Set(saveData.notifiedUpgrades));
                setHasEverClicked(saveData.hasEverClicked);

            } catch (error) {
                console.error("Failed to load save data. Starting fresh.", error);
                resetState();
                toast.error("Save data corrupted", { description: "Your save file could not be read and has been reset." });
            } finally {
                setIsLoaded(true);
            }
        };

        loadGame();
    }, [resetState, setIsLoaded, setCurrencies, setItems, setItemUpgrades, setWorkshopUpgrades, setLifetimeMana, setPrestigeUpgradeLevels, setNotifiedUpgrades, setHasEverClicked, setOfflineEarnings, setLastSaveTime]); // Dependencies are now just setters

    useEffect(() => {
        const gameLoop = setInterval(() => {
            let manaGeneratedThisTick = 0;
            setCurrencies(prev => {
                const newCurrencies = { ...prev };
                for (const key in generationPerSecond) {
                    const currency = key as Currency;
                    const amountGenerated = (generationPerSecond[currency] || 0) / (1000 / C.GAME_TICK_MS);
                    newCurrencies[currency] += amountGenerated;
                    if (currency === 'mana') {
                        manaGeneratedThisTick = amountGenerated;
                    }
                }
                return newCurrencies;
            });
            setLifetimeMana(prev => prev + manaGeneratedThisTick);
        }, C.GAME_TICK_MS);
        return () => clearInterval(gameLoop);
    }, [generationPerSecond, isLoaded, setCurrencies, setLifetimeMana]);
    
    // Periodic Autosave
    useEffect(() => {
        if (!isLoaded) return;

        const autoSaveInterval = setInterval(() => {
            setSaveRequest('auto-save');
        }, C.AUTOSAVE_INTERVAL);

        return () => clearInterval(autoSaveInterval);
    }, [isLoaded]);

    const resetGame = useCallback(() => {
        if(window.confirm("Are you sure you want to reset all progress? This cannot be undone.")){
            resetState();
            toast.success("Game progress has been reset.");
        }
    }, [resetState]);

    const exportSave = useCallback(() => {
        try {
            const dataStr = localStorage.getItem(C.SAVE_KEY);
            if (!dataStr) {
                toast.error("No save data to export.");
                return;
            }
            const data = new Blob([dataStr], { type: 'text/plain' });
            const url = window.URL.createObjectURL(data);
            const link = document.createElement('a');
            link.href = url;
            link.download = `magitech-idle-save-${Date.now()}.txt`;
            link.click();
            window.URL.revokeObjectURL(url);
            toast.success("Save data exported!");
        } catch (error) {
            console.error("Export failed", error);
            toast.error("Failed to export save data.");
        }
    }, []);

    const importSave = useCallback((file: File) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedString = event.target?.result as string;
                const saveData = JSON.parse(importedString) as GameSaveData;

                if (!saveData.version || !saveData.currencies || saveData.version < C.CURRENT_SAVE_VERSION) {
                    throw new Error("Invalid or outdated save file format.");
                }
                if (saveData.version > C.CURRENT_SAVE_VERSION) {
                    throw new Error("This save file is from a newer version of the game.");
                }

                // Restore state
                setCurrencies(saveData.currencies);
                setItems(saveData.items);
                setItemUpgrades(saveData.itemUpgrades);
                
                let restoredWorkshopUpgrades = getFreshInitialWorkshopUpgrades();
                if (saveData.workshopUpgrades && saveData.workshopUpgrades.length > 0) {
                     const savedUpgradesMap = new Map(saveData.workshopUpgrades.map(u => [u.id, u.purchased]));
                     restoredWorkshopUpgrades = restoredWorkshopUpgrades.map(upgrade => ({
                        ...upgrade,
                        purchased: savedUpgradesMap.get(upgrade.id) || false
                    }));
                }
                setWorkshopUpgrades(restoredWorkshopUpgrades);

                setLifetimeMana(saveData.lifetimeMana);
                setPrestigeUpgradeLevels(saveData.prestigeUpgradeLevels);
                setNotifiedUpgrades(new Set(saveData.notifiedUpgrades));
                setHasEverClicked(saveData.hasEverClicked);
                setOfflineEarnings(null);
                
                toast.success("Save data imported successfully!");
                manualSave(); // Immediately save the new state.
            
            } catch (error) {
                console.error("Import failed", error);
                toast.error(`Failed to import save data. ${error instanceof Error ? error.message : "File may be corrupt or invalid."}`);
            }
        };
        reader.readAsText(file);
    }, [
        manualSave,
        setCurrencies, setItems, setItemUpgrades, setWorkshopUpgrades,
        setLifetimeMana, setPrestigeUpgradeLevels, setNotifiedUpgrades,
        setHasEverClicked, setOfflineEarnings
    ]);
    
    return {
        manualSave,
        debouncedSave,
        immediateSave,
        resetGame,
        exportSave,
        importSave,
    };
};
