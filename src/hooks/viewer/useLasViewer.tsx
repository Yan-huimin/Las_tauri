import useFileStore from "@/store/useFileStore";
import { useLasStore } from "@/store/useLasStore";
import type { PointCloudData } from "@/types/las.types";
import { sendErrorLog, sendInfoLog } from "@/utils/sendlog";
import { handleResize, initScene } from "@/utils/threeHelper";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export const useLasViewer = () => {
    // 1. 所有 Hooks (useRef, useStore, useEffect) 必须放在最顶部
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const axesRef = useRef<THREE.AxesHelper | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const geometryRef = useRef<THREE.BufferGeometry | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // 降采样
    // const voxelSizeRef = useRef<number>(1.0);
    // const preVoxelSizeRef = useRef<number>(1.0);
    
    const totalPointsRef = useRef<number>(0);
    const shownPointsRef = useRef<number>(0);
    const isAnimatingRef = useRef<boolean>(false);
    const lastTimeRef = useRef<number>(0);

    // 获取 Store 数据
    const path = useFileStore((state) => state.workFile);
    const setLasData = useLasStore((state) => state.setLasPoints);
    const voxel = useLasStore((state) => state.voxelSlider);
    const setVoxelSize = useLasStore((state) => state.setVoxelSlider);


        // 停止渲染并清除数据api
    const handleStopAndClear = async (): Promise<void> => {
        // 立即切断 Ref 标志位，停止当前的渲染帧或导入回调
        isAnimatingRef.current = false;
        
        // 显式清理 Three.js 显存
        if (sceneRef.current) {
            // 强制转换为 THREE.Points 数组进行处理
            const pointsObjects = sceneRef.current.children.filter(
            (child): child is THREE.Points => child instanceof THREE.Points
            );

            pointsObjects.forEach((points) => {
            sceneRef.current?.remove(points);
            points.geometry.dispose();
            
            if (Array.isArray(points.material)) {
                points.material.forEach(m => m.dispose());
            } else {
                points.material.dispose();
            }
            });
        }

        // 更新 React 状态
        // 注意：这里的 set 操作是触发异步渲染请求
        shownPointsRef.current = 0;
        totalPointsRef.current = 0;

        // 使用 TS 定义的 Promise 等待微任务队列清空
        // 这一步确保了浏览器有时间执行 Paint (重绘)，让进度条归零
        await new Promise<void>((resolve) => {
            setTimeout(() => {
            resolve();
            }, 60); // 60ms 略大于一帧(16.6ms)的时间，确保重绘完成
        });

        console.log("Cleanup complete and UI repainted.");
    };

    // 将加载函数定义为普通的 async 函数
    const handleLoadLas = async () => {
        if (!path) {
            sendErrorLog("Front: No path provided");
            return;
        }

        try {
            const is_exist = await invoke<boolean>("check_file_exists", { path });
            if (!is_exist) {
                sendErrorLog(`Front: the file does not exist at path: ${path}`);
                return;
            }

            // 停止当前动画
            isAnimatingRef.current = false;
            shownPointsRef.current = 0;

            // 清理旧场景内容
            if (sceneRef.current) {
                const pointsObjects = sceneRef.current.children.filter(c => c instanceof THREE.Points);
                pointsObjects.forEach(obj => {
                    sceneRef.current?.remove(obj);
                    (obj as THREE.Points).geometry.dispose();
                    const mat = (obj as THREE.Points).material;
                    Array.isArray(mat) ? mat.forEach(m => m.dispose()) : mat.dispose();
                });
            }

            // 加载新数据
            const data = await invoke<PointCloudData>("load_las_file", { path });
            setLasData(data);
            sendInfoLog(`点数：{data.positions.length}`)

            if (!sceneRef.current || !data) return;

            // 创建几何体
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(data.positions);
            // 注意这里是 "position"
            geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

            if (data.colors && data.colors.length > 0) {
                const colors = new Uint8Array(data.colors);
                // true 表示将 0-255 映射为 0.0-1.0
                geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3, true));
            }

            const material = new THREE.PointsMaterial({
                size: 0.5,
                vertexColors: !!(data.colors && data.colors.length > 0),
                sizeAttenuation: true,
            });

            const points = new THREE.Points(geometry, material);
            geometry.setDrawRange(0, 0); // 初始显示0个点
            sceneRef.current.add(points);

            // 更新引用以启动动画
            totalPointsRef.current = positions.length / 3;
            geometryRef.current = geometry;
            shownPointsRef.current = 0;
            lastTimeRef.current = performance.now(); // 初始化时间

            // 相机自动对焦
            geometry.computeBoundingSphere();
            const sphere = geometry.boundingSphere;
            if (sphere && cameraRef.current && controlsRef.current) {
                const center = sphere.center;
                const radius = Math.max(sphere.radius, 10);
                const distance = radius * 2.5;
                
                cameraRef.current.position.set(center.x + distance, center.y + distance, center.z + distance);
                cameraRef.current.lookAt(center);
                controlsRef.current.target.copy(center);
                controlsRef.current.update();
            }

            isAnimatingRef.current = true;
            sendInfoLog(`Front Info: las file load successfully: ${path}`);
        } catch (error) {
            sendErrorLog(`Front Error: ${error instanceof Error ? error.message : String(error)}`);
        }
    };

    // 滑块处理函数
    const handleVoxelChange = async (voxelSize: number) => {

        // 防止不必要的渲染或者多次请求
        if(voxelSize === voxel || isLoading === true)   return;

        setIsLoading(true);
        setVoxelSize(voxel);

        if (!sceneRef.current || !geometryRef.current) return;

        try {
            const data = await invoke<PointCloudData>("voxel_downsample", {
                points: useLasStore.getState().lasPoints, // 或缓存原始点
                voxelSize,
            });

            const positions = new Float32Array(data.positions);

            // 直接替换 buffer
            geometryRef.current.setAttribute(
                "position",
                new THREE.BufferAttribute(positions, 3)
            );

            geometryRef.current.attributes.position.needsUpdate = true;

            // 更新 draw range
            const newCount = positions.length / 3;
            geometryRef.current.setDrawRange(0, newCount);

            totalPointsRef.current = newCount;
            shownPointsRef.current = newCount; // 直接显示全部（不再动画也可以）

            // 结束渲染
            setIsLoading(false);
        } catch (e) {
            setIsLoading(false);
            sendErrorLog(`Voxel update failed: ${e}`);
        }
    };

    // 3. 所有的副作用逻辑放在 useEffect 中
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const { scene, camera, renderer, controls, axesHelper } = initScene(container);
        sceneRef.current = scene;
        cameraRef.current = camera;
        rendererRef.current = renderer;
        controlsRef.current = controls;
        axesRef.current = axesHelper;

        let animationFrameId: number;

        const animate = (time: number) => {
            animationFrameId = requestAnimationFrame(animate);

            if (isAnimatingRef.current && geometryRef.current) {
                const total = totalPointsRef.current;
                if (total > 0) {
                    const delta = Math.max(0, time - lastTimeRef.current);
                    lastTimeRef.current = time;

                    const speed = 100_000; // 每秒10万点，动画更明显
                    const add = Math.floor((speed * delta) / 1000);
                    const next = Math.min(total, shownPointsRef.current + add);

                    if (next !== shownPointsRef.current) {
                        shownPointsRef.current = next;
                        geometryRef.current.setDrawRange(0, next);
                    }

                    if (shownPointsRef.current >= total) {
                        isAnimatingRef.current = false;
                    }
                }
            }

            controls.update();
            renderer.render(scene, camera);
        };

        animationFrameId = requestAnimationFrame(animate);

        const resizeObserver = new ResizeObserver(() => {
            if (container) {
                handleResize(container, camera, renderer);
            }
        });

        resizeObserver.observe(container);

        const onResize = () => handleResize(container, camera, renderer);
        window.addEventListener("resize", onResize);

        return () => {
            cancelAnimationFrame(animationFrameId);
            resizeObserver.disconnect();
            window.removeEventListener("resize", onResize);
            controls.dispose();
            renderer.dispose();

            // 防止出现两个canvas，因为strct 模式会更新两次
            if (container && renderer.domElement) {
                container.removeChild(renderer.domElement);
            }
        };
    }, []);

    return {
        containerRef,
        handleLoadLas,
        handleStopAndClear,
        handleVoxelChange,
        isAnimatingRef
    };
};