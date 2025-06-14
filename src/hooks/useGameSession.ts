import { useEffect, useCallback, useRef, useState } from 'react';
import { getFreshInitialItems, getFreshInitialItemUpgrades, getFreshInitialWorkshopUpgrades, useGameState } from './useGameState';
import { GameSaveData, Currencies, Currency, CurrencyRecord, WorkshopUpgrade } from '@/lib/gameTypes';
import { initialWorkshopUpgrades } from '@/lib/workshopUpgrades';
import { prestigeUpgrades } from '@/lib/prestigeUpgrades';
import { toast } from "@/components/ui/sonner";
import * as C from '@/constants/gameConstants';

type UseGameSessionProps = ReturnType<typeof useGameState> & {
    generationPerSecond: Partial<Currencies>;
};

const BUY_QUANTITY_KEY = 'magitech_idle_buy_quantity_v2';

// Returns: -1 if v1 < v2, 0 if v1 == v2, 1 if v1 > v2
const compareVersions = (v1: string, v2: string): number => {
    const parts1 = (v1 || '0.0.0').split('.').map(Number);
    const parts2 = (v2 || '0.0.0').split('.').map(Number);
    const len = Math.max(parts1.length, parts2.length);

    for (let i = 0; i < len; i++) {
        const p1 = parts1[i] || 0;
        const p2 = parts2[i] || 0;
        if (p1 < p2) return -1;
        if (p1 > p2) return 1;
    }
    return 0;
};

const migrateSaveData = (data: any): GameSaveData => {
    let migratedData = { ...data };
    const initialVersion = migratedData.version || '0.0.0';

    if (compareVersions(initialVersion, '1.1.0') < 0) {
        if (typeof migratedData.overclockLevel === 'undefined') {
            migratedData.overclockLevel = 0;
            console.log("Migrated save: Added 'overclockLevel: 0' field.");
        }
    }

    if (typeof migratedData.hasEverPrestiged === 'undefined') {
        migratedData.hasEverPrestiged = false;
        console.log("Migrated save: Added 'hasEverPrestiged: false' field.");
    }
    
    if (typeof migratedData.prestigeCount === 'undefined') {
        migratedData.prestigeCount = 0;
        console.log("Migrated save: Added 'prestigeCount: 0' field.");
    }

    // Future migrations go here, e.g.:
    // if (compareVersions(initialVersion, '1.2.0') < 0) { ... }

    migratedData.version = C.CURRENT_SAVE_VERSION;
    return migratedData as GameSaveData;
};

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
    hasEverPrestiged, setHasEverPrestiged,
    prestigeCount, setPrestigeCount,
    setOfflineEarnings,
    setLastSaveTime,
    saveStatus, setSaveStatus,
    setBuyQuantity,
    overclockLevel, setOverclockLevel,
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
        setHasEverPrestiged(false);
        setPrestigeCount(0);
        setOfflineEarnings(null);
        setLastSaveTime(null);
        setSaveStatus('idle');
        setBuyQuantity(1);
        setOverclockLevel(0);
        localStorage.removeItem(C.SAVE_KEY);
        localStorage.removeItem(BUY_QUANTITY_KEY);
    }, [
        setCurrencies, setItems, setItemUpgrades, setWorkshopUpgrades,
        setLifetimeMana, setPrestigeUpgradeLevels, setNotifiedUpgrades,
        setHasEverClicked, setHasEverPrestiged, setPrestigeCount, setOfflineEarnings, setLastSaveTime, setSaveStatus, setBuyQuantity,
        setOverclockLevel
    ]);

    const saveGame = useCallback((isAutoSave = false) => {
        try {
            const saveData: GameSaveData = {
                version: C.CURRENT_SAVE_VERSION,
                lastSaveTimestamp: Date.now(),
                currencies,
                items,
                itemUpgrades,
                workshopUpgrades: workshopUpgrades.map(({ id, level }) => ({ id, level })),
                lifetimeMana,
                prestigeUpgradeLevels,
                notifiedUpgrades: Array.from(notifiedUpgrades),
                hasEverClicked,
                hasEverPrestiged,
                prestigeCount,
                overclockLevel,
            };
            localStorage.setItem(C.SAVE_KEY, JSON.stringify(saveData));
            setLastSaveTime(new Date(saveData.lastSaveTimestamp));
        } catch (error) {
            console.error("Failed to save game:", error);
            setSaveStatus('error');
            toast.error("Could not save game progress.");
            throw error;
        }
    }, [currencies, items, itemUpgrades, workshopUpgrades, lifetimeMana, prestigeUpgradeLevels, notifiedUpgrades, hasEverClicked, hasEverPrestiged, prestigeCount, overclockLevel, setLastSaveTime, setSaveStatus]);

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
                
                const saveDataAsAny = JSON.parse(savedGame) as any;
                
                if (compareVersions(saveDataAsAny.version, C.CURRENT_SAVE_VERSION) > 0) {
                    console.error(`Save file is from a newer version of the game. Expected <= ${C.CURRENT_SAVE_VERSION}, got ${saveDataAsAny.version}. Starting fresh.`);
                    resetState();
                    toast.error("Newer save data found", { description: "Your save file is from a future version and cannot be loaded. The game has been reset." });
                    return;
                }
                
                const saveData = migrateSaveData(saveDataAsAny) as GameSaveData;
                if(saveData.version !== saveDataAsAny.version) {
                    toast.info("Game Save Updated", { description: `Your save data has been migrated to v${saveData.version}.`});
                }
                
                let restoredWorkshopUpgrades = getFreshInitialWorkshopUpgrades();
                if (saveData.workshopUpgrades && saveData.workshopUpgrades.length > 0) {
                     const savedUpgradesMap = new Map(saveData.workshopUpgrades.map(u => [u.id, u.level]));
                     restoredWorkshopUpgrades = restoredWorkshopUpgrades.map(upgrade => {
                        const level = savedUpgradesMap.get(upgrade.id) || 0;
                        const cost = { cogwheelGears: Math.ceil((upgrade.baseCost.cogwheelGears || 0) * Math.pow(1.25, level)) };
                        return { ...upgrade, level, cost };
                    });
                }
                
                if (saveData.lastSaveTimestamp) {
                    setLastSaveTime(new Date(saveData.lastSaveTimestamp));
                }

                const timeAway = (Date.now() - saveData.lastSaveTimestamp) / 1000; // seconds

                if (timeAway > 60) { // Only calculate for >1 min away
                    // --- Re-calculate multipliers and generation based on SAVED data ---
                    
                    const prestigeMultipliers = { allProduction: 1, offlineProduction: 1 };
                    for (const upgrade of prestigeUpgrades) {
                        const level = saveData.prestigeUpgradeLevels[upgrade.id] || 0;
                        if (level > 0) {
                            switch (upgrade.effect.type) {
                                case 'allProductionMultiplier': prestigeMultipliers.allProduction *= upgrade.effect.value(level); break;
                                case 'offlineProductionMultiplier': prestigeMultipliers.offlineProduction *= upgrade.effect.value(level); break;
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
                        }
                    }

                    const workshopUpgradeMultipliers = { mana: 1, essenceFlux: 1, researchPoints: 1 };
                    for (const upgrade of restoredWorkshopUpgrades) {
                        if (upgrade.level > 0) {
                            const bonus = upgrade.effect.value * upgrade.level;
                            switch (upgrade.effect.type) {
                                case 'manaMultiplier': workshopUpgradeMultipliers.mana += bonus; break;
                                case 'essenceFluxMultiplier': workshopUpgradeMultipliers.essenceFlux += bonus; break;
                                case 'researchPointsMultiplier': workshopUpgradeMultipliers.researchPoints += bonus; break;
                            }
                        }
                    }

                    const offlineGps = saveData.items.reduce((acc, item) => {
                        if (item.level > 0) {
                            for (const currency in item.generation) {
                                const key = currency as Currency;
                                const itemMultiplier = itemUpgradeMultipliers[item.id]?.generation || 1;
                                let value = (item.generation[key] || 0) * item.level * itemMultiplier;
                                acc[key] = (acc[key] || 0) + value;
                            }
                        }
                        return acc;
                    }, {} as Partial<Currencies>);

                    for (const key in offlineGps) {
                        const currency = key as Currency;
                        offlineGps[currency] = (offlineGps[currency] || 0) * prestigeMultipliers.allProduction;
                    }

                    if (offlineGps.mana) offlineGps.mana *= workshopUpgradeMultipliers.mana;
                    if (offlineGps.essenceFlux) offlineGps.essenceFlux *= workshopUpgradeMultipliers.essenceFlux;
                    if (offlineGps.researchPoints) offlineGps.researchPoints *= workshopUpgradeMultipliers.researchPoints;


                    // --- Calculate and apply earnings ---
                    const earnings: CurrencyRecord = {};
                    Object.entries(offlineGps).forEach(([currency, rate]) => {
                        earnings[currency as Currency] = rate * timeAway * C.OFFLINE_EARNING_RATE * prestigeMultipliers.offlineProduction;
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
                setHasEverPrestiged(saveData.hasEverPrestiged);
                setPrestigeCount(saveData.prestigeCount || 0);
                setOverclockLevel(saveData.overclockLevel || 0);

            } catch (error) {
                console.error("Failed to load save data. Starting fresh.", error);
                resetState();
                toast.error("Save data corrupted", { description: "Your save file could not be read and has been reset." });
            } finally {
                setIsLoaded(true);
            }
        };

        loadGame();
    }, [resetState, setIsLoaded, setCurrencies, setItems, setItemUpgrades, setWorkshopUpgrades, setLifetimeMana, setPrestigeUpgradeLevels, setNotifiedUpgrades, setHasEverClicked, setHasEverPrestiged, setPrestigeCount, setOfflineEarnings, setLastSaveTime, setOverclockLevel]); // Dependencies are now just setters

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
                const rawData = JSON.parse(importedString) as any;

                if (!rawData.version || !rawData.currencies) {
                     throw new Error("Invalid or outdated save file format.");
                }
                
                if (compareVersions(rawData.version, C.CURRENT_SAVE_VERSION) > 0) {
                    throw new Error("This save file is from a newer version of the game.");
                }

                const saveData = migrateSaveData(rawData) as GameSaveData;

                // Restore state
                setCurrencies(saveData.currencies);
                setItems(saveData.items);
                setItemUpgrades(saveData.itemUpgrades);
                
                let restoredWorkshopUpgrades = getFreshInitialWorkshopUpgrades();
                if (saveData.workshopUpgrades && saveData.workshopUpgrades.length > 0) {
                     const savedUpgradesMap = new Map(saveData.workshopUpgrades.map(u => [u.id, u.level]));
                     restoredWorkshopUpgrades = restoredWorkshopUpgrades.map(upgrade => {
                        const level = savedUpgradesMap.get(upgrade.id) || 0;
                        const cost = { cogwheelGears: Math.ceil((upgrade.baseCost.cogwheelGears || 0) * Math.pow(1.25, level)) };
                        return { ...upgrade, level, cost };
                    });
                }
                setWorkshopUpgrades(restoredWorkshopUpgrades);

                setLifetimeMana(saveData.lifetimeMana);
                setPrestigeUpgradeLevels(saveData.prestigeUpgradeLevels);
                setNotifiedUpgrades(new Set(saveData.notifiedUpgrades));
                setHasEverClicked(saveData.hasEverClicked);
                setHasEverPrestiged(saveData.hasEverPrestiged);
                setPrestigeCount(saveData.prestigeCount || 0);
                setOfflineEarnings(null);
                
                toast.success("Save data imported successfully!");
                if(saveData.version !== rawData.version) {
                    toast.info("Save Migrated", { description: `Your imported save has been updated to v${saveData.version}.`});
                }
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
        setHasEverClicked, setHasEverPrestiged, setPrestigeCount, setOfflineEarnings
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
