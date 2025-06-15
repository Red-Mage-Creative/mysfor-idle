
import React, { useEffect, useCallback } from 'react';
import { toast } from "@/components/ui/sonner";
import { achievementMap } from '@/lib/achievements';
import type { useGameState } from '@/hooks/useGameState';
import type { useGameCalculations } from '@/hooks/useGameCalculations';

type AchievementManagerProps = ReturnType<typeof useGameState> & ReturnType<typeof useGameCalculations> & {
    debouncedSave: () => void;
};

export const useAchievementManager = (props: AchievementManagerProps) => {
    const { 
        isLoaded, items, itemUpgrades, hasEverPrestiged, prestigeUpgradeLevels, 
        prestigeCount, lifetimeMana, currencies, unlockedResearchNodes, 
        activeGolemIds, activeSynergies, setAchievements, achievements, debouncedSave
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

    useEffect(() => {
        if (!isLoaded) return;
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
    }, [isLoaded, items, itemUpgrades, hasEverPrestiged, prestigeUpgradeLevels, prestigeCount, lifetimeMana, currencies, unlockAchievement, unlockedResearchNodes, activeGolemIds, activeSynergies]);
};
