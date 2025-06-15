import { LucideIcon } from "lucide-react";

export type Currency = 'mana' | 'cogwheelGears' | 'essenceFlux' | 'researchPoints' | 'aetherShards' | 'challengeTokens';

export type Currencies = Record<Currency, number>;

export type CurrencyRecord = Partial<Currencies>;

export type PurchaseDetails = {
    purchaseQuantity: number;
    purchaseCost: CurrencyRecord;
    canAffordPurchase: boolean;
    nextLevelTarget: number | null;
    displayQuantity: string;
    intendedPurchaseQuantity: number;
    intendedPurchaseCost: CurrencyRecord;
};

// Renamed from Upgrade
export interface Item {
  id: string;
  name: string;
  description: string;
  cost: CurrencyRecord;
  baseCost: CurrencyRecord;
  generation: CurrencyRecord;
  clickBonus?: number;
  level: number;
  icon: LucideIcon;
  category: 'Basic Magitech' | 'Advanced Machinery' | 'Mystical Artifacts' | 'Transcendent Artifacts';
}

export interface ItemWithStats extends Item {
    totalProduction: CurrencyRecord;
    productionPerLevel: CurrencyRecord;
    totalClickBonus: number;
    clickBonusPerLevel: number;
    upgradeStats: {
        purchased: number;
        total: number;
    };
}

// New type for item upgrades
export type ItemUpgradeEffect = {
  type: 'generationMultiplier' | 'clickMultiplier' | 'unlockOverclockLevel';
  value: number;
};

export interface ItemUpgrade {
  id: string;
  name: string;
  description: string;
  parentItemId: string;
  unlocksAtLevel: number;
  cost: CurrencyRecord;
  effect: ItemUpgradeEffect;
  purchased: boolean;
  icon: LucideIcon;
}

// New type for Research
export type ResearchEffect =
  | { type: 'manaMultiplier'; value: number }
  | { type: 'allProductionMultiplier'; value: number }
  | { type: 'costReductionMultiplier'; value: number }
  | { type: 'specificItemMultiplier'; itemId: string; value: number }
  | { type: 'manaPerClickMultiplier'; value: number }
  | { type: 'essenceFluxMultiplier'; value: number }
  | { type: 'researchPointsMultiplier'; value: number }
  | { type: 'multiEffect'; effects: ResearchEffect[] }
  | { type: 'prestigeLevelBonusMultiplier'; value: number }
  | { type: 'offlineProductionMultiplier'; value: number }
  | { type: 'golemEffectMultiplier'; value: number }
  | { type: 'additionalActiveGolems'; value: number }
  | { type: 'aetherShardBonusMultiplier'; value: number }
  | { type: 'ancientKnowledgeBonusMultiplier'; value: number }
  | { type: 'prestigeBonusMultiplier'; target: 'aetherShards'; value: number }
  | { type: 'synergyEffectMultiplier'; value: number }
  | { type: 'singularityBonus'; value: number }
  | { type: 'offlineSpeedBoost'; value: number }
  | { type: 'manaToResearchConversion'; value: number }
  | { type: 'unlockItemUpgrade'; itemId: string; upgradeId: string };
  
export interface ResearchNode {
  id: string;
  name: string;
  description: string;
  cost: CurrencyRecord;
  position: { x: number; y: number };
  prerequisites: string[];
  icon: LucideIcon;
  category: string;
  effect: ResearchEffect;
}

// New type for workshop upgrades - refactored to be level-based
export interface WorkshopUpgrade {
  id: string;
  name: string;
  description: string;
  cost: CurrencyRecord; // cost for the next level
  baseCost: CurrencyRecord; // base cost at level 0
  level: number;
  effect: {
    type: 'manaMultiplier' | 'essenceFluxMultiplier' | 'researchPointsMultiplier';
    // This value is the additive bonus per level, e.g., 0.05 for +5%
    value: number;
  };
  icon: LucideIcon;
}

export interface PrestigeUpgrade {
  id: string;
  name: string;
  description: (level: number) => string;
  cost: (level: number) => number;
  maxLevel: number;
  effect: {
    type: 'manaClickMultiplier' | 'allProductionMultiplier' | 'shardGainMultiplier' | 'offlineProductionMultiplier' | 'costReductionMultiplier' | 'unlockAutoBuyItems' | 'unlockAutoBuyUpgrades';
    value: (level: number) => number;
  };
  icon: LucideIcon;
}

export type GolemEffectTarget = Currency | 'itemCost' | 'upgradeCost' | 'workshopCost' | 'researchCost';

export type GolemEffect =
    | { type: 'generationMultiplier'; target: Currency; value: number }
    | { type: 'flatGeneration'; target: Currency; value: number } // value can be negative for drain
    | { type: 'costMultiplier'; target: 'all'; value: number }
    | { type: 'shardGainMultiplier'; value: number }
    | { type: 'disableFeature'; feature: 'autoBuyItems' | 'autoBuyUpgrades' }
    | { type: 'randomEffect'; effects: GolemEffect[] };

export interface Golem {
    id: string;
    name: string;
    description: string;
    cost: number; // essenceFlux
    effects: GolemEffect[];
    icon: LucideIcon;
    tier: number;
    conflictsWith?: string[];
    unlocksAtPrestige?: number;
}

export interface GolemSynergy {
    id: string;
    name: string;
    description: string;
    golemIds: string[];
    effect: GolemEffect;
}

export type AchievementCategory = 'First Steps' | 'Currency Milestones' | 'Prestige Master' | 'Cosmic Achievements' | 'Research & Development' | 'Golem Mastery' | 'Workshop Mastery' | 'Overclock Engineer' | 'Efficiency Master' | 'Speed Running' | 'Ancient Wisdom' | 'Hidden & Fun';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  category: AchievementCategory;
  isSecret?: boolean;
}

export interface AchievementProgress {
  unlocked: boolean;
  unlockedAt?: number;
}

// New types for Dimensional Challenges
export interface Challenge {
  id: string;
  name: string;
  description: string;
  goalDescription: string;
  reward: number; // challenge tokens
  isGoalReached: (gameState: any) => boolean;
  applyRestrictions: (multipliers: any) => any;
  unlocksAtPrestige: number;
  icon: LucideIcon;
}

export interface DimensionalUpgrade {
  id: string;
  name: string;
  description: (level: number) => string;
  cost: (level: number) => number; // challenge tokens
  maxLevel: number;
  effect: {
    type: string;
    value: (level: number) => number;
  };
  icon: LucideIcon;
}

// New types for save data and offline progress
export interface GameSaveData {
    version: string;
    lastSaveTimestamp: number;
    currencies: Currencies;
    items: Item[];
    itemUpgrades: ItemUpgrade[];
    // Updated to save workshop upgrade levels instead of purchased status
    workshopUpgrades: Array<Pick<WorkshopUpgrade, 'id' | 'level'>>;
    lifetimeMana: number;
    prestigeUpgradeLevels: Record<string, number>;
    autoBuySettings?: {
        items: boolean;
        upgrades: boolean;
    };
    achievements?: Record<string, AchievementProgress>;
    notifiedUpgrades: string[];
    hasEverClicked: boolean;
    hasEverPrestiged: boolean;
    unlockedResearchNodeIds?: string[]; // New field for research
    activeGolemIds?: string[];
    overclockLevel: number;
    prestigeCount: number;
    hasBeatenGame?: boolean;
    gameCompletionShown?: boolean;
    ancientKnowledgeNodeIds?: string[];
    runStartTime?: number;

    // Dimensional Challenges
    activeChallengeId?: string | null;
    completedChallenges?: Record<string, number>; // id: completion count
    dimensionalUpgrades?: Record<string, number>; // id: level
}

export interface OfflineEarnings {
    timeAway: number; // in seconds
    earnings: CurrencyRecord;
}

export type GolemEffects = {
    generationMultiplier: Partial<Record<Currency, number>>;
    flatGeneration: Partial<Record<Currency, number>>;
    costMultiplier: number;
    shardGainMultiplier: number;
    disabledFeatures: Set<'autoBuyItems' | 'autoBuyUpgrades'>;
};
