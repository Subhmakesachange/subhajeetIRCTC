from django.contrib.auth import get_user_model
from django.core.exceptions import ObjectDoesNotExist

def grant_admin_privileges(username):
    """
    Grant admin privileges to a user by username.
    
    Args:
        username (str): The username of the user to be granted admin privileges
        
    Returns:
        tuple: (bool, str) - (success status, message)
    """
    try:
        User = get_user_model()
        user = User.objects.get(username=username)
        
        # Check if user is already an admin
        if user.is_staff and user.is_superuser and user.is_admin:
            return False, f"User '{username}' is already an admin"
        
        # Grant admin privileges
        user.is_staff = True  # Gives access to admin site
        user.is_superuser = True  # Gives all permissions
        user.is_admin = True  # Custom admin flag for our application
        user.save()
        
        return True, f"Successfully granted admin privileges to user '{username}'"
    
    except ObjectDoesNotExist:
        return False, f"User '{username}' not found"
    except Exception as e:
        return False, f"Error granting admin privileges: {str(e)}"

def revoke_admin_privileges(username):
    """
    Revoke admin privileges from a user by username.
    
    Args:
        username (str): The username of the user to revoke admin privileges from
        
    Returns:
        tuple: (bool, str) - (success status, message)
    """
    try:
        User = get_user_model()
        user = User.objects.get(username=username)
        
        # Check if user is not an admin
        if not user.is_staff and not user.is_superuser and not user.is_admin:
            return False, f"User '{username}' is not an admin"
        
        # Revoke admin privileges
        user.is_staff = False
        user.is_superuser = False
        user.is_admin = False
        user.save()
        
        return True, f"Successfully revoked admin privileges from user '{username}'"
    
    except ObjectDoesNotExist:
        return False, f"User '{username}' not found"
    except Exception as e:
        return False, f"Error revoking admin privileges: {str(e)}"

def check_admin_status(username):
    """
    Check if a user has admin privileges.
    
    Args:
        username (str): The username to check
        
    Returns:
        tuple: (bool, str) - (success status, message)
    """
    try:
        User = get_user_model()
        user = User.objects.get(username=username)
        
        is_admin = user.is_staff and user.is_superuser and user.is_admin
        status = "is" if is_admin else "is not"
        
        return True, f"User '{username}' {status} an admin"
    
    except ObjectDoesNotExist:
        return False, f"User '{username}' not found"
    except Exception as e:
        return False, f"Error checking admin status: {str(e)}"