const clientID = "5ab6e69d-8770-40e1-9f06-82b647dfbd58"; 
const redirectUri = "https://theghostshadow8.github.io/"; // MUST match Azure portal exactly

// --- 1. AUTHENTICATION ---
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
    const url = `https://login.live.com/oauth20_authorize.srf?client_id=${clientID}&response_type=token&scope=XboxLive.signin&redirect_uri=${encodeURIComponent(redirectUri)}`;
    window.location.href = url;
};

// --- 2. ENGINE LAUNCHER ---
document.getElementById('start-btn').addEventListener('click', () => {
    const rawIP = document.getElementById('server-ip').value.trim();
    // Use Dyn IP if available for better stability
    const cleanIP = rawIP.includes(':') ? rawIP.split(':')[0] : rawIP;
    const port = document.getElementById('server-port').value.trim();

    document.getElementById('server-box').style.display = 'none';
    document.getElementById('loader-container').style.display = 'flex';

    let progress = 0;
    const bar = document.getElementById('progress');
    const loadInt = setInterval(() => {
        progress += 5;
        bar.style.width = progress + '%';
        if(progress >= 100) {
            clearInterval(loadInt);
            document.getElementById('loader-container').style.display = 'none';
            document.getElementById('game-canvas').style.display = 'block';
            document.getElementById('mobile-controls').style.display = 'block';
            startCrossplayEngine(cleanIP, port);
        }
    }, 50);
});

// --- 3. CORE CROSSPLAY ENGINE ---
function startCrossplayEngine(ip, port) {
    const canvas = document.getElementById('game-canvas');
    const viewer = new PrismarineViewer({
        canvas: canvas,
        proxyAddress: `wss://proxy.prismarine.org/?address=${ip}&port=${port}`,
        version: '1.20.1' // Stable protocol for Geyser crossplay
    });

    // Mobile Button Bindings
    const bind = (id, key) => {
        const el = document.getElementById(id);
        el.ontouchstart = (e) => { e.preventDefault(); viewer.setControl(key, true); el.classList.add('active-press'); };
        el.ontouchend = (e) => { e.preventDefault(); viewer.setControl(key, false); el.classList.remove('active-press'); };
    };

    bind('btn-forward', 'forward');
    bind('btn-back', 'back');
    bind('btn-left', 'left');
    bind('btn-right', 'right');
    bind('btn-jump', 'jump');
    bind('btn-sneak', 'sneak');
    bind('btn-attack', 'attack');
    bind('btn-use', 'use');

    // Touch Cam (Swipe to Look)
    let lx, ly;
    canvas.ontouchstart = (e) => { lx = e.touches[0].pageX; ly = e.touches[0].pageY; };
    canvas.ontouchmove = (e) => {
        viewer.camera.rotation.y -= (e.touches[0].pageX - lx) * 0.007;
        viewer.camera.rotation.x -= (e.touches[0].pageY - ly) * 0.007;
        lx = e.touches[0].pageX; ly = e.touches[0].pageY;
    };

    // Chat Logic
    document.getElementById('btn-chat-toggle').onclick = () => {
        const tray = document.getElementById('chat-overlay');
        tray.style.display = tray.style.display === 'none' ? 'flex' : 'none';
        if(tray.style.display === 'flex') document.getElementById('chat-input').focus();
    };

    document.getElementById('btn-send-chat').onclick = () => {
        const msg = document.getElementById('chat-input').value;
        if(msg) {
            viewer.chat(msg);
            document.getElementById('chat-input').value = '';
            document.getElementById('chat-overlay').style.display = 'none';
        }
    };
}
