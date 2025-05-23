from django.urls import path
from .views import (
    SignupView,
    LoginView,
    TrainCreateView,
    TrainAvailabilityView,
    BookSeatView,
    BookingDetailView,
    AdminSignupView,
    AdminDashboardView,
    AdminStationListView,
    AdminTrainListView,
    grant_admin,
    revoke_admin,
    check_admin,
    TrainDetailView,
    SeatMatrixView,
    UserBookingsView,
)

urlpatterns = [
    path("signup", SignupView.as_view(), name="signup"),
    path("admin/signup", AdminSignupView.as_view(), name="admin-signup"),
    path("login", LoginView.as_view(), name="login"),
    
    # Admin URLs
    path("admin/dashboard", AdminDashboardView.as_view(), name="admin-dashboard"),
    path("admin/stations", AdminStationListView.as_view(), name="admin-stations"),
    path("admin/trains", AdminTrainListView.as_view(), name="admin-trains"),
    path("admin/trains/<str:train_id>", AdminTrainListView.as_view(), name="admin-train-detail"),
    
    # Train URLs
    path("trains/create", TrainCreateView.as_view(), name="train-create"),
    path("trains/availability", TrainAvailabilityView.as_view(), name="train-availability"),
    path("trains/<str:train_id>", TrainDetailView.as_view(), name="train-detail"),
    path("trains/<str:train_id>/book", BookSeatView.as_view(), name="book-seat"),
    path("trains/<str:train_id>/seats", SeatMatrixView.as_view(), name="seat-matrix"),
    path("trains/<str:train_id>/booking/<int:booking_id>", BookingDetailView.as_view(), name="booking-detail"),
    
    # User URLs
    path("user/bookings", UserBookingsView.as_view(), name="user-bookings"),
    
    # Admin management URLs
    path("admin/check/<str:username>/", check_admin, name="check-admin"),
    path("admin/grant/", grant_admin, name="grant-admin"),
    path("admin/revoke/", revoke_admin, name="revoke-admin"),
]


#eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzQ3ODk2NTYwLCJpYXQiOjE3NDc4OTYyNjAsImp0aSI6IjcxZTY3YjAxNjM1MDRiZTY4MGIzOGM0MTg0ZDkzNDI1IiwidXNlcl9pZCI6MX0.n1zFDpyarraO6PityPRgb1hFB1ZDtmgIIX3KRL-5qoE
