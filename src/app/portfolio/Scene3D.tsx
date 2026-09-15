"use client";

import { useEffect, useRef } from "react";
import type { MutableRefObject } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import type { Work } from "./works";

export type PortfolioMode = "journey" | "detail";

/** 滚动状态：p = 全程进度 0..1（已平滑），v = 滚动速度（屏/秒，带方向） */
export type ScrollState = { p: number; v: number };

/* ---------------- VHS 故障 / RGB 色散后处理 ---------------- */
const GlitchShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    uTime: { value: 0 },
    uAmount: { value: 0.035 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uAmount;
    varying vec2 vUv;

    float rand(vec2 co) {
      return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec2 uv = vUv;
      float a = uAmount;

      // 横向切片撕裂（转场与快速滚动时明显）
      float slice = floor(uv.y * 24.0);
      float seed = rand(vec2(slice, floor(uTime * 24.0)));
      if (seed > 1.0 - a * 0.55) {
        uv.x += (rand(vec2(slice, uTime)) - 0.5) * 0.18 * a;
      }

      // RGB 色散（常开一点点，转场时加剧）
      float shift = 0.0009 + 0.016 * a;
      float r = texture2D(tDiffuse, uv + vec2(shift, 0.0)).r;
      float g = texture2D(tDiffuse, uv).g;
      float b = texture2D(tDiffuse, uv - vec2(shift, 0.0)).b;
      vec3 col = vec3(r, g, b);

      // 噪点
      col += (rand(uv * (uTime + 1.0)) - 0.5) * 0.1 * a;

      // 常开胶片颗粒 + 暗角
      col += (rand(uv * (uTime + 7.0)) - 0.5) * 0.02;
      float vig = distance(vUv, vec2(0.5, 0.5));
      col *= 1.0 - smoothstep(0.52, 0.98, vig) * 0.5;

      gl_FragColor = vec4(col, 1.0);
    }
  `,
};

/* ---------------- Canvas 贴图生成 ---------------- */
function createCanvas(w: number, h: number) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  return { canvas, ctx };
}

/** CD 盘面贴图：金色碟面 + 彩虹光泽 + 手写标签 */
function makeDiscTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = createCanvas(512, 512);
  const gold = ctx.createRadialGradient(256, 256, 40, 256, 256, 250);
  gold.addColorStop(0, "#f7e7b0");
  gold.addColorStop(0.55, "#e8c979");
  gold.addColorStop(1, "#b98a3e");
  ctx.fillStyle = gold;
  ctx.beginPath();
  ctx.arc(256, 256, 248, 0, Math.PI * 2);
  ctx.fill();

  // 细密数据纹
  for (let r = 128; r < 244; r += 3) {
    ctx.strokeStyle = "rgba(120, 84, 30, 0.07)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(256, 256, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.globalAlpha = 0.32;
  for (let i = 0; i < 6; i++) {
    ctx.strokeStyle = `hsl(${i * 60}, 90%, 65%)`;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(256, 256, 150 + i * 14, i, i + 2.2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  ctx.fillStyle = "#f5efdd";
  ctx.beginPath();
  ctx.arc(256, 256, 118, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#d8cdb4";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(256, 256, 118, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "#26221a";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 62px 'Microsoft YaHei', 'PingFang SC', sans-serif";
  ctx.fillText("任玄奇", 256, 222);
  ctx.font = "bold 27px monospace";
  ctx.fillText("RXQ · MIXTAPE", 256, 284);
  ctx.font = "20px monospace";
  ctx.fillText("SIDE A · 2026", 256, 324);

  // 中心孔 + 金属轴圈
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(256, 256, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";
  ctx.strokeStyle = "rgba(70, 58, 34, 0.65)";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(256, 256, 36, 0, Math.PI * 2);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** 黑胶贴图：碟纹 + 当前作品标签（有代表图时以图入签）；可重绘复用 */
function drawVinylLabel(ctx: CanvasRenderingContext2D, work: Work, img?: HTMLImageElement) {
  ctx.clearRect(0, 0, 512, 512);
  ctx.fillStyle = "#0a0a0a";
  ctx.beginPath();
  ctx.arc(256, 256, 250, 0, Math.PI * 2);
  ctx.fill();

  for (let r = 118; r < 244; r += 5) {
    ctx.strokeStyle = "rgba(255,255,255,0.16)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(256, 256, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // 斜向高光带，模拟黑胶油亮反光（一主一辅两道弧）
  const sheen = ctx.createLinearGradient(0, 0, 512, 512);
  sheen.addColorStop(0.42, "rgba(255,255,255,0)");
  sheen.addColorStop(0.5, "rgba(255,255,255,0.22)");
  sheen.addColorStop(0.58, "rgba(255,255,255,0)");
  ctx.fillStyle = sheen;
  ctx.beginPath();
  ctx.arc(256, 256, 250, 0, Math.PI * 2);
  ctx.fill();
  const sheen2 = ctx.createLinearGradient(512, 0, 0, 512);
  sheen2.addColorStop(0.62, "rgba(255,255,255,0)");
  sheen2.addColorStop(0.7, "rgba(255,255,255,0.08)");
  sheen2.addColorStop(0.78, "rgba(255,255,255,0)");
  ctx.fillStyle = sheen2;
  ctx.beginPath();
  ctx.arc(256, 256, 250, 0, Math.PI * 2);
  ctx.fill();

  // 外缘亮圈，让碟形在黑场中立起来
  ctx.strokeStyle = "rgba(255,255,255,0.28)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(256, 256, 246, 0, Math.PI * 2);
  ctx.stroke();

  // 标签芯：优先用作品代表图（圆形裁切 + 底部压暗），否则用色相兜底
  ctx.save();
  ctx.beginPath();
  ctx.arc(256, 256, 108, 0, Math.PI * 2);
  ctx.clip();
  if (img && img.naturalWidth > 0) {
    const s = Math.max(216 / img.naturalWidth, 216 / img.naturalHeight);
    const dw = img.naturalWidth * s;
    const dh = img.naturalHeight * s;
    ctx.drawImage(img, 256 - dw / 2, 256 - dh / 2, dw, dh);
    // 底部压暗，保证文字可读
    const shade = ctx.createLinearGradient(0, 190, 0, 364);
    shade.addColorStop(0, "rgba(0,0,0,0)");
    shade.addColorStop(1, "rgba(0,0,0,0.55)");
    ctx.fillStyle = shade;
    ctx.fillRect(148, 148, 216, 216);
  } else {
    ctx.fillStyle = `hsl(${work.hue}, 58%, 46%)`;
    ctx.fillRect(148, 148, 216, 216);
  }
  ctx.restore();
  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(256, 256, 108, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.shadowColor = "rgba(0,0,0,0.8)";
  ctx.shadowBlur = 8;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 34px 'Microsoft YaHei', 'PingFang SC', sans-serif";
  ctx.fillText(work.title, 256, 238, 200);
  ctx.font = "20px monospace";
  ctx.fillText(`${work.year} · ${work.id.toUpperCase()}`, 256, 292, 200);
  ctx.shadowBlur = 0;

  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(256, 256, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";
}

function makeVinylTexture(work: Work) {
  const { canvas, ctx } = createCanvas(512, 512);
  drawVinylLabel(ctx, work);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return { tex, canvas, ctx };
}

/** 盒背托盘贴图：SIDE A 曲目表 */
function makeTrayTexture(works: Work[]): THREE.CanvasTexture {
  const { canvas, ctx } = createCanvas(512, 576);
  ctx.fillStyle = "#0c0c0e";
  ctx.fillRect(0, 0, 512, 576);
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = "bold 28px monospace";
  ctx.textAlign = "left";
  ctx.fillText("SIDE A", 48, 54);
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.fillRect(48, 72, 416, 2);
  // 17 首曲目：行距 26.5px，起始 y=100，长标题限宽压缩
  works.forEach((w, i) => {
    const y = 100 + i * 26.5;
    ctx.fillStyle = `hsl(${w.hue}, 58%, 55%)`;
    ctx.font = "bold 15px monospace";
    ctx.fillText(String(i + 1).padStart(2, "0"), 48, y);
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.font = "15px 'Microsoft YaHei', 'PingFang SC', sans-serif";
    ctx.fillText(w.title, 96, y, 300);
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.font = "13px monospace";
    ctx.textAlign = "right";
    ctx.fillText(w.year, 464, y, 70);
    ctx.textAlign = "left";
  });
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.font = "14px monospace";
  ctx.fillText("RXQ STUDIO · LIQUID PIXEL", 48, 560);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** 价格标签贴纸 */
function makePriceTagTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = createCanvas(256, 128);
  ctx.fillStyle = "#d9f24f";
  ctx.fillRect(0, 0, 256, 128);
  ctx.fillStyle = "#1a1a1a";
  ctx.font = "bold 26px monospace";
  ctx.textAlign = "left";
  ctx.fillText("08/99", 20, 40);
  ctx.font = "bold 30px 'Microsoft YaHei', sans-serif";
  ctx.fillText("任玄奇", 20, 82);
  ctx.font = "bold 24px monospace";
  ctx.fillText("RXQ-001", 20, 112);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ---------------- 关键帧插值：滚动进度 → 场景布局 ---------------- */
const lerpNum = (a: number, b: number, t: number) => a + (b - a) * t;

/** 分段线性关键帧：stops 为 [进度, 值][]，p 之外取端点 */
function kf(stops: ReadonlyArray<readonly [number, number]>, p: number) {
  if (p <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) {
    if (p <= stops[i][0]) {
      const t = (p - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0]);
      return lerpNum(stops[i - 1][1], stops[i][1], t);
    }
  }
  return stops[stops.length - 1][1];
}

/* ---------------- 场景组件 ---------------- */
type Props = {
  mode: PortfolioMode;
  activeWork: number;
  glitchKey: number;
  works: Work[];
  scrollRef: MutableRefObject<ScrollState>;
};

export default function Scene3D({ mode, activeWork, glitchKey, works, scrollRef }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef(mode);
  const vinylDirtyRef = useRef(false);
  const glitchSpikeRef = useRef(1); // 入场即一次故障
  const worksRef = useRef(works);
  const activeWorkRef = useRef(activeWork);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);
  useEffect(() => {
    activeWorkRef.current = activeWork;
    vinylDirtyRef.current = true;
  }, [activeWork]);
  useEffect(() => {
    glitchSpikeRef.current = 1;
  }, [glitchKey]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      38,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0.1, 7.4);

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.5;

    // 摄影棚式三点布光 + 工作室紫绿双色轮廓光（柔和取向，避免刺眼光斑）
    const keyLight = new THREE.DirectionalLight(0xffffff, 0.5);
    keyLight.position.set(2.5, 3, 5.5);
    scene.add(keyLight);
    const rimIndigo = new THREE.PointLight(0x6366f1, 22, 25, 2);
    rimIndigo.position.set(-5.5, 2.5, -2.5);
    scene.add(rimIndigo);
    const rimEmerald = new THREE.PointLight(0x10b981, 18, 25, 2);
    rimEmerald.position.set(5.5, -1.5, -2);
    scene.add(rimEmerald);
    const frontFill = new THREE.PointLight(0xc4b5fd, 6, 20, 2);
    frontFill.position.set(-2.5, -1, 4);
    scene.add(frontFill);
    // 黑胶补光：擦出碟面高光弧，而非整体打亮
    const vinylLight = new THREE.PointLight(0xfff5e0, 5, 12, 2);
    vinylLight.position.set(1.6, 2.4, 2.6);
    scene.add(vinylLight);

    // 双层漂浮微尘：远层细密、近层稀疏，滚动时近层窜动形成纵深视差
    const makeDust = (count: number, size: number, spread: [number, number, number], zBase: number, color: number, opacity: number) => {
      const pos = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        pos[i * 3] = (Math.random() - 0.5) * spread[0];
        pos[i * 3 + 1] = (Math.random() - 0.5) * spread[1];
        pos[i * 3 + 2] = (Math.random() - 0.5) * spread[2] + zBase;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      const c = createCanvas(64, 64);
      const grad = c.ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, "rgba(255,255,255,0.9)");
      grad.addColorStop(0.4, "rgba(255,255,255,0.25)");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      c.ctx.fillStyle = grad;
      c.ctx.fillRect(0, 0, 64, 64);
      const tex = new THREE.CanvasTexture(c.canvas);
      const points = new THREE.Points(
        geo,
        new THREE.PointsMaterial({
          size,
          map: tex,
          transparent: true,
          opacity,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          color,
        })
      );
      scene.add(points);
      return points;
    };
    const dustFar = makeDust(240, 0.06, [16, 8, 6], -1, 0x9fb3ff, 0.5);
    const dustNear = makeDust(90, 0.1, [12, 7, 3], 2.2, 0xc7d2fe, 0.32);

    const maxAniso = renderer.capabilities.getMaxAnisotropy();

    // 预加载全部作品代表图：每张加载完成后置脏，黑胶标签重绘时贴入
    const imgCache = new Map<string, HTMLImageElement>();
    worksRef.current.forEach((w) => {
      const im = new Image();
      im.src = w.image;
      im.onload = () => {
        imgCache.set(w.id, im);
        vinylDirtyRef.current = true;
      };
    });

    /* ----- CD 盒 ----- */
    const caseGroup = new THREE.Group();
    const shell = new THREE.Mesh(
      new THREE.BoxGeometry(3.4, 3.8, 0.3),
      // 透射塑料：真实折射 + 表面反射，呈现 CD 盒的有机玻璃质感
      new THREE.MeshPhysicalMaterial({
        transmission: 1,
        thickness: 0.35,
        roughness: 0.08,
        ior: 1.5,
        clearcoat: 0.22,
        clearcoatRoughness: 0.35,
        attenuationColor: new THREE.Color(0xdde6ff),
        attenuationDistance: 2.5,
        envMapIntensity: 1.0,
      })
    );
    caseGroup.add(shell);
    // 盒体轮廓线，勾勒透明塑料边缘
    const shellEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(shell.geometry),
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.22 })
    );
    caseGroup.add(shellEdges);

    const trayTex = makeTrayTexture(worksRef.current);
    trayTex.anisotropy = maxAniso;
    const trayDark = new THREE.MeshStandardMaterial({ color: 0x0c0c0e, roughness: 0.85 });
    // 曲目表轻微自发光，盒背在暗光下仍可读
    const trayBack = new THREE.MeshStandardMaterial({
      map: trayTex,
      roughness: 0.7,
      emissive: 0xffffff,
      emissiveMap: trayTex,
      emissiveIntensity: 0.3,
    });
    const tray = new THREE.Mesh(
      new THREE.BoxGeometry(3.05, 3.45, 0.14),
      [trayDark, trayDark, trayDark, trayDark, trayDark, trayBack]
    );
    tray.position.z = -0.06;
    caseGroup.add(tray);

    const discTex = makeDiscTexture();
    discTex.anisotropy = maxAniso;
    // CD 碟体（金色边缘）+ 正面贴图圆片（平面 UV，文字不镜像）
    const discBodyGeo = new THREE.CylinderGeometry(1.45, 1.45, 0.05, 72);
    discBodyGeo.rotateX(Math.PI / 2);
    const discBody = new THREE.Mesh(
      discBodyGeo,
      new THREE.MeshPhysicalMaterial({
        color: 0xd9b96a,
        roughness: 0.36,
        metalness: 0.7,
        envMapIntensity: 0.55,
      })
    );
    discBody.position.z = 0.045;
    caseGroup.add(discBody);
    const discFace = new THREE.Mesh(
      new THREE.CircleGeometry(1.45, 72),
      // 不透明 + alphaTest：在实体渲染通道绘制，避免被透明外壳的深度写入遮挡；
      // 略降亮度避免金色盘面过曝刺眼
      new THREE.MeshBasicMaterial({
        map: discTex,
        alphaTest: 0.5,
        color: 0xded8ca,
      })
    );
    discFace.position.z = 0.045 + 0.027;
    caseGroup.add(discFace);

    const tagTex = makePriceTagTexture();
    tagTex.anisotropy = maxAniso;
    const priceTag = new THREE.Mesh(
      new THREE.PlaneGeometry(0.95, 0.48),
      new THREE.MeshStandardMaterial({
        map: tagTex,
        roughness: 0.9,
        transparent: true,
      })
    );
    priceTag.position.set(0.98, -1.32, 0.17);
    priceTag.rotation.z = -0.16;
    caseGroup.add(priceTag);
    caseGroup.scale.setScalar(0.88);
    scene.add(caseGroup);

    /* ----- 黑胶唱片 ----- */
    const vinylGroup = new THREE.Group();
    const vinyl = makeVinylTexture(worksRef.current[activeWorkRef.current]);
    vinyl.tex.anisotropy = maxAniso;
    const vinylBodyGeo = new THREE.CylinderGeometry(1.62, 1.62, 0.05, 72);
    vinylBodyGeo.rotateX(Math.PI / 2);
    const vinylBody = new THREE.Mesh(
      vinylBodyGeo,
      new THREE.MeshPhysicalMaterial({
        color: 0x0a0a0c,
        roughness: 0.5,
        metalness: 0.1,
        clearcoat: 0.3,
        clearcoatRoughness: 0.3,
        envMapIntensity: 0.15,
      })
    );
    vinylGroup.add(vinylBody);
    // 正面贴图圆片（平面 UV，标签文字不镜像）；无光照模型 + alphaTest：
    // 碟面完全按贴图呈现（墨黑 + 手绘高光带），不会被灯光广谱高光洗白
    const vinylFace = new THREE.Mesh(
      new THREE.CircleGeometry(1.62, 72),
      new THREE.MeshBasicMaterial({
        map: vinyl.tex,
        alphaTest: 0.5,
      })
    );
    vinylFace.position.z = 0.027;
    vinylGroup.add(vinylFace);
    scene.add(vinylGroup);

    /* ----- 后处理 ----- */
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(mount.clientWidth, mount.clientHeight),
      0.16,
      0.45,
      0.92
    );
    composer.addPass(bloomPass);
    const glitchPass = new ShaderPass(GlitchShader);
    composer.addPass(glitchPass);
    composer.addPass(new OutputPass());

    /* ----- 滚动旅程关键帧（Shopify Editions 式：滚动进度驱动布局） -----
       站点结构：S0 菜单 · S1..SW 作品章节 · S(W+1) 关于 */
    const W = worksRef.current.length;
    const s1 = 1 / (W + 1); // 第一屏作品章节的进度位置
    const s6 = W / (W + 1); // 最后一屏作品章节的进度位置

    // CD 盒：菜单主角 → 章节时推出画面左侧深处当远景层 → 关于屏回到台前展示盒背
    const caseX: ReadonlyArray<readonly [number, number]> = [[0, 0.9], [s1, -6.4], [s6, -4.6], [1, 1.5]];
    const caseY: ReadonlyArray<readonly [number, number]> = [[0, 0], [s1, 0.6], [s6, -0.4], [1, 0]];
    const caseZ: ReadonlyArray<readonly [number, number]> = [[0, 0], [s1, -4.2], [s6, -3.4], [1, 0]];
    const caseRot: ReadonlyArray<readonly [number, number]> = [[0, -0.18], [s1, 0.5], [s6, -0.9], [1, Math.PI + 0.12]];

    // 黑胶：菜单屏藏在右侧 → 章节屏滑入成为主角 → 关于屏从左侧离场
    const vinX: ReadonlyArray<readonly [number, number]> = [[0, 7.5], [s1, 1.15], [s6, 1.35], [1, -6.8]];
    const vinY: ReadonlyArray<readonly [number, number]> = [[0, -0.2], [s1, -0.05], [s6, 0], [1, 0.4]];
    const vinZ: ReadonlyArray<readonly [number, number]> = [[0, -1], [s1, 0], [s6, 0], [1, -2]];

    // 相机：章节中段轻轻推近，结尾再拉回来
    const camZ: ReadonlyArray<readonly [number, number]> = [[0, 7.4], [s1 * 0.5, 6.8], [s6, 6.6], [1, 7.0]];
    const camY: ReadonlyArray<readonly [number, number]> = [[0, 0.1], [0.5, 0.28], [1, 0]];

    const caseBase = new THREE.Vector3(kf(caseX, 0), kf(caseY, 0), kf(caseZ, 0));
    const vinylBase = new THREE.Vector3(kf(vinX, 0), kf(vinY, 0), kf(vinZ, 0));
    caseGroup.position.copy(caseBase);
    vinylGroup.position.copy(vinylBase);
    caseGroup.rotation.y = kf(caseRot, 0);
    const caseTarget = new THREE.Vector3();
    const vinylTarget = new THREE.Vector3();

    /* ----- 鼠标视差 ----- */
    const pointer = { x: 0, y: 0 };
    const onPointer = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointer);

    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    /* ----- 动画循环 ----- */
    const clock = new THREE.Clock();
    let raf = 0;
    let glitchAmount = 0.035;
    let detailT = 0; // 档案模式混合权重
    const punch = new THREE.Vector3();

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;
      const k = 1 - Math.exp(-dt * 3.2);

      // 滚动进度与速度（由外层 rAF 平滑后写入）
      const p = scrollRef.current.p;
      const v = scrollRef.current.v;
      const sv = Math.min(Math.abs(v), 4);

      // 档案模式：叠加混合到盒背特写
      detailT += ((modeRef.current === "detail" ? 1 : 0) - detailT) * (1 - Math.exp(-dt * 4));

      const jr = kf(caseRot, p);
      caseTarget.set(
        lerpNum(kf(caseX, p), 1.5, detailT),
        lerpNum(kf(caseY, p), 0, detailT),
        lerpNum(kf(caseZ, p), 0, detailT)
      );
      vinylTarget.set(
        lerpNum(kf(vinX, p), 7.5, detailT),
        lerpNum(kf(vinY, p), -0.2, detailT),
        lerpNum(kf(vinZ, p), -1, detailT)
      );
      const caseRotTarget = lerpNum(jr, Math.PI + 0.12, detailT);

      caseBase.lerp(caseTarget, k);
      vinylBase.lerp(vinylTarget, k);
      caseGroup.position.set(
        caseBase.x,
        caseBase.y + Math.sin(t * 0.9) * 0.06,
        caseBase.z
      );
      vinylGroup.position.copy(vinylBase);
      caseGroup.rotation.y += (caseRotTarget - caseGroup.rotation.y) * k;
      // 滚动惯性侧倾：快速滚动时盒体顺着滚动方向压一下
      caseGroup.rotation.z +=
        (Math.max(-0.08, Math.min(0.08, v * 0.05)) - caseGroup.rotation.z) * k;

      // 鼠标视差（菜单屏最明显，进入章节后收敛）
      const parallax = Math.max(0, 1 - p / (s1 * 0.7));
      caseGroup.rotation.x += (pointer.y * 0.1 * parallax - caseGroup.rotation.x) * k;
      vinylGroup.rotation.y = Math.sin(t * 0.5) * 0.08;

      // 盘面转速随滚动速度加快（惯性手感）
      discFace.rotation.z -= dt * (0.45 + sv * 1.2);
      vinylFace.rotation.z -= dt * (0.5 + sv * 2.2);

      // 双层微尘差速漂移；近层随滚动反向窜动
      dustFar.rotation.z = t * 0.008;
      dustFar.rotation.y = t * 0.012;
      dustNear.rotation.z = -t * 0.014;
      dustNear.rotation.y = t * 0.02;
      dustNear.position.y += (v * 0.9 - dustNear.position.y) * k;

      // 切换作品时重绘黑胶标签（代表图已加载则贴入标签芯）
      if (vinylDirtyRef.current) {
        vinylDirtyRef.current = false;
        const w = worksRef.current[activeWorkRef.current];
        drawVinylLabel(vinyl.ctx, w, imgCache.get(w.id));
        vinyl.tex.needsUpdate = true;
      }

      // 故障强度：换屏尖峰后衰减回底噪；快速滚动时追加速度噪声
      if (glitchSpikeRef.current > 0) {
        glitchAmount = 0.6;
        glitchSpikeRef.current = 0;
        punch.set((Math.random() - 0.5) * 0.25, (Math.random() - 0.5) * 0.2, 0);
      }
      glitchAmount += (0.035 - glitchAmount) * (1 - Math.exp(-dt * 2.2));
      glitchPass.uniforms.uAmount.value = Math.min(
        glitchAmount + Math.min(sv * 0.1, 0.28),
        0.9
      );
      glitchPass.uniforms.uTime.value = t;

      punch.multiplyScalar(1 - Math.min(dt * 5, 1));
      camera.position.set(punch.x, kf(camY, p) + punch.y, kf(camZ, p));
      camera.lookAt(0.4, 0, 0);

      composer.render();
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("resize", onResize);
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Points) {
          obj.geometry.dispose();
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach((m) => {
            const mat = m as THREE.MeshStandardMaterial;
            if (mat.map) mat.map.dispose();
            mat.dispose();
          });
        }
      });
      composer.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={mountRef} className="absolute inset-0" data-print-hidden="true" />;
}
