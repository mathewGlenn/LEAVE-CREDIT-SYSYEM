// Authentication utility functions for LCMS

// Check if user is authenticated and has the right role
function checkAuthAndRole(requiredRole) {
    firebase.auth().onAuthStateChanged((user) => {
        if (!user) {
            // User is not authenticated, redirect to login
            window.location.href = `../login.html?role=${requiredRole}`;
            return;
        }

        // Check if the user's stored role matches the required role
        const userRole = localStorage.getItem('userRole');
        if (userRole !== requiredRole) {
            // User role doesn't match, redirect to appropriate login
            localStorage.clear();
            window.location.href = `../login.html?role=${requiredRole}`;
            return;
        }

        console.log(`User authenticated as ${requiredRole}:`, user.email);
    });
}

// Check authentication for pages in the root directory
function checkAuthAndRoleRoot(requiredRole) {
    firebase.auth().onAuthStateChanged((user) => {
        if (!user) {
            // User is not authenticated, redirect to login
            window.location.href = `login.html?role=${requiredRole}`;
            return;
        }

        // Check if the user's stored role matches the required role
        const userRole = localStorage.getItem('userRole');
        if (userRole !== requiredRole) {
            // User role doesn't match, redirect to appropriate login
            localStorage.clear();
            window.location.href = `login.html?role=${requiredRole}`;
            return;
        }

        console.log(`User authenticated as ${requiredRole}:`, user.email);
    });
}

// Sign out function
function signOut() {
    // Check if SweetAlert is available
    if (typeof Swal !== 'undefined') {
        // Use SweetAlert for logout confirmation
        showLogoutConfirmation(() => {
            performSignOut();
        });
    } else {
        // Fallback to standard confirm dialog
        if (confirm('Are you sure you want to logout?')) {
            performSignOut();
        }
    }
}

// Sign out function for root directory pages
function signOutRoot() {
    // Check if SweetAlert is available
    if (typeof Swal !== 'undefined') {
        // Use SweetAlert for logout confirmation
        showLogoutConfirmation(() => {
            performSignOutRoot();
        });
    } else {
        // Fallback to standard confirm dialog
        if (confirm('Are you sure you want to logout?')) {
            performSignOutRoot();
        }
    }
}

// Perform actual sign out process
function performSignOut() {
    // Show loading dialog if SweetAlert is available
    if (typeof Swal !== 'undefined') {
        showLoadingDialog('Logging out', 'Please wait...');
    }

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
}

// Perform actual sign out process for root directory
function performSignOutRoot() {
    // Show loading dialog if SweetAlert is available
    if (typeof Swal !== 'undefined') {
        showLoadingDialog('Logging out', 'Please wait...');
    }

    firebase.auth().signOut().then(() => {
        // Clear local storage
        localStorage.clear();

        // Close any open dialogs
        if (typeof Swal !== 'undefined') {
            closeDialog();
        }

        // Redirect to home page
        window.location.href = 'index.html';
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
}

// Get current user info
function getCurrentUser() {
    return firebase.auth().currentUser;
}

// Get user role from localStorage
function getUserRole() {
    return localStorage.getItem('userRole');
}

// Get user email from localStorage
function getUserEmail() {
    return localStorage.getItem('userEmail');
}

// Check if user has specific role (for role-based features)
function hasRole(role) {
    const userRole = getUserRole();
    return userRole === role;
}

// Check if user is HR (superadmin)
function isHR() {
    return hasRole('hr');
}

// Check if user is Supervisor
function isSupervisor() {
    return hasRole('supervisor');
}

// Check if user is Employee
function isEmployee() {
    return hasRole('employee');
}
