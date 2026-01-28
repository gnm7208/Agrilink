from __future__ import annotations

from functools import wraps

from flask import abort, g


def admin_required(view_func):
    """
    Require the authenticated user to have the 'admin' role.

    This decorator expects authentication middleware to set `g.current_user`
    to an instance of `models.User`.
    """

    @wraps(view_func)
    def wrapper(*args, **kwargs):
        current_user = getattr(g, "current_user", None)
        if current_user is None:
            abort(401)
        if not getattr(current_user, "is_admin", lambda: False)():
            abort(403)
        return view_func(*args, **kwargs)

    return wrapper

