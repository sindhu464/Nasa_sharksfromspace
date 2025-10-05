import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- Get HTML Elements ---
    const canvas = document.getElementById('three-canvas');
    const videoPlayer = document.getElementById('video-player');
    const viewButtons = document.querySelectorAll('.view-btn');
    const loaderElement = document.getElementById('loader');

    // --- 3D Scene Setup (remains the same) ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
    directionalLight.position.set(10, 20, 15);
    scene.add(directionalLight);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;

    // --- Model Loading Logic (remains the same) ---
    const loader = new GLTFLoader();
    let currentModel = null;
    function loadModel(modelName) { /* ... same as before ... */ }

    // Paste the full loadModel function from the previous version here
    function loadModel(modelName) {
        if (!modelName) return;
        loaderElement.classList.add('visible');
        if (currentModel) { scene.remove(currentModel); }
        const modelPath = `${modelName}.glb`;
        loader.load(modelPath, (gltf) => {
            currentModel = gltf.scene;
            scene.add(currentModel);
            const bbox = new THREE.Box3().setFromObject(currentModel);
            const center = bbox.getCenter(new THREE.Vector3());
            const size = bbox.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            controls.minDistance = maxDim * 0.5;
            controls.maxDistance = maxDim * 10;
            const fov = camera.fov * (Math.PI / 180);
            const cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
            camera.position.set(center.x, center.y, center.z + cameraZ * 1.5);
            controls.target.copy(center);
            controls.update();
            loaderElement.classList.remove('visible');
        }, undefined, (error) => {
            console.error(`Error loading model: ${modelName}`, error);
            loaderElement.textContent = `Error: Could not load ${modelName}.glb`;
        });
    }

    // --- Event Listeners for Buttons ---
    viewButtons.forEach(button => {
        button.addEventListener('click', () => {
            viewButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const modelName = button.getAttribute('data-model');
            
            if (modelName) {
                // If it's a model button
                videoPlayer.style.display = 'none';
                videoPlayer.pause();
                canvas.style.display = 'block';
                loaderElement.style.display = 'block';
                loadModel(modelName);
            } else {
                // If it's the video button
                canvas.style.display = 'none';
                loaderElement.style.display = 'none';
                videoPlayer.style.display = 'block';
                videoPlayer.play();
                if(currentModel) scene.remove(currentModel); // Unload 3D model to save memory
                currentModel = null;
            }
        });
    });

    // --- Animation Loop ---
    function animate() {
        requestAnimationFrame(animate);
        // Only render if the canvas is visible
        if (canvas.style.display !== 'none') {
            controls.update();
            renderer.render(scene, camera);
        }
    }

    function onResize() { /* ... same as before ... */ }
    // Paste the full onResize function here
    function onResize() {
        const container = document.querySelector('.viewer-container');
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }
    window.addEventListener('resize', onResize);

    // --- Initial Load ---
    onResize();
    loadModel('shark_tag'); // Load the default model
    animate();

});
