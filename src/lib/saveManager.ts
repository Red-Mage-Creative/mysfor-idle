
import { GameSaveData, Currencies, Currency, CurrencyRecord, WorkshopUpgrade, AchievementProgress, OfflineEarnings } from '@/lib/gameTypes';
import { getFreshInitialWorkshopUpgrades } from '@/lib/initialState';
import { initialWorkshopUpgrades } from '@/lib/workshopUpgrades';
import { prestigeUpgrades } from '@/lib/prestigeUpgrades';
import { toast } from "@/components/ui/sonner";
import * as C from '@/constants/gameConstants';
import { allAchievements } from '@/lib/achievements';

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
        }
    }
    if (typeof migratedData.hasEverPrestiged === 'undefined') migratedData.hasEverPrestiged = false;
    if (typeof migratedData.prestigeCount === 'undefined') migratedData.prestigeCount = 0;
    if (typeof migratedData.achievements === 'undefined') migratedData.achievements = {};
    if (typeof migratedData.hasBeatenGame === 'undefined') migratedData.hasBeatenGame = false;
    if (typeof migratedData.gameCompletionShown === 'undefined') migratedData.gameCompletionShown = false;

    migratedData.version = C.CURRENT_SAVE_VERSION;
    return migratedData as GameSaveData;
};

const processAchievementsOnLoad = (saveData: GameSaveData): Record<string, AchievementProgress> => {
    const finalAchievements: Record<string, AchievementProgress> = {};
    const now = Date.now();
    const unlock = (id: string) => {
        if (!finalAchievements[id]?.unlocked) {
            finalAchievements[id] = { unlocked: true, unlockedAt: now };
        }
    };
    const savedAchievements = saveData.achievements || {};
    allAchievements.forEach(ach => {
        finalAchievements[ach.id] = savedAchievements[ach.id] || { unlocked: false };
    });

    if (saveData.items.some(i => i.level > 0)) unlock('first_item');
    if (saveData.itemUpgrades.some(u => u.purchased)) unlock('first_upgrade');
    if (saveData.hasEverPrestiged) unlock('first_prestige');
    if (Object.keys(saveData.prestigeUpgradeLevels).length > 0) unlock('first_prestige_upgrade');
    if (saveData.prestigeCount >= 1) unlock('prestige_1');
    if (saveData.prestigeCount >= 5) unlock('prestige_5');
    if (saveData.lifetimeMana >= 1e15) unlock('mana_1qa');

    return finalAchievements;
}

export const loadDataFromStorage = (): { loadedState: GameSaveData, offlineEarnings: OfflineEarnings | null, workshopUpgrades: WorkshopUpgrade[] } | null => {
    const savedGame = localStorage.getItem(C.SAVE_KEY);
    if (!savedGame) return null;

    const saveDataAsAny = JSON.parse(savedGame);

    if (compareVersions(saveDataAsAny.version, C.CURRENT_SAVE_VERSION) > 0) {
        toast.error("Newer save data found", { description: "Your save file is from a future version and cannot be loaded. The game has been reset." });
        localStorage.removeItem(C.SAVE_KEY);
        return null;
    }

    const saveData = migrateSaveData(saveDataAsAny);
    if (saveData.version !== saveDataAsAny.version) {
        toast.info("Game Save Updated", { description: `Your save data has been migrated to v${saveData.version}.` });
    }

    let restoredWorkshopUpgrades = getFreshInitialWorkshopUpgrades();
    if (saveData.workshopUpgrades?.length > 0) {
        const savedUpgradesMap = new Map(saveData.workshopUpgrades.map(u => [u.id, u.level]));
        restoredWorkshopUpgrades = restoredWorkshopUpgrades.map(upgrade => {
            const level = savedUpgradesMap.get(upgrade.id) || 0;
            const cost = { cogwheelGears: Math.ceil((upgrade.baseCost.cogwheelGears || 0) * Math.pow(1.25, level)) };
            return { ...upgrade, level, cost };
        });
    }

    let offlineEarningsResult: OfflineEarnings | null = null;
    const timeAway = (Date.now() - saveData.lastSaveTimestamp) / 1000;

    if (timeAway > 60) {
        const prestigeMultipliers = Object.values(prestigeUpgrades).reduce((acc, up) => {
            const level = saveData.prestigeUpgradeLevels[up.id] || 0;
            if (level > 0) {
                if (up.effect.type === 'allProductionMultiplier') acc.allProduction *= up.effect.value(level);
                if (up.effect.type === 'offlineProductionMultiplier') acc.offlineProduction *= up.effect.value(level);
            }
            return acc;
        }, { allProduction: 1, offlineProduction: 1 });

        const offlineGps = saveData.items.reduce((acc, item) => {
            if (item.level > 0) {
                Object.entries(item.generation).forEach(([currency, value]) => {
                    const key = currency as Currency;
                    acc[key] = (acc[key] || 0) + (value * item.level);
                });
            }
            return acc;
        }, {} as Partial<Currencies>);

        Object.keys(offlineGps).forEach(key => {
            const currency = key as Currency;
            offlineGps[currency]! *= prestigeMultipliers.allProduction;
        });

        const earnings: CurrencyRecord = {};
        Object.entries(offlineGps).forEach(([currency, rate]) => {
            earnings[currency as Currency] = rate * timeAway * C.OFFLINE_EARNING_RATE * prestigeMultipliers.offlineProduction;
        });

        Object.entries(earnings).forEach(([currency, amount]) => {
            const key = currency as Currency;
            saveData.currencies[key] = (saveData.currencies[key] || 0) + amount;
            if (key === 'mana') saveData.lifetimeMana += amount;
        });

        if (Object.values(earnings).some(v => v > 0)) {
            offlineEarningsResult = { timeAway, earnings };
            saveData.lastSaveTimestamp = Date.now();
            localStorage.setItem(C.SAVE_KEY, JSON.stringify(saveData));
        }
    }

    saveData.achievements = processAchievementsOnLoad(saveData);

    return { loadedState: saveData, offlineEarnings: offlineEarningsResult, workshopUpgrades: restoredWorkshopUpgrades };
}
