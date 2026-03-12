# Bingoabend – Home Assistant Integration

Custom Home Assistant Integration + Lovelace Cards für den Bingoabend.

## Cards im Überblick

| Card | Typ | Beschreibung |
|------|-----|-------------|
| **Bingoabend Card** | `custom:bingoabend-card` | Mikrofon umschalten (Line-In) & Lautstärke |
| **Nummern-Caller** | `custom:bingoabend-numbercaller-card` | Zieht zufällige Bingo-Zahlen mit optionaler TTS-Ansage |
| **Soundboard** | `custom:bingoabend-soundboard-card` | Konfigurierbares Grid mit beliebigen Sounds |

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

## Lovelace Cards einrichten

### Ressource hinzufügen (nur falls nicht automatisch)

**Einstellungen** → **Dashboards** → **3-Punkte** → **Ressourcen** → **+ Hinzufügen**

| Feld | Wert |
|------|------|
| URL  | `/bingoabend/bingoabend-card.js` |
| Typ  | JavaScript-Modul |

---

### Bingoabend Card

Mikrofon (Line-In) umschalten und Lautstärke regeln.

```yaml
type: custom:bingoabend-card
title: Bingoabend Steuerung
sonos_entity: media_player.sonos_wohnzimmer
linein_source: "Line-in"       # Exakter Quellenname aus source_list
music_source: "Spotify"        # Optional: Quelle für Musik-Modus
```

---

### Nummern-Caller Card

Zieht zufällige Bingo-Zahlen, zeigt den letzten Treffer groß an und listet alle gezogenen Zahlen.
Optionale TTS-Ansage über Sonos.

```yaml
type: custom:bingoabend-numbercaller-card
title: Nummern-Caller
max_number: 75                 # 75 (B I N G O) oder 90 (europäisch)
sonos_entity: media_player.sonos_wohnzimmer   # Optional: für TTS
```

---

### Soundboard Card

Konfigurierbares Grid mit Soundeffekten. Jeder Sound wird per `announce: true` über Sonos abgespielt –
der Player kehrt danach automatisch zur vorherigen Wiedergabe zurück.

```yaml
type: custom:bingoabend-soundboard-card
title: Soundboard
sonos_entity: media_player.sonos_wohnzimmer
# base_url: "http://192.168.1.x:8123"  # Optional, falls window.location.origin nicht stimmt
sounds:
  - name: "Fanfare"
    url: "/local/sounds/fanfare.mp3"
    icon: "mdi:trumpet"
  - name: "Trommelwirbel"
    url: "/local/sounds/drumroll.mp3"
    icon: "mdi:music-note"
  - name: "Applaus"
    url: "/local/sounds/applause.mp3"
    icon: "mdi:hand-clap"
  - name: "Jingle"
    url: "/local/sounds/jingle.mp3"
    icon: "mdi:bell-ring"
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
   `["Line-in", "TV", "Spotify", "Airplay"]`

> Achtung: Groß-/Kleinschreibung beachten – `"Line-in"` ≠ `"Line-In"`

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
    └── bingoabend-card.js  # Alle drei Lovelace Custom Cards
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
| `media_player.select_source` | Quelle wechseln (Line-In / Musik) |
| `media_player.play_media` | Sound abspielen (`announce: true`) |
| `media_player.volume_set` | Lautstärke setzen |
| `tts.cloud_say` | Zahlen ansagen (erfordert Nabu Casa / HA Cloud) |
