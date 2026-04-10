// MAELSTROM - Enemy System
// Wave-based enemy spawning with AI behaviors

import * as THREE from 'three';
import { seededRng, lerp, clamp, distance, lerpAngle } from './utils.js';

const ENEMY_TYPES = {
    rowboat: {
        glb: 'boat-row-small',
        hp: 15,
        speed: 8,
        damage: 5,
        doubloons: 1,
        scale: 1.2,
        hitRadius: 2,
        color: 0x8B4513,
        name: 'Rowboat Raider',
        behavior: 'swarm' // Beelines to player
    },
    sloop: {
        glb: 'ship-small',
        hp: 40,
        speed: 5,
        damage: 10,
        doubloons: 5,
        scale: 1.0,
        hitRadius: 3,
        color: 0x654321,
        name: 'Sloop Hunter',
        behavior: 'skirmish' // Circles and fires
    },
    frigate: {
        glb: 'ship-medium',
        hp: 100,
        speed: 3,
        damage: 20,
        doubloons: 15,
        scale: 1.2,
        hitRadius: 4,
        color: 0x4a3728,
        name: 'Navy Frigate',
        behavior: 'tank' // Slow approach, fires volleys
    },
    galleon: {
        glb: 'ship-large',
        hp: 250,
        speed: 2,
        damage: 35,
        doubloons: 40,
        scale: 1.3,
        hitRadius: 6,
        color: 0x2d1f14,
        name: 'Armada Galleon',
        behavior: 'elite' // Flanking + spawns minions on death
    },
    ghost: {
        glb: 'ship-ghost',
        hp: 200,
        speed: 6,
        damage: 25,
        doubloons: 200,
        scale: 1.5,
        hitRadius: 5,
        color: 0x44ff99,
        name: 'Ghost Ship',
        behavior: 'phase', // Phases, spawns ghost rowboats
        emissive: true
    },
    boss: {
        glb: 'ship-ghost',
        hp: 800,
        speed: 4,
        damage: 40,
        doubloons: 200,
        scale: 2.5,
        hitRadius: 8,
        color: 0x44ff99,
        name: 'GHOST SHIP BOSS',
        behavior: 'boss',
        emissive: true
    }
};

export class EnemySystem {
    constructor(scene, state, assets, projectiles) {
        this.scene = scene;
        this.state = state;
        this.assets = assets;
        this.projectiles = projectiles;

        this.enemies = [];
        this.spawnTimer = 0;
        this.waveTimer = 0;
        this.waveNumber = 0;
        this.rng = seededRng(Date.now());

        this.bossSpawned = false;
        this.bossSpawnTimer = 480; // 8 minutes
    }

    update(delta, playerPos) {
        this.state.enemies = this.enemies;

        // Wave timer
        this.waveTimer += delta;

        // Boss spawn timer
        if (!this.bossSpawned && this.state.survivalTime >= 480) {
            this.spawnBoss();
            this.bossSpawned = true;
        }

        // Spawn enemies based on time
        const spawnInterval = this.getSpawnInterval();
        this.spawnTimer += delta;

        if (this.spawnTimer >= spawnInterval && this.enemies.length < 50) {
            this.spawnTimer = 0;
            this.spawnWave(playerPos);
        }

        // Update each enemy
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            if (!enemy || enemy.dead) {
                this.enemies.splice(i, 1);
                continue;
            }

            this.updateEnemy(enemy, delta, playerPos);

            // Remove if too far
            if (enemy.mesh && playerPos) {
                const dist = playerPos.distanceTo(enemy.mesh.position);
                if (dist > 150) {
                    this.removeEnemy(enemy);
                    this.enemies.splice(i, 1);
                }
            }
        }
    }

    getSpawnInterval() {
        // Faster spawning as time goes on
        const base = 3;
        const min = 0.5;
        const reduction = this.state.survivalTime * 0.01;
        return Math.max(min, base - reduction);
    }

    spawnWave(playerPos) {
        const minute = Math.floor(this.state.survivalTime / 60);
        const types = this.getAvailableTypes(minute);
        const count = this.getWaveCount(minute);

        for (let i = 0; i < count; i++) {
            const type = types[Math.floor(this.rng() * types.length)];
            this.spawnEnemy(type, playerPos);
        }
    }

    getAvailableTypes(minute) {
        const types = ['rowboat'];
        if (minute >= 2) types.push('sloop');
        if (minute >= 5) types.push('frigate');
        if (minute >= 10) types.push('galleon');
        if (minute >= 8 && !this.bossSpawned) types.push('ghost');
        return types;
    }

    getWaveCount(minute) {
        return Math.min(5 + minute, 15);
    }

    spawnEnemy(typeKey, playerPos) {
        const type = ENEMY_TYPES[typeKey];
        if (!type) return;

        const group = new THREE.Group();

        // Load model
        const model = this.assets.getMesh(type.glb);
        model.scale.setScalar(type.scale);
        model.name = 'Enemy_' + typeKey;

        // Apply emissive for ghost enemies
        if (type.emissive) {
            model.traverse((child) => {
                if (child.isMesh && child.material) {
                    child.material = child.material.clone();
                    child.material.emissive = new THREE.Color(type.color);
                    child.material.emissiveIntensity = 0.3;
                    child.material.transparent = true;
                    child.material.opacity = 0.85;
                }
            });
        }

        group.add(model);

        // Spawn position (off-screen, random angle)
        const angle = this.rng() * Math.PI * 2;
        const dist = 60 + this.rng() * 40;
        group.position.set(
            (playerPos?.x || 0) + Math.cos(angle) * dist,
            0,
            (playerPos?.z || 0) + Math.sin(angle) * dist
        );

        group.rotation.y = angle + Math.PI; // Face player

        this.scene.add(group);

        const enemy = {
            mesh: group,
            model: model,
            type: typeKey,
            hp: type.hp,
            maxHP: type.hp,
            speed: type.speed,
            damage: type.damage,
            doubloons: type.doubloons,
            hitRadius: type.hitRadius,
            behavior: type.behavior,
            dead: false,
            fireTimer: 2 + this.rng() * 2,
            fireRate: type.behavior === 'skirmish' ? 2 : 3,
            orbitAngle: this.rng() * Math.PI * 2,
            targetRotation: 0
        };

        this.enemies.push(enemy);
        return enemy;
    }

    spawnBoss() {
        const playerPos = this.state.player?.getPosition();
        const boss = this.spawnEnemy('boss', playerPos);
        if (boss) {
            boss.hp = 800 + this.state.bossKills * 200;
            boss.maxHP = boss.hp;
            boss.speed = 4 + this.state.bossKills * 0.5;
            this.state.bossHP = boss.hp;
            this.state.bossMaxHP = boss.maxHP;
            this.state.bossActive = true;
            this.state.bossPhase = 1;
        }
    }

    updateEnemy(enemy, delta, playerPos) {
        if (enemy.dead || !enemy.mesh || !playerPos) return;

        const type = ENEMY_TYPES[enemy.type];
        const pos = enemy.mesh.position;
        const toPlayer = new THREE.Vector3().subVectors(playerPos, pos);
        const dist = toPlayer.length();
        toPlayer.normalize();

        // Behavior
        switch (enemy.behavior) {
            case 'swarm':
                // Beeline to player
                enemy.targetRotation = Math.atan2(toPlayer.x, toPlayer.z);
                pos.add(toPlayer.multiplyScalar(enemy.speed * delta));

                // Collision damage
                if (dist < 4) {
                    this.state.player.takeDamage(enemy.damage * delta);
                }
                break;

            case 'skirmish':
                // Circle and fire
                enemy.orbitAngle += delta * 0.5;
                const orbitDist = 20;
                const targetPos = playerPos.clone().add(
                    new THREE.Vector3(
                        Math.cos(enemy.orbitAngle) * orbitDist,
                        0,
                        Math.sin(enemy.orbitAngle) * orbitDist
                    )
                );
                const toOrbit = new THREE.Vector3().subVectors(targetPos, pos).normalize();

                enemy.targetRotation = Math.atan2(toOrbit.x, toOrbit.z);
                pos.add(toOrbit.multiplyScalar(enemy.speed * delta));

                // Fire
                enemy.fireTimer -= delta;
                if (enemy.fireTimer <= 0 && dist < 30) {
                    enemy.fireTimer = enemy.fireRate + this.rng();
                    const dir = toPlayer.clone();
                    dir.y += 0.3;
                    dir.normalize();
                    const cannonPos = pos.clone().add(new THREE.Vector3(0, 2, 2));
                    this.projectiles.fire(cannonPos, dir, enemy.damage, true);
                }
                break;

            case 'tank':
                // Slow approach + volley fire
                enemy.targetRotation = Math.atan2(toPlayer.x, toPlayer.z);
                if (dist > 15) {
                    pos.add(toPlayer.multiplyScalar(enemy.speed * delta));
                }

                enemy.fireTimer -= delta;
                if (enemy.fireTimer <= 0 && dist < 25) {
                    enemy.fireTimer = 4 + this.rng() * 2;
                    // Volley of 3
                    for (let i = 0; i < 3; i++) {
                        const spread = (i - 1) * 0.15;
                        const dir = toPlayer.clone();
                        dir.x += spread;
                        dir.z += spread;
                        dir.y += 0.2;
                        dir.normalize();
                        const cannonPos = pos.clone().add(new THREE.Vector3(0, 2, 2));
                        setTimeout(() => {
                            if (!enemy.dead) {
                                this.projectiles.fire(cannonPos, dir, enemy.damage, true);
                            }
                        }, i * 200);
                    }
                }
                break;

            case 'elite':
                // Flanking approach
                const flankAngle = Math.atan2(toPlayer.x, toPlayer.z) + Math.PI / 3;
                const flankDir = new THREE.Vector3(Math.sin(flankAngle), 0, Math.cos(flankAngle));
                enemy.targetRotation = Math.atan2(flankDir.x, flankDir.z);
                pos.add(flankDir.multiplyScalar(enemy.speed * delta));

                enemy.fireTimer -= delta;
                if (enemy.fireTimer <= 0 && dist < 30) {
                    enemy.fireTimer = 2 + this.rng();
                    const dir = toPlayer.clone();
                    dir.y += 0.2;
                    dir.normalize();
                    const cannonPos = pos.clone().add(new THREE.Vector3(0, 2, 2));
                    this.projectiles.fire(cannonPos, dir, enemy.damage, true);
                }
                break;

            case 'phase':
                // Phase through, spawn minions, haunt player
                enemy.orbitAngle += delta * 0.3;
                const phaseDist = 25;
                const phasePos = playerPos.clone().add(
                    new THREE.Vector3(
                        Math.cos(enemy.orbitAngle) * phaseDist,
                        0,
                        Math.sin(enemy.orbitAngle) * phaseDist
                    )
                );
                const toPhase = new THREE.Vector3().subVectors(phasePos, pos).normalize();
                enemy.targetRotation = Math.atan2(toPhase.x, toPhase.z);
                pos.add(toPhase.multiplyScalar(enemy.speed * delta));

                // Spawn ghost rowboats
                enemy.fireTimer -= delta;
                if (enemy.fireTimer <= 0) {
                    enemy.fireTimer = 15 + this.rng() * 10;
                    this.spawnMinion('rowboat', pos.clone());
                }

                // Fire ghost cannonballs
                if (dist < 35 && enemy.fireTimer % 1 < 0.1) {
                    const dir = toPlayer.clone();
                    dir.y += 0.2;
                    dir.normalize();
                    const cannonPos = pos.clone().add(new THREE.Vector3(0, 2, 2));
                    this.projectiles.fire(cannonPos, dir, enemy.damage * 0.5, true);
                }
                break;

            case 'boss':
                // Phase 1: Circle and fire spread
                enemy.orbitAngle += delta * 0.4;
                const bossDist = 30;
                const bossPos = playerPos.clone().add(
                    new THREE.Vector3(
                        Math.cos(enemy.orbitAngle) * bossDist,
                        0,
                        Math.sin(enemy.orbitAngle) * bossDist
                    )
                );
                const toBoss = new THREE.Vector3().subVectors(bossPos, pos).normalize();
                enemy.targetRotation = Math.atan2(toBoss.x, toBoss.z);
                pos.add(toBoss.multiplyScalar(enemy.speed * delta));

                // Phase 1: 3-spread shot
                enemy.fireTimer -= delta;
                if (enemy.fireTimer <= 0) {
                    enemy.fireTimer = 1.5;
                    for (let i = 0; i < 3; i++) {
                        const spread = (i - 1) * 0.2;
                        const dir = toPlayer.clone();
                        dir.x += spread;
                        dir.z += spread;
                        dir.y += 0.15;
                        dir.normalize();
                        const cannonPos = pos.clone().add(new THREE.Vector3(0, 3, 3));
                        this.projectiles.fire(cannonPos, dir, enemy.damage, true);
                    }
                }

                // Phase 2: Charge attack
                if (enemy.hp < enemy.maxHP * 0.6 && enemy.hp >= enemy.maxHP * 0.3) {
                    this.state.bossPhase = 2;
                    if (!enemy.phase2Triggered) {
                        enemy.phase2Triggered = true;
                        // Charge!
                        const chargeDir = toPlayer.clone();
                        chargeDir.y = 0;
                        chargeDir.normalize();
                        pos.add(chargeDir.multiplyScalar(15));
                    }
                }

                // Phase 3: Enrage
                if (enemy.hp < enemy.maxHP * 0.3) {
                    this.state.bossPhase = 3;
                    enemy.speed = 6 + this.state.bossKills * 1;
                }

                this.state.bossHP = enemy.hp;
                break;
        }

        // Smooth rotation
        enemy.mesh.rotation.y = lerpAngle(enemy.mesh.rotation.y, enemy.targetRotation, 3 * delta);

        // Bob on waves
        enemy.mesh.position.y = Math.sin(Date.now() * 0.002 + pos.x) * 0.3;

        // Update HP bar
        this.updateHPBar(enemy);

        // Ghost flicker
        if (enemy.type === 'ghost' || enemy.type === 'boss') {
            const flicker = 0.7 + Math.sin(Date.now() * 0.01) * 0.15;
            enemy.model.traverse((child) => {
                if (child.isMesh && child.material) {
                    child.material.opacity = flicker;
                }
            });
        }
    }

    updateHPBar(enemy) {
        // Remove old HP bar
        if (enemy.hpBar) {
            enemy.mesh.remove(enemy.hpBar);
        }

        if (enemy.dead || enemy.hp >= enemy.maxHP) return;

        // Create HP bar
        const width = 3;
        const height = 0.3;
        const hpRatio = enemy.hp / enemy.maxHP;

        const geo = new THREE.PlaneGeometry(width, height);
        const mat = new THREE.MeshBasicMaterial({
            color: hpRatio > 0.3 ? 0xff0000 : 0xff4444,
            side: THREE.DoubleSide,
            depthTest: false
        });
        const bar = new THREE.Mesh(geo, mat);
        bar.position.set(0, 4, 0);
        bar.rotation.x = -Math.PI / 6;
        bar.renderOrder = 1000;

        enemy.mesh.add(bar);
        enemy.hpBar = bar;
    }

    takeDamage(enemy, amount) {
        // Ghost damage penalty
        if (enemy.type === 'ghost' || enemy.type === 'boss') {
            amount *= 0.5;
        }

        enemy.hp -= amount;

        if (enemy.hp <= 0 && !enemy.dead) {
            enemy.dead = true;
            this.killEnemy(enemy);
            return true;
        }
        return false;
    }

    killEnemy(enemy) {
        this.state.kills++;
        this.state.addDoubloons(enemy.doubloons);

        // Boss kill
        if (enemy.type === 'boss') {
            this.state.bossKills++;
            this.state.bossActive = false;
            this.state.addDoubloons(enemy.doubloons * 3);
            // Spawn treasure
            this.spawnTreasure(enemy.mesh.position.clone(), 20);
            // Screen flash
            this.state.screenFlash = 1;
        }

        // Create sinking effect
        this.createSinkEffect(enemy);

        // Spawn doubloon
        this.spawnDoubloon(enemy.mesh.position.clone(), enemy.doubloons);

        // Galleon spawns rowboats on death
        if (enemy.type === 'galleon') {
            for (let i = 0; i < 3; i++) {
                const offset = new THREE.Vector3(
                    (Math.random() - 0.5) * 10,
                    0,
                    (Math.random() - 0.5) * 10
                );
                this.spawnMinion('rowboat', enemy.mesh.position.clone().add(offset));
            }
        }

        // Remove
        setTimeout(() => this.removeEnemy(enemy), 500);
    }

    createSinkEffect(enemy) {
        if (!enemy.mesh) return;

        // Splash
        const splashGeo = new THREE.SphereGeometry(2, 8, 8);
        const splashMat = new THREE.MeshBasicMaterial({
            color: 0xaaddff,
            transparent: true,
            opacity: 0.5
        });
        const splash = new THREE.Mesh(splashGeo, splashMat);
        splash.position.copy(enemy.mesh.position);
        splash.position.y = 0;
        this.scene.add(splash);

        let scale = 1;
        const animate = () => {
            scale += 0.3;
            splash.scale.setScalar(scale);
            splash.material.opacity -= 0.05;
            if (splash.material.opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                this.scene.remove(splash);
                splash.geometry.dispose();
                splash.material.dispose();
            }
        };
        animate();

        // Sink enemy
        const sinkAnim = () => {
            if (enemy.mesh && !enemy.mesh.userData.sinking) {
                enemy.mesh.userData.sinking = true;
                const sink = () => {
                    if (enemy.mesh) {
                        enemy.mesh.position.y -= 0.05;
                        enemy.mesh.rotation.z += 0.02;
                        if (enemy.mesh.position.y > -5) {
                            requestAnimationFrame(sink);
                        } else {
                            this.removeEnemy(enemy);
                        }
                    }
                };
                sink();
            }
        };
        sinkAnim();
    }

    spawnDoubloon(position, amount) {
        const count = Math.min(amount, 10);
        for (let i = 0; i < count; i++) {
            const doubloon = new THREE.Group();

            // Coin shape
            const coinGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 16);
            const coinMat = new THREE.MeshStandardMaterial({
                color: 0xffd700,
                metalness: 0.8,
                roughness: 0.2,
                emissive: 0x332200,
                emissiveIntensity: 0.3
            });
            const coin = new THREE.Mesh(coinGeo, coinMat);
            coin.rotation.x = Math.PI / 2;
            doubloon.add(coin);

            doubloon.position.copy(position);
            doubloon.position.x += (Math.random() - 0.5) * 3;
            doubloon.position.z += (Math.random() - 0.5) * 3;
            doubloon.position.y = 1;
            doubloon.userData.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 5,
                Math.random() * 5 + 3,
                (Math.random() - 0.5) * 5
            );
            doubloon.userData.life = 10; // Seconds to collect
            doubloon.userData.value = Math.ceil(amount / count);

            this.scene.add(doubloon);
            this.state.doubloonsOnField.push(doubloon);
        }
    }

    spawnTreasure(position, count) {
        for (let i = 0; i < count; i++) {
            const chest = this.assets.getMesh('chest');
            chest.scale.setScalar(0.5);
            chest.position.copy(position);
            chest.position.x += (Math.random() - 0.5) * 20;
            chest.position.z += (Math.random() - 0.5) * 20;
            chest.position.y = 1;
            chest.userData.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 3,
                Math.random() * 3,
                (Math.random() - 0.5) * 3
            );
            chest.userData.life = 15;
            chest.userData.value = 20;
            this.scene.add(chest);
            this.state.doubloonsOnField.push(chest);
        }
    }

    spawnMinion(type, position) {
        const minion = this.spawnEnemy(type, position);
        if (minion) {
            minion.mesh.position.copy(position);
        }
    }

    removeEnemy(enemy) {
        if (enemy.mesh) {
            this.scene.remove(enemy.mesh);
            enemy.mesh.traverse((child) => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });
            enemy.mesh = null;
        }
        enemy.dead = true;
    }

    clear() {
        for (const enemy of this.enemies) {
            this.removeEnemy(enemy);
        }
        this.enemies = [];
    }

    dispose() {
        this.clear();
    }
}
