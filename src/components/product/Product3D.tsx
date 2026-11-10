"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { Area, MockupKind, Side } from "@/lib/mockups";

export type Face3D = {
  photo: string;
  area?: Area; // print area, % of the square photo
  art?: { url: string; x: number; y: number; size: number; ratio: number };
  text?: { label: string; x: number; y: number; size: number };
  top: "art" | "text";
};

type Props = {
  kind: MockupKind;
  color: string; // garment hex
  white: boolean;
  dark: boolean;
  faces: Record<Side, Face3D>;
  ink: string; // text hex
  font: string; // css font-family
  bold: boolean;
  angle: number; // degrees, controlled by the parent
};

const TEX = 1024; // texture size
const GRID = 200; // geometry resolution
const HMAP = 256; // heightmap resolution

/** How much each product "puffs out": depth of the body and how far in from the edge it reaches full depth. */
const SHAPE: Record<MockupKind, { depth: number; reach: number }> = {
  tee: { depth: 0.075, reach: 0.11 },
  sweatshirt: { depth: 0.085, reach: 0.12 },
  hoodie: { depth: 0.09, reach: 0.12 },
  tote: { depth: 0.035, reach: 0.12 },
  cup: { depth: 0.2, reach: 0.3 },
  cap: { depth: 0.16, reach: 0.25 },
};

export function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl2") || c.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return false;
    // Skip software renderers (very slow): PrintBlob hides 3D there too.
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const name = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
    return !/swiftshader|llvmpipe|software/i.test(name);
  } catch {
    return false;
  }
}

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.decoding = "async";
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = src;
  });

/** Paints one side as it would look printed: photo, color tint, then the design in the print area. */
async function paintFace(face: Face3D, p: Pick<Props, "color" | "white" | "dark" | "ink" | "font" | "bold">, base?: string) {
  const c = document.createElement("canvas");
  c.width = c.height = TEX;
  const g = c.getContext("2d")!;
  const photo = await loadImage(face.photo);
  let outline: HTMLImageElement | null = null;
  if (base) {
    // Back side: start from the front outline seen from behind, then lay the back photo, fitted to it.
    outline = await loadImage(base);
    g.save(); g.translate(TEX, 0); g.scale(-1, 1); g.drawImage(outline, 0, 0, TEX, TEX); g.restore();
  }
  g.drawImage(photo, 0, 0, TEX, TEX);
  if (!p.white) {
    g.globalCompositeOperation = "multiply";
    g.fillStyle = p.color;
    g.fillRect(0, 0, TEX, TEX);
    if (p.dark) {
      g.globalCompositeOperation = "soft-light";
      g.globalAlpha = 0.3;
      g.drawImage(photo, 0, 0, TEX, TEX);
      g.globalAlpha = 1;
    }
    g.globalCompositeOperation = "destination-in";
    if (outline) { g.save(); g.translate(TEX, 0); g.scale(-1, 1); g.drawImage(outline, 0, 0, TEX, TEX); g.restore(); }
    else g.drawImage(photo, 0, 0, TEX, TEX);
  }

  if (face.area) {
    const a = face.area;
    const ax = (a.x / 100) * TEX, ay = (a.y / 100) * TEX, aw = (a.w / 100) * TEX, ah = (a.h / 100) * TEX;
    g.save();
    g.globalCompositeOperation = "source-over";
    g.beginPath(); g.rect(ax, ay, aw, ah); g.clip();
    const drawArt = async () => {
      if (!face.art?.url) return;
      try {
        const img = await loadImage(face.art.url);
        const w = (face.art.size / 100) * aw;
        const h = w / (img.naturalWidth / img.naturalHeight || face.art.ratio || 1);
        g.globalCompositeOperation = p.dark ? "source-over" : "multiply";
        g.drawImage(img, ax + (face.art.x / 100) * aw - w / 2, ay + (face.art.y / 100) * ah - h / 2, w, h);
        g.globalCompositeOperation = "source-over";
      } catch { /* missing image: skip */ }
    };
    const drawText = () => {
      if (!face.text?.label) return;
      g.fillStyle = p.ink;
      g.font = `${p.bold ? 700 : 400} ${(face.text.size / 100) * aw}px ${p.font}`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText(face.text.label, ax + (face.text.x / 100) * aw, ay + (face.text.y / 100) * ah);
    };
    if (face.top === "text") { await drawArt(); drawText(); } else { drawText(); await drawArt(); }
    g.restore();
  }
  return c;
}

/** Heightmap from the photo's transparency: thin at the edges, rounded and full in the middle. */
async function heightmap(src: string, kind: MockupKind) {
  const img = await loadImage(src);
  const c = document.createElement("canvas");
  c.width = c.height = HMAP;
  const g = c.getContext("2d", { willReadFrequently: true })!;
  g.drawImage(img, 0, 0, HMAP, HMAP);
  const alpha = g.getImageData(0, 0, HMAP, HMAP).data;
  const N = HMAP, INF = 1e9;
  const d = new Float32Array(N * N);
  for (let i = 0; i < N * N; i++) d[i] = alpha[i * 4 + 3] > 40 ? INF : 0;
  // Two-pass chamfer distance to the nearest transparent pixel.
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const i = y * N + x; if (!d[i]) continue;
    let v = d[i];
    if (x > 0) v = Math.min(v, d[i - 1] + 1);
    if (y > 0) v = Math.min(v, d[i - N] + 1);
    if (x > 0 && y > 0) v = Math.min(v, d[i - N - 1] + 1.414);
    if (x < N - 1 && y > 0) v = Math.min(v, d[i - N + 1] + 1.414);
    d[i] = x === 0 || y === 0 ? 1 : v;
  }
  for (let y = N - 1; y >= 0; y--) for (let x = N - 1; x >= 0; x--) {
    const i = y * N + x; if (!d[i]) continue;
    let v = d[i];
    if (x < N - 1) v = Math.min(v, d[i + 1] + 1);
    if (y < N - 1) v = Math.min(v, d[i + N] + 1);
    if (x < N - 1 && y < N - 1) v = Math.min(v, d[i + N + 1] + 1.414);
    if (x > 0 && y < N - 1) v = Math.min(v, d[i + N - 1] + 1.414);
    d[i] = v;
  }
  const { depth, reach } = SHAPE[kind];
  const R = reach * N;
  const h = new Float32Array(N * N);
  for (let i = 0; i < N * N; i++) {
    // Depth starts a few pixels inside the outline, so the front and back halves meet with no gap at the edge.
    const t = Math.min(1, Math.max(0, d[i] - 3) / R);
    h[i] = d[i] ? depth * Math.sqrt(1 - (1 - t) * (1 - t)) : 0; // rounded (elliptic) profile
  }
  // Light blur so the surface is smooth.
  const out = new Float32Array(N * N);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    let s = 0, n = 0;
    for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
      const xx = x + dx, yy = y + dy;
      if (xx < 0 || yy < 0 || xx >= N || yy >= N) continue;
      s += h[yy * N + xx]; n++;
    }
    out[y * N + x] = d[y * N + x] > 3 ? s / n : 0;
  }
  return out;
}

function buildGeometry(h: Float32Array, mirror = false) {
  const geo = new THREE.PlaneGeometry(1, 1, GRID, GRID);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const uv = geo.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const u = uv.getX(i), v = uv.getY(i);
    const fx = (mirror ? 1 - u : u) * (HMAP - 1), fy = (1 - v) * (HMAP - 1);
    const x0 = Math.floor(fx), y0 = Math.floor(fy), x1 = Math.min(HMAP - 1, x0 + 1), y1 = Math.min(HMAP - 1, y0 + 1);
    const tx = fx - x0, ty = fy - y0;
    const z = (h[y0 * HMAP + x0] * (1 - tx) + h[y0 * HMAP + x1] * tx) * (1 - ty) + (h[y1 * HMAP + x0] * (1 - tx) + h[y1 * HMAP + x1] * tx) * ty;
    pos.setZ(i, z);
  }
  geo.computeVertexNormals();
  return geo;
}

function makeHanger() {
  const wood = new THREE.MeshStandardMaterial({ color: 0xb98552, roughness: 0.55 });
  const wire = new THREE.MeshStandardMaterial({ color: 0xbdbdbd, roughness: 0.3, metalness: 0.8 });
  const group = new THREE.Group();
  const arm = new THREE.QuadraticBezierCurve3(new THREE.Vector3(-0.24, 0.415, 0.0), new THREE.Vector3(0, 0.53, 0), new THREE.Vector3(0.24, 0.415, 0.0));
  group.add(new THREE.Mesh(new THREE.TubeGeometry(arm, 48, 0.012, 12, false), wood));
  const hook = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.47, 0), new THREE.Vector3(0, 0.53, 0), new THREE.Vector3(0.022, 0.565, 0), new THREE.Vector3(0.042, 0.545, 0),
  ]);
  group.add(new THREE.Mesh(new THREE.TubeGeometry(hook, 24, 0.004, 8, false), wire));
  return group;
}

/** WebGL view: the product built in 3D from its front and back photos, with the design printed on it. */
export default function Product3D(props: Props) {
  const host = useRef<HTMLDivElement>(null);
  const three = useRef<{
    renderer: THREE.WebGLRenderer; scene: THREE.Scene; camera: THREE.PerspectiveCamera; body: THREE.Group;
    front?: THREE.Mesh; back?: THREE.Mesh; kind?: MockupKind; photo?: string;
  } | null>(null);
  const angle = useRef(props.angle);
  angle.current = props.angle;

  // Scene setup (once).
  useEffect(() => {
    const el = host.current!;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    el.appendChild(renderer.domElement);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 20);
    camera.position.set(0, 0.02, 2.75);
    scene.add(new THREE.HemisphereLight(0xffffff, 0xd9d6cf, 1.6));
    const key = new THREE.DirectionalLight(0xffffff, 1.5);
    key.position.set(-1.2, 1.4, 2.2);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xffffff, 0.6);
    rim.position.set(1.5, 0.5, -2);
    scene.add(rim);

    const body = new THREE.Group();
    scene.add(body);
    three.current = { renderer, scene, camera, body };

    const resize = () => {
      const w = el.clientWidth || 1;
      renderer.setSize(w, w, false);
      camera.aspect = 1;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    let raf = 0, current = angle.current;
    const loop = () => {
      current += (angle.current - current) * 0.18; // smooth follow
      body.rotation.y = THREE.MathUtils.degToRad(current);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        const mat = m.material as THREE.MeshStandardMaterial | undefined;
        mat?.map?.dispose();
        mat?.dispose?.();
      });
      renderer.dispose();
      el.removeChild(renderer.domElement);
      three.current = null;
    };
  }, []);

  // Rebuild geometry when the product changes; repaint textures when the design or color changes.
  const { kind, faces, color, white, dark, ink, font, bold } = props;
  const sig = JSON.stringify({ faces, color, ink, font, bold });
  useEffect(() => {
    let cancelled = false;
    const t = three.current;
    if (!t) return;
    (async () => {
      const photos = `${faces.front.photo}|${faces.back.photo}`;
      if (t.kind !== kind || t.photo !== photos) {
        const hf = await heightmap(faces.front.photo, kind);
        if (cancelled) return;
        t.body.clear();
        const mat = () => new THREE.MeshStandardMaterial({ roughness: kind === "cup" ? 0.25 : 0.92, metalness: 0, alphaTest: 0.2 });
        t.front = new THREE.Mesh(buildGeometry(hf), mat());
        // The back uses the front's outline mirrored (what you see from behind), turned round so it bulges out behind.
        // Both shells then meet exactly at the edges.
        t.back = new THREE.Mesh(buildGeometry(hf, true), mat());
        t.back.rotation.y = Math.PI;
        t.body.add(t.front, t.back);
        const hanging = kind === "tee" || kind === "sweatshirt" || kind === "hoodie";
        if (hanging) t.body.add(makeHanger());
        t.body.position.y = hanging ? -0.06 : 0;
        t.kind = kind;
        t.photo = photos;
      }
      const opts = { color, white, dark, ink, font, bold };
      const [fc, bc] = await Promise.all([paintFace(faces.front, opts), paintFace(faces.back, opts, faces.front.photo)]);
      if (cancelled || !t.front || !t.back) return;
      for (const [mesh, canvas] of [[t.front, fc], [t.back, bc]] as const) {
        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = t.renderer.capabilities.getMaxAnisotropy();
        const m = mesh.material as THREE.MeshStandardMaterial;
        m.map?.dispose();
        m.map = tex;
        m.needsUpdate = true;
      }
    })().catch(() => {});
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, sig]);

  return <div ref={host} className="absolute inset-0" />;
}
