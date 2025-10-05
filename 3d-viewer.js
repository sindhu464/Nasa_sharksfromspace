import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. SETUP & PARAMETERS ---
    const urlParams = new URLSearchParams(window.location.search);
    const modelId = urlParams.get('model') || 'great_white';
    const animalName = urlParams.get('name') || 'Unknown Subject';

    // --- 2. DATA GENERATION ENGINE ---
    // Creates unique, deterministic data based on the animal's name
    const generateData = (name, model) => {
        const seed = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const random = (min, max) => (seed % (max - min)) + min;

        let species, length, weight, age;
        if (model.includes('white')) {
            species = 'Great White Shark';
            length = `${random(4, 6)} - ${random(6, 7)}m`;
            weight = `${random(800, 1000)} - ${random(1000, 1200)}kg`;
            age = `~${random(25, 40)} years`;
        } else if (model.includes('tiger')) {
            species = 'Tiger Shark';
            length = `${random(3, 4)} - ${random(4, 5)}m`;
            weight = `${random(400, 500)} - ${random(500, 650)}kg`;
            age = `~${random(12, 20)} years`;
        } else if (model.includes('blue_whale')) {
            species = 'Blue Whale';
            length = `${random(23, 25)} - ${random(25, 28)}m`;
            weight = `${random(100000, 120000)} - ${random(120000, 150000)}kg`;
            age = `~${random(70, 90)} years`;
        }

        const headings = ['North', 'East', 'South', 'West', 'Northeast', 'Southwest'];
        const statuses = ['Cruising', 'Foraging', 'Resting', 'Migrating'];
        
        const isEating = random(0, 10) > 7;

        return {
            vitals: { species, length, weight, age },
            log: {
                heading: headings[random(0, headings.length)],
                status: statuses[random(0, statuses.length)],
                eating: isEating ? 'YES' : 'NO',
                eatingClass: isEating ? 'yes' : 'no',
                lastMeal: `${random(2, 24)} hours ago`
            },
            system: {
                tagSignal: random(75, 100)
            },
            env: {
                depth: random(40, 200),
                temp: random(18, 26),
                salinity: random(33, 36)
            }
        };
    };

    // --- 3. UI POPULATION ---
    const data = generateData(animalName, modelId);

    document.getElementById('top-panel-title').textContent = `${animalName.toUpperCase()} DATA MONITORING`;
    document.getElementById('env-depth').textContent = data.env.depth;
    document.getElementById('env-temp').textContent = data.env.temp;
    document.getElementById('env-salinity').textContent = data.env.salinity;

    document.getElementById('vitals-species').textContent = data.vitals.species;
    document.getElementById('vitals-length').textContent = data.vitals.length;
    document.getElementById('vitals-weight').textContent = data.vitals.weight;
    document.getElementById('vitals-age').textContent = data.vitals.age;

    document.getElementById('log-heading').textContent = data.log.heading;
    document.getElementById('log-status').textContent = data.log.status;
    const eatingSpan = document.getElementById('log-eating');
    eatingSpan.textContent = data.log.eating;
    eatingSpan.className = data.log.eatingClass;
    document.getElementById('log-last-meal').textContent = data.log.lastMeal;

    const signalBar = document.getElementById('tag-signal-bar');
    setTimeout(() => { signalBar.style.width = `${data.system.tagSignal}%`; }, 1000);

    // --- 4. THREE.JS SCENE SETUP ---
    const canvas = document.getElementById('three-canvas');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const ambientLight = new THREE.AmbientLight(0xadd8e6, 1.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
    directionalLight.position.set(10, 20, 5);
    scene.add(directionalLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    const loader = new GLTFLoader();
    loader.load(
        // CORRECTED PATH: Removed "models/" prefix to load from the root directory.
        `${modelId}.glb`,
        
        (gltf) => {
            const model = gltf.scene;
            scene.add(model);

            const bbox = new THREE.Box3().setFromObject(model);
            const center = bbox.getCenter(new THREE.Vector3());
            const size = bbox.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);

            controls.minDistance = maxDim * 0.75;
            controls.maxDistance = maxDim * 10;

            const fov = camera.fov * (Math.PI / 180);
            const cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
            
            camera.position.set(center.x, center.y, center.z + cameraZ * 2.0);
            controls.target.copy(center);
            controls.update();
        },
        undefined,
        (error) => {
            // UPDATED ERROR MESSAGE: This is more helpful for the current setup.
            const errorPanel = document.querySelector('.top-panel');
            errorPanel.innerHTML = `<h1>Error Loading 3D Model</h1><p>Ensure '${modelId}.glb' exists in the main project directory.</p>`;
        }
    );

    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        
        // Subtle camera movement with mouse
        camera.position.x += (mouseX * 0.1 - camera.position.x) * 0.02;
        camera.position.y += (mouseY * 0.1 - camera.position.y) * 0.02;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
});
