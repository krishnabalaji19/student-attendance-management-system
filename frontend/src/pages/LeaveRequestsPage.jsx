import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { CalendarDays, Plus, CheckCircle, XCircle, Clock, FileText, Send } from 'lucide-react';

const LeaveRequestsPage = () => {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New leave form state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Review modal state (for teachers/admins)
  const [reviewLeave, setReviewLeave] = useState(null);
  const [adminComment, setAdminComment] = useState('');

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await API.get('/leave');
      setLeaves(res.data.leaves || []);
    } catch (err) {
      console.error('Failed to fetch leave applications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason) {
      alert('Please fill out all fields.');
      return;
    }

    setSubmitting(true);
    try {
      await API.post('/leave/apply', { startDate, endDate, reason });
      setIsModalOpen(false);
      setStartDate('');
      setEndDate('');
      setReason('');
      fetchLeaves();
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting leave request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (leaveId, status) => {
    try {
      await API.put(`/leave/${leaveId}/status`, { status, adminComment });
      setReviewLeave(null);
      setAdminComment('');
      fetchLeaves();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leave Applications</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isStudent
              ? 'Apply for excused absences and view your approval status.'
              : 'Review, approve, or reject student leave requests.'}
          </p>
        </div>
        {isStudent && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md transition-all self-start"
          >
            <Plus className="w-5 h-5" /> Apply New Leave
          </button>
        )}
      </div>

      {/* Leave List */}
      {loading ? (
        <LoadingSpinner label="Loading leave requests..." />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-750 text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">
                <tr>
                  {!isStudent && <th className="px-6 py-3">Student</th>}
                  <th className="px-6 py-3">Duration</th>
                  <th className="px-6 py-3">Reason</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Faculty Comment</th>
                  {!isStudent && <th className="px-6 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {leaves.length > 0 ? (
                  leaves.map((leave) => (
                    <tr key={leave.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                      {!isStudent && (
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900 dark:text-white">
                            {leave.StudentProfile?.User?.name || 'Student'}
                          </div>
                          <div className="text-xs text-gray-500">
                            Roll: {leave.StudentProfile?.rollNumber}
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">
                        {leave.startDate} to {leave.endDate}
                      </td>
                      <td className="px-6 py-4 max-w-xs text-gray-600 dark:text-gray-300">
                        {leave.reason}
                      </td>
                      <td className="px-6 py-4">
                        {leave.status === 'approved' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                            <CheckCircle className="w-3.5 h-3.5" /> Approved
                          </span>
                        )}
                        {leave.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400">
                            <XCircle className="w-3.5 h-3.5" /> Rejected
                          </span>
                        )}
                        {leave.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
                            <Clock className="w-3.5 h-3.5" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
                        {leave.adminComment || '-'}
                      </td>
                      {!isStudent && (
                        <td className="px-6 py-4 text-right space-x-2">
                          {leave.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(leave.id, 'approved')}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(leave.id, 'rejected')}
                                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No leave applications found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for Student Apply Leave */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Apply for Absence Leave">
        <form onSubmit={handleApplyLeave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
                Start Date
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
                End Date
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
              Reason / Medical Explanation
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="State the reason for your absence..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            ></textarea>
          </div>

          <div className="pt-3 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-md flex items-center gap-2"
            >
              <Send className="w-4 h-4" /> Submit Leave Request
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default LeaveRequestsPage;
