from django.contrib import admin
from .models import Train, Booking

@admin.register(Train)
class TrainAdmin(admin.ModelAdmin):
    list_display = ('train_id', 'name', 'source', 'destination', 'total_seats')
    search_fields = ('train_id', 'name', 'source', 'destination')

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('user', 'train', 'seat_numbers', 'booked', 'booking_time')
    list_filter = ('booked', 'booking_time')
    search_fields = ('user__username', 'train__name')
