import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import earthMaskUrl from './earth-mask.png';

let animationId = null;

export function initGlobe() {
  const canvas = document.getElementById('hero-globe');
  if (!canvas) return;

  if (canvas.dataset.initialized === 'true') return;
  canvas.dataset.initialized = 'true';

  let isVisible = true;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isVisible = entry.isIntersecting;
    });
  }, { threshold: 0 });
  observer.observe(canvas);

  const COLOR_CONTINENT = '#475569'; 
  const COLOR_NODE = '#38BDF8';
  const COLOR_ARC = '#2563EB';
  const COLOR_PULSE = '#F8FAFC';
  const COLOR_GLOW = '#2563EB';

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
  camera.position.z = 2.9;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  function resize() {
    const width = canvas.clientWidth || 300;
    const height = canvas.clientHeight || 300;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }
  resize();
  window.addEventListener('resize', resize);

  const globeGroup = new THREE.Group();
  scene.add(globeGroup);

  // 1. Load Earth Mask and generate continents
  const img = new Image();
  img.crossOrigin = "Anonymous";
  img.src = earthMaskUrl;
  img.onload = () => {
    const imgCanvas = document.createElement('canvas');
    imgCanvas.width = img.width;
    imgCanvas.height = img.height;
    const ctx = imgCanvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0);
    const imgData = ctx.getImageData(0, 0, img.width, img.height).data;

    const radius = 1;
    const numPoints = 65000;
    const positions = [];
    const validPoints = [];
    
    for (let i = 0; i < numPoints; i++) {
      const phi = Math.acos(-1 + (2 * i) / numPoints);
      const theta = Math.sqrt(numPoints * Math.PI) * phi;
      
      const u = theta / (2 * Math.PI);
      const v = phi / Math.PI;
      
      let ux = u % 1.0;
      if (ux < 0) ux += 1.0;
      let vx = v;
      
      const px = Math.floor(ux * img.width);
      const py = Math.floor(vx * img.height);
      const idx = (py * img.width + px) * 4;
      
      if (imgData[idx] < 128) {
        const x = radius * Math.cos(theta) * Math.sin(phi);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(theta) * Math.sin(phi);
        positions.push(x, y, z);
        validPoints.push(new THREE.Vector3(x, y, z));
      }
    }

    const dotGeo = new THREE.BufferGeometry();
    dotGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const dotMat = new THREE.PointsMaterial({
      color: new THREE.Color(COLOR_CONTINENT),
      size: 0.015,
      transparent: true,
      opacity: 1.0,
      sizeAttenuation: true
    });
    const continentMesh = new THREE.Points(dotGeo, dotMat);
    globeGroup.add(continentMesh);

    setupNetwork(validPoints);
  };
  
  // Base sphere for dark oceans
  const oceanGeo = new THREE.SphereGeometry(0.99, 32, 32);
  const oceanMat = new THREE.MeshBasicMaterial({
    color: 0x0F172A,
    transparent: true,
    opacity: 0.85
  });
  const oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
  globeGroup.add(oceanMesh);

  // 2. Atmospheric Fresnel Glow
  const glowGeo = new THREE.SphereGeometry(1.08, 32, 32);
  const glowMaterial = new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(COLOR_GLOW) }
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPositionNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPositionNormal = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      varying vec3 vNormal;
      varying vec3 vPositionNormal;
      void main() {
        float intensity = pow(0.65 - dot(vNormal, vPositionNormal), 4.0);
        gl_FragColor = vec4(color, 1.0 * intensity);
      }
    `,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false
  });
  const glowMesh = new THREE.Mesh(glowGeo, glowMaterial);
  scene.add(glowMesh); 

  // 3. Base Surface Network Variables
  let surfacePulses = [];
  
  function setupNetwork(landPoints) {
    if(landPoints.length < 20) return;
    
    const surfaceNodes = [];
    for(let i=0; i<120; i++) {
      surfaceNodes.push(landPoints[Math.floor(Math.random() * landPoints.length)]);
    }

    const nodePos = [];
    surfaceNodes.forEach(p => nodePos.push(p.x, p.y, p.z));
    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute('position', new THREE.Float32BufferAttribute(nodePos, 3));
    const nodeMat = new THREE.PointsMaterial({ color: COLOR_NODE, size: 0.04, transparent: true, opacity: 0.9 });
    const nodesMesh = new THREE.Points(nodeGeo, nodeMat);
    globeGroup.add(nodesMesh);

    const arcsGroup = new THREE.Group();
    for(let i=0; i<80; i++) {
      const startNode = surfaceNodes[Math.floor(Math.random() * surfaceNodes.length)];
      const endNode = surfaceNodes[Math.floor(Math.random() * surfaceNodes.length)];
      if(startNode === endNode) continue;
      const dist = startNode.distanceTo(endNode);
      if(dist > 1.6) continue;

      const mid = startNode.clone().lerp(endNode, 0.5);
      mid.normalize().multiplyScalar(1 + dist * 0.25);

      const curve = new THREE.QuadraticBezierCurve3(startNode, mid, endNode);
      const curvePoints = curve.getPoints(30);
      const curveGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
      const curveMat = new THREE.LineBasicMaterial({ color: COLOR_ARC, transparent: true, opacity: 0.4, linewidth: 1 });
      arcsGroup.add(new THREE.Line(curveGeo, curveMat));

      const pulseGeo = new THREE.BufferGeometry().setFromPoints([startNode]);
      const pulseMat = new THREE.PointsMaterial({ color: COLOR_PULSE, size: 0.06, transparent: true, opacity: 0.95 });
      const pulsePoint = new THREE.Points(pulseGeo, pulseMat);
      arcsGroup.add(pulsePoint);

      surfacePulses.push({
        curve,
        mesh: pulsePoint,
        progress: Math.random(),
        speed: 0.15 + Math.random() * 0.2
      });
    }
    globeGroup.add(arcsGroup);
  }

  // 4. Periodic Animation Timeline Variables (6-second cycle)
  const EVENT_CYCLE = 6.0; 
  let cycleTimer = 0;
  
  const T_RAY_START = 0.0;
  const T_RAY_END = 1.0;
  const T_RING_DRAW_START = 1.0;
  const T_RING_DRAW_END = 1.8;
  const T_RING_FADE_START = 3.2;
  const T_RING_FADE_END = 4.0;

  // --- A. The Outer Ring ---
  const ringGroup = new THREE.Group();
  scene.add(ringGroup);
  // No tilt — keep it perfectly flat to the camera (XY plane) so it traces a perfect circular silhouette
  ringGroup.rotation.set(0, 0, 0);
  
  const RING_RADIUS = 1.12;
  const RING_SEGMENTS = 64;
  const ringPoints = [];
  
  // Creates a circle in the XY plane. Index 0 is at (R, 0, 0), which natively sits 
  // exactly on the right-hand edge where the rays will strike!
  for (let i = 0; i <= RING_SEGMENTS; i++) {
     const theta = (i / RING_SEGMENTS) * Math.PI * 2;
     ringPoints.push(new THREE.Vector3(Math.cos(theta) * RING_RADIUS, Math.sin(theta) * RING_RADIUS, 0));
  }
  const ringGeo = new THREE.BufferGeometry().setFromPoints(ringPoints);
  const ringMat = new THREE.LineBasicMaterial({ color: COLOR_ARC, transparent: true, opacity: 0, linewidth: 1.5 });
  const ringLine = new THREE.Line(ringGeo, ringMat);
  ringGroup.add(ringLine);
  ringGeo.setDrawRange(0, 0); // Hide completely to start

  // --- B. The Incoming Rays ---
  let rays = [];
  const raysGroup = new THREE.Group();
  scene.add(raysGroup);

  function triggerRays() {
      // Clean up previous rays
      while(raysGroup.children.length > 0) {
          raysGroup.remove(raysGroup.children[0]);
      }
      rays = [];
      
      const numRays = 5 + Math.floor(Math.random() * 6); // 5 to 10 rays
      
      for(let i=0; i<numRays; i++) {
          const spawnDelay = Math.random() * 0.15; // 0 to 150ms stagger
          
          // Spawn at the right edge of a typical viewport (x ~ 2.5 to 3.2)
          // Previously this was 5.0, which was too far off-screen and caused rays to be missed
          const startX = 2.5 + Math.random() * 0.7;
          // Keep vertical scatter within the visible height of the canvas (y ~ -1.2 to 1.2)
          const startY = (Math.random() - 0.5) * 2.2; 
          const startZ = -0.5 + Math.random() * 1.0;
          
          // Target hits the right hemisphere of the ring
          const targetAngle = (Math.random() - 0.5) * (Math.PI * 0.6); // -PI/3 to PI/3
          const endX = RING_RADIUS * Math.cos(targetAngle); 
          const endY = RING_RADIUS * Math.sin(targetAngle);
          const endZ = 0; // Ring is flat on XY plane
          
          const rayGeo = new THREE.BufferGeometry();
          const positions = new Float32Array(2 * 3);
          const colors = new Float32Array(2 * 3);
          
          const headC = new THREE.Color(COLOR_ARC);
          const tailC = new THREE.Color(0x000000); // Fades out with additive blending
          
          colors[0] = tailC.r; colors[1] = tailC.g; colors[2] = tailC.b; // Tail end
          colors[3] = headC.r; colors[4] = headC.g; colors[5] = headC.b; // Head end
          
          rayGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
          rayGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
          
          const rayMat = new THREE.LineBasicMaterial({
              vertexColors: true, 
              blending: THREE.AdditiveBlending, 
              transparent: true, 
              opacity: 0.85, 
              linewidth: 2
          });
          const rayLine = new THREE.Line(rayGeo, rayMat);
          rayLine.frustumCulled = false; // Prevent premature culling while traversing
          raysGroup.add(rayLine);
          
          rays.push({
              mesh: rayLine,
              startX: startX, endX: endX, 
              startY: startY, endY: endY, 
              startZ: startZ, endZ: endZ,
              delay: spawnDelay,
              progress: 0,
              speed: 1.0 / (0.7 + Math.random() * 0.3) // Duration: 0.7s - 1.0s
          });
      }
  }

  // Seed the first burst immediately
  triggerRays();

  if (animationId) {
    cancelAnimationFrame(animationId);
  }

  let lastTime = 0;

  function animate(time) {
    if (!document.getElementById('hero-globe')) {
      canvas.dataset.initialized = 'false';
      return; 
    }
    animationId = requestAnimationFrame(animate);

    if (!lastTime) lastTime = time;
    const dt = (time - lastTime) / 1000;
    lastTime = time;

    if (!isVisible) return;
    if (dt > 0.1) return;

    // Constantly rotate the background globe layer
    globeGroup.rotation.y += 0.0015;
    globeGroup.rotation.x = 0.12;

    // Timeline Processing
    cycleTimer += dt;
    if (cycleTimer >= EVENT_CYCLE) {
        cycleTimer = cycleTimer % EVENT_CYCLE;
        triggerRays();
    }

    // Phase 1: Incoming Rays travel and converge (0.0s to ~1.0s)
    rays.forEach(ray => {
        if (cycleTimer >= ray.delay && ray.progress < 1.0) {
            ray.progress += ray.speed * dt;
            if (ray.progress > 1.0) ray.progress = 1.0;
            
            // Quadratic ease-out for natural deceleration
            const t = ray.progress;
            const ease = t * (2 - t);
            
            const headX = ray.startX + (ray.endX - ray.startX) * ease;
            const headY = ray.startY + (ray.endY - ray.startY) * ease;
            const headZ = ray.startZ + (ray.endZ - ray.startZ) * ease;
            
            // Tail drags slightly behind
            const tailT = Math.max(0, ray.progress - 0.15);
            const tailEase = tailT * (2 - tailT);
            
            const tailX = ray.startX + (ray.endX - ray.startX) * tailEase;
            const tailY = ray.startY + (ray.endY - ray.startY) * tailEase;
            const tailZ = ray.startZ + (ray.endZ - ray.startZ) * tailEase;
            
            const posAttr = ray.mesh.geometry.attributes.position;
            posAttr.setXYZ(0, tailX, tailY, tailZ);
            posAttr.setXYZ(1, headX, headY, headZ);
            posAttr.needsUpdate = true;
            ray.mesh.visible = true;
        } else {
            ray.mesh.visible = false;
        }
    });

    // Phase 2-4: Ring Drawing, Holding, and Fading
    if (cycleTimer >= T_RING_DRAW_START && cycleTimer < T_RING_DRAW_END) {
        // Draw-on animation
        const p = (cycleTimer - T_RING_DRAW_START) / (T_RING_DRAW_END - T_RING_DRAW_START);
        const easeOut = p * (2 - p);
        const count = Math.floor(easeOut * RING_SEGMENTS);
        ringGeo.setDrawRange(0, count + 1);
        ringMat.opacity = 0.35;
    } else if (cycleTimer >= T_RING_DRAW_END && cycleTimer < T_RING_FADE_START) {
        // Full hold
        ringGeo.setDrawRange(0, RING_SEGMENTS + 1);
        ringMat.opacity = 0.35;
    } else if (cycleTimer >= T_RING_FADE_START && cycleTimer < T_RING_FADE_END) {
        // Smooth fade out
        const p = (cycleTimer - T_RING_FADE_START) / (T_RING_FADE_END - T_RING_FADE_START);
        ringGeo.setDrawRange(0, RING_SEGMENTS + 1);
        ringMat.opacity = 0.35 * (1 - p); // eases down to 0
    } else {
        // Hidden / waiting state for remaining 2 seconds
        ringGeo.setDrawRange(0, 0); 
        ringMat.opacity = 0;
    }

    // Update surface network internal pulses
    surfacePulses.forEach(p => {
      p.progress += p.speed * dt;
      if(p.progress >= 1.0) p.progress = 0;
      const pt = p.curve.getPoint(p.progress);
      p.mesh.geometry.attributes.position.setXYZ(0, pt.x, pt.y, pt.z);
      p.mesh.geometry.attributes.position.needsUpdate = true;
    });

    renderer.render(scene, camera);
  }

  animationId = requestAnimationFrame(animate);
}
