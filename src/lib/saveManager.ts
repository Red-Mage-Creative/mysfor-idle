
import { GameSaveData, Currencies, Currency, CurrencyRecord, WorkshopUpgrade, AchievementProgress, OfflineEarnings } from '@/lib/gameTypes';
import { getFreshInitialWorkshopUpgrades } from '@/lib/initialState';
import { initialWorkshopUpgrades } from '@/lib/workshopUpgrades';
import { prestigeUpgrades } from '@/lib/prestigeUpgrades';
import { toast } from "@/components/ui/sonner";
import * as C from '@/constants/gameConstants';
import { allAchievements } from '@/lib/achievements';
import { researchNodeMap } from '@/lib/researchTree';
import { allSynergies } from './golemSynergies';

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
    // New migration logic for v1.2.0
    if (compareVersions(initialVersion, '1.2.0') < 0) {
        if (Array.isArray(migratedData.unlockedResearchNodeIds)) {
            const validNodeIds = new Set(researchNodeMap.keys());
            migratedData.unlockedResearchNodeIds = migratedData.unlockedResearchNodeIds.filter((id: string) => validNodeIds.has(id));
        }
    }
    // New fields are added here with default values if they don't exist.
    if (typeof migratedData.hasEverPrestiged === 'undefined') migratedData.hasEverPrestiged = false;
    if (typeof migratedData.prestigeCount === 'undefined') migratedData.prestigeCount = 0;
    if (typeof migratedData.achievements === 'undefined') migratedData.achievements = {};
    if (typeof migratedData.unlockedResearchNodeIds === 'undefined') migratedData.unlockedResearchNodeIds = [];
    if (typeof migratedData.activeGolemIds === 'undefined') migratedData.activeGolemIds = [];
    if (typeof migratedData.hasBeatenGame === 'undefined') migratedData.hasBeatenGame = false;
    if (typeof migratedData.gameCompletionShown === 'undefined') migratedData.gameCompletionShown = false;
    if (typeof migratedData.ancientKnowledgeNodeIds === 'undefined') migratedData.ancientKnowledgeNodeIds = [];
    if (typeof migratedData.runStartTime === 'undefined') migratedData.runStartTime = Date.now();

    // New fields for Dimensional Challenges
    if (typeof migratedData.activeChallengeId === 'undefined') migratedData.activeChallengeId = null;
    if (typeof migratedData.completedChallenges === 'undefined') migratedData.completedChallenges = {};
    if (typeof migratedData.dimensionalUpgrades === 'undefined') migratedData.dimensionalUpgrades = {};
    if (typeof migratedData.currencies?.challengeTokens === 'undefined') {
        if (!migratedData.currencies) migratedData.currencies = {};
        migratedData.currencies.challengeTokens = 0;
    }

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
    if (saveData.prestigeCount >= 10) unlock('prestige_10');
    if (saveData.prestigeCount >= 15) unlock('prestige_15');
    if (saveData.prestigeCount >= 20) unlock('prestige_20');
    if (saveData.prestigeCount >= 25) unlock('prestige_25');
    if (saveData.prestigeCount >= 50) unlock('prestige_50');
    if (saveData.prestigeCount >= 100) unlock('prestige_100');

    if (saveData.lifetimeMana >= 1e15) unlock('mana_1qa');
    if (saveData.lifetimeMana >= 1e18) unlock('mana_1qi');
    if (saveData.lifetimeMana >= 1e21) unlock('mana_1sx');

    // Research achievements
    const unlockedResearchNodes = new Set(saveData.unlockedResearchNodeIds || []);
    if (unlockedResearchNodes.size >= 1) unlock('research_start');
    if (unlockedResearchNodes.size >= 10) unlock('research_10_nodes');
    if (unlockedResearchNodes.size >= 25) unlock('research_25_nodes');
    if (unlockedResearchNodes.size >= 50) unlock('research_50_nodes');
    if (unlockedResearchNodes.has('magitech_mastery')) unlock('research_path_magitech');
    if (unlockedResearchNodes.has('mechanical_mastery')) unlock('research_path_mechanical');
    if (unlockedResearchNodes.has('trans_1_junction_3')) unlock('research_path_mystical');
    if (unlockedResearchNodes.has('trans_5_final')) unlock('research_complete_tree');

    // Golem achievements
    const activeGolemIds = new Set(saveData.activeGolemIds || []);
    if (activeGolemIds.size > 0) unlock('golem_first');
    if (activeGolemIds.size >= 3) unlock('golem_3_active');
    if (activeGolemIds.size >= 5) unlock('golem_5_active');
    if (activeGolemIds.has('chaos_golem')) unlock('golem_chaos');

    const activeSynergies = allSynergies.filter(synergy =>
        synergy.golemIds.every(id => activeGolemIds.has(id))
    );
    if (activeSynergies.length > 0) unlock('golem_first_synergy');

    // Workshop Mastery
    const workshopLevels = (saveData.workshopUpgrades || []).reduce((sum, u) => sum + u.level, 0);
    if (workshopLevels >= 10) unlock('workshop_10');
    if (workshopLevels >= 50) unlock('workshop_50');
    if (workshopLevels >= 100) unlock('workshop_100');
    if (workshopLevels >= 200) unlock('workshop_200');
    if (initialWorkshopUpgrades.length > 0) {
        const savedUpgradesMap = new Map((saveData.workshopUpgrades || []).map(u => [u.id, u.level]));
        const allUpgradesAt10 = initialWorkshopUpgrades.every(u => (savedUpgradesMap.get(u.id) || 0) >= 10);
        if (allUpgradesAt10) unlock('workshop_all_10');
    }
    
    // Overclock Engineer
    if (saveData.overclockLevel >= 1) unlock('overclock_1');
    if (saveData.overclockLevel >= 5) unlock('overclock_5');
    if (saveData.overclockLevel >= 10) unlock('overclock_10');
    if (saveData.overclockLevel >= 15) unlock('overclock_15');

    // Ancient Wisdom
    const akNodes = new Set(saveData.ancientKnowledgeNodeIds || []);
    if (akNodes.size >= 1) unlock('ak_1');
    if (akNodes.size >= 5) unlock('ak_5');
    if (akNodes.size >= 10) unlock('ak_10');
    if (akNodes.size >= 20) unlock('ak_20');
    if (akNodes.size >= 30) unlock('ak_30');
    // There are 30 AK nodes total.
    if (akNodes.size >= 30) unlock('ak_all');

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
