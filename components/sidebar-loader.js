/**
 * Load sidebar component into the page
 * @param {string} role - The user role (employee, hr, or supervisor)
 */
function loadSidebar(role) {
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
            }
        }
    };

    xhr.send();
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
 * Handle user logout
 */
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
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
    }
}
