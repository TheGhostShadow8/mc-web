// --- PRIVATE AUTO-LOGIN CONFIG ---
const MY_PRIVATE_UUID = "63690cb4-3d7e-3de6-82f0-fc736e41f00e"; // Replace with your actual offline UUID
const MY_PASSWORD = "R8O4N2I0"; // Replace with your Aternos /login password

export function handleAutoLogin(viewer, playerUUID) {
    if (playerUUID === MY_PRIVATE_UUID) {
        console.log("UUID Verified. Sending Auto-Login...");
        setTimeout(() => {
            if (viewer.chat) viewer.chat(`/login ${MY_PASSWORD}`);
        }, 2500); 
    }
}
