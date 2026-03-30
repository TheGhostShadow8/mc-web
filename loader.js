const clientID = "5ab6e69d-8770-40e1-9f06-82b647dfbd58"; 
const redirectUri = "https://theghostshadow8.github.io/"; 

// --- 1. AUTH LOGIC ---
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

// --- 2. ENGINE LAUNCHER ---
document.getElementById('start-btn').addEventListener('click', () => {
    const ip = document.getElementById('server-ip').value.trim();
    const port = document.getElementById('server-port').value.trim();

    document.getElementById('server-box').style.display = 'none';
    document.getElementById('loader-container').style.display = 'flex';

    let progress = 0;
    const loadInt = setInterval(() => {
        progress += 5;
        document.getElementById('progress').style.width = progress + '%';
        if(progress >= 100) {
            clearInterval(loadInt);
            document.getElementById('loader-container').style.display = 'none';
            document.getElementById('game-canvas').style.display = 'block';
            document.getElementById('mobile-controls').style.display = 'block';
            startGhostShadowEngine(ip, port);
        }
    }, 50);
});

// --- 3. SMOOTH CAMERA & ENGINE ---
function startGhostShadowEngine(ip, port) {
    const canvas = document.getElementById('game-canvas');
    const viewer = new PrismarineViewer({
        canvas: canvas,
        proxyAddress: `wss://proxy.prismarine.org/?address=${ip}&port=${port}`,
        version: '1.20.1' 
    });

    // Touch Controls Mapping
    const bind = (id, key) => {
        const el = document.getElementById(id);
        const start = (e) => { e.preventDefault(); viewer.setControl(key, true); el.classList.add('active'); };
        const end = (e) => { e.preventDefault(); viewer.setControl(key, false); el.classList.remove('active'); };
        el.addEventListener('touchstart', start);
        el.addEventListener('touchend', end);
    };

    ['forward', 'back', 'left', 'right', 'jump', 'sneak', 'attack', 'use'].forEach(k => {
        bind(`btn-${k}`, k);
    });

    // --- SMOOTH CAMERA LOGIC ---
    let targetYaw = 0, targetPitch = 0;
    let currentYaw = 0, currentPitch = 0;
    let lastX, lastY;

    canvas.addEventListener('touchstart', (e) => {
        lastX = e.touches[0].pageX;
        lastY = e.touches[0].pageY;
    });

    canvas.addEventListener('touchmove', (e) => {
        const dx = e.touches[0].pageX - lastX;
        const dy = e.touches[0].pageY - lastY;
        
        targetYaw -= dx * 0.005;
        targetPitch -= dy * 0.005;
        
        lastX = e.touches[0].pageX;
        lastY = e.touches[0].pageY;
    });

    // Frame update loop for Smoothness
    function animate() {
        // Lerp for smoothness (0.1 = higher smoothing)
        currentYaw += (targetYaw - currentYaw) * 0.15;
        currentPitch += (targetPitch - currentPitch) * 0.15;
        
        viewer.camera.rotation.y = currentYaw;
        viewer.camera.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, currentPitch));
        
        requestAnimationFrame(animate);
    }
    animate();

    // Chat
    document.getElementById('btn-chat-toggle').onclick = () => {
        const tray = document.getElementById('chat-overlay');
        tray.style.display = tray.style.display === 'none' ? 'flex' : 'none';
    };
    document.getElementById('btn-send-chat').onclick = () => {
        const msg = document.getElementById('chat-input').value;
        if(msg) { viewer.chat(msg); document.getElementById('chat-input').value = ''; }
    };
}
