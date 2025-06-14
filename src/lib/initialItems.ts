import { Zap, Star, Shield, Settings, Factory, Gem, BookOpen, BrainCircuit, Hand } from 'lucide-react';
import { Item } from './gameTypes';

export const initialItems: Item[] = [
  // Basic Magitech
  {
    id: 'apprentice_wand',
    name: "Apprentice's Wand",
    description: "Generates a small amount of mana.",
    baseCost: { mana: 15 },
    cost: { mana: 15 },
    generation: { mana: 0.1 },
    level: 0,
    icon: Zap,
    category: 'Basic Magitech',
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
    category: 'Basic Magitech',
  },
  {
    id: 'clicking_gloves',
    name: 'Clicking Gloves',
    description: 'Enchanted gloves that make each click produce more mana.',
    baseCost: { mana: 25 },
    cost: { mana: 25 },
    generation: {},
    clickBonus: 1,
    level: 0,
    icon: Hand,
    category: 'Basic Magitech',
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
    category: 'Basic Magitech',
  },

  // Advanced Machinery
  {
    id: 'clockwork_automaton',
    name: 'Clockwork Automaton',
    description: "A marvel of magitech, it produces mana and cogwheel gears.",
    baseCost: { mana: 12000 },
    cost: { mana: 12000 },
    generation: { mana: 47, cogwheelGears: 1 },
    level: 0,
    icon: Settings,
    category: 'Advanced Machinery',
  },
  {
    id: 'arcane_engine',
    name: 'Arcane Engine',
    description: 'Consumes cogwheels to supercharge mana production.',
    baseCost: { mana: 75000, cogwheelGears: 50 },
    cost: { mana: 75000, cogwheelGears: 50 },
    generation: { mana: 260 },
    level: 0,
    icon: Factory,
    category: 'Advanced Machinery',
  },
  {
    id: 'enchanted_workshop',
    name: 'Enchanted Workshop',
    description: 'A place for tinkering that yields research.',
    baseCost: { mana: 500000, cogwheelGears: 200 },
    cost: { mana: 500000, cogwheelGears: 200 },
    generation: { researchPoints: 1 },
    level: 0,
    icon: BrainCircuit,
    category: 'Advanced Machinery',
  },
  
  // Mystical Artifacts
  {
    id: 'philosophers_transmuter',
    name: "Philosopher's Transmuter",
    description: 'Converts raw mana into precious Essence Flux.',
    baseCost: { mana: 1e7, cogwheelGears: 1000, researchPoints: 10 },
    cost: { mana: 1e7, cogwheelGears: 1000, researchPoints: 10 },
    generation: { essenceFlux: 0.1 },
    level: 0,
    icon: Gem,
    category: 'Mystical Artifacts',
  },
  {
    id: 'chaos_codex',
    name: 'Chaos Codex',
    description: 'A tome of forbidden knowledge that reveals research.',
    baseCost: { mana: 5e8, essenceFlux: 20 },
    cost: { mana: 5e8, essenceFlux: 20 },
    generation: { researchPoints: 10 },
    level: 0,
    icon: BookOpen,
    category: 'Mystical Artifacts',
  },
];

export const getFreshInitialItems = (): Item[] => initialItems.map(item => ({...item, cost: { ...item.cost }, baseCost: { ...item.baseCost }, generation: { ...item.generation }}));

// It makes more sense to have this function here with the other one.
export const getFreshInitialItemUpgrades = () => allItemUpgrades.map(upgrade => ({ ...upgrade }));
