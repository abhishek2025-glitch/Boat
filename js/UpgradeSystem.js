// MAELSTROM - Upgrade System
// Level-up cards with upgrade pool and application

import { RARITY_COLORS, RARITY_GLOW } from './utils.js';

const ALL_UPGRADES = [
    // Common
    { id: 'cannon_1', name: 'Extra Cannon', rarity: 'common',
      desc: '+1 cannon to flagship', category: 'weapon', icon: 'cannon' },
    { id: 'damage_1', name: 'Cannonballs', rarity: 'common',
      desc: '+5 cannon damage', category: 'weapon', icon: 'cannon-ball' },
    { id: 'hp_1', name: 'Reinforce Hull', rarity: 'common',
      desc: '+30 max HP', category: 'hull', icon: 'ship-small' },
    { id: 'speed_1', name: 'Better Sails', rarity: 'common',
      desc: '+30% move speed', category: 'hull', icon: 'flag' },
    { id: 'fleet_1', name: 'Recruit Crew', rarity: 'common',
      desc: '+1 fleet ship', category: 'fleet', icon: 'boat-row-small' },
    { id: 'firerate_1', name: 'Quick Load', rarity: 'common',
      desc: '+25% fire rate', category: 'weapon', icon: 'cannon' },

    // Rare
    { id: 'cannon_2', name: 'Dual Cannons', rarity: 'rare',
      desc: '+2 cannons', category: 'weapon', icon: 'cannon-mobile' },
    { id: 'damage_2', name: 'Heavy Shot', rarity: 'rare',
      desc: '+10 cannon damage', category: 'weapon', icon: 'cannon-ball' },
    { id: 'hp_2', name: 'Iron Plating', rarity: 'rare',
      desc: '+50 max HP', category: 'hull', icon: 'castle-wall' },
    { id: 'speed_2', name: 'Wind Rider', rarity: 'rare',
      desc: '+50% move speed', category: 'hull', icon: 'flag-pirate' },
    { id: 'fleet_2', name: 'Armed Escort', rarity: 'rare',
      desc: '+1 armed ship', category: 'fleet', icon: 'ship-pirate-small' },
    { id: 'range_1', name: 'Long Range', rarity: 'rare',
      desc: '+5 cannon range', category: 'weapon', icon: 'tower-watch' },
    { id: 'pickup_1', name: 'Treasure Sense', rarity: 'rare',
      desc: '+3 pickup radius', category: 'special', icon: 'chest' },

    // Epic
    { id: 'barrage', name: 'Cannon Barrage', rarity: 'epic',
      desc: '+2 cannons, +20 dmg', category: 'weapon', icon: 'cannon-ball' },
    { id: 'armada', name: 'Full Armada', rarity: 'epic',
      desc: '+3 fleet ships', category: 'fleet', icon: 'ship-pirate-medium' },
    { id: 'firerate_2', name: 'Rapid Fire', rarity: 'epic',
      desc: '+50% fire rate', category: 'weapon', icon: 'cannon-mobile' },
    { id: 'range_2', name: 'Artillery', rarity: 'epic',
      desc: '+10 range, +10 dmg', category: 'weapon', icon: 'tower-complete-small' },
    { id: 'pickup_2', name: 'Magnet', rarity: 'epic',
      desc: '+5 pickup radius', category: 'special', icon: 'chest' },
    { id: 'fortress', name: 'Fortress Hull', rarity: 'epic',
      desc: '+100 HP, +15 dmg', category: 'hull', icon: 'castle-gate' },

    // Legendary
    { id: 'ghost_slayer', name: 'Ghost Breaker', rarity: 'legendary',
      desc: '2x damage vs ghosts', category: 'weapon', icon: 'ship-ghost' },
    { id: 'mega_fleet', name: 'The Armada', rarity: 'legendary',
      desc: '+6 fleet ships', category: 'fleet', icon: 'ship-pirate-large' },
    { id: 'devastation', name: 'Devastation', rarity: 'legendary',
      desc: 'All weapons enhanced', category: 'weapon', icon: 'tower-complete-large' }
];

export class UpgradeSystem {
    constructor(state, ui) {
        this.state = state;
        this.ui = ui;
        this.pendingUpgrades = [];
        this.onUpgradeSelected = null;
    }

    // Draw 3 random upgrade cards
    drawCards() {
        const pool = this.getAvailablePool();
        const cards = [];
        const used = new Set();

        // Prefer higher rarities as game progresses
        const epicChance = Math.min(0.3, this.state.level * 0.05);
        const legendaryChance = Math.min(0.1, this.state.level * 0.02);

        while (cards.length < 3 && pool.length > 0) {
            let roll = Math.random();
            let targetRarity = 'common';

            if (roll < legendaryChance) targetRarity = 'legendary';
            else if (roll < epicChance) targetRarity = 'epic';
            else if (roll < epicChance * 2) targetRarity = 'rare';

            // Find upgrade of target rarity
            const candidates = pool.filter(u =>
                u.rarity === targetRarity && !used.has(u.id)
            );

            if (candidates.length === 0) {
                // Fall back to any available
                const fallback = pool.filter(u => !used.has(u.id));
                if (fallback.length > 0) {
                    const upg = fallback[Math.floor(Math.random() * fallback.length)];
                    cards.push(upg);
                    used.add(upg.id);
                }
            } else {
                const upg = candidates[Math.floor(Math.random() * candidates.length)];
                cards.push(upg);
                used.add(upg.id);
            }
        }

        this.pendingUpgrades = cards;
        return cards;
    }

    getAvailablePool() {
        return ALL_UPGRADES.filter(upg => {
            // Don't offer duplicates already taken (except for stackable)
            const alreadyHave = this.state.activeUpgrades.filter(a => a.id === upg.id);
            const maxStacks = upg.id.includes('_1') ? 2 : 1; // _1 upgrades can stack twice
            return alreadyHave.length < maxStacks;
        });
    }

    selectCard(index) {
        if (index < 0 || index >= this.pendingUpgrades.length) return;

        const upgrade = this.pendingUpgrades[index];
        this.state.addUpgrade(upgrade);
        this.pendingUpgrades = [];

        if (this.onUpgradeSelected) {
            this.onUpgradeSelected(upgrade);
        }

        return upgrade;
    }

    getRarityColor(rarity) {
        return RARITY_COLORS[rarity] || RARITY_COLORS.common;
    }

    getRarityGlow(rarity) {
        return RARITY_GLOW[rarity] || RARITY_GLOW.common;
    }

    getIconEmoji(icon) {
        const map = {
            'cannon': '💣',
            'cannon-ball': '⚫',
            'cannon-mobile': '🔫',
            'ship-small': '⛵',
            'ship-pirate-small': '🏴‍☠️',
            'ship-pirate-medium': '⚓',
            'ship-pirate-large': '🚢',
            'ship-ghost': '👻',
            'boat-row-small': '🛶',
            'castle-wall': '🧱',
            'castle-gate': '🚪',
            'tower-watch': '🗼',
            'tower-complete-small': '🏰',
            'tower-complete-large': '🗽',
            'flag': '🚩',
            'flag-pirate': '🏴‍☠️',
            'chest': '📦',
            'barrel': '🛢️',
            'default': '⬆️'
        };
        return map[icon] || map.default;
    }
}
