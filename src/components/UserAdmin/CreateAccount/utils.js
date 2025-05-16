import { BookOutlined, CalendarOutlined, DollarOutlined, FileTextOutlined, FolderOpenOutlined, FormOutlined, LineChartOutlined, LockOutlined, ScheduleOutlined, SettingOutlined, TeamOutlined, UsergroupAddOutlined } from "@ant-design/icons";

export const admissionsModules = {
    'Manage Applications': [
        'Manage Student Applications',
        'Manage Exam and Interview Schedules',
        'Manage Exam and Interview Results',
        'Manage Enrollment Period',
    ],
    'Manage Queue': [],
    'Create Announcements': [],
};

export const registrarModules = {
    'Manage Student Records': [
        'Manage Students',
        'Attendance Summary',
        'Behavior Summary',
        'Grade Summary',
        'Enrollment Summary',
        'Quarterly Ranking',
        'Yearly Ranking',
    ],
    'Manage Enrollment': [],
    'Manage Schedule': [
        'Student Schedule',
        'Faculty Schedule',
    ],
    'Manage Program': [
        'Manage Strands',
        'Manage Subjects',
        'Manage Sections',
    ],
    'Manage Queue': [],
    'Create Announcements': [],
};

export const accountingModules = {
    'Manage Payments': [
        'Manage Fees',
        'Payment History',
    ],
    'Manage Queue': [],
    'Create Announcements': [],
};

export const subAdminModules = {
    'Manage Accounts': [],
    'Manage Schedule': [
        'Student Schedule',
        'Faculty Schedule',
    ],
    'Manage Program': [
        'Manage Strands',
        'Manage Subjects',
        'Manage Sections',
    ],
    'Manage Student Records': [
        'Manage Students',
        'Attendance Summary',
        'Behavior Summary',
        'Grade Summary',
        'Enrollment Summary',
        'Quarterly Ranking',
        'Yearly Ranking',
    ],
    'Manage Enrollment': [],
    'Manage Payments': [
        'Manage Fees',
        'Payment History',
    ],
    'Overall System Logs': [],
    'Create Announcements': [],
};

// Define all staff modules for the super admin
export const allStaffModules = {
    'Manage Applications': [
        'Manage Student Applications',
        'Manage Exam and Interview Schedules',
        'Manage Exam and Interview Results',
        'Manage Enrollment Period',
    ],
    'Manage Accounts': [],
    'Create Announcements': [],
    'Manage Enrollment': [],
    'Manage Schedule': [
        'Student Schedule',
        'Faculty Schedule',
    ],
    'Overall System Logs': [],
    'Manage Payments': [
        'Manage Fees',
        'Payment History',
    ],
    'Manage Program': [
        'Manage Strands',
        'Manage Subjects',
        'Manage Sections',
    ],
    'Manage Queue': [],
    'Manage Student Records': [
        'Manage Students',
        'Attendance Summary',
        'Behavior Summary',
        'Grade Summary',
        'Enrollment Summary',
        'Quarterly Ranking',
        'Yearly Ranking',
    ],
};

export const defaultRoleModules = {
    Faculty: {
        'Class Schedule': [],
        'Class Information': [],
        'Handling of Grades': [],
        'Viewing of OTE': [],
        'Teacher Documents': [],
    },
    Student: {
        'Student Handbook': [],
        'Certificate of Registration': [],
        'Flowchart': [],
        'Online Class Registration': [],
        'Viewing of Grades': [],
        'Class Schedule': [],
        'Online Teacher\'s Evaluation': [],
        'Student Ledger': [],
        'Enrollment': [],
        'Joining Queue': [],
        'Pay Bills': [],
    },
    'Admissions (Staff)': admissionsModules,
    'Registrar (Staff)': registrarModules,
    'Accounting (Staff)': accountingModules,
    'Administration (Sub-Admin)': subAdminModules,
    'IT (Super Admin)': allStaffModules,
};


