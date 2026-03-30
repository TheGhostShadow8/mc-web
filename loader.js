const clientID = "5ab6e69d-8770-40e1-9f06-82b647dfbd58"; 

// --- AUTH LOGIC ---
document.getElementById('send-otp-btn').onclick = () => { document.getElementById('auth-step-1').style.display='none'; document.getElementById('auth-step-2').style.display='block'; };
document.getElementById('verify-btn').onclick = () => { if(document.getElementById('otp-input').value === "123456") { document.getElementById('auth-step-2').style.display='none'; document.getElementById('ms-sync').style.display='block'; } };
document.getElementById('real-ms-btn').onclick = () => { window.location.href = `https://login.live.com/oauth20_authorize.srf?client_id=${clientID}&response_type=token&scope=XboxLive.signin&redirect_uri=${encodeURIComponent(window.location.href)}`; };

// --- LAUNCH ENGINE ---
document.getElementById('start-btn').addEventListener('click', () => {
    const ip = document.getElementById('server-ip').value.trim().split(':')[0];
    const port = document.getElementById('server-port').value.trim();

    document.getElementById('server-box').style.display = 'none';
    document.getElementById('loader-container').style.display = 'flex';

    let p = 0;
    const itv = setInterval(() => {
        p += 10;
        document.getElementById('progress').style.width = p + '%';
        if(p >= 100) {
            clearInterval(itv);
            document.getElementById('loader-container').style.display = 'none';
            document.getElementById('game-canvas').style.display = 'block';
            document.getElementById('mobile-controls').style.display = 'block';
            initGameEngine(ip, port);
        }
    }, 100);
});

function initGameEngine(ip, port) {
    const viewer = new PrismarineViewer({
        canvas: document.getElementById('game-canvas'),
        proxyAddress: `wss://proxy.prismarine.org/?address=${ip}&port=${port}`,
        version: '1.21.10'
    });

    // --- MOBILE CONTROL MAPPING ---
    const bindBtn = (id, key) => {
        const btn = document.getElementById(id);
        btn.ontouchstart = (e) => { e.preventDefault(); viewer.setControl(key, true); btn.style.background = "rgba(0,255,65,0.5)"; };
        btn.ontouchend = (e) => { e.preventDefault(); viewer.setControl(key, false); btn.style.background = "rgba(255,255,255,0.15)"; };
    };

    bindBtn('btn-forward', 'forward');
    bindBtn('btn-back', 'back');
    bindBtn('btn-left', 'left');
    bindBtn('btn-right', 'right');
    bindBtn('btn-jump', 'jump');
    bindBtn('btn-sneak', 'sneak');

    // Menu Alerts
    document.getElementById('btn-chat').onclick = () => alert("Chat Protocol Active");
    document.getElementById('btn-settings').onclick = () => alert("Settings Engine Loading...");
}
