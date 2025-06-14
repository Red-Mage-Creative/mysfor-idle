
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WorkshopUpgrade, Currencies, Currency } from '@/lib/gameTypes';
import { formatNumber, currencyName } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface WorkshopUpgradesListProps {
    currencies: Currencies;
    onBuyWorkshopUpgrade: (upgradeId: string) => void;
    availableWorkshopUpgrades: WorkshopUpgrade[];
}

const WorkshopUpgradesList = ({ currencies, onBuyWorkshopUpgrade, availableWorkshopUpgrades }: WorkshopUpgradesListProps) => {
    return (
        <Card className="w-full bg-card/80 backdrop-blur-sm border-2 border-yellow-400/20 shadow-lg">
            <CardHeader>
                <CardTitle className="text-3xl">Mechanical Workshop</CardTitle>
                <CardDescription>
                    Purchase powerful, temporary upgrades with gears and other resources. These upgrades are reset upon prestiging.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
                {availableWorkshopUpgrades.length === 0 && (
                    <p className="text-sm text-muted-foreground italic pt-2">All workshop upgrades purchased!</p>
                )}
                {availableWorkshopUpgrades.map(upgrade => {
                    const canAfford = Object.entries(upgrade.cost).every(([currency, cost]) => {
                        return currencies[currency as Currency] >= cost;
                    });
                    const Icon = upgrade.icon;
                    
                    if (typeof Icon !== 'function') {
                        console.error("Workshop Upgrade has an invalid icon component:", upgrade);
                        return (
                             <Card key={upgrade.id} className="flex items-center p-3 transition-colors duration-300 border-2 border-red-500/50 bg-red-500/10">
                                <div className="flex-grow">
                                    <p className="font-bold text-lg text-red-400">Error: Corrupted Upgrade</p>
                                    <p className="text-xs text-muted-foreground/80 italic">{upgrade.id || 'Unknown ID'}</p>
                                    <p className="text-sm text-red-300/80 mt-2">This upgrade data seems to be corrupted. This may resolve on a page refresh.</p>
                                </div>
                            </Card>
                        )
                    }

                    return (
                        <Card key={upgrade.id} className="flex items-center p-3 transition-colors duration-300 hover:bg-secondary/80 border-2 border-yellow-400/30 bg-yellow-400/10">
                            <Icon className="w-10 h-10 text-yellow-400/80 mr-4 flex-shrink-0" />
                            <div className="flex-grow">
                                <p className="font-bold text-lg">{upgrade.name}</p>
                                <p className="text-xs text-muted-foreground/80 italic">{upgrade.description}</p>
                                <div className="mt-2 text-sm">
                                    <span className="text-muted-foreground">Cost: </span>
                                    {Object.entries(upgrade.cost).map(([curr, val], index) => (
                                        <span key={curr} className={cn("font-semibold", !canAfford && "text-muted-foreground/50")}>
                                            {formatNumber(val || 0)} {currencyName(curr as Currency)}
                                            {index < Object.keys(upgrade.cost).length - 1 ? ', ' : ''}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <Button
                                onClick={() => onBuyWorkshopUpgrade(upgrade.id)}
                                disabled={!canAfford}
                                size="lg"
                                className={cn("self-center ml-4 min-w-[140px] text-center transition-all",
                                    canAfford && "bg-gradient-to-r from-yellow-500 to-amber-500 bg-[length:200%_auto] animate-background-shine text-primary-foreground hover:saturate-150"
                                )}
                            >
                                {canAfford ? `Purchase` : 'Cannot Afford'}
                            </Button>
                        </Card>
                    );
                })}
            </CardContent>
        </Card>
    );
};

export default WorkshopUpgradesList;
