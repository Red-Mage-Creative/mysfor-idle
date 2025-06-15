
import { ResearchNode } from '@/lib/gameTypes';
import { Beaker, BookOpen, Cpu, Scaling, Sparkles, Wand } from 'lucide-react';

export const researchNodes: ResearchNode[] = [
    // Starting Node
    {
        id: 'start',
        name: 'Basic Research',
        description: 'Unlock the potential of your mind. All production increased by 1%.',
        cost: 1,
        position: { x: 0, y: 0 },
        prerequisites: [],
        icon: BookOpen,
        effect: { type: 'allProductionMultiplier', value: 1.01 },
    },
    // Mana Path
    {
        id: 'mana_1',
        name: 'Mana Flow I',
        description: 'Improve mana conduits. Mana generation increased by 5%.',
        cost: 5,
        position: { x: 1, y: -1 },
        prerequisites: ['start'],
        icon: Sparkles,
        effect: { type: 'manaMultiplier', value: 1.05 },
    },
    {
        id: 'mana_2',
        name: 'Mana Flow II',
        description: 'Further optimize mana conduits. Mana generation increased by 10%.',
        cost: 25,
        position: { x: 2, y: -1 },
        prerequisites: ['mana_1'],
        icon: Sparkles,
        effect: { type: 'manaMultiplier', value: 1.10 },
    },
    {
        id: 'mana_click_1',
        name: 'Focused Casting',
        description: 'Your clicks are more potent. Mana per click increased by 25%.',
        cost: 15,
        position: { x: 2, y: -2 },
        prerequisites: ['mana_1'],
        icon: Wand,
        effect: { type: 'manaPerClickMultiplier', value: 1.25 },
    },
    // Production Path
    {
        id: 'prod_1',
        name: 'Efficiency I',
        description: 'Streamline all processes. All production increased by 2%.',
        cost: 10,
        position: { x: 1, y: 0 },
        prerequisites: ['start'],
        icon: Scaling,
        effect: { type: 'allProductionMultiplier', value: 1.02 },
    },
    {
        id: 'prod_2',
        name: 'Efficiency II',
        description: 'Further streamline all processes. All production increased by 4%.',
        cost: 50,
        position: { x: 2, y: 0 },
        prerequisites: ['prod_1'],
        icon: Scaling,
        effect: { type: 'allProductionMultiplier', value: 1.04 },
    },
    // Cogwheel/Machinery Path
    {
        id: 'machine_1',
        name: 'Cogwheel Optimization',
        description: 'Improve the efficiency of Clockwork Automaton. It produces 50% more Cogwheel Gears.',
        cost: 20,
        position: { x: 1, y: 1 },
        prerequisites: ['start'],
        icon: Cpu,
        effect: { type: 'specificItemMultiplier', value: 1.5, itemId: 'clockwork_automaton' },
    },
     // Essence Path
    {
        id: 'essence_1',
        name: 'Essence Extraction',
        description: 'Improve methods of extracting Essence Flux. Essence Flux generation increased by 10%.',
        cost: 30,
        position: { x: 2, y: 1 },
        prerequisites: ['machine_1'],
        icon: Beaker,
        effect: { type: 'essenceFluxMultiplier', value: 1.10 },
    },
];

export const researchNodeMap = new Map(researchNodes.map(node => [node.id, node]));
