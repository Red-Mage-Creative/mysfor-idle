
import { Award, Star, Trophy, Medal, Gem, Zap, BrainCircuit, Sparkles, Network, FlaskConical, Atom, Bot, Group, Puzzle } from 'lucide-react';
import { Achievement } from './gameTypes';

export const allAchievements: Achievement[] = [
  // First Steps
  { id: 'first_item', name: 'First Purchase', description: 'Buy your first item.', category: 'First Steps', icon: Zap },
  { id: 'first_upgrade', name: 'Knowledge Seeker', description: 'Purchase your first upgrade.', category: 'First Steps', icon: BrainCircuit },
  { id: 'first_prestige', name: 'Transcendence', description: 'Complete your first prestige.', category: 'First Steps', icon: Sparkles },
  { id: 'first_prestige_upgrade', name: 'Eternal Power', description: 'Buy your first prestige upgrade.', category: 'First Steps', icon: Star },
  
  // Prestige
  { id: 'prestige_1', name: 'Rebirth', description: 'Prestige for the first time.', category: 'Prestige Master', icon: Award },
  { id: 'prestige_2', name: 'Adept of Renewal', description: 'Prestige 2 times.', category: 'Prestige Master', icon: Award },
  { id: 'prestige_3', name: 'Master of Cycles', description: 'Prestige 3 times.', category: 'Prestige Master', icon: Trophy },
  { id: 'prestige_4', name: 'Lord of Infinity', description: 'Prestige 4 times.', category: 'Prestige Master', icon: Trophy },
  { id: 'prestige_5', name: 'Reality Bender', description: 'Prestige 5 times.', category: 'Prestige Master', icon: Medal },

  // Currency - Mana
  { id: 'mana_1k', name: 'Mana Dabbler', description: 'Accumulate 1,000 lifetime Mana.', category: 'Currency Milestones', icon: Gem },
  { id: 'mana_1m', name: 'Mana Adept', description: 'Accumulate 1 Million lifetime Mana.', category: 'Currency Milestones', icon: Gem },
  { id: 'mana_1b', name: 'Mana Mage', description: 'Accumulate 1 Billion lifetime Mana.', category: 'Currency Milestones', icon: Gem },
  { id: 'mana_1t', name: 'Mana Archmage', description: 'Accumulate 1 Trillion lifetime Mana.', category: 'Currency Milestones', icon: Gem },
  { id: 'mana_1qa', name: 'Mana God', description: 'Accumulate 1 Quadrillion lifetime Mana.', category: 'Currency Milestones', icon: Gem },

  // Currency - Gears
  { id: 'gears_100', name: 'Tinkerer', description: 'Possess 100 Cogwheel Gears.', category: 'Currency Milestones', icon: Award },
  { id: 'gears_10k', name: 'Mechanic', description: 'Possess 10,000 Cogwheel Gears.', category: 'Currency Milestones', icon: Award },
  { id: 'gears_1m', name: 'Chief Engineer', description: 'Possess 1 Million Cogwheel Gears.', category: 'Currency Milestones', icon: Trophy },

  // Currency - Aether Shards
  { id: 'shards_10', name: 'Shard Collector', description: 'Possess 10 Aether Shards.', category: 'Currency Milestones', icon: Star },
  { id: 'shards_100', name: 'Shard Hoarder', description: 'Possess 100 Aether Shards.', category: 'Currency Milestones', icon: Star },
  { id: 'shards_1k', name: 'Shard Baron', description: 'Possess 1,000 Aether Shards.', category: 'Currency Milestones', icon: Medal },
  { id: 'shards_10k', name: 'Shard King', description: 'Possess 10,000 Aether Shards.', category: 'Currency Milestones', icon: Medal },

  // Currency - Essence Flux
  { id: 'essence_1', name: 'Flux Dabbler', description: 'Possess 1 Essence Flux.', category: 'Currency Milestones', icon: Award },
  { id: 'essence_100', name: 'Flux Channeler', description: 'Possess 100 Essence Flux.', category: 'Currency Milestones', icon: Trophy },
  { id: 'essence_10k', name: 'Flux Master', description: 'Possess 10,000 Essence Flux.', category: 'Currency Milestones', icon: Medal },

  // Currency - Research Points
  { id: 'research_10', name: 'Student', description: 'Possess 10 Research Points.', category: 'Currency Milestones', icon: Award },
  { id: 'research_1k', name: 'Scholar', description: 'Possess 1,000 Research Points.', category: 'Currency Milestones', icon: Trophy },
  { id: 'research_100k', name: 'Sage', description: 'Possess 100,000 Research Points.', category: 'Currency Milestones', icon: Medal },

  // Research & Development
  { id: 'research_start', name: 'First Discovery', description: 'Unlock your first research node.', category: 'Research & Development', icon: Zap },
  { id: 'research_10_nodes', name: 'Dedicated Researcher', description: 'Unlock 10 research nodes.', category: 'Research & Development', icon: BrainCircuit },
  { id: 'research_25_nodes', name: 'Master Scholar', description: 'Unlock 25 research nodes.', category: 'Research & Development', icon: Network },
  { id: 'research_50_nodes', name: 'Tree of Knowledge', description: 'Unlock 50 research nodes.', category: 'Research & Development', icon: Atom },
  { id: 'research_path_magitech', name: 'Magitech Pioneer', description: 'Complete the core Magitech research path.', category: 'Research & Development', icon: Sparkles },
  { id: 'research_path_mechanical', name: 'Chief Engineer', description: 'Complete the core Mechanical research path.', category: 'Research & Development', icon: FlaskConical },
  { id: 'research_path_mystical', name: 'Mystical Thinker', description: 'Complete the core Mystical research path.', category: 'Research & Development', icon: Atom },
  { id: 'research_complete_tree', name: 'Universal Architect', description: 'Complete the entire research tree.', category: 'Research & Development', icon: Sparkles, isSecret: true },

  // Cosmic Resonator
  { id: 'cosmic_resonator_1', name: 'Reality Shaper', description: 'Buy your first Cosmic Resonator.', category: 'Cosmic Achievements', icon: Star },
  { id: 'cosmic_resonator_10', name: 'Dimension Walker', description: 'Own 10 Cosmic Resonators.', category: 'Cosmic Achievements', icon: Star },
  { id: 'cosmic_resonator_100', name: 'Universe Crafter', description: 'Own 100 Cosmic Resonators.', category: 'Cosmic Achievements', icon: Trophy },
  { id: 'cosmic_resonator_1k', name: 'Cosmic Emperor', description: 'Own 1,000 Cosmic Resonators.', category: 'Cosmic Achievements', icon: Medal, isSecret: true },
  { 
    id: 'antimatter_mana_1', 
    name: 'Master of Reality', 
    description: 'Forge the legendary Anti-Matter Mana.', 
    category: 'Cosmic Achievements', 
    icon: Atom,
    isSecret: true 
  },

  // Golem Mastery
  { id: 'golem_first', name: 'Golemancer', description: 'Activate your first Golem.', category: 'Golem Mastery', icon: Bot },
  { id: 'golem_3_active', name: 'Triumvirate', description: 'Have 3 Golems active at once.', category: 'Golem Mastery', icon: Group },
  { id: 'golem_5_active', name: 'Quintessence', description: 'Have 5 Golems active at once.', category: 'Golem Mastery', icon: Group },
  { id: 'golem_first_synergy', name: 'Synchronicity', description: 'Activate a Golem Synergy for the first time.', category: 'Golem Mastery', icon: Puzzle },
  { id: 'golem_chaos', name: 'Agent of Chaos', description: 'Activate the Chaos Golem.', category: 'Golem Mastery', icon: Zap, isSecret: true },
];

export const achievementMap = new Map(allAchievements.map(a => [a.id, a]));
