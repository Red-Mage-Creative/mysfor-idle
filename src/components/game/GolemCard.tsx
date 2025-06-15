
import React from 'react';
import { Golem, GolemEffect } from '@/lib/gameTypes';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatNumber } from '@/lib/formatters';
import { Gem } from 'lucide-react';

interface GolemCardProps {
    golem: Golem;
    onBuy: (id: string) => void;
    isActive: boolean;
    canAfford: boolean;
    isLimitReached: boolean;
}

const formatMultiplier = (multiplier: number) => {
    const percentage = (multiplier - 1) * 100;
    const sign = percentage > 0 ? '+' : '';
    return `${sign}${percentage.toFixed(0)}%`;
};

const formatTarget = (target: GolemEffect['target']) => {
    switch (target) {
        case 'mana': return 'Mana Gen';
        case 'cogwheelGears': return 'Gear Gen';
        case 'essenceFlux': return 'Essence Gen';
        case 'researchPoints': return 'Research Gen';
        default: return 'Unknown';
    }
};

export const GolemCard: React.FC<GolemCardProps> = ({ golem, onBuy, isActive, canAfford, isLimitReached }) => {
    const Icon = golem.icon;

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Icon className="w-6 h-6" />
                        {golem.name}
                    </CardTitle>
                    {isActive && <Badge>Active</Badge>}
                </div>
                <CardDescription>{golem.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                <div className="space-y-2">
                    <p className="font-semibold">Effects:</p>
                    <ul className="list-disc list-inside space-y-1">
                        {golem.effects.map((effect, index) => (
                            <li key={index} className={effect.multiplier > 1 ? 'text-green-600' : 'text-red-600'}>
                                {formatTarget(effect.target)}: {formatMultiplier(effect.multiplier)}
                            </li>
                        ))}
                    </ul>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col items-stretch">
                <div className="flex items-center justify-center font-bold text-lg mb-4">
                    <Gem className="w-5 h-5 mr-2 text-purple-500" />
                    {formatNumber(golem.cost)} Essence
                </div>
                <Button
                    onClick={() => onBuy(golem.id)}
                    disabled={isActive || !canAfford || (!isActive && isLimitReached)}
                >
                    {isActive ? 'Active' : (isLimitReached ? 'Limit Reached' : 'Activate')}
                </Button>
            </CardFooter>
        </Card>
    );
};
