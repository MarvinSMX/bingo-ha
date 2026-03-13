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

const CARD_VERSION = "1.5.0";

// ─── Styles ──────────────────────────────────────────────────────────────────

const STYLES = `
  :host {
    display: flex;
    flex-direction: column;
    container-type: inline-size;
    container-name: bingo;
    overflow: hidden;
  }

  ha-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    padding: 0;
    overflow: hidden;
  }

  /* ── Header ── */
  .card-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 16px 0;
    flex-shrink: 0;
  }
  .card-header ha-icon {
    color: var(--primary-color);
    --mdc-icon-size: 20px;
    flex-shrink: 0;
  }
  .card-header-title {
    font-size: var(--ha-card-header-font-size, clamp(16px, 4.5cqi, 22px));
    font-weight: var(--ha-card-header-font-weight, normal);
    color: var(--ha-card-header-color, var(--primary-text-color));
    flex: 1;
    line-height: 1.2;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* ── Content wrapper ── */
  .content {
    flex: 1;
    min-height: 0;
    padding: 10px 14px 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    overflow: hidden;
  }

  /* ── Source toggle: fills available height ── */
  .source-toggle {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .source-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: clamp(4px, 1.5cqi, 8px);
    padding: 8px 6px;
    border-radius: var(--ha-card-border-radius, 14px);
    border: 2px solid var(--divider-color);
    background: var(--secondary-background-color, var(--primary-background-color));
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s, color 0.2s;
    color: var(--secondary-text-color);
    font-family: inherit;
    min-width: 0;
  }
  .source-btn ha-icon {
    --mdc-icon-size: clamp(28px, 8cqi, 42px);
    transition: color 0.2s;
  }
  .source-btn .btn-label {
    font-size: clamp(10px, 2.8cqi, 13px);
    font-weight: 700;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    white-space: nowrap;
  }

  /* Active mic — red */
  .source-btn.active-mic {
    background: rgba(var(--rgb-error-color, 211,47,47), 0.13);
    border-color: var(--error-color, #d32f2f);
    color: var(--error-color, #d32f2f);
    border-width: 2px;
  }
  .source-btn.active-mic ha-icon {
    filter: drop-shadow(0 0 5px rgba(211,47,47,0.45));
  }

  /* Active music — primary */
  .source-btn.active-music {
    background: rgba(var(--rgb-primary-color, 3,169,244), 0.13);
    border-color: var(--primary-color);
    color: var(--primary-color);
    border-width: 2px;
  }

  /* ── Volume ── */
  .volume-section {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .volume-row {
    display: flex;
    align-items: center;
    gap: 8px;
    transition: opacity 0.2s;
  }
  .volume-row ha-icon {
    --mdc-icon-size: 16px;
    flex-shrink: 0;
    color: var(--primary-color);
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
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background: var(--primary-color);
    cursor: pointer;
    box-shadow: 0 1px 3px rgba(0,0,0,0.25);
  }
  .volume-value {
    min-width: 30px;
    text-align: right;
    font-size: 11px;
    font-weight: 600;
    color: var(--primary-text-color);
    flex-shrink: 0;
  }

  /* ── Error ── */
  ha-alert { display: block; font-size: 12px; flex-shrink: 0; }

  /* ── Narrow card ── */
  @container bingo (max-width: 240px) {
    .card-header-title { font-size: 15px; }
    .source-btn .btn-label { display: none; }
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
    };
  }

  setConfig(config) {
    if (!config.sonos_entity) throw new Error('sonos_entity ist erforderlich');
    this._config = {
      title: 'Bingoabend',
      linein_source: 'Line-In',
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

  connectedCallback() {
    requestAnimationFrame(() => this._applyGridHeight());
    this._ro = new ResizeObserver(() => this._applyGridHeight());
    if (this.parentElement) this._ro.observe(this.parentElement);
  }

  disconnectedCallback() {
    this._ro?.disconnect();
    this._ro = null;
  }

  _applyGridHeight() {
    const rows = this._detectRows();
    if (!rows) return;
    this.style.height = `${rows * 56 + (rows - 1) * 8}px`;
  }

  _detectRows() {
    for (const el of [this.parentElement, this]) {
      const m = (el?.style?.gridRow ?? '').match(/span\s+(\d+)/i);
      if (m) return +m[1];
    }
    return this.getGridOptions?.()?.rows ?? null;
  }

  // Legacy masonry layout: 1 unit ≈ 50 px
  getCardSize() { return 4; }

  // Sections layout (HA 2024.3+): 12-column grid, 1 row ≈ 56 px
  getGridOptions() {
    return {
      columns: 6,
      rows: 4,
      min_columns: 3,
      min_rows: 4,
    };
  }

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
    const entity = this._config.sonos_entity;
    const lineinSource = this._config.linein_source;
    const state = this._hass?.states[entity];
    const entityMissing = this._hass != null && !state;
    const currentSource = state?.attributes?.source;
    const isMicActive = currentSource === lineinSource;
    const micClass   = isMicActive ? 'active-mic' : '';
    const musicClass = (!isMicActive && state) ? 'active-music' : '';

    const volPct = Math.round((state?.attributes?.volume_level ?? 0.5) * 100);

    return `
      <div class="card-header">
        <ha-icon icon="mdi:bingo"></ha-icon>
        <div class="card-header-title">${this._esc(this._config.title || 'Bingoabend')}</div>
      </div>
      <div class="content">
        ${entityMissing ? `<ha-alert alert-type="error">Entität <b>${this._esc(entity)}</b> nicht gefunden</ha-alert>` : ''}
        <div class="source-toggle">
          <button class="source-btn ${micClass}" id="btn-mic">
            <ha-icon icon="mdi:microphone"></ha-icon>
            <span class="btn-label">Mikrofon</span>
          </button>
          <button class="source-btn ${musicClass}" id="btn-music">
            <ha-icon icon="mdi:music"></ha-icon>
            <span class="btn-label">Musik</span>
          </button>
        </div>
        <div class="volume-section">
          <div class="volume-row">
            <ha-icon icon="mdi:volume-high"></ha-icon>
            <input type="range" id="vol-slider" min="0" max="100" step="2" value="${volPct}">
            <div class="volume-value" id="vol-value">${volPct}%</div>
          </div>
        </div>
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

    // Sync slider from entity
    const volPct = Math.round((state?.attributes?.volume_level ?? 0.5) * 100);
    const s = this.shadowRoot.querySelector('#vol-slider');
    const v = this.shadowRoot.querySelector('#vol-value');
    if (s && !s.matches(':active')) { s.value = volPct; }
    if (v) v.textContent = `${volPct}%`;
  }

  // ─── Listeners ───────────────────────────────────────────────────────────

  _attachListeners(root) {
    root.querySelector('#btn-mic')?.addEventListener('click',   () => this._activateMic());
    root.querySelector('#btn-music')?.addEventListener('click', () => this._activateMusic());

    const slider = root.querySelector('#vol-slider');
    if (slider) {
      slider.addEventListener('input', (e) => {
        const v = this.shadowRoot.querySelector('#vol-value');
        if (v) v.textContent = `${e.target.value}%`;
      });
      slider.addEventListener('change', (e) => {
        this._callService('media_player', 'volume_set', {
          entity_id: this._getGroupMembers(),
          volume_level: parseInt(e.target.value) / 100,
        });
      });
    }
  }

  // ─── Actions ─────────────────────────────────────────────────────────────

  _activateMic() {
    const entity = this._config.sonos_entity;
    this._callService('media_player', 'select_source', {
      entity_id: entity,
      source: this._config.linein_source,
    }).then(() => setTimeout(() =>
      this._callService('media_player', 'media_play', { entity_id: entity }).catch(() => {}), 600
    )).catch(() => {});
  }

  _activateMusic() {
    const entity = this._config.sonos_entity;
    if (this._config.music_source) {
      this._callService('media_player', 'select_source', { entity_id: entity, source: this._config.music_source });
    } else {
      this._callService('media_player', 'media_play', { entity_id: entity });
    }
  }

  // ─── Util ────────────────────────────────────────────────────────────────

  // Returns all group members (including the configured entity itself).
  // Sonos exposes grouped speakers via the group_members attribute.
  _getGroupMembers() {
    const entity = this._config.sonos_entity;
    const members = this._hass?.states[entity]?.attributes?.group_members;
    return (Array.isArray(members) && members.length > 0) ? members : [entity];
  }

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
`;

const MAIN_SCHEMA = [
  { name: 'title',         label: 'Kartentitel',              selector: { text: {} } },
  { name: 'sonos_entity',  label: 'Sonos Media Player',       selector: { entity: { domain: 'media_player' } } },
  { name: 'linein_source', label: 'Line-In Quellenname',      selector: { text: {} } },
  { name: 'music_source',  label: 'Musik-Quelle (optional)',  selector: { text: {} } },
];

class BingoabendCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
  }

  setConfig(config) {
    this._config = { title: 'Bingoabend', linein_source: 'Line-In', ...config };
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

    while (this.shadowRoot.firstChild) this.shadowRoot.removeChild(this.shadowRoot.firstChild);
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(editor);
  }

  _dispatchChange() {
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config }, bubbles: true, composed: true }));
  }
}

customElements.define('bingoabend-card-editor', BingoabendCardEditor);

// ─── Number Caller Card ───────────────────────────────────────────────────────

const CALLER_STYLES = `
  :host {
    display: flex;
    flex-direction: column;
    container-type: inline-size;
    container-name: caller;
    overflow: hidden;
  }
  ha-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    padding: 0;
    overflow: hidden;
  }

  /* ── Header ── */
  .card-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px 0;
    flex-shrink: 0;
  }
  .card-header ha-icon {
    color: var(--primary-color);
    --mdc-icon-size: 20px;
    flex-shrink: 0;
  }
  .card-header-title {
    font-size: var(--ha-card-header-font-size, clamp(16px, 4cqi, 20px));
    font-weight: var(--ha-card-header-font-weight, normal);
    color: var(--ha-card-header-color, var(--primary-text-color));
    flex: 1;
    line-height: 1.2;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* ── Body ── */
  .body {
    flex: 1;
    min-height: 0;
    padding: 4px 16px 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow: hidden;
  }

  /* ── Number display ── */
  .number-display {
    text-align: center;
    flex-shrink: 0;
    padding: 2px 0;
    --col: var(--primary-color);
  }
  .number-display.cn-b { --col: #3b82f6; }
  .number-display.cn-i { --col: #ef4444; }
  .number-display.cn-n { --col: #f59e0b; }
  .number-display.cn-g { --col: #10b981; }
  .number-display.cn-o { --col: #8b5cf6; }
  .number-letter {
    font-size: clamp(11px, 3cqi, 14px);
    font-weight: 700;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: var(--col);
    opacity: 0.8;
  }
  .number-big {
    font-size: clamp(48px, 17cqi, 76px);
    font-weight: 800;
    line-height: 1;
    color: var(--col);
    letter-spacing: -3px;
  }
  .number-placeholder {
    font-size: clamp(36px, 12cqi, 56px);
    font-weight: 200;
    color: var(--disabled-color, var(--divider-color));
    line-height: 1.2;
  }

  /* ── Controls ── */
  .caller-controls {
    display: flex;
    gap: 6px;
    flex-shrink: 0;
  }
  .caller-btn {
    flex: 1;
    min-width: 40px;
    padding: clamp(8px, 2%, 12px) 6px;
    border-radius: var(--ha-card-border-radius, 12px);
    border: 1px solid var(--divider-color);
    background: var(--secondary-background-color, var(--primary-background-color));
    cursor: pointer;
    font-size: clamp(11px, 3cqi, 13px);
    font-weight: 500;
    font-family: inherit;
    color: var(--primary-text-color);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    transition: background 0.15s, border-color 0.15s;
    white-space: nowrap;
    position: relative;
  }
  .caller-btn ha-icon { --mdc-icon-size: 18px; flex-shrink: 0; }
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
  .count-badge {
    background: rgba(255,255,255,0.25);
    border-radius: 8px;
    padding: 1px 5px;
    font-size: 10px;
    font-weight: 700;
    line-height: 1.4;
  }
  .caller-btn.tts {
    color: var(--secondary-text-color);
  }
  .caller-btn.tts.active {
    background: rgba(var(--rgb-primary-color, 3,169,244), 0.12);
    border-color: var(--primary-color);
    color: var(--primary-color);
  }

  /* ── Called numbers ── */
  .called-section {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
    overflow: hidden;
  }
  .called-numbers {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    align-content: flex-start;
    overflow: hidden;
  }
  .called-number {
    width: clamp(24px, 6.5cqi, 32px);
    height: clamp(24px, 6.5cqi, 32px);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: clamp(8px, 2.2cqi, 11px);
    font-weight: 600;
    background: var(--secondary-background-color, var(--primary-background-color));
    border: 1.5px solid var(--divider-color);
    color: var(--secondary-text-color);
    flex-shrink: 0;
  }
  .called-number.latest {
    background: var(--primary-color);
    border-color: var(--primary-color);
    color: var(--text-primary-color, white);
    width: clamp(28px, 8cqi, 38px);
    height: clamp(28px, 8cqi, 38px);
    font-size: clamp(10px, 2.8cqi, 13px);
    font-weight: 700;
  }
  /* Column chip colors */
  .called-number.cn-b { border-color: #3b82f6; color: #3b82f6; }
  .called-number.cn-i { border-color: #ef4444; color: #ef4444; }
  .called-number.cn-n { border-color: #f59e0b; color: #f59e0b; }
  .called-number.cn-g { border-color: #10b981; color: #10b981; }
  .called-number.cn-o { border-color: #8b5cf6; color: #8b5cf6; }
  .called-number.latest.cn-b { background: #3b82f6; border-color: #3b82f6; color: white; }
  .called-number.latest.cn-i { background: #ef4444; border-color: #ef4444; color: white; }
  .called-number.latest.cn-n { background: #f59e0b; border-color: #f59e0b; color: white; }
  .called-number.latest.cn-g { background: #10b981; border-color: #10b981; color: white; }
  .called-number.latest.cn-o { background: #8b5cf6; border-color: #8b5cf6; color: white; }

  .called-footer {
    flex-shrink: 0;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
  .called-count {
    font-size: 11px;
    color: var(--secondary-text-color);
  }
  .no-numbers {
    font-size: 12px;
    color: var(--secondary-text-color);
    font-style: italic;
  }

  @container caller (max-width: 240px) {
    .caller-btn span { display: none; }
    .count-badge { display: none; }
  }
`;

class BingoabendNumberCallerCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._calledNumbers = [];
    this._currentNumber = null;
    this._ttsEnabled = false;
    this._rendered = false;
  }

  static getConfigElement() {
    return document.createElement('bingoabend-numbercaller-card-editor');
  }

  static getStubConfig() {
    return { title: 'Nummern-Caller', max_number: 75 };
  }

  setConfig(config) {
    this._config = { title: 'Nummern-Caller', max_number: 75, ...config };
    this._render();
  }

  set hass(hass) { this._hass = hass; }

  connectedCallback() {
    requestAnimationFrame(() => this._applyGridHeight());
    this._ro = new ResizeObserver(() => this._applyGridHeight());
    if (this.parentElement) this._ro.observe(this.parentElement);
  }

  disconnectedCallback() {
    this._ro?.disconnect();
    this._ro = null;
  }

  _applyGridHeight() {
    const rows = this._detectRows();
    if (!rows) return;
    this.style.height = `${rows * 56 + (rows - 1) * 8}px`;
  }

  _detectRows() {
    for (const el of [this.parentElement, this]) {
      const m = (el?.style?.gridRow ?? '').match(/span\s+(\d+)/i);
      if (m) return +m[1];
    }
    return this.getGridOptions?.()?.rows ?? null;
  }

  getCardSize() { return 7; }

  getGridOptions() {
    return { columns: 4, rows: 7, min_columns: 3, min_rows: 5 };
  }

  _render() {
    if (!this._config) return;
    const style = document.createElement('style');
    style.textContent = CALLER_STYLES;
    const root = document.createElement('ha-card');
    root.innerHTML = this._buildHTML();
    while (this.shadowRoot.firstChild) this.shadowRoot.removeChild(this.shadowRoot.firstChild);
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(root);
    this._rendered = true;
    this._attachListeners(root);
  }

  _buildHTML() {
    const maxNum = this._config.max_number || 75;
    const remaining = maxNum - this._calledNumbers.length;
    const allCalled = remaining === 0;
    const colCls = this._currentNumber ? getBingoCssClass(this._currentNumber, maxNum) : '';
    const hasSonos = !!this._config.sonos_entity;

    const numDisplay = this._currentNumber
      ? `<div class="number-letter">${getBingoLetter(this._currentNumber, maxNum)}</div>
         <div class="number-big">${this._currentNumber}</div>`
      : `<div class="number-placeholder">–</div>`;

    const calledHtml = this._calledNumbers.length > 0
      ? [...this._calledNumbers].reverse().map((n, i) => {
          const col = getBingoCssClass(n, maxNum);
          const cls = `called-number ${col}${i === 0 ? ' latest' : ''}`;
          return `<div class="${cls}" title="${getBingoLetter(n, maxNum)}${n}">${n}</div>`;
        }).join('')
      : `<span class="no-numbers">Noch keine Zahlen gezogen</span>`;

    const ttsActive = this._ttsEnabled && hasSonos;
    const ttsTitle = !hasSonos ? 'Kein Sonos konfiguriert' : `TTS ${this._ttsEnabled ? 'aktiv' : 'inaktiv'}`;

    return `
      <div class="card-header">
        <ha-icon icon="mdi:bingo"></ha-icon>
        <div class="card-header-title">${this._esc(this._config.title)}</div>
      </div>
      <div class="body">
        <div class="number-display ${colCls}">${numDisplay}</div>
        <div class="caller-controls">
          <button class="caller-btn draw" id="btn-draw" ${allCalled ? 'disabled' : ''}>
            <ha-icon icon="mdi:dice-multiple"></ha-icon>
            <span>${allCalled ? 'Alle gezogen' : 'Ziehen'}</span>
            ${!allCalled ? `<span class="count-badge">${remaining}</span>` : ''}
          </button>
          <button class="caller-btn tts ${ttsActive ? 'active' : ''}" id="btn-tts"
                  title="${ttsTitle}" ${!hasSonos ? 'disabled' : ''}>
            <ha-icon icon="mdi:${ttsActive ? 'text-to-speech' : 'text-to-speech-off'}"></ha-icon>
          </button>
          <button class="caller-btn" id="btn-reset" title="Zurücksetzen">
            <ha-icon icon="mdi:restart"></ha-icon>
          </button>
        </div>
        <div class="called-section">
          <div class="called-numbers">${calledHtml}</div>
          <div class="called-footer">
            <span class="called-count">${this._calledNumbers.length} / ${maxNum}</span>
          </div>
        </div>
      </div>
    `;
  }

  _attachListeners(root) {
    root.querySelector('#btn-draw')?.addEventListener('click',  () => this._drawNumber());
    root.querySelector('#btn-reset')?.addEventListener('click', () => this._resetGame());
    root.querySelector('#btn-tts')?.addEventListener('click',   () => this._toggleTts());
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
    this._render();

    if (this._ttsEnabled && this._hass && this._config.sonos_entity) {
      const letter = getBingoLetter(num, maxNum);
      const msg = maxNum <= 75 ? `${letter} – ${num}` : `Nummer ${num}`;
      this._sayTts(msg);
    }
  }

  _sayTts(message) {
    const entity = this._config.sonos_entity;
    if (!entity || !this._hass) return;
    this._hass.callService('tts', 'cloud_say', {
      entity_id: entity,
      message,
      language: 'de-DE',
    }).catch(err => console.warn('[Bingoabend] TTS cloud_say:', err));
  }

  _resetGame() {
    if (!confirm(`Spiel zurücksetzen? (${this._calledNumbers.length} Zahlen gelöscht)`)) return;
    this._calledNumbers = [];
    this._currentNumber = null;
    this._render();
  }

  _toggleTts() {
    if (!this._config.sonos_entity) return;
    this._ttsEnabled = !this._ttsEnabled;
    this._render(); // Full re-render to update icon and state
  }

  _esc(str) {
    return String(str ?? '')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
}

customElements.define('bingoabend-numbercaller-card', BingoabendNumberCallerCard);

// ─── Number Caller Editor ─────────────────────────────────────────────────────

const CALLER_SCHEMA = [
  { name: 'title',        label: 'Kartentitel',         selector: { text: {} } },
  {
    name: 'max_number', label: 'Bingo-Variante',
    selector: { select: { mode: 'list', options: [
      { value: 75, label: '75 Zahlen  (B I N G O)' },
      { value: 90, label: '90 Zahlen  (europäisch)' },
    ] } },
  },
  { name: 'sonos_entity', label: 'Sonos für TTS (optional)', selector: { entity: { domain: 'media_player' } } },
];

class BingoabendNumberCallerCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
  }

  setConfig(config) {
    this._config = { title: 'Nummern-Caller', max_number: 75, ...config };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    const form = this.shadowRoot.querySelector('ha-form');
    if (form) form.hass = hass;
  }

  _render() {
    const style = document.createElement('style');
    style.textContent = ':host{display:block;} .editor{padding:16px;}';
    const editor = document.createElement('div');
    editor.className = 'editor';
    const form = document.createElement('ha-form');
    form.hass = this._hass;
    form.data = this._config;
    form.schema = CALLER_SCHEMA;
    form.computeLabel = (s) => s.label;
    form.addEventListener('value-changed', (ev) => {
      this._config = { ...this._config, ...ev.detail.value };
      this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config }, bubbles: true, composed: true }));
    });
    editor.appendChild(form);
    while (this.shadowRoot.firstChild) this.shadowRoot.removeChild(this.shadowRoot.firstChild);
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(editor);
  }
}

customElements.define('bingoabend-numbercaller-card-editor', BingoabendNumberCallerCardEditor);

// ─── Soundboard Card ──────────────────────────────────────────────────────────

const SOUNDBOARD_STYLES = `
  :host {
    display: flex;
    flex-direction: column;
    container-type: inline-size;
    container-name: soundboard;
    overflow: hidden;
  }
  ha-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    padding: 0;
    overflow: hidden;
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px 16px 0;
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

  .body {
    flex: 1;
    min-height: 0;
    padding: 8px 16px 16px;
    overflow: hidden;
  }

  .sound-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(clamp(64px, 20cqi, 96px), 1fr));
    gap: 8px;
  }
  .sound-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: clamp(8px, 2.5%, 14px) 6px;
    border-radius: var(--ha-card-border-radius, 12px);
    border: 1px solid var(--divider-color);
    background: var(--secondary-background-color, var(--primary-background-color));
    cursor: pointer;
    color: var(--primary-text-color);
    font-family: inherit;
    font-size: clamp(10px, 2.5cqi, 12px);
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    transition: background 0.15s, border-color 0.15s, opacity 0.1s;
  }
  .sound-btn ha-icon { --mdc-icon-size: clamp(22px, 7cqi, 30px); color: var(--primary-color); }
  .sound-btn:hover { background: var(--primary-background-color); }
  .sound-btn:active { opacity: 0.7; }
  .sound-btn.playing {
    background: rgba(var(--rgb-primary-color, 3,169,244), 0.15);
    border-color: var(--primary-color);
  }
  .sound-btn-empty {
    border: 1px dashed var(--divider-color);
    opacity: 0.35;
    cursor: default;
    pointer-events: none;
  }
  .no-sounds {
    text-align: center;
    padding: 24px 0;
    font-size: 13px;
    color: var(--secondary-text-color);
  }
  .section-label {
    font-size: 11px;
    font-weight: 600;
    color: var(--secondary-text-color);
    text-transform: uppercase;
    letter-spacing: 0.7px;
    margin: 10px 0 4px;
  }
  .playlist-thumb {
    width: clamp(22px, 7cqi, 30px);
    height: clamp(22px, 7cqi, 30px);
    border-radius: 4px;
    object-fit: cover;
    flex-shrink: 0;
  }
  .body { overflow-y: auto; }

  @container soundboard (max-width: 240px) {
    .card-header-title { font-size: 16px; }
    .sound-btn span { display: none; }
  }
`;

class BingoabendSoundboardCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._rendered = false;
    this._playingIdx = null;
    // Restore state after soundboard clip:
    //   0 = idle, 1 = armed (waiting for clip to start), 2 = ready (clip playing, waiting for end)
    this._watchPhase = 0;
    this._snapState = null;   // { source, media_content_id, media_content_type, wasPlaying }
    this._watchTimer = null;
    this._spotifyPlaylists = [];
    this._spotifyLoaded = false;
  }

  static getConfigElement() {
    return document.createElement('bingoabend-soundboard-card-editor');
  }

  static getStubConfig() {
    return {
      title: 'Soundboard',
      sonos_entity: 'media_player.sonos_wohnzimmer',
      sounds: [
        { name: 'Fanfare', url: '/local/sounds/fanfare.mp3', icon: 'mdi:trumpet' },
      ],
    };
  }

  setConfig(config) {
    if (!config.sonos_entity) throw new Error('sonos_entity ist erforderlich');
    this._config = { title: 'Soundboard', ...config };
    this._render();
  }

  set hass(hass) {
    const prevHass = this._hass;
    this._hass = hass;

    if (!this._spotifyLoaded) {
      this._spotifyLoaded = true;
      this._loadSpotifyPlaylists();
    }

    if (this._watchPhase > 0) {
      const entity = this._config?.sonos_entity;
      if (!entity) return;
      const prev = prevHass?.states[entity]?.state;
      const curr = hass.states[entity]?.state;

      // Phase 1: wait for the clip to start playing
      if (this._watchPhase === 1 && curr === 'playing') {
        this._watchPhase = 2;
      }
      // Phase 2: detect clip end (playing → idle/paused/off)
      if (this._watchPhase === 2 && prev === 'playing' && curr !== 'playing') {
        this._clearWatchTimer();
        this._watchPhase = 0;
        this._doRestore();
      }
    }
  }

  _clearWatchTimer() {
    if (this._watchTimer) { clearTimeout(this._watchTimer); this._watchTimer = null; }
  }

  _doRestore() {
    const snap = this._snapState;
    this._snapState = null;
    if (!snap || !snap.wasPlaying || !this._config?.sonos_entity) return;

    const entity = this._config.sonos_entity;
    const cur = this._hass?.states[entity];
    // If announce: true already restored correctly, nothing to do
    if (cur?.state === 'playing' && cur?.attributes?.source === snap.source) return;

    const lineinSource = this._config.linein_source ?? null;
    setTimeout(() => {
      if (snap.source && snap.source === lineinSource) {
        const doPlay = () =>
          this._callService('media_player', 'media_play', { entity_id: entity }).catch(() => {});
        this._callService('media_player', 'select_source', {
          entity_id: entity,
          source: snap.source,
        }).then(() => setTimeout(doPlay, 600)).catch(doPlay);
      } else {
        // Streaming source (radio, Spotify, etc.): select source then resume playback
        const doPlay = () =>
          this._callService('media_player', 'media_play', { entity_id: entity }).catch(() => {});
        if (snap.source) {
          this._callService('media_player', 'select_source', {
            entity_id: entity,
            source: snap.source,
          }).then(() => setTimeout(doPlay, 600)).catch(doPlay);
        } else {
          doPlay();
        }
      }
    }, 400);
  }

  connectedCallback() {
    requestAnimationFrame(() => this._applyGridHeight());
    this._ro = new ResizeObserver(() => this._applyGridHeight());
    if (this.parentElement) this._ro.observe(this.parentElement);
  }

  disconnectedCallback() {
    this._ro?.disconnect();
    this._ro = null;
  }

  _applyGridHeight() {
    const rows = this._detectRows();
    if (!rows) return;
    this.style.height = `${rows * 56 + (rows - 1) * 8}px`;
  }

  _detectRows() {
    for (const el of [this.parentElement, this]) {
      const m = (el?.style?.gridRow ?? '').match(/span\s+(\d+)/i);
      if (m) return +m[1];
    }
    return this.getGridOptions?.()?.rows ?? null;
  }

  getCardSize() { return 4; }

  getGridOptions() {
    return { columns: 4, rows: 4, min_columns: 2, min_rows: 2 };
  }

  _render() {
    if (!this._config) return;
    const style = document.createElement('style');
    style.textContent = SOUNDBOARD_STYLES;
    const root = document.createElement('ha-card');
    root.innerHTML = this._buildHTML();
    while (this.shadowRoot.firstChild) this.shadowRoot.removeChild(this.shadowRoot.firstChild);
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(root);
    this._rendered = true;
    this._attachListeners(root);
  }

  _buildHTML() {
    return `
      <div class="card-header">
        <ha-icon icon="mdi:music-box-multiple"></ha-icon>
        <div class="card-header-title">${this._esc(this._config.title || 'Soundboard')}</div>
      </div>
      <div class="body">
        ${this._buildSoundboardSection()}
        ${this._buildSpotifySection()}
      </div>
    `;
  }

  _buildSoundboardSection() {
    const sounds = this._config.sounds || [];
    if (sounds.length === 0) {
      return `<div class="no-sounds">Keine Sounds konfiguriert</div>`;
    }
    const buttons = sounds.map((s, i) => `
      <button class="sound-btn${this._playingIdx === i ? ' playing' : ''}" data-idx="${i}"
              title="${this._esc(s.name || '')}">
        <ha-icon icon="${this._esc(s.icon || 'mdi:music-note')}"></ha-icon>
        <span>${this._esc(s.name || '?')}</span>
      </button>
    `).join('');
    return `<div class="sound-grid">${buttons}</div>`;
  }

  _buildSpotifySection() {
    if (!this._spotifyPlaylists.length) return '';
    const items = this._spotifyPlaylists.map((p, i) => `
      <button class="sound-btn" data-playlist-idx="${i}" title="${this._esc(p.title || '')}">
        ${p.thumbnail
          ? `<img class="playlist-thumb" src="${this._esc(p.thumbnail)}" alt="">`
          : `<ha-icon icon="mdi:spotify"></ha-icon>`}
        <span>${this._esc(p.title || '?')}</span>
      </button>
    `).join('');
    return `<div class="section-label">Spotify</div><div class="sound-grid">${items}</div>`;
  }

  async _loadSpotifyPlaylists() {
    const spotifyEntity = this._config.spotify_entity ||
      Object.keys(this._hass.states).find(e => e.startsWith('media_player.spotify'));
    if (!spotifyEntity) return;
    try {
      const result = await this._hass.callWS({
        type: 'media_player/browse_media',
        entity_id: spotifyEntity,
        media_content_type: 'current_user_playlists',
        media_content_id: '',
      });
      this._spotifyPlaylists = result.children || [];
    } catch (_) {
      try {
        const root = await this._hass.callWS({
          type: 'media_player/browse_media',
          entity_id: spotifyEntity,
          media_content_type: 'library',
          media_content_id: '',
        });
        const item = root.children?.find(c => c.media_content_type === 'current_user_playlists');
        if (item) {
          const pl = await this._hass.callWS({
            type: 'media_player/browse_media',
            entity_id: spotifyEntity,
            media_content_type: item.media_content_type,
            media_content_id: item.media_content_id,
          });
          this._spotifyPlaylists = pl.children || [];
        }
      } catch (e) {
        console.warn('[Soundboard] Spotify playlists konnte nicht geladen werden:', e);
      }
    }
    this._render();
  }

  _attachListeners(root) {
    root.querySelectorAll('.sound-btn[data-idx]').forEach(btn => {
      btn.addEventListener('click', () => this._playSound(parseInt(btn.dataset.idx, 10)));
    });
    root.querySelectorAll('.sound-btn[data-playlist-idx]').forEach(btn => {
      btn.addEventListener('click', () => this._playPlaylist(parseInt(btn.dataset.playlistIdx, 10)));
    });
  }

  _playPlaylist(idx) {
    const playlist = this._spotifyPlaylists[idx];
    if (!playlist) return;
    const entity = this._config.sonos_entity;
    this._callService('media_player', 'play_media', {
      entity_id: entity,
      media_content_id: playlist.media_content_id,
      media_content_type: playlist.media_content_type,
    });
  }

  _playSound(idx) {
    const sound = this._config.sounds?.[idx];
    if (!sound?.url) return;

    const entity = this._config.sonos_entity;
    const st = this._hass?.states[entity];
    const attrs = st?.attributes ?? {};

    // Full snapshot so we can restore regardless of whether announce: true works
    this._snapState = {
      source:             attrs.source             ?? null,
      media_content_id:   attrs.media_content_id   ?? null,
      media_content_type: attrs.media_content_type ?? null,
      wasPlaying:         st?.state === 'playing',
    };
    this._watchPhase = 1;
    this._clearWatchTimer();
    // Fallback: restore after 60 s if state transitions never fired
    this._watchTimer = setTimeout(() => {
      this._watchPhase = 0;
      this._doRestore();
    }, 60000);

    let url = sound.url;
    if (url.startsWith('/')) {
      const base = (this._config.base_url || window.location.origin).replace(/\/$/, '');
      url = base + url;
    }

    this._callService('media_player', 'play_media', {
      entity_id: entity,
      media_content_id: url,
      media_content_type: 'music',
    });

    // Brief visual feedback
    this._playingIdx = idx;
    this._render();
    setTimeout(() => { this._playingIdx = null; this._render(); }, 800);
  }

  _callService(domain, service, data) {
    if (!this._hass) return Promise.reject('hass not ready');
    return this._hass.callService(domain, service, data);
  }

  _esc(str) {
    return String(str ?? '')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
}

customElements.define('bingoabend-soundboard-card', BingoabendSoundboardCard);

// ─── Soundboard Editor ────────────────────────────────────────────────────────

const SOUNDBOARD_EDITOR_STYLES = `
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
`;

const SOUNDBOARD_SCHEMA = [
  { name: 'title',        label: 'Kartentitel',         selector: { text: {} } },
  { name: 'sonos_entity', label: 'Sonos Media Player',  selector: { entity: { domain: 'media_player' } } },
  { name: 'base_url',     label: 'Base URL (optional)', selector: { text: {} } },
];

class BingoabendSoundboardCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
  }

  setConfig(config) {
    this._config = { title: 'Soundboard', sounds: [], ...config };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    const form = this.shadowRoot.querySelector('ha-form');
    if (form) form.hass = hass;
  }

  _render() {
    const style = document.createElement('style');
    style.textContent = SOUNDBOARD_EDITOR_STYLES;

    const editor = document.createElement('div');
    editor.className = 'editor';

    const form = document.createElement('ha-form');
    form.hass = this._hass;
    form.data = this._config;
    form.schema = SOUNDBOARD_SCHEMA;
    form.computeLabel = (s) => s.label;
    form.addEventListener('value-changed', (ev) => {
      this._config = { ...this._config, ...ev.detail.value };
      this._dispatchChange();
    });
    editor.appendChild(form);

    editor.appendChild(this._buildSoundsSection());

    while (this.shadowRoot.firstChild) this.shadowRoot.removeChild(this.shadowRoot.firstChild);
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(editor);
  }

  _buildSoundsSection() {
    const section = document.createElement('div');
    section.className = 'sounds-section';

    const header = document.createElement('div');
    header.className = 'sounds-header';
    header.innerHTML = `<span>Sounds</span>`;

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

    row.appendChild(mkField('Sound URL  (z.B. /local/sounds/fanfare.mp3)', sound.url, 'url', true));

    return row;
  }

  _dispatchChange() {
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config }, bubbles: true, composed: true }));
  }
}

customElements.define('bingoabend-soundboard-card-editor', BingoabendSoundboardCardEditor);

// ─── Registration ─────────────────────────────────────────────────────────────

window.customCards = window.customCards || [];
window.customCards.push(
  {
    type: 'bingoabend-card',
    name: 'Bingoabend Card',
    description: 'Sonos Line-In/Mikrofon & Lautstärke',
    preview: true,
  },
  {
    type: 'bingoabend-numbercaller-card',
    name: 'Bingoabend Nummern-Caller',
    description: 'Zieht zufällige Bingo-Zahlen mit optionaler TTS-Ansage',
    preview: true,
  },
  {
    type: 'bingoabend-soundboard-card',
    name: 'Bingoabend Soundboard',
    description: 'Spielt Soundeffekte über Sonos ab (announce)',
    preview: true,
  }
);

console.info(
  `%c BINGOABEND-CARD %c v${CARD_VERSION} `,
  'color:white;background:#1976d2;font-weight:bold;border-radius:3px 0 0 3px',
  'color:#1976d2;background:#e3f2fd;font-weight:bold;border-radius:0 3px 3px 0'
);
