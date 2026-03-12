"""Config flow for Bingoabend integration."""
from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResult
from homeassistant.helpers import selector

from .const import (
    DOMAIN,
    CONF_SONOS_ENTITY,
    CONF_LINEIN_SOURCE,
    CONF_MUSIC_SOURCE,
    DEFAULT_LINEIN_SOURCE,
)

_LOGGER = logging.getLogger(__name__)


async def _validate_input(hass: HomeAssistant, data: dict[str, Any]) -> dict[str, str]:
    """Validate the user input and return any errors."""
    errors: dict[str, str] = {}

    sonos_entity = data.get(CONF_SONOS_ENTITY, "")
    state = hass.states.get(sonos_entity)

    if state is None:
        errors[CONF_SONOS_ENTITY] = "entity_not_found"
        return errors

    # Check if the line-in source exists (optional - sources may not be loaded yet)
    source_list = state.attributes.get("source_list", [])
    linein_source = data.get(CONF_LINEIN_SOURCE, DEFAULT_LINEIN_SOURCE)

    if source_list and linein_source not in source_list:
        _LOGGER.warning(
            "Line-In source '%s' not found in source list: %s. "
            "Proceeding anyway - check Sonos source name.",
            linein_source,
            source_list,
        )
        # Don't block setup - source list may not be complete yet

    return errors


class BingoabendConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Bingoabend."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle the initial step."""
        if self._async_current_entries():
            return self.async_abort(reason="already_configured")

        errors: dict[str, str] = {}

        if user_input is not None:
            errors = await _validate_input(self.hass, user_input)

            if not errors:
                return self.async_create_entry(
                    title="Bingoabend",
                    data=user_input,
                )

        schema = vol.Schema(
            {
                vol.Required(CONF_SONOS_ENTITY): selector.EntitySelector(
                    selector.EntitySelectorConfig(domain="media_player")
                ),
                vol.Required(
                    CONF_LINEIN_SOURCE, default=DEFAULT_LINEIN_SOURCE
                ): selector.TextSelector(),
                vol.Optional(CONF_MUSIC_SOURCE, default=""): selector.TextSelector(),
            }
        )

        return self.async_show_form(
            step_id="user",
            data_schema=schema,
            errors=errors,
        )
