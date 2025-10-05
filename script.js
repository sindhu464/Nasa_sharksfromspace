import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Water } from 'three/addons/objects/Water.js';
import { Sky } from 'three/addons/objects/Sky.js';

// We removed GLTFLoader as we will create the fin ourselves

let scene, camera, renderer;
let water, sun, sky;
let controls;
let sharkFin; // Renamed variable for clarity
let sharkSpeed = 0.05; 
let sharkPathRadius = 150;
let sharkPathAngle = 0;

init();
animate();

function init() {
    // ## 1. Scene and Renderer Setup ##
    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.5;
    document.body.appendChild(renderer.domElement);

    // ## 2. Camera Setup ##
    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 20000);
    camera.position.set(30, 30, 100);

    // ## 3. Sun and Sky ## ☀️
    sun = new THREE.Vector3();

    sky = new Sky();
    sky.scale.setScalar(10000);
    scene.add(sky);

    const skyUniforms = sky.material.uniforms;
    skyUniforms['turbidity'].value = 10;
    skyUniforms['rayleigh'].value = 2;
    skyUniforms['mieCoefficient'].value = 0.005;
    skyUniforms['mieDirectionalG'].value = 0.8;

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const phi = THREE.MathUtils.degToRad(88);
    const theta = THREE.MathUtils.degToRad(180);
    sun.setFromSphericalCoords(1, phi, theta);
    sky.material.uniforms['sunPosition'].value.copy(sun);
    scene.environment = pmremGenerator.fromScene(sky).texture;

    // ## 4. Creating the Water ## 🌊
    const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
    
    water = new Water(
        waterGeometry,
        {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/waternormals.jpg', function (texture) {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            }),
            sunDirection: new THREE.Vector3(),
            sunColor: 0xffffff,
            waterColor: 0x001e0f,
            distortionScale: 3.7,
            fog: scene.fog !== undefined
        }
    );

    water.rotation.x = -Math.PI / 2;
    scene.add(water);

    // ## 5. Creating the Shark Fin ## 🦈
    // We create a custom shape for the fin
    const finShape = new THREE.Shape();
    finShape.moveTo(0, 0); // Base-back of the fin
    finShape.lineTo(-8, 0); // Base-front
    finShape.lineTo(0, 10); // Tip of the fin
    finShape.closePath(); // Connects tip to the base-back

    // Give the 2D shape some thickness
    const extrudeSettings = {
        steps: 2,
        depth: 1, // How thick the fin is
        bevelEnabled: false,
    };

    const finGeometry = new THREE.ExtrudeGeometry(finShape, extrudeSettings);
    // A dark, slightly rough material looks best
    const finMaterial = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.8 }); // <<< COLOR CHANGED HERE

    sharkFin = new THREE.Mesh(finGeometry, finMaterial);
    sharkFin.position.set(sharkPathRadius, 0, 0); // Initial position
    scene.add(sharkFin);

    // ## 6. User Controls ##
    controls = new OrbitControls(camera, renderer.domElement);
    controls.maxPolarAngle = Math.PI * 0.495;
    controls.target.set(0, 10, 0);
    controls.minDistance = 40.0;
    controls.maxDistance = 300.0; // Increased max distance to see it from further away
    controls.update();

    // ## 7. Event Listener for Window Resizing ##
    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    // Animate the fin if it's been created
    if (sharkFin) {
        sharkPathAngle += sharkSpeed * 0.01;

        // Calculate new position in a circle
        const x = Math.cos(sharkPathAngle) * sharkPathRadius;
        const z = Math.sin(sharkPathAngle) * sharkPathRadius;
        
        // Make it bob up and down very slightly on the water surface
        const y = Math.sin(sharkPathAngle * 4) * 0.3; 

        // Calculate a point slightly ahead for the fin to look at
        const lookAtX = Math.cos(sharkPathAngle + 0.05) * sharkPathRadius;
        const lookAtZ = Math.sin(sharkPathAngle + 0.05) * sharkPathRadius;
        // Make the fin point towards its direction of movement
        sharkFin.lookAt(lookAtX, y, lookAtZ); 

        sharkFin.position.set(x, y, z); // Apply the new position
    }

    render();
}

function render() {
    // Animate the water
    water.material.uniforms['time'].value += 1.0 / 60.0;
    renderer.render(scene, camera);
}