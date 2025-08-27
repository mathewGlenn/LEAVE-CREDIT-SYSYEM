/**
 * SweetAlert Utility Functions for LCMS
 * Provides standardized alert, confirmation, and notification dialogs
 */

/**
 * Show a success message
 * @param {string} title - The title of the alert
 * @param {string} text - The message text (optional)
 * @param {function} callback - Callback function to execute after closing (optional)
 */
function showSuccessAlert(title, text = '', callback = null) {
    Swal.fire({
        icon: 'success',
        title: title,
        text: text,
        confirmButtonText: 'OK',
        confirmButtonColor: '#4CAF50',
        customClass: {
            popup: 'lcms-alert',
            title: 'lcms-alert-title',
            content: 'lcms-alert-content'
        }
    }).then((result) => {
        if (result.isConfirmed && callback) {
            callback();
        }
    });
}

/**
 * Show an error message
 * @param {string} title - The title of the alert
 * @param {string} text - The error message text (optional)
 * @param {function} callback - Callback function to execute after closing (optional)
 */
function showErrorAlert(title, text = '', callback = null) {
    Swal.fire({
        icon: 'error',
        title: title,
        text: text,
        confirmButtonText: 'OK',
        confirmButtonColor: '#f44336',
        customClass: {
            popup: 'lcms-alert',
            title: 'lcms-alert-title',
            content: 'lcms-alert-content'
        }
    }).then((result) => {
        if (result.isConfirmed && callback) {
            callback();
        }
    });
}

/**
 * Show a warning message
 * @param {string} title - The title of the alert
 * @param {string} text - The warning message text (optional)
 * @param {function} callback - Callback function to execute after closing (optional)
 */
function showWarningAlert(title, text = '', callback = null) {
    Swal.fire({
        icon: 'warning',
        title: title,
        text: text,
        confirmButtonText: 'OK',
        confirmButtonColor: '#ff9800',
        customClass: {
            popup: 'lcms-alert',
            title: 'lcms-alert-title',
            content: 'lcms-alert-content'
        }
    }).then((result) => {
        if (result.isConfirmed && callback) {
            callback();
        }
    });
}

/**
 * Show an info message
 * @param {string} title - The title of the alert
 * @param {string} text - The info message text (optional)
 * @param {function} callback - Callback function to execute after closing (optional)
 */
function showInfoAlert(title, text = '', callback = null) {
    Swal.fire({
        icon: 'info',
        title: title,
        text: text,
        confirmButtonText: 'OK',
        confirmButtonColor: '#2196F3',
        customClass: {
            popup: 'lcms-alert',
            title: 'lcms-alert-title',
            content: 'lcms-alert-content'
        }
    }).then((result) => {
        if (result.isConfirmed && callback) {
            callback();
        }
    });
}

/**
 * Show a confirmation dialog
 * @param {string} title - The title of the confirmation
 * @param {string} text - The confirmation message text (optional)
 * @param {function} onConfirm - Callback function to execute when confirmed
 * @param {function} onCancel - Callback function to execute when cancelled (optional)
 * @param {object} options - Additional options for customization (optional)
 */
function showConfirmationDialog(title, text = '', onConfirm, onCancel = null, options = {}) {
    const defaultOptions = {
        icon: 'question',
        title: title,
        text: text,
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        confirmButtonColor: '#4CAF50',
        cancelButtonColor: '#f44336',
        reverseButtons: true,
        customClass: {
            popup: 'lcms-alert',
            title: 'lcms-alert-title',
            content: 'lcms-alert-content'
        }
    };

    const finalOptions = { ...defaultOptions, ...options };

    Swal.fire(finalOptions).then((result) => {
        if (result.isConfirmed) {
            onConfirm();
        } else if (result.isDismissed && onCancel) {
            onCancel();
        }
    });
}

/**
 * Show a delete confirmation dialog (specific styling for delete actions)
 * @param {string} itemName - The name of the item being deleted
 * @param {function} onConfirm - Callback function to execute when confirmed
 * @param {function} onCancel - Callback function to execute when cancelled (optional)
 */
function showDeleteConfirmation(itemName, onConfirm, onCancel = null) {
    showConfirmationDialog(
        'Delete Confirmation',
        `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
        onConfirm,
        onCancel,
        {
            icon: 'warning',
            confirmButtonText: 'Delete',
            confirmButtonColor: '#f44336'
        }
    );
}

/**
 * Show a logout confirmation dialog
 * @param {function} onConfirm - Callback function to execute when confirmed
 * @param {function} onCancel - Callback function to execute when cancelled (optional)
 */
function showLogoutConfirmation(onConfirm, onCancel = null) {
    showConfirmationDialog(
        'Logout Confirmation',
        'Are you sure you want to logout?',
        onConfirm,
        onCancel,
        {
            icon: 'question',
            confirmButtonText: 'Logout',
            confirmButtonColor: '#ff9800'
        }
    );
}

/**
 * Show a loading dialog
 * @param {string} title - The title of the loading dialog
 * @param {string} text - The loading message text (optional)
 */
function showLoadingDialog(title, text = 'Please wait...') {
    Swal.fire({
        title: title,
        text: text,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        customClass: {
            popup: 'lcms-alert',
            title: 'lcms-alert-title',
            content: 'lcms-alert-content'
        },
        didOpen: () => {
            Swal.showLoading();
        }
    });
}

/**
 * Close any open SweetAlert dialog
 */
function closeDialog() {
    Swal.close();
}

/**
 * Show a toast notification (small notification that appears briefly)
 * @param {string} title - The title of the toast
 * @param {string} icon - The icon type ('success', 'error', 'warning', 'info')
 * @param {number} timer - Time in milliseconds before auto-close (default: 3000)
 */
function showToast(title, icon = 'info', timer = 3000) {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: timer,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
    });

    Toast.fire({
        icon: icon,
        title: title
    });
}

/**
 * Show a form dialog with input fields
 * @param {string} title - The title of the form
 * @param {object} fields - Object containing field definitions
 * @param {function} onSubmit - Callback function to execute with form data
 * @param {function} onCancel - Callback function to execute when cancelled (optional)
 */
function showFormDialog(title, fields, onSubmit, onCancel = null) {
    const formFields = {};

    // Build the HTML for form fields
    let htmlContent = '<div class="lcms-form-fields">';

    Object.keys(fields).forEach(fieldName => {
        const field = fields[fieldName];
        const fieldType = field.type || 'text';
        const fieldLabel = field.label || fieldName;
        const fieldValue = field.value || '';
        const fieldRequired = field.required ? 'required' : '';
        const fieldPlaceholder = field.placeholder || '';

        htmlContent += `
            <div class="swal2-input-group">
                <label for="swal-input-${fieldName}">${fieldLabel}:</label>
                <input 
                    id="swal-input-${fieldName}" 
                    class="swal2-input" 
                    type="${fieldType}" 
                    value="${fieldValue}"
                    placeholder="${fieldPlaceholder}"
                    ${fieldRequired}
                >
            </div>
        `;
    });

    htmlContent += '</div>';

    Swal.fire({
        title: title,
        html: htmlContent,
        showCancelButton: true,
        confirmButtonText: 'Submit',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#4CAF50',
        cancelButtonColor: '#f44336',
        customClass: {
            popup: 'lcms-alert lcms-form-dialog',
            title: 'lcms-alert-title',
            content: 'lcms-alert-content'
        },
        preConfirm: () => {
            const formData = {};
            Object.keys(fields).forEach(fieldName => {
                const input = document.getElementById(`swal-input-${fieldName}`);
                formData[fieldName] = input.value;

                // Basic validation
                if (fields[fieldName].required && !input.value.trim()) {
                    Swal.showValidationMessage(`${fields[fieldName].label || fieldName} is required`);
                    return false;
                }
            });

            return formData;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            onSubmit(result.value);
        } else if (result.isDismissed && onCancel) {
            onCancel();
        }
    });
}

// Export functions for ES6 modules (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showSuccessAlert,
        showErrorAlert,
        showWarningAlert,
        showInfoAlert,
        showConfirmationDialog,
        showDeleteConfirmation,
        showLogoutConfirmation,
        showLoadingDialog,
        closeDialog,
        showToast,
        showFormDialog
    };
}
