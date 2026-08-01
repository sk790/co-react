import React from 'react';

export interface TeacherUser {
  name?: string;
  email?: string;
  phone?: string;
}

export interface TeacherProfile {
  id: string;
  user?: TeacherUser;
}

export interface StudentUser {
  name?: string;
  email?: string;
  phone?: string;
}

export interface StudentItem {
  id: string;
  enrollmentNo?: string;
  user?: StudentUser;
}

export interface EnrollmentItem {
  id: string;
  studentId?: string;
  student?: StudentItem;
  createdAt?: string;
}

export interface SectionItem {
  id: string;
  title: string;
  capacity?: number;
  roomNumber?: string;
  teacherId?: string;
  teacher?: TeacherProfile;
  enrollments?: EnrollmentItem[];
  createdAt?: string;
}

export interface ClassDetailData {
  id: string;
  title: string;
  description?: string;
  classTeacherId?: string;
  classTeacher?: TeacherProfile;
  sections?: SectionItem[];
  createdAt?: string;
}

export interface ClassDetailProps {
  classData: ClassDetailData | null;
  loading?: boolean;
  isRefreshing?: boolean;
  onRefresh?: () => void;

  // Custom Navigation Links
  backLink?: string;
  backLinkLabel?: string;
  getSectionDetailLink?: (sec: SectionItem) => string;
  getStudentDetailLink?: (studentId: string) => string;
  getTeacherDetailLink?: (teacherId: string) => string;

  // Role & Header Customizations
  role?: 'ADMIN' | 'TEACHER' | 'STUDENT';
  headerActions?: React.ReactNode;

  // Admin Callbacks
  onAddSection?: () => void;
  onEditClass?: () => void;
  onDeleteClass?: () => void;
  onEditSection?: (sec: SectionItem) => void;
  onDeleteSection?: (sec: SectionItem) => void;

  // Teacher Callbacks / Links
  attendanceLink?: string;
  timetableLink?: string;
}
