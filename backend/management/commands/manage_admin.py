from django.core.management.base import BaseCommand
from utils.admin_utils import grant_admin_privileges, revoke_admin_privileges, check_admin_status

class Command(BaseCommand):
    help = 'Manage admin privileges for users'

    def add_arguments(self, parser):
        parser.add_argument('action', type=str, choices=['grant', 'revoke', 'check'],
                          help='Action to perform: grant, revoke, or check admin privileges')
        parser.add_argument('username', type=str,
                          help='Username of the user to manage')

    def handle(self, *args, **options):
        action = options['action']
        username = options['username']

        if action == 'grant':
            success, message = grant_admin_privileges(username)
        elif action == 'revoke':
            success, message = revoke_admin_privileges(username)
        else:  # check
            success, message = check_admin_status(username)

        if success:
            self.stdout.write(self.style.SUCCESS(message))
        else:
            self.stdout.write(self.style.ERROR(message)) 