
import { Wrench, Gem, Beaker } from 'lucide-react';
import { WorkshopUpgrade } from './gameTypes';

// Omit level and cost, as they will be initialized in the game state.
export const initialWorkshopUpgrades: Omit<WorkshopUpgrade, 'level' | 'cost'>[] = [
  {
    id: 'mana_amplifier',
    name: 'Mana Amplifier',
    description: 'Boosts all Mana generation and click power.',
    baseCost: { cogwheelGears: 10 },
    effect: {
      type: 'manaMultiplier',
      value: 0.05, // +5% per level
    },
    icon: Wrench,
  },
  {
    id: 'essence_resonator',
    name: 'Essence Resonator',
    description: 'Boosts all Essence Flux generation.',
    baseCost: { cogwheelGears: 500 },
    effect: {
      type: 'essenceFluxMultiplier',
      value: 0.04, // +4% per level
    },
    icon: Gem,
  },
  {
    id: 'research_accelerator',
    name: 'Research Accelerator',
    description: 'Boosts all Research Point generation.',
    baseCost: { cogwheelGears: 2500 },
    effect: {
      type: 'researchPointsMultiplier',
      value: 0.03, // +3% per level
    },
    icon: Beaker,
  },
];
