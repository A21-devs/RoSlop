import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

// Every model card on screen is drawn live, textures and all, by one shared WebGL renderer that
// copies each frame onto the card's own canvas. Cards off screen aren't drawn. Loaded models stay
// in memory for a while, so scrolling back shows them straight away.

export type Ext = "glb" | "gltf" | "fbx" | "obj";

interface Loaded {
  root: THREE.Object3D;
  clips: THREE.AnimationClip[];
  radius: number;
}

// Resolves once the model and every texture it pulls in have arrived, so nothing is drawn grey.
async function load(url: string, ext: Ext): Promise<Loaded> {
  const manager = new THREE.LoadingManager();
  const textures = new Promise<void>(done => {
    manager.onLoad = () => done();
    manager.onError = () => {};
    setTimeout(done, 15_000);
  });
  let obj: THREE.Object3D, clips: THREE.AnimationClip[] = [];
  if (ext === "glb" || ext === "gltf") {
    const g = await new GLTFLoader(manager).loadAsync(url);
    obj = g.scene;
    clips = g.animations;
  } else if (ext === "fbx") {
    obj = await new FBXLoader(manager).loadAsync(url);
    clips = obj.animations;
  } else {
    obj = await new OBJLoader(manager).loadAsync(url);
  }
  await textures;
  // Centred on everywhere the animation goes, not just its first pose, so nothing walks off
  // the card.
  const box = new THREE.Box3().setFromObject(obj);
  if (clips.length) {
    const mixer = new THREE.AnimationMixer(obj);
    mixer.clipAction(clips[0]).play();
    for (let i = 0; i < 8; i++) {
      mixer.update(clips[0].duration / 8);
      obj.updateMatrixWorld(true);
      box.union(new THREE.Box3().setFromObject(obj));
    }
    mixer.stopAllAction();
    mixer.uncacheRoot(obj);
  }
  const center = box.getCenter(new THREE.Vector3());
  obj.position.sub(center);
  const root = new THREE.Group();
  root.add(obj);
  const size = box.getSize(new THREE.Vector3());
  return { root, clips, radius: Math.max(size.x, size.y, size.z) || 1 };
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

// Files download and parse a few at a time, newest first, so what's on screen now goes ahead of
// what was scrolled past.
const waiting: (() => void)[] = [];
let running = 0;
function slot(): Promise<() => void> {
  return new Promise(go => {
    const start = () => {
      running++;
      go(() => {
        running--;
        waiting.pop()?.();
      });
    };
    if (running < 4) start();
    else waiting.push(start);
  });
}

// Recently used models, kept until there are too many.
const KEEP = 60;
const models = new Map<string, Promise<Loaded>>();
function model(key: string, url: () => Promise<string>, ext: Ext): Promise<Loaded> {
  let p = models.get(key);
  if (p) {
    models.delete(key);
    models.set(key, p);
    return p;
  }
  p = slot().then(async done => {
    try {
      return await load(await url(), ext);
    } finally {
      done();
    }
  });
  p.catch(() => models.delete(key));
  models.set(key, p);
  for (const [k, old] of models) {
    if (models.size <= KEEP) break;
    if ([...views].some(v => v.key === k)) continue;
    models.delete(k);
    void old.then(m => dispose(m.root), () => {});
  }
  return p;
}

interface View {
  key: string;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  scene?: THREE.Scene;
  camera?: THREE.PerspectiveCamera;
  pivot?: THREE.Group;
  mixer?: THREE.AnimationMixer;
  seen: boolean;
  hover: boolean;
  dirty: boolean;
}

const views = new Set<View>();
let renderer: THREE.WebGLRenderer | null = null;
let frame = 0;
const clock = new THREE.Clock();

function loop() {
  frame = 0;
  const dt = Math.min(clock.getDelta(), 0.1);
  let busy = false;
  for (const v of views) {
    if (!v.scene || !v.seen) continue;
    const moving = !!v.mixer || v.hover;
    if (!moving && !v.dirty) continue;
    v.mixer?.update(dt);
    if (v.hover) v.pivot!.rotation.y += dt * 0.8;
    draw(v);
    busy ||= moving;
  }
  if (busy) frame = requestAnimationFrame(loop);
}

function wake() {
  if (!frame) {
    clock.getDelta();
    frame = requestAnimationFrame(loop);
  }
}

function draw(v: View) {
  const w = v.canvas.clientWidth, h = v.canvas.clientHeight;
  if (!w || !h) return;
  const scale = Math.min(devicePixelRatio, 1.5);
  const pw = Math.round(w * scale), ph = Math.round(h * scale);
  if (v.canvas.width !== pw || v.canvas.height !== ph) {
    v.canvas.width = pw;
    v.canvas.height = ph;
  }
  renderer ??= new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const size = renderer.getSize(new THREE.Vector2());
  if (size.x < pw || size.y < ph) renderer.setSize(Math.max(size.x, pw), Math.max(size.y, ph), false);
  const full = renderer.getSize(new THREE.Vector2());
  renderer.setViewport(0, full.y - ph, pw, ph);
  renderer.setScissor(0, full.y - ph, pw, ph);
  renderer.setScissorTest(true);
  renderer.setClearColor(0x000000, 0);
  renderer.clear();
  v.camera!.aspect = pw / ph;
  v.camera!.updateProjectionMatrix();
  renderer.render(v.scene!, v.camera!);
  v.ctx.clearRect(0, 0, pw, ph);
  v.ctx.drawImage(renderer.domElement, 0, 0, pw, ph, 0, 0, pw, ph);
  v.dirty = false;
}

// Shows a model on a card's canvas for as long as the card is mounted. onReady gets a still of
// the first textured frame, so the card can show it instantly next time.
export function showModel(canvas: HTMLCanvasElement, key: string, url: () => Promise<string>, ext: Ext, on: { ready(still: string, animated: boolean): void; failed(): void }) {
  const v: View = { key, canvas, ctx: canvas.getContext("2d")!, seen: true, hover: false, dirty: true };
  views.add(v);
  const io = new IntersectionObserver(([e]) => {
    v.seen = e.isIntersecting;
    if (v.seen) {
      v.dirty = true;
      wake();
    }
  }, { rootMargin: "200px" });
  io.observe(canvas);

  model(key, url, ext).then(m => {
    if (!views.has(v)) return;
    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xffffff, 0x444455, 2.2));
    const sun = new THREE.DirectionalLight(0xffffff, 2.4);
    sun.position.set(3, 5, 4);
    scene.add(sun);
    // A model can only sit in one scene, so another card showing the same file gets a copy.
    const shown = [...views].some(o => o !== v && o.pivot?.children[0] === m.root) ? m.root.clone(true) : m.root;
    const pivot = new THREE.Group();
    pivot.add(shown);
    scene.add(pivot);
    const r = m.radius;
    const camera = new THREE.PerspectiveCamera(35, 1, r / 100, r * 100);
    camera.position.set(r * 1.6, r * 1.1, r * 2.1);
    camera.lookAt(0, 0, 0);
    Object.assign(v, { scene, camera, pivot, dirty: true });
    if (m.clips.length) {
      v.mixer = new THREE.AnimationMixer(shown);
      v.mixer.clipAction(m.clips[0]).play();
    }
    draw(v);
    on.ready(canvas.toDataURL("image/webp", 0.8), m.clips.length > 0);
    wake();
  }, () => views.has(v) && on.failed());

  return {
    hover(h: boolean) {
      v.hover = h;
      v.dirty = true;
      wake();
    },
    stop() {
      io.disconnect();
      views.delete(v);
      v.mixer?.stopAllAction();
      v.pivot?.clear();
    },
  };
}
