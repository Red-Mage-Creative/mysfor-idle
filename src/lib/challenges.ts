
import { Challenge, ChallengeEffects } from './gameTypes';
import { Award, Star, Trophy, Ban, FlaskConical, Boxes, Zap, BrainCircuit, Shuffle } from 'lucide-react';

export const challenges: Challenge[] = [
    {
        id: 'no_clicks',
        name: 'Hands Off',
        description: 'You cannot gain mana by clicking the forge. Rely solely on passive generation.',
        goalDescription: 'Reach 1e6 Mana.',
        reward: 5,
        isGoalReached: (gameState) => gameState.currencies.mana >= 1e6,
        applyRestrictions: (effects) => {
            effects.manaPerClick = 0;
            return effects;
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
        applyRestrictions: (effects) => {
            effects.allowedItemCategories = ['Basic Magitech'];
            return effects;
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
        applyRestrictions: (effects) => {
             effects.challengeFailConditions.push(
                (gameState: any) => (Date.now() - gameState.runStartTime) / 1000 > 600
             );
             return effects;
        },
        unlocksAtPrestige: 10,
        icon: Trophy,
    },
    // New Challenges
    {
        id: 'no_upgrades',
        name: 'No Upgrades',
        description: 'You cannot purchase any item upgrades.',
        goalDescription: 'Reach 1e10 Mana.',
        reward: 10,
        isGoalReached: (gameState) => gameState.currencies.mana >= 1e10,
        applyRestrictions: (effects) => {
            effects.canBuyItemUpgrades = false;
            return effects;
        },
        unlocksAtPrestige: 3,
        icon: Ban,
    },
    {
        id: 'essence_drought',
        name: 'Essence Drought',
        description: 'All Essence Flux generation is reduced by 90%.',
        goalDescription: 'Reach 1e15 Mana.',
        reward: 20,
        isGoalReached: (gameState) => gameState.currencies.mana >= 1e15,
        applyRestrictions: (effects) => {
            effects.generationMultiplier.essenceFlux = 0.1;
            return effects;
        },
        unlocksAtPrestige: 7,
        icon: FlaskConical,
    },
    {
        id: 'minimalist',
        name: 'Minimalist',
        description: 'You cannot own more than 3 different types of items.',
        goalDescription: 'Reach 1e20 Mana.',
        reward: 25,
        isGoalReached: (gameState) => gameState.currencies.mana >= 1e20,
        applyRestrictions: (effects) => {
            effects.challengeFailConditions.push(
                (gameState: any) => gameState.items.filter((i: any) => i.level > 0).length > 3
            );
            return effects;
        },
        unlocksAtPrestige: 12,
        icon: Boxes,
    },
    {
        id: 'speed_run_2',
        name: 'Speed Run II',
        description: 'A true test of speed. The challenge fails if not completed in time.',
        goalDescription: 'Reach 1e15 Mana within 5 minutes.',
        reward: 30,
        isGoalReached: (gameState) => gameState.currencies.mana >= 1e15,
        applyRestrictions: (effects) => {
             effects.challengeFailConditions.push(
                (gameState: any) => (Date.now() - gameState.runStartTime) / 1000 > 300
             );
             return effects;
        },
        unlocksAtPrestige: 15,
        icon: Zap,
    },
    {
        id: 'research_ban',
        name: 'Research Ban',
        description: 'You cannot spend any Research Points.',
        goalDescription: 'Reach 1e25 Mana.',
        reward: 40,
        isGoalReached: (gameState) => gameState.currencies.mana >= 1e25,
        applyRestrictions: (effects) => {
            effects.canSpendResearchPoints = false;
            return effects;
        },
        unlocksAtPrestige: 20,
        icon: BrainCircuit,
    },
    {
        id: 'unstable_golems',
        name: 'Unstable Golems',
        description: 'All Golem effects are halved (both positive and negative).',
        goalDescription: 'Reach 1e30 Mana.',
        reward: 50,
        isGoalReached: (gameState) => gameState.currencies.mana >= 1e30,
        applyRestrictions: (effects) => {
            effects.golemEffectMultiplier = 0.5;
            return effects;
        },
        unlocksAtPrestige: 25,
        icon: Shuffle,
    },
];

export const challengeMap = new Map(challenges.map(c => [c.id, c]));
