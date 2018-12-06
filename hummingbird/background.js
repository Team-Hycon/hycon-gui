'use strict';
var options_url = chrome.runtime.getURL("index.html")
console.log(options_url)

chrome.browserAction.onClicked.addListener(function (tab) {
  chrome.tabs.query({
    url: options_url
  }, function(tabs) {
      if (tabs.length == 0) {
        chrome.windows.create({
          url: chrome.runtime.getURL("index.html"),
          type: "popup",
          width: 1066,
          height: 670, // minimum value to prevent default scrolling
        }, function (win) {
          // win represents the Window object from windows API
          // Do something after opening
        });
      } else {
          // If there's more than one, close all but the first
          for (var i=1; i<tabs.length; i++) {
              chrome.tabs.remove(tabs[i].id);
          }
          // And focus the options page
          chrome.tabs.update(tabs[0].id, {active: true});
          chrome.windows.update(tabs[0].windowId, {focused:true})
      }
  });
});