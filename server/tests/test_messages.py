"""
Tests for messaging endpoints.

Covers: /api/messages endpoints (send, delete, conversations)
"""
import pytest


class TestHealthCheck:
    """Test health check endpoint."""

    def test_messages_health(self, client):
        """Test messages service health check."""
        response = client.get("/api/messages/health")
        assert response.status_code == 200
        assert response.get_json()["status"] == "messages service running"


class TestSendMessage:
    """Test send message endpoint."""

    def test_send_direct_message(self, auth_client, second_user):
        """Test sending a direct message to another user."""
        client, _ = auth_client

        response = client.post("/api/messages", json={
            "receiver_id": second_user,
            "content": "Hello, this is a test message!"
        })

        assert response.status_code == 201
        data = response.get_json()
        assert data["receiver_id"] == second_user
        assert data["content"] == "Hello, this is a test message!"
        assert data["community_id"] is None

    def test_send_community_message(self, auth_client, sample_community):
        """Test sending a message to a community."""
        client, _ = auth_client

        response = client.post("/api/messages", json={
            "community_id": sample_community["id"],
            "content": "Hello community!"
        })

        assert response.status_code == 201
        data = response.get_json()
        assert data["community_id"] == sample_community["id"]
        assert data["receiver_id"] is None

    def test_send_message_missing_content(self, auth_client, second_user):
        """Test sending a message without content."""
        client, _ = auth_client

        response = client.post("/api/messages", json={
            "receiver_id": second_user
        })

        assert response.status_code == 400
        assert "content is required" in response.get_json()["error"]

    def test_send_message_empty_content(self, auth_client, second_user):
        """Test sending a message with empty content."""
        client, _ = auth_client

        response = client.post("/api/messages", json={
            "receiver_id": second_user,
            "content": "   "
        })

        assert response.status_code == 400

    def test_send_message_no_recipient(self, auth_client):
        """Test sending a message without receiver or community."""
        client, _ = auth_client

        response = client.post("/api/messages", json={
            "content": "Message to no one"
        })

        assert response.status_code == 400
        assert "receiver_id or community_id is required" in response.get_json()["error"]

    def test_send_message_both_recipients(self, auth_client, second_user, sample_community):
        """Test sending a message with both receiver and community."""
        client, _ = auth_client

        response = client.post("/api/messages", json={
            "receiver_id": second_user,
            "community_id": sample_community["id"],
            "content": "Confused message"
        })

        assert response.status_code == 400
        assert "either receiver_id or community_id" in response.get_json()["error"]

    def test_send_message_to_nonexistent_user(self, auth_client):
        """Test sending a message to a non-existent user."""
        client, _ = auth_client

        response = client.post("/api/messages", json={
            "receiver_id": 99999,
            "content": "Hello nobody"
        })

        assert response.status_code == 404

    def test_send_message_to_nonexistent_community(self, auth_client):
        """Test sending a message to a non-existent community."""
        client, _ = auth_client

        response = client.post("/api/messages", json={
            "community_id": 99999,
            "content": "Hello nowhere"
        })

        assert response.status_code == 404

    def test_send_message_unauthenticated(self, client, app):
        """Test that unauthenticated users cannot send messages."""
        response = client.post("/api/messages", json={
            "receiver_id": 1,
            "content": "Unauthorized message"
        })

        assert response.status_code == 401


class TestDeleteMessage:
    """Test delete message endpoint."""

    def test_delete_own_message(self, auth_client, second_user):
        """Test deleting your own message."""
        client, _ = auth_client

        # Send a message
        response = client.post("/api/messages", json={
            "receiver_id": second_user,
            "content": "To be deleted"
        })
        message_id = response.get_json()["id"]

        # Delete it
        response = client.delete(f"/api/messages/{message_id}")
        assert response.status_code == 200
        assert response.get_json()["message"] == "message deleted"

    def test_delete_others_message_forbidden(self, auth_client, second_user, app):
        """Test that you cannot delete others' messages."""
        client, user_id = auth_client

        # Create a message from the second user
        with app.app_context():
            from models import Message
            from extensions import db

            message = Message(
                sender_id=second_user,
                receiver_id=user_id,
                content="From second user"
            )
            db.session.add(message)
            db.session.commit()
            message_id = message.id

        # Try to delete it as first user
        response = client.delete(f"/api/messages/{message_id}")
        assert response.status_code == 403

    def test_delete_nonexistent_message(self, auth_client):
        """Test deleting a message that doesn't exist."""
        client, _ = auth_client

        response = client.delete("/api/messages/99999")
        assert response.status_code == 404


class TestConversationWithUser:
    """Test conversation with user endpoint."""

    def test_get_conversation(self, auth_client, second_user):
        """Test getting conversation with another user."""
        client, user_id = auth_client

        # Send some messages
        client.post("/api/messages", json={
            "receiver_id": second_user,
            "content": "Message 1"
        })
        client.post("/api/messages", json={
            "receiver_id": second_user,
            "content": "Message 2"
        })

        # Get conversation
        response = client.get(f"/api/messages/user/{second_user}")
        assert response.status_code == 200

        data = response.get_json()
        assert "messages" in data
        assert len(data["messages"]) == 2
        assert data["total"] == 2

    def test_get_conversation_empty(self, auth_client, second_user):
        """Test getting empty conversation."""
        client, _ = auth_client

        response = client.get(f"/api/messages/user/{second_user}")
        assert response.status_code == 200

        data = response.get_json()
        assert data["messages"] == []
        assert data["total"] == 0

    def test_conversation_includes_both_directions(self, auth_client, second_user, app):
        """Test that conversation includes messages from both users."""
        client, user_id = auth_client

        # Send a message from first user
        client.post("/api/messages", json={
            "receiver_id": second_user,
            "content": "From first user"
        })

        # Create a reply from second user
        with app.app_context():
            from models import Message
            from extensions import db

            reply = Message(
                sender_id=second_user,
                receiver_id=user_id,
                content="From second user"
            )
            db.session.add(reply)
            db.session.commit()

        # Get conversation
        response = client.get(f"/api/messages/user/{second_user}")
        data = response.get_json()

        assert len(data["messages"]) == 2
        contents = [m["content"] for m in data["messages"]]
        assert "From first user" in contents
        assert "From second user" in contents

    def test_conversation_pagination(self, auth_client, second_user):
        """Test conversation pagination."""
        client, _ = auth_client

        # Send multiple messages
        for i in range(5):
            client.post("/api/messages", json={
                "receiver_id": second_user,
                "content": f"Message {i}"
            })

        # Get paginated conversation
        response = client.get(f"/api/messages/user/{second_user}?page=1&per_page=3")
        assert response.status_code == 200

        data = response.get_json()
        assert len(data["messages"]) == 3
        assert data["per_page"] == 3

    def test_conversation_with_nonexistent_user(self, auth_client):
        """Test getting conversation with non-existent user."""
        client, _ = auth_client

        response = client.get("/api/messages/user/99999")
        assert response.status_code == 404


class TestCommunityMessages:
    """Test community messages endpoint."""

    def test_get_community_messages(self, auth_client, sample_community):
        """Test getting messages from a community."""
        client, _ = auth_client

        # Send some messages
        client.post("/api/messages", json={
            "community_id": sample_community["id"],
            "content": "Community message 1"
        })
        client.post("/api/messages", json={
            "community_id": sample_community["id"],
            "content": "Community message 2"
        })

        # Get messages
        response = client.get(f"/api/messages/community/{sample_community['id']}")
        assert response.status_code == 200

        data = response.get_json()
        assert len(data["messages"]) == 2

    def test_get_community_messages_empty(self, auth_client, sample_community):
        """Test getting messages from empty community."""
        client, _ = auth_client

        response = client.get(f"/api/messages/community/{sample_community['id']}")
        assert response.status_code == 200

        data = response.get_json()
        assert data["messages"] == []
        assert data["total"] == 0

    def test_community_messages_pagination(self, auth_client, sample_community):
        """Test community messages pagination."""
        client, _ = auth_client

        # Send multiple messages
        for i in range(5):
            client.post("/api/messages", json={
                "community_id": sample_community["id"],
                "content": f"Message {i}"
            })

        # Get paginated messages
        response = client.get(
            f"/api/messages/community/{sample_community['id']}?page=1&per_page=3"
        )
        assert response.status_code == 200

        data = response.get_json()
        assert len(data["messages"]) == 3

    def test_community_messages_nonexistent_community(self, auth_client):
        """Test getting messages from non-existent community."""
        client, _ = auth_client

        response = client.get("/api/messages/community/99999")
        assert response.status_code == 404

    def test_community_messages_ordered_by_time(self, auth_client, sample_community):
        """Test that community messages are ordered chronologically."""
        client, _ = auth_client

        # Send messages
        client.post("/api/messages", json={
            "community_id": sample_community["id"],
            "content": "First message"
        })
        client.post("/api/messages", json={
            "community_id": sample_community["id"],
            "content": "Second message"
        })

        response = client.get(f"/api/messages/community/{sample_community['id']}")
        messages = response.get_json()["messages"]

        # Should be in ascending order (oldest first)
        assert messages[0]["content"] == "First message"
        assert messages[1]["content"] == "Second message"
