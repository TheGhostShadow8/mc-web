/**
 * GHOST SHADOW ENGINE - RESILIENT STATUS PROTOCOL
 * Optimized for Aternos SRV records.
 */

async function updateServerStatus() {
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-display-text');
    const launchBtn = document.getElementById('start-btn');
    
    const currentIP = document.getElementById('server-ip').value || "Occults.aternos.me";
    const currentPort = document.getElementById('server-port').value || "48439";

    if (!currentIP) {
        statusText.innerText = "WAITING FOR CONFIG...";
        return;
    }

    // Switched to mcapi.us which is more reliable for Aternos Bedrock pings
    const apiUrl = `https://mcapi.us/server/status?ip=${currentIP}&port=${currentPort}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        // Aternos sometimes reports 'online' as true but 'players' as null if it's booting
        if (data.online) {
            statusDot.style.backgroundColor = "#00ff41"; 
            statusDot.style.boxShadow = "0 0 12px #00ff41";
            statusText.innerText = `ONLINE | ${data.players.now}/${data.players.max}`;
            statusText.style.color = "#00ff41";
            if(launchBtn) launchBtn.style.border = "2px solid #00ff41";
        } else {
            statusDot.style.backgroundColor = "#ff0000"; 
            statusDot.style.boxShadow = "0 0 12px #ff0000";
            statusText.innerText = "OFFLINE | RE-CHECKING...";
            statusText.style.color = "#ff4444";
            if(launchBtn) launchBtn.style.border = "none";
        }
    } catch (err) {
        statusText.innerText = "CONNECTION DELAY...";
        statusDot.style.backgroundColor = "#555";
    }
}

// Initial check
updateServerStatus();

// Aternos can be slow, so we check every 20 seconds
setInterval(updateServerStatus, 20000);

// Update when you stop typing
let typingTimer;
document.getElementById('server-ip').addEventListener('keyup', () => {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(updateServerStatus, 1000);
});
