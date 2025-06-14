import { LucideIcon } from "lucide-react";

export type Currency = 'mana' | 'cogwheelGears' | 'essenceFlux' | 'researchPoints' | 'aetherShards';

export type Currencies = Record<Currency, number>;

export type CurrencyRecord = Partial<Currencies>;

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
  category: 'Basic Magitech' | 'Advanced Machinery' | 'Mystical Artifacts';
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
  type: 'generationMultiplier' | 'clickMultiplier';
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

export interface PrestigeUpgrade {
  id: string;
  name: string;
  description: (level: number) => string;
  cost: (level: number) => number;
  maxLevel: number;
  effect: {
    type: 'manaClickMultiplier' | 'allProductionMultiplier' | 'shardGainMultiplier';
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
    lifetimeMana: number;
    prestigeUpgradeLevels: Record<string, number>;
    notifiedUpgrades: string[];
    hasEverClicked: boolean;
}

export interface OfflineEarnings {
    timeAway: number; // in seconds
    earnings: CurrencyRecord;
}
