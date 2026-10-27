import React, { useState, useEffect } from 'react';
import API from '../services/api';
import AttendanceBadge from '../components/common/AttendanceBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { exportToCSV, exportToPDF } from '../utils/exportUtils';
import { FileSpreadsheet, Download, Filter, AlertTriangle, Users, Percent, Search } from 'lucide-react';

const AttendanceReportsPage = () => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [threshold, setThreshold] = useState('all');

  const [reportData, setReportData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [classRes, subjRes] = await Promise.all([
          API.get('/admin/classes'),
          API.get('/admin/subjects'),
        ]);
        setClasses(classRes.data.classes || []);
        setSubjects(subjRes.data.subjects || []);
      } catch (err) {
        console.error('Failed to load filter options', err);
      }
    };
    fetchOptions();
  }, []);

  const handleFetchReport = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const res = await API.get('/reports/attendance', {
        params: {
          classId: selectedClass || undefined,
          subjectId: selectedSubject || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          threshold: threshold !== 'all' ? threshold : undefined,
        },
      });

      setReportData(res.data.report || []);
      setSummary(res.data.summary || null);
    } catch (err) {
      console.error('Error fetching report data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchReport();
  }, []);

  const handleExportCSV = () => {
    exportToCSV(reportData, 'attendance_report.csv');
  };

  const handleExportPDF = () => {
    exportToPDF(reportData, 'Class Attendance Summary Report', 'attendance_report.pdf');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance Reports & Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Generate, filter, and export detailed student attendance sheets and deficit reports.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            disabled={reportData.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md transition-all disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={handleExportPDF}
            disabled={reportData.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <form onSubmit={handleFetchReport} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
            Class / Section
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.section})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
            Subject
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
            Threshold Filter
          </label>
          <select
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="all">All Attendance Levels</option>
            <option value="75">Deficit (&lt; 75% Attendance)</option>
            <option value="80">Below 80% Attendance</option>
            <option value="90">Below 90% Attendance</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            className="w-full py-2 px-4 rounded-xl bg-gray-900 hover:bg-black dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all"
          >
            <Filter className="w-4 h-4" /> Apply Filter
          </button>
        </div>

      </form>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Total Students</p>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white">{summary.totalStudents}</h4>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
              <Percent className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Sessions Analyzed</p>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white">{summary.totalSessionsCount}</h4>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Shortage Count (&lt;75%)</p>
              <h4 className="text-xl font-bold text-rose-600 dark:text-rose-400">{summary.lowAttendanceCount} Students</h4>
            </div>
          </div>
        </div>
      )}

      {/* Report Table */}
      {loading ? (
        <LoadingSpinner label="Generating report..." />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-750 text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-3">Roll No</th>
                  <th className="px-6 py-3">Student Name</th>
                  <th className="px-6 py-3">Class</th>
                  <th className="px-6 py-3 text-center">Total Sessions</th>
                  <th className="px-6 py-3 text-center">Present</th>
                  <th className="px-6 py-3 text-center">Absent</th>
                  <th className="px-6 py-3 text-center">Late</th>
                  <th className="px-6 py-3 text-center">Excused</th>
                  <th className="px-6 py-3 text-right">Attendance %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {reportData.length > 0 ? (
                  reportData.map((row) => (
                    <tr key={row.studentId} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-white whitespace-nowrap">
                        {row.rollNumber}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">
                        {row.studentName}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
                        {row.className}
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-gray-700 dark:text-gray-300">
                        {row.totalSessions}
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-emerald-600">
                        {row.present}
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-rose-600">
                        {row.absent}
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-amber-600">
                        {row.late}
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-indigo-600">
                        {row.excused}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold ${
                            row.percentage < 75
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                          }`}
                        >
                          {row.percentage}%
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                      No records match the selected filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default AttendanceReportsPage;
