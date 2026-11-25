from app.config.settings import get_settings

settings = get_settings()


def get_current_profile_id() -> str:
    """Fixed profile ID for single-user personal finance (no authentication)."""
    return settings.APP_PROFILE_ID
