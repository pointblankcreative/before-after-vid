const app = {};

// VIDEOS SYNCING ON LOAD + SCRUBBER
app.syncVideos = function() {
  let videos = {
    a: Popcorn('#a'), // Before video
    b: Popcorn('#b'), // After video
    c: Popcorn('#c') // Audio 
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
      if (++loadCount == 3 ) {
  
        // Iterate all events and trigger them on the video B and audio
        // whenever they occur on A
  
        events.forEach(function(event) {
  
          videos.a.on(event, function() {
            if (event === 'timeupdate') {
              if (!this.media.pause) {
                return;
              }
              videos.b.emit('timeupdate');
              videos.c.emit('timeupdate');
              scrub.val(this.currentTime());
              return;
            }
            if (event === 'seeking') {
              videos.b.currentTime(this.currentTime());
              videos.c.currentTime(this.currentTime());
            }
            if (event === 'play' || event === 'pause') {
              videos.b[event]();
              videos.c[event]();
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
    videos.c.currentTime(val);
  });
  
  function sync() {
    if (videos.b.media.readyState && videos.c.media.readyState === 6) {
      videos.b.currentTime(
        videos.a.currentTime()
      );
      videos.c.currentTime(
        videos.a.currentTime()
      );
    }
    requestAnimationFrame(sync);
  }
  sync();
}

// AUDIO TOGGLE FUNCTIONALITY 
app.audioToggle = function() {
  // Create instance of audio context to access Web Audio API
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const audioContext = new AudioContext();
  const audioElement = document.querySelector('audio');
  const track = audioContext.createMediaElementSource(audioElement);
  
  // Connect audio to AudioContext API
  track.connect(audioContext.destination);
  
  // Connect audio track to el used to trigger sound
  resizer.addEventListener('click', function() {
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    if (this.dataset.playing === 'false') {
      audioElement.play();
      this.dataset.playing = 'true';
    } else if (this.dataset.playing === 'true') {
      audioElement.pause();
      this.dataset.playing = 'false';
    }
  }, false);

  audioElement.addEventListener('ended', () => {
      playButton.dataset.playing = 'false';
  }, false);
  
  // Control audio
  const gainNode = audioContext.createGain();
  
  track.connect(gainNode).connect(audioContext.destination);
  
  const volumeControl = document.getElementById('volume');
  
  volumeControl.addEventListener('input', function(){
    gainNode.gain.value = this.value;
  }, false);
  
  const pannerOptions = { pan: 0 };
  const panner = new StereoPannerNode(audioContext, pannerOptions);
  
  const pannerControl = document.getElementById('panner');
  pannerControl.addEventListener('input', function() {
    panner.pan.value = this.value;
  }, false);
  
  track.connect(gainNode).connect(panner).connect(audioContext.destination);
}

// SLIDER FUNCTIONALITY
app.beforeAndAfterSlider = function() {
  const slider = document.getElementById('before-after-slider');
  const resizer = document.getElementById('resizer');
  const before = document.getElementById('before-vid');
  const beforeVideo = before.getElementsByTagName('video')[0];

  let active = false;
  
  document.addEventListener('DOMContentLoaded', function(){
    let width = slider.offsetWidth;
    beforeVideo.style.width = width + 'px';
  });
  window.addEventListener('resize', function() {
    let width = slider.offsetWidth;
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
    // console.log(x)
    x -= slider.getBoundingClientRect().left;
    // console.log(x)
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
};


// INITIALIZE APP
app.init = function() {
  app.syncVideos();
  app.audioToggle();
  app.beforeAndAfterSlider();
}

app.init();