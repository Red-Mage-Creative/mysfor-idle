import { Challenge } from './gameTypes';
import { Award, Star, Trophy } from 'lucide-react';

export const challenges: Challenge[] = [
    {
        id: 'no_clicks',
        name: 'Hands Off',
        description: 'You cannot gain mana by clicking the forge. Rely solely on passive generation.',
        goalDescription: 'Reach 1e6 Mana.',
        reward: 5,
        isGoalReached: (gameState) => gameState.currencies.mana >= 1e6,
        applyRestrictions: (multipliers) => {
            multipliers.manaPerClick = 0;
            return multipliers;
        },
        unlocksAtPrestige: 2,
        icon: Award,
        startingResources: { mana: 10 },
    },
    {
        id: 'basic_only',
        name: 'Back to Basics',
        description: 'You can only purchase items from the "Basic Magitech" category.',
        goalDescription: 'Reach 1e9 Mana.',
        reward: 10,
        isGoalReached: (gameState) => gameState.currencies.mana >= 1e9,
        applyRestrictions: (multipliers) => { 
            multipliers.challengeRestrictions = {
                ...multipliers.challengeRestrictions,
                allowedItemCategories: ['Basic Magitech']
            };
            return multipliers;
        },
        unlocksAtPrestige: 5,
        icon: Star,
    },
    {
        id: 'speed_run_1',
        name: 'Speed Run I',
        description: 'A test of speed and efficiency. The challenge fails if not completed in time.',
        goalDescription: 'Reach 1e12 Mana within 10 minutes.',
        reward: 15,
        isGoalReached: (gameState) => gameState.currencies.mana >= 1e12,
        applyRestrictions: (multipliers) => {
             multipliers.challengeFailConditions = [
                ...(multipliers.challengeFailConditions || []),
                (gameState: any) => (Date.now() - gameState.runStartTime) / 1000 > 600
             ]
             return multipliers;
        },
        unlocksAtPrestige: 10,
        icon: Trophy,
    },
];

export const challengeMap = new Map(challenges.map(c => [c.id, c]));
