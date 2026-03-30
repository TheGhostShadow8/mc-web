 // --- 1. CONFIGURATION ---
const clientID = "5ab6e69d-8770-40e1-9f06-82b647dfbd58"; 
const VALID_OTP = "123456"; 
const REDIRECT_URI = encodeURIComponent("https://theghostshadow8.github.io/mc-web/");

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
const gameCanvas = document.getElementById('game-canvas');

// --- 3. SECURITY & AUTH ---
document.getElementById('send-otp-btn').addEventListener('click', () => {
    if (document.getElementById('user-email').value.includes('@')) {
        authStep1.style.display = "none";
        authStep2.style.display = "block";
    }
});

document.getElementById('verify-btn').addEventListener('click', () => {
    if (document.getElementById('otp-input').value === VALID_OTP) {
        authStep2.style.display = "none";
        msSyncSection.style.display = "block";
    }
});

document.getElementById('real-ms-btn').addEventListener('click', () => {
    const msAuthUrl = `https://login.live.com/oauth20_authorize.srf?client_id=${clientID}&response_type=token&scope=XboxLive.signin&redirect_uri=${REDIRECT_URI}`;
    window.location.href = msAuthUrl;
});

window.addEventListener('load', () => {
    if (window.location.hash.includes("access_token")) {
        authStep1.style.display = "none";
        msSyncSection.style.display = "none";
        serverDetails.style.display = "block";
        loginStatus.innerText = "Microsoft Sync: SUCCESS";
        loginStatus.style.color = "#00ff41";
    }
});

// --- 4. ENGINE LAUNCHER ---
document.getElementById('start-btn').addEventListener('click', () => {
    const ipInput = document.getElementById('server-ip').value.trim();
    const portInput = document.getElementById('server-port').value.trim();

    // Cleaning the IP (Removes :48439 if you accidentally pasted it in the IP box)
    const cleanIP = ipInput.includes(':') ? ipInput.split(':')[0] : ipInput;

    serverBox.style.display = 'none';
    loaderContainer.style.display = 'flex';

    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(() => {
                loaderContainer.style.display = 'none';
                gameCanvas.style.display = 'block';
                initGameEngine(cleanIP, portInput);
            }, 800);
        }
        progressBar.style.width = progress + '%';
        statusText.innerText = progress < 50 ? "Encrypting Tunnel..." : "Spawning World...";
    }, 150);
});

// --- 5. THE CORE ENGINE ---
function initGameEngine(serverIP, serverPort) {
    const proxyURL = `wss://proxy.prismarine.org/?address=${serverIP}&port=${serverPort}`;
    try {
        const viewer = new PrismarineViewer({
            canvas: gameCanvas,
            proxyAddress: proxyURL,
            version: '1.21.10'
        });
    } catch (e) {
        alert("Fatal Engine Error. Check Aternos.");
    }
}
