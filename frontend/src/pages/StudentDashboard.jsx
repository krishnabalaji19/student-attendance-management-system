import React, { useEffect, useState } from 'react';
import API from '../services/api';
import StatCard from '../components/common/StatCard';
import AttendanceBadge from '../components/common/AttendanceBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { exportToPDF } from '../utils/exportUtils';
import {
  Percent,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Download,
  BookOpen,
  Calendar,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await API.get('/student/dashboard');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load student dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <LoadingSpinner label="Loading your attendance records..." />;

  const { student, summary, subjectBreakdown, recentRecords, leaveRequests } = data || {};

  const handleDownloadPDF = () => {
    if (!student || !subjectBreakdown) return;

    const pdfData = subjectBreakdown.map((s) => ({
      rollNumber: student.rollNumber,
      studentName: student.name,
      className: student.class ? `${student.class.name} (${student.class.section})` : 'N/A',
      subjectName: s.name,
      totalSessions: s.total,
      present: s.present,
      absent: s.absent,
      late: s.late,
      excused: s.excused,
      percentage: s.percentage,
    }));

    exportToPDF(
      pdfData,
      `Attendance Record - ${student.name} (${student.rollNumber})`,
      `${student.rollNumber}_attendance_report.pdf`
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Warning Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome, {student?.name}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Roll No: <span className="font-bold text-gray-700 dark:text-gray-300">{student?.rollNumber}</span> | Class: <span className="font-bold text-gray-700 dark:text-gray-300">{student?.class?.name} ({student?.class?.section})</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md transition-all"
          >
            <Download className="w-4 h-4" /> Download PDF Report
          </button>
          <Link
            to="/leave-requests"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold text-sm transition-all"
          >
            <FileText className="w-4 h-4" /> Apply Leave
          </Link>
        </div>
      </div>

      {/* Low Attendance Warning Alert */}
      {summary?.isWarning && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 flex items-start gap-3 shadow-sm">
          <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold">Low Attendance Warning (&lt; 75%)</h4>
            <p className="text-xs mt-0.5 text-rose-700 dark:text-rose-300">
              Your overall attendance is currently <span className="font-extrabold">{summary?.overallPercentage}%</span>, which is below the mandatory 75% threshold. Please speak with your class teacher or submit leave certificates if applicable.
            </p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Overall Attendance"
          value={`${summary?.overallPercentage || 0}%`}
          subtitle={`Out of ${summary?.totalClasses || 0} total classes`}
          icon={Percent}
          color={summary?.isWarning ? 'red' : 'green'}
        />
        <StatCard
          title="Classes Attended"
          value={summary?.presentCount + (summary?.lateCount || 0)}
          subtitle={`${summary?.presentCount} Present, ${summary?.lateCount} Late`}
          icon={CheckCircle2}
          color="blue"
        />
        <StatCard
          title="Classes Missed"
          value={summary?.absentCount || 0}
          subtitle="Unexcused absences"
          icon={XCircle}
          color="red"
        />
        <StatCard
          title="Excused Absences"
          value={summary?.excusedCount || 0}
          subtitle="Approved leave certificates"
          icon={Clock}
          color="purple"
        />
      </div>

      {/* Subject-Wise Attendance Breakdown */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Subject Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjectBreakdown && subjectBreakdown.length > 0 ? (
            subjectBreakdown.map((subj) => (
              <div
                key={subj.code}
                className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                    {subj.code}
                  </span>
                  <span
                    className={`text-sm font-extrabold ${
                      subj.isLow ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {subj.percentage}%
                  </span>
                </div>

                <h4 className="text-base font-bold text-gray-900 dark:text-white">
                  {subj.name}
                </h4>

                {/* Progress Bar */}
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      subj.isLow ? 'bg-rose-500' : 'bg-brand-500'
                    }`}
                    style={{ width: `${Math.min(subj.percentage, 100)}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-4 gap-1 text-center pt-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700">
                  <div>
                    <span className="block font-bold text-gray-900 dark:text-white">{subj.total}</span> Total
                  </div>
                  <div>
                    <span className="block font-bold text-emerald-600">{subj.present}</span> Present
                  </div>
                  <div>
                    <span className="block font-bold text-rose-600">{subj.absent}</span> Absent
                  </div>
                  <div>
                    <span className="block font-bold text-amber-600">{subj.late}</span> Late
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 col-span-3">No subject records available.</p>
          )}
        </div>
      </div>

      {/* Recent Attendance Logs */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            Recent Class History
          </h3>
          <span className="text-xs text-gray-500">Showing last 15 entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-750 text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Subject</th>
                <th className="px-6 py-3">Instructor</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {recentRecords && recentRecords.length > 0 ? (
                recentRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                      {rec.AttendanceSession?.date}
                    </td>
                    <td className="px-6 py-4">
                      {rec.AttendanceSession?.Subject?.name || 'Subject'}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {rec.AttendanceSession?.TeacherProfile?.User?.name || 'Teacher'}
                    </td>
                    <td className="px-6 py-4">
                      <AttendanceBadge status={rec.status} />
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
                      {rec.remarks || rec.AttendanceSession?.remarks || '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-6 text-center text-gray-500">
                    No attendance records found yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
