const slider = document.getElementById('before-after-slider');
const before = document.getElementById('before-vid');
const beforeVideo = before.getElementsByTagName('video')[0];
const resizer = document.getElementById('resizer');
const after = document.getElementById('after-vid');

// console.log(beforeVideo);
let active = false;

document.addEventListener('DOMContentLoaded', function(){
  let width = slider.offsetWidth;
  console.log(width);
  beforeVideo.style.width = width + 'px';
});

window.addEventListener('resize', function() {
  let width = slider.offsetWidth;
  console.log(width);
  beforeVideo.style.width = width + 'px';
});

// Slider active on Desktop
resizer.addEventListener('mousedown', function() {
  active = true;
  resizer.classList.add('resize');
});


// Slider inactive
document.body.addEventListener('mouseup', function() {
  active = false;
  resizer.classList.remove('resize');
});

document.body.addEventListener('mouseleave', function() {
  active = false;
  resizer.classList.remove('resize');
});

// Slide on Desktop
document.body.addEventListener('mousemove', function(e) {
  if(!active) return;
  let x = e.pageX;
  x -= slider.getBoundingClientRect().left;
  // Call function to slide
  slide(x);
  // call function to pause
  pauseEvent(e);
});


// calculation for dragging on touch and mobile devices
resizer.addEventListener('touchstart', function() {
  active = true;
  resizer.classList.add('resize');
});

document.body.addEventListener('touchend',function(){
  active = false;
  resizer.classList.remove('resize');
});

document.body.addEventListener('touchcancel',function(){
  active = false;
  resizer.classList.remove('resize');
});

document.body.addEventListener('touchmove', function(e) {
  if(!active) return;
  let x;
  let i;
  for (i=0; i < e.changedTouches.length; i++) {
    x = e.changedTouches[i].pageX;
  }
  x -= slider.getBoundingClientRect().left;
  // Call function to slide
  slide(x);
  // Call function to pause
  pauseEvent(e);
});

function slide(x) {
  let transform = Math.max(0, (Math.min(x,slider.offsetWidth)));
  before.style.width = transform+'px';
  resizer.style.left = transform-0+'px';
}

function pauseEvent(e) {
  if(e.stopPropagation) e.stopPropagation();
  if(e.preventDefault) e.preventDefault();
  e.cancelBubble = true;
  e.returnValue = false;
  return false;
}


let videos = {
  a: Popcorn('#a'),
  b: Popcorn('#b'),
},
scrub = $("#scrub"),
loadCount = 0,
events = 'play pause timeupdate seeking'.split(/\s+/g);

Popcorn.forEach(videos, function(media, type) {
  
  // when each is loaded
  media.on('canplayall', function() {

    // trigger sync event
    this.emit('sync');

    // set the max value of the 'scrubber'
    scrub.attr('max', this.duration());

    // list for the custom sync
  }).on('sync', function() {

    // once both videos are loaded, sync events
    if (++loadCount == 2 ) {

      events.forEach(function(event) {
        videos.a.on(event, function() {
          if (event === 'timeupdate') {
            if (!this.media.pause) {
              return;
            }
            videos.b.emit('timeupdate');
            return;
          }
          if (event === 'seeking') {
            videos.b.currentTime(this.currentTime());
          }
          if (event === 'play' || event === 'pause') {
            videos.b[event]();
          }
        });
      });
    }
  });
});

scrub.bind('change', function() {
  let val = this.value;
  videos.a.currentTime(val);
  videos.b.currentTime(val);
});

function sync() {
  if (videos.b.media.readyState === 4) {
    videos.b.currentTime(
      videos.a.currentTime()
    );
  }
  requestAnimationFrame(sync);
}
sync();



