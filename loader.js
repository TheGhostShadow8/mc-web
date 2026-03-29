// Auth Flow Logic
const sendOtpBtn = document.getElementById('send-otp-btn');
const verifyBtn = document.getElementById('verify-btn');
const msSyncBtn = document.getElementById('real-ms-btn');

// 1. Send OTP (Simulated for now, real requires a backend like EmailJS)
sendOtpBtn.addEventListener('click', () => {
    const email = document.getElementById('user-email').value;
    if(email.includes('@')) {
        alert("OTP sent to your email!");
        document.getElementById('auth-step-1').style.display = "none";
        document.getElementById('auth-step-2').style.display = "block";
    }
});

// 2. Verify OTP
verifyBtn.addEventListener('click', () => {
    if(document.getElementById('otp-input').value === "123456") {
        document.getElementById('auth-step-2').style.display = "none";
        document.getElementById('ms-sync').style.display = "block";
    } else { alert("Wrong OTP!"); }
});

// 3. Real Microsoft Redirect
msSyncBtn.addEventListener('click', () => {
    // This URL tells Microsoft who you are and where to send the player back
    const clientID = "YOUR_CLIENT_ID_HERE"; // You get this from Azure Portal
    const redirect = encodeURIComponent(window.location.href);
    const msAuthUrl = `https://login.live.com/oauth20_authorize.srf?client_id=${clientID}&response_type=token&scope=XboxLive.signin%20offline_access&redirect_uri=${redirect}`;
    
    // Redirect to real Microsoft Login
    window.location.href = msAuthUrl;
});
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
    console.log("Connecting via Public WebSocket Bridge...");
    
    // This is a special 'Bridge' URL that handles the connection for you
    // It takes your Aternos IP and Port and translates it for the browser
    const proxyURL = `wss://proxy.prismarine.org/?address=${serverIP}&port=${serverPort}`;

    const viewer = new PrismarineViewer({
        canvas: document.getElementById('game-canvas'),
        proxyAddress: proxyURL, 
        version: '1.21.10' // Make sure this matches your Aternos version!
    });

    console.log("Ghost Shadow Engine: Handshake complete.");
}
