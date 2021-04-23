
// this will store the interval that handles auto-scrolling
var AUTOSCROLLER = null;
var AUTOSCROLLER_SPEED = 200; // 1px per 200ms

// this global variable will store the actively opened song data, if null,
// then no song data has been selected
var SONG_DATA = null;

(function() {
  const songBankFilterInputEl = document.getElementById('songBankFilterInput');

  songBankFilterInputEl.focus();

  populateSongBank();
})();

// ---------------------------------------------
// BANK PAGE
// ---------------------------------------------

function populateSongBank() {
  console.log('%c -- SONG BANK --', 'color: orange;', SONG_BANK);

  const logoEl = document.getElementById('logo');
  const songListEl = document.getElementById('songBankList');
  const songBankFilterInputEl = document.getElementById('songBankFilterInput');

  SONG_BANK.forEach((songData) => {
    const songItemEl = document.createElement('div');
    songItemEl.className = 'song-list-item';
    songItemEl.dataset.songId = songData.id;

    songItemEl.innerHTML = `
      <div class="song-list-item-frame-count">${songData.totalFrames} frame${songData.totalFrames === 1 ? '' : 's'}</div>
      <div class="song-list-item-title">${songData.title}</div>
      <div class="song-list-artist">${songData.artist}</div>
      <div class="song-list-item-subtitle">${songData.subtitle}</div>
      <div class="song-list-item-style">- ${songData.style} -</div>
    `;

    songItemEl.addEventListener('click', (ev) => {
      const songId = ev.currentTarget.dataset.songId;
      openSong(songId);
    });

    songListEl.appendChild(songItemEl);
  });

  setBankCount();

  logoEl.addEventListener('click', () => {
    const sideBarEl = document.getElementById('sideBar');
    sideBarEl.className = 'initial-state';
    document.title = 'Lazy Tab Reader';
  });

  songBankFilterInputEl.addEventListener('keyup', (ev) => {
    const songListEl = document.getElementById('songBankList');
    const songEls = songListEl.getElementsByClassName('song-list-item');
    const value = ev.currentTarget.value.toLowerCase();

    let el;
    let label;
    for (let i = 0; i < songEls.length; i++) {
      el = songEls[i];
      label = el.innerText.trim().toLowerCase();

      if (label.indexOf(value) >= 0) {
        el.hidden = false;
      } else {
        el.hidden = true;
      }
    }
    setBankCount()
  });

  setTimeout(() => {
    window.addEventListener('keyup', (ev) => {
      const keyCode = ev.which || ev.keyCode;
      switch (keyCode) {
        case 82: // R
          window.toggleFilter();
          break;
        case 65: // A
          window.toggleAutoscroll();
          break;
        case 70: // F
          window.toggleFullscreen();
          break;
        default:
          break;
      }
    });
  }, 1000);
}

function setBankCount() {
  const songListEl = document.getElementById('songBankList');
  const songBankCountEl = document.getElementById('songBankCount');
  const songEls = songListEl.getElementsByClassName('song-list-item');

  let count = 0;
  let el;
  for (let i = 0; i < songEls.length; i++) {
    el = songEls[i];
    if (!el.hidden) count++;
  }

  songBankCountEl.innerText = `${count} song${count === 1 ? '' : 's'} available`;
}

// ---------------------------------------------
// SONG PAGE
// ---------------------------------------------

function openSong(songId) {
  let songData = null;
  for (let i = 0; i < SONG_BANK.length; i++) {
    if (SONG_BANK[i].id === songId) {
      songData = SONG_BANK[i];
      break;
    }
  }
  SONG_DATA = songData;

  console.log('%c -- OPENING SONG --', 'color: orange;', SONG_DATA);

  const sideBarEl = document.getElementById('sideBar');
  const songPageContainerEl = document.getElementById('songPageContainer');

  sideBarEl.className = '';

  songPageContainerEl.innerHTML = `
    <div id="viewControls">
      <div id="fullscreenToggle"">Enter <em>F</em>ullscreen</div>
      <div id="filterToggle"">Apply Filte<em>r</em></div>

      <div id="autoscrollToggleContainer">
        <div id="autoscrollToggle"">Enable <em>A</em>utoscroll</div>
        <div id="autoscrollSpeedContainer" hidden>
          <input id="autoscrollSpeed" type="number" value="${AUTOSCROLLER_SPEED}" />
          <span>ms/px</span>
        </div>
      </div>
    </div>

    <div id="header">
      <div id="info">
        <div id="title"></div>
        <div id="subtitle"></div>
        <a id="source" href="" target="_blank">Source</a>
      </div>

      <div id="details">
        <div class="left">
          <div id="style"></div>
          <div id="tuning"></div>
          <div id="tempo"></div>
        </div>

        <div class="right">
          <div id="artist"></div>
          <div id="instrumentalist"></div>
        </div>
      </div>
    </div>

    <div id="frames"></div>
  `;

  document.getElementById('fullscreenToggle').addEventListener('click', () => toggleFullscreen());
  document.getElementById('filterToggle').addEventListener('click', () => toggleFilter());
  document.getElementById('autoscrollToggle').addEventListener('click', () => toggleAutoscroll());
  document.getElementById('autoscrollSpeed').addEventListener('keyup', (ev) => {
    ev.currentTarget.value = Math.max(ev.currentTarget.value, 10);
    AUTOSCROLLER_SPEED = ev.currentTarget.value;
    startAutoScroller();
  });

  populateSongData();
  populateFrames();
  stopAutoScroller();
}

function toggleFullscreen() {
  const songPageContainerEl = document.getElementById('songPageContainer');
  const fullscreenToggleEl = document.getElementById('fullscreenToggle');

  if (songPageContainerEl.className.indexOf('is-fullscreen') >= 0) {
    songPageContainerEl.className = '';
    fullscreenToggleEl.innerHTML = 'Enter <em>F</em>ullscreen';
  } else {
    songPageContainerEl.className = 'is-fullscreen';
    fullscreenToggleEl.innerHTML = 'Exit <em>F</em>ullscreen';
  }
}

function toggleFilter() {
  const framesEl = document.getElementById('frames');
  const filterToggleEl = document.getElementById('filterToggle');

  if (framesEl.className.indexOf('filtered') >= 0) {
    framesEl.className = '';
    filterToggleEl.innerHTML = 'Apply Filte<em>r</em>';
  } else {
    framesEl.className = 'filtered';
    filterToggleEl.innerHTML = 'Remove Filte<em>r</em>';
  }
}

function startAutoScroller() {
  const songPageContainerEl = document.getElementById('songPageContainer');

  stopAutoScroller();
  songPageContainerEl.scrollTop = 0;

  AUTOSCROLLER = setInterval(() => {
    songPageContainerEl.scrollTop++;
  }, AUTOSCROLLER_SPEED);
}

function stopAutoScroller() {
  clearInterval(AUTOSCROLLER);
  AUTOSCROLLER = null;
}

function toggleAutoscroll() {
  const autoscrollToggleEl = document.getElementById('autoscrollToggle');
  const autoscrollSpeedEl = document.getElementById('autoscrollSpeed');
  const autoscrollSpeedContainerEl = document.getElementById('autoscrollSpeedContainer');

  if (AUTOSCROLLER) {
    stopAutoScroller();
    autoscrollToggleEl.innerHTML = 'Enable <em>A</em>utoscroll';
    autoscrollSpeedContainerEl.hidden = true;
    autoscrollSpeedEl.value = 200;
    AUTOSCROLLER_SPEED = 200;
  } else {
    startAutoScroller();
    autoscrollToggleEl.innerHTML = 'Disable <em>A</em>utoscroll';
    autoscrollSpeedContainerEl.hidden = false;

    setTimeout(() => autoscrollSpeedEl.select(), 100);
  }
}

function populateSongData() {
  document.getElementById('title').innerHTML = SONG_DATA.title;
  document.getElementById('subtitle').innerHTML = SONG_DATA.subtitle;
  document.getElementById('source').href = SONG_DATA.source;
  document.getElementById('style').innerHTML = SONG_DATA.style;
  document.getElementById('tuning').innerHTML = SONG_DATA.tuning;
  document.getElementById('tempo').innerHTML = SONG_DATA.tempo;
  document.getElementById('artist').innerHTML = SONG_DATA.artist;
  document.getElementById('instrumentalist').innerHTML = SONG_DATA.instrumentalist;

  document.title = `${SONG_DATA.title} - ${SONG_DATA.artist}`
}

function populateFrames() {
  const framesEl = document.getElementById('frames');
  let frameFilePath;
  let frameWrapEl;
  let frameEl;

  for (let i = 1; i <= SONG_DATA.totalFrames; i++) {
    frameFilePath = getFrameFilePath(i);

    frameWrapEl = document.createElement('div');
    frameWrapEl.className = 'frameWrap';
    frameWrapEl.style.width = `${SONG_DATA.frameWidth}px`;
    frameWrapEl.style.height = `${SONG_DATA.frameHeight}px`;

    frameEl = document.createElement('img');
    frameEl.src = frameFilePath;

    frameWrapEl.appendChild(frameEl);

    framesEl.appendChild(frameWrapEl);
  }

  // add a blank one to help handle odd numbered frames
  frameWrapEl = document.createElement('div');
  frameWrapEl.className = 'frameWrap';
  frameWrapEl.style.width = `${SONG_DATA.frameWidth}px`;
  frameWrapEl.style.height = `${SONG_DATA.frameHeight}px`;
  framesEl.appendChild(frameWrapEl);
}

function getFrameFilePath(index) {
  const framePath = `Songs/${SONG_DATA.id}/frames`;
  const totalFrames = SONG_DATA.totalFrames;
  let zeroBuffer = '';
  if (totalFrames >= 100) {
    if (index < 10) {
      zeroBuffer = '00';
    } else if (index < 100) {
      zeroBuffer = '0';
    }
  } else if (totalFrames >= 10) {
    if (index < 10) {
      zeroBuffer = '0';
    }
  }
  return `${framePath}/${zeroBuffer}${index}.png`;
}
