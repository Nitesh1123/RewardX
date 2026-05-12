export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
};

export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  ON_LEAVE: 'on-leave',
  WORK_FROM_HOME: 'work-from-home',
};

export const REWARD_CATEGORIES = {
  PERFORMANCE: 'performance',
  ATTENDANCE: 'attendance',
  INNOVATION: 'innovation',
  TEAMWORK: 'teamwork',
  GENERAL: 'general',
};

export const FEEDBACK_CATEGORIES = {
  COLLABORATION: 'collaboration',
  COMMUNICATION: 'communication',
  LEADERSHIP: 'leadership',
  TECHNICAL: 'technical',
  GENERAL: 'general',
};

export const PERFORMANCE_CATEGORIES = {
  QUARTERLY: 'quarterly',
  ANNUAL: 'annual',
  PROJECT: 'project',
  GENERAL: 'general',
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
  },
  EMPLOYEES: '/employees',
  REWARDS: '/rewards',
  ATTENDANCE: '/attendance',
  PERFORMANCE: '/performance',
  FEEDBACK: '/feedback',
  BADGES: '/badges',
};
