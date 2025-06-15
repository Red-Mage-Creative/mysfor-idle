
import React from 'react';
import { Golem, Currencies, GolemEffect } from '@/lib/gameTypes';
import { GolemCard } from './GolemCard';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { golemMap } from '@/lib/golems';

interface EssenceGolemsListProps {
    currencies: Currencies;
    onBuyGolem: (id: string) => void;
    activeGolemIds: string[];
    allGolems: Golem[];
    maxActiveGolems: number;
}

const EssenceGolemsList: React.FC<EssenceGolemsListProps> = ({
    currencies,
    onBuyGolem,
    activeGolemIds,
    allGolems,
    maxActiveGolems,
}) => {
    const activeGolems = activeGolemIds.map(id => golemMap.get(id)).filter(Boolean) as Golem[];

    const formatTarget = (target: GolemEffect['target']) => {
        switch (target) {
            case 'mana': return 'Mana Gen';
            case 'cogwheelGears': return 'Gear Gen';
            case 'essenceFlux': return 'Essence Gen';
            case 'researchPoints': return 'Research Gen';
            default: return 'Unknown';
        }
    };

    const totalEffects: Partial<Record<GolemEffect['target'], number>> = {};
    activeGolems.forEach(golem => {
        golem.effects.forEach(effect => {
            totalEffects[effect.target] = (totalEffects[effect.target] || 1) * effect.multiplier;
        });
    });

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Golem Workshop</CardTitle>
                    <CardDescription>
                        Use Essence Flux to activate powerful Golems. You can have up to {maxActiveGolems} Golems active at a time.
                        Active Golems: {activeGolemIds.length} / {maxActiveGolems}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {activeGolems.length > 0 ? (
                        <div>
                            <h4 className="font-semibold mb-2 text-sm">Total Active Effects:</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                {Object.entries(totalEffects).map(([target, multiplier]) => {
                                    if (!multiplier || multiplier === 1) return null;
                                    const percentage = (multiplier - 1) * 100;
                                    const sign = percentage > 0 ? '+' : '';
                                    return (
                                        <li key={target} className={percentage > 0 ? 'text-green-600' : 'text-red-600'}>
                                            {formatTarget(target as GolemEffect['target'])}: {sign}{percentage.toFixed(0)}%
                                        </li>
                                    );
                                })}
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
                        onBuy={onBuyGolem}
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
