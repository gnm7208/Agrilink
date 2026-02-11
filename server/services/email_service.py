"""
Email sending service for verification and password reset.

Uses SMTP when configured; otherwise logs the link (development/testing).
"""
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from flask import current_app

logger = logging.getLogger(__name__)


def send_verification_email(user_email: str, verification_link: str) -> None:
    """
    Send the email verification link to the user.

    If MAIL_SERVER is configured, sends via SMTP. Otherwise logs the link
    (e.g. development/testing) and does not raise.
    """
    mail_server = current_app.config.get("MAIL_SERVER") if current_app else None
    email_from = current_app.config.get("EMAIL_FROM", "noreply@agrilink.example.com") if current_app else "noreply@agrilink.example.com"

    subject = "Verify your AgriLink email address"
    body_text = f"""Please verify your email address by clicking the link below:

{verification_link}

This link expires in 24 hours. If you did not create an account, you can ignore this email.
"""
    body_html = f"""<p>Please verify your email address by clicking the link below:</p>
<p><a href="{verification_link}">{verification_link}</a></p>
<p>This link expires in 24 hours. If you did not create an account, you can ignore this email.</p>"""

    if mail_server:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = email_from
            msg["To"] = user_email
            msg.attach(MIMEText(body_text, "plain"))
            msg.attach(MIMEText(body_html, "html"))

            port = current_app.config.get("MAIL_PORT", 587)
            use_tls = current_app.config.get("MAIL_USE_TLS", True)
            username = current_app.config.get("MAIL_USERNAME")
            password = current_app.config.get("MAIL_PASSWORD")

            with smtplib.SMTP(mail_server, port) as server:
                if use_tls:
                    server.starttls()
                if username and password:
                    server.login(username, password)
                server.sendmail(email_from, [user_email], msg.as_string())
            logger.info("Verification email sent to %s", user_email)
        except Exception as e:
            logger.exception("Failed to send verification email to %s: %s", user_email, e)
            raise
    else:
        logger.info("Email not configured; verification link for %s: %s", user_email, verification_link)
