import { z } from 'zod';

export const createAccountSchema = z.object({
  userID: z.string().optional(),
  firstName: z.string().min(1, 'First name is required').max(50),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required').max(50),
  mobile: z.string()
    .min(10, 'Mobile number must be 10 digits')
    .refine((val) => /^9\d{9}$/.test(val.replace(/\D/g, '')), {
      message: 'Please enter a valid Philippine mobile number (starts with 9)',
    }),
  email: z.string().email('Invalid email address'),
  role: z.enum([
    'Student',
    'Faculty',
    'Admissions (Staff)',
    'Registrar (Staff)',
    'Accounting (Staff)',
    'Administration (Sub-Admin)',
    'IT (Super Admin)'
  ]),
  status: z.enum(['Active', 'Inactive', 'Pending Verification']),
  hasCustomAccess: z.boolean().default(false),
  customModules: z.array(z.string()).default([]),
});

export const defaultRoleModules = {
  'Faculty': {
    'Class Schedule': [],
    'Class Information': [],
    'Handling of Grades': [],
    'Viewing of OTE': [],
    'Teacher Documents': [],
  },
  'Student': {
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
  'Admissions (Staff)': {
    'Manage Applications': [
      'Manage Student Applications',
      'Manage Exam and Interview Schedules',
      'Manage Exam and Interview Results',
      'Manage Enrollment Period',
    ],
    'Manage Queue': [],
    'Create Announcements': [],
  },
  'Registrar (Staff)': {
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
  },
  'Accounting (Staff)': {
    'Manage Payments': [
      'Manage Fees',
      'Payment History',
    ],
    'Manage Queue': [],
    'Create Announcements': [],
  },
  'Administration (Sub-Admin)': {
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
  },
  'IT (Super Admin)': {
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
  },
};
