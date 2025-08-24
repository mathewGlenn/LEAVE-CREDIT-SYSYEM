// Firebase configuration and initialization for direct HTML inclusion

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDdTbk0CANX3PlQGiMn0z6d4PdRplzB2EU",
    authDomain: "lcs-isu.firebaseapp.com",
    projectId: "lcs-isu",
    storageBucket: "lcs-isu.firebasestorage.app",
    messagingSenderId: "590058145204",
    appId: "1:590058145204:web:f108234a96002556dc9ee1",
    measurementId: "G-5ZP6KXGB20"
};

// Initialize Firebase
// Using compat version for direct browser usage
const app = firebase.initializeApp(firebaseConfig);
const analytics = firebase.analytics();

// Initialize Firebase Auth
const auth = firebase.auth();

// Log initialization
console.log("Firebase initialized successfully");
console.log("Firebase Auth initialized");