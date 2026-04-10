// MAELSTROM - Central Game State
// State machine and persistent game data

import { loadSave, saveSave } from './utils.js';

export const GamePhase = {
    MENU: 'menu',
    LOADING: 'loading',
    PLAYING: 'playing',
    UPGRADE: 'upgrade',
    DEAD: 'dead',
    BOSS_INTRO: 'boss_intro'
};

export class GameState {
    constructor() {
        this.phase = GamePhase.MENU;
        this.reset();

        // Load persisted save
        this.save = loadSave();

        // Upgrade choices available this run
        this.availableUpgrades = [];

        // Wave system
        this.waveNumber = 0;
        this.waveTimer = 0;
        this.waveInterval = 15; // seconds between waves
        this.bossActive = false;
        this.bossKills = 0;

        // Difficulty scaling
        this.difficultyMultiplier = 1;
    }

    reset() {
        this.playerHP = 100;
        this.playerMaxHP = 100;
        this.doubloons = 0;
        this.level = 1;
        this.doubloonsToNextLevel = 100;
        this.totalDoubloons = 0;
        this.score = 0;
        this.survivalTime = 0;
        this.fleetSize = 1;
        this.fleetHP = [100];
        this.kills = 0;
        this.skullGain = 0;

        // Player stats
        this.cannonCount = 2;
        this.cannonDamage = 15;
        this.cannonFireRate = 1.5; // seconds between shots
        this.cannonRange = 25;
        this.moveSpeed = 1;
        this.pickupRadius = 5;

        // Active upgrades this run
        this.activeUpgrades = [];
        this.bonusUpgrades = [];

        // Boss state
        this.bossHP = 0;
        this.bossMaxHP = 0;
        this.bossPhase = 1;
        this.bossActive = false;

        // Wave
        this.waveNumber = 0;
        this.waveTimer = 0;
        this.enemiesThisWave = 0;

        // Unlock state
        this.unlockedShips = ['pirate_small'];
        this.ownedShips = 'pirate_small';
    }

    addDoubloons(amount) {
        this.doubloons += amount;
        this.totalDoubloons += amount;
        this.score += amount;
    }

    spendDoubloons(amount) {
        if (this.doubloons >= amount) {
            this.doubloons -= amount;
            return true;
        }
        return false;
    }

    checkLevelUp() {
        if (this.totalDoubloons >= this.doubloonsToNextLevel * this.level) {
            this.level++;
            return true;
        }
        return false;
    }

    getLevelProgress() {
        const threshold = this.doubloonsToNextLevel * this.level;
        const prevThreshold = this.doubloonsToNextLevel * (this.level - 1);
        return (this.totalDoubloons - prevThreshold) / (threshold - prevThreshold);
    }

    takeDamage(amount) {
        this.playerHP -= amount;
        if (this.playerHP <= 0) {
            this.playerHP = 0;
            this.phase = GamePhase.DEAD;
            this.calculateSkullGain();
            this.saveRun();
            return true;
        }
        return false;
    }

    calculateSkullGain() {
        let gain = Math.floor(this.totalDoubloons / 100);
        gain += this.kills;
        if (this.bossKills > 0) gain += this.bossKills * 5;
        if (this.survivalTime >= 600) gain += 50;
        else if (this.survivalTime >= 300) gain += 25;
        else if (this.survivalTime >= 120) gain += 10;

        this.skullGain = gain;
        this.save.skulls += gain;
        if (this.score > this.save.highScore) this.save.highScore = this.score;
        if (this.survivalTime > this.save.bestTime) this.save.bestTime = this.survivalTime;
        this.save.totalRuns++;
        saveSave(this.save);
    }

    saveRun() {
        // Already saved in calculateSkullGain
    }

    getSave() {
        return this.save;
    }

    addUpgrade(upgrade) {
        this.activeUpgrades.push(upgrade);

        // Apply upgrade effects
        switch (upgrade.id) {
            case 'cannon_1':
            case 'cannon_2':
                this.cannonCount++;
                break;
            case 'damage_1':
                this.cannonDamage += 5;
                break;
            case 'damage_2':
                this.cannonDamage += 10;
                break;
            case 'speed_1':
                this.moveSpeed += 0.3;
                break;
            case 'speed_2':
                this.moveSpeed += 0.5;
                break;
            case 'hp_1':
                this.playerMaxHP += 30;
                this.playerHP += 30;
                break;
            case 'hp_2':
                this.playerMaxHP += 50;
                this.playerHP += 50;
                break;
            case 'fleet_1':
                this.fleetSize++;
                this.fleetHP.push(80);
                break;
            case 'fleet_2':
                this.fleetSize++;
                this.fleetHP.push(120);
                break;
            case 'range_1':
                this.cannonRange += 5;
                break;
            case 'range_2':
                this.cannonRange += 10;
                break;
            case 'firerate_1':
                this.cannonFireRate *= 0.8;
                break;
            case 'firerate_2':
                this.cannonFireRate *= 0.7;
                break;
            case 'pickup_1':
                this.pickupRadius += 3;
                break;
            case 'pickup_2':
                this.pickupRadius += 5;
                break;
            case 'barrage':
                this.cannonDamage += 20;
                this.cannonCount += 2;
                break;
            case 'armada':
                this.fleetSize += 3;
                for (let i = 0; i < 3; i++) this.fleetHP.push(100);
                break;
            case 'ghost_slayer':
                this.cannonDamage *= 2; // vs ghosts
                break;
            case 'fortress':
                this.playerMaxHP += 100;
                this.playerHP += 100;
                this.cannonDamage += 15;
                break;
        }
    }
}
