/**
 * Bingoabend Custom Card für Home Assistant
 *
 * Konfiguration (Lovelace YAML):
 *
 *   type: custom:bingoabend-card
 *   title: Bingoabend Steuerung
 *   sonos_entity: media_player.sonos_wohnzimmer
 *   linein_source: "Line-In"        # Exakter Sonos-Quellenname
 *   music_source: "Spotify"         # Optional: Musik-Quelle beim Abschalten des Miks
 *   max_number: 75                  # Optional: Höchste Bingo-Zahl (Standard: 75)
 *   sounds:
 *     - name: "Fanfare"
 *       url: "/local/sounds/fanfare.mp3"
 *       icon: "mdi:trumpet"
 *       color: "#f59e0b"
 *     - name: "Trommelwirbel"
 *       url: "/local/sounds/drumroll.mp3"
 *       icon: "mdi:music-note"
 *       color: "#10b981"
 */

const CARD_VERSION = "1.0.0";

// ─── Styles ──────────────────────────────────────────────────────────────────

const STYLES = `
  :host {
    --bingo-primary: #6c3cff;
    --bingo-primary-light: #8b5cf6;
    --bingo-accent: #f59e0b;
    --bingo-green: #10b981;
    --bingo-red: #ef4444;
    --bingo-bg: #1a1035;
    --bingo-card-bg: #231950;
    --bingo-section-bg: #2d2160;
    --bingo-text: #e2d9ff;
    --bingo-text-muted: #9d8fd0;
    --bingo-border: rgba(108, 60, 255, 0.3);
    --bingo-radius: 16px;
    --bingo-radius-sm: 10px;
    display: block;
    font-family: var(--paper-font-body1_-_font-family, 'Segoe UI', system-ui, sans-serif);
  }

  .card {
    background: var(--bingo-bg);
    border-radius: var(--bingo-radius);
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px var(--bingo-border);
  }

  /* Header */
  .header {
    background: linear-gradient(135deg, #4c1d95, #6c3cff, #7c3aed);
    padding: 20px 24px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .header-balls {
    display: flex;
    gap: 6px;
  }
  .ball {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 800;
    color: white;
    text-shadow: 0 1px 2px rgba(0,0,0,0.5);
    flex-shrink: 0;
  }
  .ball-b { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
  .ball-i { background: linear-gradient(135deg, #ef4444, #b91c1c); }
  .ball-n { background: linear-gradient(135deg, #f59e0b, #d97706); }
  .ball-g { background: linear-gradient(135deg, #10b981, #059669); }
  .ball-o { background: linear-gradient(135deg, #8b5cf6, #6d28d9); }
  .header-title {
    flex: 1;
    color: white;
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.5px;
    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  }
  .header-badge {
    background: rgba(255,255,255,0.15);
    color: rgba(255,255,255,0.9);
    font-size: 10px;
    padding: 2px 8px;
    border-radius: 20px;
    font-weight: 600;
  }

  /* Sections */
  .sections {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .section {
    background: var(--bingo-section-bg);
    border-radius: var(--bingo-radius-sm);
    padding: 16px;
    border: 1px solid var(--bingo-border);
  }
  .section-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: var(--bingo-text-muted);
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .section-label ha-icon {
    --mdc-icon-size: 14px;
    color: var(--bingo-primary-light);
  }

  /* Mikrofon Toggle */
  .mic-toggle {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .source-btn {
    padding: 16px 12px;
    border-radius: var(--bingo-radius-sm);
    border: 2px solid transparent;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    transition: all 0.2s ease;
    background: rgba(255,255,255,0.05);
    color: var(--bingo-text-muted);
  }
  .source-btn ha-icon {
    --mdc-icon-size: 32px;
  }
  .source-btn span {
    font-size: 13px;
    font-weight: 700;
  }
  .source-btn.active-mic {
    background: rgba(239, 68, 68, 0.15);
    border-color: #ef4444;
    color: #fca5a5;
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.2);
  }
  .source-btn.active-mic ha-icon {
    color: #ef4444;
    filter: drop-shadow(0 0 6px rgba(239,68,68,0.7));
  }
  .source-btn.active-music {
    background: rgba(16, 185, 129, 0.15);
    border-color: #10b981;
    color: #6ee7b7;
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.2);
  }
  .source-btn.active-music ha-icon {
    color: #10b981;
    filter: drop-shadow(0 0 6px rgba(16,185,129,0.7));
  }
  .source-btn:hover:not(.active-mic):not(.active-music) {
    background: rgba(255,255,255,0.1);
    border-color: var(--bingo-primary-light);
    color: var(--bingo-text);
  }
  .mic-status {
    margin-top: 8px;
    text-align: center;
    font-size: 12px;
    font-weight: 600;
    padding: 6px 12px;
    border-radius: 20px;
  }
  .mic-status.on-air {
    background: rgba(239, 68, 68, 0.2);
    color: #fca5a5;
    animation: pulse 1.5s infinite;
  }
  .mic-status.off-air {
    background: rgba(16, 185, 129, 0.15);
    color: #6ee7b7;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }

  /* Volume */
  .volume-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .volume-icon {
    color: var(--bingo-primary-light);
    flex-shrink: 0;
  }
  .volume-icon ha-icon { --mdc-icon-size: 22px; }
  .volume-slider {
    flex: 1;
    -webkit-appearance: none;
    appearance: none;
    height: 6px;
    border-radius: 3px;
    background: rgba(255,255,255,0.15);
    outline: none;
    cursor: pointer;
  }
  .volume-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--bingo-primary-light), var(--bingo-primary));
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(108,60,255,0.5);
    transition: transform 0.1s;
  }
  .volume-slider::-webkit-slider-thumb:hover {
    transform: scale(1.2);
  }
  .volume-value {
    min-width: 38px;
    text-align: right;
    font-size: 14px;
    font-weight: 700;
    color: var(--bingo-text);
  }

  /* Soundboard */
  .sound-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 8px;
  }
  .sound-btn {
    padding: 12px 8px;
    border-radius: var(--bingo-radius-sm);
    border: none;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    transition: all 0.15s ease;
    color: white;
    font-size: 11px;
    font-weight: 700;
    line-height: 1.2;
    text-align: center;
    position: relative;
    overflow: hidden;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.1);
  }
  .sound-btn ha-icon { --mdc-icon-size: 24px; }
  .sound-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(255,255,255,0.1);
    opacity: 0;
    transition: opacity 0.15s;
  }
  .sound-btn:hover::before { opacity: 1; }
  .sound-btn:active { transform: scale(0.95); }
  .sound-btn.playing {
    animation: soundPulse 0.5s ease;
    box-shadow: 0 0 20px rgba(255,255,255,0.2);
  }
  @keyframes soundPulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  .sound-btn-empty {
    color: var(--bingo-text-muted);
    font-size: 11px;
    text-align: center;
    padding: 12px;
    border: 2px dashed var(--bingo-border);
    border-radius: var(--bingo-radius-sm);
    grid-column: 1 / -1;
  }

  /* Bingo Number Caller */
  .number-display {
    text-align: center;
    margin-bottom: 12px;
  }
  .number-big {
    font-size: 72px;
    font-weight: 900;
    line-height: 1;
    background: linear-gradient(135deg, #f59e0b, #fbbf24, #fcd34d);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: none;
    letter-spacing: -2px;
    filter: drop-shadow(0 0 20px rgba(245,158,11,0.5));
  }
  .number-letter {
    font-size: 22px;
    font-weight: 800;
    color: var(--bingo-text-muted);
    margin-bottom: -4px;
    letter-spacing: 2px;
  }
  .number-placeholder {
    font-size: 48px;
    color: rgba(255,255,255,0.1);
    font-weight: 900;
  }

  .caller-controls {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }
  .caller-btn {
    flex: 1;
    padding: 12px 8px;
    border-radius: var(--bingo-radius-sm);
    border: none;
    cursor: pointer;
    font-size: 13px;
    font-weight: 700;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }
  .caller-btn ha-icon { --mdc-icon-size: 18px; }
  .caller-btn.draw {
    background: linear-gradient(135deg, #f59e0b, #d97706);
    color: white;
    box-shadow: 0 4px 15px rgba(245,158,11,0.3);
  }
  .caller-btn.draw:hover {
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(245,158,11,0.4);
  }
  .caller-btn.draw:active { transform: scale(0.97); }
  .caller-btn.draw:disabled {
    background: rgba(255,255,255,0.1);
    color: var(--bingo-text-muted);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  .caller-btn.reset {
    background: rgba(239,68,68,0.15);
    color: #fca5a5;
    border: 1px solid rgba(239,68,68,0.3);
  }
  .caller-btn.reset:hover {
    background: rgba(239,68,68,0.25);
  }
  .caller-btn.tts {
    background: rgba(108,60,255,0.2);
    color: var(--bingo-primary-light);
    border: 1px solid var(--bingo-border);
  }
  .caller-btn.tts.active {
    background: rgba(108,60,255,0.4);
    border-color: var(--bingo-primary-light);
  }
  .caller-btn.tts:hover {
    background: rgba(108,60,255,0.3);
  }

  .called-numbers {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    max-height: 120px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: var(--bingo-primary) transparent;
    padding: 4px 0;
  }
  .called-number {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 800;
    flex-shrink: 0;
    transition: transform 0.2s;
  }
  .called-number:hover { transform: scale(1.2); }
  .called-number.latest {
    width: 34px;
    height: 34px;
    font-size: 12px;
    box-shadow: 0 0 12px currentColor;
    animation: popIn 0.3s ease;
  }
  @keyframes popIn {
    0% { transform: scale(0); }
    70% { transform: scale(1.15); }
    100% { transform: scale(1); }
  }
  /* Bingo column colors */
  .cn-b { background: rgba(59,130,246,0.3); color: #93c5fd; border: 1px solid rgba(59,130,246,0.4); }
  .cn-i { background: rgba(239,68,68,0.3); color: #fca5a5; border: 1px solid rgba(239,68,68,0.4); }
  .cn-n { background: rgba(245,158,11,0.3); color: #fcd34d; border: 1px solid rgba(245,158,11,0.4); }
  .cn-g { background: rgba(16,185,129,0.3); color: #6ee7b7; border: 1px solid rgba(16,185,129,0.4); }
  .cn-o { background: rgba(139,92,246,0.3); color: #c4b5fd; border: 1px solid rgba(139,92,246,0.4); }
  .cn-extra { background: rgba(236,72,153,0.3); color: #f9a8d4; border: 1px solid rgba(236,72,153,0.4); }

  .called-count {
    font-size: 11px;
    color: var(--bingo-text-muted);
    text-align: center;
    margin-top: 8px;
  }

  /* Spinner */
  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 60px;
    color: var(--bingo-text-muted);
    gap: 8px;
    font-size: 13px;
  }

  /* Error */
  .error-msg {
    background: rgba(239,68,68,0.15);
    border: 1px solid rgba(239,68,68,0.3);
    border-radius: var(--bingo-radius-sm);
    padding: 12px;
    color: #fca5a5;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .error-msg ha-icon { --mdc-icon-size: 18px; color: #ef4444; flex-shrink: 0; }
`;

// ─── Bingo letter helper ──────────────────────────────────────────────────────

function getBingoLetter(num, maxNum) {
  if (maxNum <= 75) {
    if (num <= 15) return 'B';
    if (num <= 30) return 'I';
    if (num <= 45) return 'N';
    if (num <= 60) return 'G';
    return 'O';
  }
  // 90-ball (UK/German style)
  if (num <= 9) return '1';
  if (num <= 19) return '2';
  if (num <= 29) return '3';
  if (num <= 39) return '4';
  if (num <= 49) return '5';
  if (num <= 59) return '6';
  if (num <= 69) return '7';
  if (num <= 79) return '8';
  return '9';
}

function getBingoCssClass(num, maxNum) {
  if (maxNum <= 75) {
    if (num <= 15) return 'cn-b';
    if (num <= 30) return 'cn-i';
    if (num <= 45) return 'cn-n';
    if (num <= 60) return 'cn-g';
    return 'cn-o';
  }
  const row = Math.floor((num - 1) / 9);
  const classes = ['cn-b', 'cn-i', 'cn-n', 'cn-g', 'cn-o', 'cn-extra', 'cn-b', 'cn-i', 'cn-n', 'cn-g'];
  return classes[row] ?? 'cn-extra';
}

// ─── Card Class ──────────────────────────────────────────────────────────────

class BingoabendCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    // Bingo state
    this._calledNumbers = [];
    this._currentNumber = null;
    this._ttsEnabled = false;
    this._playingSound = null;

    this._boundRender = this._render.bind(this);
  }

  static getConfigElement() {
    return document.createElement('bingoabend-card-editor');
  }

  static getStubConfig() {
    return {
      sonos_entity: 'media_player.sonos_wohnzimmer',
      linein_source: 'Line-In',
      max_number: 75,
      sounds: [
        { name: 'Fanfare', url: '/local/sounds/fanfare.mp3', icon: 'mdi:trumpet', color: '#f59e0b' },
        { name: 'Applaus', url: '/local/sounds/applause.mp3', icon: 'mdi:hand-clap', color: '#10b981' },
      ],
    };
  }

  setConfig(config) {
    if (!config.sonos_entity) {
      throw new Error('sonos_entity ist erforderlich');
    }
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

    if (!this.shadowRoot.querySelector('.card')) {
      this._render();
      return;
    }

    // Efficient partial updates - only re-render changed parts
    const entity = this._config?.sonos_entity;
    if (entity && oldHass?.states[entity] !== hass.states[entity]) {
      this._updateAudioSection();
    }
  }

  getCardSize() {
    return 6;
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  _render() {
    if (!this._config) return;

    const style = document.createElement('style');
    style.textContent = STYLES;

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = this._buildHTML();

    // Clear shadow root
    while (this.shadowRoot.firstChild) {
      this.shadowRoot.removeChild(this.shadowRoot.firstChild);
    }
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(card);

    this._attachListeners(card);
  }

  _buildHTML() {
    return `
      ${this._buildHeader()}
      <div class="sections">
        ${this._buildAudioSection()}
        ${this._buildVolumeSection()}
        ${this._buildSoundboardSection()}
        ${this._buildNumberCallerSection()}
      </div>
    `;
  }

  _buildHeader() {
    const title = this._config.title || 'Bingoabend';
    return `
      <div class="header">
        <div class="header-balls">
          <div class="ball ball-b">B</div>
          <div class="ball ball-i">I</div>
          <div class="ball ball-n">N</div>
          <div class="ball ball-g">G</div>
          <div class="ball ball-o">O</div>
        </div>
        <div class="header-title">${this._escHtml(title)}</div>
        <div class="header-badge">v${CARD_VERSION}</div>
      </div>
    `;
  }

  _buildAudioSection() {
    const entity = this._config.sonos_entity;
    const lineinSource = this._config.linein_source;
    const state = this._hass?.states[entity];
    const currentSource = state?.attributes?.source;
    const isMicActive = currentSource === lineinSource;
    const entityMissing = !state;

    const micClass = isMicActive ? 'active-mic' : '';
    const musicClass = (!isMicActive && !entityMissing) ? 'active-music' : '';
    const statusText = isMicActive ? '🔴 ON AIR – Mikrofon aktiv' : '🎵 Musik-Modus';
    const statusClass = isMicActive ? 'on-air' : 'off-air';

    const errorHtml = entityMissing
      ? `<div class="error-msg"><ha-icon icon="mdi:alert-circle"></ha-icon>
           Entität <b>${this._escHtml(entity)}</b> nicht gefunden</div>`
      : '';

    return `
      <div class="section" id="audio-section">
        <div class="section-label">
          <ha-icon icon="mdi:audio-input-rca"></ha-icon>
          Audio Quelle
        </div>
        ${errorHtml}
        <div class="mic-toggle">
          <button class="source-btn ${micClass}" id="btn-mic" title="Auf Mikrofon (Line-In) umschalten">
            <ha-icon icon="mdi:microphone"></ha-icon>
            <span>Mikrofon</span>
          </button>
          <button class="source-btn ${musicClass}" id="btn-music" title="Auf Musik umschalten">
            <ha-icon icon="mdi:music"></ha-icon>
            <span>Musik</span>
          </button>
        </div>
        ${!entityMissing ? `<div class="mic-status ${statusClass}">${statusText}</div>` : ''}
      </div>
    `;
  }

  _buildVolumeSection() {
    const entity = this._config.sonos_entity;
    const state = this._hass?.states[entity];
    const volume = state?.attributes?.volume_level ?? 0.5;
    const volumePct = Math.round(volume * 100);
    const isMuted = state?.attributes?.is_volume_muted ?? false;
    const volIcon = isMuted ? 'mdi:volume-mute' : (volumePct < 30 ? 'mdi:volume-low' : volumePct < 70 ? 'mdi:volume-medium' : 'mdi:volume-high');

    return `
      <div class="section">
        <div class="section-label">
          <ha-icon icon="mdi:volume-high"></ha-icon>
          Lautstärke
        </div>
        <div class="volume-row">
          <div class="volume-icon">
            <ha-icon icon="${volIcon}"></ha-icon>
          </div>
          <input
            type="range"
            class="volume-slider"
            id="volume-slider"
            min="0" max="100" step="2"
            value="${volumePct}"
          />
          <div class="volume-value" id="volume-value">${volumePct}%</div>
        </div>
      </div>
    `;
  }

  _buildSoundboardSection() {
    const sounds = this._config.sounds || [];

    let buttonsHtml = '';
    if (sounds.length === 0) {
      buttonsHtml = `<div class="sound-btn-empty">
        Keine Sounds konfiguriert.<br>
        <small>Füge "sounds:" zur Karten-Konfiguration hinzu.</small>
      </div>`;
    } else {
      buttonsHtml = sounds.map((s, i) => {
        const bgColor = s.color ? `background: ${s.color}22; border-color: ${s.color}55;` : '';
        const iconColor = s.color ? `--mdc-icon-color: ${s.color};` : '';
        const icon = s.icon || 'mdi:music-note';
        return `<button
          class="sound-btn"
          id="sound-btn-${i}"
          data-idx="${i}"
          title="${this._escHtml(s.name)}"
          style="${bgColor}"
        >
          <ha-icon icon="${this._escHtml(icon)}" style="${iconColor}"></ha-icon>
          <span>${this._escHtml(s.name)}</span>
        </button>`;
      }).join('');
    }

    return `
      <div class="section">
        <div class="section-label">
          <ha-icon icon="mdi:soundbar"></ha-icon>
          Soundboard
        </div>
        <div class="sound-grid">
          ${buttonsHtml}
        </div>
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
      : `<div class="number-placeholder">?</div>`;

    const calledHtml = this._calledNumbers.length > 0
      ? [...this._calledNumbers].reverse().map((n, i) => {
          const isLatest = i === 0;
          const cssClass = getBingoCssClass(n, maxNum) + (isLatest ? ' latest' : '');
          return `<div class="called-number ${cssClass}" title="${n}">${n}</div>`;
        }).join('')
      : `<div style="color: var(--bingo-text-muted); font-size: 12px; padding: 8px;">Noch keine Zahlen gezogen</div>`;

    const ttsClass = this._ttsEnabled ? 'active' : '';

    return `
      <div class="section">
        <div class="section-label">
          <ha-icon icon="mdi:bingo"></ha-icon>
          Nummern-Caller (1–${maxNum})
        </div>

        <div class="number-display">
          ${numDisplay}
        </div>

        <div class="caller-controls">
          <button class="caller-btn draw" id="btn-draw" ${allCalled ? 'disabled' : ''}>
            <ha-icon icon="mdi:dice-multiple"></ha-icon>
            ${allCalled ? 'Fertig!' : `Ziehen (${remaining} übrig)`}
          </button>
          <button class="caller-btn tts ${ttsClass}" id="btn-tts" title="Text-to-Speech umschalten">
            <ha-icon icon="mdi:text-to-speech"></ha-icon>
          </button>
          <button class="caller-btn reset" id="btn-reset" title="Spiel zurücksetzen">
            <ha-icon icon="mdi:restart"></ha-icon>
          </button>
        </div>

        <div class="called-numbers" id="called-numbers">
          ${calledHtml}
        </div>
        <div class="called-count">
          ${this._calledNumbers.length} von ${maxNum} Zahlen gezogen
        </div>
      </div>
    `;
  }

  // ─── Partial Updates ───────────────────────────────────────────────────────

  _updateAudioSection() {
    const card = this.shadowRoot.querySelector('.card');
    if (!card) return;

    const entity = this._config.sonos_entity;
    const lineinSource = this._config.linein_source;
    const state = this._hass?.states[entity];
    const currentSource = state?.attributes?.source;
    const isMicActive = currentSource === lineinSource;

    // Update mic button
    const btnMic = this.shadowRoot.getElementById('btn-mic');
    const btnMusic = this.shadowRoot.getElementById('btn-music');
    if (btnMic) {
      btnMic.className = `source-btn ${isMicActive ? 'active-mic' : ''}`;
    }
    if (btnMusic) {
      btnMusic.className = `source-btn ${(!isMicActive && state) ? 'active-music' : ''}`;
    }

    // Update status
    const statusEl = this.shadowRoot.querySelector('.mic-status');
    if (statusEl) {
      statusEl.textContent = isMicActive ? '🔴 ON AIR – Mikrofon aktiv' : '🎵 Musik-Modus';
      statusEl.className = `mic-status ${isMicActive ? 'on-air' : 'off-air'}`;
    }

    // Update volume
    const volumeSlider = this.shadowRoot.getElementById('volume-slider');
    const volumeValue = this.shadowRoot.getElementById('volume-value');
    if (volumeSlider && !volumeSlider.matches(':active')) {
      const volume = state?.attributes?.volume_level ?? 0.5;
      const volumePct = Math.round(volume * 100);
      volumeSlider.value = volumePct;
      if (volumeValue) volumeValue.textContent = `${volumePct}%`;
    }
  }

  // ─── Event Listeners ───────────────────────────────────────────────────────

  _attachListeners(card) {
    // Mic toggle
    card.querySelector('#btn-mic')?.addEventListener('click', () => this._activateMic());
    card.querySelector('#btn-music')?.addEventListener('click', () => this._activateMusic());

    // Volume slider
    const volSlider = card.querySelector('#volume-slider');
    if (volSlider) {
      volSlider.addEventListener('input', (e) => {
        const valEl = this.shadowRoot.getElementById('volume-value');
        if (valEl) valEl.textContent = `${e.target.value}%`;
      });
      volSlider.addEventListener('change', (e) => {
        this._setVolume(parseInt(e.target.value) / 100);
      });
    }

    // Sound buttons
    card.querySelectorAll('.sound-btn[data-idx]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.dataset.idx);
        this._playSound(idx, btn);
      });
    });

    // Number caller
    card.querySelector('#btn-draw')?.addEventListener('click', () => this._drawNumber());
    card.querySelector('#btn-reset')?.addEventListener('click', () => this._resetGame());
    card.querySelector('#btn-tts')?.addEventListener('click', () => this._toggleTts());
  }

  // ─── Actions ───────────────────────────────────────────────────────────────

  _activateMic() {
    const entity = this._config.sonos_entity;
    const source = this._config.linein_source;
    this._callService('media_player', 'select_source', {
      entity_id: entity,
      source: source,
    });
  }

  _activateMusic() {
    const entity = this._config.sonos_entity;
    const musicSource = this._config.music_source;
    if (musicSource) {
      this._callService('media_player', 'select_source', {
        entity_id: entity,
        source: musicSource,
      });
    } else {
      this._callService('media_player', 'media_play', { entity_id: entity });
    }
  }

  _setVolume(level) {
    this._callService('media_player', 'volume_set', {
      entity_id: this._config.sonos_entity,
      volume_level: level,
    });
  }

  _playSound(idx, btnEl) {
    const sound = this._config.sounds?.[idx];
    if (!sound?.url) return;

    // Visual feedback
    btnEl.classList.add('playing');
    setTimeout(() => btnEl.classList.remove('playing'), 500);

    this._callService('media_player', 'play_media', {
      entity_id: this._config.sonos_entity,
      media_content_id: sound.url,
      media_content_type: 'music',
    });
  }

  _drawNumber() {
    const maxNum = this._config.max_number || 75;
    const remaining = [];
    for (let i = 1; i <= maxNum; i++) {
      if (!this._calledNumbers.includes(i)) remaining.push(i);
    }
    if (remaining.length === 0) return;

    const num = remaining[Math.floor(Math.random() * remaining.length)];
    this._calledNumbers.push(num);
    this._currentNumber = num;

    // Re-render caller section only
    const section = this.shadowRoot.querySelectorAll('.section');
    const callerSection = section[section.length - 1];
    if (callerSection) {
      const newSection = document.createElement('div');
      newSection.className = 'section';
      newSection.innerHTML = this._buildNumberCallerSection().replace(/^<div class="section">/, '').replace(/<\/div>$/, '');
      callerSection.innerHTML = newSection.innerHTML;
      this._reattachCallerListeners(callerSection);
    }

    // TTS announcement
    if (this._ttsEnabled && this._hass) {
      const letter = getBingoLetter(num, maxNum);
      const text = maxNum <= 75
        ? `${letter}, ${num}`
        : `Nummer ${num}`;
      this._callService('tts', 'cloud_say', {
        entity_id: this._config.sonos_entity,
        message: text,
        language: 'de-DE',
      }).catch(() => {
        this._callService('tts', 'google_translate_say', {
          entity_id: this._config.sonos_entity,
          message: text,
          language: 'de',
        });
      });
    }
  }

  _resetGame() {
    if (!confirm(`Spiel zurücksetzen? Alle ${this._calledNumbers.length} gezogenen Zahlen werden gelöscht.`)) return;
    this._calledNumbers = [];
    this._currentNumber = null;
    this._render();
  }

  _toggleTts() {
    this._ttsEnabled = !this._ttsEnabled;
    const btn = this.shadowRoot.getElementById('btn-tts');
    if (btn) {
      btn.classList.toggle('active', this._ttsEnabled);
      btn.title = this._ttsEnabled ? 'TTS aktiv – klicken zum Deaktivieren' : 'TTS aktivieren';
    }
  }

  _reattachCallerListeners(container) {
    container.querySelector('#btn-draw')?.addEventListener('click', () => this._drawNumber());
    container.querySelector('#btn-reset')?.addEventListener('click', () => this._resetGame());
    container.querySelector('#btn-tts')?.addEventListener('click', () => this._toggleTts());
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  _callService(domain, service, data) {
    if (!this._hass) {
      console.error('BingoabendCard: hass nicht verfügbar');
      return Promise.reject('no hass');
    }
    return this._hass.callService(domain, service, data);
  }

  _escHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}

customElements.define('bingoabend-card', BingoabendCard);

// ─── Card Registration ────────────────────────────────────────────────────────

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'bingoabend-card',
  name: 'Bingoabend Card',
  description: 'Steuerung für den Bingoabend: Sonos Line-In/Mikrofon, Soundboard und Nummern-Caller',
  preview: true,
  documentationURL: 'https://github.com/your-user/bingoabend',
});

console.info(
  `%c BINGOABEND-CARD %c v${CARD_VERSION} `,
  'color: white; background: #6c3cff; font-weight: bold; border-radius: 4px 0 0 4px;',
  'color: #6c3cff; background: #1a1035; font-weight: bold; border-radius: 0 4px 4px 0;'
);
