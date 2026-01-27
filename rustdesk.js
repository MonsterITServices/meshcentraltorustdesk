"use strict";

module.exports.rustdesk = function (parent) {
  var obj = {};
  obj.parent = parent;
  obj.exports = ['onDeviceRefreshEnd'];

  // STARTUP LOG (Should appear immediately on refresh)
  console.log("RUSTDESK 1.2.0: Script initialized.");

  obj.onDeviceRefreshEnd = function (nodeid, panel, refresh, event) {
    
    // 1. Log the hook trigger
    console.log("RUSTDESK: Hook fired. Panel:", panel);

    // Only run on the "General" panel (usually panel 10 or similar for devices)
    // We skip the check to be safe, but logging it helps.

    var attempts = 0;
    var poller = setInterval(function() {
        attempts++;
        if (attempts > 20) { 
            console.log("RUSTDESK: Timed out waiting for header/data.");
            clearInterval(poller); 
            return; 
        }

        // 2. Check Header
        var header = document.getElementById('p10title');
        if (!header) {
            // Keep silent to avoid spamming logs while waiting
            return; 
        }

        // 3. Clean duplicates
        if (document.getElementById('btn_rustdesk_launch')) {
            clearInterval(poller);
            return;
        }

        // 4. DEBUG THE DATA (This is what we need to see!)
        if (typeof currentNode === 'undefined' || !currentNode) {
            console.log("RUSTDESK: 'currentNode' is undefined.");
            return;
        }

        var rdid = currentNode.rdid;
        var desc = currentNode.description;
        
        console.log("RUSTDESK DEBUG: RDID =", rdid, "| DESC =", desc);

        // 5. Decide
        var targetID = rdid || desc;
        
        // Strict number check
        if (!targetID || !/^\d+$/.test(targetID)) {
             console.log("RUSTDESK: Skipping - No valid numeric ID found.");
             clearInterval(poller);
             return; 
        }

        // 6. Inject
        console.log("RUSTDESK: VALID ID FOUND (" + targetID + "). DRAWING BUTTON.");
        var btn = document.createElement('span');
        btn.id = "btn_rustdesk_launch";
        btn.innerText = "RustDesk"; 
        btn.style.cssText = "display: inline-block; cursor: pointer; background-color: #d32f2f; color: white; padding: 2px 8px; margin-left: 10px; border-radius: 4px; font-weight: bold; font-size: 12px; vertical-align: middle; position: relative; top: -2px;";
        btn.title = "Connect to " + targetID;
        btn.onclick = function(e) {
            e.stopPropagation();
            window.open("rustdesk://" + targetID, "_self");
        };

        header.appendChild(btn);
        clearInterval(poller);

    }, 250);
  };

  return obj;
};
