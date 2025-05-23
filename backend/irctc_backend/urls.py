from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.http import HttpResponse

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

#eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzQ3ODY1NzM4LCJpYXQiOjE3NDc4NjU0MzgsImp0aSI6IjBlNTgwMzQ4Zjk2YjQ4NTZiOTFjMzAxYmFhMjQwMzEwIiwidXNlcl9pZCI6MX0.N-XELqh7_7NRphEttlnIw6imUAJ8r5Uh9sQAnQ9cb1A

from django.http import HttpResponse

def home(request):
    return HttpResponse("Welcome to the IRCTC Backend API")

urlpatterns = [
    
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('', home),  # <-- add this to handle root URL
    
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  # to get token
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # to refresh token
]
