// Selecting elements from our HTML
const startBtn = document.getElementById('start-btn');
const loginBtn = document.getElementById('ms-login-btn');
const loaderContainer = document.getElementById('loader-container');
const serverBox = document.getElementById('server-box');
const progress = document.getElementById('progress');
const statusText = document.getElementById('status');
const loginStatus = document.getElementById('login-status');

let isPlayerLoggedIn = false;

// 1. Microsoft Login Logic
loginBtn.addEventListener('click', () => {
    loginStatus.innerText = "Authenticating with Microsoft...";
    loginStatus.style.color = "#ffeb3b"; // Yellow while waiting

    // Simulate a secure login delay
    setTimeout(() => {
        isPlayerLoggedIn = true;
        loginStatus.innerText = "Logged in as: GhostShadow_Pro";
        loginStatus.style.color = "#00ff41"; // Green when success
        loginBtn.style.display = "none"; // Hide button after login
    }, 2000);
});

// 2. The Engine Connector
startBtn.addEventListener('click', () => {
    const world = document.getElementById('world-name').value;
    const ip = document.getElementById('server-ip').value;
    const port = document.getElementById('server-port').value;

    // Validation: Don't start if boxes are empty
    if (!ip || !port) {
        alert("CRITICAL ERROR: Please enter Server IP and Port.");
        return;
    }
    
    if (!isPlayerLoggedIn) {
        alert("SECURITY ALERT: Please log in with Microsoft first.");
        return;
    }

    // Hide the input UI and show the loading bar
    serverBox.style.display = "none";
    loaderContainer.style.display = "block";
    
    let currentProgress = 0;

    // Simulate the engine "handshake" with the Minecraft server
    const loadingSequence = setInterval(() => {
        if (currentProgress >= 100) {
            clearInterval(loadingSequence);
            statusText.innerText = `READY: Entering ${world || 'Minecraft World'}...`;
            
            // Final transition to the game screen
            setTimeout(() => {
                document.getElementById('loading-screen').style.opacity = '0';
                setTimeout(() => {
                    document.getElementById('loading-screen').style.display = 'none';
                    document.getElementById('game-canvas').style.display = 'block';
                    initGameEngine(ip, port);
                }, 500);
            }, 1000);

        } else {
            currentProgress += Math.random() * 15;
            if (currentProgress > 100) currentProgress = 100;
            progress.style.width = currentProgress + '%';
            
            // Change status messages based on percentage
            if (currentProgress < 25) statusText.innerText = "Initializing WASM Engine...";
            else if (currentProgress < 50) statusText.innerText = `Pinging ${ip}...`;
            else if (currentProgress < 75) statusText.innerText = "Downloading Chunk Buffers...";
            else statusText.innerText = "Finalizing Handshake...";
        }
    }, 300);
});

// 3. The Actual Game Initialization
function initGameEngine(serverIP, serverPort) {
    console.log(`Connecting to ${serverIP}:${serverPort} via Ghost Shadow Engine`);
    // This is where the Prismarine Viewer library takes over the Canvas
    // and renders the 3D world using WebGL.
}
