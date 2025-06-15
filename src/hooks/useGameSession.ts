import { useEffect, useCallback, useRef } from 'react';
import { getFreshInitialItems, getFreshInitialItemUpgrades, getFreshInitialWorkshopUpgrades } from '@/lib/initialState';
import { useGameState } from './useGameState';
import { GameSaveData, Currencies } from '@/lib/gameTypes';
import { toast } from "@/components/ui/sonner";
import * as C from '@/constants/gameConstants';
import { loadDataFromStorage } from '@/lib/saveManager';
import { useGameLoop } from './useGameLoop';
import { useAutoSave } from './useAutoSave';

type UseGameSessionProps = ReturnType<typeof useGameState> & {
    generationPerSecond: Partial<Currencies>;
    autoBuySettings: any;
    activeChallengeId: string | null;
    setActiveChallengeId: (id: string | null) => void;
    completedChallenges: Record<string, boolean>;
    setCompletedChallenges: (challenges: Record<string, boolean>) => void;
    dimensionalUpgrades: Record<string, number>;
    setDimensionalUpgrades: (upgrades: Record<string, number>) => void;
};

export const useGameSession = (props: UseGameSessionProps) => {
    const {
        isLoaded, setIsLoaded, currencies, setCurrencies, items, setItems, itemUpgrades,
        setItemUpgrades, workshopUpgrades, setWorkshopUpgrades, lifetimeMana, setLifetimeMana,
        prestigeUpgradeLevels, setPrestigeUpgradeLevels, notifiedUpgrades, setNotifiedUpgrades,
        hasEverClicked, setHasEverClicked, hasEverPrestiged, setHasEverPrestiged, prestigeCount,
        setPrestigeCount, setOfflineEarnings, setLastSaveTime, saveStatus, setSaveStatus,
        setBuyQuantity, overclockLevel, setOverclockLevel, generationPerSecond, achievements,
        setAchievements, hasBeatenGame, setHasBeatenGame, gameCompletionShown, setGameCompletionShown,
        setIsIntroModalOpen, unlockedResearchNodes, setUnlockedResearchNodes, activeGolemIds, setActiveGolemIds,
        ancientKnowledgeNodes, setAncientKnowledgeNodes,
        runStartTime, setRunStartTime,
        activeChallengeId, setActiveChallengeId,
        completedChallenges, setCompletedChallenges,
        dimensionalUpgrades, setDimensionalUpgrades,
    } = props;

    const debounceSaveTimeout = useRef<NodeJS.Timeout | null>(null);

    const saveGame = useCallback((isAutoSave = false) => {
        if (!isLoaded) return;
        try {
            if (!isAutoSave) setSaveStatus('saving');
            const saveData: GameSaveData = {
                version: C.CURRENT_SAVE_VERSION, lastSaveTimestamp: Date.now(), currencies,
                items, itemUpgrades, workshopUpgrades: workshopUpgrades.map(({ id, level }) => ({ id, level })),
                lifetimeMana, prestigeUpgradeLevels, notifiedUpgrades: Array.from(notifiedUpgrades),
                hasEverClicked, hasEverPrestiged, prestigeCount, overclockLevel, achievements,
                unlockedResearchNodeIds: Array.from(unlockedResearchNodes),
                activeGolemIds,
                hasBeatenGame, gameCompletionShown,
                autoBuySettings: props.autoBuySettings,
                ancientKnowledgeNodeIds: Array.from(ancientKnowledgeNodes),
                runStartTime,
                activeChallengeId,
                completedChallenges,
                dimensionalUpgrades
            };
            localStorage.setItem(C.SAVE_KEY, JSON.stringify(saveData));
            setLastSaveTime(new Date(saveData.lastSaveTimestamp));
            if (!isAutoSave) {
                setSaveStatus('complete');
                setTimeout(() => setSaveStatus('idle'), 1500);
            }
        } catch (error) {
            console.error("Failed to save game:", error);
            setSaveStatus('error');
            toast.error("Could not save game progress.");
        }
    }, [
        isLoaded, currencies, items, itemUpgrades, workshopUpgrades, lifetimeMana, prestigeUpgradeLevels,
        notifiedUpgrades, hasEverClicked, hasEverPrestiged, prestigeCount, overclockLevel, achievements,
        unlockedResearchNodes, activeGolemIds, hasBeatenGame, gameCompletionShown, setLastSaveTime, setSaveStatus,
        props.autoBuySettings, ancientKnowledgeNodes, runStartTime,
        activeChallengeId, completedChallenges, dimensionalUpgrades
    ]);
    
    useGameLoop({ isLoaded, generationPerSecond, setCurrencies, setLifetimeMana });
    useAutoSave({ isLoaded, saveGame });

    const debouncedSave = useCallback(() => {
        if (debounceSaveTimeout.current) clearTimeout(debounceSaveTimeout.current);
        debounceSaveTimeout.current = setTimeout(() => saveGame(true), C.DEBOUNCE_SAVE_DELAY);
    }, [saveGame]);
    
    useEffect(() => {
        const hasSeenIntro = localStorage.getItem(C.INTRO_SEEN_KEY);
        if (!hasSeenIntro) {
            setIsIntroModalOpen(true);
        }

        try {
            const loadedData = loadDataFromStorage();
            if (loadedData) {
                const { loadedState, offlineEarnings, workshopUpgrades: restoredWorkshopUpgrades } = loadedData;
                setCurrencies(loadedState.currencies);
                setItems(loadedState.items);
                setItemUpgrades(loadedState.itemUpgrades);
                setWorkshopUpgrades(restoredWorkshopUpgrades);
                setLifetimeMana(loadedState.lifetimeMana);
                setPrestigeUpgradeLevels(loadedState.prestigeUpgradeLevels);
                setAchievements(loadedState.achievements || {});
                setNotifiedUpgrades(new Set(loadedState.notifiedUpgrades));
                setHasEverClicked(loadedState.hasEverClicked);
                setHasEverPrestiged(loadedState.hasEverPrestiged);
                setPrestigeCount(loadedState.prestigeCount || 0);
                setOverclockLevel(loadedState.overclockLevel || 0);
                setUnlockedResearchNodes(new Set(loadedState.unlockedResearchNodeIds || []));
                setActiveGolemIds(loadedState.activeGolemIds || []);
                setHasBeatenGame(loadedState.hasBeatenGame || false);
                setGameCompletionShown(loadedState.gameCompletionShown || false);
                setAncientKnowledgeNodes(new Set(loadedState.ancientKnowledgeNodeIds || []));
                setRunStartTime(loadedState.runStartTime || Date.now());
                setLastSaveTime(new Date(loadedState.lastSaveTimestamp));

                // Load challenge data
                setActiveChallengeId(loadedState.activeChallengeId || null);
                setCompletedChallenges(loadedState.completedChallenges || {});
                setDimensionalUpgrades(loadedState.dimensionalUpgrades || {});

                if (offlineEarnings) setOfflineEarnings(offlineEarnings);
            }
        } catch (error) {
            console.error("Failed to load save data. Starting fresh.", error);
            resetGame();
            toast.error("Save data corrupted", { description: "Your save file could not be read and has been reset." });
        } finally {
            setIsLoaded(true);
        }
    }, []); // This empty dependency array is crucial for running only once.

    const resetState = useCallback(() => {
        setCurrencies({ mana: 0, cogwheelGears: 0, essenceFlux: 0, researchPoints: 0, aetherShards: 0, challengeTokens: 0 });
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
        setAchievements({});
        setUnlockedResearchNodes(new Set());
        setActiveGolemIds([]);
        setHasBeatenGame(false);
        setGameCompletionShown(false);
        setAncientKnowledgeNodes(new Set());
        setRunStartTime(Date.now());
        localStorage.removeItem(C.SAVE_KEY);
        localStorage.removeItem(C.BUY_QUANTITY_KEY);
    }, [
        setCurrencies, setItems, setItemUpgrades, setWorkshopUpgrades, setLifetimeMana, setPrestigeUpgradeLevels,
        setNotifiedUpgrades, setHasEverClicked, setHasEverPrestiged, setPrestigeCount, setOfflineEarnings,
        setLastSaveTime, setSaveStatus, setBuyQuantity, setOverclockLevel, setAchievements, setUnlockedResearchNodes, setActiveGolemIds, setHasBeatenGame, setGameCompletionShown, setAncientKnowledgeNodes,
        setRunStartTime
    ]);

    const resetGame = useCallback(() => {
        if (window.confirm("Are you sure you want to reset all progress, including challenges and dimensional upgrades? This cannot be undone.")) {
            resetState();
            toast.success("Game progress has been reset.");
        }
    }, [resetState]);

    const exportSave = useCallback(() => {
        const dataStr = localStorage.getItem(C.SAVE_KEY);
        if (!dataStr) return toast.error("No save data to export.");
        const link = document.createElement('a');
        link.href = URL.createObjectURL(new Blob([dataStr], { type: 'text/plain' }));
        link.download = `magitech-idle-save-${Date.now()}.txt`;
        link.click();
        URL.revokeObjectURL(link.href);
        toast.success("Save data exported!");
    }, []);

    const importSave = useCallback((file: File) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedString = event.target?.result as string;
                localStorage.setItem(C.SAVE_KEY, importedString); // Temporarily save to re-use loading logic
                window.location.reload(); // Easiest way to re-init full state
            } catch (error) {
                toast.error("Failed to import save data.");
            }
        };
        reader.readAsText(file);
    }, []);

    const manualSave = useCallback(() => {
        if (saveStatus !== 'saving') saveGame(false);
    }, [saveGame, saveStatus]);

    const immediateSave = useCallback(() => {
        saveGame(false);
    }, [saveGame]);

    return { manualSave, debouncedSave, resetGame, exportSave, importSave, immediateSave };
};
