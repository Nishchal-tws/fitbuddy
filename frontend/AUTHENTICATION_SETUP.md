# Authentication Setup Guide

## Overview
The frontend AuthPage is now connected to the backend authentication endpoints. Users can register and login through the React frontend, which communicates with the FastAPI backend.

## How It Works

### Backend Endpoints
- **POST /api/auth/register** - Register a new user
- **POST /api/auth/token** - Login and get access token

### Frontend Components
- **AuthPage.jsx** - Handles login/register forms
- **Dashboard.jsx** - Shows after successful login
- **App.jsx** - Manages authentication state and routing

## Testing the Authentication

### 1. Start the Backend
```bash
cd app
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Start the Frontend
```bash
cd frontend
npm run dev
```

### 3. Test Registration
1. Open http://localhost:5173
2. Click "Register" tab
3. Fill in:
   - Name: Your full name
   - Email: your@email.com
   - Password: your password
   - Confirm Password: same password
4. Click "Create Account"
5. Should see success message and automatically switch to login

### 4. Test Login
1. Use the same email/password from registration
2. Click "Sign In"
3. Should see success message and redirect to dashboard

### 5. Test Logout
1. From the dashboard, click "Logout"
2. Should return to login page

## Key Features

### Error Handling
- Shows specific error messages for failed requests
- Validates password confirmation on registration
- Handles network errors gracefully

### Loading States
- Submit button shows "Processing..." during API calls
- Button is disabled during loading to prevent double-submission

### Token Storage
- Access tokens are stored in localStorage
- App remembers login state on page refresh
- Tokens are cleared on logout

### Form Validation
- Client-side password confirmation
- Required field validation
- Email format validation

## API Integration Details

### Registration Request
```javascript
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "full_name": "John Doe",
  "password": "securepassword"
}
```

### Login Request
```javascript
POST /api/auth/token
Content-Type: application/x-www-form-urlencoded

username=user@example.com&password=securepassword
```

### Response Handling
- Registration returns user data
- Login returns access token
- Errors return detailed error messages
- Success states trigger UI updates

## Next Steps
- Add token expiration handling
- Implement protected routes
- Add user profile management
- Connect to other backend endpoints (workouts, goals, etc.)
