// MAELSTROM - Fleet Manager
// Allied fleet ships that orbit the flagship and auto-fire

import * as THREE from 'three';
import { lerp, clamp } from './utils.js';

export class FleetManager {
    constructor(scene, state, assets, projectiles) {
        this.scene = scene;
        this.state = state;
        this.assets = assets;
        this.projectiles = projectiles;

        this.ships = [];
        this.formation = 'orbit'; // 'orbit' or 'line'
        this.orbitRadius = 8;
        this.orbitSpeed = 0.5;
    }

    update(delta, leaderPos, leaderRot) {
        const targetCount = this.state.fleetSize - 1; // Subtract 1 for player

        // Add ships if needed
        while (this.ships.length < targetCount) {
            this.addShip();
        }

        // Remove ships if needed
        while (this.ships.length > targetCount) {
            this.removeShip(this.ships[this.ships.length - 1]);
        }

        // Update each fleet ship
        const totalShips = this.ships.length;
        for (let i = 0; i < this.ships.length; i++) {
            this.updateShip(this.ships[i], i, totalShips, delta, leaderPos, leaderRot);
        }
    }

    addShip() {
        const ship = new THREE.Group();
        ship.name = 'FleetShip_' + this.ships.length;

        // Choose ship type based on fleet size
        let glb = 'boat-row-small';
        let scale = 1.0;
        let hp = 80;

        if (this.ships.length >= 2) {
            glb = 'ship-pirate-small';
            scale = 1.0;
            hp = 100;
        }
        if (this.ships.length >= 5) {
            glb = 'ship-pirate-medium';
            scale = 1.1;
            hp = 120;
        }
        if (this.ships.length >= 8) {
            glb = 'ship-pirate-large';
            scale = 1.2;
            hp = 150;
        }

        const model = this.assets.getMesh(glb);
        model.scale.setScalar(scale);
        ship.add(model);

        // Add flag
        const flag = this.assets.getMesh('flag-pirate');
        flag.position.set(0, 2, -0.5);
        flag.scale.set(0.5, 0.5, 0.5);
        flag.rotation.y = Math.PI / 4;
        ship.add(flag);

        this.scene.add(ship);

        const fleetShip = {
            mesh: ship,
            model: model,
            hp: hp,
            maxHP: hp,
            fireTimer: Math.random() * 2,
            fireRate: 2,
            orbitAngle: (this.ships.length / 10) * Math.PI * 2,
            orbitRadius: 8 + (this.ships.length % 3) * 4,
            heightOffset: (this.ships.length % 3) * 0.5,
            glb: glb
        };

        this.ships.push(fleetShip);
    }

    removeShip(ship) {
        if (ship.mesh) {
            this.scene.remove(ship.mesh);
            ship.mesh.traverse((child) => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });
        }
        const idx = this.ships.indexOf(ship);
        if (idx !== -1) this.ships.splice(idx, 1);
    }

    updateShip(ship, index, total, delta, leaderPos, leaderRot) {
        if (!ship.mesh) return;

        // Orbit angle
        ship.orbitAngle += this.orbitSpeed * delta * (1 + index * 0.1);

        // Formation position
        const spacing = (Math.PI * 2) / Math.max(total, 1);
        const angle = ship.orbitAngle;
        const radius = ship.orbitRadius + (index % 3) * 3;

        // Calculate world position
        const worldX = leaderPos.x + Math.cos(angle + leaderRot) * radius;
        const worldZ = leaderPos.z + Math.sin(angle + leaderRot) * radius;

        // Smooth movement
        ship.mesh.position.x = lerp(ship.mesh.position.x, worldX, 5 * delta);
        ship.mesh.position.z = lerp(ship.mesh.position.z, worldZ, 5 * delta);

        // Bob on waves
        ship.mesh.position.y = Math.sin(Date.now() * 0.002 + index) * 0.2;

        // Face outward from leader
        const toShip = new THREE.Vector3(
            ship.mesh.position.x - leaderPos.x,
            0,
            ship.mesh.position.z - leaderPos.z
        );
        const targetRot = Math.atan2(toShip.x, toShip.z);

        // Also rotate for wave bob
        ship.mesh.rotation.y = lerp(
            ship.mesh.rotation.y,
            targetRot + Math.sin(Date.now() * 0.001 + index) * 0.1,
            3 * delta
        );

        // Auto-fire
        ship.fireTimer -= delta;
        if (ship.fireTimer <= 0) {
            ship.fireTimer = ship.fireRate + Math.random() * 0.5;

            // Find nearest enemy
            let nearestEnemy = null;
            let nearestDist = Infinity;

            for (const enemy of this.state.enemies) {
                if (!enemy || !enemy.mesh || enemy.dead) continue;
                const dist = ship.mesh.position.distanceTo(enemy.mesh.position);
                if (dist < 20 && dist < nearestDist) {
                    nearestDist = dist;
                    nearestEnemy = enemy;
                }
            }

            if (nearestEnemy) {
                const dir = new THREE.Vector3()
                    .subVectors(nearestEnemy.mesh.position, ship.mesh.position)
                    .normalize();
                dir.y += 0.2;
                dir.normalize();

                const cannonPos = ship.mesh.position.clone();
                cannonPos.y = 1.5;
                cannonPos.add(new THREE.Vector3(0, 0, 1).applyQuaternion(ship.mesh.quaternion));

                // Damage scales with fleet size
                const damage = 10 + this.state.fleetSize * 2;
                this.projectiles.fire(cannonPos, dir, damage, false);
            }
        }

        // Animate flag
        ship.mesh.children.forEach(child => {
            if (child.name && child.name.includes('flag')) {
                child.rotation.z = Math.sin(Date.now() * 0.003 + index) * 0.2;
            }
        });
    }

    // Check if fleet ships are hit by enemy projectiles
    checkFleetHits(damage) {
        for (const ship of this.ships) {
            if (!ship.mesh) continue;

            // Random chance to take damage when enemies are close
            for (const enemy of this.state.enemies) {
                if (!enemy || !enemy.mesh) continue;
                const dist = ship.mesh.position.distanceTo(enemy.mesh.position);
                if (dist < 5) {
                    if (Math.random() < 0.01) { // 1% chance per frame
                        ship.hp -= damage * 0.5;
                        if (ship.hp <= 0) {
                            this.sinkShip(ship);
                            return;
                        }
                    }
                }
            }
        }
    }

    sinkShip(ship) {
        // Sink animation
        const sinkAnim = () => {
            if (ship.mesh) {
                ship.mesh.position.y -= 0.1;
                ship.mesh.rotation.z += 0.05;
                ship.mesh.rotation.x += 0.02;
                if (ship.mesh.position.y > -5) {
                    requestAnimationFrame(sinkAnim);
                } else {
                    this.removeShip(ship);
                }
            }
        };
        sinkAnim();
    }

    getShipCount() {
        return this.ships.length;
    }

    clear() {
        for (const ship of [...this.ships]) {
            this.removeShip(ship);
        }
        this.ships = [];
    }

    dispose() {
        this.clear();
    }
}
