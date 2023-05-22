"use strict";

const helper = {

    initEmptyScene: function (sceneElements, innitLookingHeight) {

        // Create the 3D scene
        sceneElements.sceneGraph = new THREE.Scene();
        
        // Add camera
        const width = window.innerWidth;
        const height = window.innerHeight;
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 500);
        sceneElements.camera = camera;
        sceneElements.control = new THREE.OrbitControls(camera);
        sceneElements.control.screenSpacePanning = true;

        // Illumination

        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        sceneElements.sceneGraph.add(ambientLight);

        // Add spotlight (with shadows)
        const spotLight = new THREE.SpotLight(0xffffff, 1);
        spotLight.position.set(0, 10, 0);
        sceneElements.sceneGraph.add(spotLight);
        spotLight.castShadow = true;
        spotLight.shadow.mapSize.width = 8182;
        spotLight.shadow.mapSize.height = 8182;
        
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

    generateTowerLevels: function(levelNumber) {

        function probabilityFunction(x) {
            var a = 0.1;           // Initial value
            var b = 0.95;          // Desired upper limit
            var decayFactor = 50;  // Decay factor
          
            var result = a + (b - a) * (1 - Math.exp(-x / decayFactor));
            return result;
        }

        function plataformsFunction(x) {
            var a = 5;           // Initial value
            var b = 300;          // Desired upper limit
            var decayFactor = 120;  // Decay factor
          
            var result = a + (b - a) * (1 - Math.exp(-x / decayFactor));
            return result;
          }

        const level = [];
        const numPlatforms = plataformsFunction(levelNumber);
        const probability = probabilityFunction(levelNumber);

        for (let i = 0; i < numPlatforms; i++) {
            const platform = [];
            const totalParts = 8;
            let xCount = Math.floor(Math.random() * (totalParts - 1)) + 1; // At least one 'O' in each platform
            // console.log(i, xCount)
            for (let j = 0; j < totalParts; j++) {
                let part;
                if (j == xCount) {
                    part = 'O';
                } else {
                    part = Math.random() < probability ? 'X' : 'O';
                }
                platform.push(part);
            }
            level.push(platform);
        }
        // console.log(level)

        for (let j = 0; j < level.length; j++){
            let count = 0;
            for (let k = 0; k < 8; k++){
                if(level[j][k] == "X"){
                    count = count + 1;
                }
            }
            if (count == 8){
                return helper.generateTowerLevels(numLevels);
            }
        }
        return level;
    }
};