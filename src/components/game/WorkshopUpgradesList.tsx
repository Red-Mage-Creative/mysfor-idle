import React from 'react';
import { Currencies, WorkshopUpgrade } from '@/lib/gameTypes';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { currencyName, formatNumber } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { WORKSHOP_UPGRADE_COST_GROWTH_RATE } from '@/constants/gameConstants';

interface WorkshopUpgradesListProps {
    currencies: Currencies;
    onBuyWorkshopUpgrade: (upgradeId: string) => void;
    workshopUpgrades: WorkshopUpgrade[];
    onBuyAll: () => void;
}

const WorkshopUpgradesList = ({ currencies, onBuyWorkshopUpgrade, workshopUpgrades, onBuyAll }: WorkshopUpgradesListProps) => {
    const canAffordAny = workshopUpgrades.some(upgrade => {
        const costForNextLevel = Math.ceil(
            (upgrade.baseCost.cogwheelGears || 0) * Math.pow(WORKSHOP_UPGRADE_COST_GROWTH_RATE, upgrade.level)
        );
        return currencies.cogwheelGears >= costForNextLevel;
    });
    
    return (
        <Card className="w-full bg-card/80 backdrop-blur-sm border-2 border-yellow-400/20 shadow-lg">
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle className="text-3xl">Mechanical Workshop</CardTitle>
                    <CardDescription>
                        Use Cogwheel Gears to build powerful, temporary upgrades. These upgrades are reset upon prestiging.
                    </CardDescription>
                </div>
                 {workshopUpgrades.length > 0 && (
                    <Button onClick={onBuyAll} disabled={!canAffordAny}>Buy All Affordable</Button>
                )}
            </CardHeader>
            <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
                {workshopUpgrades.map(upgrade => {
                    const costForNextLevel = Math.ceil(
                        (upgrade.baseCost.cogwheelGears || 0) * Math.pow(WORKSHOP_UPGRADE_COST_GROWTH_RATE, upgrade.level)
                    );
                    const canAfford = currencies.cogwheelGears >= costForNextLevel;
                    const Icon = upgrade.icon;
                    
                    return (
                        <Card key={upgrade.id} className="flex flex-col sm:flex-row items-center p-3 transition-colors duration-300 hover:bg-secondary/80 border-2 border-yellow-400/30 bg-yellow-400/10">
                            <Icon className="w-12 h-12 text-yellow-400/80 mr-4 flex-shrink-0 mb-3 sm:mb-0" />
                            <div className="flex-grow text-center sm:text-left">
                                <p className="font-bold text-lg">{upgrade.name} (Lvl {upgrade.level})</p>
                                <p className="text-xs text-muted-foreground/80 italic">{upgrade.description}</p>
                                {upgrade.level > 0 && (
                                    <p className="text-sm mt-1 font-semibold text-green-400">
                                        Current bonus: +{formatNumber(upgrade.effect.value * upgrade.level * 100)}%
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-col items-center ml-0 sm:ml-4 mt-3 sm:mt-0 flex-shrink-0">
                                <Button
                                    onClick={() => onBuyWorkshopUpgrade(upgrade.id)}
                                    disabled={!canAfford}
                                    size="lg"
                                    className={cn("self-center min-w-[160px] text-center transition-all",
                                        canAfford && "bg-gradient-to-r from-yellow-500 to-amber-500 bg-[length:200%_auto] animate-background-shine text-primary-foreground hover:saturate-150"
                                    )}
                                >
                                    {canAfford ? 'Upgrade' : 'Cannot Afford'}
                                </Button>
                                <div className="mt-2 text-sm">
                                    <span className="text-muted-foreground">Cost: </span>
                                    <span className={cn("font-semibold", !canAfford && "text-muted-foreground/50")}>
                                        {formatNumber(costForNextLevel)} {currencyName('cogwheelGears')}
                                    </span>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </CardContent>
        </Card>
    );
};

export default WorkshopUpgradesList;
