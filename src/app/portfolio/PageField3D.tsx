"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type PageFieldProps = {
  paused: boolean;
  onFailure: () => void;
};

const FIELD_SEED = 2317;

function seededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function makeOrbitPoints(radiusX: number, radiusY: number, depth: number, tilt: number, phase: number) {
  const points: THREE.Vector3[] = [];
  const steps = 120;
  for (let index = 0; index < steps; index += 1) {
    const angle = (index / steps) * Math.PI * 2;
    const point = new THREE.Vector3(
      Math.cos(angle) * radiusX,
      Math.sin(angle) * radiusY,
      depth + Math.sin(angle * 2 + phase) * 0.16,
    );
    point.applyEuler(new THREE.Euler(tilt, phase * 0.1, phase * 0.08));
    points.push(point);
  }
  return points;
}

export default function PageField3D({ paused, onFailure }: PageFieldProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(paused);
  useEffect(() => { pausedRef.current = paused; }, [paused]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer | undefined;
    let frame = 0;
    let disposed = false;
    let active = true;
    let previousTime = 0;
    let targetScroll = 0;
    let scrollProgress = 0;
    let pointerX = 0;
    let pointerY = 0;
    const orbitGeometries: THREE.BufferGeometry[] = [];
    const orbitMaterials: THREE.LineBasicMaterial[] = [];
    const markerMaterials: THREE.MeshBasicMaterial[] = [];
    let particleGeometry: THREE.BufferGeometry | undefined;
    let particleMaterial: THREE.PointsMaterial | undefined;

    const fail = () => {
      if (!disposed) onFailure();
    };

    try {
      const probe = document.createElement("canvas");
      if (!probe.getContext("webgl2")) throw new Error("WebGL2 unavailable");
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 700 ? 1 : 1.35));
      renderer.setClearColor(0x000000, 0);
      renderer.domElement.setAttribute("aria-hidden", "true");
      host.appendChild(renderer.domElement);
    } catch {
      fail();
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(27, 1, 0.1, 100);
    camera.position.set(0, 0, 11);

    const field = new THREE.Group();
    scene.add(field);
    const orbitGroup = new THREE.Group();
    field.add(orbitGroup);

    const queryField = new URLSearchParams(window.location.search).get("field");
    const showOrbits = queryField !== "points";
    const showPoints = queryField !== "lines";
    const orbitSpecs = [
      { radiusX: 4.25, radiusY: 1.55, depth: -0.2, tilt: 0.36, phase: 0.2, color: 0x597a70, opacity: 0.23 },
      { radiusX: 3.15, radiusY: 2.15, depth: 0.25, tilt: -0.24, phase: 1.7, color: 0x9aa9a1, opacity: 0.28 },
      { radiusX: 2.2, radiusY: 3.25, depth: -0.35, tilt: 0.18, phase: 3.1, color: 0xb94834, opacity: 0.18 },
      { radiusX: 4.9, radiusY: 2.75, depth: -0.65, tilt: -0.08, phase: 4.6, color: 0x78948b, opacity: 0.14 },
    ];

    if (showOrbits) {
      for (const spec of orbitSpecs) {
        const geometry = new THREE.BufferGeometry().setFromPoints(
          makeOrbitPoints(spec.radiusX, spec.radiusY, spec.depth, spec.tilt, spec.phase),
        );
        const material = new THREE.LineBasicMaterial({
          color: spec.color,
          transparent: true,
          opacity: spec.opacity,
          depthWrite: false,
        });
        orbitGroup.add(new THREE.LineLoop(geometry, material));
        orbitGeometries.push(geometry);
        orbitMaterials.push(material);
      }
    }

    const markerPositions = [
      new THREE.Vector3(-3.55, 0.85, 0.15),
      new THREE.Vector3(2.6, -1.45, 0.05),
      new THREE.Vector3(0.9, 2.1, -0.2),
    ];
    const markerGeometry = new THREE.SphereGeometry(0.055, 12, 8);
    markerPositions.forEach((position, index) => {
      if (!showOrbits) return;
      const material = new THREE.MeshBasicMaterial({
        color: index === 1 ? 0xb94834 : 0x366d61,
        transparent: true,
        opacity: 0.62,
        depthWrite: false,
      });
      const marker = new THREE.Mesh(markerGeometry, material);
      marker.position.copy(position);
      orbitGroup.add(marker);
      markerMaterials.push(material);
    });

    const random = seededRandom(FIELD_SEED);
    const particleCount = window.innerWidth < 700 ? 38 : 82;
    const basePositions = new Float32Array(particleCount * 3);
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const particlePhases = new Float32Array(particleCount);
    const particleSpeeds = new Float32Array(particleCount);
    const palette = [new THREE.Color(0x536f68), new THREE.Color(0x9caeaa), new THREE.Color(0xb94834)];
    for (let index = 0; index < particleCount; index += 1) {
      const radius = 1.3 + random() * 4.1;
      const angle = random() * Math.PI * 2;
      const height = (random() - 0.5) * 5.4;
      const offset = index * 3;
      basePositions[offset] = Math.cos(angle) * radius;
      basePositions[offset + 1] = height;
      basePositions[offset + 2] = (random() - 0.5) * 1.7;
      particlePositions[offset] = basePositions[offset];
      particlePositions[offset + 1] = basePositions[offset + 1];
      particlePositions[offset + 2] = basePositions[offset + 2];
      particlePhases[index] = random() * Math.PI * 2;
      particleSpeeds[index] = 0.6 + random() * 1.1;
      const color = palette[random() < 0.12 ? 2 : random() < 0.48 ? 1 : 0];
      particleColors[offset] = color.r;
      particleColors[offset + 1] = color.g;
      particleColors[offset + 2] = color.b;
    }
    if (showPoints) {
      particleGeometry = new THREE.BufferGeometry();
      particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
      particleGeometry.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));
      particleMaterial = new THREE.PointsMaterial({
        size: window.innerWidth < 700 ? 0.07 : 0.085,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        opacity: 0.48,
        depthWrite: false,
      });
      field.add(new THREE.Points(particleGeometry, particleMaterial));
    }

    const observer = new IntersectionObserver(([entry]) => { active = entry.isIntersecting; }, { rootMargin: "-80px 0px", threshold: 0.01 });
    observer.observe(host);
    const onVisibility = () => { active = document.visibilityState === "visible"; };
    const updateScrollTarget = () => {
      const scrollRange = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      targetScroll = Math.max(0, Math.min(1, window.scrollY / scrollRange));
    };
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      pointerX = (event.clientX / window.innerWidth - 0.5) * 2;
      pointerY = (event.clientY / window.innerHeight - 0.5) * 2;
    };
    const resize = () => {
      if (!renderer) return;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 700 ? 1 : 1.35));
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      camera.aspect = window.innerWidth / Math.max(1, window.innerHeight);
      camera.updateProjectionMatrix();
      field.scale.setScalar(window.innerWidth < 700 ? 0.68 : window.innerWidth < 1100 ? 0.82 : 1);
    };

    updateScrollTarget();
    resize();
    window.addEventListener("scroll", updateScrollTarget, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);

    const onContextLost = (event: Event) => {
      event.preventDefault();
      fail();
    };
    renderer.domElement.addEventListener("webglcontextlost", onContextLost, false);

    const render = (time: number) => {
      frame = requestAnimationFrame(render);
      if (disposed || !renderer || !active || pausedRef.current) return;
      const delta = Math.min(0.05, previousTime ? (time - previousTime) / 1000 : 0.016);
      previousTime = time;
      scrollProgress += (targetScroll - scrollProgress) * (1 - Math.exp(-delta * 6));
      const phase = scrollProgress * Math.PI * 2;
      const seconds = time * 0.001;
      field.rotation.y += ((pointerX * 0.07 + Math.sin(phase) * 0.08) - field.rotation.y) * 0.035;
      field.rotation.x += ((-pointerY * 0.05 + Math.cos(phase * 0.7) * 0.04) - field.rotation.x) * 0.035;
      field.position.x += ((scrollProgress - 0.5) * 0.38 - field.position.x) * 0.035;
      field.position.y += (Math.sin(phase * 1.35) * 0.22 - field.position.y) * 0.035;
      orbitGroup.rotation.z = phase * 0.32 + Math.sin(seconds * 0.18) * 0.05;
      orbitGroup.rotation.y = Math.sin(seconds * 0.11 + phase) * 0.14;
      markerMaterials.forEach((material, index) => {
        material.opacity = 0.42 + Math.sin(seconds * 1.1 + index * 1.7) * 0.18;
      });
      if (showPoints && particleGeometry) {
        const position = particleGeometry.getAttribute("position") as THREE.BufferAttribute;
        for (let index = 0; index < particleCount; index += 1) {
          const offset = index * 3;
          const particleTime = seconds * particleSpeeds[index] + particlePhases[index];
          position.array[offset] = basePositions[offset] + Math.sin(particleTime * 0.7) * 0.1;
          position.array[offset + 1] = basePositions[offset + 1] + Math.cos(particleTime * 0.55) * 0.12;
          position.array[offset + 2] = basePositions[offset + 2] + Math.sin(particleTime * 0.42) * 0.08;
        }
        position.needsUpdate = true;
      }
      renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(render);
    renderer.render(scene, camera);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", updateScrollTarget);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      renderer?.domElement.removeEventListener("webglcontextlost", onContextLost);
      orbitGeometries.forEach((geometry) => geometry.dispose());
      orbitMaterials.forEach((material) => material.dispose());
      markerGeometry?.dispose();
      markerMaterials.forEach((material) => material.dispose());
      particleGeometry?.dispose();
      particleMaterial?.dispose();
      renderer?.dispose();
      renderer?.domElement.remove();
    };
  }, [onFailure]);

  return <div ref={hostRef} className="studio-ambient" data-field-seed={FIELD_SEED} aria-hidden="true" />;
}
