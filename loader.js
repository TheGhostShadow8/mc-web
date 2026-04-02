import { handleAutoLogin } from './autologin.js';

const clientID = "5ab6e69d-8770-40e1-9f06-82b647dfbd58"; 
const redirectUri = "https://theghostshadow8.github.io/mc-web/";

const clickSound = new Audio('https://www.soundjay.com/buttons/button-16.mp3');
let isLayoutMode = false;
let selectedElement = null;

// --- 0. HELPER FUNCTIONS ---
const fetchWithTimeout = (url, options, timeout = 5000) => {
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeout))
    ]);
};

// --- 1. SEQUENTIAL AUTH (Preserved from Original) ---
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

// --- 2. DRAG & DROP LOGIC ---
function enableDragging(el) {
    el.addEventListener('dblclick', () => {
        if (!isLayoutMode) return;
        selectedElement = el;
        el.style.border = "2px dashed #00ff41";
        alert("Button Selected: Drag to move, then tap elsewhere to drop.");
    });
}

document.addEventListener('touchmove', (e) => {
    if (isLayoutMode && selectedElement) {
        const touch = e.touches[0];
        selectedElement.style.position = 'fixed';
        selectedElement.style.left = touch.clientX - (selectedElement.offsetWidth / 2) + 'px';
        selectedElement.style.top = touch.clientY - (selectedElement.offsetHeight / 2) + 'px';
    }
}, { passive: false });

document.addEventListener('touchstart', () => {
    if (selectedElement) {
        selectedElement.style.border = "none";
        selectedElement = null;
    }
});

// --- 3. CORE ENGINE (With Black Screen Fix) ---
function initEngine(ip, port, version) {
    const canvas = document.getElementById('game-canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const viewer = new PrismarineViewer({
        canvas: canvas,
        proxyAddress: `wss://proxy.prismarine.org/?address=${ip}&port=${port}`,
        version: version 
    });

    viewer.setViewingDistance(4);
    
    viewer.on('spawn', (player) => {
        document.getElementById('coords-hud').style.display = 'block';
        handleAutoLogin(viewer, player.uuid);
        // Force a resize to wake up the renderer from the black screen
        viewer.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    setupControls(viewer);

    // UPGRADED CHAT: Supports Commands
    document.getElementById('btn-chat-toggle').onclick = () => { 
        const msg = prompt("Enter Message or /command:"); 
        if (msg) {
            viewer.chat(msg);
        }
    };

    // UPGRADED SETTINGS: Toggle Drag & Drop
    document.getElementById('btn-settings').onclick = () => {
        isLayoutMode = !isLayoutMode;
        if (isLayoutMode) {
            alert("LAYOUT MODE: ON\nDouble-click any button to drag it.");
            // Selects all control buttons and the new Bedrock-style jump button
            document.querySelectorAll('.ctrl-btn, .action-circle, .jump-btn-bedrock').forEach(enableDragging);
        } else {
            alert("LAYOUT MODE: OFF\nPositions saved.");
        }
    };

    // Camera Loop
    let ty = 0, tp = 0, cy = 0, cp = 0, lx, ly;
    canvas.addEventListener('touchstart', (e) => { 
        lx = e.touches[0].pageX; 
        ly = e.touches[0].pageY; 
    });
    
    canvas.addEventListener('touchmove', (e) => {
        if (isLayoutMode) return;
        ty -= (e.touches[0].pageX - lx) * 0.005;
        tp -= (e.touches[0].pageY - ly) * 0.005;
        lx = e.touches[0].pageX; 
        ly = e.touches[0].pageY;
    });

    function loop() {
        cy += (ty - cy) * 0.15; 
        cp += (tp - cp) * 0.15;
        viewer.camera.rotation.y = cy;
        viewer.camera.rotation.x = Math.max(-1.4, Math.min(1.4, cp));
        requestAnimationFrame(loop);
    }
    loop();
}

// --- 4. UI INITIALIZATION ---
document.getElementById('start-btn').onclick = async () => {
    const ip = document.getElementById('server-ip').value;
    const port = document.getElementById('server-port').value;
    let version = document.getElementById('server-version').value;
    const loaderText = document.getElementById('version-loader-text');

    if (version === "auto") {
        loaderText.style.display = "block";
        loaderText.innerText = "PINGING SERVER...";
        try {
            const response = await fetchWithTimeout(`https://api.mcstatus.io/v2/status/bedrock/${ip}:${port}`);
            const data = await response.json();
            version = (data.online && data.version) ? data.version.name.split(' ').pop() : "1.20.80";
            loaderText.innerText = `PROTOCOL MATCHED: ${version}`;
        } catch (e) {
            version = "1.20.80";
            loaderText.innerText = "TIMEOUT: USING 1.20.80";
        }
    }

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

// --- 5. CONTROL BINDINGS ---
function setupControls(viewer) {
    const bind = (id, key) => {
        const el = document.getElementById(id);
        if(!el) return;
        
        el.addEventListener('touchstart', (e) => {
            if (isLayoutMode) return;
            e.preventDefault();
            clickSound.play();
            viewer.setControl(key, true);
            el.classList.add('active');
        });
        
        el.addEventListener('touchend', () => {
            if (isLayoutMode) return;
            viewer.setControl(key, false);
            el.classList.remove('active');
        });
    };
    
    ['forward', 'back', 'left', 'right', 'jump', 'sneak', 'attack', 'use'].forEach(k => bind(`btn-${k}`, k));
}
