
import { LucideIcon } from "lucide-react";

export type Currency = 'mana' | 'cogwheelGears' | 'essenceFlux' | 'researchPoints';

export type Currencies = Record<Currency, number>;

export type CurrencyRecord = Partial<Currencies>;

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: CurrencyRecord;
  baseCost: CurrencyRecord;
  generation: CurrencyRecord;
  level: number;
  icon: LucideIcon;
  category: 'Basic Magitech' | 'Advanced Machinery' | 'Mystical Artifacts';
}
