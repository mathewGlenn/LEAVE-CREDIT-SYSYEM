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

                // Setup mobile menu functionality
                setupMobileMenu();
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
    // Check if SweetAlert is available
    if (typeof Swal !== 'undefined') {
        // Use SweetAlert for logout confirmation
        showLogoutConfirmation(() => {
            performLogout();
        });
    } else {
        // Fallback to standard confirm dialog
        if (confirm('Are you sure you want to logout?')) {
            performLogout();
        }
    }
}

/**
 * Perform the actual logout process
 */
function performLogout() {
    waitForFirebase(() => {
        // Show loading dialog if SweetAlert is available
        if (typeof Swal !== 'undefined') {
            showLoadingDialog('Logging out', 'Please wait...');
        }

        // Sign out from Firebase
        firebase.auth().signOut().then(() => {
            // Clear local storage
            localStorage.clear();

            // Close any open dialogs
            if (typeof Swal !== 'undefined') {
                closeDialog();
            }

            // Redirect to home page
            window.location.href = '../index.html';
        }).catch((error) => {
            console.error('Sign out error:', error);

            // Close loading dialog and show error
            if (typeof Swal !== 'undefined') {
                closeDialog();
                showErrorAlert('Logout Error', 'Error signing out. Please try again.');
            } else {
                alert('Error signing out. Please try again.');
            }
        });
    });
}

/**
 * Setup mobile menu functionality
 */
function setupMobileMenu() {
    // Create mobile menu toggle button if it doesn't exist
    if (window.innerWidth <= 768 && !document.querySelector('.mobile-menu-toggle')) {
        const toggleButton = document.createElement('button');
        toggleButton.className = 'mobile-menu-toggle';
        toggleButton.innerHTML = '☰';
        toggleButton.setAttribute('aria-label', 'Toggle menu');

        // Add click event to toggle sidebar
        toggleButton.addEventListener('click', function () {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                sidebar.classList.toggle('mobile-open');
            }
        });

        // Insert the button at the beginning of the body
        document.body.insertBefore(toggleButton, document.body.firstChild);
    }

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function (event) {
        if (window.innerWidth <= 768) {
            const sidebar = document.querySelector('.sidebar');
            const toggleButton = document.querySelector('.mobile-menu-toggle');

            if (sidebar && sidebar.classList.contains('mobile-open')) {
                // If click is outside sidebar and not on toggle button
                if (!sidebar.contains(event.target) && event.target !== toggleButton) {
                    sidebar.classList.remove('mobile-open');
                }
            }
        }
    });

    // Handle window resize
    window.addEventListener('resize', function () {
        const sidebar = document.querySelector('.sidebar');
        const toggleButton = document.querySelector('.mobile-menu-toggle');

        if (window.innerWidth > 768) {
            // Desktop view - remove mobile classes and toggle button
            if (sidebar) {
                sidebar.classList.remove('mobile-open');
            }
            if (toggleButton) {
                toggleButton.style.display = 'none';
            }
        } else {
            // Mobile view - show toggle button
            if (toggleButton) {
                toggleButton.style.display = 'block';
            }
        }
    });
}
