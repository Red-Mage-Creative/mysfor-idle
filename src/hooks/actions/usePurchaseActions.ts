
import { useCallback } from 'react';
import { toast } from '@/components/ui/sonner';
import { Currency } from '@/lib/gameTypes';
import type { GameActionProps } from './types';

const WORKSHOP_UPGRADE_COST_GROWTH_RATE = 1.25;

export const usePurchaseActions = (props: GameActionProps) => {
    const {
        currencies, setCurrencies,
        items, setItems,
        itemUpgrades, setItemUpgrades,
        workshopUpgrades, setWorkshopUpgrades,
        itemPurchaseDetails,
        prestigeMultipliers,
        debouncedSave,
        immediateSave,
    } = props;

    const handleBuyItem = useCallback((itemId: string) => {
        const details = itemPurchaseDetails.get(itemId);
        const item = items.find(i => i.id === itemId);

        if (!details || !item || !details.canAffordPurchase || details.purchaseQuantity <= 0) {
            return;
        }
        
        const { purchaseQuantity, purchaseCost } = details;

        setCurrencies(prev => {
            const newCurrencies = { ...prev };
            for (const currency in purchaseCost) {
                const key = currency as Currency;
                newCurrencies[key] -= purchaseCost[key] || 0;
            }
            return newCurrencies;
        });
        
        setItems(prevItems =>
          prevItems.map(i => {
            if (i.id !== itemId) return i;

            const newLevel = i.level + purchaseQuantity;
            const newCost = { ...i.cost };
            for (const currency in i.baseCost) {
                const key = currency as Currency;
                const base = i.baseCost[key] || 0;
                newCost[key] = Math.ceil(base * Math.pow(1.15, newLevel));
            }

            return {
              ...i,
              level: newLevel,
              cost: newCost,
            };
          })
        );
        debouncedSave();
    }, [items, itemPurchaseDetails, setCurrencies, setItems, debouncedSave]);
    
    const handleBuyItemUpgrade = useCallback((upgradeId: string) => {
        const upgrade = itemUpgrades.find(u => u.id === upgradeId);
        if (!upgrade || upgrade.purchased) return;
        
        const canAfford = Object.entries(upgrade.cost).every(([currency, cost]) => {
            const actualCost = Math.ceil((cost || 0) * prestigeMultipliers.costReduction);
            return currencies[currency as Currency] >= actualCost;
        });

        if (!canAfford) {
            toast.error("Not enough resources.");
            return;
        }

        setCurrencies(prev => {
            const newCurrencies = { ...prev };
            for (const currency in upgrade.cost) {
                const actualCost = Math.ceil((upgrade.cost[currency as Currency] || 0) * prestigeMultipliers.costReduction);
                newCurrencies[currency as Currency] -= actualCost;
            }
            return newCurrencies;
        });

        setItemUpgrades(prev => prev.map(u => u.id === upgradeId ? {...u, purchased: true} : u));
        
        toast.success("Item Upgraded!", {
          description: `You have purchased ${upgrade.name}.`,
        });
        immediateSave();
    }, [currencies, itemUpgrades, immediateSave, setItemUpgrades, setCurrencies, prestigeMultipliers.costReduction]);
    
    const handleBuyWorkshopUpgrade = useCallback((upgradeId: string) => {
        const upgrade = workshopUpgrades.find(u => u.id === upgradeId);
        if (!upgrade) return;

        const costForNextLevel = Math.ceil(
            (upgrade.baseCost.cogwheelGears || 0) * Math.pow(WORKSHOP_UPGRADE_COST_GROWTH_RATE, upgrade.level)
        );
        
        const canAfford = currencies.cogwheelGears >= costForNextLevel;

        if (!canAfford) {
            toast.error("Not enough Cogwheel Gears.");
            return;
        }

        setCurrencies(prev => ({
            ...prev,
            cogwheelGears: prev.cogwheelGears - costForNextLevel,
        }));

        setWorkshopUpgrades(prev => prev.map(u => {
            if (u.id === upgradeId) {
                const newLevel = u.level + 1;
                return {
                    ...u,
                    level: newLevel,
                    cost: { cogwheelGears: Math.ceil((u.baseCost.cogwheelGears || 0) * Math.pow(WORKSHOP_UPGRADE_COST_GROWTH_RATE, newLevel)) }
                };
            }
            return u;
        }));
        
        debouncedSave();
    }, [currencies.cogwheelGears, workshopUpgrades, setCurrencies, setWorkshopUpgrades, debouncedSave]);

    return {
        handleBuyItem,
        handleBuyItemUpgrade,
        handleBuyWorkshopUpgrade,
    };
};
