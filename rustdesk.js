"use strict";

/*
 MeshCentral RustDesk Integration Plugin
 Version: 1.3.0
 Author: You
*/

module.exports.rustdesk = function (parent) {
    var obj = {};
    // Tell MeshCentral to send this function to the browser
    obj.exports = ['onDeviceRefreshEnd'];

    // This entire function runs inside the Web Browser
    obj.onDeviceRefreshEnd = function (nodeid, panel, refresh, event) {

        // ==========================================
        // 1. DEFINE HELPERS INSIDE THE BROWSER SCOPE
        // ==========================================
        const STORAGE_KEY = 'meshcentral_rustdesk_settings';

        function loadSettings() {
            try {
                return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
            } catch (e) {
                return {};
            }
        }

        function saveSettings(data) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }

        function getExePath() {
            return loadSettings().exePath || '';
        }

        function openSettings() {
            const current = getExePath();
            const path = prompt(
                "RustDesk client executable path (Optional):\n(Only used if running inside MeshCentral Router)",
                current || "C:\\Program Files\\RustDesk\\rustdesk.exe"
            );

            if (path !== null) {
                saveSettings({ exePath: path.trim() });
                // alert("Path saved."); // Optional feedback
            }
        }

        function launchRustdesk(path, id) {
            // Attempt 1: Advanced Launcher (MeshCentral Router / Desktop Wrapper)
            // We check if the environment supports running local commands
            try {
                if (window.parent && window.parent.parent && window.parent.parent.runLocalCommand && path) {
                    window.parent.parent.runLocalCommand({
                        exe: path,
                        args: [id],
                        detached: true
                    });
                    return; // Success, stop here
                }
            } catch (e) {
                console.log("RustDesk: Local launcher not available, falling back to protocol.");
            }

            // Attempt 2: Standard Browser Protocol (Chrome, Edge, Firefox)
            // This works 100% of the time if RustDesk is installed
            window.open("rustdesk://" + id, "_self");
        }

        // ==========================================
        // 2. MAIN UI LOGIC
        // ==========================================
        
        // Only run on the General Device Tab (Panel 10)
        if (panel !== 10) return; 

        let attempts = 0;
        const poller = setInterval(function () {
            attempts++;
            if (attempts > 20) {
                clearInterval(poller);
                return;
            }

            const header = document.getElementById('p10title');
            if (!header) return;

            // Prevent duplicate buttons
            if (document.getElementById('rustdesk_settings_btn')) {
                clearInterval(poller);
                return;
            }

            // Ensure we have device data
            if (typeof currentNode === 'undefined' || !currentNode) return;

            // --- A. DRAW SETTINGS BUTTON (GEAR) ---
            const settingsBtn = document.createElement('span');
            settingsBtn.id = 'rustdesk_settings_btn';
            settingsBtn.innerText = '⚙';
            settingsBtn.title = 'RustDesk Settings';
            settingsBtn.style.cssText = `
                display: inline-block;
                margin-left: 8px;
                cursor: pointer;
                font-size: 14px;
                vertical-align: middle;
            `;
            settingsBtn.onclick = function (e) {
                e.stopPropagation();
                openSettings(); // This now works because the function is in scope!
            };

            header.appendChild(settingsBtn);

            // --- B. FIND RUSTDESK ID ---
            let rdid = null;

            // Check Tags (rdid:123456)
            if (Array.isArray(currentNode.tags)) {
                currentNode.tags.forEach(t => {
                    if (t.startsWith('rdid:')) rdid = t.split(':')[1];
                });
            }

            // Check Description (Fallback if numeric)
            if (!rdid && /^\d+$/.test(currentNode.description || '')) {
                rdid = currentNode.description;
            }

            // --- C. DRAW LAUNCH BUTTON ---
            if (rdid) {
                const btn = document.createElement('span');
                btn.id = 'rustdesk_launch_btn';
                btn.innerText = 'RustDesk';
                btn.title = 'Connect via RustDesk (' + rdid + ')';
                btn.style.cssText = `
                    display: inline-block;
                    margin-left: 8px;
                    padding: 2px 8px;
                    background: #d32f2f;
                    color: #fff;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: 12px;
                    vertical-align: middle;
                `;
                btn.onclick = function (e) {
                    e.stopPropagation();
                    launchRustdesk(getExePath(), rdid);
                };

                header.appendChild(btn);
            }

            clearInterval(poller);

        }, 250);
    };

    return obj;
};
