"use strict";

const helper = {

    initEmptyScene: function (sceneElements) {

        // Create the 3D scene
        sceneElements.sceneGraph = new THREE.Scene();
        

        // Add camera
        const width = window.innerWidth;
        const height = window.innerHeight;
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 500);
        sceneElements.camera = camera;
        camera.position.set(2, 4, 2);
        camera.lookAt(0, 8, 0);
        sceneElements.control = new THREE.OrbitControls(camera);
        sceneElements.control.target.set( 0,2,0 );
        sceneElements.control.screenSpacePanning = true;

        // Illumination

        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        sceneElements.sceneGraph.add(ambientLight);

        // Add spotlight (with shadows)
        const spotLight = new THREE.SpotLight(0xffffff, 1);
        spotLight.position.set(2, 4, 4);
        sceneElements.sceneGraph.add(spotLight);
        spotLight.castShadow = true;
        spotLight.shadow.mapSize.width = 2048;
        spotLight.shadow.mapSize.height = 2048;
        
        // Create renderer (with shadow map)
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        sceneElements.renderer = renderer;
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(0xffffff, 1.0);
        renderer.setSize(width, height);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Add the rendered image in the HTML DOM
        const htmlElement = document.querySelector("#Tag3DScene");
        htmlElement.appendChild(renderer.domElement);
    },

    render: function render(sceneElements) {
        sceneElements.renderer.render(sceneElements.sceneGraph, sceneElements.camera);
    },
};