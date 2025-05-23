from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.core.exceptions import PermissionDenied
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Sum
from django.db import DatabaseError
from django.utils import timezone
from datetime import timedelta
from django.db import IntegrityError
from rest_framework_simplejwt.authentication import JWTAuthentication

from django.db import models
from .models import User, Train, Booking, Station, SeatLock, Seat
from .serializers import (
    SignupSerializer,
    LoginSerializer,
    TrainSerializer,
    TrainAvailabilitySerializer,
    BookingSerializer,
    BookingCreateSerializer,
    BookingDetailSerializer,
)
from .authenticate import AdminAPIKeyAuthentication
from django.conf import settings
from utils.admin_utils import grant_admin_privileges, revoke_admin_privileges, check_admin_status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser

# Signup view
class SignupView(APIView):
    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "status": "Account successfully created",
                "status_code": 200,
                "user_id": user.id
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Login view
class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            response_data = {
                "status": "Login successful",
                "status_code": 200,
                "user_id": str(user.id),
                "access_token": str(refresh.access_token),
                "is_admin": user.is_admin
            }
            
            # Include admin API key if user is admin
            if user.is_admin:
                print("Debug - Adding admin API key to response for admin user")
                response_data["admin_api_key"] = settings.ADMIN_API_KEY
                print("Debug - Admin API key added:", settings.ADMIN_API_KEY)
            
            return Response(response_data, status=status.HTTP_200_OK)
        return Response({
            "status": "Incorrect username/password provided. Please retry",
            "status_code": 401
        }, status=status.HTTP_401_UNAUTHORIZED)

# Admin API key permission class
class AdminApiKeyPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        auth_header = request.headers.get("Authorization")
        print("Debug - Auth header:", auth_header)  # Debug print
        print("Debug - Expected API key:", settings.ADMIN_API_KEY)  # Debug print
        
        if not auth_header or not auth_header.startswith("Api-Key "):
            print("Debug - Auth header missing or wrong format")  # Debug print
            return False
            
        key = auth_header.split(" ")[1]
        is_valid = key == settings.ADMIN_API_KEY
        print("Debug - API key valid:", is_valid)  # Debug print
        return is_valid

# Train creation by admin with API key authentication
class TrainCreateView(APIView):
    authentication_classes = [AdminAPIKeyAuthentication]
    permission_classes = [AdminApiKeyPermission]

    def post(self, request):
        try:
            print("Received data:", request.data)
            
            # Extract data from request
            data = request.data
            name = data.get('train_name')
            source_name = data.get('source')
            destination_name = data.get('destination')
            total_seats = data.get('seat_capacity')
            departure_time = data.get('arrival_time_at_source')
            arrival_time = data.get('arrival_time_at_destination')

            # Validate each field individually and collect errors
            errors = {}
            if not name:
                errors['train_name'] = "Train name is required"
            if not source_name:
                errors['source'] = "Source station is required"
            if not destination_name:
                errors['destination'] = "Destination station is required"
            if not total_seats:
                errors['seat_capacity'] = "Seat capacity is required"
            elif not str(total_seats).isdigit():
                errors['seat_capacity'] = "Seat capacity must be a number"
            if not departure_time:
                errors['arrival_time_at_source'] = "Departure time is required"
            if not arrival_time:
                errors['arrival_time_at_destination'] = "Arrival time is required"

            if errors:
                return Response({
                    "error": "Validation failed",
                    "details": errors
                }, status=status.HTTP_400_BAD_REQUEST)

            # Convert total_seats to integer
            try:
                total_seats = int(total_seats)
                if total_seats <= 0:
                    return Response({
                        "error": "Invalid seat capacity",
                        "details": {"seat_capacity": "Seat capacity must be greater than 0"}
                    }, status=status.HTTP_400_BAD_REQUEST)
            except (ValueError, TypeError):
                return Response({
                    "error": "Invalid seat capacity",
                    "details": {"seat_capacity": "Seat capacity must be a valid number"}
                }, status=status.HTTP_400_BAD_REQUEST)

            # Validate time format
            try:
                from datetime import datetime
                datetime.strptime(departure_time, '%H:%M:%S')
                datetime.strptime(arrival_time, '%H:%M:%S')
            except ValueError:
                return Response({
                    "error": "Invalid time format",
                    "details": "Time must be in HH:MM:SS format"
                }, status=status.HTTP_400_BAD_REQUEST)

            # Check if train name exists
            if Train.objects.filter(name=name).exists():
                return Response({
                    "error": "Train already exists",
                    "details": {"train_name": f"Train with name {name} already exists"}
                }, status=status.HTTP_400_BAD_REQUEST)

            # Get or create source station
            try:
                source, _ = Station.objects.get_or_create(
                    station_name=source_name,
                    defaults={
                        'station_code': source_name[:5].upper(),
                        'city': source_name,
                        'state': 'Unknown'
                    }
                )
            except Exception as e:
                return Response({
                    "error": "Failed to create source station",
                    "details": str(e)
                }, status=status.HTTP_400_BAD_REQUEST)

            # Get or create destination station
            try:
                destination, _ = Station.objects.get_or_create(
                    station_name=destination_name,
                    defaults={
                        'station_code': destination_name[:5].upper(),
                        'city': destination_name,
                        'state': 'Unknown'
                    }
                )
            except Exception as e:
                return Response({
                    "error": "Failed to create destination station",
                    "details": str(e)
                }, status=status.HTTP_400_BAD_REQUEST)

            # Create the train within a transaction
            with transaction.atomic():
                train = Train.objects.create(
                    name=name,
                    source=source,
                    destination=destination,
                    total_seats=total_seats,
                    departure_time=departure_time,
                    arrival_time=arrival_time
                )

                # Initialize seats for the train
                seats = [
                    Seat(
                        train=train,
                        seat_number=seat_num,
                        status='AVAILABLE'
                    ) for seat_num in range(1, total_seats + 1)
                ]
                Seat.objects.bulk_create(seats)

            return Response({
                "message": "Train added successfully",
                "train_id": train.train_id,
                "status": "success",
                "train_details": {
                    "name": train.name,
                    "source": train.source.station_name,
                    "destination": train.destination.station_name,
                    "total_seats": train.total_seats,
                    "departure_time": train.departure_time,
                    "arrival_time": train.arrival_time
                }
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            print("Error creating train:", str(e))
            return Response({
                "error": "Failed to process request",
                "details": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

# Train availability
class TrainAvailabilityView(APIView):
    def get(self, request):
        # Check if user is admin
        is_admin = request.user.is_authenticated and request.user.is_admin

        # If admin and no parameters provided, return all trains
        if is_admin and not (request.query_params.get('source') or request.query_params.get('destination')):
            trains = Train.objects.all()
            result = []
            for train in trains:
                booked_count = Booking.objects.filter(train=train, booked=True).aggregate(total=models.Sum('seat_count'))['total'] or 0
                available_seats = max(train.total_seats - booked_count, 0)
                result.append({
                    "train_id": train.train_id,
                    "train_name": train.name,
                    "source": train.source.station_name,
                    "destination": train.destination.station_name,
                    "available_seats": available_seats,
                })
            return Response(result)

        # For non-admin users or when parameters are provided
        source = request.query_params.get('source')
        destination = request.query_params.get('destination')

        if not source or not destination:
            return Response(
                {"detail": "source and destination query parameters are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Find stations that match the source and destination
        source_stations = Station.objects.filter(station_name__iexact=source)
        destination_stations = Station.objects.filter(station_name__iexact=destination)

        if not source_stations.exists():
            return Response({"detail": f"No station found with name: {source}"}, status=status.HTTP_404_NOT_FOUND)
        
        if not destination_stations.exists():
            return Response({"detail": f"No station found with name: {destination}"}, status=status.HTTP_404_NOT_FOUND)

        # Find trains between these stations
        trains = Train.objects.filter(source__in=source_stations, destination__in=destination_stations)

        result = []
        for train in trains:
            booked_count = Booking.objects.filter(train=train, booked=True).aggregate(total=models.Sum('seat_count'))['total'] or 0
            available_seats = max(train.total_seats - booked_count, 0)
            result.append({
                "train_id": train.train_id,
                "train_name": train.name,
                "source": train.source.station_name,
                "destination": train.destination.station_name,
                "available_seats": available_seats,
            })

        return Response(result)

# Book seat view
class BookSeatView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, train_id):
        user_id = request.data.get('user_id')
        seat_numbers = request.data.get('seat_numbers', [])  # Get specific seat numbers
        
        if not user_id or not seat_numbers:
            return Response({
                "message": "user_id and seat_numbers are required."
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({
                "message": "User not found."
            }, status=status.HTTP_404_NOT_FOUND)

        try:
            train = Train.objects.get(train_id=train_id)
        except Train.DoesNotExist:
            return Response({
                "message": "Train not found."
            }, status=status.HTTP_404_NOT_FOUND)

        try:
            with transaction.atomic():
                # Lock the train and get seats
                train = Train.objects.select_for_update(nowait=True).get(pk=train.pk)
                current_time = timezone.now()

                # Get requested seats with lock
                requested_seats = Seat.objects.select_for_update(nowait=True).filter(
                    train=train,
                    seat_number__in=seat_numbers
                )

                # Verify all requested seats exist
                if requested_seats.count() != len(seat_numbers):
                    return Response({
                        "status": "error",
                        "message": "One or more selected seats do not exist.",
                        "error_type": "invalid_seats"
                    }, status=status.HTTP_400_BAD_REQUEST)

                # Check if any seats are already booked or locked
                unavailable_seats = requested_seats.exclude(status='AVAILABLE')
                if unavailable_seats.exists():
                    # Get all available seats for the train
                    available_seats = Seat.objects.filter(
                        train=train,
                        status='AVAILABLE'
                    ).values_list('seat_number', flat=True)

                    return Response({
                        "status": "error",
                        "message": "Some selected seats are not available.",
                        "unavailable_seats": list(unavailable_seats.values_list('seat_number', flat=True)),
                        "available_seats": list(available_seats),
                        "error_type": "seats_taken"
                    }, status=status.HTTP_409_CONFLICT)

                # Create booking
                booking = Booking.objects.create(
                    user=user,
                    train=train,
                    seat_count=len(seat_numbers),
                    seat_numbers=seat_numbers,
                    status='CONFIRMED',
                    booked=True,
                    request_timestamp=current_time
                )

                # Update seat status
                requested_seats.update(
                    status='BOOKED',
                    booking=booking,
                    locked_by=None,
                    lock_expires_at=None
                )

                return Response({
                    "status": "success",
                    "message": "Seats booked successfully",
                    "booking_id": str(booking.id),
                    "seat_numbers": seat_numbers,
                    "status": "CONFIRMED",
                    "total_price": booking.total_price
                }, status=status.HTTP_201_CREATED)

        except DatabaseError as e:
            # Get updated list of available seats
            available_seats = Seat.objects.filter(
                train=train,
                status='AVAILABLE'
            ).values_list('seat_number', flat=True)

            return Response({
                "status": "error",
                "message": "The seats you selected are no longer available. Please choose from the available seats.",
                "available_seats": list(available_seats),
                "error_type": "concurrent_booking"
            }, status=status.HTTP_409_CONFLICT)

    def get(self, request, train_id):
        """Get seat availability matrix for a train"""
        try:
            train = Train.objects.get(train_id=train_id)
            seats = Seat.objects.filter(train=train).order_by('seat_number')
            current_user = request.user
            
            seat_matrix = []
            seats_per_row = 6  # Same as frontend
            
            # Convert seats to matrix format
            current_row = []
            for seat in seats:
                # Check if the seat is booked by the current user
                is_users_booking = False
                if seat.booking and seat.booking.user:
                    is_users_booking = seat.booking.user.id == current_user.id

                current_row.append({
                    'seat_number': seat.seat_number,
                    'status': seat.status,
                    'is_booked': seat.status == 'BOOKED',
                    'is_users_booking': is_users_booking
                })
                
                if len(current_row) == seats_per_row:
                    seat_matrix.append(current_row)
                    current_row = []
            
            # Add any remaining seats
            if current_row:
                seat_matrix.append(current_row)
            
            return Response({
                'seat_matrix': seat_matrix,
                'total_seats': train.total_seats,
                'available_seats': seats.filter(status='AVAILABLE').count()
            })
            
        except Train.DoesNotExist:
            return Response({
                "message": "Train not found"
            }, status=status.HTTP_404_NOT_FOUND)

# Booking detail view - only owner or admin can access
class BookingDetailView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, train_id, booking_id):
        try:
            booking = Booking.objects.get(
                id=booking_id,
                train__train_id=train_id,
                user=request.user
            )
            serializer = BookingDetailSerializer(booking)
            return Response(serializer.data)
        except Booking.DoesNotExist:
            return Response(
                {"message": "Booking not found"},
                status=status.HTTP_404_NOT_FOUND
            )

# Admin Signup view
class AdminSignupView(APIView):
    authentication_classes = [AdminAPIKeyAuthentication]
    permission_classes = [AdminApiKeyPermission]

    def post(self, request):
        data = request.data.copy()
        data['is_admin'] = True  # Force is_admin to be True
        serializer = SignupSerializer(data=data)
        if serializer.is_valid():
            user = serializer.save()
            # Set additional admin privileges
            user.is_staff = True
            user.is_superuser = True
            user.is_admin = True  # Explicitly set is_admin
            user.save()
            return Response({
                "status": "Admin account successfully created",
                "status_code": 200,
                "user_id": user.id,
                "is_admin": True
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Admin Dashboard Views
class AdminDashboardView(APIView):
    authentication_classes = [AdminAPIKeyAuthentication]
    permission_classes = [AdminApiKeyPermission]

    def get(self, request):
        # Get counts and summary
        total_trains = Train.objects.count()
        total_stations = Station.objects.count()
        total_bookings = Booking.objects.count()
        
        return Response({
            "total_trains": total_trains,
            "total_stations": total_stations,
            "total_bookings": total_bookings,
        })

class AdminStationListView(APIView):
    authentication_classes = [AdminAPIKeyAuthentication]
    permission_classes = [AdminApiKeyPermission]

    def get(self, request):
        stations = Station.objects.all()
        return Response([{
            "id": station.id,
            "station_code": station.station_code,
            "station_name": station.station_name,
            "city": station.city,
            "state": station.state
        } for station in stations])

    def post(self, request):
        station_code = request.data.get('station_code')
        station_name = request.data.get('station_name')
        city = request.data.get('city')
        state = request.data.get('state')

        if not all([station_code, station_name, city, state]):
            return Response({
                "error": "All fields are required: station_code, station_name, city, state"
            }, status=status.HTTP_400_BAD_REQUEST)

        if Station.objects.filter(station_code=station_code).exists():
            return Response({
                "error": f"Station with code {station_code} already exists"
            }, status=status.HTTP_400_BAD_REQUEST)

        station = Station.objects.create(
            station_code=station_code,
            station_name=station_name,
            city=city,
            state=state
        )

        return Response({
            "message": "Station created successfully",
            "station": {
                "id": station.id,
                "station_code": station.station_code,
                "station_name": station.station_name,
                "city": station.city,
                "state": station.state
            }
        }, status=status.HTTP_201_CREATED)

class AdminTrainListView(APIView):
    authentication_classes = [AdminAPIKeyAuthentication]
    permission_classes = [AdminApiKeyPermission]

    def get(self, request):
        trains = Train.objects.all()
        result = []
        for train in trains:
            booked_count = Booking.objects.filter(train=train, booked=True).aggregate(total=models.Sum('seat_count'))['total'] or 0
            available_seats = max(train.total_seats - booked_count, 0)
            result.append({
                "train_id": train.train_id,
                "name": train.name,
                "source": {
                    "station_code": train.source.station_code,
                    "station_name": train.source.station_name
                },
                "destination": {
                    "station_code": train.destination.station_code,
                    "station_name": train.destination.station_name
                },
                "total_seats": train.total_seats,
                "available_seats": available_seats,
                "departure_time": train.departure_time,
                "arrival_time": train.arrival_time
            })
        return Response(result)

    def delete(self, request, train_id):
        try:
            train = Train.objects.get(train_id=train_id)
            train.delete()
            return Response({
                "message": f"Train {train.name} (ID: {train.train_id}) has been successfully deleted"
            }, status=status.HTTP_200_OK)
        except Train.DoesNotExist:
            return Response({
                "error": f"Train with ID {train_id} not found"
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                "error": f"Failed to delete train: {str(e)}"
            }, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request):
        name = request.data.get('name')
        source_code = request.data.get('source_code')
        destination_code = request.data.get('destination_code')
        total_seats = request.data.get('total_seats')
        departure_time = request.data.get('departure_time')
        arrival_time = request.data.get('arrival_time')

        # Validate required fields
        if not all([name, source_code, destination_code, total_seats, departure_time, arrival_time]):
            return Response({
                "error": "All fields are required: name, source_code, destination_code, total_seats, departure_time, arrival_time"
            }, status=status.HTTP_400_BAD_REQUEST)

        # Check if train name exists
        if Train.objects.filter(name=name).exists():
            return Response({
                "error": f"Train with name {name} already exists"
            }, status=status.HTTP_400_BAD_REQUEST)

        # Get source and destination stations
        try:
            source = Station.objects.get(station_code=source_code)
            destination = Station.objects.get(station_code=destination_code)
        except Station.DoesNotExist:
            return Response({
                "error": "Invalid source or destination station code"
            }, status=status.HTTP_400_BAD_REQUEST)

        train = Train.objects.create(
            name=name,
            source=source,
            destination=destination,
            total_seats=total_seats,
            departure_time=departure_time,
            arrival_time=arrival_time
        )

        return Response({
            "message": "Train created successfully",
            "train": {
                "id": train.id,
                "train_id": train.train_id,
                "name": train.name,
                "source": {
                    "station_code": train.source.station_code,
                    "station_name": train.source.station_name
                },
                "destination": {
                    "station_code": train.destination.station_code,
                    "station_name": train.destination.station_name
                },
                "total_seats": train.total_seats,
                "departure_time": train.departure_time,
                "arrival_time": train.arrival_time
            }
        }, status=status.HTTP_201_CREATED)

class ViewAllTrainsView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        trains = Train.objects.all()
        result = []
        for train in trains:
            booked_count = Booking.objects.filter(train=train, booked=True).aggregate(total=models.Sum('seat_count'))['total'] or 0
            available_seats = max(train.total_seats - booked_count, 0)
            result.append({
                "train_id": train.train_id,
                "name": train.name,
                "source": train.source.station_name,
                "destination": train.destination.station_name,
                "total_seats": train.total_seats,
                "available_seats": available_seats,
                "departure_time": train.departure_time,
                "arrival_time": train.arrival_time
            })
        return Response(result)

@api_view(['POST'])
@permission_classes([])  # Remove the permission classes
def grant_admin(request):
    # Check for API key authentication
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Api-Key "):
        return Response(
            {"error": "Admin API key is required"},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    key = auth_header.split(" ")[1]
    if key != settings.ADMIN_API_KEY:
        return Response(
            {"error": "Invalid admin API key"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    username = request.data.get('username')
    if not username:
        return Response(
            {'error': 'Username is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = User.objects.get(username=username)
        if user.is_admin:
            return Response(
                {'message': f'User {username} is already an admin'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.is_admin = True
        user.is_staff = True
        user.save()
        
        return Response({
            'message': f'Successfully granted admin privileges to {username}',
            'username': username,
            'is_admin': True
        })
    except User.DoesNotExist:
        return Response(
            {'error': f'User {username} not found'},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['POST'])
@permission_classes([])  # Remove the permission classes
def revoke_admin(request):
    # Check for API key authentication
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Api-Key "):
        return Response(
            {"error": "Admin API key is required"},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    key = auth_header.split(" ")[1]
    if key != settings.ADMIN_API_KEY:
        return Response(
            {"error": "Invalid admin API key"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    username = request.data.get('username')
    if not username:
        return Response(
            {'error': 'Username is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Get the requesting admin's username from the token
        requesting_admin = request.data.get('requesting_admin')
        if not requesting_admin:
            return Response(
                {'error': 'Requesting admin username is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if admin is trying to revoke their own privileges
        if username == requesting_admin:
            return Response(
                {'error': 'You cannot revoke your own admin privileges'},
                status=status.HTTP_403_FORBIDDEN
            )

        user = User.objects.get(username=username)
        if not user.is_admin:
            return Response(
                {'message': f'User {username} is not an admin'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.is_admin = False
        user.is_staff = False
        user.save()
        
        return Response({
            'message': f'Successfully revoked admin privileges from {username}',
            'username': username,
            'is_admin': False
        })
    except User.DoesNotExist:
        return Response(
            {'error': f'User {username} not found'},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
@permission_classes([])  # Remove the permission classes
def check_admin(request, username):
    # Check for API key authentication
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Api-Key "):
        return Response(
            {"error": "Admin API key is required"},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    key = auth_header.split(" ")[1]
    if key != settings.ADMIN_API_KEY:
        return Response(
            {"error": "Invalid admin API key"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    if not username:
        return Response(
            {'error': 'Username is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = User.objects.get(username=username)
        return Response({
            'username': username,
            'is_admin': user.is_admin
        })
    except User.DoesNotExist:
        return Response(
            {'error': f'User {username} not found'},
            status=status.HTTP_404_NOT_FOUND
        )

class TrainDetailView(APIView):
    authentication_classes = []  # Allow unauthenticated access
    permission_classes = []      # No permissions required

    def get(self, request, train_id):
        try:
            print(f"Debug - Fetching train details for train_id: {train_id}")  # Debug log
            train = Train.objects.get(train_id=train_id)
            print(f"Debug - Found train: {train.name}")  # Debug log
            
            # Get confirmed bookings count
            try:
                booked_count = Booking.objects.filter(
                    train=train, 
                    status='CONFIRMED'
                ).aggregate(total=Sum('seat_count'))['total'] or 0
                print(f"Debug - Booked count: {booked_count}")  # Debug log
            except Exception as e:
                print(f"Debug - Error getting booked count: {str(e)}")  # Debug log
                booked_count = 0
            
            # Get locked seats count
            current_time = timezone.now()
            try:
                locked_seats = SeatLock.objects.filter(
                    train=train,
                    expires_at__gt=current_time
                ).count()
                print(f"Debug - Locked seats: {locked_seats}")  # Debug log
            except Exception as e:
                print(f"Debug - Error getting locked seats: {str(e)}")  # Debug log
                locked_seats = 0
            
            available_seats = max(train.total_seats - booked_count - locked_seats, 0)
            print(f"Debug - Available seats: {available_seats}")  # Debug log
            
            response_data = {
                "train_id": train.train_id,
                "name": train.name,
                "source": train.source.station_name,
                "destination": train.destination.station_name,
                "total_seats": train.total_seats,
                "available_seats": available_seats,
                "departure_time": train.departure_time,
                "arrival_time": train.arrival_time
            }
            print(f"Debug - Response data: {response_data}")  # Debug log
            return Response(response_data)
            
        except Train.DoesNotExist:
            print(f"Debug - Train not found: {train_id}")  # Debug log
            return Response(
                {"message": "Train not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"Debug - Error in TrainDetailView: {str(e)}")  # Debug log
            import traceback
            print(f"Debug - Traceback: {traceback.format_exc()}")  # Debug log
            return Response(
                {"message": f"Error retrieving train details: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# New SeatMatrixView
class SeatMatrixView(APIView):
    def get(self, request, train_id):
        try:
            train = get_object_or_404(Train, train_id=train_id)
            
            # Get all seats for this train with their current status
            seats = Seat.objects.filter(train=train).order_by('seat_number')
            
            # Create a seat matrix
            total_seats = train.total_seats
            seat_matrix = []
            
            # Create rows of 6 seats each (3 on each side with aisle in middle)
            current_row = []
            for seat in seats:
                current_row.append({
                    'seat_number': seat.seat_number,
                    'status': seat.status,
                    'is_booked': seat.status == 'BOOKED'
                })
                
                if len(current_row) == 6:  # When we have 6 seats, start a new row
                    seat_matrix.append(current_row)
                    current_row = []
            
            # Add any remaining seats in the last row
            if current_row:
                seat_matrix.append(current_row)
            
            return Response({
                'train_id': train_id,
                'total_seats': total_seats,
                'available_seats': seats.filter(status='AVAILABLE').count(),
                'seat_matrix': seat_matrix
            }, status=status.HTTP_200_OK)
            
        except Train.DoesNotExist:
            return Response({
                'error': 'Train not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(f"Error in SeatMatrixView: {str(e)}")  # Add debug logging
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserBookingsView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            # Get all bookings for the current user
            bookings = Booking.objects.filter(user=request.user).order_by('-created_at')
            
            # Prepare the response data
            bookings_data = []
            for booking in bookings:
                booking_data = {
                    'booking_id': booking.id,
                    'train': {
                        'train_id': booking.train.train_id,
                        'name': booking.train.name,
                        'source': booking.train.source.station_name,
                        'destination': booking.train.destination.station_name,
                    },
                    'seat_numbers': booking.seat_numbers,
                    'num_seats': booking.seat_count,
                    'total_price': float(booking.total_price),
                    'status': booking.status,
                    'booking_date': booking.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                }
                bookings_data.append(booking_data)
            
            return Response(bookings_data)
            
        except Exception as e:
            print(f"Error fetching user bookings: {str(e)}")
            return Response({
                'error': 'Failed to fetch bookings'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
