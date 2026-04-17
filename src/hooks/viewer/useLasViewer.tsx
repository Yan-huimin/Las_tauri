import { useLasStore } from "@/store/useLasStore";
import type { PointCloudData } from "@/types/las.types";
import { sendErrorLog, sendInfoLog } from "@/utils/sendlog";
import { handleResize, initScene } from "@/utils/threeHelper";
import { toOriginalCoords, calculateDistance } from "@/utils/coordinates";
import { invoke } from "@tauri-apps/api/core";
import { useCallback, useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export const useLasViewer = (target: 'current' | 'compare' = 'current') => {
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const axesRef = useRef<THREE.AxesHelper | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const geometryRef = useRef<THREE.BufferGeometry | null>(null);

    // 降采样
    // const voxelSizeRef = useRef<number>(1.0);
    // const preVoxelSizeRef = useRef<number>(1.0);

    const totalPointsRef = useRef<number>(0);
    const shownPointsRef = useRef<number>(0);
    const isAnimatingRef = useRef<boolean>(false);
    const lastTimeRef = useRef<number>(0);

    // 当前显示的点云数据引用（用于测量）
    const pointCloudDataRef = useRef<PointCloudData | null>(null);

    // 测量可视化引用
    const measurementMarkersRef = useRef<THREE.Mesh[]>([]);
    const measurementLineRef = useRef<THREE.Line | null>(null);

    // 获取 Store 数据
    // const path = useFileStore((state) => state.workFile);
    const setCurrentLasData = useLasStore((state) => state.setCurrentLasPoints);
    const setCompareLasData = useLasStore((state) => state.setCompareLasPoints);

    // 测量相关状态
    const measurement = useLasStore((state) => state.measurement);
    //@ts-ignore
    const addMeasurementPoint = useLasStore((state) => state.addMeasurementPoint);
    const updateMeasurementDistance = useLasStore((state) => state.updateMeasurementDistance);

        // 停止渲染并清除数据api
    const handleStopAndClear = useCallback(async (): Promise<void> => {
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

            // 清理测量可视化
            measurementMarkersRef.current.forEach(marker => {
                sceneRef.current?.remove(marker);
                marker.geometry.dispose();
                (marker.material as THREE.Material).dispose();
            });
            measurementMarkersRef.current = [];
            if (measurementLineRef.current) {
                sceneRef.current?.remove(measurementLineRef.current);
                measurementLineRef.current.geometry.dispose();
                (measurementLineRef.current.material as THREE.Material).dispose();
                measurementLineRef.current = null;
            }
        }

        // 更新 React 状态
        // 注意：这里的 set 操作是触发异步渲染请求
        shownPointsRef.current = 0;
        totalPointsRef.current = 0;
        pointCloudDataRef.current = null;

        // 使用 TS 定义的 Promise 等待微任务队列清空
        // 这一步确保了浏览器有时间执行 Paint (重绘)，让进度条归零
        await new Promise<void>((resolve) => {
            setTimeout(() => {
            resolve();
            }, 60); // 60ms 略大于一帧(16.6ms)的时间，确保重绘完成
        });

        console.log("Cleanup complete and UI repainted.");
    }, []);

    /**
     * 解析后端传来的点云二进制包
     * 结构：
     * 1. point_count (u64/u32?) - 假设为 8 字节 (u64)
     * 2. offset (3 * f64) - 24 字节
     * 3. positions (N * 3 * f32) - N * 12 字节
     * 4. colors (N * 3 * u8) - N * 3 字节
     */
    function parsePointCloudBinary(input: Uint8Array | ArrayBuffer): PointCloudData {
        // 统一提取出 ArrayBuffer 和偏移量
        // 如果是 Uint8Array，需要考虑它在底层 buffer 中的起始偏移量(byteOffset)
        const buffer = input instanceof Uint8Array ? input.buffer : input;
        const byteOffset = input instanceof Uint8Array ? input.byteOffset : 0;
        const byteLength = input instanceof Uint8Array ? input.byteLength : input.byteLength;

        let cursor = 0;

        // 构造 DataView 时传入偏移量和长度
        const view = new DataView(buffer, byteOffset, byteLength);
        
        // 读取 Header (u64)
        const pointCount = Number(view.getBigUint64(cursor, true));
        cursor += 8;

        // 读取 Offset (3 * f64)
        // 注意：TypedArray 的偏移量必须是相对于整个 Buffer 的，所以要加上 byteOffset
        const offsetView = new Float64Array(buffer, byteOffset + cursor, 3);
        const offset: [number, number, number] = [offsetView[0], offsetView[1], offsetView[2]];
        cursor += 24;

        // 读取 Positions (N * 3 * f32)
        const positions = new Float32Array(buffer, byteOffset + cursor, pointCount * 3);
        cursor += pointCount * 3 * 4;

        // 读取 Colors (N * 3 * u8)
        const colors = new Uint8Array(buffer, byteOffset + cursor, pointCount * 3);

        return { positions, colors, offset };
    }

    // 显示点云数据
    const displayPointCloudData = useCallback((data: PointCloudData, targetParam?: 'current' | 'compare') => {
        const currentTarget = targetParam ?? target;
        console.log(`[displayPointCloudData] Called for target: ${currentTarget}, scene ready: ${!!sceneRef.current}, data points: ${data.positions.length / 3}`);
        if (!sceneRef.current) {
            console.warn(`[displayPointCloudData] Scene not ready yet for target: ${currentTarget}`);
            return;
        }

        // 更新store
        if (currentTarget === 'current') {
            setCurrentLasData(data);
        } else {
            setCompareLasData(data);
        }
        // 更新当前点云引用（用于测量）
        pointCloudDataRef.current = data;

        // 停止当前动画
        isAnimatingRef.current = false;
        shownPointsRef.current = 0;

        // 清理旧场景内容
        const pointsObjects = sceneRef.current.children.filter(c => c instanceof THREE.Points);
        pointsObjects.forEach(obj => {
            sceneRef.current?.remove(obj);
            (obj as THREE.Points).geometry.dispose();
            const mat = (obj as THREE.Points).material;
            Array.isArray(mat) ? mat.forEach(m => m.dispose()) : mat.dispose();
        });

        // 清理测量可视化
        measurementMarkersRef.current.forEach(marker => {
            sceneRef.current?.remove(marker);
            marker.geometry.dispose();
            (marker.material as THREE.Material).dispose();
        });
        measurementMarkersRef.current = [];
        if (measurementLineRef.current) {
            sceneRef.current?.remove(measurementLineRef.current);
            measurementLineRef.current.geometry.dispose();
            (measurementLineRef.current.material as THREE.Material).dispose();
            measurementLineRef.current = null;
        }

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
            size: 0.5, // 增加点大小以便更容易拾取
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
        sendInfoLog(`Front Info: point cloud data displayed to ${currentTarget}, points: ${positions.length / 3}`);
    }, [setCurrentLasData, setCompareLasData, sendInfoLog, target]);


    const handleLoadLas = useCallback(async (filePath?: string) => {
        const targetPath = filePath;

        if (!targetPath || targetPath === '') {
            console.log("handleloadlas no file");
            sendErrorLog("Front: No path provided");
            return;
        }

        console.log(`test handleLoadLas ${targetPath}`);

        try {
            const is_exist = await invoke<boolean>("check_file_exists", { path: targetPath });
            if (!is_exist) {
                sendErrorLog(`Front: the file does not exist at path: ${targetPath}`);
                return;
            }

            // 加载新数据
            const cur = await invoke<Uint8Array>("load_las_file", { path: targetPath });
            // console.log("test loadlasinfo function");
            const data = parsePointCloudBinary(cur);
            setCurrentLasData(data);
            sendInfoLog(`点数：${data.positions.length}`);

            // 显示数据
            displayPointCloudData(data, 'current');

            sendInfoLog(`Front Info: las file load successfully: ${targetPath}`);
        } catch (error) {
            sendErrorLog(`Front Error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }, [setCurrentLasData, displayPointCloudData, sendInfoLog, sendErrorLog]);

    // 所有的副作用逻辑放在 useEffect 中
    useEffect(() => {
        console.log("[useLasViewer] Scene initialization useEffect running");
        const container = containerRef.current;
        if (!container) {
            console.warn("[useLasViewer] Container not found");
            return;
        }

        const { scene, camera, renderer, controls, axesHelper } = initScene(container);
        sceneRef.current = scene;
        cameraRef.current = camera;
        rendererRef.current = renderer;
        controlsRef.current = controls;
        axesRef.current = axesHelper;
        console.log("[useLasViewer] Scene initialized successfully");

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

        // 点击事件处理 - 用于点选取测量
        const handleClick = (event: MouseEvent) => {
            // 获取当前测量状态
            const storeState = useLasStore.getState();
            const { measurement } = storeState;

            // 只在测量模式下处理点击
            if (!measurement.isMeasuring) {
                console.log('[测量] 测量模式未激活，点击被忽略');
                return;
            }

            // 检查场景和相机是否就绪
            if (!sceneRef.current || !cameraRef.current || !container) {
                console.warn('[测量] 场景、相机或容器未就绪');
                return;
            }

            // 计算鼠标在归一化设备坐标中的位置
            const rect = container.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            console.log(`[测量] 鼠标点击位置: (${x.toFixed(3)}, ${y.toFixed(3)})`);

            // 创建射线投射器
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

            // 设置拾取阈值 - 点云的点很小，需要较大的容差
            raycaster.params.Points = { threshold: 10.0 }; // 增加阈值以便更容易拾取点

            // 与场景中的点云对象进行相交测试
            const pointsObjects = sceneRef.current.children.filter(
                (child): child is THREE.Points => child instanceof THREE.Points
            );

            console.log(`[测量] 场景中点云对象数量: ${pointsObjects.length}`);

            if (pointsObjects.length === 0) {
                console.warn('[测量] 场景中没有点云对象');
                return;
            }

            // 输出点云对象信息用于调试
            pointsObjects.forEach((points, index) => {
                const geometry = points.geometry;
                console.log(`[测量] 点云对象 ${index}:`, {
                    verticesCount: geometry.attributes.position?.count || 0,
                    drawRange: geometry.drawRange,
                    material: points.material
                });
            });

            const intersects = raycaster.intersectObjects(pointsObjects, true);

            console.log(`[测量] 相交点数量: ${intersects.length}`);

            if (intersects.length > 0) {
                const intersect = intersects[0];
                const displayPosition = intersect.point;
                const displayCoords: [number, number, number] = [
                    displayPosition.x,
                    displayPosition.y,
                    displayPosition.z
                ];

                console.log(`[测量] 拾取到的点:`, {
                    point: displayCoords,
                    distance: intersect.distance,
                    index: intersect.index,
                    object: intersect.object
                });

                // 获取当前点云的offset
                const pointCloudData = pointCloudDataRef.current;
                if (pointCloudData) {
                    const originalCoords = toOriginalCoords(displayCoords, pointCloudData.offset);

                    // 添加到测量点
                    storeState.addMeasurementPoint({
                        position: originalCoords,
                        displayPosition: displayCoords
                    });

                    console.log(`[测量] 测量点已添加: 原始坐标=${originalCoords}, 显示坐标=${displayCoords}`);
                } else {
                    console.warn('[测量] 当前点云数据为空');
                }
            } else {
                console.log('[测量] 没有找到相交的点，建议：1. 放大点云 2. 确保点在视图中 3. 点击点附近区域');
            }
        };

        // 添加事件监听器
        container.addEventListener('click', handleClick);
        resizeObserver.observe(container);

        const onResize = () => handleResize(container, camera, renderer);
        window.addEventListener("resize", onResize);

        return () => {
            cancelAnimationFrame(animationFrameId);
            resizeObserver.disconnect();
            container.removeEventListener('click', handleClick);
            window.removeEventListener("resize", onResize);
            controls.dispose();
            renderer.dispose();

            // 防止出现两个canvas，因为strct 模式会更新两次
            if (container && renderer.domElement) {
                container.removeChild(renderer.domElement);
            }
        };
    }, []);

    // 监听测量点变化，计算距离
    useEffect(() => {
        if (measurement.points.length === 2) {
            const point1 = measurement.points[0].position;
            const point2 = measurement.points[1].position;
            const distance = calculateDistance(point1, point2);
            updateMeasurementDistance(distance);
            console.log(`距离计算完成: ${distance.toFixed(3)}`);
        } else {
            updateMeasurementDistance(null);
        }
    }, [measurement.points, updateMeasurementDistance]);

    // 监听测量点变化，更新可视化标记和连线
    useEffect(() => {
        const scene = sceneRef.current;
        if (!scene) return;

        // 清理之前的标记和连线
        measurementMarkersRef.current.forEach(marker => scene.remove(marker));
        measurementMarkersRef.current = [];
        if (measurementLineRef.current) {
            scene.remove(measurementLineRef.current);
            measurementLineRef.current = null;
        }

        const pointCloudData = pointCloudDataRef.current;
        if (!pointCloudData) return;

        const offset = pointCloudData.offset;
        const points = measurement.points;

        // 创建标记球体
        const markers: THREE.Mesh[] = [];
        points.forEach((point, index) => {
            // 将原始坐标转换为当前窗口的显示坐标
            const displayX = point.position[0] - offset[0];
            const displayY = point.position[1] - offset[1];
            const displayZ = point.position[2] - offset[2];

            const geometry = new THREE.SphereGeometry(2, 16, 16);
            const material = new THREE.MeshBasicMaterial({
                color: index === 0 ? 0xff0000 : 0x00ff00
            });
            const sphere = new THREE.Mesh(geometry, material);
            sphere.position.set(displayX, displayY, displayZ);
            scene.add(sphere);
            markers.push(sphere);
        });
        measurementMarkersRef.current = markers;

        // 如果有两个点，创建连线
        if (points.length === 2) {
            const point1 = points[0].position;
            const point2 = points[1].position;
            const display1 = [
                point1[0] - offset[0],
                point1[1] - offset[1],
                point1[2] - offset[2]
            ];
            const display2 = [
                point2[0] - offset[0],
                point2[1] - offset[1],
                point2[2] - offset[2]
            ];
            const geometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(display1[0], display1[1], display1[2]),
                new THREE.Vector3(display2[0], display2[1], display2[2])
            ]);
            const material = new THREE.LineBasicMaterial({ color: 0xffff00 });
            const line = new THREE.Line(geometry, material);
            scene.add(line);
            measurementLineRef.current = line;
        }
    }, [measurement.points]);

    return {
        containerRef,
        handleLoadLas,
        handleStopAndClear,
        displayPointCloudData,
        isAnimatingRef
    };
};