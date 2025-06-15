
import { DimensionalUpgrade } from './gameTypes';
import { Award, Star, Trophy } from 'lucide-react';

export const dimensionalUpgrades: DimensionalUpgrade[] = [
    {
        id: 'perm_mana_boost',
        name: 'Permanent Mana Focus',
        description: (level) => `All Mana generation is permanently increased by ${level * 1}%.`,
        cost: (level) => Math.ceil(5 * Math.pow(1.5, level)),
        maxLevel: 50,
        effect: {
            type: 'allManaMultiplier',
            value: (level) => 1 + level * 0.01,
        },
        icon: Award,
    },
    {
        id: 'starting_mana',
        name: 'Initial Spark',
        description: (level) => `Start each prestige with ${100 * level} Mana.`,
        cost: (level) => 10 + level * 5,
        maxLevel: 10,
        effect: {
            type: 'startingMana',
            value: (level) => 100 * level,
        },
        icon: Star,
    },
    {
        id: 'token_chance',
        name: 'Lucky Charm',
        description: (level) => `Grants a ${level * 2}% chance to double Challenge Token rewards.`,
        cost: (level) => 25 * (level + 1),
        maxLevel: 10,
        effect: {
            type: 'challengeTokenMultiplier',
            value: (level) => 1 + (level * 0.02),
        },
        icon: Trophy,
    },
];

export const dimensionalUpgradeMap = new Map(dimensionalUpgrades.map(u => [u.id, u]));
