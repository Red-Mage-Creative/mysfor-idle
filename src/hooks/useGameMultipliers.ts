import { useMemo } from 'react';
import { prestigeUpgrades } from '@/lib/prestigeUpgrades';
import { allItemUpgrades } from '@/lib/itemUpgrades';
import { Item, ItemUpgrade, Currencies, Currency, CurrencyRecord, GolemEffect, Golem } from '@/lib/gameTypes';
import { useGameState } from './useGameState';
import { researchNodeMap } from '@/lib/researchTree';
import { golemMap } from '@/lib/golems';
import { allSynergies } from '@/lib/golemSynergies';
import { WorkshopUpgrade } from '@/lib/gameTypes';

type UseGameMultipliersProps = Pick<ReturnType<typeof useGameState>,
    'achievements' |
    'unlockedResearchNodes' |
    'activeGolemIds' |
    'prestigeUpgradeLevels' |
    'workshopUpgrades' |
    'items' |
    'itemUpgrades' |
    'prestigeCount' |
    'currencies' |
    'ancientKnowledgeNodes'
>;

export const useGameMultipliers = ({
    achievements,
    unlockedResearchNodes,
    activeGolemIds,
    prestigeUpgradeLevels,
    workshopUpgrades,
    items,
    itemUpgrades,
    prestigeCount,
    currencies,
    ancientKnowledgeNodes,
}: UseGameMultipliersProps) => {
    const achievementBonus = useMemo(() => {
        if (!achievements) return 1;
        const unlockedCount = Object.values(achievements).filter(a => a.unlocked).length;
        return 1 + (unlockedCount * 0.05);
    }, [achievements]);

    const researchBonuses = useMemo(() => {
        const bonuses = {
            mana: 1,
            allProduction: 1,
            costReduction: 1,
            manaPerClick: 1,
            essenceFlux: 1,
            researchPoints: 1,
            specificItem: {} as Record<string, number>,
        };

        unlockedResearchNodes.forEach(nodeId => {
            const node = researchNodeMap.get(nodeId);
            if (!node) return;

            switch (node.effect.type) {
                case 'manaMultiplier':
                    bonuses.mana *= node.effect.value;
                    break;
                case 'allProductionMultiplier':
                    bonuses.allProduction *= node.effect.value;
                    break;
                case 'costReductionMultiplier':
                    bonuses.costReduction *= node.effect.value;
                    break;
                case 'manaPerClickMultiplier':
                    bonuses.manaPerClick *= node.effect.value;
                    break;
                case 'essenceFluxMultiplier':
                    bonuses.essenceFlux *= node.effect.value;
                    break;
                case 'researchPointsMultiplier':
                    bonuses.researchPoints *= node.effect.value;
                    break;
                case 'specificItemMultiplier':
                    if (node.effect.itemId) {
                        bonuses.specificItem[node.effect.itemId] = (bonuses.specificItem[node.effect.itemId] || 1) * node.effect.value;
                    }
                    break;
            }
        });

        return bonuses;
    }, [unlockedResearchNodes]);

    const activeGolems = useMemo(() => {
        return activeGolemIds
            .map(id => golemMap.get(id))
            .filter((g): g is Golem => !!g);
    }, [activeGolemIds]);

    const activeSynergies = useMemo(() => {
        const activeGolemIdSet = new Set(activeGolemIds);
        return allSynergies.filter(synergy =>
            synergy.golemIds.every(id => activeGolemIdSet.has(id))
        );
    }, [activeGolemIds]);

    const golemEffects = useMemo(() => {
        const effects = {
            generationMultiplier: {} as Partial<Record<Currency, number>>,
            flatGeneration: {} as Partial<Record<Currency, number>>,
            costMultiplier: 1,
            shardGainMultiplier: 1,
            disabledFeatures: new Set<'autoBuyItems' | 'autoBuyUpgrades'>(),
        };

        const processEffect = (effect: GolemEffect) => {
            switch (effect.type) {
                case 'generationMultiplier':
                    effects.generationMultiplier[effect.target] = (effects.generationMultiplier[effect.target] || 1) * effect.value;
                    break;
                case 'flatGeneration':
                    effects.flatGeneration[effect.target] = (effects.flatGeneration[effect.target] || 0) + effect.value;
                    break;
                case 'costMultiplier':
                    effects.costMultiplier *= effect.value;
                    break;
                case 'shardGainMultiplier':
                    effects.shardGainMultiplier *= effect.value;
                    break;
                case 'disableFeature':
                    effects.disabledFeatures.add(effect.feature);
                    break;
                case 'randomEffect': {
                    const effectIndex = Math.floor((Date.now() / 1000) / 60) % effect.effects.length;
                    const activeEffect = effect.effects[effectIndex];
                    if (activeEffect) {
                        processEffect(activeEffect);
                    }
                    break;
                }
            }
        };

        activeGolemIds.forEach(golemId => {
            const golem = golemMap.get(golemId);
            if (golem) {
                golem.effects.forEach(effect => {
                    processEffect(effect);
                });
            }
        });

        activeSynergies.forEach(synergy => {
            processEffect(synergy.effect);
        });

        return effects;
    }, [activeGolemIds, activeSynergies]);

    const prestigeLevelBonus = useMemo(() => {
        if (!prestigeCount || prestigeCount < 8) return 1;
        // Exponential bonus starts at prestige 8
        return Math.pow(1.5, prestigeCount - 7);
    }, [prestigeCount]);

    const aetherShardBonus = useMemo(() => {
        if (!currencies?.aetherShards) return 1;
        // Logarithmic bonus for holding Aether Shards
        return 1 + Math.log10(Math.max(1, currencies.aetherShards)) * 0.05;
    }, [currencies?.aetherShards]);

    const ancientKnowledgeBonus = useMemo(() => {
        if (!ancientKnowledgeNodes?.size) return 1;
        // 2% bonus per unique research node discovered across all prestiges
        return 1 + ancientKnowledgeNodes.size * 0.02;
    }, [ancientKnowledgeNodes]);

    const prestigeMultipliers = useMemo(() => {
        const multipliers = {
            manaClick: 1,
            allProduction: 1,
            shardGain: 1,
            offlineProduction: 1,
            costReduction: 1,
            autoBuyItemsUnlocked: false,
            autoBuyUpgradesUnlocked: false,
        };

        for (const upgrade of prestigeUpgrades) {
            const level = prestigeUpgradeLevels[upgrade.id] || 0;
            if (level > 0) {
                switch (upgrade.effect.type) {
                    case 'manaClickMultiplier':
                        multipliers.manaClick *= upgrade.effect.value(level);
                        break;
                    case 'allProductionMultiplier':
                        multipliers.allProduction *= upgrade.effect.value(level);
                        break;
                    case 'shardGainMultiplier':
                        multipliers.shardGain *= upgrade.effect.value(level);
                        break;
                    case 'offlineProductionMultiplier':
                        multipliers.offlineProduction *= upgrade.effect.value(level);
                        break;
                    case 'costReductionMultiplier':
                        multipliers.costReduction *= upgrade.effect.value(level);
                        break;
                    case 'unlockAutoBuyItems':
                        multipliers.autoBuyItemsUnlocked = true;
                        break;
                    case 'unlockAutoBuyUpgrades':
                        multipliers.autoBuyUpgradesUnlocked = true;
                        break;
                }
            }
        }

        // Apply new global bonuses to all production
        multipliers.allProduction *= prestigeLevelBonus * aetherShardBonus * ancientKnowledgeBonus;

        if (golemEffects.disabledFeatures.has('autoBuyItems')) {
            multipliers.autoBuyItemsUnlocked = false;
        }
        if (golemEffects.disabledFeatures.has('autoBuyUpgrades')) {
            multipliers.autoBuyUpgradesUnlocked = false;
        }

        return multipliers;
    }, [prestigeUpgradeLevels, golemEffects, prestigeLevelBonus, aetherShardBonus, ancientKnowledgeBonus]);

    const workshopUpgradeMultipliers = useMemo(() => {
        const multipliers = {
            mana: 1,
            essenceFlux: 1,
            researchPoints: 1,
        };

        for (const upgrade of workshopUpgrades) {
            if (upgrade.level > 0) {
                const bonus = upgrade.effect.value * upgrade.level;
                switch (upgrade.effect.type) {
                    case 'manaMultiplier':
                        multipliers.mana += bonus;
                        break;
                    case 'essenceFluxMultiplier':
                        multipliers.essenceFlux += bonus;
                        break;
                    case 'researchPointsMultiplier':
                        multipliers.researchPoints += bonus;
                        break;
                }
            }
        }
        return multipliers;
    }, [workshopUpgrades]);

    const itemUpgradeMultipliers = useMemo(() => {
        const multipliers: Record<string, { generation: number; click: number }> = {};
        for (const item of items) {
            multipliers[item.id] = { generation: 1, click: 1 };
        }

        for (const upgrade of itemUpgrades) {
            if (upgrade.purchased) {
                if (upgrade.effect.type === 'generationMultiplier') {
                    multipliers[upgrade.parentItemId].generation *= upgrade.effect.value;
                }
                if (upgrade.effect.type === 'clickMultiplier') {
                    multipliers[upgrade.parentItemId].click *= upgrade.effect.value;
                }
            }
        }
        return multipliers;
    }, [itemUpgrades, items]);

    return {
        achievementBonus,
        researchBonuses,
        activeGolems,
        activeSynergies,
        golemEffects,
        prestigeMultipliers,
        workshopUpgradeMultipliers,
        itemUpgradeMultipliers,
    };
};
