"use strict";

// Constants

const PI = Math.PI;
const ballSize = 0.1;
const ballExtraHeight = 0.5;
const grossura = 0.3;
const gap = 0.05;
const baseLargura = 0.80;
const platformRotationAngle = 0.075;
const ballColorList = [
    0xFF0000, // RED
    0x0000FF, // BLUE
    0XFFFF00, // YELLOW
    0xFF9900, // ORANGE
    0x00FF00, // GREEN
];
const ballShapeList = [
    "ball",
    "square"
];
const sceneElements = {
    sceneGraph: null,
    camera: null,
    control: null,  // NEW
    renderer: null,
};

// Variables

var lstDefTower;
var ballBounceStep;
var lastHeight;
var cameraHeight;
var lookingHeight; 
var newLookingHeight;
var lvlCompleted;
var falling;
var startMessage;
var gaming;
var platformsBroken;
var lvlPlataforms;
var lvl;
var colorIndex;
var shapeIndex;
var ballRotationStep;
var record;

/// Messages

var lvlCompletedMessage;
var gameOverMessage;
var recordMessage;

// Keys

var SPACE = false;

// Init Scene

lvlPlataforms = [];
lvl = 0;
colorIndex = 0;
shapeIndex = 0;
ballRotationStep = 0.01;
record = 0;

helper.initEmptyScene(sceneElements);
helper.setBlackGround();
helper.initTextHelper();
initLevel(sceneElements.sceneGraph);
requestAnimationFrame(computeFrame);
createStartMessage();

// Event Listeners

window.addEventListener('resize', resizeWindow);
document.addEventListener('keydown', onDocumentKeyDown, false);
document.addEventListener('keyup', onDocumentKeyUp, false);

// Functions

function resizeWindow(eventParam) {
    const width = window.innerWidth;
    const height = window.innerHeight;

    sceneElements.camera.aspect = width / height;
    sceneElements.camera.updateProjectionMatrix();

    sceneElements.renderer.setSize(width, height);
}

function onDocumentKeyDown(event) {
    // console.log(event.keyCode)
    switch (event.keyCode) {
        case 32: // SPACE
            if (!SPACE){
                SPACE = true;
                if (startMessage) {
                    const startMessageDiv = document.getElementById('start-message');
                    startMessageDiv.remove();
                    startMessage = undefined;
                }
                if (!gaming){
                    if(gameOverMessage){
                        const gameOverDiv = document.getElementById('game-over-message');
                        gameOverDiv.remove();
                        gameOverMessage = undefined;
    
                        const lvlDiv = document.getElementById('lvl-message');
                        lvlDiv.remove();

                        const recordDiv = document.getElementById('record-message');
                        recordDiv.remove();
                    }
                    lvl = 0;
                    clearlvl();
                    initLevel(sceneElements.sceneGraph);
                }
                if(lvlCompleted){
                    if(lvlCompletedMessage){
                        const lvlCompletedDiv = document.getElementById('lvl-completed-message');
                        lvlCompletedDiv.remove();
                        lvlCompletedMessage = undefined;
    
                        const lvlDiv = document.getElementById('lvl-message');
                        lvlDiv.remove();

                        const recordDiv = document.getElementById('record-message');
                        recordDiv.remove();
                    }
                    clearlvl();
                    initLevel(sceneElements.sceneGraph);
                }
            }
            break;
        case 82: // R
            changeBallColor();
            break;
        case 75: // K
            changeBallShape();
            break;   
    }
}

function onDocumentKeyUp(event) {
    switch (event.keyCode) {
        case 32: // <--
            SPACE = false;
            break;
    }
}

function changeBallShape() {
    shapeIndex = (shapeIndex + 1) % ballShapeList.length;
    let newGeometry;
    const ball = sceneElements.sceneGraph.getObjectByName("ball");
    switch (ballShapeList[shapeIndex]){
        case "ball":
            newGeometry = new THREE.SphereGeometry(ballSize,64,32);
            ball.geometry = newGeometry;
            break;
        case "square":
            newGeometry = new THREE.BoxGeometry(2*ballSize,2*ballSize,2*ballSize);
            ball.geometry = newGeometry;
            break;
    }
    console.log(ball.geometry.parameters)

}

function changeBallColor() {
    colorIndex = (colorIndex + 1) % ballColorList.length;
    const ball = sceneElements.sceneGraph.getObjectByName("ball");
    ball.material.color = new THREE.Color(ballColorList[colorIndex])

}

function createStartMessage() {
    // Create a div element for the start message
    const startMessageDiv = document.createElement('div');
    startMessageDiv.id = 'start-message';
    startMessageDiv.textContent = 'Press SPACE to Start';

    // Append the start message to the body
    document.body.appendChild(startMessageDiv);

    startMessage = startMessageDiv;
}

function initLevel(sceneGraph) {

    // --- Init Variables ---
    
    lvl ++;
    lstDefTower = helper.generateTowerLevels(lvl);
    // ballBounceStep = -0.005;
    
    // --- Create the tower  --- 

    createLevel();
    helper.setSpotLight(lookingHeight + 10);
    console.log(sceneElements.sceneGraph.children.length)

    // Functions

    function createLevel() {
        gaming = true;
        platformsBroken = 0;
        ballBounceStep = -0.005;
        lvlCompleted = false;
        falling = false;

        createBase();
        createLvlPlataforms();
        createBall();
        adjustCamera();
        createRecordInfoMessage();
        createlvlInfoMessage();
        createCollunm();
    }

    function createlvlInfoMessage() {
        // Create a div element for the start message
        const recordMessageDiv = document.createElement('div');
        recordMessageDiv.id = 'lvl-message';
        recordMessageDiv.textContent = 'LEVEL '+lvl.toString();
    
        // Append the start message to the body
        document.body.appendChild(recordMessageDiv);
    }

    function createRecordInfoMessage() {
        // Create a div element for the start message
        const lvlMessageDiv = document.createElement('div');
        lvlMessageDiv.id = 'record-message';
        lvlMessageDiv.textContent = 'RECORD: '+record.toString();
    
        // Append the start message to the body
        document.body.appendChild(lvlMessageDiv);
    }


    function adjustCamera() {
        // --- Adjust camera to lvl ---
        cameraHeight = lastHeight + 1.5;
        lookingHeight = cameraHeight - 2;
        newLookingHeight = lookingHeight;

        sceneElements.camera.position.set(2.5, cameraHeight, 2.5);
        sceneElements.control.target.set(0, lookingHeight, 0);
    }

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
        const colorballMaterial = ballColorList[colorIndex];
        const ballMaterial = new THREE.MeshPhongMaterial({ color: colorballMaterial });
        // Create ball
        const ball = new THREE.Mesh( ballGeometry, ballMaterial );
        
        ball.position.x = 0.50*Math.cos(PI/4)
        ball.position.z = 0.50*Math.cos(PI/4)
        ball.position.y = lastHeight+ballExtraHeight;
        ball.name = "ball";
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
        // --- Create Platform
        const platformGroup = new THREE.Object3D()

        // --- Create Peace --- 
        // Create Geometry
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
        // Create Material
        const colorSoftPeaceMaterial = 0x0095DD;
        const colorHardPeaceMaterial = 0x000000;
        const colorWireframe = 0x000000;
        const softMaterial = new THREE.MeshPhongMaterial({ color: colorSoftPeaceMaterial });
        const hardMaterial = new THREE.MeshPhongMaterial({ color: colorHardPeaceMaterial });
        // const wireframeMaterial = new THREE.MeshBasicMaterial({color: colorWireframe, wireframe: true});
        
        // --- Create Arcs ---
        let angle = 0;
        for (let i = 0; i < 8; i++){
            let peaceObject;
            if (lstDefPlatform[i] == "X") {
                peaceObject = new THREE.Mesh(peaceGeometry, hardMaterial);
            } else {
                peaceObject = new THREE.Mesh(peaceGeometry, softMaterial);
            }
            peaceObject.rotation.x = PI/2;
            peaceObject.rotation.z += angle;
            platformGroup.add(peaceObject);

            angle += PI/4;
        }
        

        // --- Return Plataform ---
        return platformGroup;
    }

    function createCollunm() {
        const collumnHeight = lastHeight+10;

        // Create Geometry
        
        const collumnGeometry = new THREE.CylinderGeometry(grossura,grossura,collumnHeight,64);
        // Create Material
        const colorCollumnMaterial = 0x0FFFFF;
        const collumnMaterial = new THREE.MeshToonMaterial({ color: colorCollumnMaterial });
        // Create Collumn
        const collumn = new THREE.Mesh( collumnGeometry, collumnMaterial );
        collumn.position.y = collumnHeight/2;
        collumn.name = "collumn";
        sceneGraph.add(collumn);
    }

    function createBase(){
        // Create Geometry
        const baseGeometry = new THREE.CylinderGeometry(baseLargura,baseLargura,grossura/2,64);
        // Create Material
        const colorBaseMaterial = 0x808080;
        const colorWireframe = 0x000000;
        const baseMaterial = new THREE.MeshPhongMaterial({ color: colorBaseMaterial });
        const wireframeMaterial = new THREE.MeshBasicMaterial({color: colorWireframe, wireframe: true});
        // Create Base
        const base =  new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = grossura/4;
        base.name = "base";
        sceneGraph.add(base);

        // const wireframe = new THREE.Mesh(baseGeometry, wireframeMaterial);
        // wireframe.position.y = grossura/4;
        // sceneGraph.add(wireframe);
    }
}

function clearlvl(){
    const ball = sceneElements.sceneGraph.getObjectByName("ball");
    const axes = sceneElements.sceneGraph.getObjectByName("axes");
    const collumn = sceneElements.sceneGraph.getObjectByName("collumn");
    const base = sceneElements.sceneGraph.getObjectByName("base");
    sceneElements.sceneGraph.remove(ball);
    sceneElements.sceneGraph.remove(axes);
    sceneElements.sceneGraph.remove(collumn);
    sceneElements.sceneGraph.remove(base);

    for (let i = 0; i < lvlPlataforms.length; i++){
        sceneElements.sceneGraph.remove(lvlPlataforms[i].platform)
    }
}

function computeFrame() {

    function partCrashedIsSoft(angle, lastPlatform, platformAngle){
        angle = (angle+platformAngle)%(2*PI)
        let childIndex = (angle-angle%(PI/4))/(PI/4);
        let child = lastPlatform.children[childIndex];
        let materialColor = child.material.color;
        let hardColor = new THREE.Color(0x000000);
        
        if (materialColor.r == hardColor.r &&
            materialColor.g == hardColor.g &&
            materialColor.b == hardColor.b){
            return false;
        }
        return true;
    }

    // CONSTS

    if (gaming) {
        const ball = sceneElements.sceneGraph.getObjectByName("ball");

        let ballSize;
        switch(ballShapeList[shapeIndex]) {
            case "ball":
                ballSize = ball.geometry.parameters.radius;
                break;
            case "square":
                ballSize = ball.geometry.parameters.depth/2;
                break;
        }

        const hBall = Math.sqrt( Math.pow(ball.position.x, 2) + Math.pow(ball.position.z, 2));
        const hCamera = Math.sqrt( Math.pow(sceneElements.camera.position.x, 2) + Math.pow(sceneElements.camera.position.z, 2));
        
        // MOVE BALLS WITH THE CAMERA
        
        let angle = Math.acos(sceneElements.camera.position.x / hCamera);
        if (sceneElements.camera.position.z < 0){
            angle = 2*PI - angle;
        }
        ball.position.x = Math.cos(angle)*hBall;
        ball.position.z = Math.sin(angle)*hBall;

        helper.moveSpotLight(ball.position.x, lookingHeight + 5, ball.position.z);


        // ROTATE THE BALL

        ball.rotation.x += ballRotationStep;
        ball.rotation.y += ballRotationStep;
        ball.rotation.z += ballRotationStep;
    
        // BOUNCE THE BALL
        // console.log(ball.position.y <= lastHeight + ballSize + gap)
        
        if(ball.position.y <= lastHeight + ballSize + gap && (SPACE === false || lvlCompleted === true)){
            ballBounceStep = 0.005;
        }
        if(ball.position.y > lastHeight + ballExtraHeight){
            ballBounceStep = -0.005;
        }
        if (SPACE === true && lvlCompleted === false) {
            if (falling === false) {
                ballBounceStep = -0.01;
                falling = true
            }
        } else {
            falling = false;
        }
        if (ballBounceStep < 0) {
            if (ballBounceStep > -0.05){
                ballBounceStep = ballBounceStep * 1.01;
            }
        } else {
            ballBounceStep = ballBounceStep * 0.99998;
        }
    
        ball.position.y += ballBounceStep;
    
        // REMOVE THE PLATFORM
    
        if (lvlPlataforms.length > platformsBroken){
            const lastPlatform = lvlPlataforms[lvlPlataforms.length-1].platform;
            const platformAngle = lvlPlataforms[lvlPlataforms.length-1].angle;
            if (ball.position.y <= lastPlatform.position.y+grossura/4+gap && SPACE){
                if(partCrashedIsSoft(angle, lastPlatform, platformAngle)){
                    sceneElements.sceneGraph.remove(lastPlatform);
                    lvlPlataforms.splice(lvlPlataforms.length-1,1);
                    lastHeight -= (grossura/2 + gap);
                    newLookingHeight -=  (grossura/2 + gap);
                    if (lvlPlataforms.length === 0){
                        lastHeight += gap;
                    }
                } else {
                    gaming = false;

                    if(record < lvl){
                        record = lvl;
                    }

                    const gameOverDiv = document.createElement('div');

                    gameOverDiv.id = 'game-over-message';
                    const gameover = document.createElement('p');
                    gameover.textContent = "Game Over";
                    gameover.style.textAlign = "center";
                    gameover.style.marginBottom = "0px";
                    const restart = document.createElement('p');
                    restart.style.marginTop = "0px";
                    restart.textContent = "Press SPACE to Restart";
                    gameOverDiv.appendChild(gameover);
                    gameOverDiv.appendChild(restart);
                    document.body.appendChild(gameOverDiv);

                    gameOverMessage = gameOverDiv;
                }
            }
        } else {
            lvlCompleted = true;
            if (!lvlCompletedMessage) {
                const lvlCompletedDiv = document.createElement('div');

                lvlCompletedDiv.id = 'lvl-completed-message';
                const gameover = document.createElement('p');
                gameover.textContent = "Level Completed";
                gameover.style.textAlign = "center";
                gameover.style.marginBottom = "0px";
                const restart = document.createElement('p');
                restart.style.marginTop = "0px";
                restart.textContent = "Press SPACE to Continue";
                lvlCompletedDiv.appendChild(gameover);
                lvlCompletedDiv.appendChild(restart);
    
                // Append the start message to the body
                document.body.appendChild(lvlCompletedDiv);
    
                lvlCompletedMessage = lvlCompletedDiv;
            }
        }
    }

    if (newLookingHeight < lookingHeight){
        lookingHeight -= Math.abs(ballBounceStep);
        sceneElements.camera.position.y -= Math.abs(ballBounceStep)
        sceneElements.control.target.set( 0,lookingHeight,0);
    }
    
    // Rendering
    helper.render(sceneElements);

    // Update control of the camera
    sceneElements.control.update();

    // Call for the next frame
    requestAnimationFrame(computeFrame);
}