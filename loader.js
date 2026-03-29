const progress = document.getElementById('progress');
const status = document.getElementById('status');
const startBtn = document.getElementById('start-btn');

// Simulated Loading sequence
let width = 0;
const interval = setInterval(() => {
    if (width >= 100) {
        clearInterval(interval);
        status.innerText = "Engine Ready. Connection Established.";
        startBtn.style.display = "block";
    } else {
        width += Math.random() * 10;
        if (width > 100) width = 100;
        progress.style.width = width + '%';
        
        if (width < 30) status.innerText = "Loading Textures...";
        else if (width < 60) status.innerText = "Setting up WebGL...";
        else if (width < 90) status.innerText = "Connecting to Aternos Proxy...";
    }
}, 400);

startBtn.addEventListener('click', () => {
    document.getElementById('loading-screen').style.display = 'none';
    document.getElementById('game-canvas').style.display = 'block';
    console.log("Game Engine Started");
    // This is where the Prismarine Viewer would initialize the world
});
