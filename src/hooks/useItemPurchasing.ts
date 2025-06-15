
import { useMemo } from 'react';
import { Item, Currencies, Currency, CurrencyRecord, PurchaseDetails } from '@/lib/gameTypes';
import * as C from '@/constants/gameConstants';
import { BuyQuantity } from '@/hooks/useGameState';

const UPGRADE_THRESHOLDS = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000];

const calculateBulkCost = (item: Item, quantity: number, costMultiplier: number): CurrencyRecord => {
    if (quantity <= 0) return {};
    
    const totalCost: CurrencyRecord = {};
    
    for (const currency in item.baseCost) {
        totalCost[currency as Currency] = 0;
    }

    let currentLevel = item.level;
    for (let i = 0; i < quantity; i++) {
        for (const currency in item.baseCost) {
            const key = currency as Currency;
            const base = item.baseCost[key] || 0;
            const costForThisLevel = Math.ceil(base * Math.pow(C.ITEM_COST_GROWTH_RATE, currentLevel + i) * costMultiplier);
            totalCost[key] = (totalCost[key] || 0) + costForThisLevel;
        }
    }

    return totalCost;
};

const calculateMaxAffordable = (item: Item, currentCurrencies: Currencies, costMultiplier: number): number => {
    let affordableLevels = 0;
    const tempCurrencies = { ...currentCurrencies };

    while (true) {
        const nextLevel = item.level + affordableLevels;
        const nextLevelCost: CurrencyRecord = {};
        let canAffordNext = true;

        for (const currency in item.baseCost) {
            const key = currency as Currency;
            const base = item.baseCost[key] || 0;
            const cost = Math.ceil(base * Math.pow(C.ITEM_COST_GROWTH_RATE, nextLevel) * costMultiplier);
            nextLevelCost[key] = cost;
            if ((tempCurrencies[key] || 0) < cost) {
                canAffordNext = false;
                break;
            }
        }
        
        if (canAffordNext) {
            Object.entries(nextLevelCost).forEach(([c, cost]) => {
                const key = c as Currency;
                tempCurrencies[key] = (tempCurrencies[key] || 0) - (cost || 0);
            });
            affordableLevels++;
        } else {
            break;
        }
    }
    return affordableLevels;
};

type UseItemPurchasingProps = {
    items: Item[];
    currencies: Currencies;
    buyQuantity: BuyQuantity;
    costMultiplier: number;
};

export const useItemPurchasing = ({ items, currencies, buyQuantity, costMultiplier }: UseItemPurchasingProps) => {
    const itemPurchaseDetails = useMemo(() => {
        const detailsMap = new Map<string, PurchaseDetails>();

        for (const item of items) {
            const maxAffordable = calculateMaxAffordable(item, currencies, costMultiplier);
            
            let intendedPurchaseQuantity = 0;
            let purchaseQuantity = 0;
            let displayQuantity = '';
            let nextLevelTarget: number | null = null;
            
            if (buyQuantity === 'max') {
                intendedPurchaseQuantity = maxAffordable;
            } else if (buyQuantity === 'next') {
                const nextThreshold = UPGRADE_THRESHOLDS.find(t => t > item.level);
                if (nextThreshold) {
                    const quantityToNext = nextThreshold - item.level;
                    intendedPurchaseQuantity = quantityToNext > 0 ? quantityToNext : 1;
                    nextLevelTarget = nextThreshold;
                } else {
                    intendedPurchaseQuantity = 1;
                }
            } else {
                intendedPurchaseQuantity = buyQuantity;
            }

            let canAffordIntended = maxAffordable >= intendedPurchaseQuantity;
            if (buyQuantity === 'max') {
                canAffordIntended = maxAffordable > 0;
            }
            
            if (buyQuantity === 'max') {
                purchaseQuantity = maxAffordable;
            } else if (canAffordIntended) {
                purchaseQuantity = intendedPurchaseQuantity;
            }
            
            const intendedPurchaseCost = calculateBulkCost(item, intendedPurchaseQuantity, costMultiplier);
            const purchaseCost = calculateBulkCost(item, purchaseQuantity, costMultiplier);

            if (nextLevelTarget) {
                displayQuantity = `to Lvl ${nextLevelTarget}`;
            } else if (buyQuantity === 'max') {
                displayQuantity = `${purchaseQuantity} Lvl${purchaseQuantity !== 1 ? 's' : ''}`;
            } else {
                displayQuantity = `${intendedPurchaseQuantity} Lvl${intendedPurchaseQuantity !== 1 ? 's' : ''}`;
            }

            detailsMap.set(item.id, {
                purchaseQuantity,
                purchaseCost,
                canAffordPurchase: canAffordIntended,
                nextLevelTarget,
                displayQuantity,
                intendedPurchaseQuantity,
                intendedPurchaseCost,
            });
        }
        return detailsMap;
    }, [items, currencies, buyQuantity, costMultiplier]);

    return { itemPurchaseDetails };
};
