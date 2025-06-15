import { useMemo } from 'react';
import { useGameState } from './useGameState';
import { useGameMultipliers } from './useGameMultipliers';
import { useProduction } from './useProduction';
import { usePrestigeManagement } from './usePrestigeManagement';
import { useItemManagement } from './useItemManagement';

export const useGameCalculations = (props: ReturnType<typeof useGameState>) => {
    const multipliers = useGameMultipliers({
        achievements: props.achievements,
        unlockedResearchNodes: props.unlockedResearchNodes,
        activeGolemIds: props.activeGolemIds,
        prestigeUpgradeLevels: props.prestigeUpgradeLevels,
        workshopUpgrades: props.workshopUpgrades,
        items: props.items,
        itemUpgrades: props.itemUpgrades,
        currencies: props.currencies,
        prestigeCount: props.prestigeCount,
        ancientKnowledgeNodes: props.ancientKnowledgeNodes,
        activeChallengeId: props.activeChallengeId,
        dimensionalUpgrades: props.dimensionalUpgrades,
    });

    const production = useProduction({
        items: props.items,
        itemUpgrades: props.itemUpgrades,
        overclockLevel: props.overclockLevel,
        devMode: props.devMode,
        multipliers,
        currencies: props.currencies,
    });

    // Apply direct challenge effects on production
    let { manaPerClick } = production;
    if (multipliers.challengeEffects.manaPerClick !== undefined) {
        manaPerClick = multipliers.challengeEffects.manaPerClick;
    }

    const { generationPerSecond } = production;
    Object.entries(multipliers.challengeEffects.generationMultiplier).forEach(([currency, multiplier]) => {
        const key = currency as keyof typeof generationPerSecond;
        if (generationPerSecond[key]) {
            generationPerSecond[key]! *= multiplier;
        }
    });

    const prestige = usePrestigeManagement({
        lifetimeMana: props.lifetimeMana,
        prestigeCount: props.prestigeCount,
        currencies: props.currencies,
        hasEverPrestiged: props.hasEverPrestiged,
        multipliers,
    });

    const itemManagement = useItemManagement({
        items: props.items,
        itemUpgrades: props.itemUpgrades,
        currencies: props.currencies,
        buyQuantity: props.buyQuantity,
        lifetimeMana: props.lifetimeMana,
        hasEverPrestiged: props.hasEverPrestiged,
        multipliers,
        production,
    });

    const showUpgradesTab = useMemo(() => {
        return props.items.some(i => i.level >= 10);
    }, [props.items]);

    const showWorkshopTab = useMemo(() => {
        const hasGears = props.currencies.cogwheelGears > 0;
        const hasLeveledWorkshopUpgrade = props.workshopUpgrades.some(u => u.level > 0);
        const hasUnlockedAutomaton = (props.items.find(i => i.id === 'clockwork_automaton')?.level || 0) > 0;
        
        return hasGears || hasLeveledWorkshopUpgrade || hasUnlockedAutomaton;
    }, [props.currencies.cogwheelGears, props.workshopUpgrades, props.items]);

    const showResearchTab = useMemo(() => {
        return props.currencies.researchPoints > 0 || props.unlockedResearchNodes.size > 0;
    }, [props.currencies.researchPoints, props.unlockedResearchNodes]);
    
    const showTutorial = useMemo(() => {
        return !props.hasEverClicked && props.currencies.mana === 0 && (production.generationPerSecond.mana || 0) === 0;
    }, [props.hasEverClicked, props.currencies.mana, production.generationPerSecond]);

    return {
        // From multipliers
        prestigeMultipliers: multipliers.prestigeMultipliers,
        workshopUpgradeMultipliers: multipliers.workshopUpgradeMultipliers,
        itemUpgradeMultipliers: multipliers.itemUpgradeMultipliers,
        achievementBonus: multipliers.achievementBonus,
        researchBonuses: multipliers.researchBonuses,
        activeGolems: multipliers.activeGolems,
        activeSynergies: multipliers.activeSynergies,
        golemEffects: multipliers.golemEffects,
        prestigeLevelBonus: multipliers.prestigeLevelBonus,
        aetherShardBonus: multipliers.aetherShardBonus,
        ancientKnowledgeBonus: multipliers.ancientKnowledgeBonus,
        synergyBonus: multipliers.synergyBonus,
        challengeEffects: multipliers.challengeEffects,
        multiPrestigeBonus: multipliers.multiPrestigeBonus,

        // From production
        overclockInfo: production.overclockInfo,
        generationPerSecond: generationPerSecond,
        manaPerClick: manaPerClick,

        // From prestige
        ...prestige,

        // From item management
        ...itemManagement,

        // UI State
        showUpgradesTab,
        showWorkshopTab,
        showResearchTab,
        showTutorial,
    };
};
