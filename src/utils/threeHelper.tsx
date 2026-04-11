// ThreeHelpers.ts
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export const initScene = (container: HTMLDivElement) => {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x202020);

  // 1. 获取容器的实际尺寸
  const width = container.clientWidth;
  const height = container.clientHeight;

  // 2. 基于容器比例初始化相机
  const camera = new THREE.PerspectiveCamera(
    75,
    width / height, // 使用容器长宽比
    0.1,
    100000
  );
  camera.position.set(200, 200, 200);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  
  // 3. 设置渲染器大小为容器大小
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio); // 保持高清屏清晰度

  // 4. 将 canvas 样式设为 100% 确保填充
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.style.display = "block";

  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  const axesHelper = new THREE.AxesHelper(100);
  scene.add(axesHelper);

  return { scene, camera, renderer, controls, axesHelper };
};

// 修改：传入 container 参数
export const handleResize = (
  container: HTMLDivElement,
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer
) => {
  const width = container.clientWidth;
  const height = container.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
};