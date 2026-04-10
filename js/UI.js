// MAELSTROM - UI Manager
// HUD, upgrade screens, death screen, menu

import { formatTime, formatNumber, RARITY_COLORS, RARITY_GLOW } from './utils.js';

export class UI {
    constructor(state, upgradeSystem) {
        this.state = state;
        this.upgrades = upgradeSystem;
        this.container = null;
        this.hud = null;
        this.upgradeScreen = null;
        this.deathScreen = null;
        this.menuScreen = null;
        this.touchControls = null;
    }

    init() {
        // Create main container
        this.container = document.createElement('div');
        this.container.id = 'game-ui';
        this.container.style.cssText = `
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            pointer-events: none;
            font-family: 'Trebuchet MS', 'Segoe UI', sans-serif;
            z-index: 100;
        `;
        document.body.appendChild(this.container);

        // Create screens
        this.createHUD();
        this.createMenuScreen();
        this.createUpgradeScreen();
        this.createDeathScreen();
        this.createLoadingScreen();
        this.createTouchControls();
        this.createBossHealthBar();

        // Show menu initially
        this.showMenu();
    }

    createHUD() {
        this.hud = document.createElement('div');
        this.hud.id = 'hud';
        this.hud.style.cssText = `
            display: none;
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            pointer-events: none;
        `;

        // Top-left: HP bar
        const hpContainer = document.createElement('div');
        hpContainer.id = 'hp-container';
        hpContainer.style.cssText = `
            position: absolute;
            top: 20px; left: 20px;
            width: 200px;
        `;

        const hpLabel = document.createElement('div');
        hpLabel.style.cssText = `
            color: #fff;
            font-size: 14px;
            font-weight: bold;
            text-shadow: 0 0 5px #000;
            margin-bottom: 5px;
        `;
        hpLabel.textContent = 'HULL';
        hpContainer.appendChild(hpLabel);

        const hpBar = document.createElement('div');
        hpBar.id = 'hp-bar';
        hpBar.style.cssText = `
            width: 100%;
            height: 20px;
            background: rgba(0,0,0,0.5);
            border: 2px solid #444;
            border-radius: 10px;
            overflow: hidden;
        `;

        const hpFill = document.createElement('div');
        hpFill.id = 'hp-fill';
        hpFill.style.cssText = `
            width: 100%;
            height: 100%;
            background: linear-gradient(to bottom, #ff4444, #cc0000);
            transition: width 0.3s;
            border-radius: 8px;
        `;
        hpBar.appendChild(hpFill);
        hpContainer.appendChild(hpBar);
        this.hud.appendChild(hpContainer);

        // Top-center: Timer
        const timer = document.createElement('div');
        timer.id = 'timer';
        timer.style.cssText = `
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            color: #ffd700;
            font-size: 36px;
            font-weight: bold;
            text-shadow: 0 0 10px #000, 0 0 20px #000;
            font-family: 'Courier New', monospace;
        `;
        timer.textContent = '00:00';
        this.hud.appendChild(timer);
        this.timer = timer;

        // Top-right: Doubloons + Level
        const scoreContainer = document.createElement('div');
        scoreContainer.id = 'score-container';
        scoreContainer.style.cssText = `
            position: absolute;
            top: 20px; right: 20px;
            text-align: right;
            color: #ffd700;
        `;

        const doubloons = document.createElement('div');
        doubloons.id = 'doubloons';
        doubloons.style.cssText = `
            font-size: 24px;
            font-weight: bold;
            text-shadow: 0 0 5px #000;
        `;
        doubloons.textContent = '🪙 0';
        scoreContainer.appendChild(doubloons);

        const level = document.createElement('div');
        level.id = 'level';
        level.style.cssText = `
            font-size: 16px;
            color: #aaa;
            text-shadow: 0 0 3px #000;
            margin-top: 5px;
        `;
        level.textContent = 'Level 1';
        scoreContainer.appendChild(level);

        // Level progress bar
        const levelBar = document.createElement('div');
        levelBar.id = 'level-bar';
        levelBar.style.cssText = `
            width: 150px;
            height: 8px;
            background: rgba(0,0,0,0.5);
            border: 1px solid #444;
            border-radius: 4px;
            margin-top: 5px;
            margin-left: auto;
            overflow: hidden;
        `;

        const levelFill = document.createElement('div');
        levelFill.id = 'level-fill';
        levelFill.style.cssText = `
            width: 0%;
            height: 100%;
            background: linear-gradient(to right, #ffd700, #ff8c00);
            transition: width 0.3s;
        `;
        levelBar.appendChild(levelFill);
        scoreContainer.appendChild(levelBar);
        this.hud.appendChild(scoreContainer);

        // Bottom-center: Fleet count
        const fleet = document.createElement('div');
        fleet.id = 'fleet';
        fleet.style.cssText = `
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            color: #fff;
            font-size: 14px;
            text-shadow: 0 0 5px #000;
            display: flex;
            gap: 5px;
            align-items: center;
        `;
        fleet.textContent = 'Fleet: ⛵ 1';
        this.hud.appendChild(fleet);
        this.fleet = fleet;

        // Kill counter
        const kills = document.createElement('div');
        kills.id = 'kills';
        kills.style.cssText = `
            position: absolute;
            bottom: 20px; right: 20px;
            color: #ff6666;
            font-size: 14px;
            text-shadow: 0 0 5px #000;
        `;
        kills.textContent = '⚔️ 0';
        this.hud.appendChild(kills);
        this.kills = kills;

        this.container.appendChild(this.hud);
    }

    createBossHealthBar() {
        this.bossBar = document.createElement('div');
        this.bossBar.id = 'boss-bar';
        this.bossBar.style.cssText = `
            display: none;
            position: absolute;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            width: 400px;
            pointer-events: none;
        `;

        const bossLabel = document.createElement('div');
        bossLabel.style.cssText = `
            color: #44ff99;
            font-size: 16px;
            font-weight: bold;
            text-align: center;
            text-shadow: 0 0 10px #44ff99;
            margin-bottom: 5px;
        `;
        bossLabel.textContent = '👻 GHOST SHIP BOSS 👻';
        this.bossBar.appendChild(bossLabel);

        const bar = document.createElement('div');
        bar.style.cssText = `
            width: 100%;
            height: 25px;
            background: rgba(0,0,0,0.7);
            border: 2px solid #44ff99;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 0 15px #44ff9955;
        `;

        const fill = document.createElement('div');
        fill.id = 'boss-fill';
        fill.style.cssText = `
            width: 100%;
            height: 100%;
            background: linear-gradient(to bottom, #44ff99, #22aa66);
            transition: width 0.3s;
        `;
        bar.appendChild(fill);
        this.bossBar.appendChild(bar);
        this.container.appendChild(this.bossBar);
    }

    createLoadingScreen() {
        this.loading = document.createElement('div');
        this.loading.id = 'loading';
        this.loading.style.cssText = `
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: linear-gradient(135deg, #0a1628 0%, #1a3a5c 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;

        const title = document.createElement('h1');
        title.style.cssText = `
            color: #ffd700;
            font-size: 64px;
            font-weight: bold;
            text-shadow: 0 0 20px #ffd700, 0 4px 0 #8B4513;
            margin-bottom: 10px;
            font-family: 'Georgia', serif;
        `;
        title.textContent = 'MAELSTROM';
        this.loading.appendChild(title);

        const subtitle = document.createElement('p');
        subtitle.style.cssText = `
            color: #aac;
            font-size: 18px;
            margin-bottom: 40px;
            font-style: italic;
        `;
        subtitle.textContent = 'Survive the Sea. Outlast the Storm.';
        this.loading.appendChild(subtitle);

        const progressBar = document.createElement('div');
        progressBar.style.cssText = `
            width: 300px;
            height: 20px;
            background: rgba(0,0,0,0.5);
            border: 2px solid #ffd700;
            border-radius: 10px;
            overflow: hidden;
        `;

        const progress = document.createElement('div');
        progress.id = 'load-progress';
        progress.style.cssText = `
            width: 0%;
            height: 100%;
            background: linear-gradient(to right, #ffd700, #ff8c00);
            transition: width 0.3s;
        `;
        progressBar.appendChild(progress);
        this.loading.appendChild(progressBar);

        const status = document.createElement('p');
        status.id = 'load-status';
        status.style.cssText = `
            color: #88a;
            font-size: 14px;
            margin-top: 15px;
        `;
        status.textContent = 'Preparing voyage...';
        this.loading.appendChild(status);

        document.body.appendChild(this.loading);
    }

    createMenuScreen() {
        this.menuScreen = document.createElement('div');
        this.menuScreen.id = 'menu';
        this.menuScreen.style.cssText = `
            display: none;
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: linear-gradient(135deg, rgba(10,26,40,0.95) 0%, rgba(26,58,92,0.95) 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 200;
        `;

        // Title
        const title = document.createElement('h1');
        title.style.cssText = `
            color: #ffd700;
            font-size: 72px;
            font-weight: bold;
            text-shadow: 0 0 30px #ffd700, 0 6px 0 #8B4513;
            margin-bottom: 10px;
            font-family: 'Georgia', serif;
            animation: pulse 2s ease-in-out infinite;
        `;
        title.textContent = 'MAELSTROM';
        this.menuScreen.appendChild(title);

        const subtitle = document.createElement('p');
        subtitle.style.cssText = `
            color: #aac;
            font-size: 20px;
            margin-bottom: 50px;
            font-style: italic;
        `;
        subtitle.textContent = 'Survive the Sea. Outlast the Storm. Rule the Deep.';
        this.menuScreen.appendChild(subtitle);

        // High score
        const save = this.state.getSave();
        if (save.highScore > 0) {
            const hs = document.createElement('p');
            hs.style.cssText = `
                color: #ffd700;
                font-size: 16px;
                margin-bottom: 30px;
            `;
            hs.textContent = `Best Score: ${formatNumber(save.highScore)} | Best Time: ${formatTime(save.bestTime)} | Skulls: ${save.skulls}`;
            this.menuScreen.appendChild(hs);
        }

        // Play button
        const playBtn = this.createButton('⚔️  SET SAIL', () => this.onPlay());
        playBtn.style.cssText += 'font-size: 28px; padding: 20px 60px;';
        this.menuScreen.appendChild(playBtn);

        // Controls info
        const controls = document.createElement('div');
        controls.style.cssText = `
            position: absolute;
            bottom: 40px;
            color: #668;
            font-size: 14px;
            text-align: center;
        `;
        controls.innerHTML = `
            <p>WASD or Arrow Keys to move | Cannons fire automatically</p>
            <p style="margin-top: 5px; color: #557;">🪙 Collect doubloons | ⬆️ Level up | ⚔️ Defeat bosses</p>
        `;
        this.menuScreen.appendChild(controls);

        // Sound toggle
        const soundBtn = document.createElement('button');
        soundBtn.id = 'sound-toggle';
        soundBtn.style.cssText = `
            position: absolute;
            top: 20px; right: 20px;
            background: rgba(0,0,0,0.5);
            border: 1px solid #ffd700;
            color: #ffd700;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            pointer-events: auto;
        `;
        soundBtn.textContent = '🔊 Sound';
        soundBtn.onclick = () => {
            if (this.state.audio) {
                const enabled = this.state.audio.toggle();
                soundBtn.textContent = enabled ? '🔊 Sound' : '🔇 Muted';
            }
        };
        this.menuScreen.appendChild(soundBtn);

        document.body.appendChild(this.menuScreen);
    }

    createUpgradeScreen() {
        this.upgradeScreen = document.createElement('div');
        this.upgradeScreen.id = 'upgrade-screen';
        this.upgradeScreen.style.cssText = `
            display: none;
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(10,20,40,0.9);
            backdrop-filter: blur(5px);
            z-index: 300;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        `;
        document.body.appendChild(this.upgradeScreen);
    }

    createDeathScreen() {
        this.deathScreen = document.createElement('div');
        this.deathScreen.id = 'death';
        this.deathScreen.style.cssText = `
            display: none;
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(20,0,0,0.95);
            z-index: 300;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        `;

        const title = document.createElement('h1');
        title.style.cssText = `
            color: #ff4444;
            font-size: 48px;
            font-weight: bold;
            text-shadow: 0 0 20px #ff0000;
            margin-bottom: 10px;
        `;
        title.textContent = 'YE HAVE SUNK';
        this.deathScreen.appendChild(title);

        const subtitle = document.createElement('p');
        subtitle.style.cssText = `
            color: #aa6666;
            font-size: 18px;
            margin-bottom: 40px;
            font-style: italic;
        `;
        subtitle.textContent = 'The sea claims another legend... for now.';
        this.deathScreen.appendChild(subtitle);

        const stats = document.createElement('div');
        stats.id = 'death-stats';
        stats.style.cssText = `
            color: #ffd700;
            font-size: 24px;
            text-align: center;
            margin-bottom: 30px;
        `;
        this.deathScreen.appendChild(stats);

        const buttons = document.createElement('div');
        buttons.style.cssText = `
            display: flex;
            gap: 20px;
        `;

        const retryBtn = this.createButton('⚔️ SAIL AGAIN', () => this.onPlay());
        buttons.appendChild(retryBtn);

        const shareBtn = this.createButton('📤 SHARE', () => this.onShare());
        buttons.appendChild(shareBtn);

        this.deathScreen.appendChild(buttons);
        document.body.appendChild(this.deathScreen);
    }

    createButton(text, onClick) {
        const btn = document.createElement('button');
        btn.textContent = text;
        btn.style.cssText = `
            background: linear-gradient(to bottom, #ffd700, #cc9900);
            border: 3px solid #ffd700;
            color: #1a1a2e;
            padding: 15px 40px;
            font-size: 20px;
            font-weight: bold;
            border-radius: 10px;
            cursor: pointer;
            pointer-events: auto;
            transition: all 0.2s;
            box-shadow: 0 4px 0 #8B4513, 0 0 20px rgba(255,215,0,0.3);
        `;
        btn.onmouseenter = () => {
            btn.style.transform = 'scale(1.05)';
            btn.style.boxShadow = '0 6px 0 #8B4513, 0 0 30px rgba(255,215,0,0.5)';
        };
        btn.onmouseleave = () => {
            btn.style.transform = 'scale(1)';
            btn.style.boxShadow = '0 4px 0 #8B4513, 0 0 20px rgba(255,215,0,0.3)';
        };
        btn.onclick = onClick;
        return btn;
    }

    createTouchControls() {
        this.touchControls = document.createElement('div');
        this.touchControls.id = 'touch-controls';
        this.touchControls.style.cssText = `
            display: none;
            position: fixed;
            bottom: 0; left: 0; right: 0;
            height: 200px;
            pointer-events: none;
            z-index: 150;
        `;

        // Virtual joystick
        const joystick = document.createElement('div');
        joystick.id = 'joystick';
        joystick.style.cssText = `
            position: absolute;
            bottom: 50px; left: 50px;
            width: 120px; height: 120px;
            background: rgba(255,255,255,0.1);
            border: 3px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            pointer-events: auto;
        `;

        const knob = document.createElement('div');
        knob.id = 'joystick-knob';
        knob.style.cssText = `
            position: absolute;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            width: 50px; height: 50px;
            background: rgba(255,215,0,0.5);
            border: 2px solid #ffd700;
            border-radius: 50%;
        `;
        joystick.appendChild(knob);

        // Touch handling
        let active = false;
        let startX = 0, startY = 0;

        joystick.addEventListener('touchstart', (e) => {
            e.preventDefault();
            active = true;
            const touch = e.touches[0];
            const rect = joystick.getBoundingClientRect();
            startX = rect.left + rect.width / 2;
            startY = rect.top + rect.height / 2;
        });

        joystick.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!active) return;
            const touch = e.touches[0];
            const dx = touch.clientX - startX;
            const dy = touch.clientY - startY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxDist = 35;

            const clampedX = Math.max(-maxDist, Math.min(maxDist, dx));
            const clampedY = Math.max(-maxDist, Math.min(maxDist, dy));
            const angle = Math.atan2(dy, dx);
            const finalDist = Math.min(dist, maxDist);

            knob.style.transform = `translate(calc(-50% + ${Math.cos(angle) * finalDist}px), calc(-50% + ${Math.sin(angle) * finalDist}px))`;

            this.state.joystickX = dx / maxDist;
            this.state.joystickY = dy / maxDist;
        });

        joystick.addEventListener('touchend', () => {
            active = false;
            knob.style.transform = 'translate(-50%, -50%)';
            this.state.joystickX = 0;
            this.state.joystickY = 0;
        });

        this.touchControls.appendChild(joystick);
        this.container.appendChild(this.touchControls);

        // Show touch controls on mobile
        if ('ontouchstart' in window) {
            this.touchControls.style.display = 'block';
        }
    }

    showLoading(progress, status) {
        const el = document.getElementById('load-progress');
        const statusEl = document.getElementById('load-status');
        if (el) el.style.width = (progress * 100) + '%';
        if (statusEl) statusEl.textContent = status || 'Loading...';
    }

    hideLoading() {
        if (this.loading) {
            this.loading.style.display = 'none';
        }
    }

    showMenu() {
        this.hideAll();
        if (this.menuScreen) this.menuScreen.style.display = 'flex';
        if (this.hud) this.hud.style.display = 'none';
        if (this.touchControls) this.touchControls.style.display = 'none';
    }

    showHUD() {
        this.hideAll();
        if (this.hud) this.hud.style.display = 'block';
        if (this.touchControls && 'ontouchstart' in window) {
            this.touchControls.style.display = 'block';
        }
    }

    showUpgradeScreen(upgrades) {
        this.upgradeScreen.innerHTML = '';

        const title = document.createElement('h2');
        title.style.cssText = `
            color: #ffd700;
            font-size: 36px;
            margin-bottom: 40px;
            text-shadow: 0 0 20px #ffd700;
        `;
        title.textContent = '⬆️ CHOOSE YOUR UPGRADE ⬆️';
        this.upgradeScreen.appendChild(title);

        const cardsContainer = document.createElement('div');
        cardsContainer.style.cssText = `
            display: flex;
            gap: 30px;
        `;

        upgrades.forEach((upg, i) => {
            const card = this.createUpgradeCard(upg, i);
            cardsContainer.appendChild(card);
        });

        this.upgradeScreen.appendChild(cardsContainer);

        // Keyboard hint
        const hint = document.createElement('p');
        hint.style.cssText = `
            color: #668;
            font-size: 14px;
            margin-top: 30px;
        `;
        hint.textContent = 'Press 1, 2, or 3 to select';
        this.upgradeScreen.appendChild(hint);

        this.upgradeScreen.style.display = 'flex';
    }

    createUpgradeCard(upgrade, index) {
        const card = document.createElement('div');
        const color = RARITY_COLORS[upgrade.rarity] || '#888';
        const glow = RARITY_GLOW[upgrade.rarity] || 'none';

        card.style.cssText = `
            width: 220px;
            background: linear-gradient(135deg, #1a1a2e, #2a2a4e);
            border: 3px solid ${color};
            border-radius: 15px;
            padding: 25px 20px;
            text-align: center;
            cursor: pointer;
            pointer-events: auto;
            transition: all 0.3s;
            box-shadow: ${glow};
            animation: cardFloat 2s ease-in-out infinite;
            animation-delay: ${index * 0.15}s;
        `;

        const icon = document.createElement('div');
        icon.style.cssText = `
            font-size: 64px;
            margin-bottom: 15px;
        `;
        icon.textContent = this.upgrades.getIconEmoji(upgrade.icon);
        card.appendChild(icon);

        const name = document.createElement('div');
        name.style.cssText = `
            color: ${color};
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
            text-shadow: 0 0 10px ${color};
        `;
        name.textContent = upgrade.name;
        card.appendChild(name);

        const desc = document.createElement('div');
        desc.style.cssText = `
            color: #aac;
            font-size: 14px;
            margin-bottom: 15px;
        `;
        desc.textContent = upgrade.desc;
        card.appendChild(desc);

        const rarity = document.createElement('div');
        rarity.style.cssText = `
            color: ${color};
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 2px;
        `;
        rarity.textContent = upgrade.rarity;
        card.appendChild(rarity);

        // Hover effect
        card.onmouseenter = () => {
            card.style.transform = 'scale(1.08) translateY(-5px)';
        };
        card.onmouseleave = () => {
            card.style.transform = 'scale(1)';
        };
        card.onclick = () => {
            if (this.state.audio) this.state.audio.playClick();
            this.upgrades.selectCard(index);
            this.hideUpgradeScreen();
            this.showHUD();
        };

        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes cardFloat {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-5px); }
            }
        `;
        if (!document.querySelector('#card-animation')) {
            style.id = 'card-animation';
            document.head.appendChild(style);
        }

        return card;
    }

    hideUpgradeScreen() {
        if (this.upgradeScreen) {
            this.upgradeScreen.style.display = 'none';
        }
    }

    showDeathScreen(state) {
        const stats = document.getElementById('death-stats');
        if (stats) {
            const mins = Math.floor(state.survivalTime / 60);
            const secs = Math.floor(state.survivalTime % 60);
            const fleet = '⛵'.repeat(Math.min(state.fleetSize, 5));

            stats.innerHTML = `
                <div style="margin-bottom: 20px;">
                    <div>Survival Time: <strong>${mins}:${secs.toString().padStart(2,'0')}</strong></div>
                    <div>Score: <strong>${formatNumber(state.score)}</strong></div>
                    <div>Fleet: ${fleet}</div>
                    <div>Kills: <strong>${state.kills}</strong></div>
                </div>
                <div style="font-size: 20px; color: #ff6666;">
                    +${state.skullGain} 💀 Skulls earned!
                </div>
            `;
        }

        this.deathScreen.style.display = 'flex';
    }

    hideDeathScreen() {
        if (this.deathScreen) this.deathScreen.style.display = 'none';
    }

    hideAll() {
        if (this.loading) this.loading.style.display = 'none';
        if (this.menuScreen) this.menuScreen.style.display = 'none';
        if (this.upgradeScreen) this.upgradeScreen.style.display = 'none';
        if (this.deathScreen) this.deathScreen.style.display = 'none';
    }

    // HUD Updates
    updateHUD(state) {
        if (!this.hud) return;

        // HP
        const hpFill = document.getElementById('hp-fill');
        if (hpFill) {
            const hpPercent = (state.playerHP / state.playerMaxHP) * 100;
            hpFill.style.width = hpPercent + '%';
            hpFill.style.background = hpPercent > 50
                ? 'linear-gradient(to bottom, #44ff44, #00aa00)'
                : hpPercent > 25
                    ? 'linear-gradient(to bottom, #ffaa00, #ff6600)'
                    : 'linear-gradient(to bottom, #ff4444, #cc0000)';
        }

        // Timer
        if (this.timer) {
            this.timer.textContent = formatTime(state.survivalTime);
            if (state.survivalTime >= 1500) { // 25 min
                this.timer.style.color = '#ff4444';
            }
        }

        // Doubloons
        const doubloons = document.getElementById('doubloons');
        if (doubloons) {
            doubloons.textContent = `🪙 ${formatNumber(state.doubloons)}`;
        }

        // Level
        const level = document.getElementById('level');
        const levelFill = document.getElementById('level-fill');
        if (level) level.textContent = `Level ${state.level}`;
        if (levelFill) levelFill.style.width = (state.getLevelProgress() * 100) + '%';

        // Fleet
        if (this.fleet) {
            this.fleet.textContent = `Fleet: ${'⛵'.repeat(state.fleetSize)}`;
        }

        // Kills
        if (this.kills) {
            this.kills.textContent = `⚔️ ${state.kills}`;
        }

        // Boss HP
        if (this.bossBar) {
            if (state.bossActive && state.bossMaxHP > 0) {
                this.bossBar.style.display = 'block';
                const fill = document.getElementById('boss-fill');
                if (fill) {
                    fill.style.width = ((state.bossHP / state.bossMaxHP) * 100) + '%';
                }
            } else {
                this.bossBar.style.display = 'none';
            }
        }
    }

    onPlay() {
        if (this.state.audio) this.state.audio.playClick();
        if (this.onPlayCallback) this.onPlayCallback();
    }

    onShare() {
        if (this.state.audio) this.state.audio.playClick();
        const shareText = `🏴‍☠️ MAELSTROM\n⚓ Survived: ${formatTime(this.state.survivalTime)}\n🪙 Score: ${formatNumber(this.state.score)}\n⚔️ Kills: ${this.state.kills}`;
        if (navigator.share) {
            navigator.share({ text: shareText });
        } else {
            navigator.clipboard.writeText(shareText).then(() => {
                alert('Copied to clipboard!');
            });
        }
    }

    setOnPlay(callback) {
        this.onPlayCallback = callback;
    }
}
