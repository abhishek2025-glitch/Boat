// MAELSTROM - Animated Ocean
// Procedural animated ocean with vertex shader waves

import * as THREE from 'three';

export class Ocean {
    constructor(scene) {
        this.scene = scene;
        this.time = 0;

        this.createOcean();
        this.createUnderwaterFog();
    }

    createOcean() {
        const size = 400;
        const segments = 128;

        // Custom shader for animated ocean
        const oceanMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uDeepColor: { value: new THREE.Color(0x0a2a4a) },
                uShallowColor: { value: new THREE.Color(0x1a6fa8) },
                uFoamColor: { value: new THREE.Color(0xaaddff) }
            },
            vertexShader: `
                uniform float uTime;
                varying vec2 vUv;
                varying float vElevation;
                varying vec3 vWorldPos;

                void main() {
                    vUv = uv;
                    vec3 pos = position;

                    // Multi-layered wave displacement
                    float wave1 = sin(pos.x * 0.05 + uTime * 0.5) * 1.5;
                    float wave2 = sin(pos.z * 0.03 + uTime * 0.3) * 2.0;
                    float wave3 = sin((pos.x + pos.z) * 0.04 + uTime * 0.7) * 1.0;
                    float wave4 = cos(pos.x * 0.08 + pos.z * 0.06 + uTime * 0.4) * 0.8;
                    float wave5 = sin(pos.x * 0.12 - pos.z * 0.1 + uTime * 0.9) * 0.5;

                    pos.y = wave1 + wave2 + wave3 + wave4 + wave5;
                    vElevation = pos.y;

                    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
                    vWorldPos = worldPos.xyz;

                    gl_Position = projectionMatrix * viewMatrix * worldPos;
                }
            `,
            fragmentShader: `
                uniform vec3 uDeepColor;
                uniform vec3 uShallowColor;
                uniform vec3 uFoamColor;
                uniform float uTime;

                varying vec2 vUv;
                varying float vElevation;
                varying vec3 vWorldPos;

                float random(vec2 st) {
                    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
                }

                void main() {
                    // Distance-based color blending
                    float dist = length(vWorldPos.xz) * 0.003;
                    vec3 color = mix(uShallowColor, uDeepColor, clamp(dist, 0.0, 1.0));

                    // Foam on wave peaks
                    float foam = smoothstep(2.0, 4.0, vElevation) * 0.3;
                    color = mix(color, uFoamColor, foam);

                    // Subtle sparkle based on view angle
                    float sparkle = pow(max(0.0, vElevation * 0.3), 3.0) * 0.15;
                    color += vec3(sparkle);

                    // Subtle animated texture
                    float tex = sin(vWorldPos.x * 0.5 + uTime * 0.2) * sin(vWorldPos.z * 0.5 + uTime * 0.15) * 0.05;
                    color += tex;

                    gl_FragColor = vec4(color, 1.0);
                }
            `,
            side: THREE.FrontSide
        });

        this.material = oceanMaterial;

        const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
        geometry.rotateX(-Math.PI / 2);

        this.mesh = new THREE.Mesh(geometry, oceanMaterial);
        this.mesh.receiveShadow = true;
        this.mesh.position.y = -0.5;
        this.scene.add(this.mesh);

        // Also create ocean floor
        const floorGeo = new THREE.PlaneGeometry(size, size);
        floorGeo.rotateX(-Math.PI / 2);
        const floorMat = new THREE.MeshStandardMaterial({
            color: 0x0a2a3a,
            roughness: 1.0,
            metalness: 0.0
        });
        this.floor = new THREE.Mesh(floorGeo, floorMat);
        this.floor.position.y = -3;
        this.scene.add(this.floor);
    }

    createUnderwaterFog() {
        // Add fog for depth effect
        this.scene.fog = new THREE.FogExp2(0x1a4a6e, 0.008);
    }

    update(delta) {
        this.time += delta;
        this.material.uniforms.uTime.value = this.time;

        // Follow camera
        if (this.mesh) {
            // Ocean follows player
        }
    }

    // Get wave height at world position
    getWaveHeight(x, z) {
        const wave1 = Math.sin(x * 0.05 + this.time * 0.5) * 1.5;
        const wave2 = Math.sin(z * 0.03 + this.time * 0.3) * 2.0;
        const wave3 = Math.sin((x + z) * 0.04 + this.time * 0.7) * 1.0;
        return wave1 + wave2 + wave3 - 0.5;
    }

    dispose() {
        this.mesh.geometry.dispose();
        this.material.dispose();
        this.scene.remove(this.mesh);
        this.scene.remove(this.floor);
        this.floor.geometry.dispose();
        this.floor.material.dispose();
    }
}
