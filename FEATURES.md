
# Mystic Forge - Feature Overview

This document provides a detailed breakdown of the features and systems within Mystic Forge.

## 1. Core Gameplay Loop

The player starts by manually generating `Mana`. This currency is used to buy `Items` that automate Mana generation. As more Mana is generated, the player unlocks new `Items`, `Upgrades`, and entire new game `Systems`. The ultimate goal of the core loop is to generate enough resources to perform a `Dimensional Shift` (Prestige).

## 2. Currencies & Resources

-   **Mana:** The primary currency, used for buying items and basic upgrades.
-   **Cogwheel Gears:** Unlocked mid-game, used for Workshop upgrades and Overclocking.
-   **Research Points:** Used to unlock nodes in the Research Tree for powerful, unique bonuses.
-   **Aether Shards:** Earned by Prestiging. Used to buy permanent, powerful upgrades that persist across resets.
-   **Challenge Tokens:** Earned by completing Dimensional Challenges. Used to purchase special Dimensional Upgrades.
-   **Essence Flux:** A late-game resource used to build and upgrade Essence Golems.

## 3. Progression Systems

### Item & Item Upgrades
- **7 Tiers of Items:** Each generates the previous tier's currency or a new one.
- **70+ Unique Upgrades:** Each item has 10 levels of specific, powerful upgrades that become available as the item is leveled up.

### The Workshop & Overclocking
- A system for investing Cogwheel Gears into global production multipliers.
- **Overclocking:** Players can push their Cogwheel Gear production to the limit for a massive, temporary boost, at the cost of disabling production for a short time afterward.

### Research Tree
- A tree of 50+ nodes that provide unique and powerful bonuses, from new autobuyers to unlocking entirely new mechanics like Golems.

### Prestige (Dimensional Shift)
- Players can reset their main progress (items, currencies, upgrades) in exchange for `Aether Shards`.
- Shards are used to purchase from a list of **20+ permanent upgrades** that fundamentally boost future runs.

## 4. End-Game & Post-Game Content

After completing the main game goal (forging the Cosmic Resonator), the player unlocks a robust post-game.

### Dimensional Challenges
- **9 Unique Challenges:** Each challenge modifies the core game rules (e.g., "no manual clicking," "production decreases over time").
- Completing challenges awards `Challenge Tokens` for the Dimensional Upgrades system.
- Challenges can be completed multiple times for increasing rewards.

### Dimensional Upgrades
- A special tier of **10+ powerful upgrades** purchased with Challenge Tokens.
- These provide massive boosts to end-game progression and Quality of Life.

### Essence Golems & Synergies
- Players can build and customize up to 3 Golems.
- Each Golem provides a unique bonus.
- Activating specific combinations of Golems unlocks powerful `Synergies`, adding another layer of strategic depth.

## 5. Achievements
- **80+ Achievements** tracking various milestones (first click, reaching X currency, prestiging fast, etc.).
- Each unlocked achievement contributes to a global production multiplier, rewarding players for exploration and diverse playstyles.

## 6. Quality of Life Features
- **Auto-Saving:** Game saves every 60 seconds.
- **Offline Progress:** Earn resources for up to 24 hours while away.
- **Auto-Buyers:** Unlock autobuyers for items and upgrades through the Research Tree.
- **Hotkeys:** Keyboard shortcuts for common actions.
- **Detailed Stats:** A comprehensive stats panel to track your progress.

## 7. Technical Stack
- **Framework:** React with Vite
- **Language:** TypeScript
- **UI:** Tailwind CSS with shadcn/ui components
- **State Management:** React Context API with custom hooks (`useReducer` pattern for complex state logic).
- **AI-Assisted Development:** Built with Lovable, an AI development environment.
