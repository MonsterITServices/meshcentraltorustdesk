"use strict";

module.exports.rustdesk = function (parent) {
  var obj = {};
  obj.parent = parent;

  // 1. Tell MeshCentral this function is safe to run in the web browser
  obj.exports = ['onDeviceRefreshEnd'];

  // 2. The Browser-Side Hook
  obj.onDeviceRefreshEnd = function (nodeid, panel, refresh, event) {
    
    // We set a small timeout to ensure MeshCentral has finished drawing the header
    setTimeout(function() {
        
        // A. Find the Header (p10title is the ID of the device name area)
        var header = document.getElementById('p10title');
        if (!header) return;

        // B. Clean up (Remove old button to prevent duplicates)
        var oldBtn = document.getElementById('btn_rustdesk_launch');
        if (oldBtn) oldBtn.remove();

        // C. Safety Check: Do we have a device selected?
        if (typeof currentNode === 'undefined' || !currentNode) return;

        // D. Get the ID (Checks 'rdid' first, then 'description')
        // We ensure it is just numbers to prevent errors
        var targetID = currentNode.rdid || currentNode.description;
        if (!targetID || !/^\d+$/.test(targetID)) return;

        // E. Create the Button Element (Standard Text Button)
        var btn = document.createElement('span');
        btn.id = "btn_rustdesk_launch";
        btn.innerText = "RustDesk"; 
        
        // Style: Red background, white text, bold, aligned nicely
        btn.style.cssText = "display: inline-block; cursor: pointer; background-color: #d32f2f; color: white; padding: 2px 8px; margin-left: 10px; border-radius: 4px; font-weight: bold; font-size: 12px; vertical-align: middle; position: relative; top: -2px;";
        btn.title = "Connect to ID: " + targetID;

        // F. Click Handler
        btn.onclick = function(e) {
            e.stopPropagation(); // Stop click from bubbling to MeshCentral headers
            window.open("rustdesk://" + targetID, "_self");
        };

        // G. Inject into header
        header.appendChild(btn);

    }, 250); // 250ms delay
  };

  return obj;
};
