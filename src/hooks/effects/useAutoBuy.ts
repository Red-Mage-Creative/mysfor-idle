import { useEffect } from 'react';
import { toast } from "@/components/ui/sonner";
import { Currency } from '@/lib/gameTypes';
import type { useGameState } from '@/hooks/useGameState';
import type { useGameCalculations } from '@/hooks/useGameCalculations';
import type { useGameActions } from '@/hooks/useGameActions';
import { ITEM_COST_GROWTH_RATE } from '@/constants/gameConstants';

type AutoBuyProps = ReturnType<typeof useGameState> & ReturnType<typeof useGameCalculations> & {
    handleBuyItemUpgrade: ReturnType<typeof useGameActions>['handleBuyItemUpgrade'];
    handleBuyWorkshopUpgrade: ReturnType<typeof useGameActions>['handleBuyWorkshopUpgrade'];
    setLastAutoBuy: React.Dispatch<React.SetStateAction<{ item: string | null; upgrade: string | null }>>;
    setCurrencies: ReturnType<typeof useGameState>['setCurrencies'];
    setItems: ReturnType<typeof useGameState>['setItems'];
    debouncedSave: () => void;
};

export const useAutoBuy = (props: AutoBuyProps) => {
    const {
        isLoaded, autoBuySettings, prestigeMultipliers, items,
        availableItemUpgrades, workshopUpgrades, currencies,
        handleBuyItemUpgrade, handleBuyWorkshopUpgrade, golemEffects, setLastAutoBuy,
        setCurrencies, setItems, debouncedSave,
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
                    
                    const cost = item.cost;
                    const canAffordSingle = Object.entries(cost).every(([c, val]) => {
                        return currencies[c as Currency] >= (val || 0);
                    });

                    if (canAffordSingle) {
                        setCurrencies(prev => {
                            const newCurrencies = { ...prev };
                            for (const currency in cost) {
                                const key = currency as Currency;
                                newCurrencies[key] -= cost[key] || 0;
                            }
                            return newCurrencies;
                        });
                        
                        setItems(prevItems =>
                          prevItems.map(pItem => {
                            if (pItem.id !== item.id) return pItem;
                
                            const newLevel = pItem.level + 1;
                            const newCost = { ...pItem.cost };
                            for (const currency in pItem.baseCost) {
                                const key = currency as Currency;
                                const base = pItem.baseCost[key] || 0;
                                newCost[key] = Math.ceil(base * Math.pow(ITEM_COST_GROWTH_RATE, newLevel));
                            }
                
                            return {
                              ...pItem,
                              level: newLevel,
                              cost: newCost,
                            };
                          })
                        );
                        debouncedSave();

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
        isLoaded, autoBuySettings, prestigeMultipliers, items,
        availableItemUpgrades, workshopUpgrades, currencies,
        handleBuyItemUpgrade, handleBuyWorkshopUpgrade, golemEffects, setLastAutoBuy,
        setCurrencies, setItems, debouncedSave,
    ]);
};
