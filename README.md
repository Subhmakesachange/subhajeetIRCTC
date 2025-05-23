# IRCTC Train Booking System

A modern web application for train ticket booking with separate user and admin interfaces. Built with React, Material-UI, Django, and SQLite.

## 🚂 Features

### User Features
- **Account Management**
  - User registration and login
  - JWT token-based authentication
  - Profile management
  - Secure password handling

- **Train Booking**
  - Search trains by source and destination
  - View real-time seat availability
  - Book multiple seats in one transaction
  - View booking history
  - View booking details
  - Mobile-responsive booking interface

- **User Interface**
  - Modern Material-UI design
  - Responsive layout for all devices
  - Intuitive navigation
  - Success/Error notifications
  - Loading states and progress indicators

### Admin Features
- **Secure Admin Panel**
  - Separate admin login
  - API key-based authentication
  - Protected admin routes

- **Train Management**
  - Add new trains
  - View all trains
  - Update train details
  - Monitor seat availability
  - Delete trains

- **User Management**
  - View registered users
  - Grant/revoke admin privileges
  - Monitor booking activities

## 🛠️ Technical Requirements

### Frontend
```json
{
  "dependencies": {
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-router-dom": "^7.6.0",
    "@mui/material": "^7.1.0",
    "@mui/icons-material": "^7.1.0",
    "axios": "^1.9.0",
    "jwt-decode": "^4.0.0"
  }
}
```

### Backend
- Python 3.8+
- Django 4.0+
- Django REST Framework
- SQLite3 (default database)
- Required Python packages in requirements.txt

## 🚀 Setup Instructions

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run migrations:
   ```bash
   python manage.py migrate
   ```

5. Create admin user:
   ```bash
   python manage.py createsuperuser
   ```

6. Start development server:
   ```bash
   python manage.py runserver
   ```

## 🔒 Security Features

1. **User Authentication**
   - JWT token-based authentication
   - Token expiration and refresh mechanism
   - Secure password hashing

2. **Admin Security**
   - API key-based authentication for admin routes
   - Protected admin endpoints
   - Role-based access control

3. **API Security**
   - CORS protection
   - Request validation
   - Error handling and logging

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for:
- Desktop browsers
- Tablets
- Mobile devices

Key mobile features:
- Adaptive layouts
- Touch-friendly interfaces
- Optimized navigation
- Responsive tables and forms

## 🌐 API Endpoints

### Public Endpoints
- POST `/api/signup` - User registration
- POST `/api/login` - User login
- POST `/api/admin/login` - Admin login

### Protected User Endpoints
- GET `/api/trains/availability` - Search trains
- POST `/api/trains/{id}/book` - Book seats
- GET `/api/user/bookings` - View bookings
- GET `/api/trains/{id}/booking/{bookingId}` - View booking details

### Protected Admin Endpoints
- POST `/api/trains/create` - Add new train
- GET `/api/admin/trains` - View all trains
- POST `/api/admin/grant` - Grant admin privileges
- POST `/api/admin/revoke` - Revoke admin privileges

## 🔧 Environment Variables

Create a `.env` file in the backend directory with:
```env
SECRET_KEY=your_django_secret_key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ORIGIN_WHITELIST=http://localhost:3000
ADMIN_API_KEY=your_admin_api_key
```

## 📝 Development Guidelines

1. **Code Style**
   - Follow PEP 8 for Python code
   - Use ESLint for JavaScript/React code
   - Follow Material-UI theming guidelines

2. **Security**
   - Never commit sensitive data
   - Always validate user input
   - Use environment variables for secrets

3. **Testing**
   - Write unit tests for critical functions
   - Test API endpoints
   - Test responsive layouts

## 🐛 Common Issues & Solutions

1. **CORS Issues**
   - Ensure CORS_ORIGIN_WHITELIST includes frontend URL
   - Check request headers

2. **Authentication Issues**
   - Verify token expiration
   - Check API key format
   - Ensure proper header format

3. **Database Issues**
   - Run migrations
   - Check database connections
   - Verify model relationships

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Material-UI Documentation](https://mui.com)
- [Django Documentation](https://docs.djangoproject.com)
- [Django REST Framework Documentation](https://www.django-rest-framework.org)

#As part of the selection process for the internship at StepOut, I was given a project task to complete. I successfully implemented all the required features and went a step further by adding a few extra enhancements. I also modified some components to improve performance and overall functionality.This task was a great learning experience and allowed me to apply my skills in a practical context. It also helped me understand the expectations and development approach of the team.

Looking Forward:
I’m truly excited about the possibility of joining StepOut as an intern. I look forward to learning, growing, and contributing meaningfully to the team.A heartfelt thank you to the entire StepOut team for this opportunity and for designing such a thoughtful and engaging task.

