// Minimal Firebase initialization for pages that need logout functionality
// This script ensures Firebase is available for logout operations

// Check if Firebase is already loaded
if (typeof firebase === 'undefined') {
    // If Firebase is not loaded, load it dynamically
    function loadFirebaseScript(src, callback) {
        const script = document.createElement('script');
        script.src = src;
        script.onload = callback;
        script.onerror = function () {
            console.error('Failed to load Firebase script:', src);
        };
        document.head.appendChild(script);
    }

    // Load Firebase scripts in sequence
    loadFirebaseScript('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js', function () {
        loadFirebaseScript('https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js', function () {
            // Load firebase configuration
            loadFirebaseScript('../js/firebase-init.js', function () {
                console.log('Firebase loaded dynamically for logout functionality');
            });
        });
    });
} else {
    console.log('Firebase already loaded');
}
