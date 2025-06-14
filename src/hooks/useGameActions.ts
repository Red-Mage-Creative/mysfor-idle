
import { useCallback } from 'react';
import { getFreshInitialItems, getFreshInitialItemUpgrades, getFreshInitialWorkshopUpgrades, BuyQuantity, UseGameState } from './useGameState';
import { toast } from "@/components/ui/sonner";
import { prestigeUpgrades } from '@/lib/prestigeUpgrades';
import { PurchaseDetails, WorkshopUpgrade } from '@/lib/gameTypes';
import { Currency } from '@/lib/gameTypes';
import { allWorkshopUpgrades } from '@/lib/workshopUpgrades';

const BUY_QUANTITY_KEY = 'magitech_idle_buy_quantity_v2';

type UseGameActionsProps = UseGameState & {
    itemPurchaseDetails: Map<string, PurchaseDetails>;
    potentialShards: number;
    canPrestige: boolean;
    debouncedSave: () => void;
    immediateSave: (reason?: string) => void;
    overclockInfo: ReturnType<typeof import('./useGameCalculations')['useGameCalculations']>['overclockInfo'];
};

export const useGameActions = ({
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
}: UseGameActionsProps) => {

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
            return currencies[currency as Currency] >= cost;
        });

        if (!canAfford) {
            toast.error("Not enough resources.");
            return;
        }

        setCurrencies(prev => {
            const newCurrencies = { ...prev };
            for (const currency in upgrade.cost) {
                newCurrencies[currency as Currency] -= upgrade.cost[currency as Currency] || 0;
            }
            return newCurrencies;
        });

        setItemUpgrades(prev => prev.map(u => u.id === upgradeId ? {...u, purchased: true} : u));
        
        toast.success("Item Upgraded!", {
          description: `You have purchased ${upgrade.name}.`,
        });
        immediateSave('buy-item-upgrade');
    }, [currencies, itemUpgrades, immediateSave, setItemUpgrades, setCurrencies]);
    
    const handleBuyWorkshopUpgrade = useCallback((upgradeId: string) => {
        const upgrade = workshopUpgrades.find(u => u.id === upgradeId);
        if (!upgrade || upgrade.purchased) return;
        
        const canAfford = Object.entries(upgrade.cost).every(([currency, cost]) => {
            return currencies[currency as Currency] >= cost;
        });

        if (!canAfford) {
            toast.error("Not enough resources.");
            return;
        }

        setCurrencies(prev => {
            const newCurrencies = { ...prev };
            for (const currency in upgrade.cost) {
                newCurrencies[currency as Currency] -= upgrade.cost[currency as Currency] || 0;
            }
            return newCurrencies;
        });

        setWorkshopUpgrades(prev => prev.map(u => u.id === upgradeId ? {...u, purchased: true} : u));
        
        toast.success("Workshop Upgraded!", {
          description: `You have purchased ${upgrade.name}.`,
        });
        immediateSave('buy-workshop-upgrade');
    }, [currencies, workshopUpgrades, setCurrencies, setWorkshopUpgrades, immediateSave]);
    
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
        
        toast("Dimensional Shift!", {
          description: `You have gained ${shardsGained} Aether Shards. The world resets, but you are stronger.`,
        });
        immediateSave('prestige');
    }, [
        canPrestige, potentialShards, currencies.aetherShards, 
        setCurrencies, setItems, setItemUpgrades, setWorkshopUpgrades, 
        setLifetimeMana, setNotifiedUpgrades, immediateSave, setHasEverPrestiged,
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
        const manaToGrant = 1e9;
        setCurrencies(prev => ({
            mana: prev.mana + manaToGrant,
            cogwheelGears: prev.cogwheelGears + 1e6,
            essenceFlux: prev.essenceFlux + 1e6,
            researchPoints: prev.researchPoints + 1e6,
            aetherShards: prev.aetherShards + 1e3,
        }));
        setLifetimeMana(prev => prev + manaToGrant);
        toast.success("Granted Dev Resources!");
    }, [setCurrencies, setLifetimeMana]);

    const repairGameState = useCallback(() => {
        console.log("Manual game state repair triggered.");
        const originalUpgradesMap = new Map(allWorkshopUpgrades.map(u => [u.id, u]));
        const needsRepair = workshopUpgrades.some(u => typeof u.icon !== 'function' || !u.description);

        if (needsRepair) {
            const repairedUpgrades = workshopUpgrades
                .map(savedUpgrade => {
                    const original = originalUpgradesMap.get(savedUpgrade.id);
                    if (original) {
                        return { ...original, purchased: savedUpgrade.purchased };
                    }
                    return null;
                })
                .filter((u): u is WorkshopUpgrade => u !== null);
            
            setWorkshopUpgrades(repairedUpgrades);
            toast.success("Game data repaired successfully!");
        } else {
            toast.info("No data corruption found.");
        }
    }, [workshopUpgrades, setWorkshopUpgrades]);

    const clearOfflineEarnings = useCallback(() => setOfflineEarnings(null), [setOfflineEarnings]);

    return {
        updateBuyQuantity,
        addMana,
        handleBuyItem,
        handleBuyItemUpgrade,
        handleBuyWorkshopUpgrade,
        handlePrestige,
        handleBuyPrestigeUpgrade,
        handleSetOverclockLevel,
        repairGameState,
        clearOfflineEarnings,
        toggleDevMode,
        devGrantResources,
    };
};
