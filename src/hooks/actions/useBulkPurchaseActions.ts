
import { useCallback } from 'react';
import { toast } from '@/components/ui/sonner';
import { Currency, ItemUpgrade, WorkshopUpgrade } from '@/lib/gameTypes';
import type { GameActionProps } from './types';

const WORKSHOP_UPGRADE_COST_GROWTH_RATE = 1.25;

export const useBulkPurchaseActions = (props: GameActionProps) => {
    const {
        currencies, setCurrencies,
        items,
        itemUpgrades, setItemUpgrades,
        workshopUpgrades, setWorkshopUpgrades,
        prestigeMultipliers,
        immediateSave,
    } = props;

    const handleBuyAllItemUpgrades = useCallback(() => {
        let purchasedCount = 0;
        const tempCurrencies = structuredClone(currencies);
        const tempItemUpgrades = structuredClone(itemUpgrades);

        const availableAndSortedUpgrades = tempItemUpgrades
            .filter((u: ItemUpgrade) => {
                if (u.purchased) return false;
                const parentItem = items.find(i => i.id === u.parentItemId);
                return parentItem && parentItem.level >= u.unlocksAtLevel;
            })
            .sort((a: ItemUpgrade, b: ItemUpgrade) => (a.cost.mana || 0) - (b.cost.mana || 0));

        for (const upgrade of availableAndSortedUpgrades) {
            const canAfford = Object.entries(upgrade.cost).every(([currency, cost]) => {
                const actualCost = Math.ceil((cost || 0) * prestigeMultipliers.costReduction);
                return tempCurrencies[currency as Currency] >= actualCost;
            });

            if (canAfford) {
                for (const currency in upgrade.cost) {
                    const actualCost = Math.ceil((upgrade.cost[currency as Currency] || 0) * prestigeMultipliers.costReduction);
                    tempCurrencies[currency as Currency] -= actualCost;
                }
                const upgradeInList = tempItemUpgrades.find(u => u.id === upgrade.id);
                if (upgradeInList) {
                    upgradeInList.purchased = true;
                }
                purchasedCount++;
            }
        }

        if (purchasedCount > 0) {
            setCurrencies(tempCurrencies);
            setItemUpgrades(tempItemUpgrades);
            toast.success(`Purchased ${purchasedCount} item upgrade(s).`);
            immediateSave();
        } else {
            toast.info("No affordable upgrades available.");
        }
    }, [items, itemUpgrades, currencies, prestigeMultipliers.costReduction, setCurrencies, setItemUpgrades, immediateSave]);

    const handleBuyAllWorkshopUpgrades = useCallback(() => {
        let purchasedLevels = 0;
        const tempCurrencies = structuredClone(currencies);
        const tempWorkshopUpgrades = structuredClone(workshopUpgrades);
        const MAX_PURCHASES = 500;

        for (let i = 0; i < MAX_PURCHASES; i++) {
            const affordableUpgrades = tempWorkshopUpgrades.map(upgrade => {
                const cost = Math.ceil(
                    (upgrade.baseCost.cogwheelGears || 0) *
                    Math.pow(WORKSHOP_UPGRADE_COST_GROWTH_RATE, upgrade.level)
                );
                return { upgrade, cost };
            }).filter(({ cost }) => tempCurrencies.cogwheelGears >= cost)
              .sort((a, b) => a.cost - b.cost);
            
            if (affordableUpgrades.length > 0) {
                const cheapest = affordableUpgrades[0];
                tempCurrencies.cogwheelGears -= cheapest.cost;
                
                const upgradeInArray = tempWorkshopUpgrades.find((u: WorkshopUpgrade) => u.id === cheapest.upgrade.id);
                if (upgradeInArray) {
                    upgradeInArray.level++;
                }
                
                purchasedLevels++;
            } else {
                break;
            }
        }
        
        if (purchasedLevels > 0) {
            setCurrencies(tempCurrencies);
            setWorkshopUpgrades(tempWorkshopUpgrades);
            toast.success(`Purchased ${purchasedLevels} workshop upgrade level(s).`);
            immediateSave();
        } else {
            toast.info("No affordable workshop upgrades available.");
        }
    }, [currencies, workshopUpgrades, setCurrencies, setWorkshopUpgrades, immediateSave]);

    return {
        handleBuyAllItemUpgrades,
        handleBuyAllWorkshopUpgrades,
    };
};
