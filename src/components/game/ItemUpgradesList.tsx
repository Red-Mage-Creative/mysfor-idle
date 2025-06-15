
import React from 'react';
import { Currencies, ItemUpgrade, Currency } from '@/lib/gameTypes';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { currencyName, formatNumber } from '@/lib/formatters';
import { initialItems } from '@/lib/initialItems';
import { useGameCalculations } from '@/hooks/useGameCalculations';
import { ArrowUp } from 'lucide-react';

interface ItemUpgradesListProps {
    currencies: Currencies;
    onBuyItemUpgrade: (upgradeId: string) => void;
    availableItemUpgrades: ItemUpgrade[];
    prestigeMultipliers: ReturnType<typeof useGameCalculations>['prestigeMultipliers'];
    onBuyAll: () => void;
}

const iconMap = new Map(initialItems.map(item => [item.id, item.icon]));

const ItemUpgradesList = ({ currencies, onBuyItemUpgrade, availableItemUpgrades, prestigeMultipliers, onBuyAll }: ItemUpgradesListProps) => {
    const canAffordAny = availableItemUpgrades.some(upgrade => {
        return Object.entries(upgrade.cost).every(([currency, cost]) => {
            const actualCost = Math.ceil((cost || 0) * prestigeMultipliers.costReduction);
            return currencies[currency as Currency] >= actualCost;
        });
    });

    return (
        <Card className="w-full bg-card/80 backdrop-blur-sm border-2 border-green-500/30 shadow-lg">
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle className="text-3xl">Item Upgrades</CardTitle>
                    {availableItemUpgrades.length === 0 && (
                        <p className="text-sm text-muted-foreground italic pt-2">
                            New upgrades will appear here as you level up your items.
                        </p>
                    )}
                </div>
                {availableItemUpgrades.length > 0 && (
                    <Button onClick={onBuyAll} disabled={!canAffordAny}>Buy All Affordable</Button>
                )}
            </CardHeader>
            <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
                {availableItemUpgrades.map(upgrade => {
                    const canAfford = Object.entries(upgrade.cost).every(([currency, cost]) => {
                        const actualCost = Math.ceil((cost || 0) * prestigeMultipliers.costReduction);
                        return currencies[currency as Currency] >= actualCost;
                    });
                    const Icon = iconMap.get(upgrade.parentItemId);

                    if (!Icon) {
                      return null; // Don't render if icon is not found
                    }

                    return (
                        <Card key={upgrade.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 transition-colors hover:bg-secondary/50 border-2 border-dashed border-green-500/40">
                             <div className="relative mr-4 flex-shrink-0">
                                <Icon className="w-10 h-10 text-primary/80" />
                                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5 border-2 border-card">
                                    <ArrowUp className="w-3 h-3 text-white" />
                                </div>
                            </div>
                            <div className="flex-grow">
                                <p className="font-bold text-lg">{upgrade.name}</p>
                                <p className="text-xs text-muted-foreground/80 italic">{upgrade.description}</p>
                                <div className="mt-2 text-sm">
                                    <span className="text-muted-foreground">Cost: </span>
                                    {Object.entries(upgrade.cost).map(([curr, val], index) => (
                                        <span key={curr} className="font-semibold text-foreground/90">
                                            {formatNumber(Math.ceil((val || 0) * prestigeMultipliers.costReduction))} {currencyName(curr as Currency)}
                                            {index < Object.keys(upgrade.cost).length - 1 ? ', ' : ''}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <Button
                                onClick={() => onBuyItemUpgrade(upgrade.id)}
                                disabled={!canAfford}
                                size="sm"
                                variant="secondary"
                                className="self-stretch sm:self-auto sm:ml-auto"
                            >
                                Buy
                            </Button>
                        </Card>
                    )
                })}
            </CardContent>
        </Card>
    );
};

export default ItemUpgradesList;
