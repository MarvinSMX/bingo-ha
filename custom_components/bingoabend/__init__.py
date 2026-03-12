"""Bingoabend Home Assistant Integration.

Steuert Sonos-Lautsprecher für den Bingoabend:
- Mikrofon/Line-In Umschalten
- Custom Lovelace Card mit Soundboard und Bingo-Nummern-Caller
"""
from __future__ import annotations

import logging
from pathlib import Path

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import DOMAIN, PLATFORMS, CARD_URL, CARD_VERSION

_LOGGER = logging.getLogger(__name__)


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Set up the Bingoabend component."""
    hass.data.setdefault(DOMAIN, {})
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Bingoabend from a config entry."""
    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = entry.data

    # Register the custom card as a static file
    card_path = Path(__file__).parent / "www" / "bingoabend-card.js"
    if card_path.exists():
        hass.http.register_static_path(CARD_URL, str(card_path), cache_headers=True)
        _LOGGER.info("Bingoabend card verfügbar unter: %s", CARD_URL)
        await _async_register_lovelace_resource(hass)
    else:
        _LOGGER.error("Bingoabend card nicht gefunden: %s", card_path)

    # Set up platforms (switch etc.)
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def _async_register_lovelace_resource(hass: HomeAssistant) -> None:
    """Register the card as a Lovelace resource (auto-add)."""
    card_url_versioned = f"{CARD_URL}?v={CARD_VERSION}"
    try:
        lovelace_data = hass.data.get("lovelace")
        if not lovelace_data:
            _LOGGER.warning(
                "Lovelace noch nicht initialisiert. Bitte '%s' manuell als "
                "Lovelace-Ressource (Typ: JavaScript-Modul) hinzufügen.",
                card_url_versioned,
            )
            return

        resources = lovelace_data.get("resources")
        if not resources:
            _LOGGER.warning(
                "Lovelace Ressourcen nicht verfügbar. Bitte '%s' manuell hinzufügen.",
                card_url_versioned,
            )
            return

        existing_urls = {r.get("url", "") for r in resources.async_items()}
        if not any(CARD_URL in url for url in existing_urls):
            await resources.async_create_item(
                {"res_type": "module", "url": card_url_versioned}
            )
            _LOGGER.info("Bingoabend card zu Lovelace-Ressourcen hinzugefügt.")
        else:
            _LOGGER.debug("Bingoabend card bereits in Lovelace-Ressourcen vorhanden.")

    except Exception as err:  # noqa: BLE001
        _LOGGER.warning(
            "Lovelace-Ressource konnte nicht automatisch registriert werden: %s. "
            "Bitte '%s' manuell als JavaScript-Modul hinzufügen.",
            err,
            card_url_versioned,
        )


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id, None)
    return unload_ok
