chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message === "clicked_browser_action" ) {
      document.body.style.cursor = "crosshair";
      document.addEventListener("mousedown", onClickInDocument);
    }
  }
);

function onClickInDocument(event) {
  if (event.target.tagName == 'IMG' ){
    document.body.style.cursor = 'default';
    document.removeEventListener("mousedown", onClickInDocument);
    console.log(event.target.src);
    chrome.runtime.sendMessage({"message": "open_new_tab", "url": event.target.src});
  }
}