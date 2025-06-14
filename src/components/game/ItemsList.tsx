
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ItemWithStats, Currencies, Currency } from '@/lib/gameTypes';
import { formatNumber, currencyName } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

interface ItemsListProps {
    currencies: Currencies;
    onBuyItem: (itemId: string) => void;
    itemCategories: Record<string, ItemWithStats[]>;
    categoryUnlockStatus: Record<string, boolean>;
}

const categoryTierStyles = {
    'Basic Magitech': 'border-primary/20',
    'Advanced Machinery': 'border-yellow-500/30',
    'Mystical Artifacts': 'border-purple-500/40',
};

const ItemsList = ({ currencies, onBuyItem, itemCategories, categoryUnlockStatus }: ItemsListProps) => {
    const hasAnyVisibleItems = Object.values(itemCategories).some(items => items.length > 0);

    return (
        <Card className="w-full bg-card/80 backdrop-blur-sm border-2 border-primary/20 shadow-lg">
            <CardHeader>
                <CardTitle className="text-3xl">Items</CardTitle>
                {!hasAnyVisibleItems && (
                    <p className="text-sm text-muted-foreground italic pt-2">
                        More items will be revealed as you progress...
                    </p>
                )}
            </CardHeader>
            <CardContent className="space-y-6 max-h-[60vh] overflow-y-auto">
                {Object.entries(itemCategories).map(([category, categoryItems]) => {
                    if (!categoryUnlockStatus[category as keyof typeof categoryUnlockStatus] || categoryItems.length === 0) return null;

                    return (
                        <div key={category}>
                            <h4 className="text-xl font-bold mb-3 text-secondary-foreground">{category}</h4>
                            <div className="space-y-4">
                                {categoryItems.map(item => {
                                    const canAfford = Object.entries(item.cost).every(([currency, cost]) => {
                                        return currencies[currency as Currency] >= cost;
                                    });
                                    return (
                                        <Card key={item.id} className={cn("flex items-center p-3 transition-colors hover:bg-secondary/50 border-2", categoryTierStyles[category as keyof typeof categoryTierStyles])}>
                                            <item.icon className="w-10 h-10 text-primary/80 mr-4 flex-shrink-0" />
                                            <div className="flex-grow">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-bold text-lg">{item.name}</p>
                                                        <p className="text-xs text-muted-foreground/80 italic">{item.description}</p>
                                                    </div>
                                                    <div className="text-right ml-2 flex-shrink-0 min-w-[60px]">
                                                        <p className="font-semibold text-xl">{item.level}</p>
                                                        <p className="text-sm text-muted-foreground">Level</p>
                                                         <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground mt-1" title={`Upgrades: ${item.upgradeStats.purchased} / ${item.upgradeStats.total}`}>
                                                            <Star className="w-3 h-3 text-yellow-400" />
                                                            <span>{item.upgradeStats.purchased}/{item.upgradeStats.total}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="mt-2 space-y-1 text-sm">
                                                    {Object.keys(item.totalProduction).length > 0 &&
                                                        <div>
                                                            <span className="text-muted-foreground">Total Gen: </span>
                                                            {Object.entries(item.totalProduction).map(([curr, val]) => (
                                                                <span key={curr} className="font-semibold text-foreground/90">
                                                                    {formatNumber(val || 0)} {currencyName(curr as Currency)}/s
                                                                </span>
                                                            ))}
                                                        </div>
                                                    }
                                                    {item.clickBonus && item.level > 0 ?
                                                        <div>
                                                            <span className="text-muted-foreground">Total Click: </span>
                                                            <span className="font-semibold text-foreground/90">+{formatNumber(item.totalClickBonus)} Mana</span>
                                                        </div> : null
                                                    }
                                                    <div>
                                                        <span className="text-muted-foreground">Cost: </span>
                                                        {Object.entries(item.cost).map(([curr, val], index) => (
                                                            <span key={curr} className="font-semibold text-foreground/90">
                                                                {formatNumber(val || 0)} {currencyName(curr as Currency)}
                                                                {index < Object.keys(item.cost).length - 1 ? ', ' : ''}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <Button
                                                onClick={() => onBuyItem(item.id)}
                                                disabled={!canAfford}
                                                size="sm"
                                                className="self-center ml-4"
                                            >
                                                Buy
                                            </Button>
                                        </Card>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </CardContent>
        </Card>
    );
};

export default ItemsList;
