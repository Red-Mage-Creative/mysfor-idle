
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ItemWithStats, Currencies, Currency, CurrencyRecord, PurchaseDetails } from '@/lib/gameTypes';
import { formatNumber, currencyName } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { Star, ChevronsUp, ChevronsDown, Zap, HelpCircle } from 'lucide-react';
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
    overclockInfo: OverclockInfo;
    onSetOverclockLevel: (level: number) => void;
}

const categoryTierStyles = {
    'Basic Magitech': 'border-primary/30 bg-primary/10',
    'Advanced Machinery': 'border-yellow-400/30 bg-yellow-400/10',
    'Mystical Artifacts': 'border-fuchsia-400/40 bg-fuchsia-400/10',
};

const iconMap = new Map(initialItems.map(item => [item.id, item.icon]));

const OverclockControls = ({ overclockInfo, onSetOverclockLevel }: { overclockInfo: OverclockInfo; onSetOverclockLevel: (level: number) => void; }) => {
    if (!overclockInfo.isUnlocked) {
        return null;
    }

    const { currentLevel, maxLevelUnlocked, speedMultiplier, gearDrainPerSecond } = overclockInfo;

    return (
        <TooltipProvider>
            <div className="flex items-center gap-4 border-2 border-fuchsia-500/50 rounded-lg p-2 bg-background/50">
                <div className="flex items-center gap-2">
                     <Zap className={cn("w-6 h-6", currentLevel > 0 ? "text-yellow-400 animate-pulse" : "text-muted-foreground")} />
                     <div>
                        <div className="font-bold text-lg flex items-center gap-1.5">
                            Overclock
                             <Tooltip>
                                <TooltipTrigger asChild><HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" /></TooltipTrigger>
                                <TooltipContent>
                                    <p className="max-w-xs">
                                        Use gears to boost all production. Unlock more levels via Clockwork Automaton upgrades.
                                        Be careful, as higher levels consume gears much faster!
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                        <p className="text-xs text-muted-foreground">Level {currentLevel} / {maxLevelUnlocked}</p>
                     </div>
                </div>
                <div className="text-center">
                    <p className="font-semibold text-green-400">x{speedMultiplier.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Speed</p>
                </div>
                <div className="text-center">
                    <p className="font-semibold text-red-400">-{formatNumber(gearDrainPerSecond)}</p>
                    <p className="text-xs text-muted-foreground">Gears/s</p>
                </div>
                <div className="flex items-center gap-1">
                     <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => onSetOverclockLevel(currentLevel - 1)}
                                disabled={currentLevel === 0}
                            >
                                <ChevronsDown className="w-5 h-5" />
                            </Button>
                        </TooltipTrigger>
                         <TooltipContent><p>Shift Down</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                             <Button
                                variant="outline"
                                size="icon"
                                onClick={() => onSetOverclockLevel(currentLevel + 1)}
                                disabled={currentLevel >= maxLevelUnlocked}
                            >
                                <ChevronsUp className="w-5 h-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Shift Up</p></TooltipContent>
                    </Tooltip>
                </div>
            </div>
        </TooltipProvider>
    );
};


const ItemsList = ({ currencies, onBuyItem, itemCategories, categoryUnlockStatus, itemPurchaseDetails, overclockInfo, onSetOverclockLevel }: ItemsListProps) => {
    const hasAnyVisibleItems = Object.values(itemCategories).some(items => items.length > 0);

    return (
        <Card className="w-full bg-card/80 backdrop-blur-sm border-2 border-primary/20 shadow-lg">
            <CardHeader>
                <div className="flex justify-between items-center gap-4">
                    <CardTitle className="text-3xl">Items</CardTitle>
                    <OverclockControls overclockInfo={overclockInfo} onSetOverclockLevel={onSetOverclockLevel} />
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
                                    const isBulkPurchase = details && details.intendedPurchaseQuantity > 1;

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
