import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { DispensingMechanism, SystemState, DispenseCondition } from '../types';
import { 
  Play, 
  RotateCw, 
  Eye, 
  AlertTriangle, 
  Layers, 
  Maximize2, 
  RefreshCw, 
  Camera, 
  Zap, 
  Thermometer, 
  ShieldCheck, 
  Sliders, 
  Info,
  CheckCircle2,
  Box
} from 'lucide-react';

interface RIWAAThreeDViewProps {
  mechanisms: DispensingMechanism[];
  systemState: SystemState;
  selectedMechanismId: number;
  onSelectMechanism: (id: number) => void;
  onTriggerDispense: (cartridgeId: number, condition: DispenseCondition) => void;
}

export const RIWAAThreeDView: React.FC<RIWAAThreeDViewProps> = ({
  mechanisms,
  systemState,
  selectedMechanismId,
  onSelectMechanism,
  onTriggerDispense
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [cameraView, setCameraView] = useState<'overview' | 'cutaway' | 'sensors' | 'power'>('overview');
  const [casingTransparent, setCasingTransparent] = useState<boolean>(false);
  const [isExploded, setIsExploded] = useState<boolean>(false);
  const [animating, setAnimating] = useState<boolean>(false);
  const [simCondition, setSimCondition] = useState<DispenseCondition>('correct');
  const [statusMessage, setStatusMessage] = useState<string>('نظام رواء في وضع الاستعداد - اختر آلية وابدأ المحاكاة');
  const [webglError, setWebglError] = useState<boolean>(false);
  const [sensorStatus3D, setSensorStatus3D] = useState<{ passage: boolean; weightMg: number }>({
    passage: false,
    weightMg: 0
  });

  // References to 3D scene elements for animation
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const carouselGroupRef = useRef<THREE.Group | null>(null);
  const casingMeshRef = useRef<THREE.Mesh | null>(null);
  const doorMeshRef = useRef<THREE.Mesh | null>(null);
  const pillMeshRef = useRef<THREE.Mesh | null>(null);
  const pill2MeshRef = useRef<THREE.Mesh | null>(null);
  const irBeamMeshRef = useRef<THREE.Mesh | null>(null);
  const loadCellPlatformRef = useRef<THREE.Group | null>(null);
  const ledStripRef = useRef<THREE.Mesh | null>(null);
  const emergencyCoverRef = useRef<THREE.Group | null>(null);
  const explodedGroupRef = useRef<THREE.Group | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // Active target mechanism
  const currentMech = mechanisms.find(m => m.id === selectedMechanismId) || mechanisms[0];

  useEffect(() => {
    if (!mountRef.current) return;

    // --- Scene Setup ---
    const width = mountRef.current.clientWidth || 800;
    const height = mountRef.current.clientHeight || 560;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x090d16);

    // Subtle fog for depth
    scene.fog = new THREE.FogExp2(0x090d16, 0.025);

    // --- Camera ---
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.set(16, 14, 22);
    camera.lookAt(0, 3, 0);

    // --- Renderer ---
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch (e) {
      console.warn('WebGL is not supported or failed to initialize:', e);
      setWebglError(true);
      return;
    }
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(20, 30, 20);
    dirLight1.castShadow = true;
    dirLight1.shadow.mapSize.width = 1024;
    dirLight1.shadow.mapSize.height = 1024;
    scene.add(dirLight1);

    const cyanRimLight = new THREE.DirectionalLight(0x06b6d4, 1.5);
    cyanRimLight.position.set(-20, 10, -15);
    scene.add(cyanRimLight);

    const blueSoftLight = new THREE.PointLight(0x3b82f6, 1.0, 50);
    blueSoftLight.position.set(0, 10, 15);
    scene.add(blueSoftLight);

    // --- Ground Grid Plate ---
    const gridHelper = new THREE.GridHelper(40, 40, 0x1e293b, 0x0f172a);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    // Ground shadow receiver circle
    const groundGeo = new THREE.CylinderGeometry(15, 15, 0.2, 32);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x0c1322, roughness: 0.8 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -0.1;
    ground.receiveShadow = true;
    scene.add(ground);

    // --- Machine Root Group ---
    const machineGroup = new THREE.Group();
    scene.add(machineGroup);
    explodedGroupRef.current = machineGroup;

    // Dimensions: Width ~12, Height ~14, Depth ~11
    // --- 1. Outer Casing (White medical-grade ABS body) ---
    const casingGeo = new THREE.BoxGeometry(12, 13.5, 11);
    const casingMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.25,
      metalness: 0.1,
      transparent: true,
      opacity: casingTransparent ? 0.25 : 0.95
    });
    const casingMesh = new THREE.Mesh(casingGeo, casingMat);
    casingMesh.position.y = 6.75;
    casingMesh.castShadow = true;
    casingMesh.receiveShadow = true;
    machineGroup.add(casingMesh);
    casingMeshRef.current = casingMesh;

    // Silver side/corner edge trims (Aluminum anodized frame)
    const trimMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });
    const leftTrim = new THREE.Mesh(new THREE.BoxGeometry(0.4, 13.6, 11.1), trimMat);
    leftTrim.position.set(-6, 6.75, 0);
    machineGroup.add(leftTrim);

    const rightTrim = new THREE.Mesh(new THREE.BoxGeometry(0.4, 13.6, 11.1), trimMat);
    rightTrim.position.set(6, 6.75, 0);
    machineGroup.add(rightTrim);

    // Anti-slip silicone feet
    const footGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.5, 16);
    const footMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
    const feetPositions = [
      [-5, 0.25, -4],
      [5, 0.25, -4],
      [-5, 0.25, 4],
      [5, 0.25, 4]
    ];
    feetPositions.forEach(([x, y, z]) => {
      const foot = new THREE.Mesh(footGeo, footMat);
      foot.position.set(x, y, z);
      machineGroup.add(foot);
    });

    // --- 2. Top Solar Roof Panel ---
    const solarGeo = new THREE.BoxGeometry(11, 0.4, 10);
    const solarMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a,
      roughness: 0.1,
      metalness: 0.9,
      emissive: 0x0f172a,
      emissiveIntensity: 0.2
    });
    const solarPanel = new THREE.Mesh(solarGeo, solarMat);
    solarPanel.position.set(0, 13.6, 0);
    machineGroup.add(solarPanel);

    // Solar cells grid texture lines
    const solarGridLines = new THREE.GridHelper(10, 8, 0x60a5fa, 0x3b82f6);
    solarGridLines.position.set(0, 13.82, 0);
    machineGroup.add(solarGridLines);

    // --- 3. Front Panel Assembly ---
    // A) 7-Inch Touchscreen (Gorilla glass with display interface)
    const screenFrameGeo = new THREE.BoxGeometry(6.5, 4.2, 0.2);
    const screenFrameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.2 });
    const screenFrame = new THREE.Mesh(screenFrameGeo, screenFrameMat);
    screenFrame.position.set(0, 9.5, 5.55);
    machineGroup.add(screenFrame);

    // Screen display surface
    const screenCanvas = document.createElement('canvas');
    screenCanvas.width = 512;
    screenCanvas.height = 256;
    const ctx = screenCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, 512, 256);
      ctx.fillStyle = '#06b6d4';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('RIWAA - رواء الصحي الذكي', 30, 45);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px sans-serif';
      ctx.fillText('Next Dose: 12:00 PM | Lisinopril', 30, 80);
      ctx.fillStyle = '#10b981';
      ctx.fillText('● Normal Operation (2-8°C OK)', 30, 115);
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('WiFi Connected | Solar Active 135W', 30, 150);
      ctx.fillStyle = '#f59e0b';
      ctx.fillText('Battery: 88% | Dual Sensors: Armed', 30, 185);
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 4;
      ctx.strokeRect(10, 10, 492, 236);
    }
    const screenTexture = new THREE.CanvasTexture(screenCanvas);
    const screenMat = new THREE.MeshBasicMaterial({ map: screenTexture });
    const screenSurface = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 3.9), screenMat);
    screenSurface.position.set(0, 9.5, 5.66);
    machineGroup.add(screenSurface);

    // B) Dispensing Recess & Outlet
    const recessGeo = new THREE.BoxGeometry(4.6, 4.2, 3.5);
    const recessMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7 });
    const recess = new THREE.Mesh(recessGeo, recessMat);
    recess.position.set(0, 3.8, 4.2);
    machineGroup.add(recess);

    // C) Weighing Platform with Strain-Gauge Load Cell
    const loadCellGroup = new THREE.Group();
    loadCellGroup.position.set(0, 2.0, 4.2);
    machineGroup.add(loadCellGroup);
    loadCellPlatformRef.current = loadCellGroup;

    // Load cell base block
    const lcBlockGeo = new THREE.BoxGeometry(3.2, 0.4, 3.0);
    const lcBlockMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.2 });
    const lcBlock = new THREE.Mesh(lcBlockGeo, lcBlockMat);
    loadCellGroup.add(lcBlock);

    // Removable food-grade stainless collection cup
    const cupGeo = new THREE.CylinderGeometry(1.2, 0.9, 2.2, 32);
    const cupMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.15
    });
    const cup = new THREE.Mesh(cupGeo, cupMat);
    cup.position.y = 1.3;
    loadCellGroup.add(cup);

    // D) LED Status Strip along base front
    const ledGeo = new THREE.BoxGeometry(10, 0.25, 0.2);
    const ledMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x10b981,
      emissiveIntensity: 0.9,
      roughness: 0.2
    });
    const ledStrip = new THREE.Mesh(ledGeo, ledMat);
    ledStrip.position.set(0, 0.6, 5.56);
    machineGroup.add(ledStrip);
    ledStripRef.current = ledStrip;

    // --- 4. Right Side Components ---
    // A) Emergency Button under Transparent Flip Cover
    const emGroup = new THREE.Group();
    emGroup.position.set(6.05, 9.5, 0);
    emGroup.rotation.y = Math.PI / 2;
    machineGroup.add(emGroup);

    // Red push mushroom
    const emBtnGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.6, 32);
    const emBtnMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3, emissive: 0x991b1b, emissiveIntensity: 0.3 });
    const emBtn = new THREE.Mesh(emBtnGeo, emBtnMat);
    emBtn.rotation.x = Math.PI / 2;
    emGroup.add(emBtn);

    // Flip safety cover (transparent acrylic)
    const coverGeo = new THREE.BoxGeometry(2.4, 2.4, 1.2);
    const coverMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      metalness: 0.1
    });
    const flipCover = new THREE.Mesh(coverGeo, coverMat);
    flipCover.position.set(0, 0, 0.6);
    emGroup.add(flipCover);
    emergencyCoverRef.current = emGroup;

    // B) USB-C, AC Connector, Solar Port & Air vents
    const portGeo = new THREE.BoxGeometry(0.1, 0.8, 1.2);
    const portMat = new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.9 });
    const ports = new THREE.Mesh(portGeo, portMat);
    ports.position.set(6.02, 4.5, 1.5);
    machineGroup.add(ports);

    // --- 5. Internal Structure: Carousel (12 Mechanisms) ---
    const carouselGroup = new THREE.Group();
    carouselGroup.position.set(0, 10.5, 0);
    machineGroup.add(carouselGroup);
    carouselGroupRef.current = carouselGroup;

    // Central drive spindle & stepper motor mount
    const spindleGeo = new THREE.CylinderGeometry(1.2, 1.2, 2.5, 32);
    const spindleMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.2 });
    const spindle = new THREE.Mesh(spindleGeo, spindleMat);
    carouselGroup.add(spindle);

    // 12 Cartridge holders arranged in a precision radial carousel
    const numCartridges = 12;
    const radius = 4.2;

    for (let i = 0; i < numCartridges; i++) {
      const angle = (i / numCartridges) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const cartGroup = new THREE.Group();
      cartGroup.position.set(x, 0, z);
      cartGroup.rotation.y = -angle - Math.PI / 2;

      // Cartridge canister (Ambient vs Refrigerated)
      const isRefrig = i >= 8;
      const canisterGeo = new THREE.CylinderGeometry(0.7, 0.7, 2.2, 24);
      const canisterMat = new THREE.MeshStandardMaterial({
        color: isRefrig ? 0x38bdf8 : 0xf1f5f9,
        metalness: isRefrig ? 0.7 : 0.2,
        roughness: 0.3,
        transparent: true,
        opacity: 0.9
      });
      const canister = new THREE.Mesh(canisterGeo, canisterMat);
      cartGroup.add(canister);

      // Cartridge cap / stepper separation gate
      const capGeo = new THREE.CylinderGeometry(0.75, 0.75, 0.3, 24);
      const capMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9 });
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.y = -1.1;
      cartGroup.add(cap);

      carouselGroup.add(cartGroup);
    }

    // --- 6. Lower Refrigerated Chamber (304 Stainless Steel 2-8°C) ---
    const refrigGeo = new THREE.BoxGeometry(9.5, 4.5, 6.5);
    const refrigMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.9,
      roughness: 0.2
    });
    const refrigChamber = new THREE.Mesh(refrigGeo, refrigMat);
    refrigChamber.position.set(0, 3.8, -1.8);
    machineGroup.add(refrigChamber);

    // --- 7. Single-Dose Chute & Optical IR Sensor Gate ---
    // Transparent vertical guide chute
    const chuteGeo = new THREE.CylinderGeometry(0.65, 0.65, 4.5, 24, 1, true);
    const chuteMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
      roughness: 0.1,
      side: THREE.DoubleSide
    });
    const chute = new THREE.Mesh(chuteGeo, chuteMat);
    chute.position.set(0, 6.8, 3.2);
    machineGroup.add(chute);

    // Optical IR Passage Sensor (Emitter & Detector brackets)
    const irBracketMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
    const irEmitter = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), irBracketMat);
    irEmitter.position.set(-0.85, 6.5, 3.2);
    machineGroup.add(irEmitter);

    const irReceiver = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), irBracketMat);
    irReceiver.position.set(0.85, 6.5, 3.2);
    machineGroup.add(irReceiver);

    // Glowing Infrared Passage Beam (Red/Green)
    const beamGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.7, 16);
    const beamMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.8 });
    const irBeam = new THREE.Mesh(beamGeo, beamMat);
    irBeam.rotation.z = Math.PI / 2;
    irBeam.position.set(0, 6.5, 3.2);
    machineGroup.add(irBeam);
    irBeamMeshRef.current = irBeam;

    // --- 8. Simulated Pill / Dose Mesh ---
    const pillGeo = new THREE.SphereGeometry(0.35, 16, 16);
    pillGeo.scale(1.4, 0.8, 0.8);
    const pillMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
    const pillMesh = new THREE.Mesh(pillGeo, pillMat);
    pillMesh.position.set(0, 9.2, 3.2);
    pillMesh.visible = false;
    machineGroup.add(pillMesh);
    pillMeshRef.current = pillMesh;

    // Second pill mesh for multiple dose simulation
    const pill2Mesh = new THREE.Mesh(pillGeo, pillMat);
    pill2Mesh.position.set(0.2, 9.6, 3.2);
    pill2Mesh.visible = false;
    machineGroup.add(pill2Mesh);
    pill2MeshRef.current = pill2Mesh;

    // --- 9. Power & Cooling Bay (Behind & Lower) ---
    // Water Tank for Evaporative Cooling
    const tankGeo = new THREE.BoxGeometry(3.0, 3.2, 2.5);
    const tankMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.6,
      roughness: 0.1
    });
    const tank = new THREE.Mesh(tankGeo, tankMat);
    tank.position.set(-3.8, 3.2, -3.8);
    machineGroup.add(tank);

    // Lithium 12V Battery Pack
    const batteryGeo = new THREE.BoxGeometry(3.2, 2.0, 2.5);
    const batteryMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.4 });
    const battery = new THREE.Mesh(batteryGeo, batteryMat);
    battery.position.set(3.8, 2.6, -3.8);
    machineGroup.add(battery);

    // --- Mouse Orbit & Drag Controls (Vanilla Three.js) ---
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let spherical = new THREE.Spherical(32, Math.PI / 3, Math.PI / 4);

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      spherical.theta -= deltaX * 0.007;
      spherical.phi = Math.max(0.1, Math.min(Math.PI / 2.1, spherical.phi - deltaY * 0.007));

      camera.position.setFromSpherical(spherical);
      camera.lookAt(0, 5, 0);

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      spherical.radius = Math.max(12, Math.min(50, spherical.radius + e.deltaY * 0.03));
      camera.position.setFromSpherical(spherical);
      camera.lookAt(0, 5, 0);
      e.preventDefault();
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElement.addEventListener('wheel', onWheel, { passive: false });

    // --- Animation Loop ---
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Subtle machine float/idle rotation when not dragging
      if (!isDragging && cameraView === 'overview') {
        carouselGroup.rotation.y += 0.002;
      }

      // Update LED status strip color based on system status
      if (ledStripRef.current) {
        const mat = ledStripRef.current.material as THREE.MeshStandardMaterial;
        if (systemState.systemStatus === 'jammed') {
          mat.color.setHex(0xef4444);
          mat.emissive.setHex(0xef4444);
          mat.emissiveIntensity = 0.5 + Math.sin(elapsedTime * 8) * 0.5;
        } else if (systemState.systemStatus === 'warning') {
          mat.color.setHex(0xf59e0b);
          mat.emissive.setHex(0xf59e0b);
        } else if (systemState.activePowerSource === 'solar') {
          mat.color.setHex(0x38bdf8);
          mat.emissive.setHex(0x0284c7);
        } else {
          mat.color.setHex(0x10b981);
          mat.emissive.setHex(0x10b981);
          mat.emissiveIntensity = 0.9;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Handle Resize
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const newW = mountRef.current.clientWidth;
      const newH = mountRef.current.clientHeight || 560;
      cameraRef.current.aspect = newW / newH;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElement.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (mountRef.current && domElement && mountRef.current.contains(domElement)) {
        mountRef.current.removeChild(domElement);
      }
    };
  }, []);

  // Update Casing Transparency
  useEffect(() => {
    if (casingMeshRef.current) {
      const mat = casingMeshRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = casingTransparent ? 0.18 : 0.95;
    }
  }, [casingTransparent]);

  // Camera Presets
  const setPresetView = (view: 'overview' | 'cutaway' | 'sensors' | 'power') => {
    setCameraView(view);
    if (!cameraRef.current) return;

    if (view === 'overview') {
      setCasingTransparent(false);
      cameraRef.current.position.set(16, 14, 22);
      cameraRef.current.lookAt(0, 5, 0);
    } else if (view === 'cutaway') {
      setCasingTransparent(true);
      cameraRef.current.position.set(12, 10, 16);
      cameraRef.current.lookAt(0, 7, 0);
    } else if (view === 'sensors') {
      setCasingTransparent(true);
      cameraRef.current.position.set(0, 5, 9);
      cameraRef.current.lookAt(0, 4.5, 3.5);
    } else if (view === 'power') {
      setCasingTransparent(true);
      cameraRef.current.position.set(-14, 12, -16);
      cameraRef.current.lookAt(0, 5, 0);
    }
  };

  // Run Real-Time 3D Dispense Animation Sequence
  const handleRun3DDispenseAnimation = () => {
    if (animating) return;
    setAnimating(true);
    setStatusMessage('1. محرك التدرج يدور بمقدار الزاوية الدقيقة لمحاذاة الآلية...');

    const pill = pillMeshRef.current;
    const pill2 = pill2MeshRef.current;
    const beam = irBeamMeshRef.current;
    const loadcell = loadCellPlatformRef.current;
    const carousel = carouselGroupRef.current;

    // Reset positions
    if (pill) {
      pill.position.set(0, 9.2, 3.2);
      pill.visible = true;
    }
    if (pill2) {
      pill2.position.set(0.1, 9.6, 3.2);
      pill2.visible = simCondition === 'multiple';
    }
    if (beam) {
      (beam.material as THREE.MeshBasicMaterial).color.setHex(0xef4444);
    }
    setSensorStatus3D({ passage: false, weightMg: 0 });

    // Step 1: Carousel Alignment Rotation
    let startTime = performance.now();
    const targetAngle = ((selectedMechanismId - 1) / 12) * Math.PI * 2;

    const animateRotation = () => {
      const now = performance.now();
      const progress = Math.min(1, (now - startTime) / 600);
      if (carousel) {
        carousel.rotation.y = THREE.MathUtils.lerp(carousel.rotation.y, targetAngle, progress);
      }
      if (progress < 1) {
        requestAnimationFrame(animateRotation);
      } else {
        // Step 2: Separation Gate Opens & Dose drops through chute
        startDropSequence();
      }
    };

    requestAnimationFrame(animateRotation);

    const startDropSequence = () => {
      setStatusMessage('2. آلية الفصل تعزل جرعة واحدة وتطلقها نحو قناة التوجيه...');
      let dropStart = performance.now();

      const animateDrop = () => {
        const now = performance.now();
        const dropProgress = Math.min(1, (now - dropStart) / 800);

        if (simCondition === 'jammed') {
          // Pill gets stuck halfway in chute
          const currentY = THREE.MathUtils.lerp(9.2, 7.2, dropProgress);
          if (pill) pill.position.y = currentY;

          if (dropProgress >= 1) {
            setStatusMessage('⚠️ تنبيه انحشار: الجرعة عالقة في قناة التوجيه! تيار المحرك مرتفع 460mA');
            if (beam) (beam.material as THREE.MeshBasicMaterial).color.setHex(0xef4444);
            onTriggerDispense(selectedMechanismId, 'jammed');
            setAnimating(false);
          } else {
            requestAnimationFrame(animateDrop);
          }
          return;
        }

        if (simCondition === 'no_dispense') {
          // Motor rotates but no pill appears
          if (pill) pill.visible = false;
          setTimeout(() => {
            setStatusMessage('⚠️ فشل خروج الجرعة: لم يرصد الحساس أي مرور، والوزن = 0 مغ');
            onTriggerDispense(selectedMechanismId, 'no_dispense');
            setAnimating(false);
          }, 800);
          return;
        }

        // Normal drop through IR beam to cup
        const currentY = THREE.MathUtils.lerp(9.2, 3.4, dropProgress);
        if (pill) pill.position.y = currentY;
        if (pill2 && simCondition === 'multiple') pill2.position.y = currentY + 0.4;

        // IR passage crossing detection (around Y = 6.5)
        if (currentY <= 6.7 && currentY >= 6.1) {
          if (beam) (beam.material as THREE.MeshBasicMaterial).color.setHex(0x10b981);
          setSensorStatus3D(prev => ({ ...prev, passage: true }));
          setStatusMessage('3. مستشعر المرور البصري IR يؤكد عبور الجرعة (Passage = TRUE)');
        }

        if (dropProgress < 1) {
          requestAnimationFrame(animateDrop);
        } else {
          // Step 3: Pill lands on Load Cell in Cup
          if (loadcell) {
            // Little spring compression bounce
            loadcell.position.y = 1.95;
            setTimeout(() => {
              if (loadcell) loadcell.position.y = 2.0;
            }, 150);
          }

          let measured = currentMech.doseWeightMg;
          if (simCondition === 'undersized') measured = Math.round(measured * 0.65);
          if (simCondition === 'oversized') measured = Math.round(measured * 1.45);
          if (simCondition === 'multiple') measured = Math.round(measured * 2.1);

          setSensorStatus3D({ passage: true, weightMg: measured });

          setStatusMessage(`4. خلية الحمل تقيس وزن الكتلة: ${measured} مغ (المرجعي: ${currentMech.doseWeightMg} مغ)`);
          
          setTimeout(() => {
            onTriggerDispense(selectedMechanismId, simCondition);
            setAnimating(false);
          }, 600);
        }
      };

      requestAnimationFrame(animateDrop);
    };
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      
      {/* Header Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 space-x-reverse text-cyan-400 text-xs font-semibold mb-1">
            <Box className="w-4 h-4" />
            <span>محاكاة Three.js التفاعلية ثلاثية الأبعاد</span>
          </div>
          <h2 className="text-2xl font-black text-white">العرض الثلاثي الأبعاد لنظام رواء (RIWAA 3D Interactive)</h2>
          <p className="text-xs text-slate-400 mt-1">
            محاكاة واقعية لهيكل الجهاز، آليات الصرف الـ12، قناة التوجيه، حزمة الأشعة تحت الحمراء IR، ومنصة خلايا الحمل.
          </p>
        </div>

        {/* Camera View Controls */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'overview', label: 'المنظور العام' },
            { id: 'cutaway', label: 'المقطع الداخلي (Cutaway)' },
            { id: 'sensors', label: 'منطقة الاستشعار المزدوج' },
            { id: 'power', label: 'حجرة الطاقة والتبريد' },
          ].map((v) => (
            <button
              key={v.id}
              onClick={() => setPresetView(v.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                cameraView === v.id
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Canvas Container with Overlays */}
      <div className="relative w-full h-[560px] bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
        
        {/* Three.js Canvas Mount */}
        {webglError ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-slate-900/90 text-slate-300 space-y-4">
            <Box className="w-16 h-16 text-cyan-400 animate-pulse" />
            <div className="max-w-md">
              <h3 className="text-lg font-bold text-white mb-1">محاكاة الهيكل والميكانيكا ثلاثية الأبعاد</h3>
              <p className="text-xs text-slate-400">
                تعمل المحاكاة في بيئة افتراضية تفاعلية. عند تعذر تسريع الرسوميات، تظل كافة آليات الصرف والاستشعار المزدوج ومحاكاة الأخطاء تعمل بدقة في لوحة التحكم وسيناريوهات الأعطال.
              </p>
            </div>
            <button
              onClick={() => { setWebglError(false); window.location.reload(); }}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-2 space-x-reverse"
            >
              <RefreshCw className="w-4 h-4" />
              <span>إعادة تهيئة المحرك الرسومي</span>
            </button>
          </div>
        ) : (
          <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
        )}

        {/* Real-Time 3D HUD: Top Right */}
        <div className="absolute top-4 right-4 bg-slate-900/85 backdrop-blur-md border border-slate-800 rounded-2xl p-4 text-xs text-slate-200 shadow-xl space-y-2 pointer-events-auto">
          <div className="text-[11px] font-bold text-cyan-400 flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span>بيانات القياس اللحظية 3D HUD</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
          </div>

          <div className="flex items-center justify-between space-x-3 space-x-reverse">
            <span className="text-slate-400 flex items-center space-x-1 space-x-reverse">
              <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
              <span>الحجرة المبردة:</span>
            </span>
            <span className="font-bold text-white font-mono">{systemState.refrigeratedTempC.toFixed(1)}°C</span>
          </div>

          <div className="flex items-center justify-between space-x-3 space-x-reverse">
            <span className="text-slate-400 flex items-center space-x-1 space-x-reverse">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>المصدر:</span>
            </span>
            <span className="font-bold text-amber-300 uppercase font-mono">{systemState.activePowerSource}</span>
          </div>

          <div className="flex items-center justify-between space-x-3 space-x-reverse">
            <span className="text-slate-400 flex items-center space-x-1 space-x-reverse">
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>مستشعر المرور IR:</span>
            </span>
            <span className={sensorStatus3D.passage ? 'text-emerald-400 font-bold' : 'text-slate-400 font-mono'}>
              {sensorStatus3D.passage ? 'PASS ✓' : 'BEAM ARMED'}
            </span>
          </div>

          <div className="flex items-center justify-between space-x-3 space-x-reverse">
            <span className="text-slate-400 flex items-center space-x-1 space-x-reverse">
              <Sliders className="w-3.5 h-3.5 text-blue-400" />
              <span>خلية الحمل (وزن):</span>
            </span>
            <span className="font-bold text-cyan-300 font-mono">{sensorStatus3D.weightMg} مغ</span>
          </div>
        </div>

        {/* View Controls: Bottom Left */}
        <div className="absolute bottom-4 left-4 bg-slate-900/85 backdrop-blur-md border border-slate-800 rounded-2xl p-2.5 flex items-center space-x-2 space-x-reverse text-xs pointer-events-auto">
          <button
            onClick={() => setCasingTransparent(!casingTransparent)}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center space-x-1 space-x-reverse ${
              casingTransparent ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{casingTransparent ? 'إظهار الهيكل الخارجي' : 'هيكل شفاف (X-Ray)'}</span>
          </button>
          <span className="text-slate-400 text-[10px] hidden sm:inline px-2">
            💡 اسحب بالماوس للتدوير، وعجلة الماوس للتقريب.
          </span>
        </div>

        {/* Live Step Status Bar: Top Left */}
        <div className="absolute top-4 left-4 max-w-sm bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-3 text-xs text-slate-300 pointer-events-auto shadow-lg">
          <div className="text-[10px] text-slate-400 mb-0.5">مرحلة دورة الصرف الميكانيكي:</div>
          <div className="font-semibold text-white flex items-center space-x-1.5 space-x-reverse">
            {animating && <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />}
            <span>{statusMessage}</span>
          </div>
        </div>

      </div>

      {/* Control Sandbox below the 3D Viewer */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2 space-x-reverse">
            <Play className="w-4 h-4 text-cyan-400" />
            <span>لوحة تحكم مشغل المحاكاة ثلاثية الأبعاد</span>
          </h3>
          <span className="text-xs text-slate-400">
            الآلية المحددة: #{currentMech.id} - {currentMech.name}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {/* Select Mechanism */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">اختر آلية الصرف:</label>
            <select
              value={selectedMechanismId}
              onChange={(e) => onSelectMechanism(Number(e.target.value))}
              disabled={animating}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {mechanisms.map((m) => (
                <option key={m.id} value={m.id}>
                  M#{m.id.toString().padStart(2, '0')} - {m.name} ({m.category === 'refrigerated' ? 'مبرد' : 'عادي'})
                </option>
              ))}
            </select>
          </div>

          {/* Select Condition */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">حالة التجربة والمحاكاة:</label>
            <select
              value={simCondition}
              onChange={(e) => setSimCondition(e.target.value as DispenseCondition)}
              disabled={animating}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="correct">صرف صحيح (Normal Dispense)</option>
              <option value="jammed">انحشار ميكانيكي (Pill Jam in Chute)</option>
              <option value="no_dispense">عدم خروج الجرعة (Vacant)</option>
              <option value="undersized">صرف ناقص (Under-Dose 65%)</option>
              <option value="oversized">صرف زائد (Over-Dose 145%)</option>
              <option value="multiple">صرف متعدد (Multiple 2x Doses)</option>
            </select>
          </div>

          {/* Trigger Button */}
          <div className="flex items-end">
            <button
              onClick={handleRun3DDispenseAnimation}
              disabled={animating}
              className={`w-full py-2.5 rounded-xl font-bold text-xs text-white shadow-lg transition flex items-center justify-center space-x-2 space-x-reverse ${
                animating
                  ? 'bg-slate-700 cursor-not-allowed opacity-75'
                  : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-900/40'
              }`}
            >
              {animating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>محاكاة الحركة ثلاثية الأبعاد جارية...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>بدء حركة الصرف والتحقق في 3D</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
