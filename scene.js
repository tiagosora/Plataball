"use strict";


// To store the scene graph, and elements usefull to rendering the scene
var PI = Math.PI
var lvlPlataforms = []
var lastHeight;
let lookingHeight = 2
let newLookingHeight = lookingHeight
let lvlCompleted = false;
var ballSize = 0.1;
var bounce_step = -0.005
var grossura = 0.3;
var gap = 0.05;
var baseLargura = 0.80;
var collumnHeight = 1000;

const sceneElements = {
    sceneGraph: null,
    camera: null,
    control: null,  // NEW
    renderer: null,
};

var lstDefTower = [ ["X","O","O","O","O","O","O","O"],
                    ["X","X","X","O","X","O","O","X"],
                    ["X","O","O","X","O","X","X","O"],
                    ["X","O","X","O","O","X","X","O"],
                    ["X","O","O","O","O","O","O","O"],
                    ["X","X","X","O","X","O","O","X"],
                    ["X","O","O","X","O","X","X","O"],
                    ["X","O","X","O","O","X","X","O"],
                    ["X","O","O","O","O","O","O","O"],
                    ["X","X","X","O","X","O","O","X"],
                    ["X","O","O","X","O","X","X","O"],
                    ["X","O","X","O","O","X","X","O"]
                ]


helper.initEmptyScene(sceneElements, lookingHeight);
load3DObjects(sceneElements.sceneGraph);
requestAnimationFrame(computeFrame);

// EVENT LISTENERS

var SPACE = false;
window.addEventListener('resize', resizeWindow);
document.addEventListener('keydown', onDocumentKeyDown, false);
document.addEventListener('keyup', onDocumentKeyUp, false);

function resizeWindow(eventParam) {
    const width = window.innerWidth;
    const height = window.innerHeight;

    sceneElements.camera.aspect = width / height;
    sceneElements.camera.updateProjectionMatrix();

    sceneElements.renderer.setSize(width, height);
}

function onDocumentKeyDown(event) {
    switch (event.keyCode) {
        case 32: // <--
            SPACE = true;
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

function load3DObjects(sceneGraph) {

    // --- Add coordinate AXIS to the scene  --- 

    const axes = new THREE.AxesHelper(60);
    sceneGraph.add(axes);

    // --- Create a ground plane --- 
    // const planeGeometry = new THREE.PlaneGeometry(10,10);
    // const planeMaterial = new THREE.MeshBasicMaterial({ color: 'rgb(200, 200, 200)', side: THREE.DoubleSide });
    // const planeObject = new THREE.Mesh(planeGeometry, planeMaterial);
    // sceneGraph.add(planeObject);
    // planeObject.rotateOnAxis(new THREE.Vector3(1, 0, 0), PI / 2);
    // planeObject.receiveShadow = true;
    
    // --- Create the tower  --- 

    lvlPlataforms = createLevel(lstDefTower);

    const ball = createBall();
    ball.position.x = 0.50*Math.cos(PI/4)
    ball.position.z = 0.50*Math.cos(PI/4)
    ball.position.y = lastHeight+0.5;
    ball.name = "ball";
    sceneGraph.add(ball);

    // --- Create the ball  ---

    function createBall() {
        // Create Geometry
        const ballGeometry = new THREE.SphereGeometry(ballSize,64,32);
        // Create Material
        const colorballMaterial = 0xFF0000;
        const ballMaterial = new THREE.MeshBasicMaterial({ color: colorballMaterial });
        // Create ball
        const ball = new THREE.Mesh( ballGeometry, ballMaterial );
        return ball;
    }

    function createLevel(lstDefTower) {
        createCollunm();
        createBase();
        return createLvlPlataforms();
    }

    function createLvlPlataforms() {
        let lstPlataforms = [];

        let placeHeight = grossura / 4 - gap;
        let platformRotationAngle = 0;
        for (let i = 0; i < lstDefTower.length; i++){
            let plataform = createPlatform(lstDefTower[i]);
            placeHeight += grossura / 2 + gap;
            plataform.position.y = placeHeight;
            plataform.rotation.y = platformRotationAngle;
            platformRotationAngle -= 0.1;
            sceneGraph.add(plataform);
            lstPlataforms.push(plataform);
        }

        lastHeight = placeHeight;
        return lstPlataforms;
    }

    function createPlatform(lstDefPlatform) {
        // --- Create Platform
        const plataformGroup = new THREE.Object3D()

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
        const softMaterial = new THREE.MeshBasicMaterial({ color: colorSoftPeaceMaterial });
        const hardMaterial = new THREE.MeshBasicMaterial({ color: colorHardPeaceMaterial });
        const wireframeMaterial = new THREE.MeshBasicMaterial({color: colorWireframe, wireframe: true});
        
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
            plataformGroup.add(peaceObject);

            let wireframe = new THREE.Mesh(peaceGeometry, wireframeMaterial);
            wireframe.rotation.x = PI/2;
            wireframe.rotation.z += angle;
            plataformGroup.add(wireframe);

            angle += PI/4;
        }
        
        // --- Return Plataform ---
        return plataformGroup;
    }

    function createCollunm() {
        // Create Geometry
        const collumnGeometry = new THREE.CylinderGeometry(grossura,grossura,collumnHeight,64);
        // Create Material
        const colorCollumnMaterial = 0x0FFFFF;
        const collumnMaterial = new THREE.MeshBasicMaterial({ color: colorCollumnMaterial });
        // Create Collumn
        const collumn = new THREE.Mesh( collumnGeometry, collumnMaterial );
        collumn.position.y = collumnHeight/2
        sceneGraph.add(collumn);
    }

    function createBase(){
        // Create Geometry
        const baseGeometry = new THREE.CylinderGeometry(baseLargura,baseLargura,grossura/2,64);
        // Create Material
        const colorBaseMaterial = 0x808080;
        const colorWireframe = 0x000000;
        const baseMaterial = new THREE.MeshBasicMaterial({ color: colorBaseMaterial });
        const wireframeMaterial = new THREE.MeshBasicMaterial({color: colorWireframe, wireframe: true});
        // Create Base
        const base =  new THREE.Mesh(baseGeometry, baseMaterial);
        const wireframe = new THREE.Mesh(baseGeometry, wireframeMaterial);
        base.position.y = grossura/4;
        wireframe.position.y = grossura/4;
        sceneGraph.add(base);
        sceneGraph.add(wireframe);
    }
}

function computeFrame(time) {

    // CONSTS

    const ball = sceneElements.sceneGraph.getObjectByName("ball");
    const ballSize = ball.geometry.parameters.radius;
    const hBall = Math.sqrt( Math.pow(ball.position.x, 2) + Math.pow(ball.position.z, 2));
    const hCamera = Math.sqrt( Math.pow(sceneElements.camera.position.x, 2) + Math.pow(sceneElements.camera.position.z, 2));
    
    // MOVE BALLS WITH THE CAMERA
    
    let angle = Math.acos(sceneElements.camera.position.x / hCamera);
    if (sceneElements.camera.position.z < 0){
        angle = 2*PI - angle;
    }
    ball.position.x = Math.cos(angle)*hBall;
    ball.position.z = Math.sin(angle)*hBall;

    // BOUNCE THE BALL
    
    if(ball.position.y<=lastHeight+ballSize+gap && SPACE != true){
        bounce_step = 0.005;
    }
    if(ball.position.y>lastHeight+0.5 || SPACE === true){
        bounce_step = -0.005
        if (SPACE === true) {
            bounce_step = -0.015;
        }
    }
    ball.position.y += bounce_step;

    // REMOVE THE PLATFORM

    if (lvlPlataforms.length>0){
        const lastPlatform = lvlPlataforms[lvlPlataforms.length-1];
    
        if (ball.position.y <= lastPlatform.position.y+grossura/4+gap){
            sceneElements.sceneGraph.remove(lastPlatform);
            lvlPlataforms.splice(lvlPlataforms.length-1,1);
            lastHeight -= (grossura/2 + gap);
            newLookingHeight -=  (grossura/2 + gap);
            if (lvlPlataforms.length === 0){
                lastHeight += gap;
                newLookingHeight -= gap;
            }
            // sceneElements.camera.position.y -= 0.20;
        }
    } else {
        lvlCompleted = true;
    }


    if (newLookingHeight < lookingHeight){
        lookingHeight -= 0.01;
        sceneElements.camera.position.y -= 0.01
        sceneElements.control.target.set( 0,lookingHeight,0);
    }
    
    // Rendering
    helper.render(sceneElements);

    // NEW --- Update control of the camera
    // sceneElements.control.target.set( 0,2,0 );
    sceneElements.control.update();

    // Call for the next frame
    requestAnimationFrame(computeFrame);
}