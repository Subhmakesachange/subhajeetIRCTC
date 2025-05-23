from django.core.management.base import BaseCommand
from django.utils import timezone
from api.models import SeatLock

class Command(BaseCommand):
    help = 'Cleans up expired seat locks'

    def handle(self, *args, **options):
        current_time = timezone.now()
        expired_locks = SeatLock.objects.filter(expires_at__lt=current_time)
        count = expired_locks.count()
        expired_locks.delete()
        self.stdout.write(
            self.style.SUCCESS(f'Successfully deleted {count} expired seat locks')
        ) 