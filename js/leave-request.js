// Leave Request Functionality for LCMS
// Uses Firebase compat SDK for browser compatibility

class LeaveRequestManager {
    constructor() {
        this.uploadedFiles = [];
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/jpg'];

        this.initializeDatePickers();
        this.initializeFileUpload();
        this.initializeForm();
    } initializeDatePickers() {
        const startDate = document.getElementById('startDate');
        const endDate = document.getElementById('endDate');
        const today = new Date().toISOString().split('T')[0];

        if (startDate && endDate) {
            // Set minimum date to today
            startDate.min = today;
            endDate.min = today;

            // Add change event listeners for auto-calculation
            startDate.addEventListener('change', () => this.calculateDays());
            endDate.addEventListener('change', () => this.calculateDays());
        }
    }

    calculateDays() {
        const startDate = document.getElementById('startDate');
        const endDate = document.getElementById('endDate');
        const numberOfDays = document.getElementById('numberOfDays');

        if (startDate && endDate && numberOfDays && startDate.value && endDate.value) {
            const start = new Date(startDate.value);
            const end = new Date(endDate.value);

            if (end < start) {
                alert('End date cannot be before start date');
                endDate.value = '';
                numberOfDays.value = '';
                return;
            }

            // Calculate business days (excluding weekends)
            const diffTime = end.getTime() - start.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

            numberOfDays.value = diffDays;
        } else if (numberOfDays) {
            numberOfDays.value = '';
        }
    }

    initializeFileUpload() {
        const fileInput = document.getElementById('supportingDocs');

        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.handleFileSelection(e.target.files);
            });
        }
    }

    handleFileSelection(files) {
        const fileList = document.getElementById('fileList');
        if (!fileList) return;

        Array.from(files).forEach(file => {
            // Validate file
            if (!this.validateFile(file)) return;

            // Create file item display
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <span class="file-name">${file.name} (${this.formatFileSize(file.size)})</span>
                <span class="upload-status">Ready to upload</span>
                <span class="remove-file" data-filename="${file.name}">✕</span>
            `;

            // Add remove functionality
            fileItem.querySelector('.remove-file').addEventListener('click', () => {
                this.removeFile(file.name);
                fileItem.remove();
            });

            fileList.appendChild(fileItem);

            // Add to uploaded files array
            this.uploadedFiles.push(file);
        });
    }

    validateFile(file) {
        // Check file type
        if (!this.allowedTypes.includes(file.type)) {
            alert(`File type ${file.type} is not allowed. Please upload PDF, DOC, DOCX, JPG, or PNG files.`);
            return false;
        }

        // Check file size
        if (file.size > this.maxFileSize) {
            alert(`File ${file.name} is too large. Maximum size is 10MB.`);
            return false;
        }

        return true;
    }

    removeFile(filename) {
        this.uploadedFiles = this.uploadedFiles.filter(file => file.name !== filename);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async uploadFilesToStorage(files, leaveRequestId) {
        const uploadPromises = files.map(async (file) => {
            const fileName = `leave-requests/${leaveRequestId}/${Date.now()}-${file.name}`;
            const storageRef = firebase.storage().ref(fileName);

            try {
                const snapshot = await storageRef.put(file);
                const downloadURL = await snapshot.ref.getDownloadURL();

                return {
                    name: file.name,
                    url: downloadURL,
                    uploadedAt: new Date().toISOString()
                };
            } catch (error) {
                console.error('Error uploading file:', error);
                throw new Error(`Failed to upload ${file.name}`);
            }
        });

        return Promise.all(uploadPromises);
    }

    async getUserData(uid) {
        try {
            const userDoc = await firebase.firestore().collection('employees').doc(uid).get();

            if (userDoc.exists) {
                const userData = userDoc.data();
                return userData;
            } else {
                throw new Error('User profile not found in employees database. Please contact administrator or complete your profile setup.');
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            throw error;
        }
    } validateLeaveCredits(leaveType, requestedDays, userCredits) {
        const creditMapping = {
            'vacation': 'regularLeave',
            'sick': 'sickLeave',
            'personal': 'specialLeave',
            'emergency': 'emergencyLeave',
            'maternity': 'maternityLeave',
            'service': 'serviceLeave'
        };

        const creditType = creditMapping[leaveType];
        if (!creditType || !userCredits[creditType]) {
            throw new Error('Invalid leave type');
        }

        const availableCredits = userCredits[creditType].remaining;
        if (requestedDays > availableCredits) {
            throw new Error(`Insufficient leave credits. Available: ${availableCredits} days, Requested: ${requestedDays} days`);
        }

        return true;
    }

    initializeForm() {
        const form = document.querySelector('.leave-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
    }

    // Helper method to get current authenticated user
    getCurrentUser() {
        return new Promise((resolve, reject) => {
            const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
                unsubscribe();
                resolve(user);
            }, reject);
        });
    }

    async handleFormSubmit(e) {
        e.preventDefault();

        const submitButton = document.querySelector('.submit-btn');
        const originalText = submitButton ? submitButton.textContent : 'SUBMIT';

        try {
            // Disable submit button and show loading
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'SUBMITTING...';
            }

            // Wait for authentication state to be ready
            const user = await this.getCurrentUser();
            if (!user) {
                throw new Error('User not authenticated. Please log in and try again.');
            }

            // Get form data
            const formData = this.getFormData();            // Validate form data
            this.validateFormData(formData);

            // Get user data to validate credits
            const userData = await this.getUserData(user.uid);

            // Validate leave credits
            this.validateLeaveCredits(formData.leaveType, formData.numberOfDays, userData.leaveCredits);

            // Create leave request document
            const leaveRequest = {
                employeeId: user.uid,
                employeeName: userData.name,
                employeeEmail: userData.email,
                department: userData.department,
                designation: userData.designation,
                leaveType: formData.leaveType,
                startDate: formData.startDate,
                endDate: formData.endDate,
                numberOfDays: formData.numberOfDays,
                reasonNotes: formData.reasonNotes,
                status: 'pending_supervisor', // pending_supervisor -> pending_hr -> approved
                supervisorApproval: {
                    status: 'pending',
                    approvedBy: null,
                    approvedAt: null,
                    comments: null
                },
                hrApproval: {
                    status: 'pending',
                    approvedBy: null,
                    approvedAt: null,
                    comments: null
                },
                supportingDocuments: [],
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            // Add leave request to Firestore
            const docRef = await firebase.firestore().collection('leaveRequests').add(leaveRequest);

            // Upload files if any
            if (this.uploadedFiles.length > 0) {
                if (submitButton) {
                    submitButton.textContent = 'UPLOADING FILES...';
                }
                const uploadedDocuments = await this.uploadFilesToStorage(this.uploadedFiles, docRef.id);

                // Update document with file URLs
                await docRef.update({
                    supportingDocuments: uploadedDocuments
                });
            }

            // Show success message
            alert('Leave request submitted successfully! You will be notified once it is reviewed.');

            // Reset form
            this.resetForm();

        } catch (error) {
            console.error('Error submitting leave request:', error);
            alert(`Error: ${error.message}`);
        } finally {
            // Re-enable submit button
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }
        }
    }

    getFormData() {
        const leaveTypeEl = document.getElementById('leaveType');
        const startDateEl = document.getElementById('startDate');
        const endDateEl = document.getElementById('endDate');
        const numberOfDaysEl = document.getElementById('numberOfDays');
        const reasonNotesEl = document.getElementById('reasonNotes');

        return {
            leaveType: leaveTypeEl ? leaveTypeEl.value : '',
            startDate: startDateEl ? startDateEl.value : '',
            endDate: endDateEl ? endDateEl.value : '',
            numberOfDays: numberOfDaysEl ? parseInt(numberOfDaysEl.value) : 0,
            reasonNotes: reasonNotesEl ? reasonNotesEl.value.trim() : ''
        };
    }

    validateFormData(data) {
        if (!data.leaveType) throw new Error('Please select a leave type');
        if (!data.startDate) throw new Error('Please select a start date');
        if (!data.endDate) throw new Error('Please select an end date');
        if (!data.numberOfDays || data.numberOfDays < 1) throw new Error('Invalid number of days');
        if (!data.reasonNotes) throw new Error('Please provide reason notes');

        // Additional date validation
        const today = new Date();
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);

        if (startDate < today.setHours(0, 0, 0, 0)) {
            throw new Error('Start date cannot be in the past');
        }

        if (endDate < startDate) {
            throw new Error('End date cannot be before start date');
        }
    }

    resetForm() {
        const form = document.querySelector('.leave-form');
        if (form) {
            form.reset();
        }

        const numberOfDaysEl = document.getElementById('numberOfDays');
        const fileListEl = document.getElementById('fileList');

        if (numberOfDaysEl) numberOfDaysEl.value = '';
        if (fileListEl) fileListEl.innerHTML = '';

        this.uploadedFiles = [];
    }
}

// Initialize the leave request manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LeaveRequestManager();
});