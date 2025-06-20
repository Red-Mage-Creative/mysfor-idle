import { useMemo } from 'react';
import { prestigeUpgrades } from '@/lib/prestigeUpgrades';
import { allItemUpgrades } from '@/lib/itemUpgrades';
import { Item, ItemUpgrade, Currencies, Currency, CurrencyRecord, GolemEffect, Golem } from '@/lib/gameTypes';
import { useGameState } from './useGameState';
import { researchNodeMap } from '@/lib/researchTree';
import { golemMap } from '@/lib/golems';
import { allSynergies } from '@/lib/golemSynergies';
import { WorkshopUpgrade } from '@/lib/gameTypes';
import { dimensionalUpgradesMap } from '@/lib/dimensionalUpgrades';
import { challengeMap } from '@/lib/challenges';
import { ChallengeEffects } from '@/lib/gameTypes';

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
    'ancientKnowledgeNodes' |
    'activeChallengeId' |
    'dimensionalUpgrades'
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
    activeChallengeId,
    dimensionalUpgrades
}: UseGameMultipliersProps) => {
    const dimensionalMultipliers = useMemo(() => {
        const multipliers = {
            allProduction: 1,
            essenceFlux: 1,
            offlineProduction: 1,
            costReduction: 1,
            shardGain: 1,
            challengeTokenGain: 1,
            manaClick: 1,
            researchPoints: 1,
            multiPrestigeBonus: 0,
            golemSynergy: 1,
        };

        if (!dimensionalUpgrades) return multipliers;

        for (const upgradeId in dimensionalUpgrades) {
            const level = dimensionalUpgrades[upgradeId];
            if (level > 0) {
                const upgrade = dimensionalUpgradesMap.get(upgradeId);
                if (upgrade) {
                    const value = upgrade.effect.value(level);
                    switch (upgrade.effect.type) {
                        case 'allProductionMultiplier': multipliers.allProduction *= value; break;
                        case 'essenceFluxMultiplier': multipliers.essenceFlux *= value; break;
                        case 'offlineProductionMultiplier': multipliers.offlineProduction *= value; break;
                        case 'costReductionMultiplier': multipliers.costReduction *= value; break;
                        case 'shardGainMultiplier': multipliers.shardGain *= value; break;
                        case 'challengeTokenGainMultiplier': multipliers.challengeTokenGain *= value; break;
                        case 'manaClickMultiplier': multipliers.manaClick *= value; break;
                        case 'researchPointsMultiplier': multipliers.researchPoints *= value; break;
                        case 'multiPrestigeBonus': multipliers.multiPrestigeBonus += value; break;
                        case 'golemSynergyMultiplier': multipliers.golemSynergy *= value; break;
                    }
                }
            }
        }
        return multipliers;
    }, [dimensionalUpgrades]);

    const challengeEffects = useMemo<ChallengeEffects>(() => {
        const effects: ChallengeEffects = {
            challengeFailConditions: [],
            generationMultiplier: {},
            canBuyItemUpgrades: true,
            canSpendResearchPoints: true,
            golemEffectMultiplier: 1,
        };

        const challenge = activeChallengeId ? challengeMap.get(activeChallengeId) : null;
        if (!challenge) return effects;

        return challenge.applyRestrictions(effects);
    }, [activeChallengeId]);

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
            // Apply dimensional synergy multiplier
            const synergyEffect = JSON.parse(JSON.stringify(synergy.effect)); // Deep copy to avoid mutation
            if (synergyEffect.type === 'generationMultiplier' || synergyEffect.type === 'flatGeneration') {
                synergyEffect.value *= dimensionalMultipliers.golemSynergy;
            } else if (synergyEffect.type === 'shardGainMultiplier') {
                 synergyEffect.value = 1 + ((synergyEffect.value - 1) * dimensionalMultipliers.golemSynergy);
            }
            processEffect(synergyEffect);
        });
        
        // Apply challenge multiplier to golem effects
        Object.keys(effects.generationMultiplier).forEach(key => {
            const currencyKey = key as keyof typeof effects.generationMultiplier;
            effects.generationMultiplier[currencyKey]! *= challengeEffects.golemEffectMultiplier;
        });
        Object.keys(effects.flatGeneration).forEach(key => {
            const currencyKey = key as keyof typeof effects.flatGeneration;
            effects.flatGeneration[currencyKey]! *= challengeEffects.golemEffectMultiplier;
        });
        effects.shardGainMultiplier = 1 + (effects.shardGainMultiplier - 1) * challengeEffects.golemEffectMultiplier;


        return effects;
    }, [activeGolemIds, activeSynergies, challengeEffects.golemEffectMultiplier, dimensionalMultipliers.golemSynergy]);

    const prestigeLevelBonus = useMemo(() => {
        if (!prestigeCount || prestigeCount < 5) return 1;
        // Exponential bonus starts at prestige 5, with a higher multiplier
        return Math.pow(1.8, prestigeCount - 4);
    }, [prestigeCount]);

    const aetherShardBonus = useMemo(() => {
        if (!currencies?.aetherShards) return 1;
        // Power-based bonus for holding Aether Shards for better scaling
        return 1 + Math.pow(Math.max(1, currencies.aetherShards), 0.35) * 0.1;
    }, [currencies?.aetherShards]);

    const ancientKnowledgeBonus = useMemo(() => {
        if (!ancientKnowledgeNodes?.size) return 1;
        // Exponential bonus per unique research node discovered
        return Math.pow(1.025, ancientKnowledgeNodes.size);
    }, [ancientKnowledgeNodes]);

    const synergyBonus = useMemo(() => {
        let bonus = 1;
        if (prestigeCount >= 10) bonus *= 1.25;
        if (currencies.aetherShards >= 5000) bonus *= 1.25;
        if (ancientKnowledgeNodes.size >= 60) bonus *= 1.25;
        return bonus;
    }, [prestigeCount, currencies.aetherShards, ancientKnowledgeNodes.size]);

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

        // Apply new global bonuses to all production, including the new synergy bonus
        multipliers.allProduction *= prestigeLevelBonus * aetherShardBonus * ancientKnowledgeBonus * synergyBonus;

        // Apply dimensional multipliers
        multipliers.allProduction *= dimensionalMultipliers.allProduction;
        multipliers.costReduction *= dimensionalMultipliers.costReduction;
        multipliers.manaClick *= dimensionalMultipliers.manaClick;
        multipliers.offlineProduction *= dimensionalMultipliers.offlineProduction;
        multipliers.shardGain *= dimensionalMultipliers.shardGain;

        if (golemEffects.disabledFeatures.has('autoBuyItems')) {
            multipliers.autoBuyItemsUnlocked = false;
        }
        if (golemEffects.disabledFeatures.has('autoBuyUpgrades')) {
            multipliers.autoBuyUpgradesUnlocked = false;
        }

        return multipliers;
    }, [prestigeUpgradeLevels, golemEffects, prestigeLevelBonus, aetherShardBonus, ancientKnowledgeBonus, synergyBonus, dimensionalMultipliers]);

    const workshopUpgradeMultipliers = useMemo(() => {
        const multipliers = {
            mana: 1,
            essenceFlux: 1,
            researchPoints: 1,
        };

        for (const upgrade of workshopUpgrades) {
            if (upgrade.level > 0) {
                const bonus = upgrade.effect.value;
                switch (upgrade.effect.type) {
                    case 'manaMultiplier':
                        multipliers.mana *= Math.pow(1 + bonus, upgrade.level);
                        break;
                    case 'essenceFluxMultiplier':
                        multipliers.essenceFlux *= Math.pow(1 + bonus, upgrade.level);
                        break;
                    case 'researchPointsMultiplier':
                        multipliers.researchPoints *= Math.pow(1 + bonus, upgrade.level);
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
        prestigeLevelBonus,
        aetherShardBonus,
        ancientKnowledgeBonus,
        synergyBonus,
        challengeEffects,
        multiPrestigeBonus: dimensionalMultipliers.multiPrestigeBonus,
    };
};
