# Firebase Setup for LCMS Project

This document describes how Firebase has been set up in the Leave Credit Management System (LCMS) project.

## Current Firebase Implementation

### 1. Firebase Services Initialized

- **Firebase App**: Core Firebase client SDK
- **Firebase Analytics**: Basic analytics functionality

### 2. Configuration Files

- `js/firebase-init.js`: Contains Firebase initialization code with your project configuration
- `firebase.json`: Configuration for Firebase Hosting
- `.firebaserc`: Project association configuration

### 3. HTML Integration

Firebase SDK scripts have been added to the main `index.html` file:

```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-analytics-compat.js"></script>
```

## Project Firebase Configuration

Your Firebase project has the following configuration:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDdTbk0CANX3PlQGiMn0z6d4PdRplzB2EU",
  authDomain: "lcs-isu.firebaseapp.com",
  projectId: "lcs-isu",
  storageBucket: "lcs-isu.firebasestorage.app",
  messagingSenderId: "590058145204",
  appId: "1:590058145204:web:f108234a96002556dc9ee1",
  measurementId: "G-5ZP6KXGB20",
};
```

## Future Implementation Recommendations

To fully leverage Firebase in this project, consider adding:

### 1. Firebase Authentication

For user login and management. Add this by:

```html
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
```

### 2. Cloud Firestore

For storing and retrieving data like user profiles and leave records:

```html
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>
```

### 3. Cloud Functions

For server-side logic such as calculating leave balances or sending notifications.

## Next Steps

1. See `docs/firebase-hosting-guide.md` for instructions on how to deploy this project to Firebase Hosting
2. Implement user authentication with Firebase Auth
3. Create Firestore database collections for employees, leave requests, etc.
