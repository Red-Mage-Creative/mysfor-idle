import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ItemWithStats, Currencies, Currency, CurrencyRecord, PurchaseDetails } from '@/lib/gameTypes';
import { formatNumber, currencyName } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { Star, ChevronsUp, ChevronsDown, Zap, HelpCircle, Lock } from 'lucide-react';
import { initialItems } from '@/lib/initialItems';
import { BulkQuantitySelector } from '@/components/game/BulkQuantitySelector';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface OverclockInfo {
    currentLevel: number;
    maxLevelUnlocked: number;
    speedMultiplier: number;
    gearDrainPerSecond: number;
    isUnlocked: boolean;
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
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <CardTitle className="text-3xl">Items</CardTitle>
                    <div className="flex flex-col items-center lg:items-end gap-2">
                        <BulkQuantitySelector />
                    </div>
                </div>
                {!hasAnyVisibleItems && (
                    <p className="text-sm text-muted-foreground italic pt-2">
                        More items will be revealed as you progress...
                    </p>
                )}
            </CardHeader>
            <CardContent className="space-y-6 max-h-[60vh] overflow-y-auto">
                {Object.entries(itemCategories).map(([category, categoryItems]) => {
                    const isUnlocked = categoryUnlockStatus[category as keyof typeof categoryUnlockStatus];
                    
                    if (!isUnlocked) {
                        // Only show the locked 'Transcendent Artifacts' category
                        if (category === 'Transcendent Artifacts') {
                            return (
                                <div key={category}>
                                    <h4 className="text-xl font-bold mb-3 text-secondary-foreground opacity-50">{category}</h4>
                                    <Card className="flex items-center justify-center p-6 text-center border-2 border-dashed border-muted-foreground/30 bg-muted/20">
                                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                            <Lock className="w-8 h-8" />
                                            <p className="font-bold text-lg">Category Locked</p>
                                            <p className="text-sm">This category unlocks after you Prestige or discover a specific artifact.</p>
                                        </div>
                                    </Card>
                                </div>
                            );
                        }
                        // Hide other locked categories to keep changes minimal
                        return null;
                    }

                    if (categoryItems.length === 0) {
                        return null;
                    }

                    return (
                        <div key={category}>
                            <h4 className="text-xl font-bold mb-3 text-secondary-foreground">{category}</h4>
                            <div className="space-y-4">
                                {categoryItems.map(item => {
                                    const details = itemPurchaseDetails.get(item.id);
                                    const canAfford = details?.canAffordPurchase ?? false;
                                    const isBulkPurchase = details && details.intendedPurchaseQuantity > 1;

                                    const isComplete = item.upgradeStats.total > 0 && item.upgradeStats.purchased === item.upgradeStats.total;
                                    const Icon = iconMap.get(item.id);

                                    if (!Icon) {
                                      return null; // Don't render if icon is not found
                                    }
                                    
                                    return (
                                        <Card key={item.id} className={cn("p-3 transition-colors duration-300 hover:bg-secondary/80 border-2", categoryTierStyles[category as keyof typeof categoryTierStyles])}>
                                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                                <div className="flex items-start w-full gap-4">
                                                    <Icon className="w-10 h-10 text-primary/80 flex-shrink-0 mt-1" />
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
                                                                            <span className="text-muted-foreground">Generating: </span>
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
                                                                    <span className="font-semibold text-foreground/90">+{formatNumber(item.clickBonusPerLevel)} Mana / click</span>
                                                                    {item.level > 0 && (
                                                                        <>
                                                                            <span className="text-muted-foreground mx-2">|</span>
                                                                            <span className="text-muted-foreground">Total Bonus: </span>
                                                                            <span className="font-semibold text-foreground/90">+{formatNumber(item.totalClickBonus)} Mana / click</span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            ) : null}
                                                            <div className="flex items-baseline flex-wrap gap-x-1.5">
                                                                {isBulkPurchase && details ? (
                                                                    <>
                                                                        <span className="text-muted-foreground">Cost (Each):</span>
                                                                        {Object.entries(item.cost).map(([curr, val], index, arr) => (
                                                                            <span key={curr} className="font-semibold text-foreground/90">
                                                                                {formatNumber(val || 0)} {currencyName(curr as Currency)}{index < arr.length - 1 ? ',' : ''}
                                                                            </span>
                                                                        ))}
                                                                        <span className="text-muted-foreground mx-1">|</span>
                                                                        <span className="text-muted-foreground">Total Cost:</span>
                                                                        {Object.entries(details.intendedPurchaseCost).map(([curr, val], index, arr) => (
                                                                            <span key={curr} className={cn("font-semibold", canAfford ? "text-foreground/90" : "text-red-400/80")}>
                                                                                {formatNumber(val || 0)} {currencyName(curr as Currency)}{index < arr.length - 1 ? ',' : ''}
                                                                            </span>
                                                                        ))}
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <span className="text-muted-foreground">Cost:</span>
                                                                        {details && Object.entries(details.intendedPurchaseCost).length > 0 ? (
                                                                            Object.entries(details.intendedPurchaseCost).map(([curr, val], index, arr) => (
                                                                                <span key={curr} className={cn("font-semibold", canAfford ? "text-foreground/90" : "text-muted-foreground/50")}>
                                                                                    {formatNumber(val || 0)} {currencyName(curr as Currency)}{index < arr.length - 1 ? ',' : ''}
                                                                                </span>
                                                                            ))
                                                                        ) : (
                                                                             Object.entries(item.cost).map(([curr, val], index, arr) => (
                                                                                <span key={curr} className="font-semibold text-muted-foreground/50">
                                                                                    {formatNumber(val || 0)} {currencyName(curr as Currency)}{index < arr.length - 1 ? ',' : ''}
                                                                                </span>
                                                                            ))
                                                                        )}
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button
                                                    onClick={() => onBuyItem(item.id)}
                                                    disabled={!canAfford}
                                                    size="lg"
                                                    className={cn("self-stretch sm:self-center min-w-[140px] text-center transition-all",
                                                    canAfford && "bg-gradient-to-r from-primary via-fuchsia-500 to-primary bg-[length:200%_auto] animate-background-shine text-primary-foreground hover:saturate-150"
                                                    )}
                                                >
                                                    {canAfford && details ? `Buy ${details.displayQuantity}` : 'Cannot Afford'}
                                                </Button>
                                            </div>
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
