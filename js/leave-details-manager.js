// Leave Details Manager for LCMS
// Handles viewing, editing, and cancelling leave requests

class LeaveDetailsManager {
    constructor() {
        this.currentRequest = null;
        this.originalRequest = null;
        this.isEditing = false;
        this.newFiles = [];
        this.filesToRemove = [];

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

    // Initialize the page
    async initializePage() {
        try {
            // Get request ID from URL parameters
            const urlParams = new URLSearchParams(window.location.search);
            const requestId = urlParams.get('id');

            if (!requestId) {
                this.showError('No request ID provided');
                return;
            }

            // Check authentication
            const user = await this.getCurrentUser();
            if (!user) {
                this.showError('Please log in to view this request');
                return;
            }

            // Load the request
            await this.loadRequestDetails(requestId, user.uid);

            // Set up event listeners
            this.setupEventListeners();

        } catch (error) {
            console.error('Error initializing page:', error);
            this.showError('Error loading page: ' + error.message);
        }
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

    // Load request details from Firestore
    async loadRequestDetails(requestId, userId) {
        try {
            const doc = await firebase.firestore().collection('leaveRequests').doc(requestId).get();

            if (!doc.exists) {
                this.showError('Request not found');
                return;
            }

            const data = doc.data();

            // Verify this request belongs to the current user
            if (data.employeeId !== userId) {
                this.showError('You do not have permission to view this request');
                return;
            }

            this.currentRequest = {
                id: requestId,
                ...data
            };

            this.originalRequest = JSON.parse(JSON.stringify(this.currentRequest));

            this.displayRequestInfo();
            this.populateForm();
            this.displayApprovalHistory();

        } catch (error) {
            console.error('Error loading request:', error);
            this.showError('Error loading request: ' + error.message);
        }
    }

    // Display request information
    displayRequestInfo() {
        const infoDiv = document.getElementById('requestInfo');
        const formDiv = document.getElementById('detailsForm');

        if (!this.currentRequest) {
            infoDiv.innerHTML = '<div class="error-message">Failed to load request details</div>';
            return;
        }

        const statusText = this.statusMapping[this.currentRequest.status] || this.currentRequest.status;
        const leaveTypeText = this.leaveTypeMapping[this.currentRequest.leaveType] || this.currentRequest.leaveType;

        infoDiv.innerHTML = `
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Request ID</div>
                    <div class="info-value">${this.currentRequest.id}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Status</div>
                    <div class="info-value">
                        <span class="status-badge ${this.getStatusBadgeClass(this.currentRequest.status)}">${statusText}</span>
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-label">Type of Leave</div>
                    <div class="info-value">${leaveTypeText}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Duration</div>
                    <div class="info-value">${this.currentRequest.numberOfDays} day(s)</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Start Date</div>
                    <div class="info-value">${this.formatDate(this.currentRequest.startDate)}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">End Date</div>
                    <div class="info-value">${this.formatDate(this.currentRequest.endDate)}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Submitted</div>
                    <div class="info-value">${this.formatTimestamp(this.currentRequest.createdAt)}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Reason</div>
                    <div class="info-value">${this.currentRequest.reasonNotes}</div>
                </div>
            </div>
        `;

        formDiv.style.display = 'block';

        // Show/hide buttons based on status
        this.updateButtonVisibility();
    }

    // Populate the form with current data
    populateForm() {
        document.getElementById('leaveType').value = this.currentRequest.leaveType;
        document.getElementById('startDate').value = this.currentRequest.startDate;
        document.getElementById('endDate').value = this.currentRequest.endDate;
        document.getElementById('numberOfDays').value = this.currentRequest.numberOfDays;
        document.getElementById('reasonNotes').value = this.currentRequest.reasonNotes;

        // Display current files
        this.displayCurrentFiles();

        // Disable form initially and hide supporting docs upload
        this.setFormEnabled(false);
    }

    // Display current supporting documents
    displayCurrentFiles() {
        const currentFilesDiv = document.getElementById('currentFiles');

        if (!this.currentRequest.supportingDocuments || this.currentRequest.supportingDocuments.length === 0) {
            currentFilesDiv.innerHTML = '<p style="color: #666; font-style: italic;">No supporting documents</p>';
            return;
        }

        let filesHTML = '<h4>Current Documents:</h4>';
        this.currentRequest.supportingDocuments.forEach((doc, index) => {
            filesHTML += `
                <div class="file-item" data-index="${index}">
                    <span class="file-name">${doc.name}</span>
                    <div class="file-actions">
                        <a href="${doc.url}" target="_blank" download="${doc.name}" class="file-action-btn download">Download</a>
                        ${this.isEditing ? `<button type="button" class="file-action-btn remove" onclick="removeCurrentFile(${index})">Remove</button>` : ''}
                    </div>
                </div>
            `;
        });

        currentFilesDiv.innerHTML = filesHTML;
    }

    // Download file method (part of the class)
    downloadFile(url, filename) {
        try {
            if (!url) {
                alert('Download URL not available for this file.');
                return;
            }

            // Create a temporary link element
            const link = document.createElement('a');
            link.href = url;
            link.download = filename || 'download';
            link.target = '_blank';

            // Add CORS handling for Firebase Storage URLs
            link.rel = 'noopener noreferrer';

            // Append to body, click, and remove
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading file:', error);
            alert('Error downloading file: ' + error.message);
        }
    }

    // Set up event listeners
    setupEventListeners() {
        // Date change listeners for auto-calculation
        document.getElementById('startDate').addEventListener('change', () => this.calculateDays());
        document.getElementById('endDate').addEventListener('change', () => this.calculateDays());

        // File upload listener
        document.getElementById('supportingDocs').addEventListener('change', (e) => this.handleFileSelection(e));

        // Form submission
        document.getElementById('leaveEditForm').addEventListener('submit', (e) => this.handleFormSubmission(e));
    }

    // Calculate number of days
    calculateDays() {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            document.getElementById('numberOfDays').value = diffDays;
        }
    }

    // Handle file selection
    handleFileSelection(event) {
        const files = Array.from(event.target.files);
        this.newFiles = files;
        this.displayNewFiles();
    }

    // Display newly selected files
    displayNewFiles() {
        const newFilesDiv = document.getElementById('newFiles');

        if (this.newFiles.length === 0) {
            newFilesDiv.innerHTML = '';
            return;
        }

        let filesHTML = '<h4>New Documents:</h4>';
        this.newFiles.forEach((file, index) => {
            filesHTML += `
                <div class="file-item">
                    <span class="file-name">${file.name}</span>
                    <div class="file-actions">
                        <button type="button" class="file-action-btn remove" onclick="removeNewFile(${index})">Remove</button>
                    </div>
                </div>
            `;
        });

        newFilesDiv.innerHTML = filesHTML;
    }

    // Update button visibility based on status
    updateButtonVisibility() {
        const editButton = document.getElementById('editButton');
        const cancelButton = document.getElementById('cancelButton');

        // Only show edit/cancel buttons for pending requests
        const canEdit = this.currentRequest.status === 'pending_supervisor' || this.currentRequest.status === 'pending_hr';

        if (canEdit) {
            editButton.style.display = 'inline-block';
            cancelButton.style.display = 'inline-block';
        } else {
            editButton.style.display = 'none';
            cancelButton.style.display = 'none';
        }
    }

    // Enable/disable form editing
    setFormEnabled(enabled) {
        const form = document.getElementById('leaveEditForm');
        const inputs = form.querySelectorAll('input, select, textarea');

        inputs.forEach(input => {
            if (input.id !== 'numberOfDays') { // numberOfDays is always readonly
                input.disabled = !enabled;
            }
        });

        // Show/hide the supporting documents upload section
        const supportingDocsGroup = document.getElementById('supportingDocsGroup');
        if (supportingDocsGroup) {
            supportingDocsGroup.style.display = enabled ? 'block' : 'none';
        }

        document.getElementById('viewButtons').style.display = enabled ? 'none' : 'flex';
        document.getElementById('editableButtons').style.display = enabled ? 'flex' : 'none';

        this.isEditing = enabled;
        this.displayCurrentFiles(); // Refresh file display to show/hide remove buttons
    }

    // Handle form submission
    async handleFormSubmission(event) {
        event.preventDefault();

        try {
            // Show loading
            this.showMessage('Updating request...', 'info');

            const formData = new FormData(event.target);
            const updateData = {
                leaveType: formData.get('leaveType'),
                startDate: formData.get('startDate'),
                endDate: formData.get('endDate'),
                numberOfDays: parseInt(formData.get('numberOfDays')),
                reasonNotes: formData.get('reasonNotes'),
                status: 'pending_supervisor', // Reset to pending supervisor
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            // Handle file uploads
            if (this.newFiles.length > 0) {
                const uploadedFiles = await this.uploadFiles(this.newFiles);

                // Combine with existing files (minus removed ones)
                let existingFiles = this.currentRequest.supportingDocuments || [];
                existingFiles = existingFiles.filter((_, index) => !this.filesToRemove.includes(index));

                updateData.supportingDocuments = [...existingFiles, ...uploadedFiles];
            } else if (this.filesToRemove.length > 0) {
                // Just remove files without adding new ones
                let existingFiles = this.currentRequest.supportingDocuments || [];
                updateData.supportingDocuments = existingFiles.filter((_, index) => !this.filesToRemove.includes(index));
            }

            // Update in Firestore
            await firebase.firestore().collection('leaveRequests').doc(this.currentRequest.id).update(updateData);

            this.showMessage('Request updated successfully! Status reset to pending supervisor approval.', 'success');

            // Reload the page to show updated data
            setTimeout(() => {
                window.location.reload();
            }, 2000);

        } catch (error) {
            console.error('Error updating request:', error);
            this.showMessage('Error updating request: ' + error.message, 'error');
        }
    }

    // Upload files to Firebase Storage
    async uploadFiles(files) {
        const uploadedFiles = [];

        for (const file of files) {
            try {
                const fileName = `${Date.now()}_${file.name}`;
                const storageRef = firebase.storage().ref(`leave-documents/${this.currentRequest.employeeId}/${fileName}`);

                const snapshot = await storageRef.put(file);
                const downloadURL = await snapshot.ref.getDownloadURL();

                uploadedFiles.push({
                    name: file.name,
                    url: downloadURL,
                    uploadedAt: new Date().toISOString()
                });

            } catch (error) {
                console.error('Error uploading file:', file.name, error);
                throw new Error(`Failed to upload ${file.name}: ${error.message}`);
            }
        }

        return uploadedFiles;
    }

    // Cancel the leave request
    async cancelLeaveRequest() {
        if (!confirm('Are you sure you want to cancel this leave request? This action cannot be undone.')) {
            return;
        }

        try {
            this.showMessage('Cancelling request...', 'info');

            await firebase.firestore().collection('leaveRequests').doc(this.currentRequest.id).update({
                status: 'cancelled',
                cancellationReason: 'Cancelled by employee',
                cancelledAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            this.showMessage('Request cancelled successfully!', 'success');

            // Redirect to leave status page after a delay
            setTimeout(() => {
                window.location.href = 'leave status html.html';
            }, 2000);

        } catch (error) {
            console.error('Error cancelling request:', error);
            this.showMessage('Error cancelling request: ' + error.message, 'error');
        }
    }

    // Display approval history
    displayApprovalHistory() {
        const historyDiv = document.getElementById('approvalHistory');
        let historyHTML = '';

        // Supervisor approval - only show if it has been processed (not pending)
        if (this.currentRequest.supervisorApproval &&
            this.currentRequest.supervisorApproval.status !== 'pending' &&
            this.currentRequest.supervisorApproval.approvedBy) {
            const approval = this.currentRequest.supervisorApproval;
            const isApproved = approval.status === 'approved';
            historyHTML += `
                <div class="approval-item">
                    <div class="approval-header">
                        <span class="approval-role">Supervisor Review</span>
                        <span class="approval-date">${this.formatTimestamp(approval.approvedAt)}</span>
                    </div>
                    <div class="approval-status">
                        <span class="status-badge ${isApproved ? 'status-approved' : 'status-rejected'}">
                            ${isApproved ? 'Approved' : 'Rejected'}
                        </span>
                    </div>
                    ${approval.comments ? `<div class="approval-comments">"${approval.comments}"</div>` : ''}
                    <div style="margin-top: 5px; color: #666; font-size: 12px;">By: ${approval.approvedBy}</div>
                </div>
            `;
        }

        // HR approval - only show if it has been processed (not pending)
        if (this.currentRequest.hrApproval &&
            this.currentRequest.hrApproval.status !== 'pending' &&
            this.currentRequest.hrApproval.approvedBy) {
            const approval = this.currentRequest.hrApproval;
            const isApproved = approval.status === 'approved';
            historyHTML += `
                <div class="approval-item">
                    <div class="approval-header">
                        <span class="approval-role">HR Review</span>
                        <span class="approval-date">${this.formatTimestamp(approval.approvedAt)}</span>
                    </div>
                    <div class="approval-status">
                        <span class="status-badge ${isApproved ? 'status-approved' : 'status-rejected'}">
                            ${isApproved ? 'Approved' : 'Rejected'}
                        </span>
                    </div>
                    ${approval.comments ? `<div class="approval-comments">"${approval.comments}"</div>` : ''}
                    <div style="margin-top: 5px; color: #666; font-size: 12px;">By: ${approval.approvedBy}</div>
                </div>
            `;
        }

        if (historyHTML === '') {
            historyHTML = '<p style="color: #666; font-style: italic;">No approval history yet</p>';
        }

        historyDiv.innerHTML = historyHTML;
    }

    // Utility functions
    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

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
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

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

    showMessage(message, type) {
        const container = document.querySelector('.details-container');
        const existingMessage = container.querySelector('.success-message, .error-message, .info-message');

        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = type === 'success' ? 'success-message' :
            type === 'error' ? 'error-message' : 'info-message';
        messageDiv.textContent = message;

        container.insertBefore(messageDiv, container.firstChild);

        if (type !== 'error') {
            setTimeout(() => {
                messageDiv.remove();
            }, 5000);
        }
    }

    showError(message) {
        const infoDiv = document.getElementById('requestInfo');
        infoDiv.innerHTML = `<div class="error-message">${message}</div>`;
    }
}

// Global functions for HTML onclick handlers
function handleDownloadClick(url, filename) {
    const manager = window.leaveDetailsManager;
    if (manager && manager.downloadFile) {
        manager.downloadFile(url, filename);
    } else {
        console.error('LeaveDetailsManager not found or downloadFile method missing');
        // Fallback download
        try {
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Fallback download failed:', error);
            alert('Download failed: ' + error.message);
        }
    }
}

function enableEdit() {
    const manager = window.leaveDetailsManager || new LeaveDetailsManager();
    manager.setFormEnabled(true);
}

function cancelEdit() {
    const manager = window.leaveDetailsManager || new LeaveDetailsManager();
    manager.setFormEnabled(false);
    manager.populateForm(); // Reset form to original values
    manager.newFiles = [];
    manager.filesToRemove = [];
    manager.displayNewFiles();
    manager.displayCurrentFiles();
}

function cancelRequest() {
    const manager = window.leaveDetailsManager || new LeaveDetailsManager();
    manager.cancelLeaveRequest();
}

function downloadFile(url, filename) {
    // This is a fallback global function, but prefer using the class method
    const manager = window.leaveDetailsManager;
    if (manager && manager.downloadFile) {
        manager.downloadFile(url, filename);
    } else {
        // Fallback implementation
        try {
            if (!url) {
                alert('Download URL not available for this file.');
                return;
            }

            const link = document.createElement('a');
            link.href = url;
            link.download = filename || 'download';
            link.target = '_blank';
            link.rel = 'noopener noreferrer';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading file:', error);
            alert('Error downloading file: ' + error.message);
        }
    }
}

function removeCurrentFile(index) {
    const manager = window.leaveDetailsManager || new LeaveDetailsManager();
    if (!manager.filesToRemove.includes(index)) {
        manager.filesToRemove.push(index);
    }
    manager.displayCurrentFiles();
}

function removeNewFile(index) {
    const manager = window.leaveDetailsManager || new LeaveDetailsManager();
    manager.newFiles.splice(index, 1);
    manager.displayNewFiles();
}

// Export for global use
window.LeaveDetailsManager = LeaveDetailsManager;
