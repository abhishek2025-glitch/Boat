// MAELSTROM - Asset Loader
// Progressive async GLB loader with procedural fallbacks

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const GLB_PATH = './assets/Models/GLB format/';

// All available GLB assets
export const ASSET_LIST = [
    'barrel', 'boat-row-large', 'boat-row-small', 'bottle-large', 'bottle',
    'cannon', 'cannon-ball', 'cannon-mobile', 'castle-door', 'castle-gate',
    'castle-wall', 'castle-window', 'chest', 'crate', 'crate-bottles',
    'flag', 'flag-high', 'flag-high-pennant', 'flag-pennant',
    'flag-pirate', 'flag-pirate-high', 'flag-pirate-high-pennant',
    'flag-pirate-pennant', 'grass', 'grass-patch', 'grass-plant', 'hole',
    'mast', 'mast-ropes', 'palm-bend', 'palm-detailed-bend',
    'palm-detailed-straight', 'palm-straight', 'patch-grass',
    'patch-grass-foliage', 'patch-sand', 'patch-sand-foliage',
    'platform', 'platform-planks', 'rocks-a', 'rocks-b', 'rocks-c',
    'rocks-sand-a', 'rocks-sand-b', 'rocks-sand-c',
    'ship-ghost', 'ship-large', 'ship-medium', 'ship-pirate-large',
    'ship-pirate-medium', 'ship-pirate-small', 'ship-small', 'ship-wreck',
    'structure', 'structure-fence', 'structure-fence-sides',
    'structure-platform', 'structure-platform-dock',
    'structure-platform-dock-small', 'structure-platform-small',
    'structure-roof', 'tool-paddle', 'tool-shovel',
    'tower-base', 'tower-base-door', 'tower-complete-large',
    'tower-complete-small', 'tower-middle', 'tower-middle-windows',
    'tower-roof', 'tower-top', 'tower-watch'
];

export class AssetLoader {
    constructor() {
        this.cache = new Map();
        this.loader = new GLTFLoader();
        this.loading = new Map();
        this.failed = new Set();
        this.onProgress = null;
        this.totalAssets = ASSET_LIST.length;
        this.loadedCount = 0;
    }

    getPath(name) {
        return `${GLB_PATH}${name}.glb`;
    }

    // Load a single asset
    async load(name) {
        if (this.cache.has(name)) {
            return this.cache.get(name);
        }

        if (this.loading.has(name)) {
            return this.loading.get(name);
        }

        if (this.failed.has(name)) {
            return this.createFallback(name);
        }

        const promise = new Promise((resolve) => {
            this.loader.load(
                this.getPath(name),
                (gltf) => {
                    // Pre-process: center + normalize scale
                    this.processModel(gltf.scene, name);
                    this.cache.set(name, gltf.scene);
                    this.loadedCount++;
                    if (this.onProgress) {
                        this.onProgress(this.loadedCount / this.totalAssets, name);
                    }
                    resolve(gltf.scene);
                },
                undefined,
                (err) => {
                    console.warn(`Failed to load ${name}, using fallback:`, err);
                    this.failed.add(name);
                    resolve(this.createFallback(name));
                }
            );
        });

        this.loading.set(name, promise);
        return promise;
    }

    // Load critical assets first (player ship, etc.)
    async loadCritical() {
        const critical = [
            'ship-pirate-small', // Player ship
            'ship-ghost',        // Boss
            'boat-row-small',    // Basic enemy
            'ship-small',        // Medium enemy
            'ship-medium',       // Frigate
            'ship-large',        // Galleon
            'cannon-ball',       // Projectile
        ];
        await Promise.all(critical.map(n => this.load(n)));
    }

    // Load all assets in background
    async loadAll() {
        const promises = ASSET_LIST.map(name => this.load(name));
        return Promise.all(promises);
    }

    // Get a cloned mesh for use in scene
    getMesh(name) {
        if (this.cache.has(name)) {
            const scene = this.cache.get(name);
            return scene.clone(true);
        }
        // Return fallback immediately if not loaded
        return this.createFallback(name);
    }

    // Get raw scene (don't clone - use for shared instances)
    getScene(name) {
        if (this.cache.has(name)) {
            return this.cache.get(name);
        }
        return this.createFallback(name);
    }

    // Pre-process loaded model
    processModel(scene, name) {
        scene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                // Ensure material uses the colormap
                if (child.material) {
                    child.material.side = THREE.FrontSide;
                }
            }
        });
    }

    // Create procedural fallback for missing assets
    createFallback(name) {
        const scene = new THREE.Group();
        scene.userData.fallback = true;
        scene.userData.assetName = name;

        const color = this.getFallbackColor(name);
        const geometry = this.getFallbackGeometry(name);
        const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.1 });

        const mesh = new THREE.Mesh(geometry, mat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);

        return scene;
    }

    getFallbackColor(name) {
        if (name.includes('ship')) {
            if (name.includes('ghost')) return 0x44ff99;
            return 0x8B4513;
        }
        if (name.includes('cannon')) return 0x333333;
        if (name.includes('barrel')) return 0x8B4513;
        if (name.includes('chest')) return 0xDAA520;
        if (name.includes('crate')) return 0xCD853F;
        if (name.includes('rock')) return 0x696969;
        if (name.includes('flag') || name.includes('palm') || name.includes('grass')) return 0x228B22;
        if (name.includes('sand') || name.includes('patch')) return 0xF4D03F;
        if (name.includes('tower') || name.includes('castle')) return 0x808080;
        if (name.includes('structure')) return 0x8B4513;
        if (name.includes('bottle')) return 0xADD8E6;
        if (name.includes('mast')) return 0x8B4513;
        if (name.includes('wreck')) return 0x654321;
        return 0x888888;
    }

    getFallbackGeometry(name) {
        if (name.includes('ship') || name.includes('boat')) {
            // Boat-like shape
            const shape = new THREE.Shape();
            shape.moveTo(-1, 0);
            shape.lineTo(-0.8, 1.5);
            shape.lineTo(0.8, 1.5);
            shape.lineTo(1, 0);
            shape.lineTo(-1, 0);
            const ext = new THREE.ExtrudeGeometry(shape, { depth: 1, bevelEnabled: false });
            ext.rotateX(-Math.PI / 2);
            return ext;
        }
        if (name.includes('cannon')) {
            return new THREE.CylinderGeometry(0.3, 0.4, 2, 8);
        }
        if (name.includes('ball')) {
            return new THREE.SphereGeometry(0.2, 8, 8);
        }
        if (name.includes('barrel')) {
            return new THREE.CylinderGeometry(0.5, 0.5, 1.5, 12);
        }
        if (name.includes('chest')) {
            return new THREE.BoxGeometry(1.5, 1, 1);
        }
        if (name.includes('crate')) {
            return new THREE.BoxGeometry(1, 1, 1);
        }
        if (name.includes('rock')) {
            return new THREE.DodecahedronGeometry(1, 0);
        }
        if (name.includes('tower') || name.includes('castle')) {
            return new THREE.BoxGeometry(2, 4, 2);
        }
        if (name.includes('flag')) {
            return new THREE.PlaneGeometry(1, 1.5);
        }
        if (name.includes('palm') || name.includes('grass')) {
            return new THREE.ConeGeometry(0.5, 2, 6);
        }
        if (name.includes('patch') || name.includes('sand')) {
            return new THREE.CircleGeometry(2, 16);
        }
        if (name.includes('bottle')) {
            return new THREE.SphereGeometry(0.3, 8, 8);
        }
        if (name.includes('mast')) {
            return new THREE.CylinderGeometry(0.1, 0.15, 4, 8);
        }
        if (name.includes('wreck')) {
            return new THREE.BoxGeometry(3, 1.5, 2);
        }
        if (name.includes('structure')) {
            return new THREE.BoxGeometry(2, 2, 2);
        }
        if (name.includes('tool')) {
            return new THREE.CylinderGeometry(0.05, 0.05, 2, 6);
        }
        if (name.includes('hole')) {
            return new THREE.RingGeometry(0.5, 1, 16);
        }
        return new THREE.BoxGeometry(1, 1, 1);
    }

    isLoaded(name) {
        return this.cache.has(name);
    }

    getLoadProgress() {
        return this.loadedCount / this.totalAssets;
    }
}
