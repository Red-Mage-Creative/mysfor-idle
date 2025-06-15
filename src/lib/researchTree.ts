import { ResearchNode } from '@/lib/gameTypes';
import { 
    Beaker, BookOpen, Cpu, Scaling, Sparkles, Wand, Network, FlaskConical, Atom, 
    Factory, Coins, Diamond, Shield, GitBranch, Zap, Anchor, Scale, Landmark, Blocks, 
    Bot, BrainCircuit, Rocket, HeartPulse, Gauge, Hourglass, Gem, Binary, Crosshair,
    ChevronsUp, ChevronsDown, Rabbit, Snail, Merge, Shuffle, Package, Target, Clock, Crown
} from 'lucide-react';

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

    // #############################
    // ## NEW EARLY GAME BRANCHES ##
    // #############################
    {
        id: 'early_cost_1',
        name: 'Frugal Engineering',
        description: 'Basic cost optimization techniques. All item costs reduced by 1%.',
        cost: 10,
        position: { x: 3, y: 2 },
        prerequisites: ['core_1'],
        icon: Coins,
        effect: { type: 'costReductionMultiplier', value: 0.99 }
    },
    {
        id: 'early_prod_1',
        name: 'Workshop Calibration',
        description: 'Fine-tuning early equipment. All production increased by 1%.',
        cost: 10,
        position: { x: 3, y: -2 },
        prerequisites: ['core_1'],
        icon: Target,
        effect: { type: 'allProductionMultiplier', value: 1.01 }
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
    // NEW Sub-branch for clicking
    {
        id: 'mana_click_0',
        name: 'Manual Casting',
        description: 'Refine your clicking technique. Mana per click +10%.',
        cost: 300,
        position: { x: 9, y: -4 },
        prerequisites: ['mana_1'],
        icon: Wand,
        effect: { type: 'manaPerClickMultiplier', value: 1.10 },
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
    // NEW branch - Aether Weaving
    {
        id: 'aether_1',
        name: 'Aetheric Resonance',
        description: 'Begin to manipulate Aether. Aether Siphon production +10%.',
        cost: 1000,
        position: { x: 11, y: -6 },
        prerequisites: ['mana_2'],
        icon: Anchor,
        effect: { type: 'specificItemMultiplier', value: 1.10, itemId: 'aether_siphon' },
    },
    {
        id: 'aether_2',
        name: 'Aether Funneling',
        description: 'Create focused streams of Aether. Aether Siphon production +15%.',
        cost: 5000,
        position: { x: 13, y: -6 },
        prerequisites: ['aether_1'],
        icon: Package,
        effect: { type: 'specificItemMultiplier', value: 1.15, itemId: 'aether_siphon' },
    },
    {
        id: 'mana_3_attunement',
        name: 'Arcane Attunement',
        description: 'Increase efficiency of mana-based items. Apprentice Wand production increased by 25%.',
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
        cost: 1200,
        position: { x: 12.5, y: -3.5 },
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
        prerequisites: ['mana_3_attunement_b', 'mana_click_2', 'aether_2'],
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
    // NEW sub-branch for Automation
    {
        id: 'automation_1',
        name: 'Basic Servos',
        description: 'Reduces the cost of all items by 1%.',
        cost: 400,
        position: { x: 9, y: 4 },
        prerequisites: ['machine_1'],
        icon: Bot,
        effect: { type: 'costReductionMultiplier', value: 0.99 },
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
        id: 'automation_2',
        name: 'Advanced Automation',
        description: 'Improves Clockwork Automaton production by another 20%.',
        cost: 1100,
        position: { x: 11, y: 6 },
        prerequisites: ['automation_1', 'machine_2'],
        icon: Blocks,
        effect: { type: 'specificItemMultiplier', value: 1.20, itemId: 'clockwork_automaton' },
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
        prerequisites: ['machine_1', 'automation_1'],
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
        description: 'The pinnacle of engineering. Essence Flux generation increased by 15%.',
        cost: 12000,
        position: { x: 14, y: 3 },
        prerequisites: ['machine_3_flux', 'research_2', 'automation_2'],
        icon: Bot,
        effect: { type: 'essenceFluxMultiplier', value: 1.15 }, 
    },
     {
        id: 'mechanical_mastery_b',
        name: 'Mechanical Mastery II',
        description: 'Cogwheel Gear generation also increased by 15%. This is a paired research.',
        cost: 12000,
        position: { x: 14.5, y: 4.5 },
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
        id: 'eff_2_cost_b',
        name: 'Logistical Streamlining',
        description: 'Workshop upgrade costs reduced by 5%.',
        cost: 45000,
        position: { x: 21, y: 3 },
        prerequisites: ['eff_2_cost'],
        icon: Snail,
        effect: { type: 'costReductionMultiplier', value: 0.95 } // Note: need to implement specific cost reductions later
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
        id: 'mystical_1_weaving_b',
        name: 'Runic Inscriptions',
        description: 'Item upgrade costs reduced by 5%.',
        cost: 55000,
        position: { x: 21, y: -3 },
        prerequisites: ['mystical_1_weaving'],
        icon: Gem,
        effect: { type: 'costReductionMultiplier', value: 0.95 } // Note: need to implement specific cost reductions later
    },
    {
        id: 'mystical_2_harmonics',
        name: 'Aetheric Harmonics',
        description: 'Tune into cosmic frequencies. Aether Siphon production +50%.',
        cost: 100000,
        position: { x: 22, y: -1 },
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
        prerequisites: ['eff_3_prod', 'mystical_2_harmonics', 'eff_2_cost_b', 'mystical_1_weaving_b'],
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
        id: 'trans_3_prod_b',
        name: 'Existential Realization',
        description: 'All production is increased by a further 50%.',
        cost: 2000000,
        position: { x: 30, y: 1 },
        prerequisites: ['trans_3_prod'],
        icon: Crown,
        effect: { type: 'allProductionMultiplier', value: 1.50 }
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
    {
        id: 'trans_5_final_b',
        name: 'Nexus of Power',
        description: 'You are the center of all things. All production is tripled.',
        cost: 10000000,
        position: { x: 30, y: -1 },
        prerequisites: ['trans_5_final'],
        icon: Sparkles,
        effect: { type: 'allProductionMultiplier', value: 3.0 }
    },
    {
        id: 'singularity',
        name: 'The Singularity',
        description: 'Collapse all possibilities into a single point of infinite potential. All production is quintupled.',
        cost: 50000000,
        position: { x: 32, y: 0 },
        prerequisites: ['trans_3_prod_b', 'trans_5_final_b'],
        icon: Binary,
        effect: { type: 'allProductionMultiplier', value: 5.0 }
    },

    // Final Node
    {
        id: 'filler_mana_1', name: 'Ley Line Studies', description: 'Mana generation +8%', cost: 4000, position: { x: 13, y: -1 }, prerequisites: ['mana_2'], icon: Sparkles, effect: { type: 'manaMultiplier', value: 1.08 } },
    { id: 'filler_machine_1', name: 'Automated Logistics', description: 'Steamworks +15%', cost: 5000, position: { x: 13, y: 1 }, prerequisites: ['machine_2'], icon: Factory, effect: { type: 'specificItemMultiplier', value: 1.15, itemId: 'steamworks' } },
    { id: 'filler_research_1', name: 'Data Archiving', description: 'Research Point gain +10%', cost: 15000, position: { x: 14, y: 5 }, prerequisites: ['research_2'], icon: Network, effect: { type: 'researchPointsMultiplier', value: 1.10 } },
    { id: 'filler_cost_1', name: 'Frugal Mentality', description: 'All costs -1%', cost: 2000, position: { x: 4, y: 2 }, prerequisites: ['core_1'], icon: Coins, effect: { type: 'costReductionMultiplier', value: 0.99 } },
    { id: 'filler_prod_1', name: 'Applied Sciences', description: 'All production +2%', cost: 3000, position: { x: 4, y: -2 }, prerequisites: ['core_1'], icon: Atom, effect: { type: 'allProductionMultiplier', value: 1.02 } },
];

export const researchNodeMap = new Map(researchNodes.map(node => [node.id, node]));
