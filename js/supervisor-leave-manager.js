// Supervisor Leave Management for LCMS
// Handles displaying and managing employee leave requests for supervisors

class SupervisorLeaveManager {
    constructor() {
        this.statusMapping = {
            'pending_supervisor': 'Pending Supervisor',
            'pending_hr': 'Pending HR',
            'approved': 'Approved',
            'rejected_supervisor': 'Rejected by Supervisor',
            'rejected_hr': 'Rejected by HR',
            'cancelled': 'Cancelled'
        };

        this.leaveTypeMapping = {
            'vacation': 'Regular Leave',
            'sick': 'Sick Leave',
            'personal': 'Special Privilege Leave',
            'emergency': 'Emergency Leave',
            'maternity': 'Maternity/Paternity Leave',
            'service': 'Service Incentive Leave'
        };
    }

    // Get current authenticated user
    getCurrentUser() {
        return new Promise((resolve, reject) => {
            const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
                unsubscribe();
                resolve(user);
            }, reject);
        });
    }

    // Get supervisor data
    async getSupervisorData(uid) {
        try {
            // First try supervisors collection
            let userDoc = await firebase.firestore().collection('supervisors').doc(uid).get();

            if (userDoc.exists) {
                return userDoc.data();
            }

            // Fallback to employees collection
            userDoc = await firebase.firestore().collection('employees').doc(uid).get();

            if (userDoc.exists) {
                return userDoc.data();
            } else {
                throw new Error('Supervisor profile not found. Please contact administrator.');
            }
        } catch (error) {
            console.error('Error fetching supervisor data:', error);
            throw error;
        }
    }

    // Get pending leave requests for employees in supervisor's department
    async getPendingEmployeeRequests(supervisorDepartment) {
        try {
            const snapshot = await firebase.firestore()
                .collection('leaveRequests')
                .where('department', '==', supervisorDepartment)
                .where('status', '==', 'pending_supervisor')
                .orderBy('createdAt', 'desc')
                .get();

            const leaveRequests = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                leaveRequests.push({
                    id: doc.id,
                    ...data,
                    statusText: this.statusMapping[data.status] || data.status,
                    leaveTypeText: this.leaveTypeMapping[data.leaveType] || data.leaveType
                });
            });

            return leaveRequests;
        } catch (error) {
            console.error('Error fetching pending employee requests:', error);
            throw error;
        }
    }

    // Get approved leave requests for employees in supervisor's department
    async getApprovedEmployeeRequests(supervisorDepartment) {
        try {
            // Query for requests that have supervisor approval as approved
            const snapshot = await firebase.firestore()
                .collection('leaveRequests')
                .where('department', '==', supervisorDepartment)
                .orderBy('createdAt', 'desc')
                .get();

            const leaveRequests = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                // Filter for requests where supervisor has approved
                if (data.supervisorApproval && data.supervisorApproval.status === 'approved') {
                    leaveRequests.push({
                        id: doc.id,
                        ...data,
                        statusText: this.statusMapping[data.status] || data.status,
                        leaveTypeText: this.leaveTypeMapping[data.leaveType] || data.leaveType
                    });
                }
            });

            return leaveRequests;
        } catch (error) {
            console.error('Error fetching approved employee requests:', error);
            throw error;
        }
    }

    // Format date for display
    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Format timestamp for display
    formatTimestamp(timestamp) {
        if (!timestamp) return '';
        let date;
        if (timestamp.toDate) {
            date = timestamp.toDate();
        } else {
            date = new Date(timestamp);
        }
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Get status badge CSS class
    getStatusBadgeClass(status) {
        switch (status) {
            case 'pending_supervisor':
            case 'pending_hr':
                return 'status-pending';
            case 'approved':
                return 'status-approved';
            case 'rejected_supervisor':
            case 'rejected_hr':
                return 'status-rejected';
            case 'cancelled':
                return 'status-cancelled';
            default:
                return 'status-pending';
        }
    }

    // Display pending leave requests
    async displayPendingRequests() {
        try {
            const user = await this.getCurrentUser();
            if (!user) {
                this.showError('Please log in to view leave requests.');
                return;
            }

            const supervisorData = await this.getSupervisorData(user.uid);
            const tbody = document.querySelector('.request-table tbody');
            if (!tbody) {
                console.error('Request table not found');
                return;
            }

            // Show loading
            tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 20px;">Loading...</td></tr>';

            const leaveRequests = await this.getPendingEmployeeRequests(supervisorData.department);

            if (leaveRequests.length === 0) {
                tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 20px; color: #666;">No pending leave requests found.</td></tr>';
                return;
            }

            // Clear loading and display requests
            tbody.innerHTML = '';
            leaveRequests.forEach(request => {
                const row = this.createPendingRequestRow(request);
                tbody.appendChild(row);
            });

            // Initialize action buttons
            this.initializeActionButtons();

        } catch (error) {
            console.error('Error displaying pending requests:', error);
            this.showError('Error loading leave requests: ' + error.message);
        }
    }

    // Display approved leave requests
    async displayApprovedRequests() {
        try {
            const user = await this.getCurrentUser();
            if (!user) {
                this.showError('Please log in to view approved leaves.');
                return;
            }

            const supervisorData = await this.getSupervisorData(user.uid);
            const tbody = document.querySelector('.approved-table tbody');
            if (!tbody) {
                console.error('Approved table not found');
                return;
            }

            // Show loading
            tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 20px;">Loading...</td></tr>';

            const leaveRequests = await this.getApprovedEmployeeRequests(supervisorData.department);

            if (leaveRequests.length === 0) {
                tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 20px; color: #666;">No approved leave requests found.</td></tr>';
                return;
            }

            // Clear loading and display requests
            tbody.innerHTML = '';
            leaveRequests.forEach(request => {
                const row = this.createApprovedRequestRow(request);
                tbody.appendChild(row);
            });

        } catch (error) {
            console.error('Error displaying approved requests:', error);
            this.showError('Error loading approved leaves: ' + error.message);
        }
    }

    // Create table row for pending requests
    createPendingRequestRow(request) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${request.employeeName}</td>
            <td>${request.department}</td>
            <td>${request.leaveTypeText}</td>
            <td>${this.formatDate(request.startDate)}</td>
            <td>${this.formatDate(request.endDate)}</td>
            <td>${request.numberOfDays}</td>
            <td class="reason-cell" title="${request.reasonNotes}">${this.truncateText(request.reasonNotes, 30)}</td>
            <td><span class="status-badge ${this.getStatusBadgeClass(request.status)}">${request.statusText}</span></td>
            <td class="action-buttons">
                <button class="approve-btn" data-request-id="${request.id}">Approve</button>
                <button class="reject-btn" data-request-id="${request.id}">Reject</button>
            </td>
        `;

        // Add click handler for row details (excluding action buttons)
        row.addEventListener('click', (e) => {
            if (!e.target.classList.contains('approve-btn') && !e.target.classList.contains('reject-btn')) {
                this.showRequestDetails(request);
            }
        });

        return row;
    }

    // Create table row for approved requests
    createApprovedRequestRow(request) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${request.employeeName}</td>
            <td>${request.department}</td>
            <td>${request.leaveTypeText}</td>
            <td>${this.formatDate(request.startDate)}</td>
            <td>${this.formatDate(request.endDate)}</td>
            <td>${request.numberOfDays}</td>
            <td class="reason-cell" title="${request.reasonNotes}">${this.truncateText(request.reasonNotes, 30)}</td>
            <td>${this.formatTimestamp(request.supervisorApproval.approvedAt)}</td>
            <td><span class="status-badge ${this.getStatusBadgeClass(request.status)}">${request.statusText}</span></td>
        `;

        // Add click handler for row details
        row.style.cursor = 'pointer';
        row.addEventListener('click', () => this.showRequestDetails(request));

        return row;
    }

    // Truncate text for display
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    // Initialize action buttons for approve/reject
    initializeActionButtons() {
        const approveButtons = document.querySelectorAll('.approve-btn');
        const rejectButtons = document.querySelectorAll('.reject-btn');

        approveButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const requestId = button.getAttribute('data-request-id');
                this.showApprovalDialog(requestId, 'approve');
            });
        });

        rejectButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const requestId = button.getAttribute('data-request-id');
                this.showApprovalDialog(requestId, 'reject');
            });
        });
    }

    // Show approval/rejection dialog
    showApprovalDialog(requestId, action) {
        const title = action === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request';
        const confirmText = action === 'approve' ? 'Approve' : 'Reject';
        const placeholder = `Enter ${action === 'approve' ? 'approval' : 'rejection'} comments (optional)`;

        Swal.fire({
            title: title,
            input: 'textarea',
            inputPlaceholder: placeholder,
            showCancelButton: true,
            confirmButtonText: confirmText,
            confirmButtonColor: action === 'approve' ? '#28a745' : '#dc3545',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                this.processLeaveRequest(requestId, action, result.value || '');
            }
        });
    }

    // Process leave request approval/rejection
    async processLeaveRequest(requestId, action, comments) {
        try {
            const user = await this.getCurrentUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            const updateData = {
                status: action === 'approve' ? 'pending_hr' : 'rejected_supervisor',
                supervisorApproval: {
                    status: action === 'approve' ? 'approved' : 'rejected',
                    approvedBy: user.uid,
                    approvedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    comments: comments
                },
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            await firebase.firestore().collection('leaveRequests').doc(requestId).update(updateData);

            const successMessage = action === 'approve'
                ? 'Leave request approved successfully!'
                : 'Leave request rejected successfully!';

            showSuccessAlert('Success', successMessage);

            // Refresh the display
            this.displayPendingRequests();

        } catch (error) {
            console.error('Error processing leave request:', error);
            showErrorAlert('Error', 'Failed to process leave request: ' + error.message);
        }
    }

    // Show request details in a modal
    showRequestDetails(request) {
        let detailsHtml = `
            <div style="text-align: left;">
                <p><strong>Employee:</strong> ${request.employeeName}</p>
                <p><strong>Email:</strong> ${request.employeeEmail}</p>
                <p><strong>Department:</strong> ${request.department}</p>
                <p><strong>Designation:</strong> ${request.designation}</p>
                <p><strong>Leave Type:</strong> ${request.leaveTypeText}</p>
                <p><strong>Start Date:</strong> ${this.formatDate(request.startDate)}</p>
                <p><strong>End Date:</strong> ${this.formatDate(request.endDate)}</p>
                <p><strong>Number of Days:</strong> ${request.numberOfDays}</p>
                <p><strong>Reason:</strong> ${request.reasonNotes}</p>
                <p><strong>Status:</strong> ${request.statusText}</p>
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

    // Show error message
    showError(message) {
        const tbody = document.querySelector('.request-table tbody, .approved-table tbody');
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 20px; color: #e74c3c;">${message}</td></tr>`;
        }
    }
}

// Export for global use
window.SupervisorLeaveManager = SupervisorLeaveManager;
