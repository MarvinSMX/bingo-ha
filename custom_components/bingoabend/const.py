"""Constants for the Bingoabend integration."""

DOMAIN = "bingoabend"
PLATFORMS = ["switch"]

# Config entry keys
CONF_SONOS_ENTITY = "sonos_entity"
CONF_LINEIN_SOURCE = "linein_source"
CONF_MUSIC_SOURCE = "music_source"

# Defaults
DEFAULT_LINEIN_SOURCE = "Line-In"
DEFAULT_MUSIC_SOURCE = ""

# Static card path
CARD_URL = "/bingoabend/bingoabend-card.js"
CARD_VERSION = "1.0.0"

# Attribute keys
ATTR_CURRENT_SOURCE = "source"
ATTR_VOLUME_LEVEL = "volume_level"
