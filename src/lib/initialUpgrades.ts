
import { Zap, Star, Shield, Settings } from 'lucide-react';
import { Upgrade } from './gameTypes';

export const initialUpgrades: Upgrade[] = [
  {
    id: 'apprentice_wand',
    name: "Apprentice's Wand",
    baseCost: 15,
    cost: 15,
    mps: 0.1,
    level: 0,
    icon: Zap,
  },
  {
    id: 'mana_crystal',
    name: 'Mana Crystal',
    baseCost: 100,
    cost: 100,
    mps: 1,
    level: 0,
    icon: Star,
  },
  {
    id: 'enchanted_shield',
    name: 'Enchanted Shield',
    baseCost: 1100,
    cost: 1100,
    mps: 8,
    level: 0,
    icon: Shield,
  },
  {
    id: 'clockwork_automaton',
    name: 'Clockwork Automaton',
    baseCost: 12000,
    cost: 12000,
    mps: 47,
    level: 0,
    icon: Settings,
  },
];
