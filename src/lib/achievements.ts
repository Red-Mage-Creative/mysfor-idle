
import { Award, Star, Trophy, Medal, Gem, Zap, BrainCircuit, Sparkles, Network, FlaskConical, Atom, Bot, Group, Puzzle, Clock, Target, Crown } from 'lucide-react';
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
  { id: 'prestige_10', name: 'Dimension Hopper', description: 'Prestige 10 times.', category: 'Prestige Master', icon: Medal },
  { id: 'prestige_15', name: 'Nexus Core', description: 'Prestige 15 times.', category: 'Prestige Master', icon: Medal },
  { id: 'prestige_20', name: 'Eternal Recurrence', description: 'Prestige 20 times.', category: 'Prestige Master', icon: Trophy },
  { id: 'prestige_25', name: 'Singularity', description: 'Prestige 25 times.', category: 'Prestige Master', icon: Trophy },
  { id: 'prestige_50', name: 'God of Rebirth', description: 'Prestige 50 times.', category: 'Prestige Master', icon: Crown },
  { id: 'prestige_100', name: 'True Immortal', description: 'Prestige 100 times.', category: 'Prestige Master', icon: Crown, isSecret: true },

  // Currency - Mana
  { id: 'mana_1k', name: 'Mana Dabbler', description: 'Accumulate 1,000 lifetime Mana.', category: 'Currency Milestones', icon: Gem },
  { id: 'mana_1m', name: 'Mana Adept', description: 'Accumulate 1 Million lifetime Mana.', category: 'Currency Milestones', icon: Gem },
  { id: 'mana_1b', name: 'Mana Mage', description: 'Accumulate 1 Billion lifetime Mana.', category: 'Currency Milestones', icon: Gem },
  { id: 'mana_1t', name: 'Mana Archmage', description: 'Accumulate 1 Trillion lifetime Mana.', category: 'Currency Milestones', icon: Gem },
  { id: 'mana_1qa', name: 'Mana God', description: 'Accumulate 1 Quadrillion lifetime Mana.', category: 'Currency Milestones', icon: Gem },
  { id: 'mana_1qi', name: 'Mana Sovereign', description: 'Accumulate 1 Quintillion lifetime Mana.', category: 'Currency Milestones', icon: Gem },
  { id: 'mana_1sx', name: 'Mana Ascendant', description: 'Accumulate 1 Sextillion lifetime Mana.', category: 'Currency Milestones', icon: Gem, isSecret: true },

  // Currency - Gears
  { id: 'gears_100', name: 'Tinkerer', description: 'Possess 100 Cogwheel Gears.', category: 'Currency Milestones', icon: Award },
  { id: 'gears_10k', name: 'Mechanic', description: 'Possess 10,000 Cogwheel Gears.', category: 'Currency Milestones', icon: Award },
  { id: 'gears_1m', name: 'Chief Engineer', description: 'Possess 1 Million Cogwheel Gears.', category: 'Currency Milestones', icon: Trophy },
  { id: 'gears_1b', name: 'Gear God', description: 'Possess 1 Billion Cogwheel Gears.', category: 'Currency Milestones', icon: Crown },

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
  { id: 'research_1b', name: 'Universal Mind', description: 'Possess 1 Billion Research Points.', category: 'Currency Milestones', icon: Crown },
  
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

  // New Category: Challenge Conqueror
  { id: 'challenge_first_complete', name: 'Challenge Conqueror', description: 'Complete your first challenge.', category: 'Challenge Conqueror', icon: Trophy },
  { id: 'challenge_tokens_100', name: 'Token Collector', description: 'Earn 100 total Challenge Tokens.', category: 'Challenge Conqueror', icon: Gem },
  { id: 'challenge_tokens_1k', name: 'Token Hoarder', description: 'Earn 1,000 total Challenge Tokens.', category: 'Challenge Conqueror', icon: Gem },
  { id: 'challenge_tokens_10k', name: 'Token Tycoon', description: 'Earn 10,000 total Challenge Tokens.', category: 'Challenge Conqueror', icon: Crown },
  { id: 'challenge_all_complete', name: 'Challenge Master', description: 'Complete every available challenge at least once.', category: 'Challenge Conqueror', icon: Crown, isSecret: true },
  { id: 'dimensional_upgrade_first', name: 'Token Spender', description: 'Purchase your first Dimensional Upgrade.', category: 'Challenge Conqueror', icon: Star },
  { id: 'dimensional_upgrade_max', name: 'Dimensional Lord', description: 'Max out any Dimensional Upgrade.', category: 'Challenge Conqueror', icon: Medal },
  { id: 'dimensional_upgrade_all_max', name: 'Reality Shaper', description: 'Max out all Dimensional Upgrades.', category: 'Challenge Conqueror', icon: Sparkles, isSecret: true },
  { id: 'challenge_repeat_5', name: 'Challenge Veteran', description: 'Complete the same challenge 5 times.', category: 'Challenge Conqueror', icon: Medal },

  // New Category: Workshop Mastery
  { id: 'workshop_10', name: 'Novice Artificer', description: 'Reach 10 total Workshop upgrade levels.', category: 'Workshop Mastery', icon: Award },
  { id: 'workshop_50', name: 'Adept Artificer', description: 'Reach 50 total Workshop upgrade levels.', category: 'Workshop Mastery', icon: Award },
  { id: 'workshop_100', name: 'Master Artificer', description: 'Reach 100 total Workshop upgrade levels.', category: 'Workshop Mastery', icon: Trophy },
  { id: 'workshop_200', name: 'Grandmaster Artificer', description: 'Reach 200 total Workshop upgrade levels.', category: 'Workshop Mastery', icon: Medal },
  { id: 'workshop_all_10', name: 'Jack of All Trades', description: 'Have all Workshop upgrades at level 10+.', category: 'Workshop Mastery', icon: Crown },

  // New Category: Overclock Engineer
  { id: 'overclock_1', name: 'Pushing the Limits', description: 'Activate Overclock for the first time.', category: 'Overclock Engineer', icon: Zap },
  { id: 'overclock_5', name: 'Full Throttle', description: 'Reach Overclock Level 5.', category: 'Overclock Engineer', icon: Award },
  { id: 'overclock_10', name: 'Redline', description: 'Reach Overclock Level 10.', category: 'Overclock Engineer', icon: Trophy },
  { id: 'overclock_15', name: 'Beyond Maximum', description: 'Reach Overclock Level 15.', category: 'Overclock Engineer', icon: Medal, isSecret: true },

  // New Category: Ancient Wisdom
  { id: 'ak_1', name: 'Echoes of the Past', description: 'Unlock your first Ancient Knowledge node.', category: 'Ancient Wisdom', icon: BrainCircuit },
  { id: 'ak_5', name: 'Whispers of Power', description: 'Unlock 5 Ancient Knowledge nodes.', category: 'Ancient Wisdom', icon: BrainCircuit },
  { id: 'ak_10', name: 'Voices of the Ancients', description: 'Unlock 10 Ancient Knowledge nodes.', category: 'Ancient Wisdom', icon: Network },
  { id: 'ak_20', name: 'Chorus of History', description: 'Unlock 20 Ancient Knowledge nodes.', category: 'Ancient Wisdom', icon: Network },
  { id: 'ak_30', name: 'Symphony of Ages', description: 'Unlock 30 Ancient Knowledge nodes.', category: 'Ancient Wisdom', icon: Crown },
  { id: 'ak_all', name: 'The Archivist', description: 'Unlock all Ancient Knowledge nodes.', category: 'Ancient Wisdom', icon: Crown, isSecret: true },

  // New Category: Speed Running
  { id: 'speed_prestige_30m', name: 'Speedrunner', description: 'Prestige within 30 minutes of starting a run.', category: 'Speed Running', icon: Clock },
  { id: 'speed_prestige_10m', name: 'Warp Speed', description: 'Prestige within 10 minutes of starting a run.', category: 'Speed Running', icon: Clock, isSecret: true },
  { id: 'speed_mana_1m_10m', name: 'Quick Mana', description: 'Reach 1 Million mana within 10 minutes.', category: 'Speed Running', icon: Clock },
  { id: 'speed_mana_1b_30m', name: 'Adept Quick Mana', description: 'Reach 1 Billion mana within 30 minutes.', category: 'Speed Running', icon: Clock },
  { id: 'speed_mana_1t_1h', name: 'Master Quick Mana', description: 'Reach 1 Trillion mana within 1 hour.', category: 'Speed Running', icon: Clock },
  { id: 'speed_cosmic_2h', name: 'Cosmic Sprint', description: 'Build a Cosmic Resonator within 2 hours of a run.', category: 'Speed Running', icon: Clock },
  
  // New Category: Efficiency Master
  { id: 'efficiency_one_item_100', name: 'Specialist', description: 'Reach 100 total item levels using only one type of item.', category: 'Efficiency Master', icon: Target },
  { id: 'efficiency_three_items_500', name: 'Focused Power', description: 'Reach 500 total item levels using only three types of items.', category: 'Efficiency Master', icon: Target },
  { id: 'efficiency_five_items_2k', name: 'Efficient Empire', description: 'Reach 2,000 total item levels using only five types of items.', category: 'Efficiency Master', icon: Target },
  { id: 'efficiency_no_click_1m_mana', name: 'Look, No Hands!', description: 'Reach 1 Million lifetime Mana without clicking the orb.', category: 'Efficiency Master', icon: Target, isSecret: true },
  { id: 'efficiency_upgrade_no_items', name: 'Theorycrafter', description: 'Purchase an upgrade before buying any items.', category: 'Efficiency Master', icon: Target },

  // New Category: Hidden & Fun
  { id: 'hidden_mana_777', name: 'Feeling Lucky?', description: 'Have exactly 777 mana.', category: 'Hidden & Fun', icon: Gem, isSecret: true },
  { id: 'hidden_dev_mode', name: 'Behind the Curtain', description: 'Activate developer mode.', category: 'Hidden & Fun', icon: Zap, isSecret: true },
  { id: 'hidden_42', name: 'The Answer', description: 'Own exactly 42 Mana Crystals.', category: 'Hidden & Fun', icon: Puzzle, isSecret: true },
  { id: 'hidden_endgame_synergy', name: 'Ultimate Power', description: 'Complete the research tree and have 5 golems active.', category: 'Hidden & Fun', icon: Sparkles, isSecret: true },
  { id: 'hidden_zero_power', name: 'A Leap of Faith', description: 'Prestige while generating zero mana per second.', category: 'Hidden & Fun', icon: Star, isSecret: true },
];

export const achievementMap = new Map(allAchievements.map(a => [a.id, a]));
