"use strict";

module.exports.rustdesk = function (parent) {
  var obj = {};
  obj.parent = parent;

  // 1. Force Export
  obj.exports = ['onDeviceRefreshEnd'];

  // 2. Immediate Console Log (To prove the file loaded)
  console.log("RUSTDESK: Plugin Script Loaded in Browser!");

  obj.onDeviceRefreshEnd = function (nodeid, panel, refresh, event) {
    
    // Debug Log
    console.log("RUSTDESK: View refreshed for node", nodeid);

    // Only run if we are looking at a specific device
    if (typeof currentNode === 'undefined' || !currentNode) return;

    // Polling Loop (Try for 2 seconds)
    var attempts = 0;
    var poller = setInterval(function() {
        attempts++;
        if (attempts > 10) { clearInterval(poller); return; }

        var header = document.getElementById('p10title');
        if (!header) return;

        // Check if button already exists
        if (document.getElementById('btn_rustdesk_launch')) {
            clearInterval(poller);
            return;
        }

        // Get ID
        var targetID = currentNode.rdid || currentNode.description;
        if (!targetID || !/^\d+$/.test(targetID)) {
             // Optional: Console log why we failed
             // console.log("RUSTDESK: No valid ID found (Description/RDID is not numeric)");
             clearInterval(poller);
             return; 
        }

        // Create Button
        console.log("RUSTDESK: Injecting Button!");
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
        clearInterval(poller);

    }, 200);
  };

  return obj;
};
