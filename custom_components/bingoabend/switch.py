"""Switch platform for Bingoabend - Mikrofon/Line-In Toggle."""
from __future__ import annotations

import logging

from homeassistant.components.switch import SwitchEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.event import async_track_state_change_event

from .const import (
    DOMAIN,
    CONF_SONOS_ENTITY,
    CONF_LINEIN_SOURCE,
    CONF_MUSIC_SOURCE,
    ATTR_CURRENT_SOURCE,
)

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the Bingoabend switch."""
    sonos_entity = entry.data[CONF_SONOS_ENTITY]
    linein_source = entry.data[CONF_LINEIN_SOURCE]
    music_source = entry.data.get(CONF_MUSIC_SOURCE, "")

    async_add_entities(
        [BingoabendMikrofonSwitch(hass, entry, sonos_entity, linein_source, music_source)],
        update_before_add=True,
    )


class BingoabendMikrofonSwitch(SwitchEntity):
    """Switch to toggle between Mikrofon (Line-In) and normal music playback."""

    _attr_has_entity_name = True
    _attr_translation_key = "mikrofon"
    _attr_icon = "mdi:microphone"

    def __init__(
        self,
        hass: HomeAssistant,
        entry: ConfigEntry,
        sonos_entity: str,
        linein_source: str,
        music_source: str,
    ) -> None:
        """Initialize the switch."""
        self.hass = hass
        self._entry = entry
        self._sonos_entity = sonos_entity
        self._linein_source = linein_source
        self._music_source = music_source
        self._attr_unique_id = f"{entry.entry_id}_mikrofon"
        self._attr_device_info = {
            "identifiers": {(DOMAIN, entry.entry_id)},
            "name": "Bingoabend",
            "manufacturer": "Bingoabend",
            "model": "Sonos Line-In Controller",
        }

    @property
    def is_on(self) -> bool | None:
        """Return true if Line-In (Mikrofon) is active."""
        state = self.hass.states.get(self._sonos_entity)
        if state is None:
            return None
        current_source = state.attributes.get(ATTR_CURRENT_SOURCE)
        return current_source == self._linein_source

    @property
    def extra_state_attributes(self) -> dict:
        """Return extra attributes."""
        state = self.hass.states.get(self._sonos_entity)
        attrs = {
            "sonos_entity": self._sonos_entity,
            "linein_source": self._linein_source,
            "current_source": None,
            "volume_level": None,
        }
        if state:
            attrs["current_source"] = state.attributes.get(ATTR_CURRENT_SOURCE)
            attrs["volume_level"] = state.attributes.get("volume_level")
        return attrs

    async def async_turn_on(self, **kwargs) -> None:
        """Switch Sonos to Line-In (Mikrofon)."""
        _LOGGER.info(
            "Switching %s to Line-In source: %s",
            self._sonos_entity,
            self._linein_source,
        )
        await self.hass.services.async_call(
            "media_player",
            "select_source",
            {
                "entity_id": self._sonos_entity,
                "source": self._linein_source,
            },
            blocking=True,
        )
        self.async_write_ha_state()

    async def async_turn_off(self, **kwargs) -> None:
        """Switch Sonos back to music."""
        if self._music_source:
            _LOGGER.info(
                "Switching %s to music source: %s",
                self._sonos_entity,
                self._music_source,
            )
            await self.hass.services.async_call(
                "media_player",
                "select_source",
                {
                    "entity_id": self._sonos_entity,
                    "source": self._music_source,
                },
                blocking=True,
            )
        else:
            # No configured music source - just resume/play queue
            _LOGGER.info("Resuming playback on %s", self._sonos_entity)
            await self.hass.services.async_call(
                "media_player",
                "media_play",
                {"entity_id": self._sonos_entity},
                blocking=True,
            )
        self.async_write_ha_state()

    async def async_added_to_hass(self) -> None:
        """Register state change listener."""
        self.async_on_remove(
            async_track_state_change_event(
                self.hass,
                [self._sonos_entity],
                self._handle_sonos_state_change,
            )
        )

    @callback
    def _handle_sonos_state_change(self, event) -> None:
        """Handle Sonos state changes to keep switch in sync."""
        self.async_write_ha_state()

    async def async_update(self) -> None:
        """Update switch state from Sonos."""
        # State is read directly from hass.states, no polling needed
