// Supervisor Leave Display Manager for LCMS
// Handles displaying supervisor leave requests in status and history pages
// Extends the base functionality to handle supervisor-specific requirements

class SupervisorLeaveDisplayManager extends LeaveDisplayManager {
    constructor() {
        super();
    }

    // Override getUserData to check supervisor collection first
    async getUserData(uid) {
        try {
            // First try supervisors collection
            let userDoc = await firebase.firestore().collection('supervisors').doc(uid).get();

            if (userDoc.exists) {
                const userData = userDoc.data();
                userData.role = 'supervisor';
                return userData;
            }

            // Fallback to employees collection
            userDoc = await firebase.firestore().collection('employees').doc(uid).get();

            if (userDoc.exists) {
                const userData = userDoc.data();
                userData.role = 'employee';
                return userData;
            } else {
                throw new Error('User profile not found. Please contact administrator or complete your profile setup.');
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            throw error;
        }
    }

    // Override status mapping to include supervisor-specific statuses
    getStatusText(status, userRole) {
        const statusMap = {
            'pending_supervisor': userRole === 'supervisor' ? 'Pending HR (Supervisor Auto-Approved)' : 'Pending Supervisor',
            'pending_hr': 'Pending HR',
            'approved': 'Approved',
            'rejected_supervisor': 'Rejected by Supervisor',
            'rejected_hr': 'Rejected by HR',
            'cancelled': 'Cancelled'
        };

        return statusMap[status] || status;
    }

    // Override createStatusRow to show supervisor-specific information
    createStatusRow(request) {
        const row = document.createElement('tr');

        // Determine the user's role for status display
        const userRole = request.role || 'employee';
        const statusText = this.getStatusText(request.status, userRole);

        row.innerHTML = `
            <td>${request.leaveTypeText}</td>
            <td>${request.numberOfDays}</td>
            <td>${request.reasonNotes}</td>
            <td>${this.formatDate(request.startDate)}</td>
            <td><span class="status-badge ${this.getStatusBadgeClass(request.status)}">${statusText}</span></td>
        `;

        // Add click handler for row details
        row.style.cursor = 'pointer';
        row.addEventListener('click', () => this.showRequestDetails(request));

        return row;
    }

    // Override createHistoryRow to show supervisor-specific information
    createHistoryRow(request) {
        const row = document.createElement('tr');

        // Determine the user's role for status display
        const userRole = request.role || 'employee';
        const statusText = this.getStatusText(request.status, userRole);

        row.innerHTML = `
            <td>${request.leaveTypeText}</td>
            <td>${request.numberOfDays}</td>
            <td>${request.reasonNotes}</td>
            <td>${this.formatDate(request.startDate)}</td>
            <td>${this.formatDate(request.endDate)}</td>
            <td><span class="status-badge ${this.getStatusBadgeClass(request.status)}">${statusText}</span></td>
        `;

        // Add click handler for row details
        row.style.cursor = 'pointer';
        row.addEventListener('click', () => this.showRequestDetails(request));

        return row;
    }

    // Enhanced error handling with supervisor-specific messages
    showError(message) {
        const tbody = document.querySelector('.status-table tbody');
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px; color: #e74c3c;">
                ${message}<br>
                <small style="color: #666;">If you're a supervisor, ensure your profile is set up in the supervisors collection.</small>
            </td></tr>`;
        }
    }

    // Show success messages using SweetAlert
    showSuccess(title, message) {
        showSuccessAlert(title, message);
    }

    // Show info messages using SweetAlert
    showInfo(title, message) {
        showInfoAlert(title, message);
    }

    // Enhanced request details with supervisor-specific information
    showRequestDetails(request) {
        const userRole = request.role || 'employee';
        const statusText = this.getStatusText(request.status, userRole);

        let detailsHtml = `
            <div style="text-align: left;">
                <p><strong>Leave Type:</strong> ${request.leaveTypeText}</p>
                <p><strong>Start Date:</strong> ${this.formatDate(request.startDate)}</p>
                <p><strong>End Date:</strong> ${this.formatDate(request.endDate)}</p>
                <p><strong>Number of Days:</strong> ${request.numberOfDays}</p>
                <p><strong>Reason:</strong> ${request.reasonNotes}</p>
                <p><strong>Status:</strong> ${statusText}</p>
                <p><strong>Submitted:</strong> ${this.formatTimestamp(request.createdAt)}</p>
        `;

        // Add supervisor approval details
        if (request.supervisorApproval) {
            detailsHtml += `<p><strong>Supervisor Approval:</strong> ${request.supervisorApproval.status}`;
            if (request.supervisorApproval.approvedAt) {
                detailsHtml += ` (${this.formatTimestamp(request.supervisorApproval.approvedAt)})`;
            }
            if (request.supervisorApproval.comments) {
                detailsHtml += `<br><em>Comments: ${request.supervisorApproval.comments}</em>`;
            }
            detailsHtml += `</p>`;
        }

        // Add HR approval details
        if (request.hrApproval) {
            detailsHtml += `<p><strong>HR Approval:</strong> ${request.hrApproval.status}`;
            if (request.hrApproval.approvedAt) {
                detailsHtml += ` (${this.formatTimestamp(request.hrApproval.approvedAt)})`;
            }
            if (request.hrApproval.comments) {
                detailsHtml += `<br><em>Comments: ${request.hrApproval.comments}</em>`;
            }
            detailsHtml += `</p>`;
        }

        // Add supporting documents if any
        if (request.supportingDocuments && request.supportingDocuments.length > 0) {
            detailsHtml += `<p><strong>Supporting Documents:</strong></p><ul>`;
            request.supportingDocuments.forEach(doc => {
                detailsHtml += `<li><a href="${doc.url}" target="_blank">${doc.name}</a></li>`;
            });
            detailsHtml += `</ul>`;
        }

        detailsHtml += `</div>`;

        Swal.fire({
            title: 'Leave Request Details',
            html: detailsHtml,
            width: '600px',
            confirmButtonText: 'Close',
            confirmButtonColor: '#c7ecee'
        });
    }
}

// Export for global use
window.SupervisorLeaveDisplayManager = SupervisorLeaveDisplayManager;
