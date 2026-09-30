import * as THREE from "three";
import { lerp, wrap } from "@/lib/animation";

export type GalleryMotion = { target: number; current: number; visible: boolean; requestRender?: () => void };

const vertexShader = `
  uniform float uBend;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 bent = position;
    bent.z += sin(uv.x * 3.14159265) * uBend;
    bent.y += sin(uv.x * 3.14159265) * uBend * 0.08;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(bent, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uImage;
  uniform float uOpacity;
  uniform float uImageAspect;
  varying vec2 vUv;
  void main() {
    vec2 imageUv = vUv;
    float frameAspect = 1.8;
    if (uImageAspect > frameAspect) {
      imageUv.x = (imageUv.x - 0.5) * frameAspect / uImageAspect + 0.5;
    } else {
      imageUv.y = (imageUv.y - 0.5) * uImageAspect / frameAspect + 0.5;
    }
    vec2 corner = abs(vUv - 0.5) - vec2(0.46, 0.43);
    float edge = length(max(corner, 0.0)) + min(max(corner.x, corner.y), 0.0) - 0.04;
    float mask = 1.0 - smoothstep(-0.003, 0.003, edge);
    vec4 pixel = texture2D(uImage, imageUv);
    float shade = 1.0 - pow(abs(vUv.x - 0.5) * 2.0, 3.0) * 0.12;
    gl_FragColor = vec4(pixel.rgb * shade, pixel.a * mask * uOpacity);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

// The renderer only draws while visible and disposes every GPU resource on exit.
export function createGalleryRenderer(
  host: HTMLElement,
  images: string[],
  motion: GalleryMotion,
  onReady: () => void,
  onIndex: (index: number) => void,
  onFailure: () => void,
) {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  const geometry = new THREE.PlaneGeometry(3.8, 3.8 / 1.8, 40, 12);
  const textures: THREE.Texture[] = [];
  const materials: THREE.ShaderMaterial[] = [];
  const meshes: THREE.Mesh[] = [];
  let disposed = false;
  let frame = 0;
  let lastTime = performance.now();
  let lastIndex = -1;
  let loaded = 0;
  let failed = false;
  let needsRender = true;
  renderer.debug.onShaderError = () => {
    failed = true;
    onFailure();
  };
  const loader = new THREE.TextureLoader();

  images.forEach((source, index) => {
    const texture = loader.load(source, (loadedTexture) => {
      if (disposed) { loadedTexture.dispose(); return; }
      const image = loadedTexture.image as HTMLImageElement;
      materials[index].uniforms.uImageAspect.value = image.width / image.height;
      needsRender = true;
      loaded += 1;
      if (loaded === images.length && !failed) onReady();
      requestRender();
    }, undefined, () => { if (!disposed) { failed = true; onFailure(); } });
    texture.colorSpace = THREE.SRGBColorSpace;
    textures.push(texture);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uImage: { value: texture },
        uBend: { value: 0 },
        uOpacity: { value: 1 },
        uImageAspect: { value: 1.8 },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
    });
    materials.push(material);
    const mesh = new THREE.Mesh(geometry, material);
    meshes.push(mesh);
    scene.add(mesh);
  });

  function resize() {
    const width = host.clientWidth;
    const height = host.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.position.z = Math.max(4.6, 6.5 / camera.aspect);
    camera.updateProjectionMatrix();
    needsRender = true;
    requestRender();
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  resize();
  function render(time: number) {
    frame = 0;
    if (disposed) return;
    const delta = Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;
    if (failed || !motion.visible || document.hidden) return;
    if (!needsRender && Math.abs(motion.target - motion.current) < 0.0001) return;
    const previous = motion.current;
    motion.current = lerp(previous, motion.target, 1 - Math.exp(-9 * delta));
    const velocity = motion.current - previous;
    meshes.forEach((mesh, index) => {
      const distance = wrap(index - motion.current + images.length / 2, images.length) - images.length / 2;
      mesh.position.set(distance * 4.35, -Math.abs(distance) * 0.12, -Math.abs(distance) * 0.85);
      mesh.rotation.y = -distance * 0.2;
      mesh.rotation.z = -distance * 0.015;
      materials[index].uniforms.uBend.value = Math.max(-0.65, Math.min(0.65, velocity * 12));
      materials[index].uniforms.uOpacity.value = Math.max(0.28, 1 - Math.abs(distance) * 0.25);
    });
    const index = wrap(Math.round(motion.current), images.length);
    if (index !== lastIndex) { lastIndex = index; onIndex(index); }
    renderer.render(scene, camera);
    needsRender = false;
    if (Math.abs(motion.target - motion.current) >= 0.0001) requestRender();
  }
  function requestRender() {
    if (!disposed && !failed && !frame && motion.visible && !document.hidden) {
      frame = requestAnimationFrame(render);
    }
  }
  motion.requestRender = requestRender;
  document.addEventListener("visibilitychange", requestRender);
  const contextLost = (event: Event) => { event.preventDefault(); failed = true; onFailure(); };
  renderer.domElement.addEventListener("webglcontextlost", contextLost);
  requestRender();
  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    if (motion.requestRender === requestRender) delete motion.requestRender;
    document.removeEventListener("visibilitychange", requestRender);
    resizeObserver.disconnect();
    renderer.domElement.removeEventListener("webglcontextlost", contextLost);
    geometry.dispose();
    materials.forEach((material) => material.dispose());
    textures.forEach((texture) => texture.dispose());
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
  };
}
