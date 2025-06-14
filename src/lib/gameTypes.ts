
import { LucideIcon } from "lucide-react";

export interface Upgrade {
  id: string;
  name: string;
  cost: number;
  baseCost: number;
  pps: number; // purrs per second
  level: number;
  icon: LucideIcon;
}
