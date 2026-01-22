/** 
* @description MeshCentral to rustdesk
* @author Monster IT Services
* @copyright 
* @license Apache-2.0
* @version v0.0.1
*/

"use strict";

module.exports.rustdesk = function (parent) {
  var obj = {};
  obj.parent = parent;

  obj.onDeviceRefreshEnd = function (id, data, tabId, showDevice, user, device) {
    // REMOVED CHECKS: We are forcing the button to appear for testing.
    // if (!device || !device.description) return; 

    var rustDeskLink = "rustdesk://" + (device.description || "");
    
    // Debugging Button (Blue)
    var html = '<div style="cursor: pointer; display: inline-block; padding: 5px 10px; margin-left: 10px; background-color: #007bff; color: white; border-radius: 4px;" ' +
               'onclick="window.open(\'' + rustDeskLink + '\', \'_self\')" ' +
               'title="Target ID: ' + (device.description || "NONE") + '">' +
               '<b>🚀 RustDesk</b>' +
               '</div>';
    
    return { html: html };
  };

  return obj;
};
