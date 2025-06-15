import { LucideIcon } from "lucide-react";

export type Currency = 'mana' | 'cogwheelGears' | 'essenceFlux' | 'researchPoints' | 'aetherShards';

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
export interface ResearchNode {
  id: string;
  name: string;
  description: string;
  cost: number; // researchPoints
  position: { x: number; y: number };
  prerequisites: string[];
  icon: LucideIcon;
  effect: {
    type: 'manaMultiplier' | 'allProductionMultiplier' | 'costReductionMultiplier' | 'specificItemMultiplier' | 'manaPerClickMultiplier' | 'essenceFluxMultiplier' | 'researchPointsMultiplier';
    value: number;
    itemId?: string; // for specificItemMultiplier
  };
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

export type GolemEffect = {
    target: GolemEffectTarget;
    multiplier: number; // e.g., 1.5 for +50%, 0.8 for -20%
};

export interface Golem {
    id: string;
    name: string;
    description: string;
    cost: number; // essenceFlux
    effects: GolemEffect[];
    icon: LucideIcon;
}

export type AchievementCategory = 'First Steps' | 'Currency Milestones' | 'Prestige Master' | 'Cosmic Achievements' | 'Research & Development';

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
}

export interface OfflineEarnings {
    timeAway: number; // in seconds
    earnings: CurrencyRecord;
}
