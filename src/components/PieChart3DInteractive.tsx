import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface PieChart3DInteractiveProps {
  data: ChartData[];
  radius?: number;
  height?: number;
  animated?: boolean;
}

const PieSlice: React.FC<{
  startAngle: number;
  endAngle: number;
  radius: number;
  height: number;
  color: string;
  animated?: boolean;
}> = ({ startAngle, endAngle, radius, height, color, animated = false }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Animation de rotation douce
  useFrame((state) => {
    if (meshRef.current && animated) {
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.absarc(0, 0, radius, startAngle, endAngle, false);
    s.lineTo(0, 0);
    return s;
  }, [startAngle, endAngle, radius]);

  const geometry = useMemo(() => {
    return new THREE.ExtrudeGeometry(shape, {
      depth: height,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.1,
      bevelSegments: 8,
    });
  }, [shape, height]);

  return (
    <mesh 
      ref={meshRef}
      geometry={geometry} 
      rotation={[-Math.PI / 2, 0, 0]}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial 
        color={color} 
        roughness={0.3}
        metalness={0.1}
      />
    </mesh>
  );
};

const PieChart3DInteractive: React.FC<PieChart3DInteractiveProps> = ({
  data,
  radius = 5,
  height = 1,
  animated = true,
}) => {
  // Validation des données
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-700 rounded-xl">
        <div className="text-center">
          <div className="text-gray-400 dark:text-gray-500 mb-2">📊</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Aucune donnée disponible
          </div>
        </div>
      </div>
    );
  }

  // Filtrer les données valides
  const validData = data.filter(
    item => item && 
           typeof item.name === 'string' && 
           typeof item.value === 'number' && 
           !isNaN(item.value) && 
           item.value > 0 &&
           typeof item.color === 'string'
  );

  if (validData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-700 rounded-xl">
        <div className="text-center">
          <div className="text-gray-400 dark:text-gray-500 mb-2">⚠️</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Données invalides
          </div>
        </div>
      </div>
    );
  }

  const total = validData.reduce((acc, d) => acc + d.value, 0);
  let currentAngle = 0;

  return (
    <div className="w-full h-64 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl overflow-hidden shadow-inner">
      <Canvas
        camera={{ position: [0, 8, 12], fov: 50 }}
        shadows
        style={{ width: "100%", height: "100%" }}
      >
        {/* Éclairage amélioré */}
        <ambientLight intensity={0.6} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1.2} 
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-10, -10, -10]} intensity={0.3} />

        {/* Groupe principal avec les tranches */}
        <group>
          {validData.map((d, i) => {
            const startAngle = currentAngle;
            const angle = (d.value / total) * Math.PI * 2;
            const endAngle = startAngle + angle;
            currentAngle += angle;

            return (
              <PieSlice
                key={`${d.name}-${i}`}
                startAngle={startAngle}
                endAngle={endAngle}
                radius={radius}
                height={height}
                color={d.color}
                animated={animated}
              />
            );
          })}
        </group>

        {/* Contrôles de caméra */}
        <OrbitControls 
          enableZoom={true}
          enablePan={false}
          enableRotate={true}
          autoRotate={animated}
          autoRotateSpeed={1}
          minDistance={8}
          maxDistance={20}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
};

export default PieChart3DInteractive;