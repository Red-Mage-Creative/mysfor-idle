
import { Mouse, Fish, ToyBrick, Cat } from 'lucide-react';
import { Upgrade } from './gameTypes';

export const initialUpgrades: Upgrade[] = [
  {
    id: 'catnip_mouse',
    name: 'Catnip Mouse',
    baseCost: 15,
    cost: 15,
    pps: 0.1,
    level: 0,
    icon: Mouse,
  },
  {
    id: 'tasty_fish',
    name: 'Tasty Fish',
    baseCost: 100,
    cost: 100,
    pps: 1,
    level: 0,
    icon: Fish,
  },
  {
    id: 'yarn_ball',
    name: 'Ball of Yarn',
    baseCost: 1100,
    cost: 1100,
    pps: 8,
    level: 0,
    icon: ToyBrick, // Using ToyBrick as a stand-in for a yarn ball
  },
  {
    id: 'fellow_cat',
    name: 'Another Cat',
    baseCost: 12000,
    cost: 12000,
    pps: 47,
    level: 0,
    icon: Cat,
  },
];
