import React, { useState, useEffect } from 'react';
import API from '../services/api';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { BookOpen, Building2, Plus, UserCheck, CheckCircle2 } from 'lucide-react';

const ManageClassesPage = () => {
  const [activeTab, setActiveTab] = useState('classes');
  const [classes, setClasses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // Form states
  const [className, setClassName] = useState('');
  const [section, setSection] = useState('Section A');
  const [academicYear, setAcademicYear] = useState('2025-2026');

  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [credits, setCredits] = useState(3);

  const [assignTeacherId, setAssignTeacherId] = useState('');
  const [assignClassId, setAssignClassId] = useState('');
  const [assignSubjectId, setAssignSubjectId] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [classRes, deptRes, subjRes, assignRes, usersRes] = await Promise.all([
        API.get('/admin/classes'),
        API.get('/admin/departments'),
        API.get('/admin/subjects'),
        API.get('/admin/assignments'),
        API.get('/admin/users?role=teacher'),
      ]);
      setClasses(classRes.data.classes || []);
      setDepartments(deptRes.data.departments || []);
      setSubjects(subjRes.data.subjects || []);
      setAssignments(assignRes.data.assignments || []);
      setTeachers(usersRes.data.users || []);
    } catch (err) {
      console.error('Failed to load courses data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/classes', { name: className, section, academicYear });
      setIsClassModalOpen(false);
      setClassName('');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating class');
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/subjects', { name: subjectName, code: subjectCode, credits });
      setIsSubjectModalOpen(false);
      setSubjectName('');
      setSubjectCode('');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating subject');
    }
  };

  const handleAssignTeacher = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/assignments', {
        teacherId: parseInt(assignTeacherId),
        classId: parseInt(assignClassId),
        subjectId: parseInt(assignSubjectId),
      });
      setIsAssignModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error assigning teacher');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Courses & Faculty Allocation</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage academic classes, course subjects, and assign faculty members to classes.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsClassModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-xs shadow-md"
          >
            <Plus className="w-4 h-4" /> Add Class
          </button>
          <button
            onClick={() => setIsSubjectModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs shadow-md"
          >
            <Plus className="w-4 h-4" /> Add Subject
          </button>
          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-purple-600 text-white font-semibold text-xs shadow-md"
          >
            <UserCheck className="w-4 h-4" /> Assign Faculty
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 gap-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab('classes')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'classes'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Classes & Sections ({classes.length})
        </button>
        <button
          onClick={() => setActiveTab('subjects')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'subjects'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Subjects / Courses ({subjects.length})
        </button>
        <button
          onClick={() => setActiveTab('assignments')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'assignments'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Faculty Class Assignments ({assignments.length})
        </button>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading course structures..." />
      ) : (
        <>
          {activeTab === 'classes' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {classes.map((c) => (
                <div key={c.id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex justify-between items-start">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">{c.name}</h4>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 font-bold">
                      {c.section}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Academic Year: {c.academicYear}</p>
                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500">
                    Enrolled Students: <span className="font-bold text-gray-800 dark:text-gray-200">{c.StudentProfiles?.length || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'subjects' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {subjects.map((s) => (
                <div key={s.id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex justify-between items-start">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">{s.name}</h4>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold">
                      {s.code}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Credits: <span className="font-bold text-gray-800 dark:text-gray-200">{s.credits}</span></p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'assignments' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-750 text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-3">Faculty Instructor</th>
                    <th className="px-6 py-3">Assigned Class</th>
                    <th className="px-6 py-3">Subject / Course</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {assignments.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                        {a.TeacherProfile?.User?.name || 'Faculty Member'}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">
                        {a.Class?.name} ({a.Class?.section})
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-brand-600 dark:text-brand-400">
                        {a.Subject?.name} ({a.Subject?.code})
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Modal Add Class */}
      <Modal isOpen={isClassModalOpen} onClose={() => setIsClassModalOpen(false)} title="Add New Class Section">
        <form onSubmit={handleCreateClass} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">Class Name</label>
            <input type="text" required value={className} onChange={(e) => setClassName(e.target.value)} placeholder="e.g. B.Tech CSE 3rd Year" className="w-full px-3 py-2 border rounded-xl bg-gray-50 dark:bg-gray-700 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">Section</label>
            <input type="text" required value={section} onChange={(e) => setSection(e.target.value)} placeholder="e.g. Section A" className="w-full px-3 py-2 border rounded-xl bg-gray-50 dark:bg-gray-700 text-sm" />
          </div>
          <div className="pt-3 flex justify-end gap-3">
            <button type="submit" className="px-5 py-2 bg-brand-600 text-white rounded-xl font-bold text-sm">Save Class</button>
          </div>
        </form>
      </Modal>

      {/* Modal Add Subject */}
      <Modal isOpen={isSubjectModalOpen} onClose={() => setIsSubjectModalOpen(false)} title="Add New Course Subject">
        <form onSubmit={handleCreateSubject} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">Subject Name</label>
            <input type="text" required value={subjectName} onChange={(e) => setSubjectName(e.target.value)} placeholder="e.g. Operating Systems" className="w-full px-3 py-2 border rounded-xl bg-gray-50 dark:bg-gray-700 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">Course Code</label>
            <input type="text" required value={subjectCode} onChange={(e) => setSubjectCode(e.target.value)} placeholder="e.g. CS305" className="w-full px-3 py-2 border rounded-xl bg-gray-50 dark:bg-gray-700 text-sm" />
          </div>
          <div className="pt-3 flex justify-end gap-3">
            <button type="submit" className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm">Save Subject</button>
          </div>
        </form>
      </Modal>

      {/* Modal Assign Teacher */}
      <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title="Assign Faculty to Class & Subject">
        <form onSubmit={handleAssignTeacher} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">Faculty Teacher</label>
            <select required value={assignTeacherId} onChange={(e) => setAssignTeacherId(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-gray-50 dark:bg-gray-700 text-sm">
              <option value="">Select Teacher</option>
              {teachers.map((t) => (
                <option key={t.TeacherProfile?.id} value={t.TeacherProfile?.id}>{t.name} ({t.TeacherProfile?.employeeId})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">Target Class</label>
            <select required value={assignClassId} onChange={(e) => setAssignClassId(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-gray-50 dark:bg-gray-700 text-sm">
              <option value="">Select Class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.section})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">Subject</label>
            <select required value={assignSubjectId} onChange={(e) => setAssignSubjectId(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-gray-50 dark:bg-gray-700 text-sm">
              <option value="">Select Subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>
          <div className="pt-3 flex justify-end gap-3">
            <button type="submit" className="px-5 py-2 bg-purple-600 text-white rounded-xl font-bold text-sm">Confirm Assignment</button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default ManageClassesPage;
