// MAELSTROM - Shared Utilities
// Seeded random, lerp helpers, localStorage, time formatting

export function seededRng(seed) {
    let s = seed || Date.now();
    return function() {
        s = Math.sin(s * 9999) * 10000;
        return s - Math.floor(s);
    };
}

export function lerp(a, b, t) {
    return a + (b - a) * Math.clamp(t, 0, 1);
}

export function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}

export function distance(a, b) {
    const dx = a.x - b.x;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dz * dz);
}

export function distance2D(ax, ay, bx, by) {
    const dx = ax - bx;
    const dy = ay - by;
    return Math.sqrt(dx * dx + dy * dy);
}

export function normalizeAngle(a) {
    while (a > Math.PI) a -= Math.PI * 2;
    while (a < -Math.PI) a += Math.PI * 2;
    return a;
}

export function angleDiff(a, b) {
    return normalizeAngle(b - a);
}

export function lerpAngle(a, b, t) {
    return a + angleDiff(a, b) * t;
}

export function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function formatNumber(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
}

// Load game save from localStorage
export function loadSave() {
    try {
        const data = localStorage.getItem('maelstrom_save');
        if (data) return JSON.parse(data);
    } catch (e) {}
    return {
        highScore: 0,
        bestTime: 0,
        totalRuns: 0,
        skulls: 0,
        upgrades: {}
    };
}

// Save game to localStorage
export function saveSave(data) {
    try {
        localStorage.setItem('maelstrom_save', JSON.stringify(data));
    } catch (e) {}
}

// Generate share text for death screen
export function generateShareText(state) {
    const mins = Math.floor(state.survivalTime / 60);
    const secs = Math.floor(state.survivalTime % 60);
    const fleet = '⛵'.repeat(Math.min(state.fleetSize, 5));
    const skull = state.skullGain > 0 ? `+${state.skullGain}💀` : '';
    return `🏴‍☠️ MAELSTROM\n⚓ Survived: ${mins}:${secs.toString().padStart(2,'0')}\n🪙 Score: ${formatNumber(state.score)}\nFleet: ${fleet} ${skull}`;
}

// Rarity colors
export const RARITY_COLORS = {
    common: '#9d9d9d',
    rare: '#4078ff',
    epic: '#a020f0',
    legendary: '#ffbe07'
};

// Rarity glow
export const RARITY_GLOW = {
    common: '0 0 10px #9d9d9d88',
    rare: '0 0 15px #4078ff88',
    epic: '0 0 20px #a020f088',
    legendary: '0 0 25px #ffbe0788, 0 0 40px #ff8c0088'
};

// Get emoji for enemy type
export function getEnemyEmoji(type) {
    const map = {
        rowboat: '🛶',
        sloop: '⛵',
        frigate: '🚢',
        galleon: '⚓',
        ghost: '👻',
        boss: '💀'
    };
    return map[type] || '🚢';
}
