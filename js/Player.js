// MAELSTROM - Player Ship
// Player-controlled ship with momentum-based movement and auto-fire

import * as THREE from 'three';
import { lerp, clamp, distance, lerpAngle } from './utils.js';

export class Player {
    constructor(scene, gameState, assetLoader) {
        this.scene = scene;
        this.state = gameState;
        this.assets = assetLoader;

        this.group = new THREE.Group();
        this.group.name = 'PlayerShip';

        // Velocity for momentum-based movement
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.targetRotation = 0;

        // Firing
        this.fireTimer = 0;
        this.fireCooldown = 1.5; // seconds between shots

        // Setup
        this.loadModel();
        this.createWake();
        this.createCannonMuzzleFlash();

        scene.add(this.group);
    }

    async loadModel() {
        const model = this.assets.getMesh('ship-pirate-small');
        model.name = 'PlayerShipModel';
        model.scale.set(1.5, 1.5, 1.5);

        // Tint player ship gold/brown
        model.traverse((child) => {
            if (child.isMesh && child.material) {
                // Slightly warm tint for player ship
            }
        });

        this.group.add(model);
        this.model = model;

        // Add a flag
        const flag = this.assets.getMesh('flag-pirate');
        flag.position.set(0, 3, -1);
        flag.scale.set(0.8, 0.8, 0.8);
        flag.rotation.y = Math.PI / 4;
        this.group.add(flag);
        this.flag = flag;

        // Glow effect for player (golden outline)
        const glowGeo = new THREE.SphereGeometry(4, 16, 16);
        const glowMat = new THREE.MeshBasicMaterial({
            color: 0xffd700,
            transparent: true,
            opacity: 0.05,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        glow.position.y = 1;
        this.group.add(glow);
    }

    createWake() {
        // Wake trail particles
        const wakeGeo = new THREE.PlaneGeometry(2, 4);
        const wakeMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide,
            depthWrite: false
        });

        this.wake = new THREE.Group();
        for (let i = 0; i < 5; i++) {
            const w = new THREE.Mesh(wakeGeo, wakeMat.clone());
            w.position.z = i * 2 + 2;
            w.rotation.x = -Math.PI / 2;
            w.material.opacity = 0.3 - i * 0.05;
            this.wake.add(w);
        }
        this.group.add(this.wake);
        this.wakeTimer = 0;
    }

    createCannonMuzzleFlash() {
        // Muzzle flash light
        this.muzzleLight = new THREE.PointLight(0xffaa00, 0, 5);
        this.muzzleLight.position.set(0, 1, 2);
        this.group.add(this.muzzleLight);
    }

    // Input handling
    update(delta, camera, cameraTarget, projectiles) {
        const speed = 15 * this.state.moveSpeed;
        const rotSpeed = 3;
        const friction = 0.92;

        // Get camera-relative input direction
        const cameraDir = new THREE.Vector3();
        camera.getWorldDirection(cameraDir);
        cameraDir.y = 0;
        cameraDir.normalize();

        const cameraRight = new THREE.Vector3();
        cameraRight.crossVectors(cameraDir, new THREE.Vector3(0, 1, 0));

        // WASD input
        let inputX = 0, inputZ = 0;
        if (this.state.keys) {
            if (this.state.keys['KeyW'] || this.state.keys['ArrowUp']) inputZ += 1;
            if (this.state.keys['KeyS'] || this.state.keys['ArrowDown']) inputZ -= 1;
            if (this.state.keys['KeyA'] || this.state.keys['ArrowLeft']) inputX -= 1;
            if (this.state.keys['KeyD'] || this.state.keys['ArrowRight']) inputX += 1;
        }

        // Touch joystick
        if (this.state.joystickX !== undefined) {
            inputX = this.state.joystickX;
            inputZ = -this.state.joystickY;
        }

        // Calculate movement direction
        const moveDir = new THREE.Vector3();
        moveDir.addScaledVector(cameraRight, inputX);
        moveDir.addScaledVector(cameraDir, inputZ);
        moveDir.normalize();

        // Apply acceleration
        if (moveDir.length() > 0.1) {
            this.velocity.addScaledVector(moveDir, speed * delta);

            // Rotate ship to face movement direction
            this.targetRotation = Math.atan2(moveDir.x, moveDir.z);
        }

        // Apply friction
        this.velocity.multiplyScalar(friction);

        // Clamp velocity
        const maxSpeed = speed;
        if (this.velocity.length() > maxSpeed) {
            this.velocity.normalize().multiplyScalar(maxSpeed);
        }

        // Move
        this.group.position.add(this.velocity.clone().multiplyScalar(delta));

        // Smooth rotation
        const currentRot = this.group.rotation.y;
        this.group.rotation.y = lerpAngle(currentRot, this.targetRotation, rotSpeed * delta);

        // Bob on waves
        const waveY = 0;
        this.group.position.y = lerp(this.group.position.y, waveY, 5 * delta);

        // Update wake
        const speedRatio = this.velocity.length() / maxSpeed;
        this.wake.visible = speedRatio > 0.1;
        this.wake.children.forEach((w, i) => {
            w.material.opacity = speedRatio * (0.3 - i * 0.05);
            w.position.z = i * 2 + 2;
        });

        // Animate flag
        if (this.flag) {
            this.flag.rotation.z = Math.sin(Date.now() * 0.003 + this.group.rotation.y) * 0.2;
        }

        // Auto-fire
        this.fireTimer -= delta;
        if (this.fireTimer <= 0 && this.state.phase === 'playing') {
            this.fireTimer = this.fireCooldown * this.state.cannonFireRate;
            this.autoFire(projectiles);
        }

        // Update muzzle flash
        this.muzzleLight.intensity *= 0.9;

        // Camera follow
        const targetPos = this.group.position.clone();
        cameraTarget.lerp(targetPos, 5 * delta);
    }

    autoFire(projectiles) {
        // Find nearest enemy
        let nearestEnemy = null;
        let nearestDist = Infinity;

        const playerPos = this.group.position;

        for (const enemy of this.state.enemies) {
            if (!enemy || !enemy.mesh || enemy.dead) continue;
            const dist = playerPos.distanceTo(enemy.mesh.position);
            if (dist < this.state.cannonRange * 3 && dist < nearestDist) {
                nearestDist = dist;
                nearestEnemy = enemy;
            }
        }

        if (!nearestEnemy) return;

        // Fire from each cannon
        for (let i = 0; i < this.state.cannonCount; i++) {
            // Alternate left/right sides
            const side = i % 2 === 0 ? -1 : 1;
            const offset = Math.floor(i / 2) * 1.5;

            // Cannon position
            const cannonPos = new THREE.Vector3(
                side * 1.2,
                1.5,
                offset
            );
            cannonPos.applyQuaternion(this.group.quaternion);
            cannonPos.add(this.group.position);

            // Direction to target
            const dir = new THREE.Vector3();
            dir.subVectors(nearestEnemy.mesh.position, cannonPos);
            dir.y += 1; // Arc upward
            dir.normalize();

            projectiles.fire(cannonPos, dir, this.state.cannonDamage, false);
        }

        // Muzzle flash
        this.muzzleLight.intensity = 2;

        // Sound
        this.playFireSound();
    }

    playFireSound() {
        if (this.state.audioCtx) {
            const ctx = this.state.audioCtx;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const noise = ctx.createBufferSource();

            // Create noise buffer
            const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < data.length; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.05));
            }
            noise.buffer = buffer;

            // Low frequency boom
            osc.frequency.setValueAtTime(80, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.3);
            gain.gain.setValueAtTime(0.4, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

            noise.connect(gain);
            osc.connect(gain);
            gain.connect(ctx.destination);

            noise.start();
            osc.start();
            noise.stop(ctx.currentTime + 0.3);
            osc.stop(ctx.currentTime + 0.3);
        }
    }

    getPosition() {
        return this.group.position.clone();
    }

    getRotation() {
        return this.group.rotation.y;
    }

    takeDamage(amount) {
        const dead = this.state.takeDamage(amount);
        // Flash red
        if (this.model) {
            this.model.traverse((child) => {
                if (child.isMesh && child.material) {
                    const origColor = child.material.color.clone();
                    child.material.color.set(0xff0000);
                    setTimeout(() => {
                        child.material.color.copy(origColor);
                    }, 100);
                }
            });
        }
        return dead;
    }

    dispose() {
        this.scene.remove(this.group);
    }
}
