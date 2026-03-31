/**
 * GHOST SHADOW ENGINE - LIVE STATUS PROTOCOL
 * Monitors the Aternos Bedrock server state.
 */

async function updateServerStatus() {
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-display-text');
    const launchBtn = document.getElementById('start-btn');
    
    const currentIP = document.getElementById('server-ip').value;
    const currentPort = document.getElementById('server-port').value || "19132";

    if (!currentIP) {
        statusText.innerText = "WAITING FOR CONFIG...";
        return;
    }

    // Connects to the Bedrock status API
    const apiUrl = `https://api.mcstatus.io/v2/status/bedrock/${currentIP}:${currentPort}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("API Offline");
        const data = await response.json();

        if (data.online) {
            // SERVER IS ONLINE
            statusDot.style.backgroundColor = "#00ff41"; 
            statusDot.style.boxShadow = "0 0 12px #00ff41";
            statusText.innerText = `ONLINE | ${data.players.online} PLAYERS`;
            statusText.style.color = "#00ff41";
            
            // Apply green border to Join button when ready
            if(launchBtn) launchBtn.style.border = "2px solid #00ff41";
        } else {
            // SERVER IS OFFLINE
            statusDot.style.backgroundColor = "#ff0000"; 
            statusDot.style.boxShadow = "0 0 12px #ff0000";
            statusText.innerText = "OFFLINE | START ATERNOS";
            statusText.style.color = "#ff4444";
            
            if(launchBtn) launchBtn.style.border = "none";
        }
    } catch (err) {
        statusText.innerText = "SYNCING...";
        statusDot.style.backgroundColor = "#555";
        statusDot.style.boxShadow = "none";
    }
}

// Initialize status check
updateServerStatus();

// Refresh every 15 seconds
setInterval(updateServerStatus, 15000);

// Instant update on input
document.getElementById('server-ip').addEventListener('input', updateServerStatus);
document.getElementById('server-port').addEventListener('input', updateServerStatus);
