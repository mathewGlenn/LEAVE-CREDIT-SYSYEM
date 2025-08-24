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

        // Display user info in the sidebar if element exists
        displayUserInfo(user, userRole);
    });
}

// Display user information in the sidebar
function displayUserInfo(user, role) {
    const userInfoElement = document.getElementById('user-info');
    if (userInfoElement) {
        userInfoElement.innerHTML = `
            <div class="user-details">
                <div class="user-email">${user.email}</div>
                <div class="user-role">${role.toUpperCase()}</div>
            </div>
        `;
    }
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
    if (confirm('Are you sure you want to logout?')) {
        firebase.auth().signOut().then(() => {
            // Clear local storage
            localStorage.clear();
            // Redirect to home page
            window.location.href = '../index.html';
        }).catch((error) => {
            console.error('Sign out error:', error);
            alert('Error signing out. Please try again.');
        });
    }
}

// Sign out function for root directory pages
function signOutRoot() {
    if (confirm('Are you sure you want to logout?')) {
        firebase.auth().signOut().then(() => {
            // Clear local storage
            localStorage.clear();
            // Redirect to home page
            window.location.href = 'index.html';
        }).catch((error) => {
            console.error('Sign out error:', error);
            alert('Error signing out. Please try again.');
        });
    }
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
