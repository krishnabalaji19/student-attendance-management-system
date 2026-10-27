const {
  sequelize,
  User,
  Department,
  Subject,
  Class,
  TeacherProfile,
  StudentProfile,
  TeacherClassSubject,
  AttendanceSession,
  AttendanceRecord,
  LeaveRequest
} = require('./models');

const seedDatabase = async () => {
  try {
    console.log('Synchronizing database for seeding...');
    await sequelize.sync({ force: true }); // Reset tables for fresh seed

    console.log('Seeding Departments...');
    const cseDept = await Department.create({
      name: 'Computer Science & Engineering',
      code: 'CSE',
      description: 'Department of Computer Science and Engineering',
    });
    const itDept = await Department.create({
      name: 'Information Technology',
      code: 'IT',
      description: 'Department of Information Technology',
    });
    const eceDept = await Department.create({
      name: 'Electronics & Communication',
      code: 'ECE',
      description: 'Department of Electronics and Communication Engineering',
    });

    console.log('Seeding Subjects...');
    const webDev = await Subject.create({
      name: 'Web Development & MERN Stack',
      code: 'CS301',
      credits: 4,
      departmentId: cseDept.id,
    });
    const dataStruct = await Subject.create({
      name: 'Data Structures & Algorithms',
      code: 'CS302',
      credits: 4,
      departmentId: cseDept.id,
    });
    const dbms = await Subject.create({
      name: 'Database Management Systems',
      code: 'CS303',
      credits: 3,
      departmentId: cseDept.id,
    });
    const networks = await Subject.create({
      name: 'Computer Networks',
      code: 'CS304',
      credits: 3,
      departmentId: cseDept.id,
    });

    console.log('Seeding Classes...');
    const class3A = await Class.create({
      name: 'B.Tech CSE 3rd Year',
      section: 'Section A',
      academicYear: '2025-2026',
      departmentId: cseDept.id,
    });
    const class3B = await Class.create({
      name: 'B.Tech CSE 3rd Year',
      section: 'Section B',
      academicYear: '2025-2026',
      departmentId: cseDept.id,
    });

    console.log('Seeding Users (Admin, Teachers, Students)...');
    // Admin
    const adminUser = await User.create({
      name: 'Dr. Sarah Connor (System Admin)',
      email: 'admin@school.edu',
      password: 'admin123',
      role: 'admin',
      phone: '+1 555-0100',
    });

    // Teachers
    const teacherUser1 = await User.create({
      name: 'Prof. Alan Turing',
      email: 'teacher@school.edu',
      password: 'teacher123',
      role: 'teacher',
      phone: '+1 555-0101',
    });
    const teacherProfile1 = await TeacherProfile.create({
      userId: teacherUser1.id,
      employeeId: 'EMP-1001',
      designation: 'Senior Professor',
      departmentId: cseDept.id,
    });

    const teacherUser2 = await User.create({
      name: 'Prof. Margaret Hamilton',
      email: 'teacher2@school.edu',
      password: 'teacher123',
      role: 'teacher',
      phone: '+1 555-0102',
    });
    const teacherProfile2 = await TeacherProfile.create({
      userId: teacherUser2.id,
      employeeId: 'EMP-1002',
      designation: 'Associate Professor',
      departmentId: cseDept.id,
    });

    // Assign Teachers to Classes & Subjects
    await TeacherClassSubject.create({
      teacherId: teacherProfile1.id,
      classId: class3A.id,
      subjectId: webDev.id,
    });
    await TeacherClassSubject.create({
      teacherId: teacherProfile1.id,
      classId: class3A.id,
      subjectId: dataStruct.id,
    });
    await TeacherClassSubject.create({
      teacherId: teacherProfile2.id,
      classId: class3A.id,
      subjectId: dbms.id,
    });

    // Students Data
    const studentSeedData = [
      { name: 'Alex Johnson', email: 'student@school.edu', roll: 'CS2025001', parent: 'Mark Johnson' },
      { name: 'Sophia Martinez', email: 'sophia@school.edu', roll: 'CS2025002', parent: 'Carlos Martinez' },
      { name: 'Liam Smith', email: 'liam@school.edu', roll: 'CS2025003', parent: 'David Smith' },
      { name: 'Emma Davis', email: 'emma@school.edu', roll: 'CS2025004', parent: 'Robert Davis' },
      { name: 'Noah Wilson', email: 'noah@school.edu', roll: 'CS2025005', parent: 'James Wilson' },
      { name: 'Olivia Taylor', email: 'olivia@school.edu', roll: 'CS2025006', parent: 'Thomas Taylor' },
      { name: 'Ethan Brown', email: 'ethan@school.edu', roll: 'CS2025007', parent: 'Michael Brown' },
      { name: 'Ava Anderson', email: 'ava@school.edu', roll: 'CS2025008', parent: 'Joseph Anderson' },
      { name: 'Lucas Thomas', email: 'lucas@school.edu', roll: 'CS2025009', parent: 'Charles Thomas' },
      { name: 'Mia Jackson', email: 'mia@school.edu', roll: 'CS2025010', parent: 'Daniel Jackson' },
    ];

    const studentProfiles = [];

    for (let i = 0; i < studentSeedData.length; i++) {
      const s = studentSeedData[i];
      const user = await User.create({
        name: s.name,
        email: s.email,
        password: 'student123',
        role: 'student',
        phone: `+1 555-020${i}`,
      });

      const profile = await StudentProfile.create({
        userId: user.id,
        rollNumber: s.roll,
        classId: class3A.id,
        departmentId: cseDept.id,
        parentName: s.parent,
        parentPhone: `+1 555-030${i}`,
      });

      studentProfiles.push(profile);
    }

    console.log('Seeding Attendance Sessions & Records (Past 10 days)...');
    const today = new Date();

    for (let d = 10; d >= 1; d--) {
      const sessionDate = new Date(today);
      sessionDate.setDate(today.getDate() - d);
      const dateStr = sessionDate.toISOString().split('T')[0];

      // Web Dev session
      const sessionWeb = await AttendanceSession.create({
        classId: class3A.id,
        subjectId: webDev.id,
        teacherId: teacherProfile1.id,
        date: dateStr,
        timeSlot: '09:00 AM - 10:00 AM',
        remarks: `Lecture #${11 - d}: Frontend components and state`,
      });

      // Attendance records for Web Dev session
      for (let sIdx = 0; sIdx < studentProfiles.length; sIdx++) {
        const student = studentProfiles[sIdx];
        // Simulate specific student attendance patterns (e.g. Student #3 Liam has low attendance)
        let status = 'present';
        if (sIdx === 2) {
          // Liam Smith - absent 60% of the time to test <75% warning!
          status = d % 2 === 0 ? 'absent' : 'present';
        } else if (sIdx === 5 && d === 3) {
          status = 'late';
        } else if (d === 5 && (sIdx === 1 || sIdx === 4)) {
          status = 'absent';
        } else if (d === 7 && sIdx === 6) {
          status = 'excused';
        }

        await AttendanceRecord.create({
          sessionId: sessionWeb.id,
          studentId: student.id,
          status,
          remarks: status === 'late' ? '10 mins late' : status === 'excused' ? 'Medical slip' : null,
        });
      }

      // Data Structures session (every 2 days)
      if (d % 2 === 0) {
        const sessionDS = await AttendanceSession.create({
          classId: class3A.id,
          subjectId: dataStruct.id,
          teacherId: teacherProfile1.id,
          date: dateStr,
          timeSlot: '11:00 AM - 12:00 PM',
          remarks: `Lecture on Binary Search Trees`,
        });

        for (let sIdx = 0; sIdx < studentProfiles.length; sIdx++) {
          const student = studentProfiles[sIdx];
          let status = 'present';
          if (sIdx === 2 && d > 4) status = 'absent';
          else if (sIdx === 7 && d === 2) status = 'absent';

          await AttendanceRecord.create({
            sessionId: sessionDS.id,
            studentId: student.id,
            status,
          });
        }
      }
    }

    console.log('Seeding Leave Requests...');
    await LeaveRequest.create({
      studentId: studentProfiles[2].id, // Liam Smith
      startDate: new Date(today.getTime() - 2 * 86400000).toISOString().split('T')[0],
      endDate: new Date(today.getTime() + 1 * 86400000).toISOString().split('T')[0],
      reason: 'Fever and doctor recommended 3 days rest.',
      status: 'pending',
    });

    await LeaveRequest.create({
      studentId: studentProfiles[6].id, // Ethan Brown
      startDate: new Date(today.getTime() - 7 * 86400000).toISOString().split('T')[0],
      endDate: new Date(today.getTime() - 7 * 86400000).toISOString().split('T')[0],
      reason: 'Attending National Hackathon competition.',
      status: 'approved',
      adminComment: 'Approved by Prof. Alan Turing',
    });

    console.log('==================================================');
    console.log('DATABASE SEEDED SUCCESSFULLY!');
    console.log('==================================================');
    console.log('Demo Credentials:');
    console.log('Admin:   email: admin@school.edu     password: admin123');
    console.log('Teacher: email: teacher@school.edu   password: teacher123');
    console.log('Student: email: student@school.edu   password: student123');
    console.log('==================================================');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
