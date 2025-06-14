
import { Wrench, Target, Factory } from 'lucide-react';
import { WorkshopUpgrade } from './gameTypes';

export const allWorkshopUpgrades: WorkshopUpgrade[] = [
  {
    id: 'gear_optimization',
    name: 'Gear Optimization',
    description: '+25% Cogwheel Gear production from all sources.',
    cost: { mana: 10000, cogwheelGears: 50 },
    effect: {
      type: 'gearProductionMultiplier',
      value: 1.25,
    },
    purchased: false,
    icon: Wrench,
  },
  {
    id: 'precision_engineering',
    name: 'Precision Engineering',
    description: '+50% effectiveness for all click-enhancing items.',
    cost: { mana: 50000, cogwheelGears: 100 },
    effect: {
      type: 'clickEffectivenessMultiplier',
      value: 1.5,
    },
    purchased: false,
    icon: Target,
  },
  {
    id: 'advanced_assembly_lines',
    name: 'Advanced Assembly Lines',
    description: '+25% Mana production from all "Advanced Machinery" items.',
    cost: { mana: 200000, cogwheelGears: 250 },
    effect: {
      type: 'manaFromMachineryMultiplier',
      value: 1.25,
    },
    purchased: false,
    icon: Factory,
  },
];
