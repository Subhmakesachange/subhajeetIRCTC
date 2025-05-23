from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

class User(AbstractUser):
    is_admin = models.BooleanField(default=False)  # example custom flag

class Station(models.Model):
    station_code = models.CharField(max_length=10, unique=True)
    station_name = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)

    class Meta:
        ordering = ['station_name']

    def save(self, *args, **kwargs):
        # If no station code is provided, generate one from the station name
        if not self.station_code:
            self.station_code = self.station_name[:5].upper()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.station_name} ({self.station_code})"

class Train(models.Model):
    train_id = models.CharField(max_length=20, unique=True, primary_key=True)
    name = models.CharField(max_length=100, default="Unnamed Train")
    source = models.ForeignKey(
        Station,
        on_delete=models.PROTECT,
        related_name='departing_trains'
    )
    destination = models.ForeignKey(
        Station,
        on_delete=models.PROTECT,
        related_name='arriving_trains'
    )
    total_seats = models.PositiveIntegerField(default=0)
    departure_time = models.TimeField(default="00:00:00")
    arrival_time = models.TimeField(default="00:00:00")

    def save(self, *args, **kwargs):
        if not self.train_id:
            # Get the highest train_id number
            last_train = Train.objects.order_by('-train_id').first()
            if last_train:
                try:
                    last_num = int(last_train.train_id[1:])
                    self.train_id = f'T{str(last_num + 1).zfill(4)}'
                except ValueError:
                    self.train_id = 'T0001'
            else:
                self.train_id = 'T0001'
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.train_id}): {self.source.station_name} → {self.destination.station_name}"

class SeatLock(models.Model):
    train = models.ForeignKey(Train, on_delete=models.CASCADE)
    seat_number = models.PositiveIntegerField()
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    locked_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    class Meta:
        unique_together = ('train', 'seat_number')

    def is_expired(self):
        return timezone.now() > self.expires_at

class Booking(models.Model):
    BOOKING_STATUS = (
        ('PENDING', 'Pending'),
        ('CONFIRMED', 'Confirmed'),
        ('FAILED', 'Failed'),
        ('CANCELLED', 'Cancelled')
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, default=None, null=True, blank=True)
    train = models.ForeignKey(Train, on_delete=models.CASCADE, default=None, null=True, blank=True)
    seat_count = models.PositiveIntegerField(default=1)
    seat_numbers = models.JSONField(default=list)  # default is an empty list
    booking_time = models.TimeField(default="00:00:00")  # Keep as TimeField
    booked = models.BooleanField(default=True)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    version = models.IntegerField(default=1)  # For optimistic locking
    status = models.CharField(max_length=20, choices=BOOKING_STATUS, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    request_timestamp = models.DateTimeField(default=timezone.now)  # Track exact request time

    def save(self, *args, **kwargs):
        # Calculate total price if not set
        if not self.total_price:
            self.total_price = self.seat_count * 500
        
        # Increment version on each save
        if self.id:
            self.version += 1
            
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Booking {self.id} - {self.train.name} ({self.seat_count} seats)"

class Seat(models.Model):
    SEAT_STATUS_CHOICES = [
        ('AVAILABLE', 'Available'),
        ('BOOKED', 'Booked'),
        ('LOCKED', 'Locked'),
    ]

    train = models.ForeignKey(Train, on_delete=models.CASCADE, related_name='seats')
    seat_number = models.IntegerField()
    status = models.CharField(max_length=10, choices=SEAT_STATUS_CHOICES, default='AVAILABLE')
    booking = models.ForeignKey('Booking', on_delete=models.SET_NULL, null=True, blank=True)
    locked_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    lock_expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('train', 'seat_number')
        ordering = ['seat_number']

    def __str__(self):
        return f"Seat {self.seat_number} - {self.train.name} ({self.status})"
