const track = (title, artist, sources = {}) => ({
  title,
  artist,
  youtubeId: sources.youtubeId || '',
  youtubeUrl: sources.youtubeUrl || '',
  spotifyUrl: sources.spotifyUrl || '',
  youtubeMusicUrl: sources.youtubeMusicUrl || '',
  start: sources.start || 0, // skip burned-in channel intro/promo
  end: sources.end || 0, // stop looped/padded uploads after one playthrough
  audioUrl: sources.audioUrl || '', // direct audio stream used when every embed is blocked
  fallbacks: sources.fallbacks || [] // alternate uploads if the primary is restricted
});

const tracks = [
  track('Lag Ja Gale', 'Lata Mangeshkar · Woh Kaun Thi (1964)', { youtubeId: 'br6C4U3Dyfo', start: 5 }),
  track('Roop Tera Mastana', 'Kishore Kumar · Aradhana (1969)', { youtubeId: 'lpb_ryiQSFY', fallbacks: ['7VtYkfKzLaw'] }),
  track('Mere Sapno Ki Rani', 'Kishore Kumar · Aradhana (1969)', { youtubeId: 'bL_v57O1yXg' }),
  track('O Mere Dil Ke Chain', 'Kishore Kumar · Mere Jeevan Saathi (1972)', { youtubeId: 'YwcRJbaQkFU', start: 5, fallbacks: ['2C56acsSLco', '-Px0efU00uQ'] }),
  track('Pal Pal Dil Ke Paas', 'Kishore Kumar · Blackmail (1973)', { youtubeId: 'AMuRRXCuy-4', fallbacks: ['3LZAUjeIwcI', 'V0TejHIZLV8'] }),
  track('Chura Liya Hai', 'Asha Bhosle, Mohammed Rafi · Yaadon Ki Baaraat (1973)', { youtubeId: 'seFeZOgyFsc', fallbacks: ['nHSh6HDypAY'] }),
  track('Tere Bina Zindagi Se', 'Lata Mangeshkar, Kishore Kumar · Aandhi (1975)', { youtubeId: 'EiUDYzqdz2U', start: 5, fallbacks: ['n61LnmbxXbA', 'xClFqDwlJ1U'] }),
  track('Kabhi Kabhie Mere Dil Mein', 'Mukesh, Lata Mangeshkar · Kabhi Kabhie (1976)', { youtubeId: '-W2dagktUp0', fallbacks: ['tz6CQn1eils'] }),
  track('Hume Tumse Pyar Kitna', 'Kishore Kumar · Kudrat (1981)', { youtubeId: 's_3cnalWPUA', start: 5, fallbacks: ['Hw4U7nEImsk'] }),
  track('Ae Mere Humsafar', 'Udit Narayan, Alka Yagnik · Qayamat Se Qayamat Tak (1988)', { youtubeId: 'sWqjZpBtcxc', fallbacks: ['u-LqR_2k1b0', 'MyTKyXztNOw'] }),
  track('Pehla Nasha', 'Udit Narayan, Sadhana Sargam · Jo Jeeta Wohi Sikandar (1992)', { youtubeId: 'SBfPs-PMGTA', fallbacks: ['3uSeT1e7430'] }),
  track('Tum Mile Dil Khile', 'Kumar Sanu, Alka Yagnik · Criminal (1995)', { youtubeId: 'jC1dHOCmGxo', fallbacks: ['nqTS7ngviwQ', '2OtYy8TT_Ps'] }),
  track('Tujhe Dekha Toh', 'Kumar Sanu, Lata Mangeshkar · DDLJ (1995)', { youtubeId: 'cNV5hLSa9H8', fallbacks: ['r7NVIwO8_pI', 'VZFLv0y3Pzs'] }),
  track('Do Dil Mil Rahe Hain', 'Kumar Sanu · Pardes (1997)', { youtubeId: 'eKIpHujNdX0', fallbacks: ['6I6eeQE8GNs', 'vzOMZW65f_M'] }),
  track('Kuch Kuch Hota Hai', 'Udit Narayan, Alka Yagnik · Kuch Kuch Hota Hai (1998)', { youtubeId: 'bKZTnnFU9HA', fallbacks: ['-ijfNEF7-JY'] }),
  track('Dulhe Ka Sehra', 'Nusrat Fateh Ali Khan · Dhadkan (2000)', {
    audioUrl: 'https://archive.org/download/nusrat-fateh-ali-khan-dulhe-ka-sehra-from-quotdhadkanquot-mp-3clan_202008/Nusrat%20Fateh%20Ali%20Khan%20-%20Dulhe%20Ka%20Sehra%20%28from%20quot%3Bdhadkanquot%3B%29%20%5Bmp3clan%5D.mp3',
    youtubeUrl: 'https://www.youtube.com/watch?v=iZAv9zDeFSc',
    fallbacks: ['iZAv9zDeFSc', 'DxjFcp8YFMw', 'Jp5FU2ZA9Gw']
  }),
  track('Aayega Maza Ab Barsaat Ka', 'Alka Yagnik, Babul Supriyo · Andaaz (2003)', { youtubeId: 'Rcu2AAjdTjE' }),
  track('Hum Tumko Nigahon Mein', 'Udit Narayan, Shreya Ghoshal · Garv (2004)', {
    audioUrl: 'https://archive.org/download/hum-tumko-nigahon-mein-love-song-salman-khan-shilpa-shetty-shreya-ghoshal-udit-narayan-360p/Hum_Tumko_Nigahon_Mein____Love_Song____Salman_Khan%2C_Shilpa_Shetty____Shreya_Ghoshal%2C_Udit_Narayan%28360p%29.mp4',
    youtubeUrl: 'https://www.youtube.com/watch?v=MbIRbYjLdqM',
    fallbacks: [{ id: 'uwk5OUwZd7M', end: 337 }, 'GzzFLBCCY6k', 'MbIRbYjLdqM']
  })
];

// Track durations (fetched from YouTube API or fallback)
const trackDurations = {};

const state = {
  currentIndex: 0,
  player: null,
  playerReady: false,
  loadedVideoId: '',
  isPlaying: false,
  toastTimer: null,
  sourceError: false,
  sourceIndex: 0,
  ytPlayer: null,
  lastPlayerState: -1,
  lastEndAt: 0,
  shuffle: false,
  repeat: 'none', // none, one, all
  volume: 100,
  searchQuery: ''
};

const $ = (selector) => document.querySelector(selector);
const clock = $('#clock');
const onlineCount = $('#onlineCount');
const trackNumber = $('#trackNumber');
const trackTotal = $('#trackTotal');
const trackTitleText = $('#trackTitleText');
const trackArtist = $('#trackArtist');
const availability = $('#availability');
const elapsed = $('#elapsed');
const duration = $('#duration');
const seek = $('#seek');
const seekTooltip = $('#seekTooltip');
const playButton = $('#playButton');
const playGlyph = $('.play-glyph');
const coverArt = $('.cover-art');
const playlistPanel = $('#playlistPanel');
const playlistList = $('#playlistList');
const playlistToggle = $('#playlistToggle');
const toggleCount = $('#toggleCount');
const queueButton = $('#queueButton');
const externalSources = $('#externalSources');
const toast = $('#toast');
const shuffleButton = $('#shuffleButton');
const repeatButton = $('#repeatButton');
const volumeButton = $('#volumeButton');
const volumeSlider = $('#volume');
const playlistSearch = $('#playlistSearch');
const shortcutsToggle = $('#shortcutsToggle');
const shortcutsOverlay = $('#shortcutsOverlay');
const shortcutsClose = $('#shortcutsClose');

function updateClock() {
  clock.textContent = new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit' }).format(new Date()).toLowerCase();
}

function formatTime(value) {
  if (!Number.isFinite(value)) return '—:—';
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 5000);
}

toast.addEventListener('click', () => {
  toast.classList.remove('is-visible');
  clearTimeout(state.toastTimer);
});

function extractYoutubeId(item) {
  if (item.youtubeId && /^[A-Za-z0-9_-]{11}$/.test(item.youtubeId)) return item.youtubeId;
  if (!item.youtubeUrl) return '';
  try {
    const url = new URL(item.youtubeUrl);
    if (url.hostname === 'youtu.be') return url.pathname.slice(1).split('/')[0];
    if (url.hostname.endsWith('youtube.com')) return url.searchParams.get('v') || url.pathname.split('/').pop();
  } catch {
    return '';
  }
  return '';
}

function currentTrack() { return tracks[state.currentIndex]; }
function currentVideoId() { return extractYoutubeId(currentTrack()); }

// Unified source chain: audioUrl first (embed-proof), then the primary YouTube
// upload, then fallbacks — which may be bare IDs or { id, start, end } objects.
function sourceDefs() {
  const t = currentTrack();
  const defs = [];
  const ytIds = [extractYoutubeId(t), ...t.fallbacks.map(f => typeof f === 'string' ? f : f.id)].filter(Boolean);
  if (t.audioUrl) defs.push({ type: 'audio', id: t.audioUrl, start: t.start || 0, end: t.end || 0 });
  ytIds.forEach((id, i) => {
    if (i === 0) { defs.push({ type: 'youtube', id, start: t.start || 0, end: t.end || 0 }); return; }
    const f = t.fallbacks[i - 1];
    defs.push(typeof f === 'object' ? { type: 'youtube', start: 0, end: 0, ...f } : { type: 'youtube', id, start: 0, end: 0 });
  });
  return defs;
}
function sourceIds() { return sourceDefs().map(d => d.id); }
function currentSourceDef() { return sourceDefs()[state.sourceIndex] || null; }
function currentSourceId() { const d = currentSourceDef(); return d ? d.id : ''; }

// <audio>-element backend exposing the YouTube-player method surface so every
// control path (play/pause/seek/volume/end) works unchanged for direct streams.
const audioEl = document.createElement('audio');
audioEl.preload = 'auto';
const audioBackend = {
  _loadArgs: null,
  playerState: -1,
  _endFired: false,
  loadVideoById(args) {
    this._loadArgs = args;
    this._endFired = false;
    audioEl.src = args.videoId;
    audioEl.play().catch(() => {});
  },
  cueVideoById(args) {
    this._loadArgs = args;
    this._endFired = false;
    audioEl.src = args.videoId;
    audioEl.load();
  },
  playVideo() {
    if (!audioEl.src && this._loadArgs) audioEl.src = this._loadArgs.videoId;
    audioEl.play().catch(() => {});
  },
  pauseVideo() { audioEl.pause(); },
  stopVideo() { audioEl.pause(); this.playerState = 5; },
  seekTo(seconds) { if (Number.isFinite(audioEl.duration)) audioEl.currentTime = seconds; },
  getCurrentTime() { return audioEl.currentTime || 0; },
  getDuration() { return Number.isFinite(audioEl.duration) ? audioEl.duration : 0; },
  getPlayerState() { return this.playerState; },
  setVolume(value) { audioEl.volume = Math.min(1, Math.max(0, value / 100)); }
};

audioEl.addEventListener('loadedmetadata', () => {
  const start = audioBackend._loadArgs && audioBackend._loadArgs.startSeconds;
  if (start) audioEl.currentTime = start;
});
[['play', 1], ['playing', 1], ['pause', 2], ['waiting', 3], ['ended', 0]].forEach(([name, code]) => {
  audioEl.addEventListener(name, () => {
    audioBackend.playerState = code;
    if (state.player === audioBackend) onYoutubeStateChange({ data: code, target: audioBackend });
  });
});
audioEl.addEventListener('timeupdate', () => {
  const end = audioBackend._loadArgs && audioBackend._loadArgs.endSeconds;
  if (end && !audioBackend._endFired && audioEl.currentTime >= end) {
    audioBackend._endFired = true;
    audioEl.pause();
    if (state.player === audioBackend) onYoutubeStateChange({ data: 0, target: audioBackend });
  }
});
audioEl.addEventListener('error', () => {
  if (state.player === audioBackend && audioEl.src) onYoutubeError();
});

function loadCurrentSource(autoplay) {
  const def = currentSourceDef();
  state.loadedVideoId = def ? def.id : '';
  if (!def) { if (state.player) state.player.stopVideo(); return; }
  const args = { videoId: def.id, startSeconds: def.start || 0 };
  if (def.end) args.endSeconds = def.end;
  if (def.type === 'audio') {
    if (state.ytPlayer) state.ytPlayer.stopVideo();
    state.player = audioBackend;
    state.player.setVolume(state.volume);
    if (autoplay) state.player.loadVideoById(args);
    else state.player.cueVideoById(args);
    return;
  }
  audioBackend.stopVideo();
  state.player = state.ytPlayer;
  if (!state.player) return;
  if (autoplay) state.player.loadVideoById(args);
  else state.player.cueVideoById(args);
}

function renderExternalSources() {
  const item = currentTrack();
  const links = [];
  const youtubeUrl = item.youtubeUrl || (item.youtubeId ? `https://www.youtube.com/watch?v=${item.youtubeId}` : '');
  if (youtubeUrl) links.push(`<a class="source-link" href="${youtubeUrl}" target="_blank" rel="noreferrer">YouTube ↗</a>`);
  if (item.audioUrl) links.push(`<a class="source-link" href="${item.audioUrl}" target="_blank" rel="noreferrer">Archive ↗</a>`);
  if (item.spotifyUrl) links.push(`<a class="source-link" href="${item.spotifyUrl}" target="_blank" rel="noreferrer">Spotify ↗</a>`);
  if (item.youtubeMusicUrl) links.push(`<a class="source-link" href="${item.youtubeMusicUrl}" target="_blank" rel="noreferrer">YT Music ↗</a>`);
  externalSources.innerHTML = links.join('');
}

function shareSong(index, event) {
  event.stopPropagation();
  const track = tracks[index];
  const url = `${window.location.origin}${window.location.pathname}?song=${index + 1}`;
  navigator.clipboard.writeText(url).then(() => {
    showToast(`Copied link to "${track.title}"`);
  }).catch(() => {
    showToast('Failed to copy link');
  });
}

function renderPlaylist() {
  const query = state.searchQuery.toLowerCase().trim();
  const filteredTracks = query
    ? tracks.filter(t => t.title.toLowerCase().includes(query) || t.artist.toLowerCase().includes(query))
    : tracks;

  if (filteredTracks.length === 0) {
    playlistList.innerHTML = '<div class="playlist-empty">No songs found</div>';
    return;
  }

  playlistList.innerHTML = filteredTracks.map((item) => {
    const index = tracks.indexOf(item);
    const youtubeUrl = item.youtubeUrl || (item.youtubeId ? `https://www.youtube.com/watch?v=${item.youtubeId}` : '');
    const source = youtubeUrl
      ? `<a class="song-search" href="${youtubeUrl}" target="_blank" rel="noreferrer" aria-label="Open ${item.title} on YouTube">↗</a>`
      : '<span class="song-unavailable">Unavailable</span>';
    const duration = trackDurations[index] ? `<span class="song-duration">${trackDurations[index]}</span>` : '';
    const share = `<a class="song-share" href="javascript:void(0)" data-index="${index}" aria-label="Share ${item.title}" title="Copy share link">↗</a>`;

    return `
      <article class="song-row ${index === state.currentIndex ? 'is-current' : ''}" data-index="${index}" tabindex="0" role="button" aria-label="Select ${item.title}">
        <span class="song-index">${String(index + 1).padStart(2, '0')}</span>
        <div>
          <h3>${item.title}</h3>
          <p>${item.artist}</p>
        </div>
        ${duration}
        ${source}
        ${share}
      </article>
    `;
  }).join('');

  playlistList.querySelectorAll('.song-row').forEach((row) => {
    const select = (event) => {
      if (event.target.closest('.song-search') || event.target.closest('.song-share')) return;
      setTrack(Number(row.dataset.index));
    };
    row.addEventListener('click', select);
    row.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); select(event); }
    });
  });

  playlistList.querySelectorAll('.song-share').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.stopPropagation();
      shareSong(Number(btn.dataset.index), event);
    });
  });

  // Auto-scroll to current track
  const currentRow = playlistList.querySelector('.song-row.is-current');
  if (currentRow) {
    currentRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function updateTrackTitle(title) {
  trackTitleText.innerHTML = title;
  // Add marquee for long titles
  if (title.length > 25) {
    trackTitleText.innerHTML = `<span class="marquee">${title} &nbsp;&nbsp;&nbsp; ${title}</span>`;
  }
}

function updatePlayer() {
  const item = currentTrack();
  const def = currentSourceDef();
  const sourceAvailable = Boolean(def);

  trackNumber.textContent = String(state.currentIndex + 1).padStart(2, '0');
  trackTotal.textContent = String(tracks.length);
  toggleCount.textContent = String(tracks.length);
  updateTrackTitle(item.title);
  trackArtist.textContent = item.artist;
  elapsed.textContent = '0:00';
  duration.textContent = '—:—';
  seek.value = 0;
  playGlyph.textContent = '▶';
  coverArt.classList.remove('is-spinning');
  playButton.classList.toggle('is-unavailable', !sourceAvailable);
  playButton.setAttribute('aria-label', sourceAvailable ? `Play ${item.title}` : `${item.title} is unavailable`);
  availability.textContent = state.sourceError
    ? 'Unavailable here · could not play this source'
    : sourceAvailable
      ? def.type === 'audio' ? 'Original audio · ready to play'
      : state.playerReady ? 'Verified YouTube source · ready to play' : 'YouTube player loading…'
      : 'Unavailable here · no playable source';
  renderExternalSources();
  renderPlaylist();
}

function togglePlaylist(force) {
  const shouldOpen = typeof force === 'boolean' ? force : !playlistPanel.classList.contains('is-open');
  playlistPanel.classList.toggle('is-open', shouldOpen);
  playlistPanel.setAttribute('aria-hidden', String(!shouldOpen));
  playlistToggle.setAttribute('aria-expanded', String(shouldOpen));
  queueButton.setAttribute('aria-expanded', String(shouldOpen));
}

function toggleShortcuts(force) {
  const shouldOpen = typeof force === 'boolean' ? force : !shortcutsOverlay.classList.contains('is-visible');
  shortcutsOverlay.classList.toggle('is-visible', shouldOpen);
  shortcutsOverlay.setAttribute('aria-hidden', String(!shouldOpen));
}

function cueCurrentTrack() {
  const def = currentSourceDef();
  if (!def) { updatePlayer(); return; }
  if (def.type !== 'audio' && (!state.playerReady || !state.ytPlayer)) return;
  state.sourceError = false;
  state.sourceIndex = 0;
  loadCurrentSource(false);
  updatePlayer();
}

function getNextIndex() {
  if (state.shuffle) {
    let next;
    do {
      next = Math.floor(Math.random() * tracks.length);
    } while (next === state.currentIndex && tracks.length > 1);
    return next;
  }
  return (state.currentIndex + 1) % tracks.length;
}

function getPrevIndex() {
  if (state.shuffle) {
    let prev;
    do {
      prev = Math.floor(Math.random() * tracks.length);
    } while (prev === state.currentIndex && tracks.length > 1);
    return prev;
  }
  return (state.currentIndex - 1 + tracks.length) % tracks.length;
}

function setTrack(index) {
  state.currentIndex = (index + tracks.length) % tracks.length;
  state.isPlaying = true;
  state.sourceError = false;
  state.sourceIndex = 0;
  const def = currentSourceDef();
  if (def && def.type === 'audio') {
    loadCurrentSource(true);
  } else if (!state.playerReady || !state.ytPlayer) {
    cueCurrentTrack();
    updatePlayer();
    return;
  } else if (def) {
    loadCurrentSource(true);
  } else {
    state.player.stopVideo();
    cueCurrentTrack();
  }
  updatePlayer();
  if (playlistPanel.classList.contains('is-open')) togglePlaylist(false);

  if (def) showToast(`${currentTrack().title} is playing.`);
  else showToast(`${currentTrack().title} is unavailable until a verified source is added.`);
}

function togglePlayback() {
  const def = currentSourceDef();
  if (!def) {
    showToast('This song is unavailable here because it has no playable source yet.');
    return;
  }
  if (def.type !== 'audio' && (!state.playerReady || !state.ytPlayer)) {
    showToast('The YouTube player is still loading. Try again in a moment.');
    return;
  }
  if (!state.player) {
    loadCurrentSource(true);
    return;
  }

  const playerState = state.player.getPlayerState();
  if (playerState === window.YT.PlayerState.PLAYING) state.player.pauseVideo();
  else if (state.loadedVideoId !== currentSourceId()) loadCurrentSource(true);
  else state.player.playVideo();
}

function updateProgress() {
  if (!state.player || !state.isPlaying) return;
  const current = state.player.getCurrentTime();
  const total = state.player.getDuration();
  if (!Number.isFinite(total) || total <= 0) return;
  elapsed.textContent = formatTime(current);
  duration.textContent = formatTime(total);
  seek.value = String((current / total) * 100);
}

function fetchDurations() {
  // Fetch durations from YouTube iframe API
  tracks.forEach((track, index) => {
    const videoId = extractYoutubeId(track);
    if (videoId && state.playerReady && state.player) {
      // YouTube doesn't have a direct method, so we get it when the video loads
      // For now, we'll update durations as videos play
    }
  });
}

function onYoutubeReady(event) {
  state.playerReady = true;
  state.ytPlayer = event.target;
  state.player = event.target;
  state.player.setVolume(state.volume);
  document.querySelector('.player-dock').classList.remove('loading-pulse');
  updatePlayer();
  cueCurrentTrack();
}

function onYoutubeStateChange(event) {
  if (event.target && event.target !== state.player) return; // stray event from the idle backend
  const states = window.YT.PlayerState;
  // endSeconds-capped videos settle on CUED instead of ENDED — treat a
  // PLAYING -> CUED drop on an end-capped source as the song finishing
  const def = currentSourceDef();
  const endCapReached = event.data === states.CUED && state.lastPlayerState === states.PLAYING && !!(def && def.end);
  state.lastPlayerState = event.data;
  state.isPlaying = event.data === states.PLAYING;
  if (event.data === states.ENDED || endCapReached) {
    const now = Date.now();
    if (now - state.lastEndAt < 1500) return; // end-capped videos emit CUED + a late ENDED
    state.lastEndAt = now;
    if (state.repeat === 'one') {
      loadCurrentSource(true);
      return;
    }
    const nextIndex = getNextIndex();
    if (nextIndex === 0 && state.repeat === 'none' && !state.shuffle) {
      state.player.stopVideo();
      state.isPlaying = false;
      updatePlayer();
      return;
    }
    setTrack(nextIndex);
    return;
  }

  // Fetch duration when video starts playing
  if (event.data === states.PLAYING) {
    const total = state.player.getDuration();
    if (total > 0) {
      trackDurations[state.currentIndex] = formatTime(total);
      renderPlaylist();
    }
  }

  playGlyph.textContent = state.isPlaying ? 'Ⅱ' : '▶';
  coverArt.classList.toggle('is-spinning', state.isPlaying);
  playButton.setAttribute('aria-label', state.isPlaying ? `Pause ${currentTrack().title}` : `Play ${currentTrack().title}`);
  availability.textContent = state.isPlaying
    ? (state.player === audioBackend ? 'Playing original audio' : 'Playing through YouTube')
    : (def && def.type === 'audio' ? 'Original audio · paused' : 'Verified YouTube source · paused');
}

function onYoutubeError() {
  const next = state.sourceIndex + 1;
  if (state.playerReady && state.player && next < sourceIds().length) {
    state.sourceIndex = next;
    state.isPlaying = true;
    loadCurrentSource(true);
    showToast('That upload is restricted here — trying an alternate source.');
    return;
  }
  state.isPlaying = false;
  state.sourceError = true;
  updatePlayer();
  showToast('YouTube could not play this source. Try the external link or another verified ID.');
}

function initYoutubePlayer() {
  if (state.player || !window.YT?.Player) return;
  const origin = /^https?:$/.test(window.location.protocol) ? window.location.origin : undefined;
  document.querySelector('.player-dock').classList.add('loading-pulse');
  state.player = new window.YT.Player('youtubePlayer', {
    width: '1',
    height: '1',
    playerVars: { autoplay: 0, controls: 0, playsinline: 1, rel: 0, modestbranding: 1, ...(origin ? { origin } : {}) },
    events: { onReady: onYoutubeReady, onStateChange: onYoutubeStateChange, onError: onYoutubeError }
  });
}

// Shuffle
shuffleButton.addEventListener('click', () => {
  state.shuffle = !state.shuffle;
  shuffleButton.classList.toggle('is-active', state.shuffle);
  showToast(state.shuffle ? 'Shuffle on' : 'Shuffle off');
});

// Repeat
repeatButton.addEventListener('click', () => {
  const modes = ['none', 'all', 'one'];
  const currentModeIndex = modes.indexOf(state.repeat);
  state.repeat = modes[(currentModeIndex + 1) % modes.length];
  repeatButton.classList.toggle('is-active', state.repeat !== 'none');
  const labels = { none: 'Repeat off', all: 'Repeat all', one: 'Repeat one' };
  repeatButton.textContent = state.repeat === 'one' ? '🔂' : '🔁';
  showToast(labels[state.repeat]);
});

// Volume
volumeSlider.addEventListener('input', () => {
  state.volume = Number(volumeSlider.value);
  if (state.player) state.player.setVolume(state.volume);
  volumeButton.textContent = state.volume === 0 ? '🔇' : state.volume < 50 ? '🔉' : '🔊';
});

volumeButton.addEventListener('click', () => {
  if (state.volume > 0) {
    state.volume = 0;
  } else {
    state.volume = 100;
  }
  volumeSlider.value = String(state.volume);
  if (state.player) state.player.setVolume(state.volume);
  volumeButton.textContent = state.volume === 0 ? '🔇' : state.volume < 50 ? '🔉' : '🔊';
});

// Playlist search
playlistSearch.addEventListener('input', () => {
  state.searchQuery = playlistSearch.value;
  renderPlaylist();
});

// Seek tooltip
seek.addEventListener('mouseover', () => {
  const total = state.player?.getDuration() || 0;
  if (total > 0) {
    const percent = Number(seek.value) / 100;
    seekTooltip.textContent = formatTime(percent * total);
  }
});

// Keyboard shortcuts overlay
shortcutsToggle.addEventListener('click', () => toggleShortcuts());
shortcutsClose.addEventListener('click', () => toggleShortcuts(false));
shortcutsOverlay.addEventListener('click', (event) => {
  if (event.target === shortcutsOverlay) toggleShortcuts(false);
});

// Controls
$('#previousButton').addEventListener('click', () => setTrack(getPrevIndex()));
$('#nextButton').addEventListener('click', () => setTrack(getNextIndex()));
playButton.addEventListener('click', togglePlayback);
playlistToggle.addEventListener('click', () => togglePlaylist());
queueButton.addEventListener('click', () => togglePlaylist());
$('#playlistClose').addEventListener('click', () => togglePlaylist(false));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    togglePlaylist(false);
    toggleShortcuts(false);
  }
  if (event.key === ' ' && event.target.tagName !== 'INPUT') {
    event.preventDefault();
    togglePlayback();
  }
  if (event.key === 'ArrowRight' && event.ctrlKey) {
    event.preventDefault();
    setTrack(getNextIndex());
  }
  if (event.key === 'ArrowLeft' && event.ctrlKey) {
    event.preventDefault();
    setTrack(getPrevIndex());
  }
  if (event.key === 's' && event.target.tagName !== 'INPUT') {
    event.preventDefault();
    state.shuffle = !state.shuffle;
    shuffleButton.classList.toggle('is-active', state.shuffle);
    showToast(state.shuffle ? 'Shuffle on' : 'Shuffle off');
  }
  if (event.key === 'r' && event.target.tagName !== 'INPUT') {
    event.preventDefault();
    const modes = ['none', 'all', 'one'];
    const currentModeIndex = modes.indexOf(state.repeat);
    state.repeat = modes[(currentModeIndex + 1) % modes.length];
    repeatButton.classList.toggle('is-active', state.repeat !== 'none');
    const labels = { none: 'Repeat off', all: 'Repeat all', one: 'Repeat one' };
    repeatButton.textContent = state.repeat === 'one' ? '🔂' : '🔁';
    showToast(labels[state.repeat]);
  }
});

seek.addEventListener('input', () => {
  if (!state.player) return;
  const total = state.player.getDuration();
  if (Number.isFinite(total) && total > 0) state.player.seekTo((Number(seek.value) / 100) * total, true);
});

window.addEventListener('youtube-api-ready', initYoutubePlayer);
if (window.YT?.Player) initYoutubePlayer();

updateClock();
setInterval(updateClock, 30000);
setInterval(updateProgress, 500);

// Ambient "listeners online" counter — gently drifts so the header feels alive.
// (External counter services like countapi.xyz are dead; this needs no API.)
function updateVisitorCounter() {
  const seed = Date.now() / 60000; // changes once per minute
  const count = 9 + Math.floor(Math.abs(Math.sin(seed) * 11));
  onlineCount.textContent = String(count);
}
updateVisitorCounter();
setInterval(updateVisitorCounter, 60000);

// Check URL for song parameter
const urlParams = new URLSearchParams(window.location.search);
const songParam = urlParams.get('song');
if (songParam) {
  const songIndex = parseInt(songParam) - 1;
  if (songIndex >= 0 && songIndex < tracks.length) {
    setTrack(songIndex);
  }
}

updatePlayer();

// If the YouTube API never loads (ad blocker / network), tell the user instead of pulsing forever
setTimeout(() => {
  const def = currentSourceDef();
  if (!state.playerReady && (!def || def.type !== 'audio')) {
    document.querySelector('.player-dock').classList.remove('loading-pulse');
    availability.textContent = 'YouTube player blocked · try disabling ad blocker for this site';
    showToast('Could not load YouTube — check your connection or disable ad blocker.');
  }
}, 8000);
