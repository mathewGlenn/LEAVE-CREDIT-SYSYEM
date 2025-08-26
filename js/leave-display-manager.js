// Leave Display Manager for LCMS
// Handles displaying leave requests in status and history pages

class LeaveDisplayManager {
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

    // Get pending/active leave requests for status page
    async getPendingLeaveRequests(userId) {
        try {
            const snapshot = await firebase.firestore()
                .collection('leaveRequests')
                .where('employeeId', '==', userId)
                .where('status', 'in', ['pending_supervisor', 'pending_hr', 'approved'])
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
            console.error('Error fetching pending leave requests:', error);
            throw error;
        }
    }

    // Get completed leave requests for history page
    async getCompletedLeaveRequests(userId) {
        try {
            const snapshot = await firebase.firestore()
                .collection('leaveRequests')
                .where('employeeId', '==', userId)
                .where('status', 'in', ['approved', 'rejected_supervisor', 'rejected_hr', 'cancelled'])
                .orderBy('createdAt', 'desc')
                .get();

            const leaveRequests = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                // Only include requests that have been processed or completed
                if (data.status === 'approved' || data.status.includes('rejected') || data.status === 'cancelled') {
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
            console.error('Error fetching completed leave requests:', error);
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

    // Display leave requests in status page
    async displayLeaveStatus() {
        try {
            const user = await this.getCurrentUser();
            if (!user) {
                this.showError('Please log in to view your leave status.');
                return;
            }

            const tbody = document.querySelector('.status-table tbody');
            if (!tbody) {
                console.error('Status table not found');
                return;
            }

            // Show loading
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">Loading...</td></tr>';

            const leaveRequests = await this.getPendingLeaveRequests(user.uid);

            if (leaveRequests.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px; color: #666;">No pending leave requests found.</td></tr>';
                return;
            }

            // Clear loading and display requests
            tbody.innerHTML = '';
            leaveRequests.forEach(request => {
                const row = this.createStatusRow(request);
                tbody.appendChild(row);
            });

        } catch (error) {
            console.error('Error displaying leave status:', error);
            this.showError('Error loading leave status: ' + error.message);
        }
    }

    // Display leave requests in history page
    async displayLeaveHistory() {
        try {
            const user = await this.getCurrentUser();
            if (!user) {
                this.showError('Please log in to view your leave history.');
                return;
            }

            const tbody = document.querySelector('.status-table tbody');
            if (!tbody) {
                console.error('History table not found');
                return;
            }

            // Show loading
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">Loading...</td></tr>';

            const leaveRequests = await this.getCompletedLeaveRequests(user.uid);

            if (leaveRequests.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #666;">No completed leave requests found.</td></tr>';
                return;
            }

            // Clear loading and display requests
            tbody.innerHTML = '';
            leaveRequests.forEach(request => {
                const row = this.createHistoryRow(request);
                tbody.appendChild(row);
            });

        } catch (error) {
            console.error('Error displaying leave history:', error);
            this.showError('Error loading leave history: ' + error.message);
        }
    }

    // Create table row for status page
    createStatusRow(request) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${request.leaveTypeText}</td>
            <td>${request.numberOfDays}</td>
            <td>${request.reasonNotes}</td>
            <td>${this.formatDate(request.startDate)}</td>
            <td><span class="status-badge ${this.getStatusBadgeClass(request.status)}">${request.statusText}</span></td>
        `;

        // Add click handler for row details
        row.style.cursor = 'pointer';
        row.addEventListener('click', () => this.showRequestDetails(request));

        return row;
    }

    // Create table row for history page
    createHistoryRow(request) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${request.leaveTypeText}</td>
            <td>${request.numberOfDays}</td>
            <td>${request.reasonNotes}</td>
            <td>${this.formatDate(request.startDate)}</td>
            <td>${this.formatDate(request.endDate)}</td>
            <td><span class="status-badge ${this.getStatusBadgeClass(request.status)}">${request.statusText}</span></td>
        `;

        // Add click handler for row details
        row.style.cursor = 'pointer';
        row.addEventListener('click', () => this.showRequestDetails(request));

        return row;
    }

    // Show request details in a modal or alert
    showRequestDetails(request) {
        // Navigate to the details page with the request ID
        window.location.href = `leave-details.html?id=${request.id}`;
    }

    // Show error message
    showError(message) {
        const tbody = document.querySelector('.status-table tbody');
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px; color: #e74c3c;">${message}</td></tr>`;
        }
    }

    // Cancel leave request (for pending requests)
    async cancelLeaveRequest(requestId) {
        try {
            if (!confirm('Are you sure you want to cancel this leave request?')) {
                return;
            }

            await firebase.firestore().collection('leaveRequests').doc(requestId).update({
                status: 'cancelled',
                cancellationReason: 'Cancelled by employee',
                cancelledAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            alert('Leave request cancelled successfully!');

            // Refresh the display
            if (window.location.pathname.includes('leave status')) {
                this.displayLeaveStatus();
            }
        } catch (error) {
            console.error('Error cancelling leave request:', error);
            alert('Error cancelling leave request: ' + error.message);
        }
    }
}

// Export for global use
window.LeaveDisplayManager = LeaveDisplayManager;
