import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'lil-gui';
import { Color, Vector3 } from 'three';

// We have let vite load the asset and bundle it for us, as /src doesn't exist in the final build
import texture8 from "./assets/textures/particles/8.png";
import texture4 from "./assets/textures/particles/4.png";

console.log("texture8", texture8);


/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene({});
scene.background = new THREE.Color('#031718');

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
const starsTexture = textureLoader.load(texture8);
const galaxyTexture = textureLoader.load(texture4);

//============================================
// Test Cube
//============================================

const cube = new THREE.Mesh(
  new THREE.BoxGeometry(2.1, 1, 1),
  new THREE.MeshBasicMaterial({
    color: 'white',
  })
);

// scene.add(cube);

//============================================
// Galaxy Generator
//============================================

//-------------
// parameters
//-------------

const parameters = {};

parameters.fov = 50;
parameters.cameraX = 5.771607000682601;
parameters.cameraY = 5.599076684299562;
parameters.cameraZ = -6.1975053732192;

parameters.count = 1000000;
parameters.size = 0.016;
parameters.sizeAttenuation = true;
parameters.radius = 11.4;
parameters.branches = 6;
parameters.spin = 0.58;
parameters.randomness = 0.83;
parameters.minRandomness = 0.45;
parameters.scatter = 2;
parameters.insideColor = '#ad4a14';
parameters.outsideColor = '#124173';

//-------------------------------------------

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  parameters.fov,
  sizes.width / sizes.height,
  0.1,
  100
);

const updateCamera = () => {
  // console.log('=========> update camera called ');

  camera.fov = parameters.fov;
  // camera.position.set(
  //   parameters.cameraX,
  //   parameters.cameraY,
  //   parameters.cameraZ
  // );

  // Update controls
  controls.update();
  camera.updateProjectionMatrix();
};

//-------------------------------------------

let geometry = null;
let positions = null;
let colors = null;
let material = null;
let particles = null;

const generateGalaxy = () => {
  // remove the old galaxies first
  if (geometry) {
    // dispose an object from memory
    geometry.dispose();
    material.dispose();
    scene.remove(particles);
  }

  geometry = new THREE.BufferGeometry();

  //-------------
  // setup particle positions
  //-------------

  positions = new Float32Array(parameters.count * 3);
  colors = new Float32Array(parameters.count * 3);

  for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3;

    const radius = Math.random() * parameters.radius;

    // [0 - branches] repeated to loop over branches
    const fullCircle = Math.PI * 2;
    const fraction = (i % parameters.branches) / parameters.branches; // [0-1]
    const branchAngel = fraction * fullCircle;

    const spinAngel = radius * parameters.spin;

    const inverseRadius =
      (radius / parameters.radius - 1) * -1 + parameters.minRandomness;

    // multiply by radius to randomize more as we go from the center
    const randomX =
      Math.pow(
        Math.random() * parameters.randomness * inverseRadius,
        parameters.scatter
      ) * (Math.random() < 0.5 ? 1 : -1);
    const randomY =
      Math.pow(
        Math.random() * parameters.randomness * inverseRadius,
        parameters.scatter
      ) * (Math.random() < 0.8 ? 1 : -1);
    const randomZ =
      Math.pow(
        Math.random() * parameters.randomness * inverseRadius,
        parameters.scatter
      ) * (Math.random() < 0.2 ? 1 : -1);

    positions[i3] = radius * Math.cos(branchAngel + spinAngel) + randomX;
    positions[i3 + 1] = 0 + randomY;
    positions[i3 + 2] = radius * Math.sin(branchAngel + spinAngel) + randomZ;

    // colors
    const insideColor = new THREE.Color(parameters.insideColor);
    const outsideColor = new THREE.Color(parameters.outsideColor);

    const mixedColor = insideColor.clone();
    mixedColor.lerp(outsideColor, radius / parameters.radius);

    colors[i3 + 0] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  //-------------
  // setup particle materials
  //-------------
  material = new THREE.PointsMaterial({
    size: parameters.size,
    sizeAttenuation: parameters.sizeAttenuation,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    map: galaxyTexture,
    alphaMap: galaxyTexture,
  });

  //-------------
  // add points to scene
  //-------------

  particles = new THREE.Points(geometry, material);

  scene.add(particles);
};

//=============================================================
//
// generate starts
//
//=============================================================

//-------------
// stars parameters

parameters.starsCount = 10000;
parameters.starsSize = 0.447;
parameters.starsRadius = 145.9;
parameters.starsSizeAttenuation = true;
parameters.starsInsideColor = '#EDFFFF';
parameters.starsOutsideColor = '#124173';

let starsGeometry = null;
let startsPositions = null;
let startsColors = null;
let startsMaterial = null;
let startsParticles = null;

const generateStars = () => {
  if (starsGeometry) {
    starsGeometry.dispose();
    startsMaterial.dispose();
    scene.remove(startsParticles);
  }

  starsGeometry = new THREE.BufferGeometry();

  //-------------------------
  // setup particles array

  startsPositions = new Float32Array(parameters.starsCount * 3);
  startsColors = new Float32Array(parameters.starsCount * 3);

  for (let i = 0; i < parameters.starsCount; i++) {
    const i3 = i * 3;

    startsPositions[i3] = (Math.random() - 0.5) * parameters.starsRadius;
    startsPositions[i3 + 1] = (Math.random() - 0.5) * parameters.starsRadius;
    startsPositions[i3 + 2] = (Math.random() - 0.5) * parameters.starsRadius;

    // colors
    const insideColor = new THREE.Color(parameters.starsInsideColor);
    const outsideColor = new THREE.Color(parameters.starsOutsideColor);

    const mixedColor = insideColor.clone();
    mixedColor.lerp(
      outsideColor,
      startsPositions[i3 + 1] / parameters.starsRadius
    );

    startsColors[i3 + 0] = mixedColor.r;
    startsColors[i3 + 1] = mixedColor.g;
    startsColors[i3 + 2] = mixedColor.b;
  }

  starsGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(startsPositions, 3)
  );
  starsGeometry.setAttribute(
    'color',
    new THREE.BufferAttribute(startsColors, 3)
  );

  //-------------
  // setup particle materials

  startsMaterial = new THREE.PointsMaterial({
    size: parameters.starsSize,
    sizeAttenuation: parameters.starsSizeAttenuation,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    map: starsTexture,
    alphaMap: starsTexture,
  });

  //-------------
  // add points to scene

  startsParticles = new THREE.Points(starsGeometry, startsMaterial);
  scene.add(startsParticles);
};

generateGalaxy();
generateStars();

//============================================
// GUI
//============================================

gui.add(parameters, 'fov').min(1).max(200).step(1).onChange(updateCamera);
gui
  .add(parameters, 'cameraX')
  .min(-20)
  .max(20)
  .step(0.001)
  .onChange(updateCamera);
gui
  .add(parameters, 'cameraY')
  .min(-20)
  .max(20)
  .step(0.001)
  .onChange(updateCamera);
gui
  .add(parameters, 'cameraZ')
  .min(-20)
  .max(20)
  .step(0.001)
  .onChange(updateCamera);

gui
  .add(parameters, 'count')
  .min(100)
  .max(1000000)
  .step(100)
  .onFinishChange(generateGalaxy);

gui
  .add(parameters, 'size')
  .min(0.001)
  .max(0.1)
  .step(0.001)
  .onFinishChange(generateGalaxy);

gui
  .add(parameters, 'radius')
  .min(0.1)
  .max(20)
  .step(0.1)
  .onFinishChange(generateGalaxy);

gui
  .add(parameters, 'branches')
  .min(3)
  .max(10)
  .step(1)
  .onFinishChange(generateGalaxy);

gui
  .add(parameters, 'spin')
  .min(-5)
  .max(5)
  .step(0.01)
  .onFinishChange(generateGalaxy);

gui
  .add(parameters, 'randomness')
  .min(0.01)
  .max(1)
  .step(0.01)
  .onFinishChange(generateGalaxy);

gui
  .add(parameters, 'minRandomness')
  .min(0.01)
  .max(1)
  .step(0.01)
  .onFinishChange(generateGalaxy);

gui
  .add(parameters, 'scatter')
  .min(1)
  .max(10)
  .step(0.01)
  .onFinishChange(generateGalaxy);

gui.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy);
gui.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy);

//------------------------

gui
  .add(parameters, 'starsCount')
  .min(100)
  .max(1000000)
  .step(100)
  .onFinishChange(generateStars);

gui
  .add(parameters, 'starsSize')
  .min(0.001)
  .max(1)
  .step(0.001)
  .onFinishChange(generateStars);

gui.add(parameters, 'starsSizeAttenuation').onFinishChange(generateStars);

gui
  .add(parameters, 'starsRadius')
  .min(0.1)
  .max(200)
  .step(0.1)
  .onFinishChange(generateStars);

gui.addColor(parameters, 'starsInsideColor').onFinishChange(generateStars);
gui.addColor(parameters, 'starsOutsideColor').onFinishChange(generateStars);

//---------------------------------------------------

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

camera.zoom = 0.4;
camera.position.set(parameters.cameraX, parameters.cameraY, parameters.cameraZ);
camera.rotateX(-2.2076337733580824);
camera.rotateY(0.5099745639989409);
camera.rotateZ(2.558226355119806);

// camera.up.set(0, 0, 1);
// camera.rotation.set(Math.PI / -2, 0, 0);

scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.addEventListener('change', (e) => {
  // console.log('the camera changed', camera.position, camera.rotation);
});

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  updateCamera();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
