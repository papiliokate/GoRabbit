document.addEventListener("DOMContentLoaded", () => {
    const frame = document.getElementById("game-frame");
    const wrapper = document.getElementById("device-wrapper");
    const select = document.getElementById("device-preset");
    const btnRotate = document.getElementById("btn-rotate-device");
    const btnReload = document.getElementById("btn-reload-frame");
    const consoleEl = document.getElementById("dev-console");

    let isLandscape = false;

    // Devices Config
    const devices = {
        responsive: { w: '100%', h: '100%', baseClass: 'responsive' },
        iphone14: { w: 390, h: 844, baseClass: '' },
        iphone14promax: { w: 430, h: 932, baseClass: '' },
        ipadmini: { w: 768, h: 1024, baseClass: '' }
    };

    function log(msg, type = "system") {
        const div = document.createElement("div");
        div.className = `log-entry ${type}`;
        
        const now = new Date();
        const time = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
        div.textContent = `[${time}] ${msg}`;
        
        consoleEl.appendChild(div);
        consoleEl.scrollTop = consoleEl.scrollHeight;
    }

    function applyDevice() {
        const preset = select.value;
        const config = devices[preset];
        
        if (config.baseClass === 'responsive') {
            wrapper.className = 'responsive';
            wrapper.style.width = '';
            wrapper.style.height = '';
            btnRotate.disabled = true;
            btnRotate.style.opacity = '0.5';
        } else {
            wrapper.className = '';
            let width = isLandscape ? config.h : config.w;
            let height = isLandscape ? config.w : config.h;
            wrapper.style.width = `${width}px`;
            wrapper.style.height = `${height}px`;
            btnRotate.disabled = false;
            btnRotate.style.opacity = '1';
        }
        log(`Device changed to ${preset} (Landscape: ${isLandscape})`);
    }

    select.addEventListener("change", applyDevice);
    
    btnRotate.addEventListener("click", () => {
        if (select.value === 'responsive') return;
        isLandscape = !isLandscape;
        applyDevice();
    });

    btnReload.addEventListener("click", () => {
        log("Reloading iframe...");
        frame.contentWindow.location.reload();
    });

    // Initial setup
    applyDevice();

    // Outbound Messages
    function sendCommand(action, payload = {}) {
        log(`Sent: ${action}`, "outgoing");
        frame.contentWindow.postMessage({ type: action, ...payload }, "*");
    }

    document.getElementById("btn-grant-points").addEventListener("click", () => sendCommand("ADD_POINTS", { amount: 50 }));
    document.getElementById("btn-mock-purchase").addEventListener("click", () => sendCommand("MOCK_PURCHASE"));
    document.getElementById("btn-force-win").addEventListener("click", () => sendCommand("FORCE_WIN"));
    
    const resetBtn = document.getElementById("btn-reset-data");
    if (resetBtn) {
        resetBtn.addEventListener("click", () => sendCommand("RESET_DATA"));
    }

    // Incoming Messages
    window.addEventListener("message", (e) => {
        if (!e.data || typeof e.data !== 'object') return;
        
        if (e.data.type === "GAME_LOADED") {
            log("Game Ready Signal Received", "incoming");
        } else if (e.data.type === "PURCHASE_SUCCESS") {
            log("Game Appreciated Mock Purchase", "incoming");
        } else if (e.data.type === "LOG") {
            log(`Game: ${e.data.message}`, "incoming");
        }
    });

    // Frame load event
    frame.addEventListener("load", () => {
        log("iframe loaded 'index.html'");
    });
});
