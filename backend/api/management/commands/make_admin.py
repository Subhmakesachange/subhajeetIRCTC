from django.core.management.base import BaseCommand
from api.models import User

class Command(BaseCommand):
    help = 'Grants admin privileges to an existing user'

    def add_arguments(self, parser):
        parser.add_argument('username', type=str, help='Username of the user to make admin')

    def handle(self, *args, **kwargs):
        username = kwargs['username']

        try:
            user = User.objects.get(username=username)
            user.is_admin = True
            user.is_staff = True
            user.is_superuser = True
            user.save()
            self.stdout.write(
                self.style.SUCCESS(f'Successfully granted admin privileges to user: {username}')
            )
        except User.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f'User with username "{username}" does not exist')
            ) 