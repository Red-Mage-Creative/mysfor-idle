
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ItemWithStats, Currencies, Currency, CurrencyRecord } from '@/lib/gameTypes';
import { formatNumber, currencyName } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';
import { initialItems } from '@/lib/initialItems';
import { BulkQuantitySelector } from '@/components/game/BulkQuantitySelector';

export interface PurchaseDetails {
    purchaseQuantity: number;
    purchaseCost: CurrencyRecord;
    canAffordPurchase: boolean;
    nextLevelTarget: number | null;
    displayQuantity: string;
}

interface ItemsListProps {
    currencies: Currencies;
    onBuyItem: (itemId: string) => void;
    itemCategories: Record<string, ItemWithStats[]>;
    categoryUnlockStatus: Record<string, boolean>;
    itemPurchaseDetails: Map<string, PurchaseDetails>;
}

const categoryTierStyles = {
    'Basic Magitech': 'border-primary/30 bg-primary/10',
    'Advanced Machinery': 'border-yellow-400/30 bg-yellow-400/10',
    'Mystical Artifacts': 'border-fuchsia-400/40 bg-fuchsia-400/10',
};

const iconMap = new Map(initialItems.map(item => [item.id, item.icon]));

const ItemsList = ({ currencies, onBuyItem, itemCategories, categoryUnlockStatus, itemPurchaseDetails }: ItemsListProps) => {
    const hasAnyVisibleItems = Object.values(itemCategories).some(items => items.length > 0);

    return (
        <Card className="w-full bg-card/80 backdrop-blur-sm border-2 border-primary/20 shadow-lg">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="text-3xl">Items</CardTitle>
                    <BulkQuantitySelector />
                </div>
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
                                    const details = itemPurchaseDetails.get(item.id);
                                    const canAfford = details?.canAffordPurchase ?? false;

                                    const isComplete = item.upgradeStats.total > 0 && item.upgradeStats.purchased === item.upgradeStats.total;
                                    const Icon = iconMap.get(item.id);

                                    if (!Icon) {
                                      return null; // Don't render if icon is not found
                                    }
                                    
                                    return (
                                        <Card key={item.id} className={cn("flex items-center p-3 transition-colors duration-300 hover:bg-secondary/80 border-2", categoryTierStyles[category as keyof typeof categoryTierStyles])}>
                                            <Icon className="w-10 h-10 text-primary/80 mr-4 flex-shrink-0" />
                                            <div className="flex-grow">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-bold text-lg">{item.name}</p>
                                                        <p className="text-xs text-muted-foreground/80 italic">{item.description}</p>
                                                        {item.upgradeStats.purchased > 0 && (
                                                            <div className="flex items-center gap-1 mt-2" aria-label={`${item.upgradeStats.purchased} upgrades purchased`}>
                                                                {Array.from({ length: item.upgradeStats.purchased }).map((_, i) => (
                                                                    <Star
                                                                        key={i}
                                                                        className={cn(
                                                                            "w-4 h-4",
                                                                            isComplete
                                                                                ? "text-green-400 fill-green-400"
                                                                                : "text-yellow-400 fill-yellow-400"
                                                                        )}
                                                                        strokeWidth={1.5}
                                                                    />
                                                                ))}
                                                                {isComplete && (
                                                                    <span className="text-xs font-bold text-green-400 ml-1">COMPLETE</span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-right ml-2 flex-shrink-0">
                                                        <p className="font-semibold text-lg text-muted-foreground">
                                                            Level <span className="text-xl text-foreground font-bold">{item.level}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                <div className="mt-2 space-y-1 text-sm">
                                                    {Object.keys(item.productionPerLevel).length > 0 && (
                                                        <div>
                                                            <span className="text-muted-foreground">Per Lvl: </span>
                                                            {Object.entries(item.productionPerLevel).map(([curr, val], idx) => (
                                                                <span key={curr} className="font-semibold text-foreground/90">
                                                                    {formatNumber(val || 0)} {currencyName(curr as Currency)}/s
                                                                    {idx < Object.keys(item.productionPerLevel).length - 1 ? ', ' : ''}
                                                                </span>
                                                            ))}
                                                            {item.level > 0 && (
                                                                <>
                                                                    <span className="text-muted-foreground mx-2">|</span>
                                                                    <span className="text-muted-foreground">Total: </span>
                                                                    {Object.entries(item.totalProduction).map(([curr, val], idx) => (
                                                                        <span key={curr} className="font-semibold text-foreground/90">
                                                                            {formatNumber(val || 0)} {currencyName(curr as Currency)}/s
                                                                            {idx < Object.keys(item.totalProduction).length - 1 ? ', ' : ''}
                                                                        </span>
                                                                    ))}
                                                                </>
                                                            )}
                                                        </div>
                                                    )}
                                                    {item.clickBonus ? (
                                                        <div>
                                                            <span className="text-muted-foreground">Per Lvl: </span>
                                                            <span className="font-semibold text-foreground/90">+{formatNumber(item.clickBonusPerLevel)} Mana</span>
                                                            {item.level > 0 && (
                                                                <>
                                                                    <span className="text-muted-foreground mx-2">|</span>
                                                                    <span className="text-muted-foreground">Total: </span>
                                                                    <span className="font-semibold text-foreground/90">+{formatNumber(item.totalClickBonus)} Mana</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    ) : null}
                                                    <div>
                                                        <span className="text-muted-foreground">Cost: </span>
                                                        {details && details.canAffordPurchase && Object.keys(details.purchaseCost).length > 0 ? (
                                                            Object.entries(details.purchaseCost).map(([curr, val], index) => (
                                                                <span key={curr} className="font-semibold text-foreground/90">
                                                                    {formatNumber(val || 0)} {currencyName(curr as Currency)}
                                                                    {index < Object.keys(details.purchaseCost).length - 1 ? ', ' : ''}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            Object.entries(item.cost).map(([curr, val], index) => (
                                                                <span key={curr} className="font-semibold text-muted-foreground/50">
                                                                    {formatNumber(val || 0)} {currencyName(curr as Currency)}
                                                                    {index < Object.keys(item.cost).length - 1 ? ', ' : ''}
                                                                </span>
                                                            ))
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <Button
                                                onClick={() => onBuyItem(item.id)}
                                                disabled={!canAfford}
                                                size="lg"
                                                className={cn("self-center ml-4 min-w-[140px] text-center transition-all",
                                                   canAfford && "bg-gradient-to-r from-primary via-fuchsia-500 to-primary bg-[length:200%_auto] animate-background-shine text-primary-foreground hover:saturate-150"
                                                )}
                                            >
                                                {canAfford && details ? `Buy ${details.displayQuantity}` : 'Cannot Afford'}
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
