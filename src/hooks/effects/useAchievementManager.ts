
import React, { useEffect, useCallback, useRef } from 'react';
import { toast } from "@/components/ui/sonner";
import { achievementMap, allAchievements } from '@/lib/achievements';
import { challenges } from '@/lib/challenges';
import { dimensionalUpgrades as dimensionalUpgradesList, dimensionalUpgradesMap } from '@/lib/dimensionalUpgrades';
import type { useGameState } from '@/hooks/useGameState';
import type { useGameCalculations } from '@/hooks/useGameCalculations';

type AchievementManagerProps = ReturnType<typeof useGameState> & ReturnType<typeof useGameCalculations> & {
    debouncedSave: () => void;
};

export const useAchievementManager = (props: AchievementManagerProps) => {
    const { 
        isLoaded, items, itemUpgrades, hasEverPrestiged, prestigeUpgradeLevels, 
        prestigeCount, lifetimeMana, currencies, unlockedResearchNodes, 
        activeGolemIds, activeSynergies, setAchievements, achievements, debouncedSave,
        workshopUpgrades, overclockLevel, runStartTime, setRunStartTime,
        ancientKnowledgeNodes, devMode, hasEverClicked, generationPerSecond,
        completedChallenges, dimensionalUpgrades
    } = props;
    
    const unlockAchievement = useCallback((achievementId: string) => {
        if (!achievements[achievementId] || achievements[achievementId].unlocked) {
            return;
        }

        const achievement = achievementMap.get(achievementId);
        if (!achievement) return;

        setAchievements(prev => ({
            ...prev,
            [achievementId]: { unlocked: true, unlockedAt: Date.now() }
        }));

        toast.success("Achievement Unlocked!", {
            description: achievement.name,
            icon: React.createElement(achievement.icon, { className: "w-5 h-5" }),
        });
        debouncedSave();
    }, [achievements, setAchievements, debouncedSave]);

    const prevPrestigeCountRef = useRef(prestigeCount);
    const prevGenerationRef = useRef(generationPerSecond.mana);

    useEffect(() => {
        if (!isLoaded) return;
        
        // Reset run timer on prestige
        if (prestigeCount > prevPrestigeCountRef.current) {
            setRunStartTime(Date.now());
            // Check for prestige-time achievements
            if(prevGenerationRef.current === 0) unlockAchievement('hidden_zero_power');
        }
        prevPrestigeCountRef.current = prestigeCount;
        prevGenerationRef.current = generationPerSecond.mana;

        if (items.some(i => i.level > 0)) unlockAchievement('first_item');
        if (itemUpgrades.some(u => u.purchased)) unlockAchievement('first_upgrade');
        if (hasEverPrestiged) unlockAchievement('first_prestige');
        if (Object.keys(prestigeUpgradeLevels).length > 0) unlockAchievement('first_prestige_upgrade');
        if (prestigeCount >= 1) unlockAchievement('prestige_1');
        if (prestigeCount >= 2) unlockAchievement('prestige_2');
        if (prestigeCount >= 3) unlockAchievement('prestige_3');
        if (prestigeCount >= 4) unlockAchievement('prestige_4');
        if (prestigeCount >= 5) unlockAchievement('prestige_5');
        if (lifetimeMana >= 1e3) unlockAchievement('mana_1k');
        if (lifetimeMana >= 1e6) unlockAchievement('mana_1m');
        if (lifetimeMana >= 1e9) unlockAchievement('mana_1b');
        if (lifetimeMana >= 1e12) unlockAchievement('mana_1t');
        if (lifetimeMana >= 1e15) unlockAchievement('mana_1qa');
        if (currencies.cogwheelGears >= 100) unlockAchievement('gears_100');
        if (currencies.cogwheelGears >= 10_000) unlockAchievement('gears_10k');
        if (currencies.cogwheelGears >= 1_000_000) unlockAchievement('gears_1m');
        if (currencies.aetherShards >= 10) unlockAchievement('shards_10');
        if (currencies.aetherShards >= 100) unlockAchievement('shards_100');
        if (currencies.aetherShards >= 1_000) unlockAchievement('shards_1k');
        if (currencies.aetherShards >= 10_000) unlockAchievement('shards_10k');
        if (currencies.essenceFlux >= 1) unlockAchievement('essence_1');
        if (currencies.essenceFlux >= 100) unlockAchievement('essence_100');
        if (currencies.essenceFlux >= 10_000) unlockAchievement('essence_10k');
        if (currencies.researchPoints >= 10) unlockAchievement('research_10');
        if (currencies.researchPoints >= 1_000) unlockAchievement('research_1k');
        if (currencies.researchPoints >= 100_000) unlockAchievement('research_100k');
        if (unlockedResearchNodes.size >= 1) unlockAchievement('research_start');
        if (unlockedResearchNodes.size >= 10) unlockAchievement('research_10_nodes');
        if (unlockedResearchNodes.size >= 25) unlockAchievement('research_25_nodes');
        if (unlockedResearchNodes.size >= 50) unlockAchievement('research_50_nodes');
        if (unlockedResearchNodes.has('magitech_mastery')) unlockAchievement('research_path_magitech');
        if (unlockedResearchNodes.has('mechanical_mastery')) unlockAchievement('research_path_mechanical');
        if (unlockedResearchNodes.has('trans_1_junction_3')) unlockAchievement('research_path_mystical');
        if (unlockedResearchNodes.has('trans_5_final')) unlockAchievement('research_complete_tree');
        if (activeGolemIds.length > 0) unlockAchievement('golem_first');
        if (activeGolemIds.length >= 3) unlockAchievement('golem_3_active');
        if (activeGolemIds.length >= 5) unlockAchievement('golem_5_active');
        if (activeSynergies.length > 0) unlockAchievement('golem_first_synergy');
        if (activeGolemIds.includes('chaos_golem')) unlockAchievement('golem_chaos');
        const cosmicResonator = items.find(item => item.id === 'cosmic_resonator');
        if (cosmicResonator && cosmicResonator.level > 0) {
            unlockAchievement('cosmic_resonator_1');
            if (cosmicResonator.level >= 10) unlockAchievement('cosmic_resonator_10');
            if (cosmicResonator.level >= 100) unlockAchievement('cosmic_resonator_100');
            if (cosmicResonator.level >= 1000) unlockAchievement('cosmic_resonator_1k');
        }
        const antimatterMana = items.find(item => item.id === 'antimatter_mana');
        if (antimatterMana && antimatterMana.level > 0) {
            unlockAchievement('antimatter_mana_1');
        }

        // --- NEW ACHIEVEMENT CHECKS ---
        if (!dimensionalUpgrades || !completedChallenges) return;

        // Challenge Conqueror
        if (Object.keys(completedChallenges).length > 0) unlockAchievement('challenge_first_complete');
        if (currencies.challengeTokens >= 100) unlockAchievement('challenge_tokens_100');
        if (currencies.challengeTokens >= 1000) unlockAchievement('challenge_tokens_1k');
        if (currencies.challengeTokens >= 10000) unlockAchievement('challenge_tokens_10k');
        
        const allChallengesCompleted = challenges.every(c => (completedChallenges[c.id] || 0) > 0);
        if (allChallengesCompleted) unlockAchievement('challenge_all_complete');

        if (Object.keys(dimensionalUpgrades).length > 0) unlockAchievement('dimensional_upgrade_first');
        
        const hasMaxedUpgrade = Object.entries(dimensionalUpgrades).some(([id, level]) => {
            const upgrade = dimensionalUpgradesMap.get(id);
            return upgrade && level >= upgrade.maxLevel;
        });
        if(hasMaxedUpgrade) unlockAchievement('dimensional_upgrade_max');
        
        const allUpgradesMaxed = dimensionalUpgradesList.every(u => (dimensionalUpgrades[u.id] || 0) >= u.maxLevel);
        if (allUpgradesMaxed) unlockAchievement('dimensional_upgrade_all_max');
        
        const hasVeteranChallenge = Object.values(completedChallenges).some(count => count >= 5);
        if (hasVeteranChallenge) unlockAchievement('challenge_repeat_5');


        // Currency Milestones (expanded)
        if (lifetimeMana >= 1e18) unlockAchievement('mana_1qi');
        if (lifetimeMana >= 1e21) unlockAchievement('mana_1sx');
        if (currencies.cogwheelGears >= 1e9) unlockAchievement('gears_1b');
        if (currencies.aetherShards >= 1e6) unlockAchievement('shards_1m');
        if (currencies.researchPoints >= 1e9) unlockAchievement('research_1b');

        // Prestige Master (expanded)
        if (prestigeCount >= 10) unlockAchievement('prestige_10');
        if (prestigeCount >= 15) unlockAchievement('prestige_15');
        if (prestigeCount >= 20) unlockAchievement('prestige_20');
        if (prestigeCount >= 25) unlockAchievement('prestige_25');
        if (prestigeCount >= 50) unlockAchievement('prestige_50');
        if (prestigeCount >= 100) unlockAchievement('prestige_100');

        // Workshop Mastery
        const totalWorkshopLevels = workshopUpgrades.reduce((sum, u) => sum + u.level, 0);
        if (totalWorkshopLevels >= 10) unlockAchievement('workshop_10');
        if (totalWorkshopLevels >= 50) unlockAchievement('workshop_50');
        if (totalWorkshopLevels >= 100) unlockAchievement('workshop_100');
        if (totalWorkshopLevels >= 200) unlockAchievement('workshop_200');
        if (workshopUpgrades.length > 0 && workshopUpgrades.every(u => u.level >= 10)) unlockAchievement('workshop_all_10');

        // Overclock Engineer
        if (overclockLevel >= 1) unlockAchievement('overclock_1');
        if (overclockLevel >= 5) unlockAchievement('overclock_5');
        if (overclockLevel >= 10) unlockAchievement('overclock_10');
        if (overclockLevel >= 15) unlockAchievement('overclock_15');

        // Ancient Wisdom
        if (ancientKnowledgeNodes.size >= 1) unlockAchievement('ak_1');
        if (ancientKnowledgeNodes.size >= 5) unlockAchievement('ak_5');
        if (ancientKnowledgeNodes.size >= 10) unlockAchievement('ak_10');
        if (ancientKnowledgeNodes.size >= 20) unlockAchievement('ak_20');
        if (ancientKnowledgeNodes.size >= 30) unlockAchievement('ak_30');
        const allAKNodesCount = 30; // Hardcoded total, adjust if more are added
        if (ancientKnowledgeNodes.size >= allAKNodesCount) unlockAchievement('ak_all');

        // Speed Running
        const timeSinceRunStart = (Date.now() - (runStartTime || Date.now())) / 1000; // in seconds
        if (prestigeCount > 0 && timeSinceRunStart <= 30 * 60) unlockAchievement('speed_prestige_30m');
        if (prestigeCount > 0 && timeSinceRunStart <= 10 * 60) unlockAchievement('speed_prestige_10m');
        if (lifetimeMana >= 1e6 && timeSinceRunStart <= 10 * 60) unlockAchievement('speed_mana_1m_10m');
        if (lifetimeMana >= 1e9 && timeSinceRunStart <= 30 * 60) unlockAchievement('speed_mana_1b_30m');
        if (lifetimeMana >= 1e12 && timeSinceRunStart <= 60 * 60) unlockAchievement('speed_mana_1t_1h');
        if ((items.find(i => i.id === 'cosmic_resonator')?.level || 0) > 0 && timeSinceRunStart <= 2 * 60 * 60) unlockAchievement('speed_cosmic_2h');

        // Efficiency Master
        const totalItemLevels = items.reduce((sum, i) => sum + i.level, 0);
        const distinctItemsOwned = items.filter(i => i.level > 0);
        if (totalItemLevels >= 100 && distinctItemsOwned.length === 1) unlockAchievement('efficiency_one_item_100');
        if (totalItemLevels >= 500 && distinctItemsOwned.length > 0 && distinctItemsOwned.length <= 3) unlockAchievement('efficiency_three_items_500');
        if (totalItemLevels >= 2000 && distinctItemsOwned.length > 0 && distinctItemsOwned.length <= 5) unlockAchievement('efficiency_five_items_2k');
        if (!hasEverClicked && lifetimeMana >= 1e6) unlockAchievement('efficiency_no_click_1m_mana');
        if (items.every(i => i.level === 0) && itemUpgrades.some(u => u.purchased)) unlockAchievement('efficiency_upgrade_no_items');

        // Hidden & Fun
        if (Math.round(currencies.mana) === 777) unlockAchievement('hidden_mana_777');
        if (devMode) unlockAchievement('hidden_dev_mode');
        const manaCrystal = items.find(i => i.id === 'mana_crystal');
        if(manaCrystal && manaCrystal.level === 42) unlockAchievement('hidden_42');
        if (unlockedResearchNodes.has('trans_5_final') && activeGolemIds.length === 5) unlockAchievement('hidden_endgame_synergy');

    }, [isLoaded, items, itemUpgrades, hasEverPrestiged, prestigeUpgradeLevels, prestigeCount, lifetimeMana, currencies, unlockAchievement, unlockedResearchNodes, activeGolemIds, activeSynergies, workshopUpgrades, overclockLevel, runStartTime, setRunStartTime, ancientKnowledgeNodes, devMode, hasEverClicked, generationPerSecond, completedChallenges, dimensionalUpgrades]);
};
