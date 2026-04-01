/**
 * GHOST SHADOW ENGINE - STRICT STATUS PROTOCOL
 * Only pings when user provides IP and Port.
 */

async function updateServerStatus() {
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-display-text');
    const launchBtn = document.getElementById('start-btn');
    
    // STRICT CHECK: Do not use fallbacks here
    const currentIP = document.getElementById('server-ip').value;
    const currentPort = document.getElementById('server-port').value;

    // 1. If either box is empty, reset to "Waiting" state
    if (!currentIP || !currentPort) {
        statusText.innerText = "WAITING FOR CONFIG...";
        statusText.style.color = "#888";
        statusDot.style.backgroundColor = "#333";
        statusDot.style.boxShadow = "none";
        return;
    }

    // 2. Only proceed to API ping if we have data
    const apiUrl = `https://api.mcstatus.io/v2/status/bedrock/${currentIP}:${currentPort}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        // 3. Strict Online Validation: Must be fully 'online', not just 'queueing'
        if (data.online === true && data.version !== null) {
            statusDot.style.backgroundColor = "#00ff41"; 
            statusDot.style.boxShadow = "0 0 12px #00ff41";
            statusText.innerText = `ONLINE | ${data.players.online}/${data.players.max}`;
            statusText.style.color = "#00ff41";
            if(launchBtn) launchBtn.style.border = "2px solid #00ff41";
        } else {
            // Server is likely in Queue or Offline
            statusDot.style.backgroundColor = "#ff0000"; 
            statusDot.style.boxShadow = "0 0 12px #ff0000";
            statusText.innerText = "OFFLINE | START ATERNOS";
            statusText.style.color = "#ff4444";
            if(launchBtn) launchBtn.style.border = "none";
        }
    } catch (err) {
        statusText.innerText = "SYNC ERROR";
        statusDot.style.backgroundColor = "#555";
    }
}

// 4. Listen for real-time changes to the inputs
document.getElementById('server-ip').addEventListener('input', updateServerStatus);
document.getElementById('server-port').addEventListener('input', updateServerStatus);

// 5. Check every 20 seconds only if user is on the final step
setInterval(() => {
    if (document.getElementById('server-details').style.display !== 'none') {
        updateServerStatus();
    }
}, 20000);
