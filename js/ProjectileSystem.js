// MAELSTROM - Projectile System
// Object-pooled cannonball projectiles with physics arcs

import * as THREE from 'three';

export class ProjectileSystem {
    constructor(scene, state) {
        this.scene = scene;
        this.state = state;
        this.projectiles = [];
        this.pool = [];
        this.poolSize = 100;

        this.init();
    }

    init() {
        // Create shared geometry and material
        this.sharedGeo = new THREE.SphereGeometry(0.3, 8, 8);

        // Pre-populate pool
        for (let i = 0; i < this.poolSize; i++) {
            const mesh = new THREE.Mesh(this.sharedGeo, new THREE.MeshStandardMaterial({
                color: 0x333333,
                metalness: 0.8,
                roughness: 0.2
            }));
            mesh.visible = false;
            mesh.castShadow = true;
            mesh.userData.active = false;
            mesh.userData.velocity = new THREE.Vector3();
            mesh.userData.isEnemy = false;
            this.pool.push(mesh);
            this.scene.add(mesh);
        }
    }

    fire(position, direction, damage, isEnemy) {
        // Find inactive projectile from pool
        let proj = this.pool.find(p => !p.userData.active);
        if (!proj) {
            proj = this.pool[0]; // Reuse oldest
            this.scene.remove(proj);
        }

        proj.position.copy(position);
        proj.userData.velocity.copy(direction).multiplyScalar(30); // Initial speed
        proj.userData.velocity.y += 5; // Arc upward
        proj.userData.damage = damage;
        proj.userData.isEnemy = isEnemy;
        proj.userData.active = true;
        proj.userData.life = 5; // seconds
        proj.userData.trail = [];
        proj.visible = true;

        // Color
        if (isEnemy) {
            proj.material.color.setHex(0x00ff00);
            proj.material.emissive.setHex(0x003300);
        } else {
            proj.material.color.setHex(0x333333);
            proj.material.emissive.setHex(0x000000);
        }

        this.projectiles.push(proj);
    }

    fireMultiple(positions, direction, damage, isEnemy) {
        positions.forEach(pos => this.fire(pos, direction.clone(), damage, isEnemy));
    }

    update(delta) {
        const gravity = -15;

        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            if (!proj.userData.active) {
                this.projectiles.splice(i, 1);
                continue;
            }

            // Apply gravity
            proj.userData.velocity.y += gravity * delta;

            // Move
            const move = proj.userData.velocity.clone().multiplyScalar(delta);
            proj.position.add(move);

            // Water impact
            if (proj.position.y < 0) {
                this.createSplash(proj.position);
                this.deactivate(proj, i);
                continue;
            }

            // Life timer
            proj.userData.life -= delta;
            if (proj.userData.life <= 0) {
                this.createSplash(proj.position);
                this.deactivate(proj, i);
                continue;
            }

            // Rotation based on velocity
            proj.rotation.x += delta * 5;
            proj.rotation.z += delta * 3;

            // Trail
            proj.userData.trail.push(proj.position.clone());
            if (proj.userData.trail.length > 5) {
                proj.userData.trail.shift();
            }
        }
    }

    checkCollisions(enemies, player) {
        for (const proj of this.projectiles) {
            if (!proj.userData.active) continue;

            // Player projectiles hit enemies
            if (!proj.userData.isEnemy) {
                for (const enemy of enemies) {
                    if (!enemy || !enemy.mesh || enemy.dead) continue;
                    const dist = proj.position.distanceTo(enemy.mesh.position);
                    if (dist < enemy.hitRadius) {
                        const dead = enemy.takeDamage(proj.userData.damage);
                        this.createHitEffect(proj.position.clone());
                        this.deactivateProjectile(proj);
                        break;
                    }
                }
            } else {
                // Enemy projectiles hit player
                const playerPos = player.getPosition();
                const dist = proj.position.distanceTo(playerPos);
                if (dist < 3) {
                    player.takeDamage(proj.userData.damage);
                    this.createHitEffect(proj.position.clone());
                    this.deactivateProjectile(proj);
                }
            }
        }
    }

    createSplash(position) {
        // Simple splash particles
        const particleCount = 8;
        const geo = new THREE.SphereGeometry(0.15, 4, 4);
        const mat = new THREE.MeshBasicMaterial({ color: 0xaaddff, transparent: true });

        for (let i = 0; i < particleCount; i++) {
            const p = new THREE.Mesh(geo, mat.clone());
            p.position.copy(position);
            p.position.y = 0;
            p.userData.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 5,
                Math.random() * 5 + 2,
                (Math.random() - 0.5) * 5
            );
            p.userData.life = 0.5;
            this.scene.add(p);

            // Animate and remove
            const animate = () => {
                p.userData.life -= 0.016;
                p.userData.velocity.y -= 15 * 0.016;
                p.position.add(p.userData.velocity.clone().multiplyScalar(0.016));
                p.material.opacity = p.userData.life * 2;
                if (p.userData.life <= 0) {
                    this.scene.remove(p);
                } else {
                    requestAnimationFrame(animate);
                }
            };
            animate();
        }

        // Clean up geometry
        setTimeout(() => geo.dispose(), 1000);
    }

    createHitEffect(position) {
        // Impact spark
        const sparkGeo = new THREE.SphereGeometry(0.5, 8, 8);
        const sparkMat = new THREE.MeshBasicMaterial({
            color: 0xffaa00,
            transparent: true
        });
        const spark = new THREE.Mesh(sparkGeo, sparkMat);
        spark.position.copy(position);
        this.scene.add(spark);

        let scale = 1;
        const animate = () => {
            scale += 0.2;
            spark.scale.setScalar(scale);
            spark.material.opacity = 1 - scale / 3;
            if (scale < 3) {
                requestAnimationFrame(animate);
            } else {
                this.scene.remove(spark);
                spark.geometry.dispose();
                spark.material.dispose();
            }
        };
        animate();
    }

    deactivate(proj, index) {
        proj.userData.active = false;
        proj.visible = false;
        proj.userData.trail = [];
        if (index !== undefined) {
            const idx = this.projectiles.indexOf(proj);
            if (idx !== -1) this.projectiles.splice(idx, 1);
        }
    }

    deactivateProjectile(proj) {
        this.deactivate(proj);
    }

    clear() {
        this.projectiles.forEach(p => {
            p.userData.active = false;
            p.visible = false;
        });
        this.projectiles = [];
    }

    dispose() {
        this.pool.forEach(p => {
            this.scene.remove(p);
            p.geometry.dispose();
            p.material.dispose();
        });
        this.sharedGeo.dispose();
    }
}
