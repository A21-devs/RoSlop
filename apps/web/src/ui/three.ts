import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

// Loaded only when a model or animation card scrolls into view.

export type Ext = "glb" | "gltf" | "fbx" | "obj";

async function load(url: string, ext: Ext): Promise<{ scene: THREE.Object3D; clips: THREE.AnimationClip[] }> {
  if (ext === "glb" || ext === "gltf") {
    const g = await new GLTFLoader().loadAsync(url);
    return { scene: g.scene, clips: g.animations };
  }
  if (ext === "fbx") {
    const f = await new FBXLoader().loadAsync(url);
    return { scene: f, clips: f.animations };
  }
  return { scene: await new OBJLoader().loadAsync(url), clips: [] };
}

function stage(obj: THREE.Object3D, aspect = 1) {
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x444455, 2.2));
  const sun = new THREE.DirectionalLight(0xffffff, 2.4);
  sun.position.set(3, 5, 4);
  scene.add(sun);
  scene.add(obj);
  // Frame it: centred, scaled to fit, seen from a three-quarter angle.
  const box = new THREE.Box3().setFromObject(obj);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  obj.position.sub(center);
  const r = Math.max(size.x, size.y, size.z) || 1;
  const camera = new THREE.PerspectiveCamera(35, aspect, r / 100, r * 100);
  camera.position.set(r * 1.6, r * 1.1, r * 2.1);
  camera.lookAt(0, 0, 0);
  return { scene, camera };
}

function dispose(obj: THREE.Object3D) {
  obj.traverse(o => {
    const m = o as THREE.Mesh;
    m.geometry?.dispose();
    for (const mat of Array.isArray(m.material) ? m.material : m.material ? [m.material] : []) {
      for (const v of Object.values(mat)) if (v instanceof THREE.Texture) v.dispose();
      mat.dispose();
    }
  });
}

// One renderer for every thumbnail, one render at a time, so a page of models never runs out
// of WebGL contexts.
let shared: THREE.WebGLRenderer | null = null;
let queue: Promise<unknown> = Promise.resolve();

export function renderThumb(url: string, ext: Ext, size = 320): Promise<{ image: string; animated: boolean }> {
  const job = queue.then(async () => {
    shared ??= new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    shared.setSize(size, size, false);
    const { scene: obj, clips } = await load(url, ext);
    const { scene, camera } = stage(obj);
    if (clips.length) {
      // Show the pose a little way into the animation rather than a T-pose.
      const mixer = new THREE.AnimationMixer(obj);
      mixer.clipAction(clips[0]).play();
      mixer.update(clips[0].duration * 0.3);
    }
    shared.render(scene, camera);
    const image = shared.domElement.toDataURL("image/webp", 0.85);
    dispose(obj);
    return { image, animated: clips.length > 0 };
  });
  queue = job.catch(() => {});
  return job;
}

// A live view for the card under the mouse: plays the first animation and turns slowly.
export function liveView(canvas: HTMLCanvasElement, url: string, ext: Ext): () => void {
  let stopped = false;
  let frame = 0;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  let obj: THREE.Object3D | null = null;
  load(url, ext).then(({ scene: o, clips }) => {
    if (stopped) return dispose(o);
    obj = o;
    const { scene, camera } = stage(o, canvas.clientWidth / Math.max(1, canvas.clientHeight));
    const mixer = clips.length ? new THREE.AnimationMixer(o) : null;
    mixer?.clipAction(clips[0]).play();
    const clock = new THREE.Clock();
    const pivot = new THREE.Group();
    scene.remove(o);
    pivot.add(o);
    scene.add(pivot);
    const tick = () => {
      if (stopped) return;
      const dt = clock.getDelta();
      mixer?.update(dt);
      if (!mixer) pivot.rotation.y += dt * 0.6;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(tick);
    };
    tick();
  }, () => {});
  return () => {
    stopped = true;
    cancelAnimationFrame(frame);
    if (obj) dispose(obj);
    renderer.dispose();
    renderer.forceContextLoss();
  };
}
