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
            }
        }
    };

    xhr.send();
}
