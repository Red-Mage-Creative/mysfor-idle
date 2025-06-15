
import { Wrench, Gem, Beaker } from 'lucide-react';
import { WorkshopUpgrade } from './gameTypes';

// Omit level and cost, as they will be initialized in the game state.
export const initialWorkshopUpgrades: Omit<WorkshopUpgrade, 'level' | 'cost'>[] = [
  {
    id: 'mana_amplifier',
    name: 'Mana Amplifier',
    description: 'Boosts all Mana generation and click power.',
    baseCost: { cogwheelGears: 100 },
    effect: {
      type: 'manaMultiplier',
      value: 0.25, // +25% per level
    },
    icon: Wrench,
  },
  {
    id: 'essence_resonator',
    name: 'Essence Resonator',
    description: 'Boosts all Essence Flux generation.',
    baseCost: { cogwheelGears: 10000 },
    effect: {
      type: 'essenceFluxMultiplier',
      value: 0.20, // +20% per level
    },
    icon: Gem,
  },
  {
    id: 'research_accelerator',
    name: 'Research Accelerator',
    description: 'Boosts all Research Point generation.',
    baseCost: { cogwheelGears: 100000 },
    effect: {
      type: 'researchPointsMultiplier',
      value: 0.15, // +15% per level
    },
    icon: Beaker,
  },
];
