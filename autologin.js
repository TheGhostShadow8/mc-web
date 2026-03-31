// --- PRIVATE AUTO-LOGIN CONFIG ---
const MY_PRIVATE_UUID = "YOUR_UUID_HERE"; // Replace with your actual offline UUID
const MY_PASSWORD = "YOUR_PASSWORD_HERE"; // Replace with your Aternos /login password

export function handleAutoLogin(viewer, playerUUID) {
    if (playerUUID === MY_PRIVATE_UUID) {
        console.log("UUID Verified. Sending Auto-Login...");
        setTimeout(() => {
            if (viewer.chat) viewer.chat(`/login ${MY_PASSWORD}`);
        }, 2500); 
    }
}
