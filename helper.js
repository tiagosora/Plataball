"use strict";

const helper = {

    initEmptyScene: function (sceneElements) {

        // Create the 3D scene
        sceneElements.sceneGraph = new THREE.Scene();
        let a = new THREE.Scene();
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

    setBlackGround: function() {

        let starGeo = new THREE.Geometry();

        for(let i = 0; i < 6000; i++) {
            let star = new THREE.Vector3(
                Math.random() * 600 - 300,
                Math.random() * 600 - 300,
                Math.random() * 600 - 300
            );
            star.velocity = 0;
            star.acceleration = 0.02;
            starGeo.vertices.push(star);
        }
  
        let sprite = new THREE.TextureLoader().load( 'https://i.imgur.com/oZpF1YZ.png' );
        let starMaterial = new THREE.PointsMaterial({
          color: 0xaaaaaa,
          size: 0.7,
          map: sprite
        });

        let stars = new THREE.Points(starGeo,starMaterial);
        sceneElements.sceneGraph.background = new THREE.Color(0x000000);
        sceneElements.sceneGraph.add(stars);
    },
    
    setSpotLight: function(height) {

        // Add spotlight (with shadows)

        let existingSpotLight = sceneElements.sceneGraph.getObjectByName("spotLight");
        if (existingSpotLight) {
            sceneElements.sceneGraph.remove(existingSpotLight);
        }
        const spotLight = new THREE.SpotLight(0xffffff, 1);
        spotLight.position.set(0, height, 0);
        spotLight.name = "spotLight";
        sceneElements.sceneGraph.add(spotLight);
        spotLight.castShadow = true;
        spotLight.shadow.mapSize.width = 8182;
        spotLight.shadow.mapSize.height = 8182;
    },
    
    moveSpotLight: function(x, y, z) {
        const existingSpotLight = sceneElements.sceneGraph.getObjectByName("spotLight");
        if (existingSpotLight) {
            existingSpotLight.position.x = x;
            existingSpotLight.position.y = y;
            existingSpotLight.position.z = z;
        }
    },

    render: function render(sceneElements) {
        sceneElements.renderer.render(sceneElements.sceneGraph, sceneElements.camera);
    },

    // THIS FUNCTION CREATES A (SORT OF) RANDOM TOWER FOR THE LEVEL THE PLAYER IS IN
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
    },

    initTextHelper: function() {
        var helperContent = `
            <div class="game-controls">
                <table>
                    <tr>
                        <th class="key">Key</th>
                        <th class="separator"></th>
                        <th>Action</th>
                    </tr>
                    <tr>
                        <td>SPACE</td>
                        <td class="separator"></td>
                        <td>Break Platform</td>
                    </tr>
                    <tr>
                        <td>Mouse Drag</th>
                        <td class="separator"></th>
                        <td>Move Camera</th>
                    </tr>
                    <tr>
                        <td>R</td>
                        <td class="separator"></td>
                        <td>Change Ball Color</td>
                    </tr>
                    <tr>
                        <td>K</td>
                        <td class="separator"></td>
                        <td>Change Ball Shape</td>
                    </tr>
                </table>
            </div>
        `;
        
        const helperContainer = document.createElement('div');
        helperContainer.id = "helperContainer";
        helperContainer.innerHTML = helperContent;
        document.body.appendChild(helperContainer);
    },

    initLevel: function(sceneGraph) {

        //  Init Variables 
        
        lvl ++;
        gaming = true;
        ballBounceStep = -0.005;
        lvlCompleted = false;
        falling = false;
        
        //  Create the tower   
        let lstDefTower = helper.generateTowerLevels(lvl);

        createBase();
        createLvlPlataforms();
        createBall();
        adjustCamera();
        createCollunm();
        createRecordInfoMessage();
        createlvlInfoMessage();

        helper.setSpotLight(lookingHeight + 10);

        // Functions

        // Function to Display the Top Left Level in the Window
        function createlvlInfoMessage() {

            // Create a div element for the start message
            const lvlMessageDiv = document.createElement('div');
            lvlMessageDiv.id = 'lvl-message';
            lvlMessageDiv.textContent = 'LEVEL '+lvl.toString();

            // Append the start message to the body
            document.body.appendChild(lvlMessageDiv);

            // Save Div
            lvlMessage = lvlMessageDiv;
        }

        // Function to Display the Top Left Record in the Window
        function createRecordInfoMessage() {

            // Create a div element for the start message
            const recordMessageDiv = document.createElement('div');
            recordMessageDiv.id = 'record-message';
            recordMessageDiv.textContent = 'RECORD: '+record.toString();
        
            // Append the start message to the body
            document.body.appendChild(recordMessageDiv);

            // Save Div
            recordMessage = recordMessageDiv;
        }

        // Function to adjust the camera to the new ball
        function adjustCamera() {
            
            cameraHeight = lastHeight + 1.5;
            lookingHeight = cameraHeight - 2;
            newLookingHeight = lookingHeight;

            sceneElements.camera.position.set(2.5, cameraHeight, 2.5);
            sceneElements.control.target.set(0, lookingHeight, 0);
        }

        // Function to create the Player's Ball
        function createBall() {

            // Create Geometry
            let ballGeometry;
            switch (ballShapeList[shapeIndex]){
                case "ball":
                    ballGeometry = new THREE.SphereGeometry(ballSize,64,32);
                    break;
                case "square":
                    ballGeometry = new THREE.BoxGeometry(2*ballSize,2*ballSize,2*ballSize);
                    break;
            }

            // Create Material
            const ballMaterial = new THREE.MeshPhongMaterial({ color: ballColorList[colorIndex] });

            // Create ball
            const ball = new THREE.Mesh( ballGeometry, ballMaterial );
            
            // Ball Position and Define Atributes
            ball.position.x = 0.50*Math.cos(PI/4)
            ball.position.z = 0.50*Math.cos(PI/4)
            ball.position.y = lastHeight+ballExtraHeight;
            ball.name = "ball";

            // Add ball to the scene
            sceneGraph.add(ball);
        }

        function createLvlPlataforms() {
            let lstPlataforms = [];

            let placeHeight = grossura / 4 - gap;
            let angle = 0;

            for (let i = 0; i < lstDefTower.length; i++){
                let platform = createPlatform(lstDefTower[i]);

                placeHeight += grossura / 2 + gap;
                platform.position.y = placeHeight;
                platform.rotation.y += angle;

                sceneGraph.add(platform);
                lstPlataforms.push({platform, angle});

                angle += platformRotationAngle;
            }

            lastHeight = placeHeight;
            lvlPlataforms = lstPlataforms;
        }

        function createPlatform(lstDefPlatform) {

            // Create the plataform 
            const platformGroup = new THREE.Object3D()

            // Create Geometry of the Piece

            const peaceGeometry = new THREE.TorusGeometry(0.7, grossura, 4, 1, PI/4);
            for (let i = 0; i < peaceGeometry.vertices.length; i ++){
                let altura = grossura/4;
                if (i < 4) {
                    peaceGeometry.vertices[i].z = altura;
                    if (i < 2) {
                        peaceGeometry.vertices[i].x = peaceGeometry.vertices[i+6].x
                        peaceGeometry.vertices[i].y = peaceGeometry.vertices[i+6].y
                    }
                    else {
                        peaceGeometry.vertices[i].x = peaceGeometry.vertices[i+2].x
                        peaceGeometry.vertices[i].y = peaceGeometry.vertices[i+2].y
                    }
                } else {
                    peaceGeometry.vertices[i].z = -altura;
                }
            }

            // Create Material the possible Materials for the Piece

            const softMaterial = new THREE.MeshPhongMaterial({ color: 0x0095DD });
            const hardMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
            
            //  Create the Pieces 

            let angle = 0;
            for (let i = 0; i < 8; i++){
                let peaceObject;

                // X in the Tower Model define the Hard Pieces
                if (lstDefPlatform[i] == "X") { 
                    peaceObject = new THREE.Mesh(peaceGeometry, hardMaterial);

                // O in the Tower Model define the Soft Pieces
                } else {
                    peaceObject = new THREE.Mesh(peaceGeometry, softMaterial);
                }

                peaceObject.rotation.x = PI/2;
                peaceObject.rotation.z += angle;
                platformGroup.add(peaceObject);

                angle += PI/4;
            }

            // Return Plataform 
            return platformGroup;
        }

        function createCollunm() {

            const collumnHeight = lastHeight+10;

            // Create Geometry
            const collumnGeometry = new THREE.CylinderGeometry(grossura,grossura,collumnHeight,64);

            // Create Material
            const collumnMaterial = new THREE.MeshToonMaterial({ color: 0xCCDDD3 });

            // Create Collumn
            const collumn = new THREE.Mesh( collumnGeometry, collumnMaterial );

            collumn.position.y = collumnHeight/2;
            collumn.name = "collumn";

            sceneGraph.add(collumn);
        }

        function createBase(){
            // Create Geometry
            const baseGeometry = new THREE.CylinderGeometry(baseLargura, baseLargura, grossura / 2, 64);

            // Create Material
            const baseMaterial = new THREE.MeshPhongMaterial({ color: 0xDFEFCA });

            // Create Base
            const base =  new THREE.Mesh(baseGeometry, baseMaterial);
            base.position.y = grossura/4;
            base.name = "base";

            sceneGraph.add(base);
        }
    },

    lvlCompleteMessage: function() {

        // Create the Div
        const lvlCompletedDiv = document.createElement('div');
        lvlCompletedDiv.id = 'lvl-completed-message';
        
        // Create the Content
        const lvlcompleted = document.createElement('p');
        lvlcompleted.textContent = "Level Completed";
        lvlcompleted.style.textAlign = "center";
        lvlcompleted.style.marginBottom = "0px";
        lvlCompletedDiv.appendChild(lvlcompleted);

        // Create the Content
        const continueP = document.createElement('p');
        continueP.style.marginTop = "0px";
        continueP.textContent = "Press SPACE to Continue";
        lvlCompletedDiv.appendChild(continueP);

        // Append the message to the body
        document.body.appendChild(lvlCompletedDiv);

        // Save the Div
        lvlCompletedMessage = lvlCompletedDiv;
    },

    gameOverMessage: function() {

        // Create the Div
        const gameOverDiv = document.createElement('div');
        gameOverDiv.id = 'game-over-message';

        // Create the Content
        const gameover = document.createElement('p');
        gameover.textContent = "Game Over";
        gameover.style.textAlign = "center";
        gameover.style.marginBottom = "0px";
        gameOverDiv.appendChild(gameover);

        // Create the Content
        const restart = document.createElement('p');
        restart.style.marginTop = "0px";
        restart.textContent = "Press SPACE to Restart";
        gameOverDiv.appendChild(restart);
        
        // Append the message to the body
        document.body.appendChild(gameOverDiv);

        // Save the Div
        gameOverMessage = gameOverDiv;
    },

    // Function Used to Change the Shape of the Player's "Ball"
    changeBallShape: function() {

        // New shape
        shapeIndex = (shapeIndex + 1) % ballShapeList.length;

        // Get current "ball"
        const ball = sceneElements.sceneGraph.getObjectByName("ball");

        switch (ballShapeList[shapeIndex]){
            // New shape is SphereGeometry
            case "ball":
                ball.geometry = new THREE.SphereGeometry(ballSize, 64, 32);
                break;

            // New shape is BoxGeometry
            case "square":
                ball.geometry = new THREE.BoxGeometry(2 * ballSize, 2 * ballSize, 2 * ballSize);
                break;
        }
    },

    // Function Used to Change the Color of the Player's "Ball"
    changeBallColor: function() {

        // New Color
        colorIndex = (colorIndex + 1) % ballColorList.length;

        // Get current ball
        const ball = sceneElements.sceneGraph.getObjectByName("ball");

        // Apply new color
        ball.material.color = new THREE.Color(ballColorList[colorIndex])
    },

    // Function to create a new "Press Start" Message
    createStartMessage: function() {

        // Create a div element with the message content
        const startMessageDiv = document.createElement('div');
        startMessageDiv.id = 'start-message';
        startMessageDiv.textContent = 'Press SPACE to Start';
    
        // Append the start message to the body
        document.body.appendChild(startMessageDiv);
    
        // Save Div
        startMessage = startMessageDiv;
    },

    // Function to create the bottom-right COPYRIGHTS Message
    createCopyrightsMessage: function() {

        // Create a div element with the message content
        const startMessageDiv = document.createElement('div');
        startMessageDiv.id = 'copyrights-message';
        startMessageDiv.textContent = 'Dzained by Tiago Sora';
    
        // Append the start message to the body
        document.body.appendChild(startMessageDiv);
    
        // Save Div
        startMessage = startMessageDiv;
    },

};