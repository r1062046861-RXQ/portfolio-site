"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import type { Work } from "./works";

export type PortfolioScreen = "menu" | "chapters" | "detail" | "about";

/* ---------------- VHS 故障 / RGB 色散后处理 ---------------- */
const GlitchShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    uTime: { value: 0 },
    uAmount: { value: 0.12 },
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

      // 横向切片撕裂（转场时明显）
      float slice = floor(uv.y * 24.0);
      float seed = rand(vec2(slice, floor(uTime * 24.0)));
      if (seed > 1.0 - a * 0.55) {
        uv.x += (rand(vec2(slice, uTime)) - 0.5) * 0.18 * a;
      }

      // RGB 色散（常开一点点，转场时加剧）
      float shift = 0.0025 + 0.014 * a;
      float r = texture2D(tDiffuse, uv + vec2(shift, 0.0)).r;
      float g = texture2D(tDiffuse, uv).g;
      float b = texture2D(tDiffuse, uv - vec2(shift, 0.0)).b;
      vec3 col = vec3(r, g, b);

      // 噪点
      col += (rand(uv * (uTime + 1.0)) - 0.5) * 0.14 * a;

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

  ctx.fillStyle = "#26221a";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 62px 'Microsoft YaHei', 'PingFang SC', sans-serif";
  ctx.fillText("任玄奇", 256, 222);
  ctx.font = "bold 27px monospace";
  ctx.fillText("RXQ · MIXTAPE", 256, 284);
  ctx.font = "20px monospace";
  ctx.fillText("SIDE A · 2026", 256, 324);

  // 中心孔
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(256, 256, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** 黑胶贴图：碟纹 + 当前作品标签；可重绘复用 */
function drawVinylLabel(ctx: CanvasRenderingContext2D, work: Work) {
  ctx.clearRect(0, 0, 512, 512);
  ctx.fillStyle = "#0a0a0a";
  ctx.beginPath();
  ctx.arc(256, 256, 250, 0, Math.PI * 2);
  ctx.fill();

  for (let r = 118; r < 244; r += 5) {
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(256, 256, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.fillStyle = `hsl(${work.hue}, 62%, 52%)`;
  ctx.beginPath();
  ctx.arc(256, 256, 108, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 40px 'Microsoft YaHei', 'PingFang SC', sans-serif";
  ctx.fillText(work.title, 256, 236);
  ctx.font = "22px monospace";
  ctx.fillText(`${work.year} · ${work.id.toUpperCase()}`, 256, 290);

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
  ctx.font = "bold 34px monospace";
  ctx.textAlign = "left";
  ctx.fillText("SIDE A", 48, 72);
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.fillRect(48, 92, 416, 2);
  works.forEach((w, i) => {
    const y = 150 + i * 62;
    ctx.fillStyle = `hsl(${w.hue}, 62%, 60%)`;
    ctx.font = "bold 24px monospace";
    ctx.fillText(String(i + 1).padStart(2, "0"), 48, y);
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.font = "24px 'Microsoft YaHei', 'PingFang SC', sans-serif";
    ctx.fillText(w.title, 110, y);
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.font = "20px monospace";
    ctx.textAlign = "right";
    ctx.fillText(w.year, 464, y);
    ctx.textAlign = "left";
  });
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.font = "18px monospace";
  ctx.fillText("RXQ STUDIO · LIQUID PIXEL", 48, 548);
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

/* ---------------- 场景组件 ---------------- */
type Props = {
  screen: PortfolioScreen;
  index: number;
  glitchKey: number;
  works: Work[];
};

export default function Scene3D({ screen, index, glitchKey, works }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef(screen);
  const vinylDirtyRef = useRef(false);
  const glitchSpikeRef = useRef(1); // 入场即一次故障
  const worksRef = useRef(works);
  const indexRef = useRef(index);

  useEffect(() => {
    screenRef.current = screen;
  }, [screen]);
  useEffect(() => {
    indexRef.current = index;
    vinylDirtyRef.current = true;
  }, [index]);
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
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);
    scene.add(new THREE.AmbientLight(0x8888ff, 0.25));

    const maxAniso = renderer.capabilities.getMaxAnisotropy();

    /* ----- CD 盒 ----- */
    const caseGroup = new THREE.Group();
    const shell = new THREE.Mesh(
      new THREE.BoxGeometry(3.4, 3.8, 0.3),
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.07,
        roughness: 0.12,
        metalness: 0,
        clearcoat: 0.5,
        clearcoatRoughness: 0.2,
        envMapIntensity: 0.6,
        specularIntensity: 0.4,
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
    const trayBack = new THREE.MeshStandardMaterial({ map: trayTex, roughness: 0.85 });
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
        roughness: 0.3,
        metalness: 0.7,
        envMapIntensity: 1.0,
      })
    );
    discBody.position.z = 0.045;
    caseGroup.add(discBody);
    const discFace = new THREE.Mesh(
      new THREE.CircleGeometry(1.45, 72),
      // 不透明 + alphaTest：在实体渲染通道绘制，避免被透明外壳的深度写入遮挡
      new THREE.MeshBasicMaterial({
        map: discTex,
        alphaTest: 0.5,
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
    const vinyl = makeVinylTexture(worksRef.current[indexRef.current]);
    vinyl.tex.anisotropy = maxAniso;
    const vinylBodyGeo = new THREE.CylinderGeometry(1.62, 1.62, 0.05, 72);
    vinylBodyGeo.rotateX(Math.PI / 2);
    const vinylBody = new THREE.Mesh(
      vinylBodyGeo,
      new THREE.MeshPhysicalMaterial({
        color: 0x0a0a0a,
        roughness: 0.4,
        metalness: 0.3,
        clearcoat: 0.6,
      })
    );
    vinylGroup.add(vinylBody);
    // 正面贴图圆片（平面 UV，标签文字不镜像）
    const vinylFace = new THREE.Mesh(
      new THREE.CircleGeometry(1.62, 72),
      new THREE.MeshPhysicalMaterial({
        map: vinyl.tex,
        transparent: true,
        roughness: 0.35,
        metalness: 0.3,
        clearcoat: 0.6,
        envMapIntensity: 1.1,
      })
    );
    vinylFace.position.z = 0.027;
    vinylGroup.add(vinylFace);
    scene.add(vinylGroup);

    /* ----- 后处理 ----- */
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const glitchPass = new ShaderPass(GlitchShader);
    composer.addPass(glitchPass);
    composer.addPass(new OutputPass());

    /* ----- 布局目标 ----- */
    const targets = {
      menu: {
        casePos: new THREE.Vector3(0.9, 0, 0),
        caseRotY: -0.18,
        vinylPos: new THREE.Vector3(7.5, -0.2, -1),
      },
      chapters: {
        casePos: new THREE.Vector3(-6.5, 0.3, -1.5),
        caseRotY: -0.7,
        vinylPos: new THREE.Vector3(1.15, -0.05, 0),
      },
      detail: {
        casePos: new THREE.Vector3(1.5, 0, 0),
        caseRotY: Math.PI + 0.12,
        vinylPos: new THREE.Vector3(7.5, -0.2, -1),
      },
      about: {
        casePos: new THREE.Vector3(1.5, 0, 0),
        caseRotY: Math.PI + 0.12,
        vinylPos: new THREE.Vector3(7.5, -0.2, -1),
      },
    };
    caseGroup.position.copy(targets.menu.casePos);
    vinylGroup.position.copy(targets.menu.vinylPos);
    const caseBase = targets.menu.casePos.clone();
    const vinylBase = targets.menu.vinylPos.clone();

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
    let glitchAmount = 0.12;
    const punch = new THREE.Vector3();

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;
      const s = targets[screenRef.current];
      const k = 1 - Math.exp(-dt * 3.2);

      caseBase.lerp(s.casePos, k);
      vinylBase.lerp(s.vinylPos, k);
      caseGroup.position.set(
        caseBase.x,
        caseBase.y + Math.sin(t * 0.9) * 0.06,
        caseBase.z
      );
      vinylGroup.position.copy(vinylBase);
      caseGroup.rotation.y += (s.caseRotY - caseGroup.rotation.y) * k;

      // 视差（菜单态最明显）
      const parallax = screenRef.current === "menu" ? 1 : 0.35;
      caseGroup.rotation.x += (pointer.y * 0.1 * parallax - caseGroup.rotation.x) * k;
      vinylGroup.rotation.y = Math.sin(t * 0.5) * 0.08;

      // 盘面旋转
      discFace.rotation.z -= dt * 0.45;
      if (screenRef.current === "chapters") vinylFace.rotation.z -= dt * 1.1;

      // 切换作品时重绘黑胶标签
      if (vinylDirtyRef.current) {
        vinylDirtyRef.current = false;
        drawVinylLabel(vinyl.ctx, worksRef.current[indexRef.current]);
        vinyl.tex.needsUpdate = true;
      }

      // 故障强度：转场尖峰后衰减回底噪
      if (glitchSpikeRef.current > 0) {
        glitchAmount = 1;
        glitchSpikeRef.current = 0;
        punch.set((Math.random() - 0.5) * 0.25, (Math.random() - 0.5) * 0.2, 0);
      }
      glitchAmount += (0.12 - glitchAmount) * (1 - Math.exp(-dt * 2.2));
      glitchPass.uniforms.uAmount.value = glitchAmount;
      glitchPass.uniforms.uTime.value = t;

      punch.multiplyScalar(1 - Math.min(dt * 5, 1));
      camera.position.set(punch.x, 0.1 + punch.y, 7.4);
      camera.lookAt(0.4, 0, 0);

      composer.render();
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("resize", onResize);
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
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
  }, []);

  return <div ref={mountRef} className="absolute inset-0" data-print-hidden="true" />;
}
