# Firebase Authentication Implementation for LCMS

This document describes the Firebase Authentication implementation in the Leave Credit Management System (LCMS).

## Overview

The LCMS now uses Firebase Authentication for secure user login using email and password. The system supports role-based access for three user types: Employee, Supervisor, and HR.

## Features Implemented

### 1. User Authentication

- **Email/Password Login**: Users sign in with their email and password
- **User Registration**: New users can create accounts via the registration page
- **Authentication State Management**: Automatic login state checking across pages
- **Error Handling**: Comprehensive error messages for login/registration failures

### 2. Role-Based Access

- **Role Selection**: Users select their role (Employee, Supervisor, HR) before logging in
- **Role Persistence**: User roles are stored in localStorage for session management
- **Role Validation**: Pages check for appropriate user roles before allowing access

### 3. Security Features

- **Password Requirements**: Minimum 6-character password requirement
- **Email Validation**: Proper email format validation
- **Session Management**: Automatic sign-out and redirect functionality
- **Protected Routes**: Pages require authentication to access

## Files Modified/Added

### New Files

1. **`register.html`** - User registration page
2. **`js/auth-utils.js`** - Authentication utility functions

### Modified Files

1. **`login.html`** - Updated with Firebase Auth integration
2. **`index.html`** - Added Firebase Auth SDK
3. **`js/firebase-init.js`** - Added Firebase Auth initialization
4. **`CSS/index.css`** - Added styles for error/success messages

## How to Use

### For Testing/Development

1. **Create Test Accounts**:

   - Visit `register.html` to create test accounts
   - Create accounts for each role: employee, supervisor, hr
   - Use format like: `employee@test.com`, `supervisor@test.com`, `hr@test.com`

2. **Login Process**:
   - Go to the main page (`index.html`)
   - Click on desired role (HR, Supervisor, Employee)
   - Enter email and password on login page
   - System will redirect to appropriate dashboard upon successful login

### Authentication Flow

1. **Role Selection**: User selects role from main page
2. **Login**: User enters email/password on login page
3. **Authentication**: Firebase verifies credentials
4. **Role Storage**: User role is stored in localStorage
5. **Redirect**: User is redirected to role-appropriate dashboard
6. **Session Management**: Authentication state is maintained across pages

## Firebase Console Setup Required

To use this authentication system, you need to:

1. **Enable Authentication**:

   - Go to Firebase Console → Authentication
   - Click "Get started"
   - Enable "Email/Password" sign-in method

2. **Set Up Users** (Optional):
   - You can manually add users in Firebase Console
   - Or use the registration page to create accounts

## Error Handling

The system includes comprehensive error handling for:

- Invalid email formats
- Wrong passwords
- Non-existent accounts
- Weak passwords
- Network connectivity issues
- Account already exists (registration)

## Security Considerations

1. **Client-Side Role Management**: Currently, roles are stored in localStorage. For production, consider server-side role management with Firestore.

2. **Password Strength**: Currently requires minimum 6 characters. Consider implementing stronger password requirements.

3. **Email Verification**: Consider adding email verification for new accounts.

## Future Enhancements

1. **Firestore Integration**: Store user profiles and roles in Firestore
2. **Password Reset**: Implement forgot password functionality
3. **Email Verification**: Add email verification for new accounts
4. **Admin Panel**: Create admin interface for user management
5. **Two-Factor Authentication**: Add 2FA for enhanced security

## Testing

### Test Account Creation

Use the registration page to create test accounts:

- Employee: `employee@test.com`
- Supervisor: `supervisor@test.com`
- HR: `hr@test.com`

### Login Testing

1. Visit main page
2. Select role
3. Enter test credentials
4. Verify redirect to correct dashboard
5. Test error cases (wrong password, invalid email, etc.)

## Troubleshooting

### Common Issues

1. **"Firebase not defined" errors**:

   - Ensure Firebase SDK scripts are loaded before custom scripts
   - Check network connectivity

2. **Authentication not working**:

   - Verify Firebase project configuration
   - Check that Email/Password auth is enabled in Firebase Console

3. **Redirect issues**:

   - Verify file paths in redirect URLs
   - Check that target HTML files exist

4. **Role access issues**:
   - Clear localStorage and try logging in again
   - Verify role parameter in URL
