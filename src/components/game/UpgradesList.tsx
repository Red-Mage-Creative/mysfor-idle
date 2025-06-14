
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upgrade, Currencies, Currency } from '@/lib/gameTypes';
import { formatNumber, currencyName } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface UpgradesListProps {
    currencies: Currencies;
    onBuyUpgrade: (upgradeId: string) => void;
    upgradeCategories: Record<string, Upgrade[]>;
    categoryUnlockStatus: Record<string, boolean>;
}

const categoryTierStyles = {
    'Basic Magitech': 'border-primary/20',
    'Advanced Machinery': 'border-yellow-500/30',
    'Mystical Artifacts': 'border-purple-500/40',
};

const UpgradesList = ({ currencies, onBuyUpgrade, upgradeCategories, categoryUnlockStatus }: UpgradesListProps) => {
    return (
        <Card className="w-full bg-card/80 backdrop-blur-sm border-2 border-primary/20 shadow-lg">
            <CardHeader>
                <CardTitle className="text-3xl">Upgrades</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 max-h-[60vh] overflow-y-auto">
                {Object.entries(upgradeCategories).map(([category, categoryUpgrades]) => {
                    if (!categoryUnlockStatus[category as keyof typeof categoryUnlockStatus]) return null;

                    return (
                        <div key={category}>
                            <h4 className="text-xl font-bold mb-3 text-secondary-foreground">{category}</h4>
                            {categoryUpgrades.length > 0 ? (
                                <div className="space-y-4">
                                    {categoryUpgrades.map(upgrade => {
                                        const canAfford = Object.entries(upgrade.cost).every(([currency, cost]) => {
                                            return currencies[currency as Currency] >= cost;
                                        });
                                        return (
                                            <Card key={upgrade.id} className={cn("flex items-center p-3 transition-colors hover:bg-secondary/50 border-2", categoryTierStyles[category as keyof typeof categoryTierStyles])}>
                                                <upgrade.icon className="w-10 h-10 text-primary/80 mr-4 flex-shrink-0" />
                                                <div className="flex-grow">
                                                    <p className="font-bold text-lg">{upgrade.name}</p>
                                                    <p className="text-xs text-muted-foreground/80 italic">{upgrade.description}</p>
                                                    <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
                                                        <span>Cost:</span>
                                                        {Object.entries(upgrade.cost).map(([curr, val]) => (
                                                            <span key={curr} className="flex items-center gap-1 font-semibold">
                                                                {formatNumber(val || 0)} {currencyName(curr as Currency)}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="text-right mr-4">
                                                    <p className="font-semibold text-xl">{upgrade.level}</p>
                                                    <p className="text-sm text-muted-foreground">Level</p>
                                                </div>
                                                <Button
                                                    onClick={() => onBuyUpgrade(upgrade.id)}
                                                    disabled={!canAfford}
                                                    size="sm"
                                                >
                                                    Buy
                                                </Button>
                                            </Card>
                                        )
                                    })}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground italic px-3">
                                    More upgrades will be revealed as you progress...
                                </p>
                            )}
                        </div>
                    )
                })}
            </CardContent>
        </Card>
    );
};

export default UpgradesList;
