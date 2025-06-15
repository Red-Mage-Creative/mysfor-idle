
import { useCallback } from 'react';
import { useGameState } from './useGameState';
import type { BuyQuantity } from './useGameState';
import { Currency, Item, ItemUpgrade, WorkshopUpgrade, PurchaseDetails, CurrencyRecord } from '@/lib/gameTypes';
import { toast } from '@/components/ui/sonner';
import { getFreshInitialItems, getFreshInitialItemUpgrades, getFreshInitialWorkshopUpgrades } from '@/hooks/useGameState';
import * as C from '@/constants/gameConstants';
import { useGameCalculations } from '@/hooks/useGameCalculations';
import { prestigeUpgrades } from '@/lib/prestigeUpgrades';

const BUY_QUANTITY_KEY = 'magitech_idle_buy_quantity_v2';
const WORKSHOP_UPGRADE_COST_GROWTH_RATE = 1.25;

type UseGameActionsProps = ReturnType<typeof useGameState> & ReturnType<typeof useGameCalculations> & {
    debouncedSave: () => void;
    immediateSave: (reason?: string) => void;
};

export const useGameActions = (props: UseGameActionsProps) => {
    const {
        currencies, setCurrencies,
        items, setItems,
        itemUpgrades, setItemUpgrades,
        workshopUpgrades, setWorkshopUpgrades,
        setLifetimeMana,
        hasEverClicked, setHasEverClicked,
        prestigeUpgradeLevels, setPrestigeUpgradeLevels,
        setNotifiedUpgrades,
        setOfflineEarnings,
        setBuyQuantity,
        overclockLevel, setOverclockLevel,
        itemPurchaseDetails,
        potentialShards,
        canPrestige,
        debouncedSave,
        immediateSave,
        overclockInfo,
        setDevMode,
        setHasEverPrestiged,
        prestigeCount, setPrestigeCount,
        prestigeMultipliers,
        setAutoBuySettings,
        generationPerSecond,
    } = props;

    const updateBuyQuantity = useCallback((q: BuyQuantity) => {
        setBuyQuantity(q);
        localStorage.setItem(BUY_QUANTITY_KEY, JSON.stringify(q));
    }, [setBuyQuantity]);
    
    const addMana = useCallback((amount: number) => {
        setCurrencies(prev => ({ ...prev, mana: prev.mana + amount }));
        setLifetimeMana(prev => prev + amount);
        if (!hasEverClicked) {
            setHasEverClicked(true);
        }
    }, [hasEverClicked, setCurrencies, setLifetimeMana, setHasEverClicked]);
    
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
        immediateSave('buy-item-upgrade');
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
    
    const handlePrestige = useCallback(() => {
        if (!canPrestige) return;

        const shardsGained = potentialShards;
        
        setCurrencies({
            mana: 0,
            cogwheelGears: 0,
            essenceFlux: 0,
            researchPoints: 0,
            aetherShards: currencies.aetherShards + shardsGained,
        });
        
        setItems(getFreshInitialItems());
        setItemUpgrades(getFreshInitialItemUpgrades());
        setWorkshopUpgrades(getFreshInitialWorkshopUpgrades());
        setLifetimeMana(0);
        setNotifiedUpgrades(new Set()); // Reset notifications on prestige
        setHasEverPrestiged(true);
        setPrestigeCount(prev => prev + 1);
        
        toast("Dimensional Shift!", {
          description: `You have gained ${shardsGained} Aether Shards. The world resets, but you are stronger.`,
        });
        immediateSave('prestige');
    }, [
        canPrestige, potentialShards, currencies.aetherShards, 
        setCurrencies, setItems, setItemUpgrades, setWorkshopUpgrades, 
        setLifetimeMana, setNotifiedUpgrades, immediateSave, setHasEverPrestiged,
        setPrestigeCount,
    ]);

    const handleBuyPrestigeUpgrade = useCallback((upgradeId: string) => {
        const upgrade = prestigeUpgrades.find(u => u.id === upgradeId);
        if (!upgrade) return;

        const currentLevel = prestigeUpgradeLevels[upgrade.id] || 0;
        if (currentLevel >= upgrade.maxLevel) {
            toast.error("Max level reached for this upgrade.");
            return;
        };

        const cost = upgrade.cost(currentLevel);
        if (currencies.aetherShards < cost) {
            toast.error("Not enough Aether Shards.");
            return;
        }

        setCurrencies(prev => ({ ...prev, aetherShards: prev.aetherShards - cost }));
        setPrestigeUpgradeLevels(prev => ({ ...prev, [upgradeId]: currentLevel + 1 }));
        immediateSave('buy-prestige-upgrade');
    }, [currencies.aetherShards, prestigeUpgradeLevels, immediateSave, setCurrencies, setPrestigeUpgradeLevels]);

    const handleSetOverclockLevel = useCallback((level: number) => {
        if (level < 0 || level > overclockInfo.maxLevelUnlocked) {
            return;
        }
        setOverclockLevel(level);
        debouncedSave();
    }, [overclockInfo.maxLevelUnlocked, setOverclockLevel, debouncedSave]);

    const toggleDevMode = useCallback(() => {
        setDevMode(prev => {
            const newState = !prev;
            if (newState) {
                toast.info("Developer Mode Enabled", { description: "Mana generation and clicks are boosted." });
            } else {
                toast.info("Developer Mode Disabled");
            }
            return newState;
        });
    }, [setDevMode]);

    const devGrantResources = useCallback(() => {
        // Grant ~1 hour of current production levels
        const secondsOfProduction = 3600;
        const gen = generationPerSecond || {};

        // Use current generation per second, with a fallback minimum if generation is low/zero
        const manaToGrant = Math.max(1e8, (gen.mana || 0) * secondsOfProduction);
        const gearsToGrant = Math.max(1e5, (gen.cogwheelGears || 0) * secondsOfProduction);
        const essenceToGrant = Math.max(1e5, (gen.essenceFlux || 0) * secondsOfProduction);
        const researchToGrant = Math.max(1e5, (gen.researchPoints || 0) * secondsOfProduction);
        
        // Grant shards based on prestige count and current balance to help test prestige upgrades
        const shardsToGrant = Math.max(1000, Math.floor((currencies.aetherShards || 0) * 0.2) + 500 * (prestigeCount + 1));

        setCurrencies(prev => ({
            mana: prev.mana + manaToGrant,
            cogwheelGears: prev.cogwheelGears + gearsToGrant,
            essenceFlux: prev.essenceFlux + essenceToGrant,
            researchPoints: prev.researchPoints + researchToGrant,
            aetherShards: prev.aetherShards + shardsToGrant,
        }));
        setLifetimeMana(prev => prev + manaToGrant);
        
        toast.success("Granted Dev Resources!", {
            description: `+${manaToGrant.toLocaleString('en-US', { notation: 'compact' })} Mana, +${shardsToGrant.toLocaleString('en-US', { notation: 'compact' })} Shards, etc.`
        });
    }, [generationPerSecond, currencies.aetherShards, prestigeCount, setCurrencies, setLifetimeMana]);

    const clearOfflineEarnings = useCallback(() => setOfflineEarnings(null), [setOfflineEarnings]);

    const toggleAutoBuySetting = useCallback((setting: 'items' | 'upgrades') => {
        setAutoBuySettings(prev => ({
            ...prev,
            [setting]: !prev[setting],
        }));
        debouncedSave();
    }, [setAutoBuySettings, debouncedSave]);

    return {
        updateBuyQuantity,
        addMana,
        handleBuyItem,
        handleBuyItemUpgrade,
        handleBuyWorkshopUpgrade,
        handlePrestige,
        handleBuyPrestigeUpgrade,
        handleSetOverclockLevel,
        clearOfflineEarnings,
        toggleDevMode,
        devGrantResources,
        toggleAutoBuySetting,
    };
};
