/**
 * Load sidebar component into the page
 * @param {string} role - The user role (employee, hr, or supervisor)
 */
function loadSidebar(role) {
    // Ensure minimal Firebase is loaded for logout functionality
    ensureFirebase();

    // Get the sidebar file path based on role
    const sidebarPath = `../components/${role}-sidebar.html`;

    // Create an HTTP request to load the sidebar
    const xhr = new XMLHttpRequest();
    xhr.open('GET', sidebarPath, true);

    xhr.onload = function () {
        if (this.status === 200) {
            // Find the sidebar placeholder in the page
            const sidebarPlaceholder = document.getElementById('sidebar-placeholder');

            // Insert the sidebar content
            if (sidebarPlaceholder) {
                sidebarPlaceholder.innerHTML = this.responseText;

                // Add logout functionality after sidebar is loaded
                setupLogoutButton();

                // Load user information after sidebar is loaded
                loadUserInfo();
            }
        }
    };

    xhr.send();
}

/**
 * Ensure Firebase is available for logout functionality
 */
function ensureFirebase() {
    // Check if Firebase is already loaded
    if (typeof firebase === 'undefined') {
        // Load minimal Firebase functionality
        const script = document.createElement('script');
        script.src = '../js/minimal-firebase.js';
        script.onload = function () {
            console.log('Minimal Firebase loader included');
        };
        document.head.appendChild(script);
    }
}

/**
 * Load user information into the sidebar
 */
function loadUserInfo() {
    // Get user information from localStorage
    const userName = localStorage.getItem('userName');
    const userRole = localStorage.getItem('userRole');

    // Update user name in sidebar
    const userNameElement = document.getElementById('sidebar-user-name');
    if (userNameElement) {
        if (userName) {
            userNameElement.textContent = userName;
        } else {
            userNameElement.textContent = 'User';
        }
    }

    // If no user data is found, try to get it from Firebase
    if (!userName && typeof firebase !== 'undefined' && firebase.auth) {
        waitForFirebase(() => {
            const user = firebase.auth().currentUser;
            if (user) {
                // Try to get user data from Firestore
                if (firebase.firestore) {
                    const firestore = firebase.firestore();
                    firestore.collection('employees').doc(user.uid).get()
                        .then(doc => {
                            if (doc.exists) {
                                const userData = doc.data();
                                localStorage.setItem('userName', userData.name);
                                localStorage.setItem('userRole', userData.role);

                                // Update the sidebar with fresh data
                                if (userNameElement) {
                                    userNameElement.textContent = userData.name;
                                }
                            }
                        })
                        .catch(error => {
                            console.error('Error fetching user data:', error);
                        });
                }
            }
        });
    }
}

/**
 * Setup logout button functionality
 */
function setupLogoutButton() {
    const logoutLinks = document.querySelectorAll('.logout-btn');
    logoutLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            handleLogout();
        });
    });
}

/**
 * Wait for Firebase to be available
 */
function waitForFirebase(callback, maxAttempts = 10) {
    let attempts = 0;

    function checkFirebase() {
        attempts++;

        if (typeof firebase !== 'undefined' && firebase.auth) {
            callback();
        } else if (attempts < maxAttempts) {
            setTimeout(checkFirebase, 200);
        } else {
            console.error('Firebase failed to initialize after maximum attempts');
            alert('Error: Unable to initialize authentication. Please refresh the page.');
        }
    }

    checkFirebase();
}

/**
 * Handle user logout
 */
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        waitForFirebase(() => {
            // Sign out from Firebase
            firebase.auth().signOut().then(() => {
                // Clear local storage
                localStorage.clear();
                // Redirect to home page
                window.location.href = '../index.html';
            }).catch((error) => {
                console.error('Sign out error:', error);
                alert('Error signing out. Please try again.');
            });
        });
    }
}
