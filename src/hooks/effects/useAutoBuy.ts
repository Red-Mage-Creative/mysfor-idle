
import { useEffect } from 'react';
import { toast } from "@/components/ui/sonner";
import { Currency } from '@/lib/gameTypes';
import type { useGameState } from '@/hooks/useGameState';
import type { useGameCalculations } from '@/hooks/useGameCalculations';
import type { useGameActions } from '@/hooks/useGameActions';

type AutoBuyProps = ReturnType<typeof useGameState> & ReturnType<typeof useGameCalculations> & {
    handleBuyItem: ReturnType<typeof useGameActions>['handleBuyItem'];
    handleBuyItemUpgrade: ReturnType<typeof useGameActions>['handleBuyItemUpgrade'];
    handleBuyWorkshopUpgrade: ReturnType<typeof useGameActions>['handleBuyWorkshopUpgrade'];
    setLastAutoBuy: React.Dispatch<React.SetStateAction<{ item: string | null; upgrade: string | null }>>;
};

export const useAutoBuy = (props: AutoBuyProps) => {
    const {
        isLoaded, autoBuySettings, prestigeMultipliers, items, itemPurchaseDetails,
        availableItemUpgrades, workshopUpgrades, currencies, handleBuyItem,
        handleBuyItemUpgrade, handleBuyWorkshopUpgrade, golemEffects, setLastAutoBuy
    } = props;

    useEffect(() => {
        const autoBuyTick = () => {
            if (!isLoaded) return;
            
            const itemsUnlocked = prestigeMultipliers.autoBuyItemsUnlocked;
            const itemsEnabled = autoBuySettings.items;
            const itemsGolemBlocked = golemEffects.disabledFeatures.has('autoBuyItems');

            if (itemsUnlocked && itemsEnabled && !itemsGolemBlocked) {
                for (let i = items.length - 1; i >= 0; i--) {
                    const item = items[i];
                    const details = itemPurchaseDetails.get(item.id);
                    if (details && details.canAffordPurchase && details.purchaseQuantity > 0) {
                        handleBuyItem(item.id);
                        setLastAutoBuy(prev => ({ ...prev, item: item.name }));
                        toast(`Auto-Bought: ${item.name}`, { id: 'autobuy-toast-item', duration: 2000 });
                        return;
                    }
                }
            }
            
            const upgradesUnlocked = prestigeMultipliers.autoBuyUpgradesUnlocked;
            const upgradesEnabled = autoBuySettings.upgrades;
            const upgradesGolemBlocked = golemEffects.disabledFeatures.has('autoBuyUpgrades');

            if (upgradesUnlocked && upgradesEnabled && !upgradesGolemBlocked) {
                if (availableItemUpgrades.length > 0) {
                    const upgrade = availableItemUpgrades[0];
                    const canAfford = Object.entries(upgrade.cost).every(([c, cost]) => {
                        const actualCost = Math.ceil((cost || 0) * prestigeMultipliers.costReduction);
                        return currencies[c as Currency] >= actualCost;
                    });
                    if (canAfford) {
                        handleBuyItemUpgrade(upgrade.id);
                        setLastAutoBuy(prev => ({...prev, upgrade: upgrade.name}));
                        toast(`Auto-Bought Upgrade: ${upgrade.name}`, { id: 'autobuy-toast-upgrade', duration: 2000 });
                        return;
                    }
                }
                
                if (workshopUpgrades.length > 0) {
                    const WORKSHOP_UPGRADE_COST_GROWTH_RATE = 1.25;
                    const affordableUpgrades = workshopUpgrades.map(upgrade => {
                        const cost = Math.ceil(
                            (upgrade.baseCost.cogwheelGears || 0) * 
                            Math.pow(WORKSHOP_UPGRADE_COST_GROWTH_RATE, upgrade.level)
                        );
                        return { upgrade, cost };
                    }).filter(({ cost }) => currencies.cogwheelGears >= cost)
                      .sort((a, b) => a.cost - b.cost);

                    if (affordableUpgrades.length > 0) {
                        const upgradeToBuy = affordableUpgrades[0].upgrade;
                        handleBuyWorkshopUpgrade(upgradeToBuy.id);
                        setLastAutoBuy(prev => ({...prev, upgrade: upgradeToBuy.name}));
                        toast(`Auto-Bought Upgrade: ${upgradeToBuy.name}`, { id: 'autobuy-toast-upgrade', duration: 2000 });
                        return;
                    }
                }
            }
        };
        
        const intervalId = setInterval(autoBuyTick, 500);
        
        return () => clearInterval(intervalId);
    }, [
        isLoaded, autoBuySettings, prestigeMultipliers, items, itemPurchaseDetails,
        availableItemUpgrades, workshopUpgrades, currencies, handleBuyItem,
        handleBuyItemUpgrade, handleBuyWorkshopUpgrade, golemEffects, setLastAutoBuy
    ]);
};
