const clientID = "5ab6e69d-8770-40e1-9f06-82b647dfbd58"; 
// This MUST match your Azure screenshot exactly
const redirectUri = "https://theghostshadow8.github.io/mc-web/"; 

// --- 1. AUTH LOGIC ---
document.getElementById('send-otp-btn').onclick = () => {
    document.getElementById('auth-step-1').style.display='none';
    document.getElementById('auth-step-2').style.display='block';
};
document.getElementById('verify-btn').onclick = () => {
    // Standard verification check
    if(document.getElementById('otp-input').value === "123456") {
        document.getElementById('auth-step-2').style.display='none';
        document.getElementById('ms-sync').style.display='block';
    }
};
document.getElementById('real-ms-btn').onclick = () => {
    // Encoded URL for Microsoft Login
    const url = `https://login.live.com/oauth20_authorize.srf?client_id=${clientID}&response_type=token&scope=XboxLive.signin&redirect_uri=${encodeURIComponent(redirectUri)}`;
    window.location.href = url;
};

// Check for return from Microsoft
if(window.location.hash.includes("access_token")) {
    document.getElementById('auth-step-1').style.display='none';
    document.getElementById('ms-sync').style.display='none';
    document.getElementById('server-details').style.display='block';
}

// --- 2. ENGINE LAUNCHER ---
document.getElementById('start-btn').addEventListener('click', () => {
    const ip = document.getElementById('server-ip').value.trim();
    const port = document.getElementById('server-port').value.trim();

    if(!ip || !port) {
        alert("Please enter Server Details!");
        return;
    }

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

// --- 3. CORE ENGINE ---
function startGhostShadowEngine(ip, port) {
    const canvas = document.getElementById('game-canvas');
    const viewer = new PrismarineViewer({
        canvas: canvas,
        proxyAddress: `wss://proxy.prismarine.org/?address=${ip}&port=${port}`,
        version: '1.20.1' 
    });

    const bind = (id, key) => {
        const el = document.getElementById(id);
        el.addEventListener('touchstart', (e) => { e.preventDefault(); viewer.setControl(key, true); el.classList.add('active'); });
        el.addEventListener('touchend', (e) => { e.preventDefault(); viewer.setControl(key, false); el.classList.remove('active'); });
    };

    ['forward', 'back', 'left', 'right', 'jump', 'sneak', 'attack', 'use'].forEach(k => bind(`btn-${k}`, k));

    // Smooth Camera Implementation
    let targetYaw = 0, targetPitch = 0, currentYaw = 0, currentPitch = 0, lastX, lastY;

    canvas.addEventListener('touchstart', (e) => { lastX = e.touches[0].pageX; lastY = e.touches[0].pageY; });
    canvas.addEventListener('touchmove', (e) => {
        targetYaw -= (e.touches[0].pageX - lastX) * 0.005;
        targetPitch -= (e.touches[0].pageY - lastY) * 0.005;
        lastX = e.touches[0].pageX; lastY = e.touches[0].pageY;
    });

    function animate() {
        currentYaw += (targetYaw - currentYaw) * 0.15;
        currentPitch += (targetPitch - currentPitch) * 0.15;
        viewer.camera.rotation.y = currentYaw;
        viewer.camera.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, currentPitch));
        requestAnimationFrame(animate);
    }
    animate();
}
