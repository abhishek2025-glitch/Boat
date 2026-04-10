// MAELSTROM - Particle System
// GPU-efficient visual effects

import * as THREE from 'three';

export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
    }

    // Create splash effect
    createSplash(position, count = 8) {
        for (let i = 0; i < count; i++) {
            const geo = new THREE.SphereGeometry(0.15, 4, 4);
            const mat = new THREE.MeshBasicMaterial({
                color: 0xaaddff,
                transparent: true,
                opacity: 1
            });
            const p = new THREE.Mesh(geo, mat);
            p.position.copy(position);
            p.position.y = 0.5;
            p.userData = {
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 8,
                    Math.random() * 6 + 2,
                    (Math.random() - 0.5) * 8
                ),
                life: 0.8,
                maxLife: 0.8
            };
            this.scene.add(p);
            this.particles.push(p);
        }
    }

    // Doubloon collect sparkle
    createCoinSparkle(position) {
        for (let i = 0; i < 5; i++) {
            const geo = new THREE.SphereGeometry(0.1, 4, 4);
            const mat = new THREE.MeshBasicMaterial({
                color: 0xffd700,
                transparent: true,
                opacity: 1
            });
            const p = new THREE.Mesh(geo, mat);
            p.position.copy(position);
            p.userData = {
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 3,
                    Math.random() * 3 + 1,
                    (Math.random() - 0.5) * 3
                ),
                life: 0.5,
                maxLife: 0.5
            };
            this.scene.add(p);
            this.particles.push(p);
        }
    }

    // Muzzle flash
    createMuzzleFlash(position) {
        const light = new THREE.PointLight(0xffaa00, 3, 5);
        light.position.copy(position);
        light.userData = { life: 0.1, maxLife: 0.1 };
        this.scene.add(light);
        this.particles.push(light);
    }

    // Enemy spawn fog
    createSpawnFog(position) {
        for (let i = 0; i < 10; i++) {
            const geo = new THREE.SphereGeometry(1, 8, 8);
            const mat = new THREE.MeshBasicMaterial({
                color: 0x666666,
                transparent: true,
                opacity: 0.5
            });
            const p = new THREE.Mesh(geo, mat);
            p.position.copy(position);
            p.position.x += (Math.random() - 0.5) * 5;
            p.position.z += (Math.random() - 0.5) * 5;
            p.userData = {
                velocity: new THREE.Vector3(0, 0.5, 0),
                life: 1,
                maxLife: 1
            };
            this.scene.add(p);
            this.particles.push(p);
        }
    }

    // Victory sparkles
    createVictorySparkle(position) {
        for (let i = 0; i < 20; i++) {
            const geo = new THREE.SphereGeometry(0.15, 4, 4);
            const mat = new THREE.MeshBasicMaterial({
                color: Math.random() > 0.5 ? 0xffd700 : 0xff8800,
                transparent: true,
                opacity: 1
            });
            const p = new THREE.Mesh(geo, mat);
            p.position.copy(position);
            p.userData = {
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 10,
                    Math.random() * 8,
                    (Math.random() - 0.5) * 10
                ),
                life: 1.5,
                maxLife: 1.5
            };
            this.scene.add(p);
            this.particles.push(p);
        }
    }

    // Ghost trail
    createGhostTrail(position) {
        for (let i = 0; i < 3; i++) {
            const geo = new THREE.SphereGeometry(1.5, 8, 8);
            const mat = new THREE.MeshBasicMaterial({
                color: 0x44ff99,
                transparent: true,
                opacity: 0.2
            });
            const p = new THREE.Mesh(geo, mat);
            p.position.copy(position);
            p.userData = {
                velocity: new THREE.Vector3(0, 0, 0),
                life: 0.5,
                maxLife: 0.5,
                isGhost: true
            };
            this.scene.add(p);
            this.particles.push(p);
        }
    }

    update(delta) {
        const gravity = -15;

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.userData.life -= delta;

            if (p.userData.life <= 0) {
                this.scene.remove(p);
                p.geometry?.dispose();
                p.material?.dispose();
                this.particles.splice(i, 1);
                continue;
            }

            // Apply physics
            if (p.userData.velocity && !p.userData.isGhost) {
                p.userData.velocity.y += gravity * delta;
                p.position.add(p.userData.velocity.clone().multiplyScalar(delta));
            }

            // Fade out
            const lifeRatio = p.userData.life / p.userData.maxLife;
            if (p.material) {
                p.material.opacity = lifeRatio;
            }
            if (p.isLight) {
                p.intensity = lifeRatio * 3;
            }

            // Scale
            if (p.userData.isGhost) {
                p.scale.setScalar(1 + (1 - lifeRatio) * 0.5);
            }
        }
    }

    clear() {
        for (const p of this.particles) {
            this.scene.remove(p);
            p.geometry?.dispose();
            p.material?.dispose();
        }
        this.particles = [];
    }

    dispose() {
        this.clear();
    }
}
