// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
  // Send a message to the active tab
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_browser_action"});
  });
});


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message === "open_new_tab" ) {
      // online version
      //chrome.tabs.create({"url": "http://amis.minimal.be/carla/?q=" + request.url});
      chrome.tabs.create({"url": "https://boblemarin.github.io/carla-draw/?q=" + request.url});

      // Local versions that don't work because no script in bundled html files, okay
      /*
      chrome.tabs.create({"url": chrome.extension.getURL('index.html') + "?q=" + request.url});
      chrome.tabs.query({active: true, currentWindow: true},function (tabs) {
        chrome.tabs.update(tabs[0].id, {url: chrome.extension.getURL('index.html') + "?q=" + request.url});
      });
      */
    }
  }
);