"use client";

import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, RoundedBox, ContactShadows } from "@react-three/drei";
import type { Group, MeshStandardMaterial } from "three";
import type { FingerId } from "@/lib/types";
import HandFallback from "./HandFallback";

const SKIN = "#e7b48f";
const SKIN_SHADOW = "#d99e76";

interface FingerLayout {
  id: FingerId;
  x: number;
  baseY: number;
  z: number;
  splay: number; // sideways tilt at the knuckle
  width: number;
  depth: number;
  lengths: number[]; // proximal -> distal phalanges
}

// Four fingers across the top edge of the palm, plus an opposed thumb.
const FINGERS: FingerLayout[] = [
  { id: "index", x: -0.52, baseY: 0.92, z: 0, splay: 0.05, width: 0.26, depth: 0.24, lengths: [0.42, 0.34, 0.26] },
  { id: "middle", x: -0.17, baseY: 1.0, z: 0, splay: 0.0, width: 0.27, depth: 0.25, lengths: [0.46, 0.38, 0.28] },
  { id: "ring", x: 0.18, baseY: 0.95, z: 0, splay: -0.05, width: 0.26, depth: 0.24, lengths: [0.42, 0.35, 0.26] },
  { id: "little", x: 0.5, baseY: 0.8, z: 0, splay: -0.12, width: 0.21, depth: 0.21, lengths: [0.32, 0.26, 0.2] },
];

const THUMB: FingerLayout & { rotZ: number; rotX: number } = {
  id: "thumb",
  x: -0.72,
  baseY: -0.05,
  z: 0.12,
  splay: 0,
  width: 0.29,
  depth: 0.27,
  lengths: [0.38, 0.32],
  rotZ: 0.95,
  rotX: 0.35,
};

function Segment({
  length,
  width,
  depth,
  highlighted,
}: {
  length: number;
  width: number;
  depth: number;
  highlighted: boolean;
}) {
  const mat = useRef<MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    if (mat.current && highlighted) {
      // Gentle red pulse so the injured finger "glows".
      mat.current.emissiveIntensity = 0.45 + 0.3 * Math.sin(clock.getElapsedTime() * 3);
    }
  });
  return (
    <RoundedBox
      args={[width, length, depth]}
      radius={Math.min(width, depth) * 0.45}
      smoothness={4}
      position={[0, length / 2, 0]}
      castShadow
    >
      <meshStandardMaterial
        ref={mat}
        color={highlighted ? "#ef4444" : SKIN}
        emissive={highlighted ? "#dc2626" : "#000000"}
        emissiveIntensity={highlighted ? 0.5 : 0}
        roughness={0.62}
        metalness={0.04}
      />
    </RoundedBox>
  );
}

/** A three- (or two-) jointed finger that can curl through a flexion cycle. */
function Finger({
  layout,
  highlighted,
  active,
  phase = 0,
}: {
  layout: FingerLayout & { rotZ?: number; rotX?: number };
  highlighted: boolean;
  active: boolean; // animate this finger's flexion
  phase?: number;
}) {
  const mcp = useRef<Group>(null);
  const pip = useRef<Group>(null);
  const dip = useRef<Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    // Ease 0..1 over a ~4s cycle: bend in, hold, return — like a real rep.
    const flex = active ? Math.pow(Math.sin(t * 0.8 + phase) * 0.5 + 0.5, 1.5) : 0;
    if (mcp.current) mcp.current.rotation.x = flex * 1.0;
    if (pip.current) pip.current.rotation.x = flex * 1.3;
    if (dip.current) dip.current.rotation.x = flex * 0.7;
  });

  const [l0, l1, l2] = layout.lengths;
  const hasThird = layout.lengths.length >= 3;

  return (
    <group
      position={[layout.x, layout.baseY, layout.z]}
      rotation={[layout.rotX ?? 0, 0, (layout.rotZ ?? 0) + layout.splay]}
    >
      <group ref={mcp}>
        <Segment length={l0} width={layout.width} depth={layout.depth} highlighted={highlighted} />
        <group ref={pip} position={[0, l0, 0]}>
          <Segment length={l1} width={layout.width * 0.92} depth={layout.depth * 0.92} highlighted={highlighted} />
          {hasThird && (
            <group ref={dip} position={[0, l1, 0]}>
              <Segment length={l2} width={layout.width * 0.84} depth={layout.depth * 0.84} highlighted={highlighted} />
            </group>
          )}
        </group>
      </group>
    </group>
  );
}

function Hand({ highlighted, animate }: { highlighted: FingerId | null; animate: boolean }) {
  const root = useRef<Group>(null);
  // Subtle idle sway for life; user can still orbit freely.
  useFrame(({ clock }) => {
    if (root.current) root.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.4) * 0.12;
  });

  return (
    <group ref={root} position={[0, -0.3, 0]} rotation={[-0.15, 0, 0]}>
      {/* Palm */}
      <RoundedBox args={[1.5, 1.7, 0.42]} radius={0.22} smoothness={4} position={[0, 0, 0]} castShadow>
        <meshStandardMaterial color={SKIN} roughness={0.62} metalness={0.04} />
      </RoundedBox>
      {/* Wrist */}
      <RoundedBox args={[1.05, 0.7, 0.4]} radius={0.18} smoothness={4} position={[0, -1.05, 0]} castShadow>
        <meshStandardMaterial color={SKIN_SHADOW} roughness={0.65} metalness={0.04} />
      </RoundedBox>

      {FINGERS.map((f, i) => (
        <Finger
          key={f.id}
          layout={f}
          highlighted={highlighted === f.id}
          active={animate && highlighted === f.id}
          phase={i * 0.2}
        />
      ))}
      <Finger
        layout={THUMB}
        highlighted={highlighted === "thumb"}
        active={animate && highlighted === "thumb"}
      />
    </group>
  );
}

export interface Hand3DProps {
  finger: FingerId | null;
  animate: boolean;
}

/** Catches WebGL/runtime errors from the canvas and shows the 2D fallback. */
class CanvasBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function webglSupported(): boolean {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Client-only WebGL viewer. Mounts after hydration; degrades to 2D on no-WebGL. */
export default function Hand3D({ finger, animate }: Hand3DProps) {
  const [mounted, setMounted] = useState(false);
  const [supported, setSupported] = useState(true);
  useEffect(() => {
    setMounted(true);
    setSupported(webglSupported());
  }, []);

  if (!mounted) {
    return <div className="h-full w-full animate-pulse rounded-2xl bg-slate-800/40" aria-hidden />;
  }

  if (!supported) {
    return <HandFallback finger={finger} />;
  }

  return (
    <CanvasBoundary fallback={<HandFallback finger={finger} />}>
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 0.4, 4.4], fov: 42 }}
      gl={{ alpha: true, antialias: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.65} />
      <directionalLight position={[3, 5, 5]} intensity={1.2} castShadow />
      <directionalLight position={[-4, 2, -2]} intensity={0.45} color="#bcd4ff" />
      <Hand highlighted={finger} animate={animate} />
      <ContactShadows position={[0, -1.9, 0]} opacity={0.35} blur={2.6} scale={7} far={4} />
      <OrbitControls enablePan={false} minDistance={2.6} maxDistance={7} enableDamping />
    </Canvas>
    </CanvasBoundary>
  );
}
