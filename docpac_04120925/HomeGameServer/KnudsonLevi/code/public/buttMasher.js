var score = 0;
var direction = 0;
var timer = 20;
var wasHeld = false;
var gamepadIndex = 0;
var gameStarted = false;
var timerInterval;
var directionInterval;
var highScore;
setDirection();
HighScore();
//detect gamepad connection
window.addEventListener('gamepadconnected', (event) => {
    const gamepad = event.gamepad;
    if ((gamepad.id.toLowerCase().includes("xinput") || gamepad.id.toLowerCase().includes("playstation")) && !gameStarted) {
        console.log(`Supported Gamepad connected: ${gamepad.id} (index ${gamepad.index})`);
        gamepadIndex = gamepad.index;
        startGame();
    } else {
        alert("Gamepad Unsupported!")
    }
});
function startGame() {
    gameStarted = true;
    //Run timer countdown every second
    timerInterval = setInterval(countdown, 1000);
    //set a random direction every 2 seconds
    directionInterval = setInterval(setDirection, 2000);
    //run gamepad listener to detect button presses
    requestAnimationFrame(gamepadListener);
}
function stopGame() {
    //stop timer and direction intervals when time runs out
    clearInterval(timerInterval);
    clearInterval(directionInterval);
    document.getElementById("directionBox").innerHTML = "Time's up! <br> Press + to restart.";
    document.getElementById("JoystickImage").style.display = "none";
    console.log("Game Over");
    HighScore();
}
function countdown() {
    if (timer > 0) {
        timer -= 1;
        //update timer display
        document.getElementById("timerBox").innerHTML = timer;
        if (timer == 0) {
            stopGame();
        }
    }
}
function setDirection() {
    //Get random number between 0 and 3
    direction = Math.floor(Math.random() * (4));
    //set direction display to corresponding direction
    if (direction == 0) {
        document.getElementById("directionBox").innerHTML = "Up";
        document.getElementById("JoystickImage").src = "img/up.png";
    } else if (direction == 1){
        document.getElementById("directionBox").innerHTML = "right";
        document.getElementById("JoystickImage").src = "img/right.png";
    } else if (direction == 2){
        document.getElementById("directionBox").innerHTML = "Down";
        document.getElementById("JoystickImage").src = "img/down.png";
    } else {
        document.getElementById("directionBox").innerHTML = "Left";
        document.getElementById("JoystickImage").src = "img/left.png";
    } 
}
function gamepadListener() {
    //shortcut to access p1 Gamepad
    const gamepad = navigator.getGamepads()[gamepadIndex];
    //check if A button is pressed
    if (gamepad.buttons[0].pressed) {
        OnAPress();
    } else {
        //reset wasHeld when A button is released
        wasHeld = false;
    }
    //check if Plus button is pressed
    if (gamepad.buttons[9].pressed) {
        OnPlusPress();
    }
    requestAnimationFrame(gamepadListener);
}
function OnAPress() {
    if (timer <= 0) {
        return;
    }
    //define joystick direction in neutral position
    var joystickDirection = -1;
    //shortcut to access p1 Gamepad
    const gamepad = navigator.getGamepads()[gamepadIndex];
    //console.log(gamepad.axes[1]);
    //shortcut to access joystick axes
    const xAxis = gamepad.axes[0];
    const yAxis = gamepad.axes[1];
    //check joystick direction
    if (yAxis < -0.75) {
        //up
        joystickDirection = 0;
    } else if (xAxis > 0.75) {
        //right
        joystickDirection = 1;
    } else if (yAxis > 0.75) {
        //down
        joystickDirection = 2;
    } else if (xAxis < -0.75) {
        //left
        joystickDirection = 3;
    } else {
        //neutral
        joystickDirection = -1;
    }
    //change score if joystick direction matches the random direction, the time has not run out, and the a button was pressed (not held)
    if (!wasHeld && joystickDirection == direction) {
        score += 1;
        //update score display
        document.getElementById("scoreBox").innerHTML = "Score: " + score;
    }
    if (score > highScore) {
        highScore = score;
        document.getElementById("highScoreBox").innerHTML = "High Score: " + highScore;
    }
    //console.log("A Button pressed");
    //set wasHeld to true to prevent score from increasing while button is held
    wasHeld = true;
}
function OnPlusPress() {
    //reload the page to reset the game
    location.reload();
}
function HighScore() {
    const data = {score: score};
    fetch('/api/endpoint', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        console.log('Recieved High Score:', result);
        document.getElementById("highScoreBox").innerHTML = "High Score: " + result['highscore'];
        highScore = result['highscore'];
    })
    .catch(error => {
        console.error('Error:', error);
    });
}