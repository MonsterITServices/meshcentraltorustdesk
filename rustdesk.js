"use strict";

/*
 MeshCentral RustDesk Integration Plugin
 Version: 1.3.0
 Author: You
*/

module.exports.rustdesk = function (parent) {
    var obj = {};
    obj.parent = parent;
    obj.exports = ['onDeviceRefreshEnd'];

    console.log("RUSTDESK 1.3.0: Plugin loaded");

    obj.onDeviceRefreshEnd = function (nodeid, panel, refresh, event) {

        // Only inject on General tab (panel 10)
        if (panel !== 10) return;

        let tries = 0;
        const maxTries = 20;

        const poller = setInterval(function () {
            tries++;
            if (tries > maxTries) {
                clearInterval(poller);
                return;
            }

            // Avoid duplicate buttons
            if (document.getElementById('rustdesk_launch_btn')) {
                clearInterval(poller);
                return;
            }

            // Locate the device title header (stable selector)
            const header = document.querySelector('.devicetitle');
            if (!header) return;

            // Get node safely from MeshCentral
            const node = parent.nodes[nodeid];
            if (!node || !node.tags) return;

            // Extract RustDesk ID from tags: rdid:123456
            let rustdeskId = null;
            node.tags.forEach(tag => {
                if (tag.startsWith('rdid:')) {
                    rustdeskId = tag.split(':')[1];
                }
            });

            // Validate ID
            if (!rustdeskId || !/^\d+$/.test(rustdeskId)) {
                clearInterval(poller);
                return;
            }

            console.log("RUSTDESK: Found ID", rustdeskId);

            // Create button
            const btn = document.createElement('span');
            btn.id = 'rustdesk_launch_btn';
            btn.textContent = 'RustDesk';
            btn.title = 'Connect via RustDesk (' + rustdeskId + ')';

            btn.style.cssText = `
                display: inline-block;
                margin-left: 10px;
                padding: 3px 8px;
                background: #d32f2f;
                color: #fff;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                font-weight: bold;
            `;

            btn.onclick = function (e) {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = 'rustdesk://' + rustdeskId;
            };

            header.appendChild(btn);
            clearInterval(poller);

        }, 250);
    };

    return obj;
};
