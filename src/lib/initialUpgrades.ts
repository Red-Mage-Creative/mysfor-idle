
import { Zap, Star, Shield, Settings } from 'lucide-react';
import { Upgrade } from './gameTypes';

export const initialUpgrades: Upgrade[] = [
  {
    id: 'apprentice_wand',
    name: "Apprentice's Wand",
    description: "Generates a small amount of mana.",
    baseCost: { mana: 15 },
    cost: { mana: 15 },
    generation: { mana: 0.1 },
    level: 0,
    icon: Zap,
  },
  {
    id: 'mana_crystal',
    name: 'Mana Crystal',
    description: "A pure crystal humming with arcane energy.",
    baseCost: { mana: 100 },
    cost: { mana: 100 },
    generation: { mana: 1 },
    level: 0,
    icon: Star,
  },
  {
    id: 'enchanted_shield',
    name: 'Enchanted Shield',
    description: "Not just for defense, it channels ambient mana.",
    baseCost: { mana: 1100 },
    cost: { mana: 1100 },
    generation: { mana: 8 },
    level: 0,
    icon: Shield,
  },
  {
    id: 'clockwork_automaton',
    name: 'Clockwork Automaton',
    description: "A marvel of magitech, it produces mana and cogwheel gears.",
    baseCost: { mana: 12000 },
    cost: { mana: 12000 },
    generation: { mana: 47, cogwheelGears: 1 },
    level: 0,
    icon: Settings,
  },
];
