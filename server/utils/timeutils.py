"""Single source of truth for "now" in UTC.

datetime.utcnow() is deprecated since Python 3.12. This helper keeps the
same naive-UTC semantics the models/columns expect while using the
supported timezone-aware API under the hood. When the schema migrates to
timezone-aware columns (DateTime(timezone=True)), only this function needs
to change.
"""

from datetime import datetime, timezone


def utcnow() -> datetime:
    """Naive UTC now - drop-in replacement for deprecated datetime.utcnow()."""
    return datetime.now(timezone.utc).replace(tzinfo=None)
