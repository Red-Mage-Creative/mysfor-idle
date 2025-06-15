
import React from 'react';
import { Golem, GolemEffect } from '@/lib/gameTypes';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatNumber } from '@/lib/formatters';
import { Gem, ArrowUp, ArrowDown, ChevronsUp, ChevronsDown } from 'lucide-react';

interface GolemCardProps {
    golem: Golem;
    onToggle: (id: string) => void;
    isActive: boolean;
    canAfford: boolean;
    isLimitReached: boolean;
}

const formatEffect = (effect: GolemEffect) => {
    switch (effect.type) {
        case 'generationMultiplier':
            const percentage = (effect.value - 1) * 100;
            const sign = percentage > 0 ? '+' : '';
            const targetName = effect.target.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            const color = percentage > 0 ? 'text-green-600' : 'text-red-600';
            const Icon = percentage > 0 ? ArrowUp : ArrowDown;
            return <span className={color}><Icon className="inline w-4 h-4 mr-1" />{sign}{percentage.toFixed(0)}% {targetName} Gen</span>;
        
        case 'flatGeneration':
            const flatSign = effect.value > 0 ? '+' : '';
            const flatTargetName = effect.target.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            const flatColor = effect.value > 0 ? 'text-green-600' : 'text-red-600';
            const FlatIcon = effect.value > 0 ? ArrowUp : ArrowDown;
            return <span className={flatColor}><FlatIcon className="inline w-4 h-4 mr-1" />{flatSign}{formatNumber(effect.value)} {flatTargetName}/s</span>;

        case 'costMultiplier':
             const costPercentage = (effect.value - 1) * 100;
             const costColor = costPercentage > 0 ? 'text-red-600' : 'text-green-600';
             const CostIcon = costPercentage > 0 ? ChevronsUp : ChevronsDown;
             const sign = costPercentage > 0 ? '+' : '';
             return <span className={costColor}><CostIcon className="inline w-4 h-4 mr-1" />{sign}{costPercentage.toFixed(0)}% All Costs</span>;
    }
};

export const GolemCard: React.FC<GolemCardProps> = ({ golem, onToggle, isActive, canAfford, isLimitReached }) => {
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
                    <ul className="space-y-1">
                        {golem.effects.map((effect, index) => (
                            <li key={index}>
                                {formatEffect(effect)}
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
                    onClick={() => onToggle(golem.id)}
                    disabled={!isActive && (!canAfford || isLimitReached)}
                    variant={isActive ? 'destructive' : 'default'}
                >
                    {isActive ? 'Deactivate' : (isLimitReached ? 'Limit Reached' : 'Activate')}
                </Button>
            </CardFooter>
        </Card>
    );
};
