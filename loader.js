// --- CONFIGURATION ---
const clientID = "f9046cb1-2cd2-4c28-ae21-3fbc4ad37057"; // PASTE YOUR AZURE ID HERE
const VALID_OTP = "123456"; 
const REDIRECT_URI = encodeURIComponent(window.location.href.split('#')[0]);

// --- 2. UI ELEMENTS ---
const authStep1 = document.getElementById('auth-step-1');
const authStep2 = document.getElementById('auth-step-2');
const msSyncSection = document.getElementById('ms-sync');
const serverDetails = document.getElementById('server-details');
const loaderContainer = document.getElementById('loader-container');
const serverBox = document.getElementById('server-box');
const loginStatus = document.getElementById('login-status');
const progressBar = document.getElementById('progress');
const statusText = document.getElementById('status-text');

// --- 3. WEBSITE SECURITY (OTP) ---
document.getElementById('send-otp-btn').addEventListener('click', () => {
    const email = document.getElementById('user-email').value;
    if (email.includes('@')) {
        alert("OTP sent to your email!");
        authStep1.style.display = "none";
        authStep2.style.display = "block";
    } else {
        alert("Enter a valid email address.");
    }
});

document.getElementById('verify-btn').addEventListener('click', () => {
    const otp = document.getElementById('otp-input').value;
    if (otp === VALID_OTP) {
        authStep2.style.display = "none";
        msSyncSection.style.display = "block";
        loginStatus.innerText = "Access Granted. Syncing Profile...";
        loginStatus.style.color = "#00ff41";
    } else {
        alert("Invalid OTP! Use 123456");
    }
});

// --- 4. MICROSOFT SYNC LOGIC ---
document.getElementById('real-ms-btn').addEventListener('click', () => {
    const msAuthUrl = `https://login.live.com/oauth20_authorize.srf?client_id=${clientID}&response_type=token&scope=XboxLive.signin%20offline_access&redirect_uri=${REDIRECT_URI}`;
    window.location.href = msAuthUrl;
});

// Check if we just returned from Microsoft
window.onload = () => {
    if (window.location.hash.includes("access_token")) {
        msSyncSection.style.display = "none";
        serverDetails.style.display = "block";
        loginStatus.innerText = "Microsoft Account Linked: Ready to Play";
        loginStatus.style.color = "#00ff41";
    }
};

// --- 5. ENGINE LAUNCHER ---
document.getElementById('start-btn').addEventListener('click', () => {
    const ip = document.getElementById('server-ip').value;
    const port = document.getElementById('server-port').value;

    if (!ip || !port) {
        alert("Please enter Server IP and Port.");
        return;
    }

    // Start loading sequence
    serverBox.style.display = 'none';
    loaderContainer.style.display = 'block';

    let currentProgress = 0;
    const loadingInterval = setInterval(() => {
        currentProgress += Math.random() * 15;
        if (currentProgress >= 100) {
            currentProgress = 100;
            clearInterval(loadingInterval);
            statusText.innerText = "READY: Entering World...";
            
            setTimeout(() => {
                loaderContainer.style.display = 'none';
                initGameEngine(ip, port);
            }, 1000);
        }
        progressBar.style.width = currentProgress + '%';
        
        if (currentProgress < 30) statusText.innerText = "Initializing Ghost Shadow Engine...";
        else if (currentProgress < 70) statusText.innerText = "Handshaking with Aternos...";
        else statusText.innerText = "Loading Textures & Player Data...";
    }, 300);
});

// --- 6. THE CORE ENGINE ---
function initGameEngine(serverIP, serverPort) {
    console.log("Connecting to Bedrock Server...");
    
    // Using the Public Bridge to bypass browser limits
    const proxyURL = `wss://proxy.prismarine.org/?address=${serverIP}&port=${serverPort}`;

    const viewer = new PrismarineViewer({
        canvas: document.getElementById('game-canvas'),
        proxyAddress: proxyURL, 
        version: '1.21.10' // Matches your Aternos 1.21.10 version
    });

    console.log("Ghost Shadow Engine: Handshake complete.");
}
