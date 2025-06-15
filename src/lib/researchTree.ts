
import { ResearchNode } from '@/lib/gameTypes';
import { Beaker, BookOpen, Cpu, Scaling, Sparkles, Wand, Network, FlaskConical, Atom, Factory, Coins, Diamond, Shield, GitBranch, Zap, Anchor, Scale, Landmark, Blocks, Bot, BrainCircuit, Rocket } from 'lucide-react';

export const researchNodes: ResearchNode[] = [
    // ###############
    // ## CORE PATH (Y=0) ##
    // ###############
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
    {
        id: 'core_1',
        name: 'Methodical Approach',
        description: 'Establish research protocols. All production increased by 2%.',
        cost: 5,
        position: { x: 2, y: 0 },
        prerequisites: ['start'],
        icon: Scaling,
        effect: { type: 'allProductionMultiplier', value: 1.02 },
    },
    {
        id: 'core_2',
        name: 'Advanced Theory',
        description: 'Deeper understanding of the fundamentals. All production increased by 3%.',
        cost: 50,
        position: { x: 4, y: 0 },
        prerequisites: ['core_1'],
        icon: Atom,
        effect: { type: 'allProductionMultiplier', value: 1.03 },
    },
    {
        id: 'core_3_main_junction',
        name: 'Synergistic Design',
        description: 'Unlock pathways to specialized fields of Magitech and Mechanical engineering.',
        cost: 150,
        position: { x: 6, y: 0 },
        prerequisites: ['core_2'],
        icon: GitBranch,
        effect: { type: 'allProductionMultiplier', value: 1.05 },
    },

    // ###########################
    // ## MAGITECH PATH (Y < 0) ##
    // ###########################
    {
        id: 'mana_1',
        name: 'Mana Flow I',
        description: 'Improve mana conduits. Mana generation increased by 5%.',
        cost: 250,
        position: { x: 8, y: -2 },
        prerequisites: ['core_3_main_junction'],
        icon: Sparkles,
        effect: { type: 'manaMultiplier', value: 1.05 },
    },
    {
        id: 'mana_2',
        name: 'Mana Flow II',
        description: 'Further optimize mana conduits. Mana generation increased by 10%.',
        cost: 750,
        position: { x: 10, y: -2 },
        prerequisites: ['mana_1'],
        icon: Zap,
        effect: { type: 'manaMultiplier', value: 1.10 },
    },
    {
        id: 'mana_3_attunement',
        name: 'Arcane Attunement',
        description: 'Increase efficiency of mana-based items. Apprentice Wand and Mage Tower produce 25% more mana.',
        cost: 1200,
        position: { x: 12, y: -2 },
        prerequisites: ['mana_2'],
        icon: Diamond,
        effect: { type: 'specificItemMultiplier', value: 1.25, itemId: 'apprentice_wand' },
    },
    {
        id: 'mana_3_attunement_b',
        name: 'Arcane Attunement II',
        description: 'Mage Tower production also increased by 25%. This is a paired research.',
        cost: 1, 
        position: { x: 12.5, y: -2.5 },
        prerequisites: ['mana_3_attunement'],
        icon: Landmark,
        effect: { type: 'specificItemMultiplier', value: 1.25, itemId: 'mage_tower' },
    },
    // Mana Clicking Sub-branch
    {
        id: 'mana_click_1',
        name: 'Focused Casting',
        description: 'Your clicks are more potent. Mana per click increased by 25%.',
        cost: 600,
        position: { x: 10, y: -4 },
        prerequisites: ['mana_1'],
        icon: Wand,
        effect: { type: 'manaPerClickMultiplier', value: 1.25 },
    },
    {
        id: 'mana_click_2',
        name: 'Empowered Clicks',
        description: 'Channel more power through your clicks. Mana per click increased by 50%.',
        cost: 2000,
        position: { x: 12, y: -4 },
        prerequisites: ['mana_click_1'],
        icon: Wand,
        effect: { type: 'manaPerClickMultiplier', value: 1.50 },
    },
    {
        id: 'magitech_mastery',
        name: 'Magitech Mastery',
        description: 'Become a master of mana manipulation. All mana generation is increased by an additional 20%.',
        cost: 10000,
        position: { x: 14, y: -3 },
        prerequisites: ['mana_3_attunement_b', 'mana_click_2'],
        icon: BrainCircuit,
        effect: { type: 'manaMultiplier', value: 1.20 },
    },
    
    // #############################
    // ## MECHANICAL PATH (Y > 0) ##
    // #############################
    {
        id: 'machine_1',
        name: 'Cogwheel Optimization',
        description: 'Improve the efficiency of Clockwork Automaton. It produces 25% more Cogwheel Gears.',
        cost: 300,
        position: { x: 8, y: 2 },
        prerequisites: ['core_3_main_junction'],
        icon: Cpu,
        effect: { type: 'specificItemMultiplier', value: 1.25, itemId: 'clockwork_automaton' },
    },
    {
        id: 'machine_2',
        name: 'Efficient Assembly',
        description: 'Steamworks produces 25% more resources.',
        cost: 900,
        position: { x: 10, y: 2 },
        prerequisites: ['machine_1'],
        icon: Factory,
        effect: { type: 'specificItemMultiplier', value: 1.25, itemId: 'steamworks' },
    },
    {
        id: 'machine_3_flux',
        name: 'Alchemical Alloys',
        description: 'Improve refinement processes. Essence Flux generation increased by 20%.',
        cost: 1500,
        position: { x: 12, y: 2 },
        prerequisites: ['machine_2'],
        icon: FlaskConical,
        effect: { type: 'essenceFluxMultiplier', value: 1.20 },
    },
    // Research sub-branch
    {
        id: 'research_1',
        name: 'Scholarly Pursuits',
        description: 'Improve research methods. Gain 10% more Research Points.',
        cost: 1000,
        position: { x: 10, y: 4 },
        prerequisites: ['machine_1'],
        icon: Beaker,
        effect: { type: 'researchPointsMultiplier', value: 1.10 },
    },
    {
        id: 'research_2',
        name: 'Scientific Collaboration',
        description: 'Share findings to accelerate progress. Gain 15% more Research Points.',
        cost: 4000,
        position: { x: 12, y: 4 },
        prerequisites: ['research_1'],
        icon: Network,
        effect: { type: 'researchPointsMultiplier', value: 1.15 },
    },
    {
        id: 'mechanical_mastery',
        name: 'Mechanical Mastery',
        description: 'The pinnacle of engineering. All Cogwheel Gear and Essence Flux generation increased by 15%.',
        cost: 12000,
        position: { x: 14, y: 3 },
        prerequisites: ['machine_3_flux', 'research_2'],
        icon: Bot,
        effect: { type: 'essenceFluxMultiplier', value: 1.15 }, 
    },
     {
        id: 'mechanical_mastery_b',
        name: 'Mechanical Mastery II',
        description: 'Cogwheel Gear generation also increased by 15%. This is a paired research.',
        cost: 1,
        position: { x: 14.5, y: 3.5 },
        prerequisites: ['mechanical_mastery'],
        icon: Blocks,
        effect: { type: 'specificItemMultiplier', value: 1.15, itemId: 'clockwork_automaton' },
    },

    // #####################################
    // ## EFFICIENCY & MYSTICAL PATH (Central) ##
    // #####################################
    {
        id: 'eff_1_main_junction_2',
        name: 'Interdisciplinary Studies',
        description: 'Combine magical and mechanical knowledge. Unlocks new research paths. All production +5%',
        cost: 25000,
        position: { x: 16, y: 0 },
        prerequisites: ['magitech_mastery', 'mechanical_mastery_b'],
        icon: GitBranch,
        effect: { type: 'allProductionMultiplier', value: 1.05 }
    },
    {
        id: 'eff_2_cost',
        name: 'Advanced Economics',
        description: 'Optimize global supply chains. All item and upgrade costs reduced by 2%.',
        cost: 40000,
        position: { x: 18, y: 1 },
        prerequisites: ['eff_1_main_junction_2'],
        icon: Coins,
        effect: { type: 'costReductionMultiplier', value: 0.98 }
    },
    {
        id: 'eff_3_prod',
        name: 'Unified Field Theory',
        description: 'A breakthrough in understanding the fabric of reality. All production +10%.',
        cost: 75000,
        position: { x: 20, y: 1 },
        prerequisites: ['eff_2_cost'],
        icon: Atom,
        effect: { type: 'allProductionMultiplier', value: 1.10 }
    },
    {
        id: 'mystical_1_weaving',
        name: 'Essence Weaving',
        description: 'Manipulate raw essence. Essence Flux generation +20%.',
        cost: 50000,
        position: { x: 18, y: -1 },
        prerequisites: ['eff_1_main_junction_2'],
        icon: Shield,
        effect: { type: 'essenceFluxMultiplier', value: 1.20 }
    },
    {
        id: 'mystical_2_harmonics',
        name: 'Aetheric Harmonics',
        description: 'Tune into cosmic frequencies. Aether Siphon production +50%.',
        cost: 100000,
        position: { x: 20, y: -1 },
        prerequisites: ['mystical_1_weaving'],
        icon: Anchor,
        effect: { type: 'specificItemMultiplier', value: 1.5, itemId: 'aether_siphon' }
    },
    
    // #############################
    // ## TRANSCENDENCE PATH (Endgame) ##
    // #############################
    {
        id: 'trans_1_junction_3',
        name: 'Cosmic Insight',
        description: 'Glimpse the nature of the cosmos. Unlocks the final tier of research. All production +15%.',
        cost: 250000,
        position: { x: 22, y: 0 },
        prerequisites: ['eff_3_prod', 'mystical_2_harmonics'],
        icon: Rocket,
        effect: { type: 'allProductionMultiplier', value: 1.15 }
    },
    {
        id: 'trans_2_cost',
        name: 'Singularity Economics',
        description: 'Costs approach zero. All costs reduced by a further 5%.',
        cost: 500000,
        position: { x: 24, y: 1 },
        prerequisites: ['trans_1_junction_3'],
        icon: Coins,
        effect: { type: 'costReductionMultiplier', value: 0.95 }
    },
     {
        id: 'trans_3_prod',
        name: 'Omnipotence',
        description: 'Mastery over all creation. All production increased by 25%.',
        cost: 1000000,
        position: { x: 26, y: 1 },
        prerequisites: ['trans_2_cost'],
        icon: Scale,
        effect: { type: 'allProductionMultiplier', value: 1.25 }
    },
    {
        id: 'trans_4_click',
        name: 'Divine Touch',
        description: 'Your every action reshapes reality. Mana per click is increased by 100%.',
        cost: 750000,
        position: { x: 24, y: -1 },
        prerequisites: ['trans_1_junction_3'],
        icon: Wand,
        effect: { type: 'manaPerClickMultiplier', value: 2.0 }
    },
    {
        id: 'trans_5_final',
        name: 'The Alpha and The Omega',
        description: 'You have completed the research tree. As a reward, all production is doubled.',
        cost: 5000000,
        position: { x: 26, y: -1 },
        prerequisites: ['trans_4_click'],
        icon: Sparkles,
        effect: { type: 'allProductionMultiplier', value: 2.0 }
    },

    // Filler nodes to add more choices and flesh out the tree
    { id: 'filler_mana_1', name: 'Ley Line Studies', description: 'Mana generation +8%', cost: 4000, position: { x: 12, y: -1 }, prerequisites: ['mana_2'], icon: Sparkles, effect: { type: 'manaMultiplier', value: 1.08 } },
    { id: 'filler_machine_1', name: 'Automated Logistics', description: 'Steamworks +15%', cost: 5000, position: { x: 12, y: 1 }, prerequisites: ['machine_2'], icon: Factory, effect: { type: 'specificItemMultiplier', value: 1.15, itemId: 'steamworks' } },
    { id: 'filler_research_1', name: 'Data Archiving', description: 'Research Point gain +10%', cost: 15000, position: { x: 14, y: 5 }, prerequisites: ['research_2'], icon: Network, effect: { type: 'researchPointsMultiplier', value: 1.10 } },
    { id: 'filler_cost_1', name: 'Frugal Mentality', description: 'All costs -1%', cost: 2000, position: { x: 4, y: 2 }, prerequisites: ['core_1'], icon: Coins, effect: { type: 'costReductionMultiplier', value: 0.99 } },
    { id: 'filler_prod_1', name: 'Applied Sciences', description: 'All production +2%', cost: 3000, position: { x: 4, y: -2 }, prerequisites: ['core_1'], icon: Atom, effect: { type: 'allProductionMultiplier', value: 1.02 } },
];

export const researchNodeMap = new Map(researchNodes.map(node => [node.id, node]));

