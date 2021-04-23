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
      <div class="song-list-item-frame-count">${songData.totalRegisteredFrames} frame${songData.totalRegisteredFrames === 1 ? '' : 's'}</div>
      <div class="song-list-item-title">${songData.title}</div>
      <div class="song-list-artist">${songData.artist}</div>
      <div class="song-list-item-subtitle">${songData.subtitle}</div>
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
    <div id="fullscreenToggle" on-click="toggleFullscreen()">Enter Fullscreen</div>
    <div id="filterToggle" on-click="toggleFilter()">Apply Filter</div>

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

  populateSongData();
  populateFrames();
}

function toggleFullscreen() {
  const songPageContainerEl = document.getElementById('songPageContainer');
  const fullscreenToggleEl = document.getElementById('fullscreenToggle');

  if (songPageContainerEl.className.indexOf('is-fullscreen') >= 0) {
    songPageContainerEl.className = '';
    fullscreenToggleEl.innerHTML = 'Enter Fullscreen';
  } else {
    songPageContainerEl.className = 'is-fullscreen';
    fullscreenToggleEl.innerHTML = 'Exit Fullscreen';
  }
}

function toggleFilter() {
  const framesEl = document.getElementById('frames');
  const filterToggleEl = document.getElementById('filterToggle');

  if (framesEl.className.indexOf('filtered') >= 0) {
    framesEl.className = '';
    filterToggleEl.innerHTML = 'Apply Filter';
  } else {
    framesEl.className = 'filtered';
    filterToggleEl.innerHTML = 'Remove Filter';
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

  for (let i = 1; i <= SONG_DATA.totalRegisteredFrames; i++) {
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
  const totalFrames = SONG_DATA.totalRegisteredFrames;
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
