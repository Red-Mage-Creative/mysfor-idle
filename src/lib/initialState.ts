
import { initialItems } from '@/lib/initialItems';
import { allItemUpgrades } from '@/lib/itemUpgrades';
import { initialWorkshopUpgrades } from '@/lib/workshopUpgrades';
import { Item, ItemUpgrade, WorkshopUpgrade } from '@/lib/gameTypes';

export const getFreshInitialItems = (): Item[] => initialItems.map(item => ({...item, cost: { ...item.cost }, baseCost: { ...item.baseCost }, generation: { ...item.generation }}));
export const getFreshInitialItemUpgrades = (): ItemUpgrade[] => allItemUpgrades.map(upgrade => ({ ...upgrade }));
export const getFreshInitialWorkshopUpgrades = (): WorkshopUpgrade[] => {
    return initialWorkshopUpgrades.map(upgrade => ({
        ...upgrade,
        level: 0,
        cost: { ...upgrade.baseCost },
    }));
};
