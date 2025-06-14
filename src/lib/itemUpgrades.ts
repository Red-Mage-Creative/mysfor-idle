import { ItemUpgrade } from './gameTypes';
import { initialItems } from './initialItems';
import { Settings } from 'lucide-react';

const getIconByItemId = (itemId: string) => {
    const item = initialItems.find(i => i.id === itemId);
    if (!item) throw new Error(`Item with id ${itemId} not found`);
    return item.icon;
}

const generateUpgradesForItem = (
    itemId: string,
    baseManaCost: number,
    effectType: 'generationMultiplier' | 'clickMultiplier'
): ItemUpgrade[] => {
    const levels = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000];
    const names = [
        'Minor Boost', 'Enhanced Efficiency', 'Significant Power-up', 'Major Amplification',
        'Arcane Infusion', 'Mystical Attunement', 'Legendary Surge', 'Divine Blessing', 'Ultimate Transcendence'
    ];
    const descriptionTemplates = [
        'Doubles the {item_name}\'s effectiveness.',
        'Doubles the {item_name}\'s effectiveness again.',
        'A significant power-up, doubling effectiveness.',
        'A major amplification that doubles effectiveness.',
        'An arcane infusion doubles the {item_name}\'s power.',
        'Mystical energies attune, doubling effectiveness.',
        'A legendary surge of power doubles effectiveness.',
        'A divine blessing that doubles the {item_name}\'s power.',
        'The ultimate transcendence, doubling effectiveness.'
    ];

    const itemName = initialItems.find(i => i.id === itemId)?.name || 'item';

    return levels.map((level, index) => ({
        id: `${itemId}_upgrade_${index + 1}`,
        parentItemId: itemId,
        name: `${names[index]}`,
        description: descriptionTemplates[index].replace('{item_name}', itemName),
        unlocksAtLevel: level,
        cost: { mana: baseManaCost * Math.pow(8, index) * (index + 1) }, // Exponential cost increase
        effect: { type: effectType, value: 2 },
        purchased: false,
        icon: getIconByItemId(itemId)
    }));
};

const generateOverclockUpgrades = (): ItemUpgrade[] => {
    const upgrades: ItemUpgrade[] = [];
    const MAX_OVERCLOCK_LEVEL = 10;
    for (let i = 1; i <= MAX_OVERCLOCK_LEVEL; i++) {
        upgrades.push({
            id: `overclock_unlock_${i}`,
            parentItemId: 'clockwork_automaton',
            name: `Unlock Overclock Level ${i}`,
            description: `Unlocks Overclock Level ${i}, boosting all production at the cost of gears. You can activate this from the Items panel.`,
            unlocksAtLevel: i * 5, // Requires automaton to be leveled
            cost: { cogwheelGears: 50 * Math.pow(3, i - 1) },
            effect: { type: 'unlockOverclockLevel', value: i },
            purchased: false,
            icon: Settings,
        });
    }
    return upgrades;
};

export const allItemUpgrades: ItemUpgrade[] = [
    ...generateUpgradesForItem('apprentice_wand', 1000, 'generationMultiplier'),
    ...generateUpgradesForItem('mana_crystal', 10000, 'generationMultiplier'),
    ...generateUpgradesForItem('clicking_gloves', 500, 'clickMultiplier'),
    ...generateUpgradesForItem('enchanted_shield', 110000, 'generationMultiplier'),
    ...generateUpgradesForItem('clockwork_automaton', 1.2e6, 'generationMultiplier'),
    ...generateUpgradesForItem('arcane_engine', 7.5e6, 'generationMultiplier'),
    ...generateUpgradesForItem('enchanted_workshop', 5e7, 'generationMultiplier'),
    ...generateUpgradesForItem('philosophers_transmuter', 1e8, 'generationMultiplier'),
    ...generateUpgradesForItem('chaos_codex', 5e9, 'generationMultiplier'),
    ...generateOverclockUpgrades(),
];
