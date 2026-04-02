import { handleAutoLogin } from './autologin.js';

const clientID = "5ab6e69d-8770-40e1-9f06-82b647dfbd58"; 
const redirectUri = "https://theghostshadow8.github.io/mc-web/"; // Must match Azure

const clickSound = new Audio('https://www.soundjay.com/buttons/button-16.mp3');

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

// --- 3. CORE ENGINE (DYNAMIC VERSION) ---
function initEngine(ip, port) {
    // Get the version from the dropdown or default to 1.20.80
    const selectedVersion = document.getElementById('server-version').value || '1.20.80'; 

    const viewer = new PrismarineViewer({
        canvas: document.getElementById('game-canvas'),
        // Robust proxy for multiple protocols
        proxyAddress: `wss://proxy.prismarine.org/?address=${ip}&port=${port}`, 
        version: selectedVersion 
    });

    viewer.on('spawn', (player) => {
        handleAutoLogin(viewer, player.uuid);
        document.getElementById('coords-hud').style.display = 'block';
    });

    setupControls(viewer);

    // FIX: Make Chat and Settings work with the active viewer
    document.getElementById('btn-chat-toggle').onclick = () => { 
        const m = prompt("Chat:"); 
        if(m) viewer.chat(m); 
    };
    document.getElementById('btn-settings').onclick = () => {
        alert(`Currently running version: ${selectedVersion}\nSensitivity: 0.005`);
    };

    // Camera Sensitivity Fix
    let ty = 0, tp = 0, cy = 0, cp = 0, lx, ly;
    document.getElementById('game-canvas').addEventListener('touchmove', (e) => {
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

document.getElementById('start-btn').onclick = () => {
    const ip = document.getElementById('server-ip').value;
    const port = document.getElementById('server-port').value;
    document.getElementById('server-box').style.display = 'none';
    document.getElementById('loader-container').style.display = 'flex';
    setTimeout(() => {
        document.getElementById('loader-container').style.display = 'none';
        document.getElementById('game-canvas').style.display = 'block';
        document.getElementById('mobile-controls').style.display = 'block';
        initEngine(ip, port);
    }, 2000);
};
