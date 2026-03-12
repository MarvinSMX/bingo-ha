# Bingoabend – Home Assistant Integration

Custom Home Assistant Integration + Lovelace Card für den Bingoabend.

## Features

- **Mikrofon umschalten** – Schaltet Sonos auf Line-In (Sennheiser Empfänger) oder zurück auf Musik
- **Lautstärke** – Slider direkt in der Karte
- **Soundboard** – Konfigurierbares Grid mit beliebigen Sounds
- **Nummern-Caller** – Zieht zufällige Bingo-Zahlen (1–75 oder 1–90), mit optionaler TTS-Ansage über Sonos

---

## Installation via HACS

1. HACS öffnen → **Integrationen** → 3-Punkte-Menü → **Benutzerdefinierte Repositories**
2. URL dieses Repos eingeben, Kategorie: **Integration**
3. Integration suchen: **Bingoabend** → Installieren → HA neu starten

---

## Einrichtung

1. **Einstellungen** → **Geräte & Dienste** → **Integration hinzufügen** → **Bingoabend**
2. Konfigurieren:
   - **Sonos Media Player**: entity_id, z.B. `media_player.sonos_wohnzimmer`
   - **Line-In Quellenname**: Exakter Name aus Sonos (z.B. `Line-In` oder `TV`)
     > Tipp: Öffne die Sonos-Entität in HA → Attribute → `source_list` zeigt alle verfügbaren Quellen
   - **Musik-Quelle** (optional): z.B. `Spotify`

---

## Lovelace Card einrichten

### 1. Card als Ressource hinzufügen (nur falls nicht automatisch)

**Einstellungen** → **Dashboards** → **3-Punkte** → **Ressourcen** → **+ Hinzufügen**

| Feld | Wert |
|------|------|
| URL  | `/bingoabend/bingoabend-card.js?v=1.0.0` |
| Typ  | JavaScript-Modul |

### 2. Card in Dashboard einfügen

Dashboard bearbeiten → **+ Karte hinzufügen** → **Benutzerdefiniert: Bingoabend Card**

Oder manuell im YAML-Modus:

```yaml
type: custom:bingoabend-card
title: Bingoabend Steuerung
sonos_entity: media_player.sonos_wohnzimmer
linein_source: "Line-In"          # Exakter Quellenname in Sonos
music_source: "Spotify"           # Optional: Quelle für Musik-Modus
max_number: 75                    # 75 für US-Bingo, 90 für deutsches Bingo
sounds:
  - name: "Fanfare"
    url: "/local/sounds/fanfare.mp3"
    icon: "mdi:trumpet"
    color: "#f59e0b"
  - name: "Trommelwirbel"
    url: "/local/sounds/drumroll.mp3"
    icon: "mdi:music-note"
    color: "#10b981"
  - name: "Applaus"
    url: "/local/sounds/applause.mp3"
    icon: "mdi:hand-clap"
    color: "#6c3cff"
  - name: "Jingle"
    url: "/local/sounds/jingle.mp3"
    icon: "mdi:bell-ring"
    color: "#ef4444"
```

---

## Sounds hochladen

Sound-Dateien (MP3, OGG, WAV) in den Ordner `/config/www/sounds/` hochladen.
Dann unter der URL `/local/sounds/dateiname.mp3` erreichbar.

Empfehlung für kostenlose Sounds: [freesound.org](https://freesound.org)

---

## Line-In Quellenname herausfinden

Falls unklar, wie die Line-In Quelle in HA heißt:

1. **Entwicklerwerkzeuge** → **Zustände**
2. Sonos-Entität suchen
3. In den Attributen `source_list` prüfen – z.B.:
   `["Line-In", "TV", "Spotify", "Airplay"]`

---

## Architektur

```
custom_components/bingoabend/
├── __init__.py          # Integration-Setup, Card-Registrierung
├── manifest.json        # HACS-Manifest
├── const.py             # Konstanten
├── config_flow.py       # UI-Konfigurationsflow
├── switch.py            # Mikrofon-Switch Entität
├── strings.json         # Texte (EN)
├── translations/
│   └── de.json          # Deutsche Übersetzungen
└── www/
    └── bingoabend-card.js  # Lovelace Custom Card
```

---

## Entitäten

| Entität | Beschreibung |
|---------|-------------|
| `switch.mikrofon_line_in` | Mikrofon (Line-In) ein/aus |

---

## Dienste

Die Integration nutzt Standard-HA-Dienste:

| Dienst | Zweck |
|--------|-------|
| `media_player.select_source` | Quelle wechseln |
| `media_player.play_media` | Sound abspielen |
| `media_player.volume_set` | Lautstärke setzen |
| `tts.cloud_say` / `tts.google_translate_say` | Zahlen ansagen (optional) |
