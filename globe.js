import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

let animationId = null;

export function initGlobe() {
  const canvas = document.getElementById('hero-globe');
  if (!canvas) return;

  // Prevent double initialization
  if (canvas.dataset.initialized === 'true') return;
  canvas.dataset.initialized = 'true';

  const COLOR_GRID = '#78a9ff';
  const COLOR_NODE = '#78a9ff';
  const COLOR_ARC = '#aa90ff';

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
  camera.position.z = 2.6;

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

  // 1. Wireframe Sphere Base
  const radius = 1;
  const sphereGeo = new THREE.SphereGeometry(radius, 22, 22);
  const wireframeMat = new THREE.MeshBasicMaterial({
    color: COLOR_GRID,
    wireframe: true,
    transparent: true,
    opacity: 0.14
  });
  const sphereMesh = new THREE.Mesh(sphereGeo, wireframeMat);
  globeGroup.add(sphereMesh);

  // 2. Glowing Node Markers at Grid Intersections
  const pos = sphereGeo.attributes.position;
  const nodePositions = [];
  const nodeVectorList = [];
  const totalVertices = pos.count;

  const step = Math.floor(totalVertices / 28);
  for (let i = 0; i < totalVertices; i += step) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const vec = new THREE.Vector3(x, y, z);
    nodeVectorList.push(vec);
    nodePositions.push(x, y, z);
  }

  const nodeGeo = new THREE.BufferGeometry();
  nodeGeo.setAttribute('position', new THREE.Float32BufferAttribute(nodePositions, 3));
  const nodeMat = new THREE.PointsMaterial({
    color: COLOR_NODE,
    size: 0.045,
    transparent: true,
    opacity: 0.4,
    sizeAttenuation: true
  });
  const nodesMesh = new THREE.Points(nodeGeo, nodeMat);
  globeGroup.add(nodesMesh);

  // 3. Connection Arcs Between Nodes
  const arcMat = new THREE.LineBasicMaterial({
    color: COLOR_ARC,
    transparent: true,
    opacity: 0.22
  });

  const arcPairs = [
    [0, 7],
    [4, 14],
    [8, 21],
    [12, 25],
    [18, 27]
  ];

  arcPairs.forEach(([i1, i2]) => {
    if (nodeVectorList[i1] && nodeVectorList[i2]) {
      const v1 = nodeVectorList[i1];
      const v2 = nodeVectorList[i2];
      const mid = new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.5);
      const distance = v1.distanceTo(v2);
      mid.normalize().multiplyScalar(radius + distance * 0.35);

      const curve = new THREE.QuadraticBezierCurve3(v1, mid, v2);
      const points = curve.getPoints(32);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(points);
      const arcLine = new THREE.Line(arcGeo, arcMat);
      globeGroup.add(arcLine);
    }
  });

  // Stop previous animation loop if exists
  if (animationId) {
    cancelAnimationFrame(animationId);
  }

  function animate() {
    // If the canvas is removed from the DOM, stop animating
    if (!document.getElementById('hero-globe')) {
      // Allow re-initialization if the canvas comes back later
      canvas.dataset.initialized = 'false';
      return; 
    }
    animationId = requestAnimationFrame(animate);
    globeGroup.rotation.y += 0.0015;
    globeGroup.rotation.x = 0.12;
    renderer.render(scene, camera);
  }
  animate();
}
