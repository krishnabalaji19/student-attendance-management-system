import React, { useEffect, useState } from 'react';
import API from '../services/api';
import StatCard from '../components/common/StatCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Users, GraduationCap, UserCheck, BookOpen, ClipboardCheck, Percent, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get('/admin/stats');
        setStats(res.data.stats);
      } catch (err) {
        console.error('Failed to load admin stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner label="Loading admin analytics..." />;

  const chartData = [
    { name: 'Mon', attendance: 92 },
    { name: 'Tue', attendance: 88 },
    { name: 'Wed', attendance: 95 },
    { name: 'Thu', attendance: 91 },
    { name: 'Fri', attendance: 86 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Overview</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            System metrics, enrollment numbers, and overall attendance statistics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/mark-attendance"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md transition-all"
          >
            <ClipboardCheck className="w-4 h-4" /> Mark Attendance
          </Link>
          <Link
            to="/reports"
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold text-sm transition-all"
          >
            Generate Report
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Students"
          value={stats?.totalStudents || 0}
          subtitle="Enrolled active students"
          icon={GraduationCap}
          color="blue"
        />
        <StatCard
          title="Total Faculty"
          value={stats?.totalTeachers || 0}
          subtitle="Active teaching staff"
          icon={UserCheck}
          color="purple"
        />
        <StatCard
          title="Active Classes"
          value={stats?.totalClasses || 0}
          subtitle="Sections & Streams"
          icon={BookOpen}
          color="green"
        />
        <StatCard
          title="Overall Attendance"
          value={`${stats?.overallPercentage || 0}%`}
          subtitle="Institute-wide average"
          icon={Percent}
          color="amber"
        />
      </div>

      {/* Chart & Quick Action Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Attendance Trend Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">
            Weekly Attendance Rate (%)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} domain={[60, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', borderRadius: '12px', color: '#fff', border: 'none' }}
                />
                <Bar dataKey="attendance" fill="#0C94E8" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick System Actions */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Quick Management</h3>
          <div className="space-y-3">
            <Link
              to="/manage-users"
              className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-700 hover:bg-brand-50/50 dark:hover:bg-brand-950/20 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Manage Users</p>
                  <p className="text-xs text-gray-500">Create & update students/teachers</p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-brand-600 transition-colors" />
            </Link>

            <Link
              to="/manage-classes"
              className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-700 hover:bg-brand-50/50 dark:hover:bg-brand-950/20 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Manage Courses</p>
                  <p className="text-xs text-gray-500">Classes, departments & subjects</p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-brand-600 transition-colors" />
            </Link>

            <Link
              to="/leave-requests"
              className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-700 hover:bg-brand-50/50 dark:hover:bg-brand-950/20 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Leave Requests</p>
                  <p className="text-xs text-gray-500">Review student absence notes</p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-brand-600 transition-colors" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
