/**
 * Ghost Shadow Engine - Dynamic Server Status Checker
 * This script monitors the specific IP and Port entered by the user.
 */

function updateServerStatus() {
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-display-text');
    
    // Grab the current values from your index.html input boxes
    const currentIP = document.getElementById('server-ip').value;
    const currentPort = document.getElementById('server-port').value;

    if (!currentIP) {
        statusText.innerText = "Waiting for IP...";
        return;
    }

    // API used to check Bedrock/Aternos status
    const apiUrl = `https://api.mcstatus.io/v2/status/bedrock/${currentIP}:${currentPort}`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) throw new Error("Network issue");
            return response.json();
        })
        .then(data => {
            if (data.online) {
                // Server is UP
                statusDot.style.backgroundColor = "#00ff41"; 
                statusDot.style.boxShadow = "0 0 10px #00ff41";
                statusText.innerText = `ONLINE | ${data.players.online} Players`;
                statusText.style.color = "#00ff41";
            } else {
                // Server is DOWN
                statusDot.style.backgroundColor = "#ff0000"; 
                statusDot.style.boxShadow = "0 0 10px #ff0000";
                statusText.innerText = "OFFLINE | Start Aternos";
                statusText.style.color = "#ff4444";
            }
        })
        .catch(err => {
            statusText.innerText = "Checking...";
            statusDot.style.backgroundColor = "#555";
        });
}

// 1. Check immediately when the page loads
updateServerStatus();

// 2. Refresh status every 20 seconds to keep it live
setInterval(updateServerStatus, 20000);

// 3. Update status immediately if the user types a new IP/Port
document.getElementById('server-ip').addEventListener('change', updateServerStatus);
document.getElementById('server-port').addEventListener('change', updateServerStatus);
