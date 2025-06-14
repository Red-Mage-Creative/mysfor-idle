
import { LucideIcon } from "lucide-react";

export interface Upgrade {
  id: string;
  name: string;
  cost: number;
  baseCost: number;
  mps: number; // mana per second
  level: number;
  icon: LucideIcon;
}
