from rest_framework import serializers
from .models import User, Train, Booking, Station

class SignupSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True, min_length=6)
    username = serializers.CharField(required=True, min_length=3)
    is_admin = serializers.BooleanField(required=False, default=False)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'is_admin')
        extra_kwargs = {
            'password': {'write_only': True},
            'username': {
                'error_messages': {
                    'unique': 'This username is already taken.'
                }
            }
        }

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value

    def create(self, validated_data):
        is_admin = validated_data.pop('is_admin', False)
        user = User(
            username=validated_data['username'],
            email=validated_data['email'],
            is_admin=is_admin
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        from django.contrib.auth import authenticate
        user = authenticate(username=data['username'], password=data['password'])
        if user and user.is_active:
            return {'user': user}
        raise serializers.ValidationError("Invalid username or password")

class StationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Station
        fields = ['station_code', 'station_name', 'city', 'state']

class TrainSerializer(serializers.ModelSerializer):
    source_details = StationSerializer(source='source', read_only=True)
    destination_details = StationSerializer(source='destination', read_only=True)
    source_code = serializers.CharField(write_only=True)
    destination_code = serializers.CharField(write_only=True)

    class Meta:
        model = Train
        fields = [
            "id",
            "train_id",
            "name",
            "source",
            "destination",
            "source_details",
            "destination_details",
            "source_code",
            "destination_code",
            "departure_time",
            "arrival_time",
            "total_seats"
        ]
        read_only_fields = ["id", "train_id"]

    def create(self, validated_data):
        source_code = validated_data.pop('source_code')
        destination_code = validated_data.pop('destination_code')
        
        source = Station.objects.get(station_code=source_code)
        destination = Station.objects.get(station_code=destination_code)
        
        return Train.objects.create(
            source=source,
            destination=destination,
            **validated_data
        )

class TrainAvailabilitySerializer(serializers.Serializer):
    train_id = serializers.CharField()
    train_name = serializers.CharField()
    source_station = serializers.CharField(source='source.station_name')
    destination_station = serializers.CharField(source='destination.station_name')
    available_seats = serializers.IntegerField()

class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = '__all__'

class BookingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ('train', 'seat_count', 'seat_numbers')

class BookingDetailSerializer(serializers.ModelSerializer):
    booking_id = serializers.IntegerField(source='id', read_only=True)
    train_id = serializers.CharField(source='train.train_id')
    train_name = serializers.CharField(source='train.name')
    source = serializers.CharField(source='train.source.station_name')
    source_code = serializers.CharField(source='train.source.station_code')
    destination = serializers.CharField(source='train.destination.station_name')
    destination_code = serializers.CharField(source='train.destination.station_code')
    user_id = serializers.IntegerField(source='user.id')
    username = serializers.CharField(source='user.username')
    arrival_time_at_source = serializers.TimeField(source='train.departure_time')
    arrival_time_at_destination = serializers.TimeField(source='train.arrival_time')
    no_of_seats = serializers.IntegerField(source='seat_count')
    total_price = serializers.SerializerMethodField()
    
    def get_total_price(self, obj):
        # Calculate total price (500 per seat)
        return obj.seat_count * 500
    
    class Meta:
        model = Booking
        fields = [
            'booking_id',
            'train_id',
            'train_name',
            'source',
            'source_code',
            'destination',
            'destination_code',
            'user_id',
            'username',
            'no_of_seats',
            'seat_numbers',
            'arrival_time_at_source',
            'arrival_time_at_destination',
            'total_price',
            'booking_time'
        ]
