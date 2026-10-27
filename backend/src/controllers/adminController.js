const {
  User,
  Department,
  Class,
  Subject,
  TeacherProfile,
  StudentProfile,
  TeacherClassSubject,
  AttendanceSession,
  AttendanceRecord
} = require('../models');

// --- USER MANAGEMENT ---
exports.getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const where = {};
    if (role) where.role = role;

    const users = await User.findAll({
      where,
      attributes: { exclude: ['password'] },
      include: [
        { model: TeacherProfile, include: [Department] },
        { model: StudentProfile, include: [Department, Class] },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      departmentId,
      classId,
      rollNumber,
      employeeId,
      designation,
      parentName,
      parentPhone
    } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const newUser = await User.create({
      name,
      email,
      password,
      role,
      phone,
    });

    if (role === 'teacher') {
      await TeacherProfile.create({
        userId: newUser.id,
        employeeId: employeeId || `EMP-${Date.now().toString().slice(-4)}`,
        designation: designation || 'Assistant Professor',
        departmentId: departmentId || null,
      });
    } else if (role === 'student') {
      await StudentProfile.create({
        userId: newUser.id,
        rollNumber: rollNumber || `ROLL-${Date.now().toString().slice(-4)}`,
        classId: classId || null,
        departmentId: departmentId || null,
        parentName,
        parentPhone,
      });
    }

    const createdUser = await User.findByPk(newUser.id, {
      attributes: { exclude: ['password'] },
      include: [
        { model: TeacherProfile },
        { model: StudentProfile },
      ]
    });

    res.status(201).json({ message: 'User created successfully', user: createdUser });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, isActive, departmentId, classId, rollNumber, employeeId, designation } = req.body;

    const user = await User.findByPk(id, {
      include: [TeacherProfile, StudentProfile]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (isActive !== undefined) user.isActive = isActive;
    await user.save();

    if (user.role === 'teacher' && user.TeacherProfile) {
      if (employeeId) user.TeacherProfile.employeeId = employeeId;
      if (designation) user.TeacherProfile.designation = designation;
      if (departmentId !== undefined) user.TeacherProfile.departmentId = departmentId;
      await user.TeacherProfile.save();
    } else if (user.role === 'student' && user.StudentProfile) {
      if (rollNumber) user.StudentProfile.rollNumber = rollNumber;
      if (classId !== undefined) user.StudentProfile.classId = classId;
      if (departmentId !== undefined) user.StudentProfile.departmentId = departmentId;
      await user.StudentProfile.save();
    }

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

// --- DEPARTMENT MANAGEMENT ---
exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.findAll({
      include: [{ model: Class }, { model: Subject }],
    });
    res.json({ departments });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching departments', error: error.message });
  }
};

exports.createDepartment = async (req, res) => {
  try {
    const { name, code, description } = req.body;
    const dept = await Department.create({ name, code, description });
    res.status(201).json({ message: 'Department created successfully', department: dept });
  } catch (error) {
    res.status(500).json({ message: 'Error creating department', error: error.message });
  }
};

// --- CLASS MANAGEMENT ---
exports.getClasses = async (req, res) => {
  try {
    const classes = await Class.findAll({
      include: [
        { model: Department },
        { model: StudentProfile, include: [{ model: User, attributes: ['id', 'name', 'email'] }] },
      ],
    });
    res.json({ classes });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching classes', error: error.message });
  }
};

exports.createClass = async (req, res) => {
  try {
    const { name, section, academicYear, departmentId } = req.body;
    const newClass = await Class.create({ name, section, academicYear, departmentId });
    res.status(201).json({ message: 'Class created successfully', class: newClass });
  } catch (error) {
    res.status(500).json({ message: 'Error creating class', error: error.message });
  }
};

// --- SUBJECT MANAGEMENT ---
exports.getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.findAll({
      include: [{ model: Department }],
    });
    res.json({ subjects });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subjects', error: error.message });
  }
};

exports.createSubject = async (req, res) => {
  try {
    const { name, code, credits, departmentId } = req.body;
    const subject = await Subject.create({ name, code, credits, departmentId });
    res.status(201).json({ message: 'Subject created successfully', subject });
  } catch (error) {
    res.status(500).json({ message: 'Error creating subject', error: error.message });
  }
};

// --- TEACHER ALLOCATION ---
exports.assignTeacherClassSubject = async (req, res) => {
  try {
    const { teacherId, classId, subjectId } = req.body;

    const existing = await TeacherClassSubject.findOne({
      where: { teacherId, classId, subjectId }
    });

    if (existing) {
      return res.status(400).json({ message: 'Teacher is already assigned to this class and subject' });
    }

    const assignment = await TeacherClassSubject.create({ teacherId, classId, subjectId });
    res.status(201).json({ message: 'Assignment created successfully', assignment });
  } catch (error) {
    res.status(500).json({ message: 'Error assigning teacher', error: error.message });
  }
};

exports.getTeacherClassSubjects = async (req, res) => {
  try {
    const assignments = await TeacherClassSubject.findAll({
      include: [
        { model: TeacherProfile, include: [{ model: User, attributes: ['name', 'email'] }] },
        { model: Class },
        { model: Subject },
      ]
    });
    res.json({ assignments });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching assignments', error: error.message });
  }
};

// --- SYSTEM DASHBOARD STATS FOR ADMIN ---
exports.getAdminStats = async (req, res) => {
  try {
    const totalStudents = await StudentProfile.count();
    const totalTeachers = await TeacherProfile.count();
    const totalClasses = await Class.count();
    const totalSubjects = await Subject.count();
    const totalSessions = await AttendanceSession.count();

    const recordsCount = await AttendanceRecord.count();
    const presentCount = await AttendanceRecord.count({ where: { status: 'present' } });
    const overallPercentage = recordsCount > 0 ? ((presentCount / recordsCount) * 100).toFixed(1) : 0;

    res.json({
      stats: {
        totalStudents,
        totalTeachers,
        totalClasses,
        totalSubjects,
        totalSessions,
        overallPercentage,
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admin stats', error: error.message });
  }
};
