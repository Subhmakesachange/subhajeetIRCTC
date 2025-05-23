from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings

class AdminAPIKeyAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get("Authorization")

        if not auth_header or not auth_header.startswith("Api-Key "):
            raise AuthenticationFailed("No API key provided")

        key = auth_header.split(" ")[1]

        if key != settings.ADMIN_API_KEY:
            raise AuthenticationFailed("Invalid API key")

        # No associated user, but we can return (None, None) to allow access
        return (None, None)
