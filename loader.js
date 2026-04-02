import { handleAutoLogin } from './autologin.js';

const clientID = "5ab6e69d-8770-40e1-9f06-82b647dfbd58"; 
const redirectUri = "https://theghostshadow8.github.io/mc-web/"; // Must match Azure

const clickSound = new Audio('https://www.soundjay.com/buttons/button-16.mp3');

// --- 0. HELPER FUNCTIONS ---
const fetchWithTimeout = (url, options, timeout = 5000) => {
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeout))
    ]);
};

// --- 1. SEQUENTIAL AUTH ---
document.getElementById('send-otp-btn').onclick = () => {
    document.getElementById('auth-step-1').style.display='none';
    document.getElementById('auth-step-2').style.display='block';
};
document.getElementById('verify-btn').onclick = () => {
    if(document.getElementById('otp-input').value === "123456") {
        document.getElementById('auth-step-2').style.display='none';
        document.getElementById('ms-sync').style.display='block';
    }
};
document.getElementById('real-ms-btn').onclick = () => {
    window.location.href = `https://login.live.com/oauth20_authorize.srf?client_id=${clientID}&response_type=token&scope=XboxLive.signin&redirect_uri=${encodeURIComponent(redirectUri)}`;
};

if(window.location.hash.includes("access_token")) {
    document.getElementById('auth-step-1').style.display='none';
    document.getElementById('ms-sync').style.display='none';
    document.getElementById('server-details').style.display='block';
}

// --- 2. SPRINT & CONTROLS ---
let lastTap = 0;
function setupControls(viewer) {
    const bind = (id, key) => {
        const el = document.getElementById(id);
        el.addEventListener('touchstart', (e) => {
            e.preventDefault();
            clickSound.play();
            if(id === 'btn-forward') {
                const now = Date.now();
                if(now - lastTap < 300) viewer.setControl('sprint', true), el.classList.add('sprinting');
                lastTap = now;
            }
            viewer.setControl(key, true);
            el.classList.add('active');
        });
        el.addEventListener('touchend', () => {
            viewer.setControl(key, false);
            if(key === 'forward') viewer.setControl('sprint', false), el.classList.remove('sprinting');
            el.classList.remove('active');
        });
    };
    ['forward', 'back', 'left', 'right', 'jump', 'sneak', 'attack', 'use'].forEach(k => bind(`btn-${k}`, k));
}

// --- 3. CORE ENGINE ---
function initEngine(ip, port, version) {
    const canvas = document.getElementById('game-canvas');
    
    // Ensure canvas matches window size immediately to prevent black screen
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const viewer = new PrismarineViewer({
        canvas: canvas,
        proxyAddress: `wss://proxy.prismarine.org/?address=${ip}&port=${port}`,
        version: version 
    });

    // FORCE RENDER START & Mobile Optimization
    viewer.setViewingDistance(4); // Lower distance for mobile stability
    
    viewer.on('spawn', (player) => {
        console.log("Spawned!");
        handleAutoLogin(viewer, player.uuid);
        document.getElementById('coords-hud').style.display = 'block';
    });

    setupControls(viewer);

    document.getElementById('btn-chat-toggle').onclick = () => { 
        const m = prompt("Chat:"); 
        if(m) viewer.chat(m); 
    };
    document.getElementById('btn-settings').onclick = () => {
        alert(`Engine Protocol: ${version}\nSensitivity: 0.005`);
    };

    let ty = 0, tp = 0, cy = 0, cp = 0, lx, ly;
    canvas.addEventListener('touchmove', (e) => {
        ty -= (e.touches[0].pageX - lx) * 0.005;
        tp -= (e.touches[0].pageY - ly) * 0.005;
        lx = e.touches[0].pageX; ly = e.touches[0].pageY;
    });

    function loop() {
        cy += (ty - cy) * 0.15; cp += (tp - cp) * 0.15;
        viewer.camera.rotation.y = cy;
        viewer.camera.rotation.x = Math.max(-1.4, Math.min(1.4, cp));
        requestAnimationFrame(loop);
    }
    loop();
}

// --- 4. START BUTTON LOGIC ---
document.getElementById('start-btn').onclick = async () => {
    const ip = document.getElementById('server-ip').value;
    const port = document.getElementById('server-port').value;
    let version = document.getElementById('server-version').value;
    const loaderText = document.getElementById('version-loader-text');

    if (version === "auto") {
        loaderText.style.display = "block";
        loaderText.innerText = "PINGING SERVER...";
        try {
            // Use timeout so detection doesn't hang the screen
            const response = await fetchWithTimeout(`https://api.mcstatus.io/v2/status/bedrock/${ip}:${port}`);
            const data = await response.json();
            if (data.online && data.version) {
                version = data.version.name.split(' ').pop();
                loaderText.innerText = `PROTOCOL MATCHED: ${version}`;
            } else {
                version = "1.20.80"; 
                loaderText.innerText = "USING DEFAULT 1.20.80";
            }
        } catch (e) {
            console.log("Auto-detect failed, using fallback");
            version = "1.20.80";
            loaderText.innerText = "TIMEOUT: USING 1.20.80";
        }
    }

    // Proceed to loading sequence
    setTimeout(() => {
        document.getElementById('server-box').style.display = 'none';
        document.getElementById('loader-container').style.display = 'flex';
        
        setTimeout(() => {
            document.getElementById('loader-container').style.display = 'none';
            document.getElementById('game-canvas').style.display = 'block';
            document.getElementById('mobile-controls').style.display = 'block';
            initEngine(ip, port, version); 
        }, 2000);
    }, 1000);
};
