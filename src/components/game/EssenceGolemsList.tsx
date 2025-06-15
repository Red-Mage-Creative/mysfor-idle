import React from 'react';
import { Golem, Currencies, GolemEffect, GolemSynergy } from '@/lib/gameTypes';
import { GolemCard } from './GolemCard';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { golemMap, allGolems as allGolemsList } from '@/lib/golems';
import { formatNumber } from '@/lib/formatters';
import { allSynergies } from '@/lib/golemSynergies';
import { Zap, ShieldAlert } from 'lucide-react';

interface EssenceGolemsListProps {
    currencies: Currencies;
    onToggleGolem: (id: string) => void;
    activeGolemIds: string[];
    allGolems: Golem[];
    maxActiveGolems: number;
    prestigeCount: number;
}

const EssenceGolemsList: React.FC<EssenceGolemsListProps> = ({
    currencies,
    onToggleGolem,
    activeGolemIds,
    allGolems,
    maxActiveGolems,
    prestigeCount,
}) => {
    const activeGolems = activeGolemIds.map(id => golemMap.get(id)).filter(Boolean) as Golem[];
    
    const activeSynergies = React.useMemo(() => {
        const activeIdSet = new Set(activeGolemIds);
        return allSynergies.filter(synergy =>
            synergy.golemIds.every(id => activeIdSet.has(id))
        );
    }, [activeGolemIds]);

    const activeConflicts = React.useMemo(() => {
        const conflicts = new Set<string>();
        activeGolems.forEach(g => {
            g.conflictsWith?.forEach(conflictId => conflicts.add(conflictId));
        });
        return conflicts;
    }, [activeGolems]);

    const totalEffects = React.useMemo(() => {
        const totals = {
            generationMultiplier: {} as Record<string, number>,
            flatGeneration: {} as Record<string, number>,
            costMultiplier: 1,
            shardGainMultiplier: 1,
            disabledFeatures: new Set<'autoBuyItems' | 'autoBuyUpgrades'>(),
        };

        const processEffect = (effect: GolemEffect) => {
            switch (effect.type) {
                case 'generationMultiplier':
                    totals.generationMultiplier[effect.target] = (totals.generationMultiplier[effect.target] || 1) * effect.value;
                    break;
                case 'flatGeneration':
                    totals.flatGeneration[effect.target] = (totals.flatGeneration[effect.target] || 0) + effect.value;
                    break;
                case 'costMultiplier':
                    totals.costMultiplier *= effect.value;
                    break;
                case 'shardGainMultiplier':
                    totals.shardGainMultiplier *= effect.value;
                    break;
                case 'disableFeature':
                    totals.disabledFeatures.add(effect.feature);
                    break;
                case 'randomEffect': {
                    // Cycle every 60 seconds. Must be consistent with useGameCalculations.
                    const effectIndex = Math.floor((Date.now() / 1000) / 60) % effect.effects.length;
                    const activeEffect = effect.effects[effectIndex];
                    if (activeEffect) {
                        processEffect(activeEffect);
                    }
                    break;
                }
            }
        };

        activeGolems.forEach(golem => {
            golem.effects.forEach(effect => {
                processEffect(effect);
            });
        });
        return totals;
    }, [activeGolems]);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Golem Workshop</CardTitle>
                    <CardDescription>
                        Activate powerful Golems with unique effects and drawbacks. You can have up to {maxActiveGolems} active at a time.
                        Active Golems: {activeGolemIds.length} / {maxActiveGolems}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {activeGolems.length > 0 ? (
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold mb-2 text-sm">Total Active Effects:</h4>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                    {Object.entries(totalEffects.generationMultiplier).map(([target, value]) => {
                                        if (value === 1) return null;
                                        const percentage = (value - 1) * 100;
                                        const sign = percentage > 0 ? '+' : '';
                                        const targetName = target.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                        return (
                                            <li key={`gen-${target}`} className={percentage > 0 ? 'text-green-600' : 'text-red-600'}>
                                                {targetName} Gen: {sign}{percentage.toFixed(0)}%
                                            </li>
                                        );
                                    })}
                                    {Object.entries(totalEffects.flatGeneration).map(([target, value]) => {
                                        if (value === 0) return null;
                                        const sign = value > 0 ? '+' : '';
                                        const targetName = target.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                        return (
                                            <li key={`flat-${target}`} className={value > 0 ? 'text-green-600' : 'text-red-600'}>
                                                {targetName}: {sign}{formatNumber(value)}/s
                                            </li>
                                        );
                                    })}
                                    {totalEffects.costMultiplier !== 1 && (
                                        <li className={(totalEffects.costMultiplier - 1) > 0 ? 'text-red-600' : 'text-green-600'}>
                                            All Costs: {(totalEffects.costMultiplier - 1) > 0 ? '+' : ''}{((totalEffects.costMultiplier - 1) * 100).toFixed(0)}%
                                        </li>
                                    )}
                                    {totalEffects.shardGainMultiplier !== 1 && (
                                        <li className={(totalEffects.shardGainMultiplier - 1) > 0 ? 'text-green-600' : 'text-red-600'}>
                                            Shard Gain: {(totalEffects.shardGainMultiplier - 1) > 0 ? '+' : ''}{((totalEffects.shardGainMultiplier - 1) * 100).toFixed(0)}%
                                        </li>
                                    )}
                                    {Array.from(totalEffects.disabledFeatures).map(feature => {
                                        const featureName = feature === 'autoBuyItems' ? 'Auto-buy Items' : 'Auto-buy Upgrades';
                                        return (
                                            <li key={`disable-${feature}`} className="text-orange-500">
                                                {featureName} Disabled
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                            {activeSynergies.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-2 text-sm flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-500" /> Active Synergies:</h4>
                                    <ul className="space-y-2 text-sm">
                                        {activeSynergies.map(synergy => (
                                            <li key={synergy.id}>
                                                <p className="font-medium text-purple-600">{synergy.name}</p>
                                                <p className="text-muted-foreground text-xs">{synergy.description}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No active Golems. Activate one below to see its effects.</p>
                    )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allGolems.map(golem => {
                    const isActive = activeGolemIds.includes(golem.id);
                    const isLocked = golem.unlocksAtPrestige ? prestigeCount < golem.unlocksAtPrestige : false;
                    const isConflicting = !isActive && activeConflicts.has(golem.id);
                    const lockMessage = isLocked ? `Unlocks at Prestige ${golem.unlocksAtPrestige}` : '';

                    return (
                        <GolemCard
                            key={golem.id}
                            golem={golem}
                            onToggle={onToggleGolem}
                            isActive={isActive}
                            canAfford={currencies.essenceFlux >= golem.cost}
                            isLimitReached={!isActive && activeGolemIds.length >= maxActiveGolems}
                            isLocked={isLocked}
                            isConflicting={isConflicting}
                            lockMessage={lockMessage}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default EssenceGolemsList;
