// Global vars to cache event state
let evCache = new Array();
let prevTouchesDist = -1;

const multitouchInit = () => {
  // Install event handlers for the pointer target
  let el=document.getElementById("overlay");
  el.onpointerdown = pointerdown_handler;
  el.onpointermove = pointermove_handler;

  // Use same handler for pointer{up,cancel,out,leave} events since
  // the semantics for these events - in this app - are the same.
  el.onpointerup = pointerup_handler;
  el.onpointercancel = pointerup_handler;
  el.onpointerout = pointerup_handler;
  el.onpointerleave = pointerup_handler;

  // let sceneEl=document.getElementById("mainScene");
  // sceneEl.addEventListener("twofingermove", handleScale);
}


const handleScale = (event) => {
  this.scaleFactor *=
    1 + event.detail.spreadChange / event.detail.startSpread;

  this.scaleFactor = Math.min(
    Math.max(this.scaleFactor, this.data.minScale),
    this.data.maxScale
  );

  let obj = 
  el.object3D.scale.x = scaleFactor * initialScale.x;
  el.object3D.scale.y = scaleFactor * initialScale.y;
  el.object3D.scale.z = scaleFactor * initialScale.z;
}

const pointerdown_handler = (ev) => {
  // The pointerdown event signals the start of a touch interaction.
  // This event is cached to support 2-finger gestures
  evCache.push(ev);
  console.log(ev)
}

const pointermove_handler = (ev) => {

  // Find this event in the cache and update its record with this event
  for (let i = 0; i < evCache.length; i++) {
   if (ev.pointerId == evCache[i].pointerId) {
      evCache[i] = ev;
   break;
   }
  }

  let el = document.getElementById("objs");
  let elScale = el.getAttribute("scale");

  // If two pointers are down, check for pinch gestures
  if (evCache.length == 2) {
   // Calculate the distance between the two pointers
   let curDist = Math.abs(evCache[0].clientX - evCache[1].clientX);

   if (prevTouchesDist > 0) {
     if (curDist > prevTouchesDist) {
       // The distance between the two pointers has increased
       let newScale = {x: elScale.x + 0.01,
                      y: elScale.y + 0.01,
                      z: elScale.z + 0.01};
        el.setAttribute("scale", newScale);
     }
     if (curDist < prevTouchesDist) {
       // The distance between the two pointers has decreased
       let newScale = {x: Math.max(elScale.x - 0.01, 0),
                      y: Math.max(elScale.y - 0.01, 0),
                      z: Math.max(elScale.z - 0.01, 0)};
        el.setAttribute("scale", newScale);
     }
   }

   // Cache the distance for the next move event
   prevTouchesDist = curDist;
  }
}

const pointerup_handler = (ev) => {
  // Remove this pointer from the cache
  remove_event(ev);

  // If the number of pointers down is less than two then reset diff tracker
  if (evCache.length < 2) {
    prevTouchesDist = -1;
  }
}

const remove_event = (ev) => {
  // Remove this event from the target's cache
  for (let i = 0; i < evCache.length; i++) {
   if (evCache[i].pointerId == ev.pointerId) {
     evCache.splice(i, 1);
     break;
   }
  }
}
