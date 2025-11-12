import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Torus } from '@react-three/drei';
import * as THREE from 'three';

// 3D Job Portal Scene Component
const JobPortalScene: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const buildingRef = useRef<THREE.Group>(null);
  const briefcaseRef = useRef<THREE.Group>(null);
  const networkRef = useRef<THREE.Group>(null);

  // Animate the entire scene
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(time * 0.5) * 0.1;
    }
    
    if (buildingRef.current) {
      buildingRef.current.position.y = Math.sin(time * 2) * 0.05;
    }
    
    if (briefcaseRef.current) {
      briefcaseRef.current.rotation.y = time * 0.5;
      briefcaseRef.current.position.y = Math.sin(time * 3) * 0.1;
    }
    
    if (networkRef.current) {
      networkRef.current.rotation.z = time * 0.3;
    }
  });

  // Create building blocks for the job portal
  const buildings = useMemo(() => {
    const buildingPositions = [
      [-2, 0, -1],
      [0, 0, -1.5],
      [2, 0, -1],
      [-1, 0, 1],
      [1, 0, 1]
    ];
    
    return buildingPositions.map((position, index) => (
      <Box
        key={index}
        position={position as [number, number, number]}
        args={[0.8, 1.2 + Math.random() * 0.8, 0.8]}
      >
        <meshStandardMaterial
          color={index % 2 === 0 ? '#3b82f6' : '#1e40af'}
          transparent
          opacity={0.8}
        />
      </Box>
    ));
  }, []);

  // Create floating job cards
  const jobCards = useMemo(() => {
    const cardPositions = [
      [-1.5, 1.5, 0],
      [0, 2, 0],
      [1.5, 1.8, 0],
      [-0.5, 2.5, 0],
      [0.5, 2.2, 0]
    ];
    
    return cardPositions.map((position, index) => (
      <Box
        key={index}
        position={position as [number, number, number]}
        args={[0.4, 0.6, 0.05]}
        rotation={[0, Math.PI * 0.1 * index, 0]}
      >
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.9}
        />
      </Box>
    ));
  }, []);

  // Create network connections
  const networkConnections = useMemo(() => {
    const points = [
      [-2, 0, -1],
      [0, 0, -1.5],
      [2, 0, -1],
      [-1, 0, 1],
      [1, 0, 1]
    ];
    
    const connections = [];
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const start = points[i];
        const end = points[j];
        const midX = (start[0] + end[0]) / 2;
        const midY = (start[1] + end[1]) / 2 + 0.5;
        const midZ = (start[2] + end[2]) / 2;
        
        connections.push(
          <Box
            key={`${i}-${j}`}
            position={[midX, midY, midZ]}
            args={[0.02, 0.02, Math.sqrt(
              Math.pow(end[0] - start[0], 2) +
              Math.pow(end[2] - start[2], 2)
            )]}
            rotation={[0, Math.atan2(end[2] - start[2], end[0] - start[0]), 0]}
          >
            <meshStandardMaterial
              color="#10b981"
              transparent
              opacity={0.6}
            />
          </Box>
        );
      }
    }
    return connections;
  }, []);

  return (
    <group ref={groupRef}>
      {/* Main building complex */}
      <group ref={buildingRef}>
        {buildings}
      </group>
      
      {/* Floating job cards */}
      <group ref={briefcaseRef}>
        {jobCards}
        
        {/* Central briefcase icon */}
        <Box
          position={[0, 1, 0]}
          args={[0.3, 0.2, 0.15]}
        >
          <meshStandardMaterial
            color="#1e3a8a"
            metalness={0.8}
            roughness={0.2}
          />
        </Box>
        
        {/* Briefcase handle */}
        <Torus
          position={[0, 1.1, 0]}
          args={[0.15, 0.02, 8, 16]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <meshStandardMaterial
            color="#1e3a8a"
            metalness={0.8}
            roughness={0.2}
          />
        </Torus>
      </group>
      
      {/* Network connections */}
      <group ref={networkRef}>
        {networkConnections}
      </group>
      
      {/* Floating particles */}
      {Array.from({ length: 20 }).map((_, index) => (
        <Sphere
          key={index}
          position={[
            (Math.random() - 0.5) * 6,
            Math.random() * 3 + 1,
            (Math.random() - 0.5) * 6
          ]}
          args={[0.02]}
        >
          <meshStandardMaterial
            color="#3b82f6"
            transparent
            opacity={0.6}
          />
        </Sphere>
      ))}
      
      {/* 3D Text */}
      <Text
        position={[0, 3, 0]}
        fontSize={0.3}
        color="#1e3a8a"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter.woff"
      >
        JOB PORTAL
      </Text>
    </group>
  );
};

// Main 3D Job Portal Component
const JobPortal3D: React.FC = () => {
  return (
    <div className="job-portal-3d">
      <Canvas
        camera={{ position: [0, 2, 5], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        {/* Scene */}
        <JobPortalScene />
        
        {/* Controls */}
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          enableRotate={true}
          autoRotate={true}
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 6}
        />
      </Canvas>
    </div>
  );
};

export default JobPortal3D;
