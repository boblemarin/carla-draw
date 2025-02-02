let cv = document.getElementById('drawCanvas'),
    ctx = cv.getContext('2d'),
    tcv = document.getElementById('tempCanvas'),
    tctx = tcv.getContext('2d'),
    isMouseDown = false,
    currentStroke = [],
    strokes = [],
    redoStrokes = [],
    sourceImageURL = "",
    width = window.innerWidth,
    height = window.innerHeight,
    dirty = false,
    tdirty = false,
    lineWidth = 3,
    saved = false,
    lineColor = "white";

cv.width = tcv.width = width;
cv.height = tcv.height = height;

document.querySelector('.menu').addEventListener('mousedown',onMenuMouseDown);

document.querySelector('#menuSaveBtn').addEventListener('mousedown',menuSave);
document.querySelector('#menuUndoBtn').addEventListener('mousedown',menuUndo);
document.querySelector('#menuPreviewBtn').addEventListener('mousedown',menuPreview);
document.querySelector('#menuBlackBtn').addEventListener('mousedown',menuBlack);
document.querySelector('#menuWhiteBtn').addEventListener('mousedown',menuWhite);

document.addEventListener('mousedown', onMouseDown);
document.addEventListener('contextmenu', onRightMouseDown, false);
window.addEventListener('keydown',onKeyDown);
window.onbeforeunload = function(event) {
  if (!saved && strokes.length > 0) return "oui";
}
requestAnimationFrame(draw);

if (window.location.search.startsWith('?q=')) {
  sourceImageURL = window.location.search.substring(3);
  loadImage(sourceImageURL);
  // document.querySelector('#sourceDiv').style.backgroundImage = 'url('+window.location.search.substring(3)+')';
}


function menuNew(event) {
  sourceImageURL = prompt('Image URL');
  if (sourceImageURL) {
    redoStrokes.length = 0;
    strokes.length = 0;
    currentStroke.length = 0;
    dirty = true;
    tdirty = true;
    loadImage(sourceImageURL);
  }
}

function menuSave(event) {
  if (event.shiftKey) {
    menuNew();
  } else {
    if (strokes.length) {
      // trim image content
      let minX = 9999, maxX = 0, minY = 9999, maxY = 0;
      // loop scan
      strokes.forEach(function(stroke) {
        stroke.forEach(function(point) {
          minX = Math.min(minX, point[0]);
          maxX = Math.max(maxX, point[0]);
          minY = Math.min(minY, point[1]);
          maxY = Math.max(maxY, point[1]);
        });
      });
      // add borders
      minX -= 50;
      maxX += 50;
      minY -= 50;
      maxY += 50;
      // generate SVG code
      let svg = '<svg x="0px" y="0px" viewBox="0 0 '+(maxX - minX)+' '+(maxY - minY)+'" xmlns="http://www.w3.org/2000/svg" xml:space="preserve" stroke="black" stroke-width="3" fill="none" ';
      svg += 'imageReference="' + encodeURIComponent(sourceImageURL) + '" imageGenerator="CarlaDraw">'

      strokes.forEach(function(stroke) {
        let first = true;
        stroke.forEach(function(pos) {
          if (first) {
            first = false;
            svg += '<path d="M' + (pos[0]-minX) + ',' + (pos[1]-minY);
          } else {
            svg += ' L' + (pos[0]-minX) + ',' + (pos[1]-minY);
          }
        });
        svg += '"/>';
      });
      svg += '</svg>';


      var d = new Date();

      var datestring = d.getFullYear() + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2) + " " + ("0" + d.getHours()).slice(-2) + "-" + ("0" + d.getMinutes()).slice(-2);
      
      download(datestring + ".svg", svg);
      saved = true;
    }
  }
}

function menuUndo(event) {
  if (event.shiftKey) {
    redo();
  } else {
    undo();
  }
}

function menuPreview() {
  document.querySelector('#sourceDiv').classList.toggle("invisible");
}

function menuBlack() {
  lineColor = "black";
  dirty = true;
  tdirty = true;
}

function menuWhite() {
  lineColor = "white";
  dirty = true;
  tdirty = true;
}

function onMenuMouseDown(event) {
  event.stopImmediatePropagation();
}

function onMouseDown(event) {
  if (isMouseDown && currentStroke.length > 1) {
    strokes.push(currentStroke);
    currentStroke = [];
    dirty = true;
    tdirty = true;
  }
  // console.log('down');
  isMouseDown = true;
  redoStrokes.length = 0;
  currentStroke = [[event.pageX, event.pageY]];
  event.preventDefault();
  event.stopImmediatePropagation();

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
}

function onRightMouseDown(event) {
  event.preventDefault();
  event.stopImmediatePropagation();
  return false;
}

function onMouseMove(event) {
  // console.log('move');
  if (isMouseDown) {
    currentStroke.push([event.pageX, event.pageY]);
    tdirty = true;
  }
}

function onMouseUp(event) {
  // console.log('up');
  if (isMouseDown) {
    isMouseDown = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    if (currentStroke.length > 1) {
      strokes.push(currentStroke);
      currentStroke = [];
      dirty = true;
      tdirty = true;
    }
  }
}

function onKeyDown(event) {
  switch(event.keyCode) {
    case 8: // backspace, undo/redo
      if (event.shiftKey) redo();
      else undo();
      break;

    default: 
      //console.log(event.keyCode);
      break;
  };
}

function draw() {
  if (dirty) {
    cv.width = width;
    cv.height = height;
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = lineColor;
    strokes.forEach(function(stroke) {
      let first = true;
      stroke.forEach(function(pos) {
      if (first) {
        ctx.moveTo(pos[0],pos[1]);
        first = false;
      } else {
        ctx.lineTo(pos[0],pos[1]);
      }
      });
    });
    ctx.stroke();
    dirty = false;
  }

  if (tdirty) {
    tcv.width = width;
    tcv.height = height;
    tctx.lineWidth = lineWidth;
    tctx.strokeStyle = lineColor;
    let first = true;
    currentStroke.forEach(function(pos) {
      if (first) {
        tctx.moveTo(pos[0],pos[1]);
        first = false;
      } else {
        tctx.lineTo(pos[0],pos[1]);
      }
    });
    tctx.stroke();
    tdirty = false;
  }

  requestAnimationFrame(draw);
}

function undo() {
  if (strokes.length) {
    redoStrokes.push(strokes.pop());
    dirty = true;
  }
}

function redo() {
  if (redoStrokes.length) {
    strokes.push(redoStrokes.pop());
    dirty = true;
  }
}


function loadImage(url) {
  document.querySelector('#sourceDiv').style.backgroundImage = 'url('+url+')';
}

function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}
