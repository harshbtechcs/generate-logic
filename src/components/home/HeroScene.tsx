"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * 3D cloud-infrastructure model for the hero:
 *   layer 1  – VPC network plate with subnets
 *   layer 2  – container grid (some containers "pulse" as if running)
 *   layer 3  – orchestration ring (control plane)
 *   beams    – vertical links with data packets travelling up them
 *   stars    – floating particles around the model
 * The model slowly turns, bobs, and tilts toward the mouse.
 */

const GREEN = new THREE.Color("#4ADE80");
const CYAN = new THREE.Color("#22D3EE");
const BLUE = new THREE.Color("#60A5FA");

function Plate({ size, y, color, opacity }: { size: number; y: number; color: THREE.Color; opacity: number }) {
  const geo = useMemo(() => new THREE.BoxGeometry(size, 0.05, size), [size]);
  const edges = useMemo(() => new THREE.EdgesGeometry(geo), [geo]);
  return (
    <group position={[0, y, 0]}>
      <mesh geometry={geo}>
        <meshStandardMaterial color={color} transparent opacity={opacity} emissive={color} emissiveIntensity={0.25} />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={color} transparent opacity={0.9} />
      </lineSegments>
    </group>
  );
}

function SquareOutline({ x, z, w, d, y }: { x: number; z: number; w: number; d: number; y: number }) {
  // Built as a THREE.Line object: the JSX <line> tag is SVG's in TypeScript.
  const line = useMemo(() => {
    const pts = [
      new THREE.Vector3(-w / 2, 0, -d / 2),
      new THREE.Vector3(w / 2, 0, -d / 2),
      new THREE.Vector3(w / 2, 0, d / 2),
      new THREE.Vector3(-w / 2, 0, d / 2),
      new THREE.Vector3(-w / 2, 0, -d / 2),
    ];
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineDashedMaterial({ color: BLUE, dashSize: 0.12, gapSize: 0.08, transparent: true, opacity: 0.8 });
    const l = new THREE.Line(geo, mat);
    l.computeLineDistances();
    return l;
  }, [w, d]);
  return <primitive object={line} position={[x, y, z]} />;
}

function Containers({ y, animate }: { y: number; animate: boolean }) {
  const refs = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const cells = useMemo(() => {
    const out: { x: number; z: number; color: THREE.Color; pulse: boolean }[] = [];
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++) {
        const idx = i * 3 + j;
        out.push({ x: (i - 1) * 0.85, z: (j - 1) * 0.85, color: idx % 4 === 2 ? GREEN : CYAN, pulse: idx % 3 === 0 });
      }
    return out;
  }, []);

  useFrame(({ clock }) => {
    if (!animate) return;
    const t = clock.getElapsedTime();
    cells.forEach((c, i) => {
      const m = refs.current[i];
      if (m && c.pulse) m.emissiveIntensity = 0.35 + 0.45 * (0.5 + 0.5 * Math.sin(t * 2.2 + i));
    });
  });

  return (
    <group position={[0, y + 0.3, 0]}>
      {cells.map((c, i) => (
        <mesh key={i} position={[c.x, 0, c.z]}>
          <boxGeometry args={[0.55, 0.5, 0.55]} />
          <meshStandardMaterial
            ref={(m) => {
              refs.current[i] = m;
            }}
            color={c.color}
            emissive={c.color}
            emissiveIntensity={0.4}
            transparent
            opacity={0.55}
            metalness={0.2}
            roughness={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}

function ControlPlane({ y, animate }: { y: number; animate: boolean }) {
  const core = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (!animate) return;
    if (core.current) {
      core.current.rotation.y += dt * 0.8;
      core.current.rotation.x += dt * 0.4;
    }
    if (ring.current) ring.current.rotation.z += dt * 0.3;
  });
  return (
    <group position={[0, y, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.15, 0.035, 16, 96]} />
        <meshStandardMaterial color={GREEN} emissive={GREEN} emissiveIntensity={1.2} />
      </mesh>
      <mesh ref={ring} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.8, 0.015, 8, 64, Math.PI * 1.5]} />
        <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={1} />
      </mesh>
      <mesh ref={core}>
        <icosahedronGeometry args={[0.38, 0]} />
        <meshStandardMaterial color={GREEN} emissive={GREEN} emissiveIntensity={0.8} wireframe />
      </mesh>
    </group>
  );
}

const BEAMS: [number, number][] = [
  [-0.85, -0.85],
  [0.85, 0.85],
  [0.85, -0.85],
];

function Beams({ top, animate }: { top: number; animate: boolean }) {
  const packets = useRef<(THREE.Mesh | null)[]>([]);
  useFrame(({ clock }) => {
    if (!animate) return;
    const t = clock.getElapsedTime();
    packets.current.forEach((p, i) => {
      if (!p) return;
      const k = ((t * 0.38 + i * 0.33) % 1 + 1) % 1;
      p.position.y = k * top;
      const s = Math.sin(k * Math.PI);
      p.scale.setScalar(0.4 + s * 0.8);
    });
  });
  return (
    <>
      {BEAMS.map(([x, z], i) => (
        <group key={i}>
          <mesh position={[x, top / 2, z]}>
            <cylinderGeometry args={[0.012, 0.012, top, 6]} />
            <meshBasicMaterial color={i === 2 ? CYAN : GREEN} transparent opacity={0.6} />
          </mesh>
          <mesh
            ref={(m) => {
              packets.current[i] = m;
            }}
            position={[x, 0, z]}
          >
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshBasicMaterial color={i === 2 ? "#A5F3FC" : "#BBF7D0"} />
          </mesh>
        </group>
      ))}
    </>
  );
}

function Stars({ animate }: { animate: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const n = 260;
    const pos = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);
    const palette = [GREEN, CYAN, BLUE];
    for (let i = 0; i < n; i++) {
      // deterministic pseudo-random so server/client and reloads look the same
      const r = 3 + ((i * 7919) % 1000) / 1000 * 3.5;
      const theta = (i * 2.399963) % (Math.PI * 2);
      const y = (((i * 104729) % 1000) / 1000) * 5 - 1.5;
      pos.set([Math.cos(theta) * r, y, Math.sin(theta) * r], i * 3);
      const c = palette[i % 3];
      col.set([c.r, c.g, c.b], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    return g;
  }, []);
  useFrame((_, dt) => {
    if (animate && ref.current) ref.current.rotation.y += dt * 0.03;
  });
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial size={0.045} vertexColors transparent opacity={0.85} sizeAttenuation />
    </points>
  );
}

function Model({ animate }: { animate: boolean }) {
  const root = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);

  useFrame(({ clock, pointer }, dt) => {
    if (!root.current || !spin.current) return;
    if (animate) {
      const t = clock.getElapsedTime();
      spin.current.rotation.y += dt * 0.18;
      root.current.position.y = Math.sin(t * 0.9) * 0.12 - 0.6;
      // ease toward the mouse
      root.current.rotation.x = THREE.MathUtils.lerp(root.current.rotation.x, 0.12 - pointer.y * 0.18, 0.05);
      root.current.rotation.z = THREE.MathUtils.lerp(root.current.rotation.z, -pointer.x * 0.12, 0.05);
    }
  });

  return (
    <group ref={root} position={[0, -0.6, 0]} rotation={[0.12, 0, 0]}>
      <group ref={spin} rotation={[0, -0.7, 0]}>
        <Plate size={4} y={0} color={BLUE} opacity={0.18} />
        <gridHelper args={[4, 10, "#3B82F6", "#1E3A8A"]} position={[0, 0.03, 0]} />
        <SquareOutline x={-0.95} z={-0.95} w={1.5} d={1.5} y={0.05} />
        <SquareOutline x={0.95} z={-0.95} w={1.5} d={1.5} y={0.05} />
        <SquareOutline x={0} z={1.05} w={3.4} d={1.2} y={0.05} />

        <Plate size={3.1} y={1.2} color={CYAN} opacity={0.14} />
        <Containers y={1.2} animate={animate} />

        <ControlPlane y={2.5} animate={animate} />
        <Beams top={2.5} animate={animate} />
      </group>
      <Stars animate={animate} />
    </group>
  );
}

export default function HeroScene({ animate, visible }: { animate: boolean; visible: boolean }) {
  return (
    <Canvas
      frameloop={visible ? "always" : "never"}
      dpr={[1, 1.75]}
      camera={{ position: [0, 3.4, 7.2], fov: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ camera }) => camera.lookAt(0, 0.6, 0)}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.6} />
      <pointLight position={[3, 5, 3]} intensity={30} color="#22D3EE" />
      <pointLight position={[-4, 2, -2]} intensity={20} color="#4ADE80" />
      <Model animate={animate} />
    </Canvas>
  );
}
