var styleEl = document.createElement('style');

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message === "clicked_browser_action" ) {
      // TODO: insertRule into style sheet to give better visual feedback
      // document.head.appendChild(styleEl);
      styleEl = document.createElement('style');
      document.head.appendChild(styleEl);
      var styleSheet = styleEl.sheet;
      styleSheet.insertRule('img:hover { border: 15px dotted red; cursor: crosshair; box-sizing: border-box;}', 0);


      //document.body.style.cursor = "crosshair";
      document.addEventListener("mousedown", onClickInDocument);
    }
  }
);

function onClickInDocument(event) {
  if (event.target.tagName == 'IMG' ){
    //document.body.style.cursor = 'default';
    document.removeEventListener("mousedown", onClickInDocument);
    document.head.removeChild(styleEl);
    console.log(event.target.src);
    chrome.runtime.sendMessage({"message": "open_new_tab", "url": event.target.src});
  }
}