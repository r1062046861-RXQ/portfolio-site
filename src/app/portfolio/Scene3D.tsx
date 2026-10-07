"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { heroWorks } from "./works";

type SceneProps = {
  paused: boolean;
  artworkIndex: number;
  form: "flow" | "image";
  onReady: () => void;
  onFailure: () => void;
};

const FIELD = {
  seed: 7031,
  desktop: { columns: 256, rows: 168, pixelRatio: 1.6 },
  mobile: { columns: 144, rows: 96, pixelRatio: 1.15 },
  cameraDistance: 11,
  pointerRadius: 0.85,
};

// One UV field owns the fragments, their normals, and the contour threads.
const surfaceShader = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uTime;
  uniform float uForm;
  uniform vec2 uImageSize;
  uniform vec3 uPointer;
  uniform float uPointerRadius;
  const float PI = 3.14159265359;

  vec3 surface(vec2 st) {
    float phase = uTime * 0.38;
    float span = st.x * 2.0 - 1.0;
    float band = (st.y - 0.5) * uImageSize.y;
    float brightness = dot(texture2D(uMap, st).rgb, vec3(0.2126, 0.7152, 0.0722));
    float twist = span * 0.78 + sin(phase * 0.65) * 0.14;
    vec3 current = vec3(
      span * uImageSize.x * 0.5 + 0.16 * sin(band * 1.4 + phase),
      band * cos(twist) + 0.40 * sin(span * 3.0 - phase),
      band * sin(twist) + 0.72 * sin(span * 3.2 + phase)
    );
    current.z += 0.32 * cos(band * 1.7 - phase) + brightness * 0.55;
    vec3 image = vec3((st - 0.5) * uImageSize, brightness * 0.40);
    image.z += sin(st.x * 6.0 + phase) * 0.08;
    vec3 p = mix(image, current, uForm);

    vec2 away = p.xy - uPointer.xy;
    float influence = exp(-dot(away, away) / (uPointerRadius * uPointerRadius));
    influence *= uPointer.z;
    p.xy += normalize(away + vec2(0.001)) * influence * 0.25;
    p.z += influence * 0.75;
    return p;
  }
`;

const fragmentVertex = /* glsl */ `
  ${surfaceShader}
  attribute vec2 aCell;
  attribute float aSeed;
  uniform vec2 uCellSize;
  varying vec2 vUv;
  varying vec2 vCell;
  varying vec3 vNormal;
  varying vec3 vView;
  varying float vSeed;
  void main() {
    vec3 p = surface(aCell);
    vec3 alongU = surface(aCell + vec2(0.002, 0.0)) - p;
    vec3 alongV = surface(aCell + vec2(0.0, 0.002)) - p;
    vec3 n = normalize(cross(alongU, alongV));
    float breathing = mix(0.99, 0.95 + 0.03 * sin(aCell.x * 18.0 - uTime * 0.45), uForm);
    p += alongU * position.x * uCellSize.x / 0.002 * breathing;
    p += alongV * position.y * uCellSize.y / 0.002 * breathing;
    p += n * (aSeed - 0.5) * 0.055 * uForm;
    vec4 viewPosition = modelViewMatrix * vec4(p, 1.0);
    vNormal = normalize(normalMatrix * n);
    vView = viewPosition.xyz;
    vUv = uv;
    vCell = aCell;
    vSeed = aSeed;
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const fragmentColor = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uForm;
  uniform int uDebug;
  varying vec2 vUv;
  varying vec2 vCell;
  varying vec3 vNormal;
  varying vec3 vView;
  varying float vSeed;
  void main() {
    vec2 edge = abs(vUv - 0.5);
    float footprint = max(fwidth(edge.x), fwidth(edge.y));
    float alpha = 1.0 - smoothstep(0.47, 0.5 + footprint, max(edge.x, edge.y));
    if (alpha < 0.02) discard;

    vec3 photo = texture2D(uMap, vCell).rgb;
    vec3 n = normalize(vNormal);
    vec3 view = normalize(-vView);
    vec3 reflected = reflect(-view, n);
    float facing = abs(dot(n, view));
    float softbox = pow(max(0.0, dot(reflected, normalize(vec3(-0.5, 0.8, 1.2)))), 18.0);
    float strip = pow(max(0.0, 1.0 - abs(reflected.x * 0.7 + reflected.y * 0.5)), 28.0);
    float light = 0.70 + 0.30 * abs(dot(n, normalize(vec3(-0.4, 0.9, 0.7))));
    vec3 silver = vec3(0.64, 0.72, 0.74) * (softbox * 0.16 + strip * 0.045);
    vec3 spectral = 0.5 + 0.5 * cos(vec3(0.0, 2.1, 4.2) + facing * 6.5 + vCell.x * 2.0);
    vec3 color = mix(photo, photo * light + silver, uForm);
    vec3 accent = mix(vec3(0.10, 0.45, 0.40), vec3(0.62, 0.16, 0.10), smoothstep(0.35, 0.86, vCell.x));
    color += spectral * pow(1.0 - facing, 2.0) * 0.16 * uForm;
    color += accent * pow(1.0 - facing, 3.0) * 0.13 * uForm;
    color *= 0.96 + vSeed * 0.08;

    if (uDebug == 1) color = n * 0.5 + 0.5;
    if (uDebug == 2) color = vec3(dot(photo, vec3(0.2126, 0.7152, 0.0722)));
    if (uDebug == 3) color = vec3(vCell, 0.3);
    gl_FragColor = vec4(color, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export default function Scene3D({ paused, artworkIndex, form, onReady, onFailure }: SceneProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ paused, artworkIndex, form });
  useEffect(() => {
    stateRef.current = { paused, artworkIndex, form };
  }, [paused, artworkIndex, form]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const params = new URLSearchParams(window.location.search);
    const fixedTime = params.has("hero-time") ? Number(params.get("hero-time")) : null;
    const debug = ({ normals: 1, luminance: 2, uv: 3 } as Record<string, number>)[params.get("hero-debug") ?? ""] ?? 0;
    const mobile = window.innerWidth < 700;
    const quality = mobile ? FIELD.mobile : FIELD.desktop;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: mobile ? "low-power" : "high-performance",
        preserveDrawingBuffer: params.has("hero-capture"),
      });
    } catch {
      onFailure();
      return;
    }
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.22;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.setAttribute("aria-hidden", "true");
    host.appendChild(renderer.domElement);
    let shaderFailed = false;
    renderer.debug.onShaderError = () => {
      shaderFailed = true;
      onFailure();
    };

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 40);
    camera.position.z = FIELD.cameraDistance;
    const sculpture = new THREE.Group();
    scene.add(sculpture);
    const textures: THREE.Texture<HTMLImageElement>[] = [];
    const emptyTexture = new THREE.DataTexture(new Uint8Array([120, 170, 180, 255]), 1, 1);
    emptyTexture.needsUpdate = true;
    const uniforms = {
      uMap: { value: emptyTexture as THREE.Texture },
      uTime: { value: 0 },
      uForm: { value: 1 },
      uImageSize: { value: new THREE.Vector2(5.6, 4.2) },
      uCellSize: { value: new THREE.Vector2(1 / quality.columns, 1 / quality.rows) },
      uPointer: { value: new THREE.Vector3(0, 0, 0) },
      uPointerRadius: { value: FIELD.pointerRadius },
      uDebug: { value: debug },
    };

    let seed = FIELD.seed;
    const cells = new Float32Array(quality.columns * quality.rows * 2);
    const seeds = new Float32Array(quality.columns * quality.rows);
    for (let row = 0; row < quality.rows; row += 1) {
      for (let column = 0; column < quality.columns; column += 1) {
        const index = row * quality.columns + column;
        seed = (seed * 1664525 + 1013904223) >>> 0;
        const random = seed / 4294967296;
        cells[index * 2] = (column + 0.5 + (random - 0.5) * 0.18) / quality.columns;
        cells[index * 2 + 1] = (row + 0.5) / quality.rows;
        seeds[index] = random;
      }
    }
    const quad = new THREE.PlaneGeometry(1, 1);
    const fragments = new THREE.InstancedBufferGeometry();
    fragments.index = quad.index;
    fragments.attributes.position = quad.attributes.position;
    fragments.attributes.uv = quad.attributes.uv;
    fragments.setAttribute("aCell", new THREE.InstancedBufferAttribute(cells, 2));
    fragments.setAttribute("aSeed", new THREE.InstancedBufferAttribute(seeds, 1));
    fragments.instanceCount = seeds.length;
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: fragmentVertex,
      fragmentShader: fragmentColor,
      side: THREE.DoubleSide,
      transparent: true,
      depthWrite: true,
    });
    const fragmentMesh = new THREE.Mesh(fragments, material);
    fragmentMesh.frustumCulled = false;
    sculpture.add(fragmentMesh);

    const contourPositions: number[] = [];
    const contourUvs: number[] = [];
    const contourColors: number[] = [];
    for (let row = 0; row <= 8; row += 1) {
      const tint = new THREE.Color(row === 1 ? 0xb54a37 : row === 7 ? 0x277e88 : 0x9aa7aa);
      for (let column = 0; column < 240; column += 1) {
        for (const x of [column / 240, (column + 1) / 240]) {
          contourPositions.push(0, 0, 0);
          contourUvs.push(x, row / 8);
          contourColors.push(tint.r, tint.g, tint.b);
        }
      }
    }
    const contourGeometry = new THREE.BufferGeometry();
    contourGeometry.setAttribute("position", new THREE.Float32BufferAttribute(contourPositions, 3));
    contourGeometry.setAttribute("uv", new THREE.Float32BufferAttribute(contourUvs, 2));
    contourGeometry.setAttribute("color", new THREE.Float32BufferAttribute(contourColors, 3));
    const contourMaterial = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: `${surfaceShader}
        varying vec3 vColor;
        void main() {
          vColor = color;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(surface(uv), 1.0);
        }`,
      fragmentShader: `uniform float uForm; varying vec3 vColor;
        void main() {
          gl_FragColor = vec4(vColor, 0.22 * uForm);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });
    const contours = new THREE.LineSegments(contourGeometry, contourMaterial);
    contours.frustumCulled = false;
    sculpture.add(contours);

    let disposed = false;
    let inView = true;
    let ready = false;
    let firstFrame = true;
    let frame = 0;
    let previousTime = 0;
    let elapsed = 0;
    let selectedArtwork = -1;
    const pointerTarget = new THREE.Vector3();
    const pointerNdc = new THREE.Vector2();
    const pointerLocal = new THREE.Vector3();
    const ray = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, quality.pixelRatio));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      const viewHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
      const viewWidth = viewHeight * camera.aspect;
      const compact = window.innerWidth < 700;
      const scale = Math.min(viewHeight * 0.76 / 5.3, viewWidth * (compact ? 0.93 : 0.49) / 6.8);
      sculpture.scale.setScalar(scale);
      sculpture.position.set(compact ? 0 : viewWidth * 0.185, viewHeight * 0.035, 0);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const rect = host.getBoundingClientRect();
      pointerNdc.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
      ray.setFromCamera(pointerNdc, camera);
      if (ray.ray.intersectPlane(plane, pointerLocal)) {
        sculpture.worldToLocal(pointerLocal);
        pointerTarget.set(pointerLocal.x, pointerLocal.y, 1);
      }
    };
    const onPointerLeave = () => { pointerTarget.z = 0; };
    const onVisibility = () => { previousTime = 0; };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      previousTime = 0;
    }, { rootMargin: "-110px 0px 0px 0px", threshold: 0.01 });
    observer.observe(host);
    const onContextLost = (event: Event) => { event.preventDefault(); onFailure(); };
    host.addEventListener("pointermove", onPointerMove, { passive: true });
    host.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    renderer.domElement.addEventListener("webglcontextlost", onContextLost);
    resize();

    const render = (now: number) => {
      frame = requestAnimationFrame(render);
      if (disposed || shaderFailed || !ready || !inView || document.visibilityState !== "visible") { previousTime = 0; return; }
      const delta = previousTime ? Math.min((now - previousTime) / 1000, 0.05) : 0;
      previousTime = now;
      const state = stateRef.current;
      if (state.paused) { previousTime = 0; return; }
      const changedArtwork = selectedArtwork !== state.artworkIndex;
      if (changedArtwork) {
        selectedArtwork = state.artworkIndex;
        const texture = textures[selectedArtwork];
        uniforms.uMap.value = texture;
        const aspect = texture.image.width / texture.image.height;
        uniforms.uImageSize.value.set(aspect > 1.22 ? 5.6 : 4.6 * aspect, aspect > 1.22 ? 5.6 / aspect : 4.6);
      }
      const desiredForm = state.form === "flow" ? 1 : 0;
      elapsed += delta;
      uniforms.uTime.value = fixedTime !== null && Number.isFinite(fixedTime) ? fixedTime : elapsed;
      uniforms.uForm.value = fixedTime !== null ? desiredForm : THREE.MathUtils.damp(uniforms.uForm.value, desiredForm, 3.8, delta || 0.016);
      uniforms.uPointer.value.lerp(pointerTarget, 1 - Math.exp(-delta * 7));
      const seconds = uniforms.uTime.value;
      const tilt = uniforms.uForm.value;
      sculpture.rotation.set((0.20 + Math.sin(seconds * 0.17) * 0.10) * tilt, (-0.30 + Math.sin(seconds * 0.12) * 0.12) * tilt, (-0.16 + Math.sin(seconds * 0.09) * 0.05) * tilt);
      renderer.render(scene, camera);
      if (firstFrame && !shaderFailed) {
        firstFrame = false;
        onReady();
      }
      host.dataset.frame = String(Number(host.dataset.frame ?? 0) + 1);
      host.dataset.elapsed = uniforms.uTime.value.toFixed(3);
      host.dataset.form = uniforms.uForm.value.toFixed(3);
      host.dataset.drawCalls = String(renderer.info.render.calls);
    };

    const loader = new THREE.TextureLoader();
    const loads = heroWorks.map((work) => new Promise<THREE.Texture<HTMLImageElement>>((resolve, reject) => {
      loader.load(work.image!, (texture) => {
        if (disposed) { texture.dispose(); resolve(texture); return; }
        textures.push(texture);
        resolve(texture);
      }, undefined, reject);
    }));
    Promise.all(loads).then((loaded) => {
      if (disposed) return;
      textures.splice(0, textures.length, ...loaded);
      textures.forEach((texture) => { texture.colorSpace = THREE.SRGBColorSpace; });
      ready = true;
      render(performance.now());
    }).catch(() => { if (!disposed) onFailure(); });

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      host.removeEventListener("pointermove", onPointerMove);
      host.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
      textures.forEach((texture) => texture.dispose());
      emptyTexture.dispose();
      quad.dispose();
      fragments.dispose();
      contourGeometry.dispose();
      material.dispose();
      contourMaterial.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [onFailure, onReady]);

  return <div ref={hostRef} className="studio-scene" data-hero-seed={FIELD.seed} data-hero-design="image-current" aria-hidden="true" />;
}
