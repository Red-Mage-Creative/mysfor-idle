
import React from 'react';
import { Golem, Currencies } from '@/lib/gameTypes';
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
                    {/* Placeholder for effects summary */}
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
