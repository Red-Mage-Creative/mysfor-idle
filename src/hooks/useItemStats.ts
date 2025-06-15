
import { useMemo } from 'react';
import { Item, ItemUpgrade, CurrencyRecord, Currency, ItemWithStats } from '@/lib/gameTypes';
import { allItemUpgrades } from '@/lib/itemUpgrades';

type ItemUpgradeMultipliers = Record<string, { generation?: number; click?: number }>;

type UseItemStatsProps = {
    items: Item[];
    itemUpgrades: ItemUpgrade[];
    itemUpgradeMultipliers: ItemUpgradeMultipliers;
};

export const useItemStats = ({ items, itemUpgrades, itemUpgradeMultipliers }: UseItemStatsProps) => {
    const itemStats = useMemo(() => {
        const statsMap = new Map<string, Omit<ItemWithStats, keyof Item>>();

        const allUpgradesByItem = allItemUpgrades.reduce((acc, upg) => {
            if (!acc[upg.parentItemId]) acc[upg.parentItemId] = [];
            acc[upg.parentItemId].push(upg);
            return acc;
        }, {} as Record<string, ItemUpgrade[]>);

        for (const item of items) {
            const itemGenMultiplier = itemUpgradeMultipliers[item.id]?.generation || 1;
            const itemClickMultiplier = itemUpgradeMultipliers[item.id]?.click || 1;
            
            const totalProduction: CurrencyRecord = {};
            const productionPerLevel: CurrencyRecord = {};
            for (const currency in item.generation) {
                const key = currency as Currency;
                const baseGen = (item.generation[key] || 0) * itemGenMultiplier;
                productionPerLevel[key] = baseGen;
                totalProduction[key] = baseGen * item.level;
            }
            
            const clickBonusPerLevel = (item.clickBonus || 0) * itemClickMultiplier;
            const totalClickBonus = clickBonusPerLevel * item.level;
            
            const purchasedUpgradesCount = itemUpgrades.filter(u => u.parentItemId === item.id && u.purchased).length;
            const totalUpgradesCount = (allUpgradesByItem[item.id] || []).length;

            statsMap.set(item.id, {
                totalProduction,
                productionPerLevel,
                totalClickBonus,
                clickBonusPerLevel,
                upgradeStats: {
                    purchased: purchasedUpgradesCount,
                    total: totalUpgradesCount
                }
            });
        }
        return statsMap;
    }, [items, itemUpgrades, itemUpgradeMultipliers]);

    return { itemStats };
};
