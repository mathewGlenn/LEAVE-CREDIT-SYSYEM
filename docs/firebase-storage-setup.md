# Firebase Storage Security Rules

For the leave request file upload functionality to work properly, you need to configure Firebase Storage security rules.

## Storage Rules Configuration

Go to your Firebase Console → Storage → Rules and update them with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to upload files to their leave request folders
    match /leave-requests/{leaveRequestId}/{allPaths=**} {
      allow read, write: if request.auth != null;
    }

    // Allow authenticated users to upload test files
    match /test-uploads/{allPaths=**} {
      allow read, write: if request.auth != null;
    }

    // Deny all other access
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

## File Upload Restrictions

The system enforces these restrictions in the client code:

- **File Types**: PDF, DOC, DOCX, JPG, PNG only
- **File Size**: Maximum 10MB per file
- **Authentication**: User must be logged in

## File Organization

Files are stored with this structure:

```
/leave-requests/
  /{leaveRequestId}/
    /{timestamp}-{originalFileName}
/test-uploads/
  /{timestamp}-{originalFileName}
```

## Testing Storage

1. Use the `test-leave-request.html` page
2. Click "Test File Upload"
3. Select a file to verify upload functionality
4. Check Firebase Console → Storage to see uploaded files

## Security Notes

- Files are only accessible to authenticated users
- Each leave request's files are stored in separate folders
- File names include timestamps to prevent conflicts
- Original file names are preserved for user reference
