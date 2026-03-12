/**
 * Bingoabend Custom Card für Home Assistant
 *
 * Konfiguration (Lovelace YAML):
 *
 *   type: custom:bingoabend-card
 *   title: Bingoabend Steuerung
 *   sonos_entity: media_player.sonos_wohnzimmer
 *   linein_source: "Line-In"
 *   music_source: "Spotify"        # optional
 *   max_number: 75                 # 75 oder 90
 *   sounds:
 *     - name: "Fanfare"
 *       url: "/local/sounds/fanfare.mp3"
 *       icon: "mdi:trumpet"
 */

const CARD_VERSION = "1.2.0";

// ─── Styles ──────────────────────────────────────────────────────────────────

const STYLES = `
  :host {
    display: block;
    /* Enable container queries scoped to this card */
    container-type: inline-size;
    container-name: bingo;
  }

  ha-card {
    padding: 0;
    overflow: hidden;
    /* Inherit HA card sizing properly */
    height: 100%;
    box-sizing: border-box;
  }

  /* ── Header ── */
  .card-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: clamp(12px, 3%, 20px) clamp(12px, 4%, 24px) 0;
  }
  .card-header ha-icon {
    color: var(--primary-color);
    --mdc-icon-size: 22px;
    flex-shrink: 0;
  }
  .card-header-title {
    font-size: var(--ha-card-header-font-size, clamp(18px, 5cqi, 24px));
    font-weight: var(--ha-card-header-font-weight, normal);
    color: var(--ha-card-header-color, var(--primary-text-color));
    flex: 1;
    line-height: 1.2;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* ── Sections wrapper ── */
  .sections {
    padding: 8px clamp(10px, 4%, 20px) clamp(12px, 3%, 20px);
    display: flex;
    flex-direction: column;
    gap: clamp(10px, 2%, 16px);
  }

  .section-label {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.6px;
    text-transform: uppercase;
    color: var(--secondary-text-color);
    margin-bottom: 8px;
  }

  hr {
    border: none;
    border-top: 1px solid var(--divider-color);
    margin: 0;
  }

  /* ── Audio source toggle ── */
  .source-toggle {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .source-btn {
    padding: clamp(8px, 2%, 14px) 8px;
    border-radius: var(--ha-card-border-radius, 12px);
    border: 1px solid var(--divider-color);
    background: var(--secondary-background-color, var(--primary-background-color));
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    transition: background 0.15s, border-color 0.15s;
    color: var(--secondary-text-color);
    font-family: inherit;
    min-width: 0;
  }
  .source-btn ha-icon { --mdc-icon-size: clamp(20px, 6cqi, 28px); }
  .source-btn span {
    font-size: clamp(11px, 3cqi, 13px);
    font-weight: 500;
    white-space: nowrap;
  }
  .source-btn.active-mic {
    background: rgba(var(--rgb-error-color, 211,47,47), 0.12);
    border-color: var(--error-color, #d32f2f);
    color: var(--error-color, #d32f2f);
  }
  .source-btn.active-music {
    background: rgba(var(--rgb-success-color, 67,160,71), 0.12);
    border-color: var(--success-color, #43a047);
    color: var(--success-color, #43a047);
  }

  .mic-status {
    margin-top: 6px;
    font-size: 12px;
    font-weight: 500;
    color: var(--secondary-text-color);
    text-align: center;
  }
  .mic-status.on-air {
    color: var(--error-color, #d32f2f);
    animation: blink 1.5s infinite;
  }
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  /* ── Volume ── */
  .volume-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .volume-row ha-icon {
    color: var(--secondary-text-color);
    --mdc-icon-size: 20px;
    flex-shrink: 0;
  }
  input[type=range] {
    flex: 1;
    min-width: 0;
    -webkit-appearance: none;
    appearance: none;
    height: 4px;
    border-radius: 2px;
    background: var(--divider-color);
    outline: none;
    cursor: pointer;
  }
  input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--primary-color);
    cursor: pointer;
    box-shadow: 0 1px 4px rgba(0,0,0,0.25);
  }
  .volume-value {
    min-width: 34px;
    text-align: right;
    font-size: 13px;
    color: var(--primary-text-color);
    flex-shrink: 0;
  }

  /* ── Soundboard ── */
  .sound-grid {
    display: grid;
    /* Fluid columns: as many as fit, min 64px each */
    grid-template-columns: repeat(auto-fill, minmax(clamp(60px, 18cqi, 90px), 1fr));
    gap: 6px;
  }
  .sound-btn {
    padding: clamp(7px, 2%, 12px) 4px;
    border-radius: var(--ha-card-border-radius, 12px);
    border: 1px solid var(--divider-color);
    background: var(--secondary-background-color, var(--primary-background-color));
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    color: var(--primary-text-color);
    font-family: inherit;
    transition: background 0.15s;
    min-width: 0;
  }
  .sound-btn ha-icon {
    --mdc-icon-size: clamp(18px, 5cqi, 24px);
    color: var(--primary-color);
    flex-shrink: 0;
  }
  .sound-btn span {
    font-size: clamp(9px, 2.5cqi, 11px);
    text-align: center;
    line-height: 1.2;
    color: var(--secondary-text-color);
    word-break: break-word;
    max-width: 100%;
  }
  .sound-btn:hover { background: var(--primary-background-color); }
  .sound-btn:active { opacity: 0.7; }
  .sound-btn-empty {
    color: var(--secondary-text-color);
    font-size: 12px;
    text-align: center;
    padding: 12px;
    border: 1px dashed var(--divider-color);
    border-radius: var(--ha-card-border-radius, 12px);
    grid-column: 1 / -1;
  }

  /* ── Number Caller ── */
  .number-display {
    text-align: center;
    padding: 4px 0;
  }
  .number-letter {
    font-size: clamp(11px, 3cqi, 14px);
    font-weight: 500;
    color: var(--secondary-text-color);
    letter-spacing: 2px;
    margin-bottom: 2px;
  }
  .number-big {
    font-size: clamp(40px, 14cqi, 72px);
    font-weight: 700;
    line-height: 1;
    color: var(--primary-color);
    letter-spacing: -2px;
  }
  .number-placeholder {
    font-size: clamp(32px, 10cqi, 52px);
    font-weight: 300;
    color: var(--disabled-color, var(--divider-color));
    line-height: 1.2;
  }

  .caller-controls {
    display: flex;
    gap: 6px;
    margin: 8px 0 6px;
    flex-wrap: wrap;
  }
  .caller-btn {
    flex: 1;
    min-width: 44px;
    padding: clamp(8px, 2%, 12px) 6px;
    border-radius: var(--ha-card-border-radius, 12px);
    border: 1px solid var(--divider-color);
    background: var(--secondary-background-color, var(--primary-background-color));
    cursor: pointer;
    font-size: clamp(11px, 2.5cqi, 13px);
    font-weight: 500;
    font-family: inherit;
    color: var(--primary-text-color);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    transition: background 0.15s;
    white-space: nowrap;
  }
  .caller-btn ha-icon { --mdc-icon-size: 16px; flex-shrink: 0; }
  .caller-btn:hover { background: var(--primary-background-color); }
  .caller-btn:active { opacity: 0.7; }
  .caller-btn.draw {
    background: var(--primary-color);
    border-color: var(--primary-color);
    color: var(--text-primary-color, white);
    flex: 2;
  }
  .caller-btn.draw:hover { opacity: 0.9; }
  .caller-btn.draw:disabled {
    background: var(--disabled-color, var(--divider-color));
    border-color: var(--disabled-color, var(--divider-color));
    cursor: not-allowed;
    opacity: 0.6;
  }
  .caller-btn.tts.active {
    background: rgba(var(--rgb-primary-color, 3,169,244), 0.15);
    border-color: var(--primary-color);
    color: var(--primary-color);
  }

  .called-numbers {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    max-height: 108px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: var(--divider-color) transparent;
  }
  .called-number {
    width: clamp(22px, 6cqi, 28px);
    height: clamp(22px, 6cqi, 28px);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: clamp(8px, 2.5cqi, 11px);
    font-weight: 600;
    background: var(--secondary-background-color, var(--primary-background-color));
    border: 1px solid var(--divider-color);
    color: var(--secondary-text-color);
    flex-shrink: 0;
    cursor: default;
  }
  .called-number.latest {
    background: var(--primary-color);
    border-color: var(--primary-color);
    color: var(--text-primary-color, white);
    width: clamp(28px, 8cqi, 34px);
    height: clamp(28px, 8cqi, 34px);
    font-size: clamp(10px, 3cqi, 13px);
    font-weight: 700;
  }
  .called-count {
    font-size: 11px;
    color: var(--secondary-text-color);
    text-align: right;
    margin-top: 4px;
  }

  /* ── Bingo column tints ── */
  .cn-b { border-color: #3b82f6; color: #3b82f6; }
  .cn-i { border-color: #ef4444; color: #ef4444; }
  .cn-n { border-color: #f59e0b; color: #f59e0b; }
  .cn-g { border-color: #10b981; color: #10b981; }
  .cn-o { border-color: #8b5cf6; color: #8b5cf6; }

  /* ── Container query: very narrow card (e.g. sidebar / 1/3 grid) ── */
  @container bingo (max-width: 280px) {
    .card-header-title { font-size: 16px; }
    .source-btn span { display: none; }
    .caller-btn.draw span { display: none; }
    .called-numbers { max-height: 80px; }
  }

  /* ── Container query: wide card (2+ grid columns) ── */
  @container bingo (min-width: 500px) {
    .sections { flex-direction: row; flex-wrap: wrap; align-items: flex-start; }
    .sections > * { flex: 1 1 220px; }
    .sections > hr { flex: 0 0 100%; margin: 0; height: 1px; }
    .number-display { padding: 0; }
  }
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getBingoLetter(num, maxNum) {
  if (maxNum <= 75) {
    if (num <= 15) return 'B';
    if (num <= 30) return 'I';
    if (num <= 45) return 'N';
    if (num <= 60) return 'G';
    return 'O';
  }
  return String(Math.ceil(num / 10));
}

function getBingoCssClass(num, maxNum) {
  if (maxNum <= 75) {
    if (num <= 15) return 'cn-b';
    if (num <= 30) return 'cn-i';
    if (num <= 45) return 'cn-n';
    if (num <= 60) return 'cn-g';
    return 'cn-o';
  }
  const classes = ['cn-b','cn-i','cn-n','cn-g','cn-o','cn-b','cn-i','cn-n','cn-g'];
  return classes[Math.floor((num - 1) / 10)] ?? 'cn-n';
}

// ─── Card ─────────────────────────────────────────────────────────────────────

class BingoabendCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._calledNumbers = [];
    this._currentNumber = null;
    this._ttsEnabled = false;
    this._rendered = false;
    this._lastEntityMissing = null;
  }

  static getConfigElement() {
    return document.createElement('bingoabend-card-editor');
  }

  static getStubConfig() {
    return {
      sonos_entity: 'media_player.sonos_wohnzimmer',
      linein_source: 'Line-In',
      max_number: 75,
      sounds: [],
    };
  }

  setConfig(config) {
    if (!config.sonos_entity) throw new Error('sonos_entity ist erforderlich');
    this._config = {
      title: 'Bingoabend',
      linein_source: 'Line-In',
      max_number: 75,
      sounds: [],
      ...config,
    };
    this._render();
  }

  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;

    if (!this._rendered) {
      this._render();
      return;
    }

    const entity = this._config?.sonos_entity;
    if (!entity) return;

    const entityMissing = !hass.states[entity];

    // If entity-missing state changed, full re-render to show/hide error
    if (entityMissing !== this._lastEntityMissing) {
      this._render();
      return;
    }

    if (oldHass?.states[entity] !== hass.states[entity]) {
      this._updateAudioSection();
    }
  }

  // Legacy grid layout
  getCardSize() { return 6; }

  // New HA Sections layout
  getLayoutSize() { return { columns: 1, rows: 6 }; }

  // ─── Render ──────────────────────────────────────────────────────────────

  _render() {
    if (!this._config) return;

    const style = document.createElement('style');
    style.textContent = STYLES;

    const root = document.createElement('ha-card');
    root.innerHTML = this._buildHTML();

    // Track entity-missing state at render time
    if (this._hass) {
      this._lastEntityMissing = !this._hass.states[this._config.sonos_entity];
    }

    while (this.shadowRoot.firstChild) this.shadowRoot.removeChild(this.shadowRoot.firstChild);
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(root);
    this._rendered = true;

    this._attachListeners(root);
  }

  _buildHTML() {
    return `
      <div class="card-header">
        <ha-icon icon="mdi:bingo"></ha-icon>
        <div class="card-header-title">${this._esc(this._config.title || 'Bingoabend')}</div>
      </div>
      <div class="sections">
        ${this._buildAudioSection()}
        <hr>
        ${this._buildVolumeSection()}
        <hr>
        ${this._buildSoundboardSection()}
        <hr>
        ${this._buildNumberCallerSection()}
      </div>
    `;
  }

  _buildAudioSection() {
    const entity = this._config.sonos_entity;
    const lineinSource = this._config.linein_source;

    // Only show "not found" if hass is available but entity doesn't exist
    const state = this._hass?.states[entity];
    const entityMissing = this._hass != null && !state;

    const currentSource = state?.attributes?.source;
    const isMicActive = currentSource === lineinSource;

    const micClass  = isMicActive ? 'active-mic' : '';
    const musicClass = (!isMicActive && state) ? 'active-music' : '';

    return `
      <div id="audio-section">
        <div class="section-label">Audio Quelle</div>
        ${entityMissing ? `
          <ha-alert alert-type="error">
            Entität <b>${this._esc(entity)}</b> nicht gefunden
          </ha-alert>
        ` : ''}
        <div class="source-toggle">
          <button class="source-btn ${micClass}" id="btn-mic">
            <ha-icon icon="mdi:microphone"></ha-icon>
            <span>Mikrofon</span>
          </button>
          <button class="source-btn ${musicClass}" id="btn-music">
            <ha-icon icon="mdi:music"></ha-icon>
            <span>Musik</span>
          </button>
        </div>
        ${state ? `<div class="mic-status ${isMicActive ? 'on-air' : ''}">
          ${isMicActive ? '● ON AIR' : '● Musik-Modus'}
        </div>` : ''}
      </div>
    `;
  }

  _buildVolumeSection() {
    const entity = this._config.sonos_entity;
    const state = this._hass?.states[entity];
    const volume = state?.attributes?.volume_level ?? 0.5;
    const pct = Math.round(volume * 100);
    const muted = state?.attributes?.is_volume_muted ?? false;
    const icon = muted ? 'mdi:volume-mute' : pct < 30 ? 'mdi:volume-low' : pct < 70 ? 'mdi:volume-medium' : 'mdi:volume-high';

    return `
      <div>
        <div class="section-label">Lautstärke</div>
        <div class="volume-row">
          <ha-icon icon="${icon}"></ha-icon>
          <input type="range" id="volume-slider" min="0" max="100" step="2" value="${pct}">
          <div class="volume-value" id="volume-value">${pct}%</div>
        </div>
      </div>
    `;
  }

  _buildSoundboardSection() {
    const sounds = this._config.sounds || [];
    const buttonsHtml = sounds.length === 0
      ? `<div class="sound-btn-empty">Keine Sounds konfiguriert.<br><small>Füge "sounds:" zur Karten-Konfiguration hinzu.</small></div>`
      : sounds.map((s, i) => `
          <button class="sound-btn" data-idx="${i}" title="${this._esc(s.name)}">
            <ha-icon icon="${this._esc(s.icon || 'mdi:music-note')}"></ha-icon>
            <span>${this._esc(s.name)}</span>
          </button>
        `).join('');

    return `
      <div>
        <div class="section-label">Soundboard</div>
        <div class="sound-grid">${buttonsHtml}</div>
      </div>
    `;
  }

  _buildNumberCallerSection() {
    const maxNum = this._config.max_number || 75;
    const remaining = maxNum - this._calledNumbers.length;
    const allCalled = remaining === 0;

    const numDisplay = this._currentNumber
      ? `<div class="number-letter">${getBingoLetter(this._currentNumber, maxNum)}</div>
         <div class="number-big">${this._currentNumber}</div>`
      : `<div class="number-placeholder">–</div>`;

    const calledHtml = this._calledNumbers.length > 0
      ? [...this._calledNumbers].reverse().map((n, i) => {
          const cls = getBingoCssClass(n, maxNum) + (i === 0 ? ' latest' : '');
          return `<div class="called-number ${cls}" title="${n}">${n}</div>`;
        }).join('')
      : `<span style="font-size:12px;color:var(--secondary-text-color)">Noch keine Zahlen gezogen</span>`;

    return `
      <div id="caller-section">
        <div class="section-label">Nummern-Caller (1–${maxNum})</div>
        <div class="number-display">${numDisplay}</div>
        <div class="caller-controls">
          <button class="caller-btn draw" id="btn-draw" ${allCalled ? 'disabled' : ''}>
            <ha-icon icon="mdi:dice-multiple"></ha-icon>
            ${allCalled ? 'Alle gezogen' : `Ziehen (${remaining})`}
          </button>
          <button class="caller-btn tts ${this._ttsEnabled ? 'active' : ''}" id="btn-tts" title="TTS ${this._ttsEnabled ? 'aktiv' : 'inaktiv'}">
            <ha-icon icon="mdi:text-to-speech"></ha-icon>
          </button>
          <button class="caller-btn" id="btn-reset" title="Zurücksetzen">
            <ha-icon icon="mdi:restart"></ha-icon>
          </button>
        </div>
        <div class="called-numbers">${calledHtml}</div>
        <div class="called-count">${this._calledNumbers.length} / ${maxNum}</div>
      </div>
    `;
  }

  // ─── Partial Updates ─────────────────────────────────────────────────────

  _updateAudioSection() {
    const entity = this._config.sonos_entity;
    const lineinSource = this._config.linein_source;
    const state = this._hass?.states[entity];
    const currentSource = state?.attributes?.source;
    const isMicActive = currentSource === lineinSource;

    const btnMic   = this.shadowRoot.querySelector('#btn-mic');
    const btnMusic = this.shadowRoot.querySelector('#btn-music');
    if (btnMic)   btnMic.className   = `source-btn ${isMicActive ? 'active-mic' : ''}`;
    if (btnMusic) btnMusic.className = `source-btn ${(!isMicActive && state) ? 'active-music' : ''}`;

    const statusEl = this.shadowRoot.querySelector('.mic-status');
    if (statusEl) {
      statusEl.textContent = isMicActive ? '● ON AIR' : '● Musik-Modus';
      statusEl.className = `mic-status ${isMicActive ? 'on-air' : ''}`;
    }

    const volSlider = this.shadowRoot.querySelector('#volume-slider');
    const volValue  = this.shadowRoot.querySelector('#volume-value');
    if (volSlider && !volSlider.matches(':active')) {
      const pct = Math.round((state?.attributes?.volume_level ?? 0.5) * 100);
      volSlider.value = pct;
      if (volValue) volValue.textContent = `${pct}%`;
    }
  }

  // ─── Listeners ───────────────────────────────────────────────────────────

  _attachListeners(root) {
    root.querySelector('#btn-mic')?.addEventListener('click',   () => this._activateMic());
    root.querySelector('#btn-music')?.addEventListener('click', () => this._activateMusic());

    const volSlider = root.querySelector('#volume-slider');
    if (volSlider) {
      volSlider.addEventListener('input', (e) => {
        const el = this.shadowRoot.querySelector('#volume-value');
        if (el) el.textContent = `${e.target.value}%`;
      });
      volSlider.addEventListener('change', (e) => this._setVolume(parseInt(e.target.value) / 100));
    }

    root.querySelectorAll('.sound-btn[data-idx]').forEach((btn) => {
      btn.addEventListener('click', () => this._playSound(parseInt(btn.dataset.idx)));
    });

    root.querySelector('#btn-draw')?.addEventListener('click',  () => this._drawNumber());
    root.querySelector('#btn-reset')?.addEventListener('click', () => this._resetGame());
    root.querySelector('#btn-tts')?.addEventListener('click',   () => this._toggleTts());
  }

  // ─── Actions ─────────────────────────────────────────────────────────────

  _activateMic() {
    this._callService('media_player', 'select_source', {
      entity_id: this._config.sonos_entity,
      source: this._config.linein_source,
    });
  }

  _activateMusic() {
    if (this._config.music_source) {
      this._callService('media_player', 'select_source', {
        entity_id: this._config.sonos_entity,
        source: this._config.music_source,
      });
    } else {
      this._callService('media_player', 'media_play', { entity_id: this._config.sonos_entity });
    }
  }

  _setVolume(level) {
    this._callService('media_player', 'volume_set', {
      entity_id: this._config.sonos_entity,
      volume_level: level,
    });
  }

  _playSound(idx) {
    const sound = this._config.sounds?.[idx];
    if (!sound?.url) return;
    this._callService('media_player', 'play_media', {
      entity_id: this._config.sonos_entity,
      media_content_id: sound.url,
      media_content_type: 'music',
    });
  }

  _drawNumber() {
    const maxNum = this._config.max_number || 75;
    const pool = [];
    for (let i = 1; i <= maxNum; i++) {
      if (!this._calledNumbers.includes(i)) pool.push(i);
    }
    if (pool.length === 0) return;

    const num = pool[Math.floor(Math.random() * pool.length)];
    this._calledNumbers.push(num);
    this._currentNumber = num;

    // Re-render caller section only
    const callerSection = this.shadowRoot.querySelector('#caller-section');
    if (callerSection) {
      const tmp = document.createElement('div');
      tmp.innerHTML = this._buildNumberCallerSection();
      const newSection = tmp.firstElementChild;
      callerSection.replaceWith(newSection);
      newSection.querySelector('#btn-draw')?.addEventListener('click',  () => this._drawNumber());
      newSection.querySelector('#btn-reset')?.addEventListener('click', () => this._resetGame());
      newSection.querySelector('#btn-tts')?.addEventListener('click',   () => this._toggleTts());
    }

    if (this._ttsEnabled) {
      const letter = getBingoLetter(num, maxNum);
      const msg = maxNum <= 75 ? `${letter}, ${num}` : `Nummer ${num}`;
      this._callService('tts', 'cloud_say', {
        entity_id: this._config.sonos_entity,
        message: msg,
        language: 'de-DE',
      }).catch(() => this._callService('tts', 'google_translate_say', {
        entity_id: this._config.sonos_entity,
        message: msg,
        language: 'de',
      }));
    }
  }

  _resetGame() {
    if (!confirm(`Spiel zurücksetzen? (${this._calledNumbers.length} Zahlen gelöscht)`)) return;
    this._calledNumbers = [];
    this._currentNumber = null;
    this._render();
  }

  _toggleTts() {
    this._ttsEnabled = !this._ttsEnabled;
    const btn = this.shadowRoot.querySelector('#btn-tts');
    if (btn) {
      btn.classList.toggle('active', this._ttsEnabled);
      btn.title = `TTS ${this._ttsEnabled ? 'aktiv' : 'inaktiv'}`;
    }
  }

  // ─── Util ────────────────────────────────────────────────────────────────

  _callService(domain, service, data) {
    if (!this._hass) return Promise.reject('hass not ready');
    return this._hass.callService(domain, service, data);
  }

  _esc(str) {
    return String(str ?? '')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
}

customElements.define('bingoabend-card', BingoabendCard);

// ─── Visual Editor ────────────────────────────────────────────────────────────

const EDITOR_STYLES = `
  :host { display: block; }
  .editor { display: flex; flex-direction: column; gap: 16px; padding: 16px; }
  ha-form { display: block; }

  .sounds-section { display: flex; flex-direction: column; gap: 8px; }
  .sounds-header {
    display: flex; align-items: center; justify-content: space-between;
    font-size: 11px; font-weight: 500; letter-spacing: 0.6px;
    text-transform: uppercase; color: var(--secondary-text-color);
  }
  .sounds-add {
    background: none; border: 1px solid var(--primary-color);
    color: var(--primary-color); border-radius: 8px;
    padding: 4px 10px; cursor: pointer; font-size: 12px; font-weight: 500;
    display: flex; align-items: center; gap: 4px;
  }
  .sounds-add ha-icon { --mdc-icon-size: 14px; }
  .sounds-add:hover { background: rgba(var(--rgb-primary-color,3,169,244),0.1); }

  .sound-row {
    display: grid; grid-template-columns: 1fr 1fr auto auto; gap: 6px;
    align-items: center; padding: 8px; border-radius: 8px;
    border: 1px solid var(--divider-color);
    background: var(--secondary-background-color, var(--primary-background-color));
  }
  .sound-row ha-textfield { display: block; }
  .sound-icon-preview {
    color: var(--primary-color);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
  }
  .sound-icon-preview ha-icon { --mdc-icon-size: 22px; }
  .sound-remove {
    background: none; border: none; cursor: pointer;
    color: var(--error-color, #d32f2f); padding: 4px;
    display: flex; align-items: center; border-radius: 4px;
  }
  .sound-remove:hover { background: rgba(211,47,47,0.1); }
  .sound-remove ha-icon { --mdc-icon-size: 18px; }
  .sound-row-full { grid-column: 1 / -1; }

  .icon-hint {
    font-size: 11px; color: var(--secondary-text-color);
    padding: 0 4px;
  }
`;

const MAIN_SCHEMA = [
  { name: 'title',         label: 'Kartentitel',              selector: { text: {} } },
  { name: 'sonos_entity',  label: 'Sonos Media Player',       selector: { entity: { domain: 'media_player' } } },
  { name: 'linein_source', label: 'Line-In Quellenname',      selector: { text: {} } },
  { name: 'music_source',  label: 'Musik-Quelle (optional)',  selector: { text: {} } },
  {
    name: 'max_number', label: 'Bingo-Variante',
    selector: { select: { mode: 'list', options: [
      { value: 75, label: '75 Zahlen  (B I N G O)' },
      { value: 90, label: '90 Zahlen  (europäisch)' },
    ] } },
  },
];

class BingoabendCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
  }

  setConfig(config) {
    this._config = { title: 'Bingoabend', linein_source: 'Line-In', max_number: 75, sounds: [], ...config };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    const form = this.shadowRoot.querySelector('ha-form');
    if (form) form.hass = hass;
  }

  _render() {
    const style = document.createElement('style');
    style.textContent = EDITOR_STYLES;

    const editor = document.createElement('div');
    editor.className = 'editor';

    // ── Main form via ha-form ──
    const form = document.createElement('ha-form');
    form.hass = this._hass;
    form.data = this._config;
    form.schema = MAIN_SCHEMA;
    form.computeLabel = (s) => s.label;
    form.addEventListener('value-changed', (ev) => {
      this._config = { ...this._config, ...ev.detail.value };
      this._dispatchChange();
    });
    editor.appendChild(form);

    // ── Sounds list ──
    const soundsSection = this._buildSoundsSection();
    editor.appendChild(soundsSection);

    while (this.shadowRoot.firstChild) this.shadowRoot.removeChild(this.shadowRoot.firstChild);
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(editor);
  }

  _buildSoundsSection() {
    const section = document.createElement('div');
    section.className = 'sounds-section';

    const header = document.createElement('div');
    header.className = 'sounds-header';
    header.innerHTML = `<span>Soundboard</span>`;

    const addBtn = document.createElement('button');
    addBtn.className = 'sounds-add';
    addBtn.innerHTML = `<ha-icon icon="mdi:plus"></ha-icon> Sound hinzufügen`;
    addBtn.addEventListener('click', () => {
      this._config = {
        ...this._config,
        sounds: [...(this._config.sounds || []), { name: '', url: '', icon: 'mdi:music-note' }],
      };
      this._dispatchChange();
      this._render();
    });
    header.appendChild(addBtn);
    section.appendChild(header);

    (this._config.sounds || []).forEach((sound, idx) => {
      section.appendChild(this._buildSoundRow(sound, idx));
    });

    return section;
  }

  _buildSoundRow(sound, idx) {
    const row = document.createElement('div');
    row.className = 'sound-row';

    const mkField = (label, value, field, fullWidth) => {
      const tf = document.createElement('ha-textfield');
      tf.label = label;
      tf.value = value || '';
      if (fullWidth) tf.className = 'sound-row-full';
      tf.style.cssText = 'display:block;';
      tf.addEventListener('change', (e) => {
        const sounds = [...(this._config.sounds || [])];
        sounds[idx] = { ...sounds[idx], [field]: e.target.value };
        this._config = { ...this._config, sounds };
        this._dispatchChange();
      });
      return tf;
    };

    row.appendChild(mkField('Name', sound.name, 'name'));
    row.appendChild(mkField('MDI Icon', sound.icon, 'icon'));

    const iconPreview = document.createElement('div');
    iconPreview.className = 'sound-icon-preview';
    iconPreview.title = 'Vorschau';
    iconPreview.innerHTML = `<ha-icon icon="${sound.icon || 'mdi:music-note'}"></ha-icon>`;
    row.appendChild(iconPreview);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'sound-remove';
    removeBtn.title = 'Entfernen';
    removeBtn.innerHTML = `<ha-icon icon="mdi:delete"></ha-icon>`;
    removeBtn.addEventListener('click', () => {
      const sounds = [...(this._config.sounds || [])];
      sounds.splice(idx, 1);
      this._config = { ...this._config, sounds };
      this._dispatchChange();
      this._render();
    });
    row.appendChild(removeBtn);

    const urlField = mkField('Sound URL  (z.B. /local/sounds/fanfare.mp3)', sound.url, 'url', true);
    row.appendChild(urlField);

    return row;
  }

  _dispatchChange() {
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config }, bubbles: true, composed: true }));
  }
}

customElements.define('bingoabend-card-editor', BingoabendCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'bingoabend-card',
  name: 'Bingoabend Card',
  description: 'Sonos Line-In/Mikrofon, Soundboard, Nummern-Caller',
  preview: true,
});

console.info(
  `%c BINGOABEND-CARD %c v${CARD_VERSION} `,
  'color:white;background:#1976d2;font-weight:bold;border-radius:3px 0 0 3px',
  'color:#1976d2;background:#e3f2fd;font-weight:bold;border-radius:0 3px 3px 0'
);
