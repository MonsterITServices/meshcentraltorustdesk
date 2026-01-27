"use strict";

module.exports.rustdesk = function (parent) {
  var obj = {};
  obj.parent = parent;

  // 1. Expose the hook (Required)
  obj.exports = ['onDeviceRefreshEnd'];

  // 2. Browser-Side Hook
  obj.onDeviceRefreshEnd = function (nodeid, panel, refresh, event) {
    
    // DEBUG: Verify the hook fired in the browser console (F12)
    console.log("RustDesk: Hook fired for node", nodeid);

    // Stop if we aren't on a device page
    if (typeof currentNode === 'undefined' || !currentNode) return;

    // 3. START POLLING (Keep looking for the header for 5 seconds)
    var attempts = 0;
    var poller = setInterval(function() {
        attempts++;
        if (attempts > 10) { clearInterval(poller); return; } // Give up after 5s

        // A. Find the Header
        var header = document.getElementById('p10title');
        if (!header) {
            console.log("RustDesk: Header not found yet...");
            return; // Try again next tick
        }

        // B. Check for valid ID
        var targetID = currentNode.rdid || currentNode.description;
        if (!targetID || !/^\d+$/.test(targetID)) {
            clearInterval(poller); // Stop if no valid ID
            return; 
        }

        // C. Avoid Duplicates
        if (document.getElementById('btn_rustdesk_launch')) {
            clearInterval(poller); // Already drawn
            return;
        }

        // D. Create Button
        console.log("RustDesk: Injecting Button for ID " + targetID);
        var btn = document.createElement('span');
        btn.id = "btn_rustdesk_launch";
        btn.innerText = "RustDesk"; 
        btn.style.cssText = "display: inline-block; cursor: pointer; background-color: #d32f2f; color: white; padding: 2px 8px; margin-left: 10px; border-radius: 4px; font-weight: bold; font-size: 12px; vertical-align: middle; position: relative; top: -2px;";
        btn.title = "Connect to ID: " + targetID;

        btn.onclick = function(e) {
            e.stopPropagation();
            window.open("rustdesk://" + targetID, "_self");
        };

        header.appendChild(btn);
        clearInterval(poller); // Done!

    }, 500); // Check every 500ms
  };

  return obj;
};
