
import { ItemUpgrade } from './gameTypes';
import { initialItems } from './initialItems';

const getIconByItemId = (itemId: string) => {
    const item = initialItems.find(i => i.id === itemId);
    if (!item) throw new Error(`Item with id ${itemId} not found`);
    return item.icon;
}

export const allItemUpgrades: ItemUpgrade[] = [
    // === Basic Magitech ===
    // Apprentice's Wand
    { id: 'wand_upgrade_1', parentItemId: 'apprentice_wand', name: 'Polished Wand', description: "Doubles the Apprentice's Wand mana generation.", unlocksAtLevel: 10, cost: { mana: 1000 }, effect: { type: 'generationMultiplier', value: 2 }, purchased: false, icon: getIconByItemId('apprentice_wand') },
    { id: 'wand_upgrade_2', parentItemId: 'apprentice_wand', name: 'Runic Inscriptions', description: "Doubles the Apprentice's Wand mana generation again.", unlocksAtLevel: 25, cost: { mana: 5000 }, effect: { type: 'generationMultiplier', value: 2 }, purchased: false, icon: getIconByItemId('apprentice_wand') },
    // Mana Crystal
    { id: 'crystal_upgrade_1', parentItemId: 'mana_crystal', name: 'Focusing Lens', description: "Doubles the Mana Crystal's mana generation.", unlocksAtLevel: 10, cost: { mana: 10000 }, effect: { type: 'generationMultiplier', value: 2 }, purchased: false, icon: getIconByItemId('mana_crystal') },
    // Clicking Gloves
    { id: 'gloves_upgrade_1', parentItemId: 'clicking_gloves', name: 'Reinforced Seams', description: 'Doubles the mana bonus from Clicking Gloves.', unlocksAtLevel: 10, cost: { mana: 500 }, effect: { type: 'clickMultiplier', value: 2 }, purchased: false, icon: getIconByItemId('clicking_gloves') },
];
