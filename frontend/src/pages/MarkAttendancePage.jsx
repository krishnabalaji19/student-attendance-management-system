import React, { useState, useEffect } from 'react';
import API from '../services/api';
import AttendanceBadge from '../components/common/AttendanceBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ClipboardCheck,
  Calendar,
  BookOpen,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Save,
  CheckSquare
} from 'lucide-react';

const MarkAttendancePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState(searchParams.get('classId') || '');
  const [selectedSubject, setSelectedSubject] = useState(searchParams.get('subjectId') || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('09:00 AM - 10:00 AM');
  const [remarks, setRemarks] = useState('');

  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({}); // { studentId: { status: 'present', remarks: '' } }
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch initial assigned classes & subjects
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [classRes, subjRes] = await Promise.all([
          API.get('/admin/classes'),
          API.get('/admin/subjects'),
        ]);
        setClasses(classRes.data.classes || []);
        setSubjects(subjRes.data.subjects || []);

        if (!selectedClass && classRes.data.classes?.length > 0) {
          setSelectedClass(classRes.data.classes[0].id.toString());
        }
        if (!selectedSubject && subjRes.data.subjects?.length > 0) {
          setSelectedSubject(subjRes.data.subjects[0].id.toString());
        }
      } catch (err) {
        console.error('Error fetching options', err);
      }
    };
    fetchOptions();
  }, []);

  // Fetch students & attendance status whenever Class, Subject, or Date changes
  useEffect(() => {
    if (!selectedClass) return;

    const fetchClassData = async () => {
      setLoading(true);
      setMessage('');
      try {
        // Fetch students in the selected class
        const studentsRes = await API.get(`/teacher/class-students/${selectedClass}`);
        const studentList = studentsRes.data.students || [];
        setStudents(studentList);

        // Check if attendance session already exists for this date + subject + class
        if (selectedSubject && date) {
          const statusRes = await API.get(`/attendance/status`, {
            params: { classId: selectedClass, subjectId: selectedSubject, date }
          });

          if (statusRes.data.marked && statusRes.data.session) {
            setAlreadySubmitted(true);
            setRemarks(statusRes.data.session.remarks || '');
            setTimeSlot(statusRes.data.session.timeSlot || '09:00 AM - 10:00 AM');

            const map = {};
            statusRes.data.session.AttendanceRecords?.forEach((rec) => {
              map[rec.studentId] = { status: rec.status, remarks: rec.remarks || '' };
            });
            setAttendanceMap(map);
          } else {
            setAlreadySubmitted(false);
            // Default all students to 'present'
            const defaultMap = {};
            studentList.forEach((s) => {
              defaultMap[s.id] = { status: 'present', remarks: '' };
            });
            setAttendanceMap(defaultMap);
          }
        }
      } catch (err) {
        console.error('Error loading class students', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClassData();
  }, [selectedClass, selectedSubject, date]);

  // Bulk mark all students
  const handleBulkMark = (statusToSet) => {
    const newMap = { ...attendanceMap };
    students.forEach((s) => {
      newMap[s.id] = { ...newMap[s.id], status: statusToSet };
    });
    setAttendanceMap(newMap);
  };

  // Toggle status for individual student
  const handleStatusChange = (studentId, status) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status }
    }));
  };

  const handleStudentRemarkChange = (studentId, remarkText) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], remarks: remarkText }
    }));
  };

  // Submit Attendance Sheet
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClass || !selectedSubject || !date) {
      alert('Please select class, subject, and date.');
      return;
    }

    setSaving(true);
    setMessage('');

    const attendanceData = Object.keys(attendanceMap).map((studentId) => ({
      studentId: parseInt(studentId),
      status: attendanceMap[studentId].status,
      remarks: attendanceMap[studentId].remarks,
    }));

    try {
      await API.post('/attendance/mark', {
        classId: parseInt(selectedClass),
        subjectId: parseInt(selectedSubject),
        date,
        timeSlot,
        remarks,
        attendanceData,
      });

      setMessage('Attendance submitted successfully!');
      setAlreadySubmitted(true);
    } catch (err) {
      console.error('Failed to submit attendance', err);
      alert(err.response?.data?.message || 'Error submitting attendance');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mark Student Attendance</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Select a class, subject, and date to mark daily roll call.
          </p>
        </div>
      </div>

      {/* Control Bar: Class, Subject, Date, Time Slot */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
            Select Class
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500"
          >
            <option value="">-- Choose Class --</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.section})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
            Select Subject
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500"
          >
            <option value="">-- Choose Subject --</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
            Attendance Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
            Time Slot
          </label>
          <input
            type="text"
            value={timeSlot}
            onChange={(e) => setTimeSlot(e.target.value)}
            placeholder="e.g. 09:00 AM - 10:00 AM"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500"
          />
        </div>

      </div>

      {/* Banner Message */}
      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-sm font-semibold">
          {message}
        </div>
      )}

      {alreadySubmitted && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-sm flex items-center justify-between">
          <span>Attendance for this date and subject was previously submitted. Submitting again will update the record.</span>
        </div>
      )}

      {/* Attendance Table */}
      {loading ? (
        <LoadingSpinner label="Fetching student roster..." />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden space-y-4 p-5">
          
          {/* Action Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                Roster: {students.length} Students
              </span>
            </div>

            {/* Quick Bulk Actions */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">Bulk Action:</span>
              <button
                type="button"
                onClick={() => handleBulkMark('present')}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 transition-colors"
              >
                All Present
              </button>
              <button
                type="button"
                onClick={() => handleBulkMark('absent')}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-950/50 dark:text-rose-300 transition-colors"
              >
                All Absent
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-750 text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Roll No</th>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3">Remarks / Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {students.map((student) => {
                  const currentStatus = attendanceMap[student.id]?.status || 'present';
                  const currentRemark = attendanceMap[student.id]?.remarks || '';

                  return (
                    <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-gray-900 dark:text-white whitespace-nowrap">
                        {student.rollNumber}
                      </td>
                      <td className="px-4 py-3.5 font-medium text-gray-800 dark:text-gray-200">
                        {student.User?.name}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="inline-flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-700 rounded-xl">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'present')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              currentStatus === 'present'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'absent')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              currentStatus === 'absent'
                                ? 'bg-rose-600 text-white shadow-sm'
                                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
                            }`}
                          >
                            Absent
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'late')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              currentStatus === 'late'
                                ? 'bg-amber-600 text-white shadow-sm'
                                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
                            }`}
                          >
                            Late
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'excused')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              currentStatus === 'excused'
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
                            }`}
                          >
                            Excused
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <input
                          type="text"
                          value={currentRemark}
                          onChange={(e) => handleStudentRemarkChange(student.id, e.target.value)}
                          placeholder="Optional note..."
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Session Remarks & Save Button */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-1/2">
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Lecture topic / session remarks..."
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={saving || students.length === 0}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving Attendance...' : 'Save & Submit Attendance'}
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default MarkAttendancePage;
