# Publishing the LCMS Project on Firebase Hosting

This guide will walk you through the steps to publish your Leave Credit Management System (LCMS) project on Firebase Hosting.

## Prerequisites

1. **Node.js and npm**: Download and install from [nodejs.org](https://nodejs.org/)
2. **Firebase CLI**: Install using npm with the following command:
   ```
   npm install -g firebase-tools
   ```

## Step 1: Login to Firebase

1. Open your command prompt or terminal
2. Run the following command to log in to Firebase:
   ```
   firebase login
   ```
3. This will open a browser window asking you to authenticate with your Google account that has access to the Firebase project

## Step 2: Verify Firebase Configuration Files

Ensure the following files exist in your project root directory:

- `firebase.json` - Contains Firebase hosting configuration
- `.firebaserc` - Contains project ID mapping
- `js/firebase-init.js` - Contains Firebase SDK initialization

## Step 3: Test Your App Locally

Before deploying, you can test how your app will work on Firebase Hosting locally:

```
firebase serve
```

This will start a local server, typically at `http://localhost:5000`, where you can preview your app.

## Step 4: Deploy to Firebase Hosting

When you're ready to deploy your app:

1. Run the following command from your project's root directory:

   ```
   firebase deploy --only hosting
   ```

2. Wait for the deployment to complete. You'll see a message with the URL of your deployed site, typically:

   ```
   ✔ Deploy complete!

   Project Console: https://console.firebase.google.com/project/lcs-isu/overview
   Hosting URL: https://lcs-isu.web.app
   ```

3. Visit the Hosting URL to see your live application.

## Step 5: Custom Domain Setup (Optional)

If you want to use a custom domain instead of the default Firebase domain:

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to Hosting in the left menu
4. Click "Add custom domain" and follow the instructions

## Troubleshooting Common Issues

### Issue: "Error: HTTP Error: 401, Request had invalid authentication credentials"

- Run `firebase logout` followed by `firebase login` to re-authenticate

### Issue: "Error: Failed to get Firebase project lcs-isu"

- Check that your `.firebaserc` file has the correct project ID
- Verify that you have access to the Firebase project in the Firebase Console

### Issue: Files not updating after deployment

- Try clearing your browser cache
- Use `firebase deploy --only hosting --force` to force a clean deployment

### Issue: CSS or JavaScript not loading

- Check browser console for errors
- Ensure the paths to your files are correct in your HTML

## Next Steps

After successfully deploying your basic application, you may want to:

1. Set up Firebase Authentication to handle user login
2. Configure Firestore Database for storing user and leave data
3. Implement Cloud Functions for server-side processing

Refer to the [Firebase documentation](https://firebase.google.com/docs) for detailed guides on these features.
