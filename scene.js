
// Constants

const PI = Math.PI;                     // Integer
const ballSize = 0.1;                   // Integer
const ballExtraHeight = 0.5;            // Integer
const grossura = 0.3;                   // Integer
const gap = 0.05;                       // Integer
const baseLargura = 0.80;               // Integer
const platformRotationAngle = 0.075;    // Integer
const ballColorList = [                 // List
    0xFF0000, // RED
    0x0000FF, // BLUE
    0xFFFF00, // YELLOW
    0xFF9900, // ORANGE
    0x00FF00, // GREEN
];
const ballShapeList = [                 // List
    "ball",   // SphereGeometry
    "square"  // BoxGeometry
];
const sceneElements = {                 // Map | Dict
    sceneGraph: null,
    camera: null,
    control: null,
    renderer: null,
};

// Variables

var ballBounceStep;         // Integer
var ballRotationStep;       // Integer
var cameraHeight;           // Integer
var lastHeight;             // Integer
var lookingHeight;          // Integer
var newLookingHeight;       // Integer
var falling;                // Boolean
var gaming;                 // Boolean
var lvl;                    // Integer
var lvlPlataforms;          // List
var lvlCompleted;           // Boolean
var colorIndex;             // Integer
var shapeIndex;             // Integer
var record;                 // Integer

/// Messages

var lvlMessage;
var startMessage;           // HTML Div
var lvlCompletedMessage;    // HTML Div
var gameOverMessage;        // HTML Div
var recordMessage;          // HTML Div

// Keys and Event Listeners

var SPACE;                  // Boolean

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
        case 32: // SPACE
            if (!SPACE){
                SPACE = true;
                if (startMessage) {
                    const startMessageDiv = document.getElementById('start-message');
                    startMessageDiv.remove();
                    startMessage = undefined;
                }
                if (!gaming || lvlCompleted){
                    newLevel();
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
        case 32: // SPACE
            SPACE = false;
            break;
    }
}

// INIT THE SCENE

/// Init the Varibles

lvl = 0;
record = 0;
colorIndex = 0;
shapeIndex = 0;
ballRotationStep = 0.01;
lvlPlataforms = [];
SPACE = false;

// Start a new scene
helper.initEmptyScene(sceneElements);

// Set the background
helper.setBlackGround();

// Create the top-right helper in the window
helper.initTextHelper();

// Start a new level
helper.initLevel(sceneElements.sceneGraph);

// Create the central Start Message in the window
createStartMessage();

// Animating
requestAnimationFrame(computeFrame);


// Functions

// Function Used to Change the Shape of the Player's "Ball"
function changeBallShape() {

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
}

// Function Used to Change the Color of the Player's "Ball"
function changeBallColor() {

    // New Color
    colorIndex = (colorIndex + 1) % ballColorList.length;

    // Get current ball
    const ball = sceneElements.sceneGraph.getObjectByName("ball");

    // Apply new color
    ball.material.color = new THREE.Color(ballColorList[colorIndex])
}

// Function to create a new 
function createStartMessage() {

    // Create a div element with the message content
    const startMessageDiv = document.createElement('div');
    startMessageDiv.id = 'start-message';
    startMessageDiv.textContent = 'Press SPACE to Start';

    // Append the start message to the body
    document.body.appendChild(startMessageDiv);

    // Save Div
    startMessage = startMessageDiv;
}

// Function to create a new Game's Level
function newLevel() {

    // If Player lost the game
    if(!gaming) {

        // Remove the central Game Over message
        gameOverMessage.remove();
        gameOverMessage = undefined;

        // The game restarts
        lvl = 0;
    
    // If Player didnt lose the game
    } else {

        // Remove the central Level Completed message
        lvlCompletedMessage.remove();
        lvlCompletedMessage = undefined;
    }

    // Remove the Outdated Level and Record Messages
    lvlMessage.remove();
    recordMessage.remove();

    // Remove the current ball
    const ball = sceneElements.sceneGraph.getObjectByName("ball");
    sceneElements.sceneGraph.remove(ball);

    // Remove the current Axes
    const axes = sceneElements.sceneGraph.getObjectByName("axes");
    sceneElements.sceneGraph.remove(axes);

    // Remove the current Collumn
    const collumn = sceneElements.sceneGraph.getObjectByName("collumn");
    sceneElements.sceneGraph.remove(collumn);

    // Remove the current Base
    const base = sceneElements.sceneGraph.getObjectByName("base");
    sceneElements.sceneGraph.remove(base);

    // Remove the remaining Platforms
    for (let i = 0; i < lvlPlataforms.length; i++){
        sceneElements.sceneGraph.remove(lvlPlataforms[i].platform)
    }

    // Init the new level
    helper.initLevel(sceneElements.sceneGraph);
}


// Function to produce the animation
function computeFrame() {

    // Function to determine if the part hitted by the ball is soft or hard
    function partCrashedIsSoft(angle, lastPlatform, platformAngle) {

        // Determine which angle of the platform was hit
        angle = (angle + platformAngle) % (2 * PI);

        // Get the piece hitted
        let child = lastPlatform.children[(angle - angle % (PI / 4)) / (PI / 4)];

        // Get the color of the pieace
        let materialColor = child.material.color;

        // If the color of the piece is black
        let hardColor = new THREE.Color(0x000000);
        if (materialColor.r == hardColor.r &&
            materialColor.g == hardColor.g &&
            materialColor.b == hardColor.b) 
            {
            return false;
        }

        // If the color of the piece is not black
        return true;
    }

    // If the Player hasn't lost yet
    if (gaming) {

        // Get the ball
        const ball = sceneElements.sceneGraph.getObjectByName("ball");

        // MOVE THE BALL WITH THE CAMERA AND THE SPOTLIGHT

        let hBall = Math.sqrt( Math.pow(ball.position.x, 2) + Math.pow(ball.position.z, 2));
        let hCamera = Math.sqrt( Math.pow(sceneElements.camera.position.x, 2) + Math.pow(sceneElements.camera.position.z, 2));
        let angle = Math.acos(sceneElements.camera.position.x / hCamera);

        if (sceneElements.camera.position.z < 0){
            angle = 2 * PI - angle;
        }

        ball.position.x = Math.cos(angle) * hBall;
        ball.position.z = Math.sin(angle) * hBall;

        helper.moveSpotLight(ball.position.x, lookingHeight + 5, ball.position.z);

        // ROTATE THE BALL

        ball.rotation.x += ballRotationStep;
        ball.rotation.y += ballRotationStep;
        ball.rotation.z += ballRotationStep;
    
        // BOUNCE THE BALL
        
        if( ball.position.y <= lastHeight + ballSize + gap && 
            (SPACE == false || lvlCompleted == true))
            {
            // Ball goes up
            ballBounceStep = 0.005;
        }

        if(ball.position.y > lastHeight + ballExtraHeight){
            // Ball goes down
            ballBounceStep = -0.005;
        }

        // If SPACE is pressed ball most go instantly down
        if (SPACE == true && lvlCompleted == false) {
            if (falling == false) {
                ballBounceStep = -0.01;
                falling = true;
            }
        } else {
            falling = false;
        }

        // The ball falls faster
        if (ballBounceStep < 0) {
            if (ballBounceStep > -0.05){
                ballBounceStep = ballBounceStep * 1.01;
            }
        
        // And rises slower
        } else {
            ballBounceStep = ballBounceStep * 0.99998;
        }
    
        // Move the Ball
        ball.position.y += ballBounceStep;
    
        // WHEN A PLATAFORM IS HITTED
    
        // If there are still plataforms to break
        if (lvlPlataforms.length != 0){

            const lastPlatform = lvlPlataforms[lvlPlataforms.length-1].platform;
            const platformAngle = lvlPlataforms[lvlPlataforms.length-1].angle;

            // If the Ball hit a Plataform
            if (ball.position.y <= lastPlatform.position.y + grossura / 4 + gap && SPACE){

                // If the Plataform's Piece Hitted is Soft, break the platform
                if(partCrashedIsSoft(angle, lastPlatform, platformAngle)){

                    // Remove the Platform
                    sceneElements.sceneGraph.remove(lastPlatform);
                    lvlPlataforms.splice(lvlPlataforms.length-1,1);

                    // Set a new view point
                    lastHeight -= (grossura/2 + gap);
                    newLookingHeight -=  (grossura/2 + gap);

                    if (lvlPlataforms.length == 0){
                        lastHeight += gap;
                    }

                // If the Plataform's Piece Hitted is Hard, it's game over
                } else {

                    gaming = false;

                    if(record < lvl){
                        record = lvl;
                    }

                    // Its game over
                    helper.gameOverMessage();
                }
            }

        // If there no more plataforms to break, level is complete
        } else {

            lvlCompleted = true;
            
            if (!lvlCompletedMessage) {
                helper.lvlCompleteMessage();
            }
        }
    }

    // If a plataform was broke, the camara falls
    if (newLookingHeight < lookingHeight){
        lookingHeight -= Math.abs(ballBounceStep);
        sceneElements.camera.position.y -= Math.abs(ballBounceStep);
        sceneElements.control.target.set(0, lookingHeight, 0);
    }
    
    // Rendering
    helper.render(sceneElements);

    // Update control of the camera
    sceneElements.control.update();

    // Call for the next frame
    requestAnimationFrame(computeFrame);
}