const clientID = "5ab6e69d-8770-40e1-9f06-82b647dfbd58"; 
const redirectUri = "https://theghostshadow8.github.io/mc-web/"; 

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

// --- 2. JOIN LOGIC ---
document.getElementById('start-btn').onclick = () => {
    const ip = document.getElementById('server-ip').value.trim();
    const port = document.getElementById('server-port').value.trim();
    document.getElementById('server-box').style.display = 'none';
    document.getElementById('loader-container').style.display = 'flex';

    let prog = 0;
    const interval = setInterval(() => {
        prog += 2;
        document.getElementById('progress').style.width = prog + '%';
        if(prog >= 100) {
            clearInterval(interval);
            document.getElementById('loader-container').style.display = 'none';
            document.getElementById('game-canvas').style.display = 'block';
            document.getElementById('mobile-controls').style.display = 'block';
            document.getElementById('crosshair').style.display = 'block';
            initEngine(ip, port);
        }
    }, 40);
};

// --- 3. CORE ENGINE ---
function initEngine(ip, port) {
    const viewer = new PrismarineViewer({
        canvas: document.getElementById('game-canvas'),
        proxyAddress: `wss://proxy.prismarine.org/?address=${ip}&port=${port}`,
        version: '1.20.1'
    });

    const bind = (id, key) => {
        const el = document.getElementById(id);
        el.addEventListener('touchstart', (e) => {
            e.preventDefault();
            viewer.setControl(key, true);
            el.classList.add('active');
            if(navigator.vibrate) navigator.vibrate(40);
        });
        el.addEventListener('touchend', (e) => {
            e.preventDefault();
            viewer.setControl(key, false);
            el.classList.remove('active');
        });
    };

    ['forward', 'back', 'left', 'right', 'jump', 'sneak', 'attack', 'use'].forEach(k => bind(`btn-${k}`, k));

    let ty = 0, tp = 0, cy = 0, cp = 0, lx, ly;
    document.getElementById('game-canvas').addEventListener('touchstart', (e) => { 
        lx = e.touches[0].pageX; ly = e.touches[0].pageY; 
    });
    document.getElementById('game-canvas').addEventListener('touchmove', (e) => {
        ty -= (e.touches[0].pageX - lx) * 0.006;
        tp -= (e.touches[0].pageY - ly) * 0.006;
        lx = e.touches[0].pageX; ly = e.touches[0].pageY;
    });

    function loop() {
        cy += (ty - cy) * 0.15; cp += (tp - cp) * 0.15;
        viewer.camera.rotation.y = cy;
        viewer.camera.rotation.x = Math.max(-1.5, Math.min(1.5, cp));
        requestAnimationFrame(loop);
    }
    loop();
}
