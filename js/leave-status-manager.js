// Leave Status Management for LCMS
// Handles leave request status updates, approvals, cancellations, and credit management

class LeaveStatusManager {
    constructor() {
        this.statusMapping = {
            'pending_supervisor': 'Pending Supervisor Approval',
            'pending_hr': 'Pending HR Approval',
            'approved': 'Approved',
            'rejected_supervisor': 'Rejected by Supervisor',
            'rejected_hr': 'Rejected by HR',
            'cancelled': 'Cancelled'
        };
    }

    // Update leave request status (for supervisors and HR)
    async updateLeaveStatus(leaveRequestId, newStatus, approverUid, comments = '') {
        try {
            const leaveRequestRef = firebase.firestore().collection('leaveRequests').doc(leaveRequestId);
            const leaveRequestDoc = await leaveRequestRef.get();

            if (!leaveRequestDoc.exists) {
                throw new Error('Leave request not found');
            }

            const leaveData = leaveRequestDoc.data();
            const updateData = {
                status: newStatus,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            // Get approver info
            const approverDoc = await firebase.firestore().collection('users').doc(approverUid).get();
            const approverData = approverDoc.data();

            // Update approval status based on current workflow step
            if (newStatus === 'pending_hr' || newStatus === 'rejected_supervisor') {
                // Supervisor approval/rejection
                updateData.supervisorApproval = {
                    status: newStatus === 'pending_hr' ? 'approved' : 'rejected',
                    approvedBy: approverData.name,
                    approvedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    comments: comments
                };
            } else if (newStatus === 'approved' || newStatus === 'rejected_hr') {
                // HR approval/rejection
                updateData.hrApproval = {
                    status: newStatus === 'approved' ? 'approved' : 'rejected',
                    approvedBy: approverData.name,
                    approvedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    comments: comments
                };
            }

            await leaveRequestRef.update(updateData);

            // If approved, deduct leave credits
            if (newStatus === 'approved') {
                await this.deductLeaveCredits(leaveData);
            }

            console.log('Leave status updated successfully');
            return true;

        } catch (error) {
            console.error('Error updating leave status:', error);
            throw error;
        }
    }

    // Deduct leave credits when leave is approved
    async deductLeaveCredits(leaveData) {
        try {
            const userRef = firebase.firestore().collection('users').doc(leaveData.employeeId);
            const userDoc = await userRef.get();

            if (!userDoc.exists) {
                throw new Error('User not found');
            }

            const userData = userDoc.data();
            const creditMapping = {
                'vacation': 'regularLeave',
                'sick': 'sickLeave',
                'personal': 'specialLeave',
                'emergency': 'emergencyLeave',
                'maternity': 'maternityLeave',
                'service': 'serviceLeave'
            };

            const creditType = creditMapping[leaveData.leaveType];
            if (!creditType || !userData.leaveCredits[creditType]) {
                throw new Error('Invalid leave type for credit deduction');
            }

            const currentCredits = userData.leaveCredits[creditType];
            const newRemaining = currentCredits.remaining - leaveData.numberOfDays;
            const newUsed = currentCredits.used + leaveData.numberOfDays;

            // Update user's leave credits
            const updatePath = `leaveCredits.${creditType}`;
            await userRef.update({
                [`${updatePath}.remaining`]: newRemaining,
                [`${updatePath}.used`]: newUsed
            });

            console.log(`Deducted ${leaveData.numberOfDays} days from ${creditType}`);

        } catch (error) {
            console.error('Error deducting leave credits:', error);
            throw error;
        }
    }

    // Restore leave credits when leave is cancelled
    async restoreLeaveCredits(leaveData) {
        try {
            // Only restore credits if the leave was previously approved
            if (leaveData.status !== 'approved') {
                return;
            }

            const userRef = firebase.firestore().collection('users').doc(leaveData.employeeId);
            const userDoc = await userRef.get();

            if (!userDoc.exists) {
                throw new Error('User not found');
            }

            const userData = userDoc.data();
            const creditMapping = {
                'vacation': 'regularLeave',
                'sick': 'sickLeave',
                'personal': 'specialLeave',
                'emergency': 'emergencyLeave',
                'maternity': 'maternityLeave',
                'service': 'serviceLeave'
            };

            const creditType = creditMapping[leaveData.leaveType];
            if (!creditType || !userData.leaveCredits[creditType]) {
                throw new Error('Invalid leave type for credit restoration');
            }

            const currentCredits = userData.leaveCredits[creditType];
            const newRemaining = currentCredits.remaining + leaveData.numberOfDays;
            const newUsed = Math.max(0, currentCredits.used - leaveData.numberOfDays);

            // Update user's leave credits
            const updatePath = `leaveCredits.${creditType}`;
            await userRef.update({
                [`${updatePath}.remaining`]: newRemaining,
                [`${updatePath}.used`]: newUsed
            });

            console.log(`Restored ${leaveData.numberOfDays} days to ${creditType}`);

        } catch (error) {
            console.error('Error restoring leave credits:', error);
            throw error;
        }
    }

    // Cancel leave request (for employees)
    async cancelLeaveRequest(leaveRequestId, reason = '') {
        try {
            const leaveRequestRef = firebase.firestore().collection('leaveRequests').doc(leaveRequestId);
            const leaveRequestDoc = await leaveRequestRef.get();

            if (!leaveRequestDoc.exists) {
                throw new Error('Leave request not found');
            }

            const leaveData = leaveRequestDoc.data();

            // Check if cancellation is allowed
            if (leaveData.status === 'cancelled') {
                throw new Error('Leave request is already cancelled');
            }

            // Restore leave credits if the leave was approved
            if (leaveData.status === 'approved') {
                await this.restoreLeaveCredits(leaveData);
            }

            // Update leave request status
            await leaveRequestRef.update({
                status: 'cancelled',
                cancellationReason: reason,
                cancelledAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            console.log('Leave request cancelled successfully');
            return true;

        } catch (error) {
            console.error('Error cancelling leave request:', error);
            throw error;
        }
    }

    // Get leave requests for a specific user
    async getUserLeaveRequests(userId) {
        try {
            const snapshot = await firebase.firestore()
                .collection('leaveRequests')
                .where('employeeId', '==', userId)
                .orderBy('createdAt', 'desc')
                .get();

            const leaveRequests = [];
            snapshot.forEach(doc => {
                leaveRequests.push({
                    id: doc.id,
                    ...doc.data(),
                    statusText: this.statusMapping[doc.data().status] || doc.data().status
                });
            });

            return leaveRequests;

        } catch (error) {
            console.error('Error fetching user leave requests:', error);
            throw error;
        }
    }

    // Get pending leave requests for supervisors
    async getPendingLeaveRequests() {
        try {
            const snapshot = await firebase.firestore()
                .collection('leaveRequests')
                .where('status', 'in', ['pending_supervisor', 'pending_hr'])
                .orderBy('createdAt', 'desc')
                .get();

            const leaveRequests = [];
            snapshot.forEach(doc => {
                leaveRequests.push({
                    id: doc.id,
                    ...doc.data(),
                    statusText: this.statusMapping[doc.data().status] || doc.data().status
                });
            });

            return leaveRequests;

        } catch (error) {
            console.error('Error fetching pending leave requests:', error);
            throw error;
        }
    }

    // Get all leave requests for HR
    async getAllLeaveRequests() {
        try {
            const snapshot = await firebase.firestore()
                .collection('leaveRequests')
                .orderBy('createdAt', 'desc')
                .get();

            const leaveRequests = [];
            snapshot.forEach(doc => {
                leaveRequests.push({
                    id: doc.id,
                    ...doc.data(),
                    statusText: this.statusMapping[doc.data().status] || doc.data().status
                });
            });

            return leaveRequests;

        } catch (error) {
            console.error('Error fetching all leave requests:', error);
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

    // Calculate days between two dates
    calculateDaysBetween(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }

    // Check if leave request can be cancelled
    canCancelLeave(leaveData) {
        // Can cancel if:
        // 1. Status is pending (any level)
        // 2. Status is approved but start date is in the future
        if (leaveData.status.includes('pending')) {
            return true;
        }

        if (leaveData.status === 'approved') {
            const today = new Date();
            const startDate = new Date(leaveData.startDate);
            return startDate > today;
        }

        return false;
    }

    // Get leave balance for specific leave type
    getLeaveBalance(userCredits, leaveType) {
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
            return { remaining: 0, used: 0, total: 0 };
        }

        const credits = userCredits[creditType];
        return {
            remaining: credits.remaining,
            used: credits.used,
            total: credits.days
        };
    }
}

// Export for use in other files
window.LeaveStatusManager = LeaveStatusManager;
