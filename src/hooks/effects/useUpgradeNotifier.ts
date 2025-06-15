
import { useEffect } from 'react';
import { toast } from "@/components/ui/sonner";
import type { useGameState } from '@/hooks/useGameState';
import type { useGameCalculations } from '@/hooks/useGameCalculations';

type UpgradeNotifierProps = Pick<ReturnType<typeof useGameState>, 'items' | 'notifiedUpgrades' | 'setNotifiedUpgrades'> & Pick<ReturnType<typeof useGameCalculations>, 'availableItemUpgrades'>;

export const useUpgradeNotifier = (props: UpgradeNotifierProps) => {
    const { availableItemUpgrades, items, notifiedUpgrades, setNotifiedUpgrades } = props;

    useEffect(() => {
        const newlyAvailable = availableItemUpgrades.filter(upgrade => !notifiedUpgrades.has(upgrade.id));

        if (newlyAvailable.length > 0) {
            const firstUpgrade = newlyAvailable[0];
            const parentItem = items.find(i => i.id === firstUpgrade.parentItemId);
            let description = `'${firstUpgrade.name}' for your ${parentItem?.name || 'item'}.`;
            if (newlyAvailable.length > 1) {
                description += ` (+${newlyAvailable.length - 1} more)`;
            }
            description += " Check the Upgrades tab!";

            toast.info("New Upgrade Available!", { description });

            setNotifiedUpgrades(prev => {
                const newSet = new Set(prev);
                newlyAvailable.forEach(u => newSet.add(u.id));
                return newSet;
            });
        }
    }, [availableItemUpgrades, items, notifiedUpgrades, setNotifiedUpgrades]);
};
