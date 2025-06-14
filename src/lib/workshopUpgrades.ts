
import { Wrench, Target, Factory } from 'lucide-react';
import { WorkshopUpgrade } from './gameTypes';

export const allWorkshopUpgrades: WorkshopUpgrade[] = [
  // Tier 1
  {
    id: 'gear_optimization_1',
    name: 'Gear Optimization I',
    description: '+10% Cogwheel Gear production from all sources.',
    cost: { mana: 10000, cogwheelGears: 50 },
    effect: {
      type: 'gearProductionMultiplier',
      value: 1.1,
    },
    purchased: false,
    icon: Wrench,
  },
  {
    id: 'precision_engineering_1',
    name: 'Precision Engineering I',
    description: '+20% effectiveness for all click-enhancing items.',
    cost: { mana: 50000, cogwheelGears: 100 },
    effect: {
      type: 'clickEffectivenessMultiplier',
      value: 1.2,
    },
    purchased: false,
    icon: Target,
  },
  {
    id: 'advanced_assembly_lines_1',
    name: 'Advanced Assembly Lines I',
    description: '+15% Mana production from all "Advanced Machinery" items.',
    cost: { mana: 200000, cogwheelGears: 250 },
    effect: {
      type: 'manaFromMachineryMultiplier',
      value: 1.15,
    },
    purchased: false,
    icon: Factory,
  },
  // Tier 2
  {
    id: 'gear_optimization_2',
    name: 'Gear Optimization II',
    description: '+15% Cogwheel Gear production from all sources.',
    cost: { mana: 500000, cogwheelGears: 500 },
    effect: {
      type: 'gearProductionMultiplier',
      value: 1.15,
    },
    purchased: false,
    icon: Wrench,
  },
  {
    id: 'precision_engineering_2',
    name: 'Precision Engineering II',
    description: '+30% effectiveness for all click-enhancing items.',
    cost: { mana: 2500000, cogwheelGears: 1000 },
    effect: {
      type: 'clickEffectivenessMultiplier',
      value: 1.3,
    },
    purchased: false,
    icon: Target,
  },
  {
    id: 'advanced_assembly_lines_2',
    name: 'Advanced Assembly Lines II',
    description: '+20% Mana production from all "Advanced Machinery" items.',
    cost: { mana: 10000000, cogwheelGears: 2500 },
    effect: {
      type: 'manaFromMachineryMultiplier',
      value: 1.20,
    },
    purchased: false,
    icon: Factory,
  },
  // Tier 3
   {
    id: 'gear_optimization_3',
    name: 'Gear Optimization III',
    description: '+20% Cogwheel Gear production from all sources.',
    cost: { mana: 25000000, cogwheelGears: 5000 },
    effect: {
      type: 'gearProductionMultiplier',
      value: 1.20,
    },
    purchased: false,
    icon: Wrench,
  },
  {
    id: 'precision_engineering_3',
    name: 'Precision Engineering III',
    description: '+50% effectiveness for all click-enhancing items.',
    cost: { mana: 125000000, cogwheelGears: 10000 },
    effect: {
      type: 'clickEffectivenessMultiplier',
      value: 1.5,
    },
    purchased: false,
    icon: Target,
  },
  {
    id: 'advanced_assembly_lines_3',
    name: 'Advanced Assembly Lines III',
    description: '+25% Mana production from all "Advanced Machinery" items.',
    cost: { mana: 500000000, cogwheelGears: 25000 },
    effect: {
      type: 'manaFromMachineryMultiplier',
      value: 1.25,
    },
    purchased: false,
    icon: Factory,
  },
];
