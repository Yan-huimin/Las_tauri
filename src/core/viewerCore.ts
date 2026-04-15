// src/core/viewerCore.ts

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

class ViewerCore {
    private static instance: ViewerCore;

    scene!: THREE.Scene;
    camera!: THREE.PerspectiveCamera;
    renderer!: THREE.WebGLRenderer;
    controls!: OrbitControls;

    private container!: HTMLDivElement;
    private animationId: number | null = null;

    private constructor() {}

    static getInstance() {
        if (!ViewerCore.instance) {
            ViewerCore.instance = new ViewerCore();
        }
        return ViewerCore.instance;
    }

    init(container: HTMLDivElement) {
        // ❗ 防止重复初始化
        if (this.renderer) return;

        this.container = container;

        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(
            60,
            container.clientWidth / container.clientHeight,
            0.1,
            100000
        );

        this.camera.position.set(100, 100, 100);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(container.clientWidth, container.clientHeight);

        container.appendChild(this.renderer.domElement);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        this.start();
    }

    private start() {
        if (this.animationId) return;

        const animate = () => {
            this.animationId = requestAnimationFrame(animate);
            this.controls.update();
            this.renderer.render(this.scene, this.camera);
        };

        animate();
    }

    dispose() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        this.controls?.dispose();
        this.renderer?.dispose();

        if (this.container && this.renderer.domElement) {
            this.container.removeChild(this.renderer.domElement);
        }
    }
}

export default ViewerCore;