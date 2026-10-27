import React, { useEffect, useState } from 'react';
import API from '../services/api';
import StatCard from '../components/common/StatCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { BookOpen, ClipboardCheck, History, ArrowRight, Calendar, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const TeacherDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await API.get('/teacher/dashboard');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load teacher dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <LoadingSpinner label="Loading faculty dashboard..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Faculty Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Welcome back! Manage attendance for your assigned classes and subjects.
          </p>
        </div>
        <Link
          to="/mark-attendance"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md transition-all self-start"
        >
          <ClipboardCheck className="w-5 h-5" /> Mark Today's Attendance
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Assigned Classes"
          value={data?.assignmentsCount || 0}
          subtitle="Active course sections"
          icon={BookOpen}
          color="blue"
        />
        <StatCard
          title="Sessions Conducted"
          value={data?.totalSessions || 0}
          subtitle="Total attendance entries"
          icon={History}
          color="purple"
        />
        <StatCard
          title="Class Attendance Rate"
          value="89.4%"
          subtitle="Average student presence"
          icon={UserCheck}
          color="green"
        />
      </div>

      {/* Assigned Classes Grid */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Your Assigned Courses</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.assignments && data.assignments.length > 0 ? (
            data.assignments.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:border-brand-300 dark:hover:border-brand-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                      {item.Subject?.code}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {item.Class?.academicYear}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-gray-900 dark:text-white mt-1">
                    {item.Subject?.name}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Class: <span className="font-semibold text-gray-700 dark:text-gray-300">{item.Class?.name} ({item.Class?.section})</span>
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Credits: {item.Subject?.credits}</span>
                  <Link
                    to={`/mark-attendance?classId=${item.classId}&subjectId=${item.subjectId}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400"
                  >
                    Take Roll <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 col-span-3">No classes assigned yet.</p>
          )}
        </div>
      </div>

      {/* Recent Attendance Sessions Conducted */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Recent Attendance Logs</h3>
          <Link to="/reports" className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">
            View All Reports
          </Link>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {data?.recentSessions && data.recentSessions.length > 0 ? (
            data.recentSessions.map((session) => (
              <div key={session.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {session.Subject?.name} ({session.Subject?.code})
                    </h5>
                    <p className="text-xs text-gray-500">
                      {session.Class?.name} - {session.date} {session.timeSlot ? `(${session.timeSlot})` : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400">
                    Submitted
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="p-5 text-sm text-gray-500">No recent sessions submitted.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
