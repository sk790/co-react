import React from 'react';

export interface UserInfo {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
}

export interface TeacherProfile {
  id: string;
  specialization?: string;
  user?: UserInfo;
}

export interface StudentProfile {
  id: string;
  enrollmentNo?: string;
  user?: UserInfo;
}

export interface EnrollmentItem {
  id: string;
  studentId?: string;
  student?: StudentProfile;
  createdAt?: string;
}

export interface ParentClass {
  id: string;
  title: string;
  description?: string;
}

export interface SectionDetailData {
  id: string;
  title: string;
  capacity?: number;
  roomNumber?: string;
  classId: string;
  teacherId?: string;
  schoolId?: string;
  class?: ParentClass;
  teacher?: TeacherProfile;
  enrollments?: EnrollmentItem[];
  createdAt?: string;
}

export interface PeriodItem {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  subject: string;
  instructorId: string;
  sectionId: string;
  schoolId?: string;
  sessionId?: string;
  instructor?: {
    user?: {
      name?: string;
    };
  };
}

export interface SectionDetailProps {
  section: SectionDetailData | null;
  periods?: PeriodItem[];
  loading?: boolean;
  timetableLoading?: boolean;
  isRefreshing?: boolean;
  onRefresh?: () => void;

  // Custom Navigation Links
  backLink?: string;
  backLinkLabel?: string;
  getClassDetailLink?: (classId: string) => string;
  getStudentDetailLink?: (studentId: string) => string;
  getTeacherDetailLink?: (teacherId: string) => string;

  // Role & Header Customizations
  role?: 'ADMIN' | 'TEACHER' | 'STUDENT';
  headerActions?: React.ReactNode;

  // Admin Callbacks
  onEditSection?: () => void;
  onDeleteSection?: () => void;
  onAddPeriod?: () => void;
  onEditPeriod?: (period: PeriodItem) => void;
  onDeletePeriod?: (periodId: string) => void;

  // Teacher Links
  attendanceLink?: string;
}
