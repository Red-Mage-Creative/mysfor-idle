
import React from 'react';
import { Golem, Currencies, GolemEffect } from '@/lib/gameTypes';
import { GolemCard } from './GolemCard';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { golemMap } from '@/lib/golems';
import { formatNumber } from '@/lib/formatters';

interface EssenceGolemsListProps {
    currencies: Currencies;
    onToggleGolem: (id: string) => void;
    activeGolemIds: string[];
    allGolems: Golem[];
    maxActiveGolems: number;
}

const EssenceGolemsList: React.FC<EssenceGolemsListProps> = ({
    currencies,
    onToggleGolem,
    activeGolemIds,
    allGolems,
    maxActiveGolems,
}) => {
    const activeGolems = activeGolemIds.map(id => golemMap.get(id)).filter(Boolean) as Golem[];

    const totalEffects = React.useMemo(() => {
        const totals = {
            generationMultiplier: {} as Record<string, number>,
            flatGeneration: {} as Record<string, number>,
            costMultiplier: 1,
        };

        activeGolems.forEach(golem => {
            golem.effects.forEach(effect => {
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
                }
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
                            </ul>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No active Golems. Activate one below to see its effects.</p>
                    )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allGolems.map(golem => (
                    <GolemCard
                        key={golem.id}
                        golem={golem}
                        onToggle={onToggleGolem}
                        isActive={activeGolemIds.includes(golem.id)}
                        canAfford={currencies.essenceFlux >= golem.cost}
                        isLimitReached={activeGolemIds.length >= maxActiveGolems}
                    />
                ))}
            </div>
        </div>
    );
};

export default EssenceGolemsList;
